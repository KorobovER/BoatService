import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Box,
    Text,
    Image,
    Spinner,
    Flex,
    Center,
    useDisclosure,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from '@chakra-ui/react';
import BolaCell from "/assets/images/bola-cell.svg";
import { ReservationsService, MarinasService } from '../../client';
import { useMarina } from '../../context/MarinaContext';
import PopupFreeCell from './PopupFreeCell';
import PopupReserved from './ServiceView/Services';
import BoatCell, { getCellColor } from './BoatCell';

// Функция для преобразования S3 URL
const transformS3Url = (url: string): string => {
    if (!url) return '';

    if (url.startsWith('s3://')) {
        const path = url.substring(5);
        const parts = path.split('/');
        const bucket = parts[0];
        const key = parts.slice(1).join('/');
        return `https://s3.amazonaws.com/${bucket}/${key}`;
    }

    return url;
};

interface Row {
    id: string;
    label: string;
    marina?: {
        logo_url: string | null;
    };
}

export interface Boat {
    id: string;
    name: string;
    code: string;
    startDay: string;
    endDay: string;
    startTime?: string;
    endTime?: string;
    marina_id?: string;
    registration_image_url?: string;
    vessel_type?: string;
    service_requests?: Array<{
        is_completed: boolean;
    }>;
    is_completed?: boolean;
    rawStartTime: string;
    rawEndTime: string;
    startsInSecondHalf: boolean;
    endsInFirstHalf: boolean;
    admin_status?: string;
    selectedTimeOfDay?: 'AM' | 'PM';
    displayTime?: string;
    startDateObj: Date;
    endDateObj: Date;
    startsInSecondHalfLocal: boolean;
    endsInFirstHalfLocal: boolean;
    startsBefore: boolean;
    endsAfter: boolean;
    effectiveStartDate: Date;
    effectiveEndDate: Date;
    user_first_name?: string;
    user_last_name?: string;
}

interface TableDayProps {
    currentDate: string;
    onReservationClick: (rowId: string, hour: string, boat?: Boat) => void;
}

