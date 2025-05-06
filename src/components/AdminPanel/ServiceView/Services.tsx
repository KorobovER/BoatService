import React, { useEffect, useState, useMemo } from 'react';
import { Box, Text, Image, Flex, Button, useDisclosure } from '@chakra-ui/react';
import NoService from './NoService';
import { ReservationExtenstion } from '../TableReservations';
import ServicePopup from './ServicePopup';
import { useMarina } from '../../../context/MarinaContext';
import { useQuery } from '@tanstack/react-query';
import { MarinasService } from '../../../client/services';
import { ServiceOnReservationPublic } from '../../../client/models';

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

// Иконки для разных типов услуг
const SERVICE_ICONS = {
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
const getServiceIcon = (name: string): string => {
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
    const { isOpen: isServicePopupOpen, onOpen: onServicePopupOpen, onClose: onServicePopupClose } = useDisclosure();
    const [currentServiceRequest, setCurrentServiceRequest] = useState<ServiceOnReservationPublic | null>(null);
    
    // Fetch marina services
    const { data: servicesData } = useQuery({
        queryKey: ['marina-services'],
        queryFn: () => MarinasService.readServices(),
        enabled: !!selectedMarina // Only fetch when marina is selected
    });

    // Get all existing services from all service requests
    const existingServices = useMemo(() => {
        if (!reservation?.service_requests) return [];
        
        // Flatten all services from all requests
        return reservation.service_requests.flatMap(request => 
            request.services.map(service => ({
                ...service,
                requestId: request.service_reservation_id
            }))
        );
    }, [reservation]);

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

    if (!isOpen || !reservation) return null;

    // Get user name from the boat object if available
    const userName = `${reservation.user.first_name} ${reservation.user.last_name}`

    // Function to handle adding more services to existing reservation
    const handleAddMoreServices = () => {
        // Open service popup to add more services
        onServicePopupOpen();
    };

    // Function to handle adding more services to a specific service request
    const handleAddToServiceRequest = (serviceRequest: ServiceOnReservationPublic) => {
        setCurrentServiceRequest(serviceRequest);
        onServicePopupOpen();
    };

    // When closing the popup, reset the current service request
    const handleCloseServicePopup = () => {
        setCurrentServiceRequest(null);
        onServicePopupClose();
    };

    return (
        <>
            {/* Popup content */}
            <Flex
                flexDirection="column"
                bg="white"
                rounded="var(--chakra-space-lg)"
                zIndex="1000"
                position="relative"
                height='100%'
                minHeight="400px"
                width="auto"
                overflow="hidden"
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
                            src={reservation.boat.vessel_type === 'power'
                                ? "/assets/images/power-boat.svg"
                                : reservation.boat.vessel_type === 'catamaran'
                                    ? "/assets/images/catamaran-boat.svg"
                                    : "/assets/images/monohul-boat.svg"}
                            alt={reservation.boat.boatname}
                            width="32px"
                            height="32px"
                            filter="invert(40%) sepia(90%) saturate(2259%) hue-rotate(352deg) brightness(98%) contrast(97%)"
                        />
                        <Box w="100%">
                            <Flex justifyContent="space-between" align="center" gap="4px">
                                <Flex align="center" gap="4px">
                                    <Text fontSize="16px" fontWeight="500" color="gray.900">{reservation.boat.boatname}</Text>
                                    <Text fontSize="12px" fontWeight="300" color="gray.600">|</Text>
                                    <Text fontSize="12px" fontWeight="300" color="gray.600">{userName}</Text>
                                </Flex>
                                <Text bg="basic.grey100" px="sm" py="xs" borderRadius="var(--chakra-space-sm)" fontSize="16px" fontWeight="500" color="gray.900">{reservation.boat.registration_number}</Text>
                            </Flex>
                            <Flex justifyContent="space-between" align="center">
                                <Text fontSize="12px" fontWeight="300" color="gray.900">LOA {reservation.boat.loa}ft | Draft {reservation.boat.draft}ft</Text>
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
                            <Button boxSize="auto" py='xs' px='sm' bg='white' border="1px solid" borderColor="basic.grey200" borderRadius="var(--chakra-space-5xl)" color='brand.secondaryBlue'><Text padding="0" fontSize="12px" fontWeight="400" color='brand.secondaryBlue'>Active booking</Text></Button>
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
                        {(!reservation.service_requests || reservation.service_requests.length === 0) ? (
                            <Flex flexDirection="column" w="100%">
                                <NoService rowId={rowId} reservation={reservation} userName={userName} />
                            </Flex>
                        ) : (
                            // Группируем сервисы по статусам
                            <Flex flexDirection="column" w="100%" gap="2xl">
                                {/* Pending services */}
                                {reservation.service_requests.some(service => service.status === 'pending') && (
                                    <Flex flexDirection="column" w="100%">
                                        <Flex justifyContent="space-between" alignItems="center">
                                            <Text fontSize="16px" fontWeight="400" color="gray.700" >Pending services</Text>
                                            <Button variant="unstyled" fontSize="14px" fontWeight="500" color="brand.primaryOrange" onClick={handleAddMoreServices}>Add service +</Button>
                                        </Flex>
                                        <Flex flexDirection="column" gap="sm">
                                            {reservation.service_requests
                                                .filter(service => service.status === 'pending')
                                                .map((service, index) => (
                                                    <Flex 
                                                        key={index} 
                                                        w="100%" 
                                                        flexDirection="column"
                                                        gap="xs"
                                                    >
                                                        {/* Existing service items */}
                                                        {service.services.map((subService, i) => (
                                                            <Flex gap="8px" key={i} alignItems="center" >
                                                                <Flex borderRadius='8px' bg='system.errorRedNew' alignItems="center" justifyContent="center" w="46px" h="46px"><Image w='24px' h='auto' src={getServiceIcon(subService.name)} alt={subService.name} filter="brightness(0) invert(1)" /></Flex>
                                                                <Flex flex="1" justify="space-between" flexDirection="column">
                                                                    <Text fontSize="14px" fontWeight="700" color='basic.grey700'>
                                                                        {subService.quantity}x {subService.name}
                                                                    </Text>
                                                                    <Text fontSize="14px" fontWeight="400" color='basic.grey900'>${subService.price} / {subService.unit}</Text>
                                                                </Flex>
                                                                <Button px='md' py='10px' variant="unstyled" borderRadius='var(--chakra-space-full)' border="1px solid" borderColor='system.errorRedNew' fontSize="14px" fontWeight="400" color='basic.grey900' display="flex" alignItems="center">Mark in progress</Button>
                                                                <Button w='32px' h='32px' border='1px solid' borderColor='basic.grey200' borderRadius='100%' variant="unstyled" fontSize="14px" fontWeight="400" color='basic.grey900' p="0" minW="32px" maxW="32px">
                                                                    <Flex justifyContent="center" alignItems="center" w="100%" h="100%">
                                                                        <svg width="12" height="4" viewBox="0 0 12 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <circle cx="1.5" cy="2" r="1.5" fill="#4A5568"/>
                                                                            <circle cx="6" cy="2" r="1.5" fill="#4A5568"/>
                                                                            <circle cx="10.5" cy="2" r="1.5" fill="#4A5568"/>
                                                                        </svg>
                                                                    </Flex>
                                                                </Button>
                                                            </Flex>
                                                        ))}
                                                    </Flex>
                                                ))}
                                        </Flex>
                                    </Flex>
                                )}

                                {/* In progress services */}
                                {reservation.service_requests.some(service => service.status === 'en-route') && (
                                    <Box>
                                        <Flex justifyContent="space-between" alignItems="center" mb="md">
                                            <Text fontSize="16px" fontWeight="500" color="gray.900">In progress services</Text>
                                            <Button variant="unstyled" fontSize="14px" fontWeight="500" color="brand.primaryOrange" onClick={handleAddMoreServices}>Add service +</Button>
                                        </Flex>
                                        <Flex flexDirection="column" gap="sm">
                                            {reservation.service_requests
                                                .filter(service => service.status === 'en-route')
                                                .map((service, index) => (
                                                    <Flex
                                                        key={index}
                                                        w="100%"
                                                        p="md"
                                                        borderWidth="1px"
                                                        borderColor="gray.200"
                                                        borderRadius="md"
                                                        flexDirection="column"
                                                        gap="xs"
                                                    >
                                                        <Flex justifyContent="space-between" alignItems="center">
                                                            <Text fontWeight="500" color="gray.900">Request #{service.service_reservation_id.slice(-4)}</Text>
                                                            <Text fontSize="sm" color="blue.500" bg="blue.50" px="sm" py="xs" borderRadius="full">
                                                                In progress
                                                            </Text>
                                                        </Flex>
                                                        <Text fontSize="sm" color="gray.600">
                                                            Requested: {new Date(service.requested_date).toLocaleDateString()}
                                                        </Text>
                                                        {service.services.map((subService, i) => (
                                                            <Flex key={i} justify="space-between" alignItems="center" mt="1">
                                                                <Text fontSize="sm">
                                                                    {subService.name} ({subService.quantity} {subService.unit})
                                                                </Text>
                                                                <Text fontSize="sm">${subService.price * subService.quantity}</Text>
                                                            </Flex>
                                                        ))}
                                                    </Flex>
                                                ))}
                                        </Flex>
                                    </Box>
                                )}

                                {/* Completed services */}
                                {reservation.service_requests.some(service => service.status === 'completed') && (
                                    <Box>
                                        <Flex justifyContent="space-between" alignItems="center" mb="md">
                                            <Text fontSize="16px" fontWeight="500" color="gray.900">Completed services</Text>
                                            <Button variant="unstyled" fontSize="14px" fontWeight="500" color="brand.primaryOrange" onClick={handleAddMoreServices}>Add service +</Button>
                                        </Flex>
                                        <Flex flexDirection="column" gap="sm">
                                            {reservation.service_requests
                                                .filter(service => service.status === 'completed')
                                                .map((service, index) => (
                                                    <Flex
                                                        key={index}
                                                        w="100%"
                                                        p="md"
                                                        borderWidth="1px"
                                                        borderColor="gray.200"
                                                        borderRadius="md"
                                                        flexDirection="column"
                                                        gap="xs"
                                                    >
                                                        <Flex justifyContent="space-between" alignItems="center">
                                                            <Text fontWeight="500" color="gray.900">Request #{service.service_reservation_id.slice(-4)}</Text>
                                                            <Text fontSize="sm" color="green.500" bg="green.50" px="sm" py="xs" borderRadius="full">
                                                                Completed
                                                            </Text>
                                                        </Flex>
                                                        <Text fontSize="sm" color="gray.600">
                                                            Requested: {new Date(service.requested_date).toLocaleDateString()}
                                                        </Text>
                                                        {service.services.map((subService, i) => (
                                                            <Flex key={i} justify="space-between" alignItems="center" mt="1">
                                                                <Text fontSize="sm">
                                                                    {subService.name} ({subService.quantity} {subService.unit})
                                                                </Text>
                                                                <Text fontSize="sm">${subService.price * subService.quantity}</Text>
                                                            </Flex>
                                                        ))}
                                                    </Flex>
                                                ))}
                                        </Flex>
                                    </Box>
                                )}

                                {/* Other statuses (if any) */}
                                {reservation.service_requests.some(service =>
                                    service.status !== 'pending' &&
                                    service.status !== 'en-route' &&
                                    service.status !== 'completed'
                                ) && (
                                        <Box>
                                            <Flex justifyContent="space-between" alignItems="center" mb="md">
                                                <Text fontSize="16px" fontWeight="500" color="gray.900">Other services</Text>
                                                <Button variant="unstyled" fontSize="14px" fontWeight="500" color="brand.primaryOrange" onClick={handleAddMoreServices}>Add service +</Button>
                                            </Flex>
                                            <Flex flexDirection="column" gap="sm">
                                                {reservation.service_requests
                                                    .filter(service =>
                                                        service.status !== 'pending' &&
                                                        service.status !== 'en-route' &&
                                                        service.status !== 'completed'
                                                    )
                                                    .map((service, index) => (
                                                        <Flex
                                                            key={index}
                                                            w="100%"
                                                            p="md"
                                                            borderWidth="1px"
                                                            borderColor="gray.200"
                                                            borderRadius="md"
                                                            flexDirection="column"
                                                            gap="xs"
                                                        >
                                                            <Flex justifyContent="space-between" alignItems="center">
                                                                <Text fontWeight="500" color="gray.900">Request #{service.service_reservation_id.slice(-4)}</Text>
                                                                <Text fontSize="sm" color="gray.500" bg="gray.50" px="sm" py="xs" borderRadius="full">
                                                                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                                                                </Text>
                                                            </Flex>
                                                            <Text fontSize="sm" color="gray.600">
                                                                Requested: {new Date(service.requested_date).toLocaleDateString()}
                                                            </Text>
                                                            {service.services.map((subService, i) => (
                                                                <Flex key={i} justify="space-between" alignItems="center" mt="1">
                                                                    <Text fontSize="sm">
                                                                        {subService.name} ({subService.quantity} {subService.unit})
                                                                    </Text>
                                                                    <Text fontSize="sm">${subService.price * subService.quantity}</Text>
                                                                </Flex>
                                                            ))}
                                                        </Flex>
                                                    ))}
                                            </Flex>
                                        </Box>
                                    )}
                            </Flex>
                        )}
                    </Flex>
                </Flex>
            </Flex>

            {/* Service Popup */}
            {reservation && (
                <ServicePopup 
                    isOpen={isServicePopupOpen}
                    onClose={handleCloseServicePopup}
                    services={servicesData?.data || []}
                    reservation={reservation}
                    userName={userName}
                    rowId={rowId}
                    existingServices={existingServices}
                    currentServiceRequest={currentServiceRequest}
                />
            )}
        </>
    );
};

export default PopupReserved;
