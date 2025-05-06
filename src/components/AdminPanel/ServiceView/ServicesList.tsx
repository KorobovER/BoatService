import React, { useState } from 'react';
import { Box, Text, Image, Flex, Button, Menu, MenuButton, MenuItem, MenuList, useToast } from '@chakra-ui/react';
import NoService from './NoService';
import { ReservationExtenstion } from '../TableReservations';
import { ServiceOnReservationPublic, ServiceRequestStatus } from '../../../client/models';
import { getServiceIcon } from './Services';
import { ReservationsService } from '../../../client/services';
import { useQueryClient } from '@tanstack/react-query';

interface ServicesListProps {
    reservation: ReservationExtenstion;
    userName: string;
    rowId: string;
    handleAddMoreServices: () => void;
}

type ServiceStatus = 'pending' | 'en-route' | 'completed' | 'other';

interface ServiceCategory {
    title: string;
    status: ServiceStatus;
    filter: (service: ServiceOnReservationPublic) => boolean;
    renderItem: (service: ServiceOnReservationPublic, index: number) => React.ReactNode;
}

const ServicesList: React.FC<ServicesListProps> = ({
    reservation,
    userName,
    rowId,
    handleAddMoreServices
}) => {
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const [localReservation, setLocalReservation] = useState<ReservationExtenstion>(reservation);
    const toast = useToast();
    const queryClient = useQueryClient();

    // If no services, render the NoService component
    if (!localReservation.service_requests || localReservation.service_requests.length === 0) {
        return (
            <Flex flexDirection="column" w="100%">
                <NoService rowId={rowId} reservation={localReservation} userName={userName} />
            </Flex>
        );
    }

    // Get background color for service icon based on status
    const getServiceIconBgColor = (status: ServiceRequestStatus) => {
        switch (status) {
            case 'pending':
                return 'system.errorRedNew';
            case 'en-route':
                return 'brand.primaryOrange';
            case 'completed':
                return 'system.successGreen';
            default:
                return 'system.errorRedNew'; // Default fallback
        }
    };

    // Handles actions from the dropdown menu
    const handleServiceAction = async (action: string, serviceId: string, serviceStatus: string) => {
        console.log(`Action: ${action} for service: ${serviceId} with status: ${serviceStatus}`);

        // Skip if already loading
        if (isLoading[serviceId]) return;

        // Set loading state for this service
        setIsLoading(prev => ({ ...prev, [serviceId]: true }));

        try {
            let newStatus: ServiceRequestStatus | null = null;

            // Determine the new status based on action
            switch (action) {
                case 'mark-in-progress':
                    newStatus = 'en-route';
                    break;
                case 'mark-pending':
                    newStatus = 'pending';
                    break;
                case 'cancel-service':
                    newStatus = 'cancelled';
                    break;
                // For other actions like 'input-quantity' or 'edit-service', 
                // we'd need different API calls or UI components
            }

            // If we have a new status, update it through the API
            if (newStatus) {
                // Update local state immediately for optimistic UI
                const updatedReservation = {...localReservation};
                updatedReservation.service_requests = localReservation.service_requests.map(service => {
                    if (service.service_reservation_id === serviceId) {
                        return {
                            ...service,
                            status: newStatus
                        };
                    }
                    return service;
                });
                
                // Update UI with optimistic change
                setLocalReservation(updatedReservation);
                
                // Call API in the background
                await ReservationsService.updateReservationServiceStatus({
                    reservationId: localReservation.reservation_id,
                    serviceId: serviceId,
                    statusIn: newStatus
                });
                
                // Show success message
                toast({
                    title: "Status updated",
                    description: `Service has been marked as ${newStatus}`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                
                // Invalidate queries to refresh data
                queryClient.invalidateQueries({ queryKey: ['reservation', localReservation.reservation_id] });
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

    // Effect to update local reservation when the prop changes
    React.useEffect(() => {
        setLocalReservation(reservation);
    }, [reservation]);

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
                        color: 'basic.grey900'
                    }
                };
            case 'en-route':
                return {
                    text: isLoading[service.service_reservation_id] ? 'Updating...' : 'Input Quantity',
                    action: 'input-quantity',
                    styles: {
                        border: '1px solid',
                        borderColor: 'brand.primaryOrange',
                        bg: 'transparent',
                        color: 'basic.grey900'
                    }
                };
            case 'completed':
                return {
                    text: `$${totalPrice.toFixed(2)}`,
                    action: '',
                    styles: {
                        border: 'none',
                        borderColor: 'transparent',
                        bg: 'system.successGreen',
                        color: 'white'
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
            if (service.status === 'en-route') {
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
                            <Text fontSize="14px" fontWeight="700" color='basic.grey700'>
                                {subService.quantity}x {subService.name}
                            </Text>
                            <Text fontSize="14px" fontWeight="400" color='basic.grey900'>${subService.price} / {subService.unit}</Text>
                        </Flex>
                        <Button
                            w='149px'
                            h='32px'
                            px='md'
                            py='10px'
                            variant="unstyled"
                            borderRadius='var(--chakra-space-full)'
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

    // Define categories and their properties
    const serviceCategories: ServiceCategory[] = [
        {
            title: 'Pending services',
            status: 'pending',
            filter: (service) => service.status === 'pending',
            renderItem: renderServiceItem
        },
        {
            title: 'In progress services',
            status: 'en-route',
            filter: (service) => service.status === 'en-route',
            renderItem: renderServiceItem
        },
        {
            title: 'Completed services',
            status: 'completed',
            filter: (service) => service.status === 'completed',
            renderItem: renderServiceItem
        },
        {
            title: 'Other services',
            status: 'other',
            filter: (service) =>
                service.status !== 'pending' &&
                service.status !== 'en-route' &&
                service.status !== 'completed',
            renderItem: renderServiceItem
        }
    ];

    return (
        <Flex flexDirection="column" w="100%" gap="2xl">
            {serviceCategories.map((category, idx) => {
                // Filter services that match this category
                const categoryServices = localReservation.service_requests.filter(category.filter);

                // Only render this category if it has services
                if (categoryServices.length === 0) return null;

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
                                >
                                    <Text borderBottom="1px solid" borderColor="brand.primaryOrange">Add service</Text>
                                    <Text textAlign="center" fontSize="17px" fontWeight="400" color="brand.primaryOrange">+</Text>
                                </Box>
                            )}
                        </Flex>
                        <Flex flexDirection="column" gap="sm">
                            {categoryServices.map((service, serviceIdx) =>
                                category.renderItem(service, serviceIdx)
                            )}
                        </Flex>
                    </Flex>
                );
            })}
        </Flex>
    );
};

export default ServicesList; 