import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Box, Text, Image, Flex, Button, useDisclosure} from '@chakra-ui/react';
import { getBookingStatusText, getBookingStatusTextColor, getBoatImageProps } from '../../utilsBola';
import ServiceAdd from './ServiceAdd';
import { useMarina } from '../../context/MarinaContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ReservationsService } from '../../client/services';
import ServicesList from './ServicesList';
import PaymentModal from './PaymentModal';
import RetryCharge from './RetryCharge';
import MarkUncollectible from './MarkUncollectible';
import MarkPaid from './MarkPaid';
import { ReservationExtenstion } from '../ReservationExtenstion';
import { PaymentReceiptPublic } from '../../client/models';
import useCustomToast from '../../hooks/useCustomToast'
import { SERVICE_FEE_PERCENTAGE } from '../../utilsBola';
import CustomIcon from '../Icon';

// Структура для иконок сервисов с указанием категории и имени
export interface ServiceIconInfo {
    name: string;
    category: 'services' | 'ui' | 'alerts' | 'boats' | 'logos';
}

// Иконки для разных типов услуг
export const SERVICE_ICONS: Record<string, ServiceIconInfo> = {
    TRASH: { name: 'trash_service', category: 'services' },
    LAUNCH: { name: 'launch_service', category: 'services' },
    LAUNDRY: { name: 'laundry_service', category: 'services' },
    ICE: { name: 'ice_service', category: 'services' },
    FUEL: { name: 'fuel_service', category: 'services' },
    PUMP_OUT: { name: 'pump_out_service', category: 'services' },
    WATER: { name: 'water_service', category: 'services' },
    DEFAULT: { name: 'all_services', category: 'services' }
};

// Функция для определения иконки по имени услуги
export const getServiceIconInfo = (name: string): ServiceIconInfo => {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('trash') || nameLower.includes('waste') || nameLower.includes('garbage')) {
        return SERVICE_ICONS.TRASH;
    } else if (nameLower.includes('launch') || nameLower.includes('boat')) {
        return SERVICE_ICONS.LAUNCH;
    } else if (nameLower.includes('laundry') || nameLower.includes('wash') || nameLower.includes('dry')) {
        return SERVICE_ICONS.LAUNDRY;
    } else if (nameLower.includes('ice')) {
        return SERVICE_ICONS.ICE;
    } else if (nameLower.includes('fuel') || nameLower.includes('gas') || nameLower.includes('diesel') || nameLower.includes('petrol')) {
        return SERVICE_ICONS.FUEL;
    } else if (nameLower.includes('pump') || nameLower.includes('sewage')) {
        return SERVICE_ICONS.PUMP_OUT;
    } else if (nameLower.includes('water')) {
        return SERVICE_ICONS.WATER;
    } else {
        return SERVICE_ICONS.DEFAULT;
    }
};

// Для обратной совместимости - возвращает путь к файлу иконки
export const getServiceIcon = (name: string): string => {
    const iconInfo = getServiceIconInfo(name);
    return `/assets/images/icons/${iconInfo.category}/${iconInfo.name}.svg`;
};

interface PopupReservedProps {
    isOpen: boolean;
    onClose: () => void;
    rowId: string;
    day: string;
    reservation?: ReservationExtenstion;
    timeOfDay?: 'AM' | 'PM';
    position?: { top: number; left: number };
    backdropOffset?: {
        top?: number;
        left?: number;
        right?: number;
        bottom?: number;
    };
}

// Helper function to format date and time
const formatDateTime = (dateObj: Date) => {
    if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        return 'Invalid date';
    }

    const time = dateObj.toLocaleString('en-US', {
        hour: 'numeric',
        hour12: true,
    }).toLowerCase();

    const dateStr = dateObj.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
    });

    return (
        <>
            <Text as="span" color='basic.grey900' fontWeight="400">{time}</Text>
            <Text as="span" color='basic.grey900' fontWeight="300">, {dateStr}</Text>
        </>
    );
};

