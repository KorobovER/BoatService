import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
    Td
} from '@chakra-ui/react';
import BollaCell from "../../../public/assets/images/bolla-cell.svg";
import { ReservationsService, MarinasService } from '../../client';
import { useMarina } from '../../context/MarinaContext';
import PopupFreeCell from './PopupFreeCell';
import PopupReserved from './PopupReserved';

// Функция для преобразования S3 URL
const transformS3Url = (url: string): string => {
    if (!url) return '';

    // Преобразование URL из формата s3://bola-public-assets/... 
    // в https://s3.amazonaws.com/bola-public-assets/...
    if (url.startsWith('s3://')) {
        const path = url.substring(5); // Убираем 's3://'
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
}

interface TableReservationsProps {
    days: string[];
    cellWidth: string;
    renderHeader: (day: string) => React.ReactNode;
    renderBoatCell: (boat: Boat, colspan: number, textColor: string) => React.ReactNode;
    currentDate: string;
    onReservationClick: (rowId: string, day: string, boat?: Boat, timeOfDay?: 'AM' | 'PM') => void;
    isMonthView?: boolean;
}

const TableReservations: React.FC<TableReservationsProps> = ({
    days,
    renderHeader,
    renderBoatCell,
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
        day: string;
        boat?: Boat;
        timeOfDay?: 'AM' | 'PM';
    } | null>(null);

    // Запрос швартовок (общий для обоих компонентов)
    const { data: mooringBalls, isLoading: isLoadingMooringBalls } = useQuery({
        queryKey: ['mooringBalls', selectedMarina?.marina_id],
        queryFn: async () => {
            try {
                let result = { mooring_balls: [] as Array<any> };

                if (selectedMarina?.marina_id) {
                    // Если выбрана марина, запрашиваем её данные напрямую
                    const marinaData = await MarinasService.readMarina({ id: selectedMarina.marina_id });
                    if (marinaData.mooring_balls) result.mooring_balls = marinaData.mooring_balls;
                } else {
                    // Если марина не выбрана, просто возвращаем пустой список без запроса к API
                    console.warn('No marina selected, skipping mooring balls request.');
                    return result;
                }
                return result;
            } catch (error) {
                console.error('Error fetching mooring balls:', error);
                throw error;
            }
        },
        // Запрос активен только если марина выбрана и есть текущая дата
        enabled: !!selectedMarina?.marina_id && !!currentDate,
    });

    // Запрос резерваций (общий для обоих компонентов)
    const { data: reservations, isLoading: isLoadingReservations, isError } = useQuery({
        queryKey: ['reservations', currentDate, selectedMarina?.marina_id],
        queryFn: () => ReservationsService.readReservations({
            limit: 500,
            marinaId: selectedMarina?.marina_id || undefined,
        }),
        enabled: !!currentDate,
    });

    // Debugging for days array
    useEffect(() => {
        console.log('TableReservations: days array changed:', days);
    }, [days]);

    // Обработка швартовок (общая логика)
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

    // Обработка резерваций (общая логика)
    useEffect(() => {
        if (reservations?.data && days.length > 0) {
            try {
                console.log('TableReservations: Processing reservations for days:', days);
                // Create date ranges using UTC to avoid timezone issues
                const [startYear, startMonth, startDay] = days[0].split('-').map(Number);
                const periodStartDate = new Date(Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0));

                const [endYear, endMonth, endDay] = days[days.length - 1].split('-').map(Number);
                const periodEndDate = new Date(Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59));

                const apiBoats = reservations.data
                    .filter(reservation => {
                        try {
                            // Convert reservation dates to UTC for consistent comparison
                            const resStartStr = reservation.start_date;
                            const resEndStr = reservation.end_date;

                            // Parse the date strings directly to UTC
                            const resStart = new Date(resStartStr);
                            const resEnd = new Date(resEndStr);

                            // Проверяем, если хотя бы часть резервации попадает в видимый период
                            // Резервация начинается до конца периода И заканчивается после начала периода
                            return resStart <= periodEndDate && resEnd >= periodStartDate;
                        } catch (error) {
                            console.error('Invalid date in reservation:', reservation);
                            return false;
                        }
                    })
                    .map(reservation => {
                        try {
                            const startDate = new Date(reservation.start_date);
                            const endDate = new Date(reservation.end_date);

                            // Additional check for debugging
                            const dateOptions = { hour: 'numeric', minute: 'numeric', hour12: false };
                            const rawStartTime = startDate.toLocaleTimeString('en-US', dateOptions as any);
                            const rawEndTime = endDate.toLocaleTimeString('en-US', dateOptions as any);

                            // Format dates as strings in YYYY-MM-DD format using UTC
                            const formatUTCDate = (date: Date) => {
                                return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
                            };

                            const boat = {
                                id: reservation.mooring_ball.ball_number.toString(),
                                name: reservation.boat?.boatname || 'N/A',
                                code: reservation.boat?.model || 'N/A',
                                startDay: formatUTCDate(startDate),
                                endDay: formatUTCDate(endDate),
                                startTime: `${String(startDate.getUTCHours()).padStart(2, '0')}:${String(startDate.getUTCMinutes()).padStart(2, '0')}`,
                                endTime: `${String(endDate.getUTCHours()).padStart(2, '0')}:${String(endDate.getUTCMinutes()).padStart(2, '0')}`,
                                // Add additional fields for more precise determination
                                rawStartTime,
                                rawEndTime,
                                startsInSecondHalf: startDate.getUTCHours() >= 12,
                                endsInFirstHalf: endDate.getUTCHours() < 12,
                                marina_id: reservation.marina?.marina_id,
                                registration_image_url: (reservation.boat as any)?.registration_image_url,
                                vessel_type: reservation.boat?.vessel_type,
                                service_requests: reservation.service_requests,
                                is_completed: reservation.is_completed,
                                admin_status: reservation.admin_status,
                            };
                            return boat;
                        } catch (error) {
                            console.error('Error processing reservation:', reservation);
                            return null;
                        }
                    })
                    .filter(Boolean) as Boat[];

                setBoats(apiBoats);
            } catch (error) {
                console.error('Error processing reservations:', error);
            }
        }
    }, [reservations, days]);

    const handleCellClick = (rowId: string, day: string, boat?: Boat, timeOfDay?: 'AM' | 'PM') => {
        setSelectedCell({ rowId, day, boat, timeOfDay });
        onReservationClick(rowId, day, boat, timeOfDay);
    };

    const getCellColor = (boat: Boat): { bg: string; textColor: string } => {
        // Используем статусы из API через поле admin_status
        if (boat.admin_status === 'require_action') {
            return { bg: "system-error", textColor: "white" }; // red - требует действия
        }
        
        if (boat.admin_status === 'future_action') {
            return { bg: "system.warningYellow", textColor: "white" }; // yellow - будущее действие
        }
        
        if (boat.admin_status === 'completed') {
            return { bg: "bg.success", textColor: "basic.grey700" }; // light green - завершено
        }
        
        // По умолчанию - нормальное состояние
        return { bg: "system.successGreen", textColor: "white" }; // green (default) - нормальное состояние
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

    if (!currentDate || days.length === 0) return (
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
                    borderSpacing: '0',
                    borderCollapse: 'collapse',
                    border: '1px solid var(--chakra-colors-basic-grey100)'
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
                                borderRight="1px solid var(--chakra-colors-basic-grey100)"
                                borderBottom="1px solid var(--chakra-colors-basic-grey100)"
                            />
                            {days.map((day, index) => (
                                <Th
                                    key={`date-${day}`}
                                    p={1}
                                    height="52px"
                                    textAlign="center"
                                    fontWeight="normal"
                                    colSpan={2} // Каждый день занимает 2 ячейки (AM и PM)
                                    position="relative" // Добавляем относительное позиционирование
                                    borderRight="1px solid var(--chakra-colors-basic-grey100)"
                                    borderBottom="1px solid var(--chakra-colors-basic-grey100)"
                                    borderTop="1px solid var(--chakra-colors-basic-grey100)"
                                    borderLeft={index === 0 ? "1px solid var(--chakra-colors-basic-grey100)" : "none"}
                                >
                                    {renderHeader(day)}
                                </Th>
                            ))}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {allRows.map(row => {
                            // Первый проход - отмечаем занятые дни и половины дней
                            // Изменяем массив с boolean на массив с 'AM' | 'PM' | 'FULL' | null
                            const occupiedHalfDays = Array(days.length * 2).fill(null);

                            days.forEach((day, dayIndex) => {
                                const amIndex = dayIndex * 2;
                                const pmIndex = dayIndex * 2 + 1;

                                if (occupiedHalfDays[amIndex] !== null && occupiedHalfDays[pmIndex] !== null) return;

                                const boatMatch = boats.find(b => {
                                    try {
                                        // Parse the date components and create UTC dates
                                        const [curYear, curMonth, curDay] = day.split('-').map(Number);
                                        const currentDay = new Date(Date.UTC(curYear, curMonth - 1, curDay));

                                        const [startYear, startMonth, startDay] = b.startDay.split('-').map(Number);
                                        const startDate = new Date(Date.UTC(startYear, startMonth - 1, startDay));

                                        const [endYear, endMonth, endDay] = b.endDay.split('-').map(Number);
                                        const endDate = new Date(Date.UTC(endYear, endMonth - 1, endDay));

                                        const isStartDay = b.startDay === day;
                                        const isEndDay = b.endDay === day;

                                        // Если это день начала и лодка начинается после полудня, 
                                        // то первая половина дня свободна
                                        if (isStartDay && b.startsInSecondHalf) {
                                            if (b.id === row.id) {
                                                return true; // Для отметки PM
                                            }
                                            return false;
                                        }

                                        // Если это день окончания и лодка заканчивается до полудня, 
                                        // то вторая половина дня свободна
                                        if (isEndDay && b.endsInFirstHalf) {
                                            if (b.id === row.id) {
                                                return true; // Для отметки AM
                                            }
                                            return false;
                                        }

                                        return b.id === row.id && currentDay >= startDate && currentDay <= endDate;
                                    } catch (error) {
                                        return false;
                                    }
                                });

                                if (boatMatch) {
                                    const isStartDay = boatMatch.startDay === day;
                                    const isEndDay = boatMatch.endDay === day;

                                    // Отмечаем занятые половины дня
                                    if (isStartDay && boatMatch.startsInSecondHalf) {
                                        // Если лодка начинается во второй половине дня, отмечаем только PM
                                        occupiedHalfDays[pmIndex] = 'PM';
                                    } else if (isEndDay && boatMatch.endsInFirstHalf) {
                                        // Если лодка заканчивается в первой половине дня, отмечаем только AM
                                        occupiedHalfDays[amIndex] = 'AM';
                                    } else {
                                        // Иначе отмечаем обе половины дня
                                        occupiedHalfDays[amIndex] = 'AM';
                                        occupiedHalfDays[pmIndex] = 'PM';
                                    }
                                }
                            });

                            // Готовим массив ячеек для строки
                            const cells: JSX.Element[] = [];

                            // Проходим по половинам дней
                            let halfDayIndex = 0;
                            while (halfDayIndex < occupiedHalfDays.length) {
                                const dayIndex = Math.floor(halfDayIndex / 2);
                                const day = days[dayIndex];
                                const isAM = halfDayIndex % 2 === 0;
                                const timeOfDay = isAM ? 'AM' : 'PM';

                                // Если половина дня не занята, добавляем пустую ячейку
                                if (occupiedHalfDays[halfDayIndex] === null) {
                                    cells.push(
                                        <Td
                                            key={`empty-${row.id}-${day}-${timeOfDay}`}
                                            height="52px"
                                            padding={0}
                                            position="relative"
                                            _hover={{
                                                bg: 'brand.primaryOrange26'
                                            }}
                                            cursor="pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCellClick(row.id, day, undefined, timeOfDay);
                                            }}
                                            borderRight={!isAM ? "1px solid var(--chakra-colors-basic-grey100)" : "none"}
                                            borderBottom="1px solid var(--chakra-colors-basic-grey100)"
                                        >
                                            <Box height="100%" width="100%" display="flex" alignItems="center" justifyContent="center" />
                                        </Td>
                                    );
                                    halfDayIndex++;
                                    continue;
                                }

                                // Ищем лодку для этой половины дня
                                const boatMatch = boats.find(b => {
                                    try {
                                        // Parse the date components and create UTC dates
                                        const [curYear, curMonth, curDay] = day.split('-').map(Number);
                                        const currentDay = new Date(Date.UTC(curYear, curMonth - 1, curDay));

                                        const [startYear, startMonth, startDay] = b.startDay.split('-').map(Number);
                                        const startDate = new Date(Date.UTC(startYear, startMonth - 1, startDay));

                                        const [endYear, endMonth, endDay] = b.endDay.split('-').map(Number);
                                        const endDate = new Date(Date.UTC(endYear, endMonth - 1, endDay));

                                        const isStartDay = b.startDay === day;
                                        const isEndDay = b.endDay === day;

                                        // Если это день начала и лодка начинается после полудня, 
                                        // то первая половина дня свободна
                                        if (isStartDay && b.startsInSecondHalf && isAM) {
                                            // Если это день начала, лодка начинается после полудня, и мы проверяем AM
                                            return false;
                                        }

                                        if (isEndDay && b.endsInFirstHalf && !isAM) {
                                            // Если это день окончания, лодка заканчивается до полудня, и мы проверяем PM
                                            return false;
                                        }

                                        return b.id === row.id && currentDay >= startDate && currentDay <= endDate;
                                    } catch (error) {
                                        return false;
                                    }
                                });

                                if (!boatMatch) {
                                    halfDayIndex++;
                                    continue;
                                }

                                // Определяем, сколько половин дней занимает эта резервация
                                let halfDayColspan = 1;
                                let currentHalfDayIndex = halfDayIndex;

                                while (currentHalfDayIndex + 1 < occupiedHalfDays.length) {
                                    const nextHalfDayIndex = currentHalfDayIndex + 1;
                                    const nextDayIndex = Math.floor(nextHalfDayIndex / 2);
                                    const nextDay = days[nextDayIndex];
                                    const nextIsAM = nextHalfDayIndex % 2 === 0;

                                    // Проверяем, принадлежит ли следующая половина дня той же резервации
                                    const belongsToSameReservation = boats.some(b => {
                                        if (b.id !== row.id) return false;

                                        // Parse the date components and create UTC dates
                                        const [nextDayYear, nextDayMonth, nextDayOfMonth] = nextDay.split('-').map(Number);
                                        const nextDayDate = new Date(Date.UTC(nextDayYear, nextDayMonth - 1, nextDayOfMonth));

                                        const [startYear, startMonth, startDay] = b.startDay.split('-').map(Number);
                                        const startDate = new Date(Date.UTC(startYear, startMonth - 1, startDay));

                                        const [endYear, endMonth, endDay] = b.endDay.split('-').map(Number);
                                        const endDate = new Date(Date.UTC(endYear, endMonth - 1, endDay));

                                        const isStartDay = b.startDay === nextDay;
                                        const isEndDay = b.endDay === nextDay;

                                        if (isStartDay && b.startsInSecondHalf && nextIsAM) {
                                            // Если это день начала, лодка начинается после полудня, и мы проверяем AM
                                            return false;
                                        }

                                        if (isEndDay && b.endsInFirstHalf && !nextIsAM) {
                                            // Если это день окончания, лодка заканчивается до полудня, и мы проверяем PM
                                            return false;
                                        }

                                        return nextDayDate >= startDate && nextDayDate <= endDate;
                                    });

                                    if (!belongsToSameReservation) break;

                                    halfDayColspan++;
                                    occupiedHalfDays[nextHalfDayIndex] = null; // Помечаем как обработанную
                                    currentHalfDayIndex++;
                                }

                                // Определяем границы этой резервации для стилей
                                const endHalfDayIndex = halfDayIndex + halfDayColspan - 1;

                                const isStartDay = boatMatch.startDay === day;
                                const isEndDay = boatMatch.endDay === days[Math.floor(endHalfDayIndex / 2)];

                                // Проверка границ видимого периода
                                const [firstDay, firstMonth, firstYear] = days[0].split('-').map(Number);
                                const firstVisibleDay = new Date(Date.UTC(firstYear, firstMonth - 1, firstDay));

                                const [lastDay, lastMonth, lastYear] = days[days.length - 1].split('-').map(Number);
                                const lastVisibleDay = new Date(Date.UTC(lastYear, lastMonth - 1, lastDay, 23, 59, 59));

                                const [boatStartDay, boatStartMonth, boatStartYear] = boatMatch.startDay.split('-').map(Number);
                                const boatStartDate = new Date(Date.UTC(boatStartYear, boatStartMonth - 1, boatStartDay));

                                const [boatEndDay, boatEndMonth, boatEndYear] = boatMatch.endDay.split('-').map(Number);
                                const boatEndDate = new Date(Date.UTC(boatEndYear, boatEndMonth - 1, boatEndDay, 23, 59, 59));

                                const startsBeforeVisiblePeriod = boatStartDate < firstVisibleDay;
                                const endsAfterVisiblePeriod = boatEndDate > lastVisibleDay;

                                const isSelected = selectedCell?.rowId === row.id && selectedCell?.day === day;

                                // Определяем, находится ли ячейка на границе недели (первый или последний день)
                                const isFirstDayOfWeek = dayIndex === 0;
                                const isLastDayOfWeek = dayIndex === days.length - 1;

                                // Определяем, нужно ли скруглять каждый из краев
                                let needsLeftRadius = true;  // По умолчанию скругляем
                                let needsRightRadius = true; // По умолчанию скругляем


                                // 1. Обработка левого края
                                if (isFirstDayOfWeek && startsBeforeVisiblePeriod) {
                                    // Плоский левый край только для первого дня недели, если резервация переходит с прошлой недели
                                    needsLeftRadius = false;
                                } else if (isStartDay && ((isAM && boatMatch.startsInSecondHalf) || (!isAM && !boatMatch.startsInSecondHalf))) {
                                    // Не скругляем внутренние границы полудня
                                    needsLeftRadius = false;
                                } else if (!isStartDay && !isFirstDayOfWeek) {
                                    // Для внутренних ячеек резервации (но не первый день недели)
                                    needsLeftRadius = false;
                                }

                                // 2. Обработка правого края
                                if (isLastDayOfWeek && endsAfterVisiblePeriod) {
                                    // Плоский правый край только для последнего дня недели, если резервация переходит на следующую неделю
                                    needsRightRadius = false;
                                } else if (isEndDay && ((!isAM && boatMatch.endsInFirstHalf) || (isAM && !boatMatch.endsInFirstHalf))) {
                                    // Не скругляем внутренние границы полудня
                                    needsRightRadius = false;
                                } else if (!isEndDay && !isLastDayOfWeek) {
                                    // Для внутренних ячеек резервации (но не последний день недели)
                                    needsRightRadius = false;
                                }

                                // 3. Обработка случая, когда резервация попадает на первый или последний день,
                                // но находится полностью внутри видимого периода (не переходит через границу недели)
                                if (isFirstDayOfWeek && isStartDay && !startsBeforeVisiblePeriod) {
                                    needsLeftRadius = true; // Скругляем левый край, так как это настоящее начало резервации
                                }

                                // Явно обеспечиваем скругление для правого края, если:
                                // 1. Это последний день видимого периода И конец резервации
                                // 2. ИЛИ это конец резервации внутри видимого периода
                                if ((isLastDayOfWeek && isEndDay && !endsAfterVisiblePeriod) ||
                                    (isEndDay && !endsAfterVisiblePeriod)) {
                                    needsRightRadius = true;
                                }

                                // Определяем итоговый borderRadius
                                let borderRadius = "0";
                                if (needsLeftRadius && needsRightRadius) {
                                    borderRadius = "30px";
                                } else if (needsLeftRadius) {
                                    borderRadius = "30px 0 0 30px";
                                } else if (needsRightRadius) {
                                    borderRadius = "0 30px 30px 0";
                                }

                                // Специальный случай для однодневных резерваций - всегда скругленные,
                                // кроме случаев, когда они на границе недели и переходят через неё
                                const isOnWeekBoundary = (isFirstDayOfWeek && startsBeforeVisiblePeriod) ||
                                    (isLastDayOfWeek && endsAfterVisiblePeriod);
                                if (halfDayColspan === 1 && isStartDay && isEndDay && !isOnWeekBoundary) {
                                    borderRadius = "30px";
                                }

                                // Добавляем ячейку для резервации
                                cells.push(
                                    <Td
                                        height="52px"
                                        key={`boat-${row.id}-${day}-${boatMatch.id}-${timeOfDay}`}
                                        color={getCellColor(boatMatch).textColor}
                                        colSpan={halfDayColspan}
                                        p="0px 2px"
                                        textAlign="center"
                                        onClick={() => handleCellClick(row.id, day, boatMatch, timeOfDay)}
                                        cursor="pointer"
                                        className={isSelected ? 'selected-cell' : ''}
                                        sx={{
                                            overflow: "hidden",
                                            '&.selected-cell': {
                                                zIndex: 1000,
                                            }
                                        }}
                                    >
                                        <Flex
                                            p="0px var(--md, 12px)"
                                            height="44px"
                                            width="100%"
                                            alignItems="center"
                                            justifyContent="center"
                                            bg={getCellColor(boatMatch).bg}
                                            borderRadius={borderRadius}
                                        >
                                            {/* Всегда показываем информацию о лодке */}
                                            {renderBoatCell(boatMatch, halfDayColspan / 2, getCellColor(boatMatch).textColor)}
                                        </Flex>
                                    </Td>
                                );

                                // Переходим к следующей необработанной половине дня
                                halfDayIndex += halfDayColspan;
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
                                        borderBottom="1px solid var(--chakra-colors-basic-grey100)"
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
                                                src={row.marina?.logo_url ? transformS3Url(row.marina.logo_url) : BollaCell}
                                                alt="Bolla"
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
                        day={selectedCell.day}
                        timeOfDay={selectedCell.timeOfDay}
                    />
                    <PopupReserved
                        isOpen={isReservedOpen}
                        onClose={onReservedClose}
                        rowId={selectedCell.rowId}
                        day={selectedCell.day}
                        boat={selectedCell.boat}
                        timeOfDay={selectedCell.timeOfDay}
                    />
                </>
            )}
        </Box>
    );
};

export default TableReservations;