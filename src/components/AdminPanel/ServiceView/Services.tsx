import React, { useEffect } from 'react';
import { Box, Text, Image, Flex, Button } from '@chakra-ui/react';
import NoService from './NoService';
import { ReservationExtenstion } from '../TableReservations';

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
                    <Flex>
                        {(!reservation.service_requests || reservation.service_requests.length === 0) ? (
                            <NoService rowId={rowId} reservation={reservation} userName={userName} />
                        ) : (
                            // Отображение списка сервисов, когда они есть
                            <Flex flexDirection="column" w="100%" py="3xl" px="md">
                                {reservation.service_requests.map((service, index) => (
                                    <Flex key={index} w="100%">
                                        {/* Здесь будет содержимое для отображения каждого сервиса */}
                                        <Text>Service Request #{index + 1}: {service.is_completed ? 'Completed' : 'Pending'}</Text>
                                    </Flex>
                                ))}
                            </Flex>
                        )}
                    </Flex>
                </Flex>
            </Flex>
        </>
    );
};

export default PopupReserved;
