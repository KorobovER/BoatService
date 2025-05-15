import React, { useState, useEffect } from 'react';
import { Box, Text, Image, Flex, Button, Menu, MenuButton, MenuItem, MenuList, useToast } from '@chakra-ui/react';
import NoService from './NoService';
import { ReservationExtenstion } from '../ReservationExtenstion';
import { ServiceOnReservationPublic, ServiceRequestStatus, PaymentReceiptPublic } from '../../client/models';
import { getServiceIcon } from './Services';
import { ReservationsService } from '../../client/services';
import { useQueryClient } from '@tanstack/react-query';
import QuantityInputModal from './QuantityInputModal';
import ServiceCancel from './ServiceCancel';
import ServiceEdit from './ServiceEdit';
import CompletedServiceDetails from './CompletedService';

interface ServicesListProps {
    reservation: ReservationExtenstion;
    userName: string;
    rowId: string;
    handleAddMoreServices: () => void;
    onServiceStatusChange?: (updatedReservation: ReservationExtenstion) => void;
}

type RenderableItem = ServiceOnReservationPublic | PaymentReceiptPublic;

interface BaseCategory<T extends RenderableItem> {
    title: string;
    renderItem: (item: T, index: number) => React.ReactNode;
}

interface ServiceCategoryType extends BaseCategory<ServiceOnReservationPublic> {
    status: ServiceRequestStatus;
    filter: (service: ServiceOnReservationPublic) => boolean;
}

interface PaymentCategoryType extends BaseCategory<PaymentReceiptPublic> {
    status: 'paid';
    filter: (paymentReceipt: PaymentReceiptPublic) => boolean;
}

type CategoryType = ServiceCategoryType | PaymentCategoryType;

