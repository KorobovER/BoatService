import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Box, Text, Image, Flex, Button, useDisclosure, Collapse, Icon, useToast } from '@chakra-ui/react';
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

// Иконки для разных типов услуг
export const SERVICE_ICONS = {
    TRASH: '/assets/icons/trash_service.svg',
    LAUNCH: '/assets/images/launch_service.svg',
    LAUNDRY: '/assets/images/laundry_service.svg',
    ICE: '/assets/images/ice_service.svg',
    FUEL: '/assets/images/fuel_service.svg',
    PUMP_OUT: '/assets/images/pump_out_service.svg',
    WATER: '/assets/images/water_service.svg',
    DEFAULT: '/assets/images/all_services.svg'
};

// Функция для определения иконки по имени услуги
export const getServiceIcon = (name: string): string => {
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
    const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);
    const [localReservation, setLocalReservation] = useState(reservation);
    const queryClient = useQueryClient();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isRetryChargeModalOpen, setIsRetryChargeModalOpen] = useState(false);
    const [isMarkUncollectibleModalOpen, setIsMarkUncollectibleModalOpen] = useState(false);
    const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false);
    const toast = useToast();
    const [paymentError, setPaymentError] = useState(false);

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
    const serviceFee = useMemo(() => Number((completedServicesTotal * 0.075).toFixed(2)), [completedServicesTotal]);
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
        const loadingToastId = toast({
            title: "Processing payment",
            description: "Please wait while we process your payment...",
            status: "loading",
            duration: null,
            isClosable: false,
        });

        // Call createPaymentReceipt endpoint
        ReservationsService.createPaymentReceipt({ reservationId })
            .then(response => {
                console.log('Payment receipt created:', response);
                
                // Close loading toast
                toast.close(loadingToastId);
                
                // Close all modals
                setIsPaymentModalOpen(false);
                setIsRetryChargeModalOpen(false);
                setIsMarkPaidModalOpen(false);
                
                // If we have a payment response with service_requests, update our local data
                if (response && response.service_requests && response.service_requests.length > 0) {
                    // Create a new local reservation object with updated service statuses
                    const updatedReservation = {...localReservation};
                    
                    // Get the service IDs from the payment receipt
                    const paidServiceIds = response.service_requests.map(
                        service => service.service_reservation_id
                    );
                    
                    // Update the status of paid services in our local data
                    if (updatedReservation.service_requests) {
                        updatedReservation.service_requests = updatedReservation.service_requests.map(service => {
                            if (paidServiceIds.includes(service.service_reservation_id)) {
                                // Mark as paid
                                return {...service, status: 'paid'};
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
                toast({
                    title: "Payment processed",
                    description: `Payment for completed services has been processed successfully.`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            })
            .catch(error => {
                // Close loading toast
                toast.close(loadingToastId);
                
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
                toast({
                    title: "Payment failed",
                    description: errorMessage,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                
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

    // Effect to automatically open payment details when completed services appear
    useEffect(() => {
        if (hasCompletedServices) {
            setIsPaymentDetailsOpen(true);
        }
    }, [hasCompletedServices]);

    // Calculate total price for completed services
    const calculateTotalForCompleted = () => {
        const currentReservation = localReservation || reservation;
        if (!currentReservation?.service_requests) return "0.00";

        const completedServices = currentReservation.service_requests.filter(service => service.status === 'completed');

        return completedServices.reduce((total, service) => {
            return total + service.services.reduce((serviceTotal, item) => {
                return serviceTotal + (item.price * item.quantity);
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
            console.log('Table type detected:', isTableDay ? 'TableDay' : 'TableWeek/Month');

            // Найдем ячейки с лодками
            const boatContainers = document.querySelectorAll('.boat-cell-container');
            const tableCells = document.querySelectorAll('td[data-boat-id]');

            console.log(`Found: ${boatContainers.length} containers, ${tableCells.length} table cells`);

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
                        console.log('Found exact TableDay cell:', dayBoatSelector);
                    }
                }
            } else {
                // Для TableWeek/Month используем rowId, day и ID лодки
                // 1. Перебираем ячейки таблицы и ищем точное совпадение
                const currentCellKey = `boat-${rowId}-${day}-${reservation.reservation_id}`;
                console.log('Looking for cell with key containing:', currentCellKey);

                tableCells.forEach(cell => {
                    const cellKey = cell.getAttribute('key');
                    if (cellKey && cellKey.includes(currentCellKey)) {
                        // Нашли точную ячейку
                        const containerInside = cell.querySelector('.boat-cell-container');
                        if (containerInside) {
                            (containerInside as HTMLElement).style.opacity = '1';
                            foundExactCell = true;
                            console.log('Found exact cell by key:', cellKey);
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
                        console.log('Found by selected-cell class');
                    }
                }
            }

            // Если все еще не нашли, используем ID лодки как последний вариант
            if (!foundExactCell) {
                // Последний способ - просто по ID лодки
                const allBoatContainers = document.querySelectorAll(`.boat-cell-container[data-boat-id="${reservation.reservation_id}"]`);
                if (allBoatContainers.length > 0) {
                    (allBoatContainers[0] as HTMLElement).style.opacity = '1';
                    console.log('Found by boat ID only (fallback)');
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
            console.log('Forcing reservation data refresh...');

            // Инвалидируем все запросы
            queryClient.invalidateQueries();

            // Принудительно запрашиваем актуальные данные с сервера
            ReservationsService.readReservation({ id: reservation.reservation_id })
                .then(updatedReservation => {
                    console.log('Received updated reservation data:', updatedReservation);
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
                            src={reservation?.boat?.vessel_type === 'power'
                                ? "/assets/images/power-boat.svg"
                                : reservation?.boat?.vessel_type === 'catamaran'
                                    ? "/assets/images/catamaran-boat.svg"
                                    : "/assets/images/monohul-boat.svg"}
                            alt={reservation?.boat?.boatname || 'Boat'}
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
                                    <Image
                                        src="/assets/images/bola-cell-secondary.svg"
                                        alt={rowId}
                                    />
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
                            <Box boxSize="auto" py='xs' px='sm' bg='white' border="1px solid" borderColor="basic.grey200" borderRadius="var(--chakra-space-5xl)" color='brand.secondaryBlue'><Text padding="0" fontSize="12px" fontWeight="400" color='brand.secondaryBlue'>Active booking</Text></Box>
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
                            <Image src="/assets/images/chat-icon.svg" alt="Chat" />
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
                        boxShadow="0 -2px 10px rgba(0,0,0,0.1)"
                    >
                        <Flex
                            w="100%"
                            justifyContent="center"
                            alignItems="center"
                            cursor="pointer"
                            onClick={() => setIsPaymentDetailsOpen(!isPaymentDetailsOpen)}
                        >
                            <Text fontSize="14px" fontWeight="400" color="gray.600">
                                Payment details
                            </Text>
                            <Icon
                                viewBox="0 0 24 24"
                                w={5}
                                h={5}
                                ml={2}
                                transform={isPaymentDetailsOpen ? 'rotate(180deg)' : 'none'}
                                transition="transform 0.2s"
                            >
                                <path
                                    fill="currentColor"
                                    d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
                                />
                            </Icon>
                        </Flex>

                        <Collapse in={isPaymentDetailsOpen && !paymentError} animateOpacity>
                            <Button
                                display="flex"
                                w="100%"
                                justifyContent="center"
                                p='md'
                                my="10px"
                                leftIcon={<Box as="span" mr={2}>💳</Box>}
                                bg="system.successGreen"
                                color="white"
                                size="lg"
                                borderRadius="full"
                                px='md'
                                py='10px'
                                fontWeight="500"
                                _hover={{ bg: "teal.400" }}
                                onClick={() => setIsPaymentModalOpen(true)}
                            >
                                <Flex gap="4px" fontSize="16px" fontWeight="400" color="white">CHARGE<Text fontWeight="700">${calculateTotalForCompleted()}</Text> NOW <Flex align="end" fontSize="12px">(Completed services ONLY)</Flex></Flex>
                            </Button>
                            
                            {/* Тестовая кнопка для симуляции ошибки оплаты */}
                            {/* <Button
                                display="flex"
                                w="100%" 
                                justifyContent="center" 
                                p='md'
                                my="10px"
                                leftIcon={<Box as="span" mr={2}>🚨</Box>}
                                bg="red.400"
                                color="white"
                                size="lg"
                                borderRadius="full"
                                px='md' 
                                py='10px'
                                fontWeight="500"
                                _hover={{ bg: "red.500" }}
                                onClick={() => {
                                    // Симулируем ошибку оплаты
                                    setPaymentError(true);
                                    toast({
                                        title: "Симуляция ошибки",
                                        description: "Была симулирована ошибка оплаты для тестирования",
                                        status: "error",
                                        duration: 3000,
                                        isClosable: true,
                                    });
                                }}
                            >
                                <Flex gap="4px" fontSize="16px" fontWeight="400" color="white">SIMULATE A PAYMENT ERROR (test)</Flex>
                            </Button> */}
                        </Collapse>
                        <Collapse in={isPaymentDetailsOpen && paymentError} animateOpacity>
                            <Button
                                my="10px"
                                display="flex"
                                w="100%"
                                justifyContent="center"
                                px='md'
                                py='10px'
                                leftIcon={<Box bg="system.errorRed" borderRadius="full"><Image width="30px" height="30px" src="/assets/images/alert-icon-red.svg" alt="Retry" /></Box>}
                                bg="brand.secondaryBlue"
                                color="white"
                                size="lg"
                                borderRadius="full"
                                fontWeight="500"
                                _hover={{ bg: "teal.400" }}
                                onClick={() => setIsRetryChargeModalOpen(true)}
                            >
                                <Flex gap="4px" fontSize="16px" fontWeight="400" color="white">RETRY CHARGE<Text fontWeight="700">${calculateTotalForCompleted()}</Text> NOW <Flex align="end" fontSize="12px">(Failed payment)</Flex></Flex>
                            </Button>
                            <Flex w="100%" justifyContent="space-between">
                                <Button
                                    leftIcon={<Image ml='4px' h='auto' src='assets/images/close-red.svg' />}
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
                                    leftIcon={<Image ml='4px' h='auto' src='assets/images/check-icon-green.svg' />}
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
                        </Collapse>
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