const PopupReserved: React.FC<PopupReservedProps> = ({
    isOpen,
    rowId,
    reservation,
    day,
}) => {
    // Add these state hooks and service data fetching
    const { selectedMarina } = useMarina();
    const { isOpen: isServiceAddOpen, onOpen: onServiceAddOpen, onClose: onServiceAddClose } = useDisclosure();
    const [localReservation, setLocalReservation] = useState(reservation);
    const { isOpen: isPaymentDetailsOpen, onToggle: togglePaymentDetails } = useDisclosure();
    const queryClient = useQueryClient();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isRetryChargeModalOpen, setIsRetryChargeModalOpen] = useState(false);
    const [isMarkUncollectibleModalOpen, setIsMarkUncollectibleModalOpen] = useState(false);
    const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false);
    const showToast = useCustomToast();
    const [paymentError, setPaymentError] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Add query to fetch reservation data
    const { data: reservationData } = useQuery({
        queryKey: ['reservation', reservation?.reservation_id],
        queryFn: () => reservation?.reservation_id ? ReservationsService.readReservation({ id: reservation.reservation_id }) : null,
        enabled: !!reservation?.reservation_id
    });

    // Update localReservation when either prop or query data changes
    useEffect(() => {
        if (reservationData) {
            setLocalReservation(reservationData as ReservationExtenstion);
        } else if (reservation) {
            setLocalReservation(reservation);
        }
    }, [reservation, reservationData]);



    // Получить выполненные сервисы
    const completedServices = useMemo(() => {
        const currentReservation = localReservation || reservation;
        if (!currentReservation?.service_requests) return [];
        return currentReservation.service_requests
            .filter(service => service.status === 'completed')
            .flatMap(service => service.services.map(item => ({
                title: item.title,
                name: item.name,
                price: item.price,
                unit: item.unit,
                quantity: item.quantity
            })));
    }, [localReservation, reservation]);

    // Сумма выполненных сервисов
    const completedServicesTotal = useMemo(() => {
        return completedServices.reduce((sum, s) => sum + s.price * s.quantity, 0);
    }, [completedServices]);

    // Комиссия 7.5%
    const serviceFee = useMemo(() => Number((completedServicesTotal * SERVICE_FEE_PERCENTAGE).toFixed(2)), [completedServicesTotal]);
    // Налоги (пока 0)
    const taxes = 0;
    // Итоговая сумма
    const total = useMemo(() => Number((completedServicesTotal + serviceFee + taxes).toFixed(2)), [completedServicesTotal, serviceFee, taxes]);

    // Обработчик оплаты
    const handleCharge = (reservationId: string) => {
        if (!reservationId) return;

        // Reset payment error state before trying
        setPaymentError(false);

        // Show loading toast
        showToast("Processing payment", 'loading');

        // Call createPaymentReceipt endpoint
        ReservationsService.createPaymentReceipt({ reservationId })
            .then(() => {
                setIsPaymentModalOpen(false);
                setIsRetryChargeModalOpen(false);
                setIsMarkPaidModalOpen(false);

                // If we have a payment response with service_requests, update our local data
                if (reservationData && reservationData.service_requests && reservationData.service_requests.length > 0) {
                    // Create a new local reservation object with updated service statuses
                    const updatedReservation = { ...localReservation };

                    // Get the service IDs from the payment receipt
                    const paidServiceIds = reservationData.service_requests.map(
                        service => service.service_reservation_id
                    );

                    // Update the status of paid services in our local data
                    if (updatedReservation.service_requests) {
                        updatedReservation.service_requests = updatedReservation.service_requests.map(service => {
                            if (paidServiceIds.includes(service.service_reservation_id)) {
                                // Mark as paid
                                return { ...service, status: 'paid' };
                            }
                            return service;
                        });

                        // Update local state
                        setLocalReservation(updatedReservation as ReservationExtenstion);
                    }
                } else {
                    // Fallback to refresh data if we don't have service details
                    forceRefresh();
                }

                // Show success toast
                showToast('Payment processed', 'success');
            })
            .catch((error) => {
                console.error('Error creating payment receipt:', error);

                // Set payment error state to true
                setPaymentError(true);
                setIsPaymentModalOpen(false);

                // Get more specific error message if available
                let errorMessage = "There was an error processing the payment.";

                if (error && error.message) {
                    errorMessage += ` Error details: ${error.message}`;
                }

                if (error && error.status === 500) {
                    errorMessage += " The server encountered an internal error. Please try again later or contact support if the issue persists.";
                }

                // Show error toast with more details
                showToast('Failed Payment', errorMessage, 'error');

                // Try to refresh data to ensure we're in sync with server
                setTimeout(() => {
                    forceRefresh();
                }, 1000);
            });
    };

    // Check if there are any completed services
    const hasCompletedServices = useMemo(() => {
        if (!localReservation?.service_requests && !reservation?.service_requests) return false;

        const currentReservation = localReservation || reservation;
        if (!currentReservation?.service_requests) return false;

        return currentReservation.service_requests.some(service => service.status === 'completed');
    }, [localReservation, reservation]);

    // Calculate total price for completed services
    const calculateTotalForCompleted = () => {
        const currentReservation = localReservation || reservation;
        if (!currentReservation?.service_requests) return "0.00";

        const completedServices = currentReservation.service_requests.filter(service => service.status === 'completed');

        return completedServices.reduce((total, service) => {
            return total + service.services.reduce((serviceTotal, item) => {
                return serviceTotal + (item.price * item.quantity) + serviceFee;
            }, 0);
        }, 0).toFixed(2);
    };

    useEffect(() => {
        if (isOpen && reservation) {
            // Function to safely apply opacity style
            const applyStyles = (elements: NodeListOf<Element>, style: Record<string, string>) => {
                for (let i = 0; i < elements.length; i++) {
                    try {
                        const element = elements[i] as HTMLElement;
                        Object.entries(style).forEach(([property, value]) => {
                            element.style.setProperty(property, value);
                        });
                    } catch (e) {
                        console.error('Error applying styles:', e);
                    }
                }
            };

            // Определяем, с какой таблицей работаем (Day или Week/Month)
            const isTableDay = document.querySelector('td[data-hour]') !== null;
            // Найдем ячейки с лодками
            const boatContainers = document.querySelectorAll('.boat-cell-container');
            const tableCells = document.querySelectorAll('td[data-boat-id]');

            // Затемняем ВСЕ ячейки и контейнеры
            applyStyles(boatContainers, { opacity: '0.4', transition: 'opacity 0.2s ease-in-out' });

            // Определяем селектор в зависимости от типа таблицы
            let foundExactCell = false;

            if (isTableDay) {
                // Для TableDay используем день и ID лодки
                const dayBoatSelector = `td[data-boat-id="${reservation.reservation_id}"][data-day="${day}"]`;
                const exactTdCell = document.querySelector(dayBoatSelector);

                if (exactTdCell) {
                    const containerInside = exactTdCell.querySelector('.boat-cell-container');
                    if (containerInside) {
                        (containerInside as HTMLElement).style.opacity = '1';
                        foundExactCell = true;
                    }
                }
            } else {
                // Для TableWeek/Month используем rowId, day и ID лодки
                // 1. Перебираем ячейки таблицы и ищем точное совпадение
                const currentCellKey = `boat-${rowId}-${day}-${reservation.reservation_id}`;

                tableCells.forEach(cell => {
                    const cellKey = cell.getAttribute('key');
                    if (cellKey && cellKey.includes(currentCellKey)) {
                        // Нашли точную ячейку
                        const containerInside = cell.querySelector('.boat-cell-container');
                        if (containerInside) {
                            (containerInside as HTMLElement).style.opacity = '1';
                            foundExactCell = true;
                        }
                    }
                });
            }

            // Если не нашли по ключу, ищем по выделенной ячейке
            if (!foundExactCell) {
                // Ищем выделенную ячейку
                const selectedCells = document.querySelectorAll('td.selected-cell');
                if (selectedCells.length > 0) {
                    const selectedCell = selectedCells[0];
                    const containerInside = selectedCell.querySelector('.boat-cell-container');
                    if (containerInside) {
                        (containerInside as HTMLElement).style.opacity = '1';
                        foundExactCell = true;
                    }
                }
            }

            // Если все еще не нашли, используем ID лодки как последний вариант
            if (!foundExactCell) {
                // Последний способ - просто по ID лодки
                const allBoatContainers = document.querySelectorAll(`.boat-cell-container[data-boat-id="${reservation.reservation_id}"]`);
                if (allBoatContainers.length > 0) {
                    (allBoatContainers[0] as HTMLElement).style.opacity = '1';
                }
            }

            // Cleanup function
            return () => {
                // Reset opacity for all cells
                applyStyles(boatContainers, { opacity: '1' });
            };
        }
    }, [isOpen, reservation, rowId, day]);

    // Функция для принудительного обновления данных о резервации
    const forceRefresh = useCallback(() => {
        if (reservation?.reservation_id) {

            // Инвалидируем все запросы
            queryClient.invalidateQueries();

            // Принудительно запрашиваем актуальные данные с сервера
            ReservationsService.readReservation({ id: reservation.reservation_id })
                .then(updatedReservation => {
                    // Обновляем локальное состояние
                    setLocalReservation(updatedReservation as ReservationExtenstion);
                })
                .catch(error => {
                    console.error('Failed to refresh reservation data in forceRefresh:', error);
                });
        }
    }, [reservation?.reservation_id, queryClient]);

    if (!isOpen || !reservation) return null;

    // Get user name from the boat object if available
    const userName = reservation?.user
        ? `${reservation.user.first_name || ''} ${reservation.user.last_name || ''}`.trim()
        : 'Unknown User'

    // Function to handle adding more services to existing reservation
    const handleAddMoreServices = () => {
        // Open service popup to add more services
        onServiceAddOpen();
    };

    // When closing the popup, reset the current service request and update data
    const handleCloseServiceAdd = () => {
        onServiceAddClose();

        // После закрытия попапа обновляем данные о резервации
        forceRefresh();
    };


    // Create a PaymentReceiptPublic object for the RetryCharge component
    const paymentReceipt: PaymentReceiptPublic = useMemo(() => {
        const currentReservation = localReservation || reservation;

        // Get completed service requests
        const completedServiceRequests = currentReservation?.service_requests
            ? currentReservation.service_requests.filter(service => service.status === 'completed')
            : [];

        // Calculate subtotal based on completed services
        const subtotal = completedServiceRequests.reduce((total, service) => {
            return total + service.services.reduce((serviceTotal, item) => {
                return serviceTotal + (item.price * item.quantity);
            }, 0);
        }, 0);

        // Create a mock PaymentReceiptPublic object
        return {
            payment_receipt_id: '',
            receipt_id: '',
            subtotal: subtotal,
            service_fee: serviceFee,
            taxes: taxes,
            created_by_user: null,
            payment_details_simple: null,
            service_requests: completedServiceRequests
        };
    }, [localReservation, reservation, serviceFee, taxes]);


    return (
        <>
            {/* Popup content */}
            <Flex
                flexDirection="column"
                height="100%"
                bg="white"
                rounded="var(--chakra-space-xl)"
                width="auto"
                gap="lg"
            >
                {/* Header - фиксированный */}
                <Flex
                    borderBottom="1px solid"
                    borderColor="gray.100"
                    justify="space-between"
                    align="center"
                    bg="white"
                    borderTopRadius="var(--chakra-space-xl)"
                    p="0"
                    width="100%"
                    minHeight="80px"
                    flexShrink={0}
                >
                    <Flex pt="xl"
                        pb="lg"
                        px="24px"
                        w="100%"
                        align="center"
                        gap="12px">
                        <Image
                            {...getBoatImageProps(
                                reservation?.boat?.vessel_type || '',
                                reservation?.boat?.boatname || 'Boat'
                            )}
                            width="32px"
                            height="32px"
                            filter="invert(40%) sepia(90%) saturate(2259%) hue-rotate(352deg) brightness(98%) contrast(97%)"
                        />
                        <Box w="100%">
                            <Flex justifyContent="space-between" align="center" gap="4px">
                                <Flex align="center" gap="4px">
                                    <Text fontSize="16px" fontWeight="500" color="gray.900">{reservation?.boat?.boatname || 'Unknown Boat'}</Text>
                                    <Text fontSize="12px" fontWeight="300" color="gray.600">|</Text>
                                    <Text fontSize="12px" fontWeight="300" color="gray.600">{userName}</Text>
                                </Flex>
                                <Text bg="basic.grey100" px="sm" py="xs" borderRadius="var(--chakra-space-sm)" fontSize="16px" fontWeight="500" color="gray.900">{reservation?.boat?.registration_number || 'N/A'}</Text>
                            </Flex>
                            <Flex justifyContent="space-between" align="center">
                                <Text fontSize="12px" fontWeight="300" color="gray.900">LOA {reservation?.boat?.loa || 'N/A'}ft | Draft {reservation?.boat?.draft || 'N/A'}ft</Text>
                            </Flex>
                        </Box>
                    </Flex>
                </Flex>

                <Flex
                    flexDirection="column"
                    gap="2xl"
                    width="100%"
                    px="24px"
                    pb="24px"
                >
                    <Flex width="100%" align="center" justify="space-between" gap="lg">
                        <Flex
                            py='xs'
                            px='sm'
                            bg='basic.grey100'
                            border="1px solid"
                            borderColor="basic.grey200"
                            borderRadius="var(--chakra-space-sm)"
                            align="center"
                            width="100%"
                            justify="space-between"
                        >
                            <Flex gap="lg">
                                <Flex align="center" gap="xs">
                                    <CustomIcon name="bola-cell-white" category="ui" size={30} />
                                    <Text fontSize="20px" fontWeight="400" color="gray.900">{rowId}</Text>
                                </Flex>
                                <Flex justify="center" flexDirection="column">
                                    <Flex align="center" gap='xs' whiteSpace="nowrap">
                                        <Flex
                                            width="33px"
                                            height="14px"
                                            px="xs"
                                            textAlign="center"
                                            fontSize="14px"
                                            fontWeight="400"
                                            color='white'
                                            bg='black'
                                            borderRadius='56px'
                                            alignItems="center"
                                            justifyContent="center"
                                        >In</Flex>
                                        <Text fontSize="14px" fontWeight="400" color='basic.grey700' whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                                            {reservation.startDateObj ? formatDateTime(reservation.startDateObj) : 'N/A'}
                                        </Text>
                                    </Flex>
                                    <Flex align="center" gap='xs' whiteSpace="nowrap">
                                        <Flex
                                            width="33px"
                                            height="14px"
                                            px="xs"
                                            textAlign="center"
                                            fontSize="14px"
                                            fontWeight="400"
                                            color='white'
                                            bg='black'
                                            borderRadius='56px'
                                            alignItems="center"
                                            justifyContent="center"
                                        >Out</Flex>
                                        <Text fontSize="14px" fontWeight="400" color='basic.grey700' whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                                            {reservation.endDateObj ? formatDateTime(reservation.endDateObj) : 'N/A'}
                                        </Text>
                                    </Flex>
                                </Flex>
                            </Flex>
                            <Box boxSize="auto" py='xs' px='sm' bg='white' border="1px solid" borderColor="basic.grey200" borderRadius="var(--chakra-space-5xl)" color={getBookingStatusTextColor(getBookingStatusText(reservation.admin_status))}><Text padding="0" fontSize="12px" fontWeight="400" color={getBookingStatusTextColor(getBookingStatusText(reservation.admin_status))}>{getBookingStatusText(reservation.admin_status)}</Text></Box>
                        </Flex>
                        <Button
                            variant="unstyled"
                            padding="0"
                            display="flex"
                            minWidth="0"
                            height="auto"
                            minHeight="0"
                            _hover={{ opacity: 0.8 }}
                        >
                            <CustomIcon
                                name="chat-icon"
                                category="ui"
                                size={44}
                            />
                        </Button>
                    </Flex>
                    {/* Content*/}
                    <Flex flexDirection="column" w="100%" gap="xl">
                        <ServicesList
                            reservation={localReservation || reservation}
                            rowId={rowId}
                            userName={userName}
                            handleAddMoreServices={handleAddMoreServices}
                            onServiceStatusChange={(updatedReservation) => {
                                setLocalReservation(updatedReservation);
                            }}
                        />
                    </Flex>
                </Flex>
                {/* Sentinel element to detect when footer starts overlapping content */}
                <div ref={sentinelRef} style={{ 
                    position: 'absolute', 
                    bottom: '100%', 
                    left: 0, 
                    right: 0,
                    height: '1px',
                    pointerEvents: 'none'
                }} />
                
                {/* Payment details block (Footer) */}
                {hasCompletedServices && (
                    <Flex
                        px='xl'
                        py='lg'
                        direction="column"
                        w="100%"
                        borderBottomRadius="var(--chakra-space-xl)"
                        borderTop="1px solid"
                        borderColor="gray.200"
                        position="sticky"
                        bottom="0"
                        bg="white"
                        zIndex="10"
                    >
                        <Flex
                            w="100%"
                            gap="4px"
                            justifyContent="center"
                            alignItems="center"
                            cursor="pointer"
                            onClick={togglePaymentDetails}
                        >
                            <Text textDecoration="underline" fontSize="14px" fontWeight="400" color="gray.600">
                                Payment details
                            </Text>
                            <Box p='10px' transform={isPaymentDetailsOpen ? 'rotate(180deg)' : 'none'} transition="transform 0.2s">
                                <CustomIcon
                                    name="dropdown"
                                    category="ui"
                                    size={16}
                                />
                            </Box>
                        </Flex>

                        {/* Payment details dropdown */}
                        {isPaymentDetailsOpen && (
                            <Box display="flex" flexDirection="column" gap="12px" border="1px solid" borderColor="basic.grey200" p='md' borderRadius="md">
                                <Flex borderBottom="1px solid" borderColor="basic.grey200" py='12px' justifyContent="space-between" fontWeight="bold">
                                    <Text>Service payment details</Text>
                                    <Text>€{completedServicesTotal.toFixed(2)}</Text>
                                </Flex>
                                {completedServices.map((service, index) => (
                                    <Flex key={index} justifyContent="space-between">
                                        <Text fontSize="sm">{service.quantity}x {service.name}</Text>
                                        <Text fontSize="sm" fontWeight="medium">
                                            €{(service.price * service.quantity).toFixed(2)}
                                        </Text>
                                    </Flex>
                                ))}
                                <Flex justifyContent="space-between" fontWeight="bold">
                                    <Text fontSize='14px' fontWeight='300' color='basic.grey700'>Service fee (7.5%)</Text>
                                    <Text fontSize='14px' fontWeight='400' color='basic.grey700'>${serviceFee.toFixed(2)}</Text>
                                </Flex>
                                <Flex justifyContent="space-between" fontWeight="bold">
                                    <Text fontSize='14px' fontWeight='300' color='basic.grey700'>Taxes</Text>
                                    <Text fontSize='14px' fontWeight='400' color='basic.grey700'>${taxes.toFixed(2)}</Text>
                                </Flex>
                            </Box>
                        )}

                        {!paymentError && (
                            <Box>
                                <Flex alignItems="center" flexDirection="column" justifyContent="center" w="100%">
                                    <Button
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        my="10px"
                                        height='50px'
                                        leftIcon={<CustomIcon name="credit-card" category="ui" size={20} />}
                                        bg="system.successGreen"
                                        color="white"
                                        borderRadius="full"
                                        px='md'
                                        py='10px'
                                        fontWeight="500"
                                        _hover={{ bg: "teal.400" }}
                                        onClick={() => setIsPaymentModalOpen(true)}
                                    >
                                        <Flex gap="4px" fontSize="16px" fontWeight="400" color="white">CHARGE<Text fontWeight="700">${calculateTotalForCompleted()}</Text> NOW <Flex align="end" fontSize="12px">(Completed services ONLY)</Flex></Flex>
                                    </Button>
                                </Flex>
                            </Box>
                        )}
                        {paymentError && (
                            <Box>
                                <Flex alignItems="center" flexDirection="column" justifyContent="center" w="100%">
                                    <Button
                                        height='50px'
                                        py="10px"
                                        px='md'
                                        my="10px"
                                        display="flex"
                                        justifyContent="center"
                                        leftIcon={<CustomIcon name="alert-icon" category="alerts" size={30} color="white" viewBox="0 0 30 30" />}
                                        bg="brand.secondaryBlue"
                                        color="white"
                                        borderRadius="full"
                                        fontWeight="500"
                                        _hover={{ bg: "teal.400" }}
                                        onClick={() => setIsRetryChargeModalOpen(true)}
                                    >
                                        <Flex gap="4px" fontSize="16px" fontWeight="400" color="white">RETRY CHARGE
                                            <Text fontWeight="700">${calculateTotalForCompleted()}</Text>
                                            NOW <Flex align="end" fontSize="12px">(Failed payment)</Flex>
                                        </Flex>
                                    </Button>
                                    <Flex justifyContent="space-between">
                                        <Button
                                            leftIcon={<Box><CustomIcon name="close" category="ui" size={12} stroke="var(--chakra-colors-system-errorRedNew)" viewBox="0 0 12 12" /></Box>}
                                            fontSize="16px"
                                            fontWeight="400"
                                            textDecoration='underline'
                                            w="100%"
                                            flex="1"
                                            px='md'
                                            py='10px'
                                            variant="unstyled"
                                            color="system.errorRedNew"
                                            onClick={() => setIsMarkUncollectibleModalOpen(true)}
                                        >
                                            Mark uncollectible
                                        </Button>
                                        <Button
                                            leftIcon={<CustomIcon name="check-icon-green" category="ui" size={12} />}
                                            fontSize="16px"
                                            fontWeight="400"
                                            textDecoration='underline'
                                            w="100%"
                                            flex="1"
                                            px='md'
                                            py='10px'
                                            variant="unstyled"
                                            color="system.successGreen"
                                            onClick={() => setIsMarkPaidModalOpen(true)}
                                        >
                                            Mark as paid
                                        </Button>
                                    </Flex>
                                </Flex>
                            </Box>)}

                    </Flex>
                )}

            </Flex>

            {/* Service Add */}
            {(localReservation || reservation) && (
                <ServiceAdd
                    isOpen={isServiceAddOpen}
                    onClose={handleCloseServiceAdd}
                    services={selectedMarina?.active_services || []}
                    reservation={localReservation || reservation}
                    userName={userName}
                    rowId={rowId}
                />
            )}

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                services={completedServices}
                serviceFee={serviceFee}
                taxes={taxes}
                total={total}
                onCharge={handleCharge}
                reservationId={reservation.reservation_id}
            />

            {/* Retry Charge Modal */}
            <RetryCharge
                isOpen={isRetryChargeModalOpen}
                onClose={() => setIsRetryChargeModalOpen(false)}
                payment={paymentReceipt}
                onRetryCharge={handleCharge}
                reservationId={reservation.reservation_id}
            />

            {/* Mark Uncollectible Modal */}
            <MarkUncollectible
                isOpen={isMarkUncollectibleModalOpen}
                onClose={() => setIsMarkUncollectibleModalOpen(false)}
                payment={paymentReceipt}
                reservationId={reservation.reservation_id}
                onServiceStatusChange={(updatedReservation) => {
                    setLocalReservation(updatedReservation);
                    queryClient.invalidateQueries({
                        queryKey: ['reservation', reservation?.reservation_id]
                    });
                }}
            />

            {/* Mark Paid Modal */}
            <MarkPaid
                isOpen={isMarkPaidModalOpen}
                onClose={() => setIsMarkPaidModalOpen(false)}
                payment={paymentReceipt}
                reservationId={reservation.reservation_id}
                onServiceStatusChange={(updatedReservation) => {
                    setLocalReservation(updatedReservation);
                    queryClient.invalidateQueries({
                        queryKey: ['reservation', reservation?.reservation_id]
                    });
                }}
            />

        </>
    );
};

export default PopupReserved;