const ServicesList: React.FC<ServicesListProps> = ({
    reservation,
    userName,
    rowId,
    handleAddMoreServices,
    onServiceStatusChange
}) => {
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const [localReservation, setLocalReservation] = useState<ReservationExtenstion>(reservation);
    const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
    const [currentServiceId, setCurrentServiceId] = useState<string | null>(null);
    const [currentService, setCurrentService] = useState<ServiceOnReservationPublic | null>(null);
    const [isSubmittingQuantity, setIsSubmittingQuantity] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelService, setCancelService] = useState<ServiceOnReservationPublic | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editService, setEditService] = useState<ServiceOnReservationPublic | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedPaidService, setSelectedPaidService] = useState<ServiceOnReservationPublic | null>(null);
    const toast = useToast();
    const queryClient = useQueryClient();

    // Обновляем localReservation при изменении пропса reservation
    useEffect(() => {
        setLocalReservation(reservation);
    }, [reservation]);

    // Get background color for service icon based on status
    const getServiceIconBgColor = (status: ServiceRequestStatus) => {
        switch (status) {
            case 'pending':
                return 'system.errorRedNew';
            case 'en_route':
                return 'brand.primaryOrange';
            case 'completed':
                return 'system.successGreen';
            default:
                return 'system.errorRedNew'; // Default fallback
        }
    };

    // Handle input quantity button click
    const handleInputQuantity = (serviceId: string) => {
        // Find the service by id
        const service = localReservation.service_requests.find(
            service => service.service_reservation_id === serviceId
        );

        if (service) {
            setCurrentServiceId(serviceId);
            setCurrentService(service);
            setIsQuantityModalOpen(true);
        }
    };

    // Handle quantity modal submission
    const handleQuantitySubmit = async (serviceId: string, newQuantity: number) => {
        if (!serviceId) return;

        setIsSubmittingQuantity(true);

        try {
            // Find the service
            const service = localReservation.service_requests.find(
                service => service.service_reservation_id === serviceId
            );

            if (!service || !service.services || service.services.length === 0) {
                throw new Error("Service not found");
            }

            // Update local state for optimistic UI
            const updatedReservation = { ...localReservation };
            updatedReservation.service_requests = localReservation.service_requests.map(service => {
                if (service.service_reservation_id === serviceId) {
                    return {
                        ...service,
                        status: 'completed',
                        services: service.services.map(subService => ({
                            ...subService,
                            quantity: newQuantity
                        }))
                    };
                }
                return service;
            });

            // Update UI with optimistic change
            setLocalReservation(updatedReservation);

            const initialQuantity = service.services[0].quantity;

            // If quantity changed, we need to update both quantity and status
            if (newQuantity !== initialQuantity) {
                // Use updateReservationService to update quantity and status
                console.log(`Updating service with new quantity: ${newQuantity} (was ${initialQuantity})`);

                // Create updated service object that matches ServiceOnReservationUpdate type
                const updatedService = {
                    requested_date: service.requested_date,
                    special_instructions: service.special_instructions,
                    services: service.services.map(subService => ({
                        title: subService.title,
                        name: subService.name,
                        price: subService.price,
                        unit: subService.unit,
                        quantity: subService.name === service.services[0].name ? newQuantity : subService.quantity
                    }))
                };

                // Update local state for display
                // First update status with status API (since status isn't part of the update model)
                await ReservationsService.updateReservationServiceStatus({
                    reservationId: localReservation.reservation_id,
                    serviceId: serviceId,
                    statusIn: 'completed'
                });

                // Then update the quantity with the service update API
                try {
                    await ReservationsService.updateReservationService({
                        reservationId: localReservation.reservation_id,
                        serviceId: serviceId,
                        requestBody: updatedService
                    });

                    console.log('Service quantity updated successfully');
                } catch (error) {
                    console.error('Error updating service quantity:', error);
                    throw error; // Re-throw to trigger the catch block
                }
            } else {
                // If quantity didn't change, just update the status
                console.log('Quantity unchanged, just updating status to completed');
                await ReservationsService.updateReservationServiceStatus({
                    reservationId: localReservation.reservation_id,
                    serviceId: serviceId,
                    statusIn: 'completed'
                });
            }

            // Show success message
            const serviceName = service.services[0].name;
            const unit = service.services[0].unit;

            toast({
                title: "Service completed",
                description: `${serviceName} has been marked as completed with ${newQuantity} ${unit}`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            // Notify parent component about the change
            if (onServiceStatusChange) {
                onServiceStatusChange(updatedReservation);
            }

            // Close the modal
            handleQuantityModalClose();
        } catch (error) {
            console.error('Error updating service:', error);

            // Revert to original state on error
            setLocalReservation(reservation);

            toast({
                title: "Update failed",
                description: "There was an error updating the service",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSubmittingQuantity(false);
        }
    };

    // Handle quantity modal close
    const handleQuantityModalClose = () => {
        setIsQuantityModalOpen(false);
        setCurrentServiceId(null);
        setCurrentService(null);
    };

    // Handles actions from the dropdown menu
    const handleServiceAction = async (action: string, serviceId: string, serviceStatus: string) => {
        console.log(`Action: ${action} for service: ${serviceId} with status: ${serviceStatus}`);

        // Skip if already loading
        if (isLoading[serviceId]) return;

        // Handle input quantity separately
        if (action === 'input-quantity') {
            handleInputQuantity(serviceId);
            return;
        }

        // Set loading state for this service
        setIsLoading(prev => ({ ...prev, [serviceId]: true }));

        try {
            let newStatus: ServiceRequestStatus | null = null;

            // Determine the new status based on action
            switch (action) {
                case 'mark-in-progress':
                    newStatus = 'en_route';
                    break;
                case 'mark-pending':
                    newStatus = 'pending';
                    break;
                case 'cancel-service':
                    const service = localReservation.service_requests.find(s => s.service_reservation_id === serviceId);
                    if (service) {
                        setCancelService(service);
                        setIsCancelModalOpen(true);
                    }
                    return;
                case 'edit-service':
                    const serviceEdit = localReservation.service_requests.find(s => s.service_reservation_id === serviceId);
                    if (serviceEdit) {
                        setEditService(serviceEdit);
                        setIsEditModalOpen(true);
                    }
                    return;
                // For other actions like 'edit-service',
                // we'd need different API calls or UI components
            }

            // If we have a new status, update it through the API
            if (newStatus) {
                // Update local state immediately for optimistic UI
                const updatedReservation = { ...localReservation };
                updatedReservation.service_requests = localReservation.service_requests.map(service => {
                    if (service.service_reservation_id === serviceId) {
                        return {
                            ...service,
                            status: newStatus || 'denied'
                        };
                    }
                    return service;
                });

                // Update UI
                setLocalReservation(updatedReservation);

                // Make API call
                await ReservationsService.updateReservationServiceStatus({
                    reservationId: localReservation.reservation_id,
                    serviceId: serviceId,
                    statusIn: newStatus
                });

                // Show success message
                toast({
                    title: "Status updated",
                    description: `Service status has been changed to ${newStatus}`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });

                // Notify parent component about the change
                if (onServiceStatusChange) {
                    onServiceStatusChange(updatedReservation);
                }
            }
        } catch (error) {
            console.error('Error updating service status:', error);

            // Revert to original state on error
            setLocalReservation(reservation);

            toast({
                title: "Update failed",
                description: "There was an error updating the service status",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            // Clear loading state
            setIsLoading(prev => ({ ...prev, [serviceId]: false }));
        }
    };

    const handleConfirmCancel = async () => {
        if (!cancelService) return;
        setCancelLoading(true);
        try {
            // Update local state immediately for optimistic UI
            const updatedReservation = { ...localReservation };
            updatedReservation.service_requests = localReservation.service_requests.map(service => {
                if (service.service_reservation_id === cancelService.service_reservation_id) {
                    return {
                        ...service,
                        status: 'cancelled'
                    };
                }
                return service;
            });
            setLocalReservation(updatedReservation);
            await ReservationsService.updateReservationServiceStatus({
                reservationId: localReservation.reservation_id,
                serviceId: cancelService.service_reservation_id,
                statusIn: 'cancelled'
            });
            toast({
                title: 'Service cancelled',
                description: 'Service has been cancelled.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            if (onServiceStatusChange) {
                onServiceStatusChange(updatedReservation);
            }
        } catch (error) {
            setLocalReservation(reservation);
            toast({
                title: 'Update failed',
                description: 'There was an error cancelling the service',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setCancelLoading(false);
            setIsCancelModalOpen(false);
            setCancelService(null);
        }
    };

    const handleEditUpdate = async (quantity: number) => {
        if (!editService) return;
        setEditLoading(true);
        try {
            // Обновляем локальный стейт для UI
            const updatedReservation = { ...localReservation };
            updatedReservation.service_requests = localReservation.service_requests.map(service => {
                if (service.service_reservation_id === editService.service_reservation_id) {
                    return {
                        ...service,
                        services: service.services.map((subService, idx) =>
                            idx === 0 ? { ...subService, quantity } : subService
                        )
                    };
                }
                return service;
            });
            setLocalReservation(updatedReservation);
            // Обновляем на сервере
            await ReservationsService.updateReservationService({
                reservationId: localReservation.reservation_id,
                serviceId: editService.service_reservation_id,
                requestBody: {
                    requested_date: editService.requested_date,
                    special_instructions: editService.special_instructions,
                    services: editService.services.map((subService, idx) =>
                        idx === 0 ? { ...subService, quantity } : subService
                    )
                }
            });
            toast({
                title: 'Service updated',
                description: 'Service quantity has been updated.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            if (onServiceStatusChange) {
                onServiceStatusChange(updatedReservation);
            }
        } catch (error) {
            setLocalReservation(reservation);
            toast({
                title: 'Update failed',
                description: 'There was an error updating the service quantity',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setEditLoading(false);
            setIsEditModalOpen(false);
            setEditService(null);
        }
    };

    // If no services, render the NoService component
    const hasActiveServices = localReservation.service_requests?.some(service =>
        service.status === 'pending' ||
        service.status === 'en_route' ||
        service.status === 'completed' ||
        service.status === 'paid'
    );

    if (!hasActiveServices) {
        return (
            <Flex flexDirection="column" w="100%">
                <NoService
                    rowId={rowId}
                    reservation={localReservation}
                    userName={userName}
                    onServicesAdded={() => {
                        // Принудительно запрашиваем актуальные данные перед обновлением UI
                        console.log('ServicesList: Services added callback triggered');
                        queryClient.invalidateQueries();

                        // Добавляем небольшую задержку для гарантии получения обновленных данных
                        setTimeout(() => {
                            if (localReservation?.reservation_id) {
                                console.log('ServicesList: Refreshing reservation data after services added');
                                ReservationsService.readReservation({ id: localReservation.reservation_id })
                                    .then(updatedReservation => {
                                        console.log('ServicesList: Got updated reservation data:',
                                            updatedReservation.service_requests?.length || 0, 'services');
                                        setLocalReservation(updatedReservation as ReservationExtenstion);
                                    })
                                    .catch(error => {
                                        console.error('Error refreshing reservation after services added:', error);
                                    });
                            }
                        }, 1000); // Даем API время на обработку и обновление данных
                    }}
                />
            </Flex>
        );
    }

    // Calculate the total price for a service
    const calculateTotalPrice = (service: ServiceOnReservationPublic) => {
        return service.services.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    };

    // Get button configuration based on service status
    const getActionButtonConfig = (service: ServiceOnReservationPublic) => {
        const totalPrice = calculateTotalPrice(service);

        switch (service.status) {
            case 'pending':
                return {
                    text: isLoading[service.service_reservation_id] ? 'Updating...' : 'Mark in progress',
                    action: 'mark-in-progress',
                    styles: {
                        border: '1px solid',
                        borderColor: 'system.errorRedNew',
                        bg: 'transparent',
                        color: 'basic.grey900',
                        borderRadius: 'full',
                        w: '149px',
                        h: '32px',
                    }
                };
            case 'en_route':
                return {
                    text: isLoading[service.service_reservation_id] ? 'Updating...' : 'Input Quantity',
                    action: 'input-quantity',
                    styles: {
                        border: '1px solid',
                        borderColor: 'brand.primaryOrange',
                        bg: 'transparent',
                        color: 'basic.grey900',
                        borderRadius: 'full',
                        w: '149px',
                        h: '32px',
                    }
                };
            case 'completed':
                return {
                    text: `$${totalPrice.toFixed(2)} Total`,
                    action: '',
                    styles: {
                        border: 'none',
                        borderColor: 'transparent',
                        bg: 'bg.success',
                        color: 'system.successGreen',
                        h: '46px',
                        px: 'sm',
                        py: 'xs',
                        borderRadius: '8px',
                        w: 'fit-content',
                    }
                };
            default:
                return {
                    text: isLoading[service.service_reservation_id] ? 'Updating...' : 'Mark in progress',
                    action: 'mark-in-progress',
                    styles: {
                        border: '1px solid',
                        borderColor: 'system.errorRedNew',
                        bg: 'transparent',
                        color: 'basic.grey900'
                    }
                };
        }
    };

    // Common service item renderer for all statuses
    const renderServiceItem = (service: ServiceOnReservationPublic, index: number) => {
        const buttonConfig = getActionButtonConfig(service);
        const bgColor = getServiceIconBgColor(service.status);

        // Generate menu items based on service status
        const renderMenuItems = () => {
            if (service.status === 'en_route') {
                return (
                    <>
                        <MenuItem onClick={() => handleServiceAction('mark-pending', service.service_reservation_id, service.status)}>
                            Mark as pending
                        </MenuItem>
                        <MenuItem onClick={() => handleServiceAction('edit-service', service.service_reservation_id, service.status)}>
                            Edit service
                        </MenuItem>
                        <MenuItem onClick={() => handleServiceAction('cancel-service', service.service_reservation_id, service.status)}>
                            Cancel service
                        </MenuItem>
                    </>
                );
            } else if (service.status === 'completed') {
                return (
                    <>
                        <MenuItem onClick={() => handleServiceAction('mark-pending', service.service_reservation_id, service.status)}>
                            Mark as pending
                        </MenuItem>
                        <MenuItem onClick={() => handleServiceAction('mark-in-progress', service.service_reservation_id, service.status)}>
                            Mark as in progress
                        </MenuItem>
                    </>
                );
            } else if (service.status === 'pending') {
                return (
                    <>
                        <MenuItem onClick={() => handleServiceAction('mark-in-progress', service.service_reservation_id, service.status)}>
                            Mark as in progress
                        </MenuItem>
                        <MenuItem onClick={() => handleServiceAction('input-quantity', service.service_reservation_id, service.status)}>
                            Input quantity
                        </MenuItem>
                        <MenuItem onClick={() => handleServiceAction('edit-service', service.service_reservation_id, service.status)}>
                            Edit service
                        </MenuItem>
                        <MenuItem onClick={() => handleServiceAction('cancel-service', service.service_reservation_id, service.status)}>
                            Cancel service
                        </MenuItem>
                    </>
                );
            } else {
                // Default menu items for 'other' status
                return (
                    <>
                        <MenuItem onClick={() => handleServiceAction('mark-pending', service.service_reservation_id, service.status)}>
                            Mark as pending
                        </MenuItem>
                        <MenuItem onClick={() => handleServiceAction('mark-in-progress', service.service_reservation_id, service.status)}>
                            Mark as in progress
                        </MenuItem>
                        <MenuItem onClick={() => handleServiceAction('edit-service', service.service_reservation_id, service.status)}>
                            Edit service
                        </MenuItem>
                    </>
                );
            }
        };

        return (
            <Flex
                key={index}
                w="100%"
                flexDirection="column"
                gap="xs"
            >
                {service.services.map((subService, i) => (
                    <Flex gap="8px" key={i} alignItems="center">
                        <Flex borderRadius='8px' bg={bgColor} alignItems="center" justifyContent="center" w="46px" h="46px">
                            <Image w='24px' h='auto' src={getServiceIcon(subService.name)} alt={subService.name} filter="brightness(0) invert(1)" />
                        </Flex>
                        <Flex flex="1" justify="space-between" flexDirection="column">
                            <Text fontSize="14px" fontWeight="700" color='basic.grey700' noOfLines={1} textOverflow="ellipsis">
                                {subService.quantity}x {subService.name}
                            </Text>
                            <Text fontSize="14px" fontWeight="400" color='basic.grey900' noOfLines={1} textOverflow="ellipsis">${subService.price.toFixed(2)} / {subService.unit}</Text>
                        </Flex>
                        <Button
                            w={buttonConfig.styles.w}
                            h={buttonConfig.styles.h}
                            px='md'
                            py='10px'
                            variant="unstyled"
                            borderRadius={buttonConfig.styles.borderRadius}
                            border={buttonConfig.styles.border}
                            borderColor={buttonConfig.styles.borderColor}
                            bg={buttonConfig.styles.bg}
                            fontSize="14px"
                            fontWeight="400"
                            color={buttonConfig.styles.color}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            isDisabled={isLoading[service.service_reservation_id]}
                            onClick={() => buttonConfig.action ? handleServiceAction(buttonConfig.action, service.service_reservation_id, service.status) : null}
                            _hover={buttonConfig.action ? { opacity: 0.8 } : { cursor: 'default' }}
                        >
                            {buttonConfig.text}
                        </Button>
                        <Menu placement="bottom-end">
                            <MenuButton
                                as={Button}
                                w='32px'
                                h='32px'
                                border='1px solid'
                                borderColor='basic.grey200'
                                borderRadius='100%'
                                variant="unstyled"
                                fontSize="14px"
                                fontWeight="400"
                                color='basic.grey900'
                                p="0"
                                minW="32px"
                                maxW="32px"
                                isDisabled={isLoading[service.service_reservation_id]}
                            >
                                <Flex justifyContent="center" alignItems="center" w="100%" h="100%">
                                    <svg width="12" height="4" viewBox="0 0 12 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="1.5" cy="2" r="1.5" fill="#4A5568" />
                                        <circle cx="6" cy="2" r="1.5" fill="#4A5568" />
                                        <circle cx="10.5" cy="2" r="1.5" fill="#4A5568" />
                                    </svg>
                                </Flex>
                            </MenuButton>
                            <MenuList minWidth="180px" zIndex={1001}>
                                {renderMenuItems()}
                            </MenuList>
                        </Menu>
                    </Flex>
                ))}
            </Flex>
        );
    };

    // Format date as "Mar 04, 25 | 17:08"
    const formatRequestedDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;

            const month = date.toLocaleString('en-US', { month: 'short' });
            const day = date.getDate().toString().padStart(2, '0');
            const year = date.getFullYear().toString().slice(-2);
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');

            return `${month} ${day}, ${year} | ${hours}:${minutes}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    };

    // Handle opening service details
    const handleOpenServiceDetails = (service: ServiceOnReservationPublic) => {
        setSelectedPaidService(service);
        setIsDetailsModalOpen(true);
    };

    // Define categories and their properties
    const serviceCategories: CategoryType[] = [
        {
            title: 'Pending services',
            status: 'pending',
            filter: (service: ServiceOnReservationPublic) => service.status === 'pending',
            renderItem: renderServiceItem
        },
        {
            title: 'In progress services',
            status: 'en_route',
            filter: (service: ServiceOnReservationPublic) => service.status === 'en_route',
            renderItem: renderServiceItem
        },
        {
            title: 'Completed services',
            status: 'completed',
            filter: (service: ServiceOnReservationPublic) => service.status === 'completed',
            renderItem: renderServiceItem
        },
        {
            title: 'Paid services',
            status: 'paid',
            filter: () => true,
            renderItem: (paymentReceipt: PaymentReceiptPublic, index: number) => {
                // Calculate total for this payment receipt
                const totalPrice = paymentReceipt.subtotal + paymentReceipt.service_fee + paymentReceipt.taxes;

                return (
                    <Flex
                        key={index}
                        w="100%"
                        flexDirection="column"
                        gap="xs"
                    >
                        {paymentReceipt.service_requests.map((service, i) => (
                            <Flex gap="8px" key={i} alignItems="center">
                                <Flex bg="basic.grey200" borderRadius='8px' alignItems="center" justifyContent="center" w="46px" h="46px">
                                    <Image w='24px' h='auto' src={getServiceIcon(service.services[0].name)} filter="brightness(0) invert(1)" />
                                </Flex>
                                <Flex flex="1" justify="space-between" flexDirection="column">
                                    <Text fontSize="14px" fontWeight="700" color='basic.grey700' noOfLines={1} textOverflow="ellipsis">
                                        {paymentReceipt.payment_receipt_id}
                                    </Text>
                                    <Text fontSize="14px" fontWeight="400" color='basic.grey900' noOfLines={1} textOverflow="ellipsis">{formatRequestedDate(service.requested_date)}</Text>
                                </Flex>
                                <Button
                                    variant="unstyled"
                                    display="flex"
                                    border='none'
                                    borderColor='transparent'
                                    bg='basic.grey100'
                                    h='46px'
                                    px='sm'
                                    py='xs'
                                    borderRadius='8px'
                                    w='fit-content'
                                    alignItems="center"
                                    justifyContent="center"
                                    onClick={() => handleOpenServiceDetails(service)}
                                    cursor="pointer"
                                    _hover={{ bg: 'basic.grey200' }}
                                >
                                    <Text color='basic.grey600' fontSize="14px" fontWeight="400">${totalPrice.toFixed(2)} Total</Text>
                                </Button>
                            </Flex>
                        ))}
                    </Flex>
                );
            }
        }
    ];

    // Вспомогательная функция для создания сервисного объекта
    const createServiceProps = (serviceData: ServiceOnReservationPublic) => ({
        title: serviceData.services[0]?.title || '',
        name: serviceData.services[0]?.name || '',
        price: serviceData.services[0]?.price || 0,
        unit: serviceData.services[0]?.unit || '',
        iconUrl: getServiceIcon(serviceData.services[0]?.name || ''),
        quantity: serviceData.services[0]?.quantity || 1
    });

    // Функция для получения данных для QuantityInputModal
    const getQuantityModalProps = () => {
        if (!currentService || !currentService.services || currentService.services.length === 0) {
            return {
                serviceName: 'Service',
                serviceIcon: '/assets/icons/fuel_service.svg',
                initialQuantity: 1,
                unitOfMeasurement: 'gallons'
            };
        }

        const service = currentService.services[0];
        const iconPath = getServiceIcon(service.name);

        return {
            serviceName: service.name,
            serviceIcon: iconPath,
            initialQuantity: service.quantity,
            unitOfMeasurement: service.unit
        };
    };

    return (
        <>
            <Flex flexDirection="column" w="100%" gap="2xl">
                {serviceCategories.map((category, idx) => {
                    // Filter items that match this category
                    let categoryItems: RenderableItem[] = [];
                    if (category.status === 'paid') {
                        categoryItems = localReservation.payment_receipts || [];
                    } else {
                        categoryItems = localReservation.service_requests.filter(
                            (service) => service.status === category.status
                        );
                    }

                    // Always render Pending services category
                    if (category.status !== 'pending' && categoryItems.length === 0) return null;

                    return (
                        <Flex gap="lg" flexDirection="column" key={idx}>
                            <Flex justifyContent="space-between" alignItems="center">
                                <Text
                                    fontSize="16px"
                                    fontWeight="400"
                                    color="gray.700"
                                >
                                    {category.title}
                                </Text>
                                {category.status === 'pending' && (
                                    <Box
                                        fontSize="14px"
                                        fontWeight="500"
                                        color="brand.primaryOrange"
                                        onClick={handleAddMoreServices}
                                        borderRadius="0"
                                        display="flex"
                                        alignItems="center"
                                        gap="4px"
                                        p="0"
                                        m="0"
                                        cursor="pointer"
                                    >
                                        <Text borderBottom="1px solid" borderColor="brand.primaryOrange">Add service</Text>
                                        <Text textAlign="center" fontSize="17px" fontWeight="400" color="brand.primaryOrange">+</Text>
                                    </Box>
                                )}
                            </Flex>
                            {categoryItems.length > 0 && (
                                <Flex flexDirection="column" gap="sm">
                                    {categoryItems.map((item, itemIdx) => {
                                        // Type assertion to bypass type checking
                                        return category.renderItem(item as any, itemIdx);
                                    })}
                                </Flex>
                            )}
                        </Flex>
                    );
                })}
            </Flex>

            {/* Quantity Input Modal */}
            <QuantityInputModal
                isOpen={isQuantityModalOpen}
                onClose={handleQuantityModalClose}
                serviceId={currentServiceId}
                {...getQuantityModalProps()}
                isSubmitting={isSubmittingQuantity}
                onSubmit={handleQuantitySubmit}
            />

            {cancelService && (
                <ServiceCancel
                    isOpen={isCancelModalOpen}
                    onClose={() => { setIsCancelModalOpen(false); setCancelService(null); }}
                    onConfirm={handleConfirmCancel}
                    service={createServiceProps(cancelService)}
                    loading={cancelLoading}
                />
            )}

            {editService && (
                <ServiceEdit
                    isOpen={isEditModalOpen}
                    onClose={() => { setIsEditModalOpen(false); setEditService(null); }}
                    onUpdate={handleEditUpdate}
                    service={createServiceProps(editService)}
                    loading={editLoading}
                />
            )}

            {/* Service Details Modal */}
            {selectedPaidService && (
                <CompletedServiceDetails
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    service={selectedPaidService}
                />
            )}
        </>
    );
};

export default ServicesList;