const TableDay: React.FC<TableDayProps> = ({
    currentDate,
    onReservationClick,
}) => {
    const { selectedMarina } = useMarina();
    const [boats, setBoats] = useState<Boat[]>([]);
    const [allRows, setAllRows] = useState<Row[]>([]);
    const { isOpen: isFreeCellOpen, onClose: onFreeCellClose } = useDisclosure();
    const { isOpen: isReservedOpen, onClose: onReservedClose } = useDisclosure();
    const [selectedCell, setSelectedCell] = useState<{
        rowId: string;
        hour: string;
        halfHour?: 'first' | 'second';
        boat?: Boat;
    } | null>(null);
    const [currentTimeZone, setCurrentTimeZone] = useState<string>(
        Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    const queryClient = useQueryClient();


    const updateTimeZone = () => {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setCurrentTimeZone(timezone);
    };

    // Update hour handling logic
    // Generate hours array from 12 AM to 11 PM (24 hours)
    const hours = Array.from({ length: 24 }, (_, i) => {
        if (i === 0) return '12am'; // Midnight (12 AM)
        if (i === 12) return '12pm'; // Noon (12 PM)
        return i < 12 ? `${i}am` : `${i - 12}pm`;
    });

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Intl' in window) {
            updateTimeZone();
            window.addEventListener('languagechange', updateTimeZone);
            window.addEventListener('focus', updateTimeZone);
            const intervalId = setInterval(updateTimeZone, 60000);

            return () => {
                window.removeEventListener('languagechange', updateTimeZone);
                window.removeEventListener('focus', updateTimeZone);
                clearInterval(intervalId);
            };
        }
    }, []);

    useEffect(() => {
        if (boats.length > 0) {
            queryClient.invalidateQueries({ queryKey: ['mooringBalls'] });
            queryClient.invalidateQueries({ queryKey: ['reservations'] });
        }
    }, [currentTimeZone, queryClient, boats.length]);

    // Fetch mooring balls
    const { data: mooringBalls, isLoading: isLoadingMooringBalls } = useQuery({
        queryKey: ['mooringBalls', selectedMarina?.marina_id, currentTimeZone],
        queryFn: async () => {
            try {
                let result = { mooring_balls: [] as Array<any> };

                if (selectedMarina?.marina_id) {
                    const marinaData = await MarinasService.readMarina({ id: selectedMarina.marina_id });
                    if (marinaData.mooring_balls) result.mooring_balls = marinaData.mooring_balls;
                } else {
                    console.warn('No marina selected, skipping mooring balls request.');
                    return result;
                }
                return result;
            } catch (error) {
                console.error('Error fetching mooring balls:', error);
                throw error;
            }
        },
        enabled: !!selectedMarina?.marina_id && !!currentDate,
    });

    // Fetch reservations
    const { data: reservations, isLoading: isLoadingReservations, isError } = useQuery({
        queryKey: ['reservations', currentDate, selectedMarina?.marina_id, currentTimeZone],
        queryFn: () => ReservationsService.readReservations({
            limit: 500,
            marinaId: selectedMarina?.marina_id || undefined,
        }),
        enabled: !!currentDate,
    });

    // Process mooring balls
    useEffect(() => {
        if (mooringBalls?.mooring_balls) {
            const apiMooringBalls = mooringBalls.mooring_balls;
            let numberField = 'ball_number';
            if (apiMooringBalls[0] && !apiMooringBalls[0].ball_number) {
                if (apiMooringBalls[0].number) numberField = 'number';
                else if (apiMooringBalls[0].id) numberField = 'id';
            }

            const rows = apiMooringBalls
                .filter(ball => ball && ball[numberField])
                .map(ball => ({
                    id: ball[numberField].toString(),
                    label: ball[numberField].toString(),
                    marina: ball.marina
                }))
                .sort((a, b) => parseInt(a.id) - parseInt(b.id));

            setAllRows(rows);
        }
    }, [mooringBalls]);

    // Process reservations
    useEffect(() => {
        if (reservations?.data && currentDate) {
            try {

                // Parse current date for day boundaries
                const [year, month, day] = currentDate.split('-').map(Number);

                // Create Date objects for current day boundaries using local time (not UTC)
                const currentDayStart = new Date(year, month - 1, day, 0, 0, 0);
                const currentDayEnd = new Date(year, month - 1, day, 23, 59, 59, 999);


                // Filter reservations that overlap with the current day
                const apiBoats = reservations.data
                    .filter(reservation => {
                        try {
                            // Get reservation start and end dates
                            const startDate = new Date(reservation.start_date.endsWith('Z') ? reservation.start_date : reservation.start_date + 'Z');
                            const endDate = new Date(reservation.end_date.endsWith('Z') ? reservation.end_date : reservation.end_date + 'Z');

                            // Check if reservation overlaps with current day
                            // A reservation overlaps with the day if:
                            // 1. It starts before the end of the day AND
                            // 2. It ends after the start of the day
                            const overlapsWithDay = (
                                startDate <= currentDayEnd &&
                                endDate >= currentDayStart
                            );
                            return overlapsWithDay;
                        } catch (error) {
                            console.error('Error checking reservation date:', error);
                            return false;
                        }
                    })
                    .map(reservation => {
                        try {
                            // Create Date objects for reservation boundaries
                            const startDate = new Date(reservation.start_date.endsWith('Z') ? reservation.start_date : reservation.start_date + 'Z');
                            const endDate = new Date(reservation.end_date.endsWith('Z') ? reservation.end_date : reservation.end_date + 'Z');

                            // For the current day view, determine effective start and end times
                            // If the reservation starts before this day, use the start of the day
                            // If the reservation ends after this day, use the end of the day
                            const effectiveStartTime = startDate < currentDayStart ? currentDayStart : startDate;
                            const effectiveEndTime = endDate > currentDayEnd ? currentDayEnd : endDate;

                            // Check if this reservation crosses day boundaries
                            const startsBefore = startDate < currentDayStart;
                            const endsAfter = endDate > currentDayEnd;

                            // To better handle reservations that cross days, let's add paddingZero function
                            const paddingZero = (num: number): string => {
                                return num < 10 ? `0${num}` : `${num}`;
                            };

                            // Then update the rawStartTime and rawEndTime generation:
                            // Format times for raw calculations (ensuring they're in 24h format with leading zeros)
                            const rawStartTime = `${paddingZero(effectiveStartTime.getHours())}:${paddingZero(effectiveStartTime.getMinutes())}`;
                            const rawEndTime = `${paddingZero(effectiveEndTime.getHours())}:${paddingZero(effectiveEndTime.getMinutes())}`;

                            return {
                                id: reservation.mooring_ball.ball_number.toString(),
                                name: reservation.boat?.boatname || 'N/A',
                                code: reservation.boat?.registration_number || 'N/A',
                                startDay: currentDate,
                                endDay: currentDate,
                                // Format times for display
                                startTime: effectiveStartTime.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                }),
                                endTime: effectiveEndTime.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                }),
                                // Raw times for cell calculations
                                rawStartTime,
                                rawEndTime,
                                marina_id: reservation.marina?.marina_id,
                                registration_image_url: (reservation.boat as any)?.registration_image_url,
                                vessel_type: reservation.boat?.vessel_type,
                                service_requests: reservation.service_requests,
                                is_completed: reservation.is_completed,
                                admin_status: reservation.admin_status,
                                // Store original dates (unclamped) for hover display
                                startDateObj: startDate,
                                endDateObj: endDate,
                                // Store effective dates (clamped to day) for cell display
                                effectiveStartDate: effectiveStartTime,
                                effectiveEndDate: effectiveEndTime,
                                // Calculate half-hour flags based on effective times
                                startsInSecondHalf: effectiveStartTime.getMinutes() >= 30,
                                endsInFirstHalf: effectiveEndTime.getMinutes() < 30,
                                startsInSecondHalfLocal: effectiveStartTime.getMinutes() >= 30,
                                endsInFirstHalfLocal: effectiveEndTime.getMinutes() < 30,
                                // Flags for multi-day handling
                                startsBefore,
                                endsAfter,
                                // Добавляем данные о пользователе
                                user_first_name: reservation.user?.first_name,
                                user_last_name: reservation.user?.last_name
                            };
                        } catch (error) {
                            console.error('Error processing reservation:', error);
                            return null;
                        }
                    })
                    .filter(Boolean) as Boat[];

                if (apiBoats.length === 0) {
                    console.log("No boats found for the selected date. Check API response and filtering logic.");
                }

                setBoats(apiBoats);
            } catch (error) {
                console.error('Error processing reservations:', error);
            }
        } else {
            console.log("No reservation data available or currentDate not set", {
                hasReservations: !!reservations?.data,
                currentDate
            });
        }
    }, [reservations, currentDate, currentTimeZone]);

    // Компонент для отображения содержимого ячейки с резервацией
    const renderBoatCell = (boat: Boat, textColor: string) => {
        return <BoatCell boat={boat} textColor={textColor} />;
    };

    const handleCellClick = (rowId: string, hour: string, halfHour?: 'first' | 'second', boat?: Boat) => {
        setSelectedCell({ rowId, hour, halfHour, boat });
        onReservationClick(rowId, hour, boat);
    };

    const isLoading = isLoadingMooringBalls || isLoadingReservations;

    if (isLoading) return (
        <Flex width="98%" m="auto" height="100vh" alignItems="center" justifyContent="center" bg="white" rounded='25px'>
            <Spinner size="xl" color="ui.main" />
        </Flex>
    );

    if (isError) return (
        <Center width="100vw" height="100vh" bg="white">
            <Text color="red.500" fontSize="xl">Error loading data</Text>
        </Center>
    );

    if (!currentDate) return (
        <Center width="100vw" height="100vh" bg="white">
            <Text fontSize="xl">Initializing calendar...</Text>
        </Center>
    );

    return (
        <Box display="flex" alignItems="flex-start" width="100%">
            <Box flex="1" overflowX="auto" sx={{
                '&:focus': { outline: 'none' },
                '&:focus-visible': { outline: 'none' },
                '*:focus': { outline: 'none' },
                '& table': {
                    tableLayout: 'fixed',
                    width: '100%',
                }
            }}>
                <Table variant="unstyled" width="100%">
                    <Thead>
                        <Tr>
                            <Th
                                w="105px"
                                p={1}
                                height="52px"
                                textAlign="center"
                                fontWeight="normal"
                                position="sticky"
                                left="0"
                                bg="white"
                                zIndex={2}
                            />
                            {hours.map((hour) => (
                                <Th
                                    key={`hour-${hour}`}
                                    p={1}
                                    height="52px"
                                    textAlign="center"
                                    fontWeight="normal"
                                    position="relative"
                                    colSpan={2} // Each hour spans 2 columns (30-min intervals)
                                >
                                    <Text color="basic.grey600" fontSize="14px" fontWeight="500">{hour}</Text>
                                </Th>
                            ))}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {allRows.map(row => {
                            // For each hour, we have two half-hour slots (0-29 min and 30-59 min)
                            const occupiedHalfHours = Array(hours.length * 2).fill(null);

                            // Mark occupied half-hours
                            hours.forEach((_hour, hourIndex) => {
                                const firstHalfIndex = hourIndex * 2;
                                const secondHalfIndex = hourIndex * 2 + 1;

                                // Convert hour index to 24-hour format hour (0-23)
                                let realHour: number;
                                if (hourIndex === 0) {
                                    realHour = 0; // 12 AM (midnight)
                                } else if (hourIndex === 12) {
                                    realHour = 12; // 12 PM (noon)
                                } else if (hourIndex < 12) {
                                    realHour = hourIndex; // 1am-11am
                                } else {
                                    realHour = hourIndex; // 1pm-11pm (already in 24-hour format: 13-23)
                                }


                                // Find boats for this hour and row
                                const boatsForHour = boats.filter(boat => {
                                    if (boat.id !== row.id) return false;

                                    // Parse the hour and minute from the raw times
                                    // Using padded format HH:MM for consistency
                                    const [boatStartHour, boatStartMinute] = boat.rawStartTime.split(':').map(Number);
                                    const [boatEndHour, boatEndMinute] = boat.rawEndTime.split(':').map(Number);

                                    // Calculate total minutes since midnight
                                    const boatStartMinutes = boatStartHour * 60 + boatStartMinute;
                                    const boatEndMinutes = boatEndHour * 60 + boatEndMinute;
                                    const hourStartMinutes = realHour * 60;
                                    const hourEndMinutes = (realHour + 1) * 60 - 1; // End at XX:59



                                    const spansHour = (
                                        (boatStartMinutes <= hourEndMinutes) && // Boat starts before or during this hour
                                        (boatEndMinutes >= hourStartMinutes)    // Boat ends after or during this hour
                                    );

                                    return spansHour;
                                });

                                // Check first half (0-29 min)
                                const firstHalfBoat = boatsForHour.find(boat => {
                                    // Parse times using consistent approach
                                    const [boatStartHour, boatStartMinute] = boat.rawStartTime.split(':').map(Number);
                                    const [boatEndHour, boatEndMinute] = boat.rawEndTime.split(':').map(Number);

                                    // Calculate minutes for first half-hour of this hour (XX:00 to XX:29)
                                    const boatStartMinutes = boatStartHour * 60 + boatStartMinute;
                                    const boatEndMinutes = boatEndHour * 60 + boatEndMinute;
                                    const halfHourStartMinutes = realHour * 60;
                                    const halfHourEndMinutes = realHour * 60 + 29;

                                    // For multi-day reservations that start before the current day
                                    if (boat.startsBefore && realHour === 0) {
                                        return true;
                                    }

                                    // There is overlap if:
                                    const spansFirstHalf = (
                                        (boatStartMinutes <= halfHourEndMinutes) &&
                                        (boatEndMinutes >= halfHourStartMinutes)
                                    );

                                    return spansFirstHalf;
                                });

                                // Check second half (30-59 min)
                                const secondHalfBoat = boatsForHour.find(boat => {
                                    // Parse times using consistent approach
                                    const [boatStartHour, boatStartMinute] = boat.rawStartTime.split(':').map(Number);
                                    const [boatEndHour, boatEndMinute] = boat.rawEndTime.split(':').map(Number);

                                    // Calculate minutes for second half-hour of this hour (XX:30 to XX:59)
                                    const boatStartMinutes = boatStartHour * 60 + boatStartMinute;
                                    const boatEndMinutes = boatEndHour * 60 + boatEndMinute;
                                    const halfHourStartMinutes = realHour * 60 + 30;
                                    const halfHourEndMinutes = realHour * 60 + 59;

                                    // For multi-day reservations that end after the current day
                                    if (boat.endsAfter && realHour === 23) {
                                        return true;
                                    }

                                    // There is overlap if:
                                    const spansSecondHalf = (
                                        (boatStartMinutes <= halfHourEndMinutes) &&
                                        (boatEndMinutes >= halfHourStartMinutes)
                                    );

                                    return spansSecondHalf;
                                });

                                // Set occupied half-hours
                                if (firstHalfBoat) {
                                    occupiedHalfHours[firstHalfIndex] = firstHalfBoat;
                                }

                                if (secondHalfBoat) {
                                    occupiedHalfHours[secondHalfIndex] = secondHalfBoat;
                                }
                            });

                            // Generate cells
                            const cells: JSX.Element[] = [];

                            // Process all half-hour slots
                            let halfHourIndex = 0;
                            while (halfHourIndex < occupiedHalfHours.length) {
                                const hourIndex = Math.floor(halfHourIndex / 2);
                                const hour = hours[hourIndex];
                                const isFirstHalf = halfHourIndex % 2 === 0;
                                const halfHour = isFirstHalf ? 'first' : 'second';
                                const boatForHalfHour = occupiedHalfHours[halfHourIndex];

                                if (!boatForHalfHour) {
                                    // Empty cell
                                    cells.push(
                                        <Td
                                            key={`empty-${row.id}-${hour}-${halfHour}`}
                                            height="52px"
                                            padding={0}
                                            position="relative"
                                            _hover={{
                                                bg: 'brand.primaryOrange26'
                                            }}
                                            cursor="pointer"
                                            onClick={() => handleCellClick(row.id, hour, halfHour)}
                                            borderRight={!isFirstHalf || hourIndex < hours.length - 1 ? "1px solid var(--chakra-colors-basic-grey100)" : "none"}
                                            borderTop="1px solid var(--chakra-colors-basic-grey100)"
                                        >
                                            <Box height="100%" width="100%" display="flex" alignItems="center" justifyContent="center" />
                                        </Td>
                                    );
                                    halfHourIndex++;
                                    continue;
                                }

                                // Determine consecutive half-hours with the same reservation
                                let halfHourColspan = 1;
                                let nextIndex = halfHourIndex + 1;

                                while (nextIndex < occupiedHalfHours.length) {
                                    const nextBoat = occupiedHalfHours[nextIndex];

                                    if (nextBoat &&
                                        boatForHalfHour.id === nextBoat.id &&
                                        boatForHalfHour.name === nextBoat.name &&
                                        // Make sure they are from the same reservation, by comparing raw start/end times
                                        boatForHalfHour.startDateObj.getTime() === nextBoat.startDateObj.getTime() &&
                                        boatForHalfHour.endDateObj.getTime() === nextBoat.endDateObj.getTime()) {
                                        halfHourColspan++;
                                        occupiedHalfHours[nextIndex] = null; // Mark as processed
                                        nextIndex++;
                                    } else {
                                        break;
                                    }
                                }

                                // Add debugging log for cell span
                                console.log(`Boat: ${boatForHalfHour.name}, Cell colspan: ${halfHourColspan}, Start: ${halfHourIndex}, End: ${halfHourIndex + halfHourColspan}`);

                                // Получаем время начала и конца резервации
                                const boatStartTime = boatForHalfHour.startDateObj;
                                const boatEndTime = boatForHalfHour.endDateObj;

                                // Получаем дату и время, соответствующие текущей ячейке
                                const [year, month, day] = currentDate.split('-').map(Number);

                                // Преобразуем индекс часа в реальный час (0 = 12am, 1 = 1am, ..., 12 = 12pm, ...)
                                let currentHourStart;
                                if (hourIndex === 0) {
                                    currentHourStart = 0; // 12 AM (полночь)
                                } else if (hourIndex === 12) {
                                    currentHourStart = 12; // 12 PM (полдень)
                                } else if (hourIndex < 12) {
                                    currentHourStart = hourIndex; // 1am-11am
                                } else {
                                    currentHourStart = hourIndex; // 1pm-11pm
                                }

                                // Создаем даты для начала и конца текущего часового блока
                                const cellStart = new Date(year, month - 1, day, currentHourStart, isFirstHalf ? 0 : 30);
                                const cellEnd = new Date(year, month - 1, day, currentHourStart, isFirstHalf ? 30 : 59);

                                // Проверяем, начинается ли резервация в этой ячейке
                                const isStartCell = boatStartTime >= cellStart && boatStartTime <= cellEnd;

                                // Проверяем, заканчивается ли резервация в этой ячейке (с учетом последующих ячеек)
                                const lastCellIndex = halfHourIndex + halfHourColspan - 1;
                                const lastHourIndex = Math.floor(lastCellIndex / 2);
                                const isLastHalfHour = lastCellIndex % 2 === 1; // 1 = second half, 0 = first half

                                // Преобразуем индекс последнего часа в реальный час
                                let lastCellHour;
                                if (lastHourIndex === 0) {
                                    lastCellHour = 0; // 12 AM
                                } else if (lastHourIndex === 12) {
                                    lastCellHour = 12; // 12 PM
                                } else if (lastHourIndex < 12) {
                                    lastCellHour = lastHourIndex; // 1am-11am
                                } else {
                                    lastCellHour = lastHourIndex; // 1pm-11pm
                                }

                                const lastCellStart = new Date(year, month - 1, day, lastCellHour, isLastHalfHour ? 30 : 0);
                                const lastCellEnd = new Date(year, month - 1, day, lastCellHour, isLastHalfHour ? 59 : 29);

                                const isEndCell = boatEndTime >= lastCellStart && boatEndTime <= lastCellEnd;

                                // Проверяем, является ли эта ячейка первой или последней в видимой области
                                const isFirstVisibleCell = halfHourIndex === 0;
                                const isLastVisibleCell = nextIndex >= occupiedHalfHours.length;

                                // Учитываем особые случаи - полностью внутридневные резервации
                                // Получаем начало и конец дня для сравнения
                                const dayStart = new Date(year, month - 1, day, 0, 0, 0);
                                const dayEnd = new Date(year, month - 1, day, 23, 59, 59);

                                // Проверяем, находится ли вся резервация внутри текущего дня
                                const isFullyContainedInDay = boatStartTime >= dayStart && boatEndTime <= dayEnd;

                                // Проверяем, является ли лодка началом или концом резервации в принципе (не только в этой ячейке)
                                const isFirstCellOfReservation = Math.abs(boatStartTime.getTime() - boatForHalfHour.startDateObj.getTime()) < 60000;
                                const isLastCellOfReservation = Math.abs(boatEndTime.getTime() - boatForHalfHour.endDateObj.getTime()) < 60000;

                                console.log("Debug info:", {
                                    boat: boatForHalfHour.name,
                                    hourIndex,
                                    isFirstHalf,
                                    isStartCell,
                                    isEndCell,
                                    isFirstVisibleCell,
                                    isLastVisibleCell,
                                    isFullyContainedInDay,
                                    isFirstCellOfReservation,
                                    isLastCellOfReservation,
                                    halfHourColspan
                                });

                                // Определяем скругление для разных случаев:
                                let borderRadius = "1000px"; // По умолчанию полное скругление

                                // Use the new properties directly
                                if (boatForHalfHour.startsBefore && boatForHalfHour.endsAfter) {
                                    // Reservation spans the entire day, both edges straight
                                    borderRadius = "0px";
                                } else if (boatForHalfHour.startsBefore) {
                                    // Left edge straight (reservation continues from previous day)
                                    borderRadius = "0px 1000px 1000px 0px";
                                } else if (boatForHalfHour.endsAfter) {
                                    // Right edge straight (reservation continues to next day)
                                    borderRadius = "1000px 0px 0px 1000px";
                                }

                                console.log(`Applied borderRadius for ${boatForHalfHour.name}: ${borderRadius}, startsBefore: ${boatForHalfHour.startsBefore}, endsAfter: ${boatForHalfHour.endsAfter}`);

                                const textColor = getCellColor(boatForHalfHour).textColor;

                                    cells.push(
                                        <Td
                                            height="52px"
                                            key={`boat-${row.id}-${hour}-${boatForHalfHour.id}-${halfHour}-${currentDate}`}
                                            color={textColor}
                                            colSpan={halfHourColspan}
                                            p={0}
                                            textAlign="center"
                                            onClick={() => handleCellClick(row.id, hour, halfHour, boatForHalfHour)}
                                            cursor="pointer"
                                            className={selectedCell?.boat?.id === boatForHalfHour.id ? 'selected-cell' : ''}
                                            borderRight={hourIndex < hours.length - 1 && (halfHourIndex + halfHourColspan) % 2 === 0 ? "1px solid var(--chakra-colors-basic-grey100)" : "none"}
                                            borderTop="1px solid var(--chakra-colors-basic-grey100)"
                                            data-boat-id={boatForHalfHour.id}
                                            data-boat-name={boatForHalfHour.name}
                                            data-boat-code={boatForHalfHour.code}
                                            data-day={currentDate}
                                            data-hour={hour}
                                            sx={{
                                                overflow: "hidden",
                                            }}
                                        >
                                            <Flex
                                                height="44px"
                                                width="calc(100% - 4px)"
                                                margin="0 2px"
                                                alignItems="center"
                                                justifyContent="center"
                                                bg={getCellColor(boatForHalfHour).bg}
                                                borderRadius={borderRadius}
                                                className="boat-cell-container"
                                                data-boat-id={boatForHalfHour.id}
                                            >
                                                {renderBoatCell(boatForHalfHour, textColor)}
                                            </Flex>
                                        </Td>
                                    );

                                halfHourIndex += halfHourColspan;
                                }

                            return (
                                <Tr key={`row-${row.id}`} height="52px">
                                    <Td
                                        height="52px"
                                        p={0}
                                        position="sticky"
                                        left="0"
                                        bg="white"
                                        zIndex={1}
                                        borderRight="1px solid var(--chakra-colors-basic-grey100)"
                                        borderTop="1px solid var(--chakra-colors-basic-grey100)"
                                    >
                                        <Flex
                                            height="44px"
                                            alignItems="center"
                                            justifyContent="flex-start"
                                            gap="8px"
                                            padding="16px"
                                        >
                                            <Image
                                                w="24px"
                                                h="24px"
                                                src={row.marina?.logo_url ? transformS3Url(row.marina.logo_url) : BolaCell}
                                                alt="Bola"
                                            />
                                            <Text
                                                fontSize="16px"
                                                lineHeight="24px"
                                                textOverflow="ellipsis"
                                                whiteSpace="nowrap"
                                                overflow="hidden"
                                                flex="1"
                                                color="basic.grey900"
                                                fontWeight="500"
                                            >
                                                {row.label}
                                            </Text>
                                        </Flex>
                                    </Td>
                                    {cells}
                                </Tr>
                            );
                        })}
                    </Tbody>
                </Table>
            </Box>
            {selectedCell && (
                <>
                    <PopupFreeCell
                        isOpen={isFreeCellOpen}
                        onClose={onFreeCellClose}
                        rowId={selectedCell.rowId}
                        day={currentDate}
                        timeOfDay={selectedCell.hour.includes('am') ? 'AM' : 'PM'}
                    />
                    <PopupReserved
                        isOpen={isReservedOpen}
                        onClose={onReservedClose}
                        rowId={selectedCell.rowId}
                        day={currentDate}
                        boat={selectedCell.boat}
                        timeOfDay={selectedCell.hour.includes('am') ? 'AM' : 'PM'}
                    />
                </>
            )}
        </Box>
    );
};

export default TableDay;
