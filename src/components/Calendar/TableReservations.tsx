import React, { useEffect, useState} from 'react';
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
    Button
} from '@chakra-ui/react';
import BolaCell from "/assets/images/bola-cell.svg";
import { ReservationsService, MarinasService } from '../../client';
import { useMarina } from '../../context/MarinaContext';
import PopupFreeCell from './PopupFreeCell';
import { ReservationExtenstion } from '../ReservationExtenstion';
import PopupReserved from '../ServicesPanel/Services';

interface Row {
    id: string;
    label: string;
}



interface TableReservationsProps {
    days: string[];
    cellWidth: string;
    renderHeader: (day: string) => React.ReactNode;
    renderBoatCell: (reservation: ReservationExtenstion, colspan: number, textColor: string) => React.ReactNode;
    currentDate: string;
    onReservationClick: (rowId: string, day: string, reservation?: ReservationExtenstion, timeOfDay?: 'AM' | 'PM') => void;
    isMonthView?: boolean;
}

export const getCellColor = (reservation: ReservationExtenstion): { bg: string; textColor: string } => {
    // Используем статусы из API через поле admin_status
    if (reservation.admin_status === 'require_action') {
        return { bg: "system-error", textColor: "white" }; // red - требует действия
    }

    if (reservation.admin_status === 'future_action') {
        return { bg: "system.warningYellow", textColor: "white" }; // yellow - будущее действие
    }

    if (reservation.admin_status === 'completed') {
        return { bg: "bg.success", textColor: "basic.grey700" }; // light green - завершено
    }

    // По умолчанию - нормальное состояние
    return { bg: "system.successGreen", textColor: "white" }; // green (default) - нормальное состояние
};

// Функция для создания опций запроса на получение швартовок
function getMooringBallsQueryOptions(marinaId: string | undefined, currentTimeZone: string) {
    return {
        queryKey: ['mooringBalls', marinaId, currentTimeZone],
        queryFn: async () => {
            try {
                let result = { mooring_balls: [] as Array<any> };

                if (marinaId) {
                    // Если выбрана марина, запрашиваем её данные напрямую
                    const marinaData = await MarinasService.readMarina({ id: marinaId });
                    if (marinaData.mooring_balls) result.mooring_balls = marinaData.mooring_balls;
                } else {
                    // Если марина не выбрана, просто возвращаем пустой список без запроса к API
                    console.warn('No marina selected, skipping mooring balls request.');
                }
                return result;
            } catch (error) {
                console.error('Error fetching mooring balls:', error);
                throw error;
            }
        },
        // Запрос активен только если марина выбрана
        enabled: !!marinaId,
    };
}

// Функция для создания опций запроса на получение резерваций
function getReservationsQueryOptions(currentDate: string, marinaId: string | undefined, currentTimeZone: string) {
    return {
        queryKey: ['reservations', currentDate, marinaId, currentTimeZone],
        queryFn: () => ReservationsService.readReservations({
            limit: 500,
            marinaId: marinaId || undefined,
        }),
        enabled: !!currentDate,
        staleTime: 60000, // Данные считаются актуальными в течение 1 минуты
        refetchOnWindowFocus: true, // Перезапрашивать данные при фокусе окна
    };
}

const TableReservations: React.FC<TableReservationsProps> = ({
    days,
    renderHeader,
    renderBoatCell,
    currentDate,
    onReservationClick,
    isMonthView,
}) => {
    const { selectedMarina } = useMarina();
    const [reservations, setReservations] = useState<ReservationExtenstion[]>([]);
    const [allRows, setAllRows] = useState<Row[]>([]);
    const { isOpen: isFreeCellOpen, onClose: onFreeCellClose } = useDisclosure();
    const { isOpen: isReservedOpen, onClose: onReservedClose } = useDisclosure();
    const [selectedCell, setSelectedCell] = useState<{
        rowId: string;
        day: string;
        reservation?: ReservationExtenstion;
        timeOfDay?: 'AM' | 'PM';
    } | null>(null);
    // Добавляем состояние для отслеживания текущей временной зоны
    const [currentTimeZone, setCurrentTimeZone] = useState<string>(
        Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    // Добавляем queryClient для инвалидации запросов
    const queryClient = useQueryClient();

    // Функция для обновления временной зоны
    const updateTimeZone = () => {
        setCurrentTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    };

    // Эффект для отслеживания изменений временной зоны
    useEffect(() => {
        // Проверяем доступность API Intl
        if (typeof window !== 'undefined' && 'Intl' in window) {
            // Обновляем при загрузке
            updateTimeZone();

            // В идеале нужно слушать событие изменения временной зоны,
            // но такого стандартного события нет. Вместо этого,
            // мы можем отслеживать другие события, которые могут
            // указывать на изменение временной зоны.

            // Слушаем событие изменения языка
            window.addEventListener('languagechange', updateTimeZone);

            // Слушаем события фокуса/расфокуса окна
            window.addEventListener('focus', updateTimeZone);

            // Периодически проверяем временную зону
            const intervalId = setInterval(updateTimeZone, 60000); // каждую минуту

            // Очистка при размонтировании
            return () => {
                window.removeEventListener('languagechange', updateTimeZone);
                window.removeEventListener('focus', updateTimeZone);
                clearInterval(intervalId);
            };
        }
    }, []);

    // Запрос швартовок с использованием TanStack Query и созданных опций
    const {
        data: mooringBalls,
        isLoading: isLoadingMooringBalls,
        isFetching: isFetchingMooringBalls,
    } = useQuery(getMooringBallsQueryOptions(selectedMarina?.marina_id, currentTimeZone));

    // Запрос резерваций с использованием TanStack Query и созданных опций
    const {
        data: dataReservations,
        isLoading: isLoadingReservations,
        isFetching: isFetchingReservations,
        isError,
    } = useQuery(getReservationsQueryOptions(currentDate, selectedMarina?.marina_id, currentTimeZone));

    // Перезагружаем данные при изменении временной зоны
    useEffect(() => {
        if (reservations.length > 0) {
            // Принудительно инвалидируем кэш для обновления данных
            queryClient.invalidateQueries({ queryKey: ['mooringBalls'] });
            queryClient.invalidateQueries({ queryKey: ['reservations'] });
        }
    }, [currentTimeZone, queryClient, reservations.length]);

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
                }))
                .sort((a, b) => parseInt(a.id) - parseInt(b.id));
            setAllRows(rows);
        }
    }, [mooringBalls]);

    // Обработка резерваций (общая логика)
    useEffect(() => {
        if (dataReservations?.data && days.length > 0) {
            try {
                // Создаем диапазон дат в локальной временной зоне
                const [startYear, startMonth, startDay] = days[0].split('-').map(Number);
                const periodStartDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0);

                const [endYear, endMonth, endDay] = days[days.length - 1].split('-').map(Number);
                const periodEndDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59);

                const apiBoats = dataReservations.data
                    .filter(reservation => {
                        try {
                            // Создаем даты из строк ISO 8601 (они приходят в UTC из API)
                            const resStartStr = reservation.start_date;
                            const resEndStr = reservation.end_date;

                            // Парсим строки дат - они будут автоматически преобразованы в локальное время
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
                            // Получаем даты из API (они в UTC)
                            const startDateUTC = new Date(reservation.start_date.endsWith('Z') ? reservation.start_date : reservation.start_date + 'Z');
                            const endDateUTC = new Date(reservation.end_date.endsWith('Z') ? reservation.end_date : reservation.end_date + 'Z');

                            // Создаем строки с датами в локальном формате для внутренних расчетов
                            const formatLocalDate = (date: Date) => {
                                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                            };
                            // Используем локальное время для всей таблицы
                            const r: ReservationExtenstion =  {
                                ...reservation,
                                startDay: formatLocalDate(startDateUTC),
                                endDay: formatLocalDate(endDateUTC),
                                // Сохраняем время в локальном формате с учетом AM/PM
                                startTime: startDateUTC.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                                endTime: endDateUTC.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                                // Дополнительные поля для более точного определения
                                rawStartTime: startDateUTC.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false }),
                                rawEndTime: endDateUTC.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false }),
                                // ИСПОЛЬЗУЕМ ЛОКАЛЬНОЕ ВРЕМЯ для размещения в таблице
                                startsInSecondHalf: startDateUTC.getHours() >= 12,
                                endsInFirstHalf: endDateUTC.getHours() < 12,
                                // Сохраняем локальные значения
                                startsInSecondHalfLocal: startDateUTC.getHours() >= 12,
                                endsInFirstHalfLocal: endDateUTC.getHours() < 12,
                                startDateObj: startDateUTC,
                                endDateObj: endDateUTC,
                                startsBefore: startDateUTC < periodStartDate,
                                endsAfter: endDateUTC > periodEndDate,
                                effectiveStartDate: startDateUTC < periodStartDate ? startDateUTC : undefined,
                                effectiveEndDate: endDateUTC > periodEndDate ? endDateUTC : undefined,
                            };
                            return r;
                        } catch (error) {
                            console.error('Error processing reservation:', reservation);
                            return null;
                        }
                    })
                    .filter(Boolean) as ReservationExtenstion[];

                    setReservations(apiBoats);
            } catch (error) {
                console.error('Error processing reservations:', error);
            }
        }
    }, [dataReservations, days, currentTimeZone]);

    const handleCellClick = (rowId: string, day: string, reservation?: ReservationExtenstion, timeOfDay?: 'AM' | 'PM') => {
        // Добавляем timeOfDay в объект лодки, если он передан
        if (reservation && timeOfDay) {
            // Создаем обогащенный объект лодки с явным указанием времени дня
            const enrichedBoat = {
                ...reservation,
                selectedTimeOfDay: timeOfDay,
                displayTime: timeOfDay === 'AM' ?
                    `${reservation.startTime} (AM)` :
                    `${reservation.endTime} (PM)`
            };
            setSelectedCell({ rowId, day, reservation: enrichedBoat, timeOfDay });
            onReservationClick(rowId, day, enrichedBoat, timeOfDay);
        } else {
            setSelectedCell({ rowId, day, reservation, timeOfDay });
            onReservationClick(rowId, day, reservation, timeOfDay);
        }
    };

    // Функция для локализованного отображения дня недели
    const getLocalizedDayOfWeek = (dateString: string) => {
        const [year, month, day] = dateString.split('-').map(Number);

        // Создаем дату в локальной временной зоне
        const date = new Date(year, month - 1, day);

        return date.toLocaleDateString(undefined, { weekday: 'short' });
    };

    // Функция для локализованного отображения дня и месяца
    const getLocalizedDate = (dateString: string) => {
        try {
            const [year, month, day] = dateString.split('-').map(Number);
            const date = new Date(year, month - 1, day);

            // Format the date in a localized way based on timezone
            const formattedDate = date.toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'numeric',
            });

            return formattedDate;
        } catch (e) {
            console.error('Error formatting date:', e);
            return dateString;
        }
    };

    // Добавим отладочное сообщение для контроля временной зоны
    useEffect(() => {
        console.log('Current timezone:', currentTimeZone);
        console.log('Current date format:', new Date().toLocaleString());
        console.log('Browser timezone offset:', new Date().getTimezoneOffset() / 60);
    }, [currentTimeZone]);

    // Функция-обертка для renderHeader, которая учитывает локальную временную зону
    const localizedRenderHeader = (day: string) => {
        // Если пользовательская функция renderHeader предоставлена, используем ее,
        // но передаем дополнительные данные о локализованной дате
        if (typeof renderHeader === 'function') {
            return renderHeader(day);
        }

        // Базовый рендеринг, если пользовательская функция не предоставлена
        return (
            <Flex direction="column" alignItems="center">
                <Text fontWeight="bold">{getLocalizedDayOfWeek(day)}</Text>
                <Text>{getLocalizedDate(day)}</Text>
            </Flex>
        );
    };

    // Определяем состояние загрузки и ошибки
    const isLoading = isLoadingMooringBalls || isLoadingReservations;
    const isFetching = isFetchingMooringBalls || isFetchingReservations;

    // Показываем индикатор загрузки при первоначальной загрузке данных
    if (isLoading) return (
        <Flex width="98%" m="auto" height="100vh" alignItems="center" justifyContent="center" bg="white" rounded='25px'>
            <Spinner size="xl" color="ui.main" />
        </Flex>
    );

    // Показываем ошибку, если запрос завершился ошибкой
    if (isError) return (
        <Center width="100%" height="100vh" bg="white">
            <Flex direction="column" alignItems="center">
                <Text color="red.500" fontSize="xl">Error loading data</Text>
                <Button
                    mt={4}
                    colorScheme="blue"
                    onClick={() => {
                        queryClient.invalidateQueries({ queryKey: ['reservations'] });
                        queryClient.invalidateQueries({ queryKey: ['mooringBalls'] });
                    }}
                >
                    Retry
                </Button>
            </Flex>
        </Center>
    );

    // Проверяем наличие необходимых данных
    if (!currentDate || days.length === 0) return (
        <Center width="100%" height="100vh" bg="white">
            <Text fontSize="xl">Initializing calendar...</Text>
        </Center>
    );

    return (
        <Box display="flex" alignItems="flex-start" width="100%" position="relative">
            {/* Показываем оверлей при обновлении данных */}
            {isFetching && !isLoading && (
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="rgba(255, 255, 255, 0.5)"
                    zIndex={10}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Spinner size="md" color="ui.main" />
                </Box>
            )}

            <Box flex="1" overflowX="auto" sx={{
                '&:focus': { outline: 'none' },
                '&:focus-visible': { outline: 'none' },
                '*:focus': { outline: 'none' },
                '& table': {
                    tableLayout: 'fixed',
                    width: '100%',
                }
            }}>
                <Table className="reservation-table-body" variant="unstyled" width="100%">
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
                            {days.map((day, _) => (
                                <Th
                                    key={`date-${day}`}
                                    p={1}
                                    height="52px"
                                    textAlign="center"
                                    fontWeight="normal"
                                    colSpan={2} // Каждый день занимает 2 ячейки (AM и PM)
                                    position="relative" // Добавляем относительное позиционирование
                                    borderBottom="1px solid var(--chakra-colors-basic-grey100)"
                                    borderLeft="1px solid var(--chakra-colors-basic-grey100)"
                                >
                                    {localizedRenderHeader(day)}
                                </Th>
                            ))}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {
                        allRows.map(row => {
                            // Первый проход - отмечаем занятые дни и половины дней
                            // Изменяем массив с boolean на массив с 'AM' | 'PM' | 'FULL' | null
                            const occupiedHalfDays = Array(days.length * 2).fill(null);

                            days.forEach((day, dayIndex) => {
                                const amIndex = dayIndex * 2;
                                const pmIndex = dayIndex * 2 + 1;

                                if (occupiedHalfDays[amIndex] !== null && occupiedHalfDays[pmIndex] !== null) return;

                                // Находим все лодки для этого дня и стойки
                                const dayBoats = reservations.filter(r => {
                                    try {
                                        // Преобразуем компоненты даты и создаем даты в локальной временной зоне
                                        const [curYear, curMonth, curDay] = day.split('-').map(Number);
                                        const currentDay = new Date(curYear, curMonth - 1, curDay);

                                        const [startYear, startMonth, startDay] = r.startDay.split('-').map(Number);
                                        const startDate = new Date(startYear, startMonth - 1, startDay);

                                        const [endYear, endMonth, endDay] = r.endDay.split('-').map(Number);
                                        const endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59);
                                        return r.mooring_ball.ball_number.toLocaleString() === row.id && currentDay >= startDate && currentDay <= endDate;
                                    } catch (error) {
                                        return false;
                                    }
                                });

                                // Проверяем AM
                                const amBoat = dayBoats.find(b => {
                                    const isStartDay = b.startDay === day;
                                    // Если это день начала и лодка начинается после полудня (PM),
                                    // то не занимает AM
                                    if (isStartDay && b.startsInSecondHalf) {
                                        return false;
                                    }
                                    return true;
                                });

                                // Проверяем PM
                                const pmBoat = dayBoats.find(b => {
                                    const isEndDay = b.endDay === day;
                                    // Если это день окончания и лодка заканчивается до полудня (AM),
                                    // то не занимает PM
                                    if (isEndDay && b.endsInFirstHalf) {
                                        return false;
                                    }
                                    return true;
                                });

                                // Отмечаем занятые половины дня
                                if (amBoat) {
                                    occupiedHalfDays[amIndex] = amBoat;
                                }
                                if (pmBoat) {
                                    occupiedHalfDays[pmIndex] = pmBoat;
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
                                const boatMatch = occupiedHalfDays[halfDayIndex];

                                // Если половина дня не занята, добавляем пустую ячейку
                                if (boatMatch === null) {
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
                                            borderRight={!isAM && dayIndex < days.length - 1 ? "1px solid var(--chakra-colors-basic-grey100)" : "none"}
                                            borderTop="1px solid var(--chakra-colors-basic-grey100)"
                                        >
                                            <Box height="100%" width="100%" display="flex" alignItems="center" justifyContent="center" />
                                        </Td>
                                    );
                                    halfDayIndex++;
                                    continue;
                                }

                                // Определяем, сколько последовательных половин дней занимает эта резервация
                                let halfDayColspan = 1;
                                let nextIndex = halfDayIndex + 1;

                                // Ищем последовательные ячейки той же резервации
                                while (nextIndex < occupiedHalfDays.length) {
                                    const nextBoat = occupiedHalfDays[nextIndex];

                                    // Проверяем, относится ли следующая ячейка к той же резервации
                                    // Сравниваем ID, имя, дату начала и окончания
                                    if (nextBoat &&
                                        boatMatch.reservation_id === nextBoat.reservation_id &&
                                        boatMatch.mooring_ball_id === nextBoat.mooring_ball_id &&
                                        boatMatch.name === nextBoat.name &&
                                        boatMatch.startDay === nextBoat.startDay &&
                                        boatMatch.endDay === nextBoat.endDay) {
                                        halfDayColspan++;
                                        occupiedHalfDays[nextIndex] = null; // Отмечаем как обработанную
                                        nextIndex++;
                                    } else {
                                        // Как только нашли другую резервацию или пустую ячейку, останавливаемся
                                        break;
                                    }
                                }

                                // Определяем границы для резервации
                                const isFirstDayOfWeek = dayIndex === 0;
                                const isLastDayOfWeek = Math.floor((halfDayIndex + halfDayColspan - 1) / 2) === days.length - 1;
                                const isStartDay = boatMatch.startDay === day;
                                const isEndDay = boatMatch.endDay === days[Math.floor((halfDayIndex + halfDayColspan - 1) / 2)];

                                // Проверка границ видимого периода
                                const [firstDay, firstMonth, firstYear] = days[0].split('-').map(Number);
                                const firstVisibleDay = new Date(firstYear, firstMonth - 1, firstDay);

                                const [lastDay, lastMonth, lastYear] = days[days.length - 1].split('-').map(Number);
                                const lastVisibleDay = new Date(lastYear, lastMonth - 1, lastDay, 23, 59, 59);

                                const [boatStartDay, boatStartMonth, boatStartYear] = boatMatch.startDay.split('-').map(Number);
                                const boatStartDate = new Date(boatStartYear, boatStartMonth - 1, boatStartDay);

                                const [boatEndDay, boatEndMonth, boatEndYear] = boatMatch.endDay.split('-').map(Number);
                                const boatEndDate = new Date(boatEndYear, boatEndMonth - 1, boatEndDay, 23, 59, 59);

                                const startsBeforeVisiblePeriod = boatStartDate < firstVisibleDay;
                                const endsAfterVisiblePeriod = boatEndDate > lastVisibleDay;

                                const isSelected = selectedCell?.rowId === row.id && selectedCell?.day === day;

                                // Определяем нужно ли скруглять каждый из краев
                                let needsLeftRadius = false;
                                let needsRightRadius = false;

                                // Левый край скруглен, если:
                                // 1. Это первый день видимого периода и резервация не начинается раньше
                                // 2. Или это день начала резервации и:
                                //    - для AM: всегда
                                //    - для PM: только если резервация начинается после полудня
                                needsLeftRadius = (isFirstDayOfWeek && !startsBeforeVisiblePeriod) ||
                                                (isStartDay && (isAM || boatMatch.startsInSecondHalf));

                                // Правый край скруглен, если:
                                // 1. Это последний день видимого периода и резервация не продолжается дальше
                                // 2. Или это день окончания резервации и:
                                //    - для AM: только если резервация заканчивается до полудня
                                //    - для PM: всегда
                                const lastHalfDay = (halfDayIndex + halfDayColspan - 1) % 2 === 0; // Последняя часть - AM
                                needsRightRadius = (isLastDayOfWeek && !endsAfterVisiblePeriod) ||
                                                 (isEndDay && ((!lastHalfDay) || boatMatch.endsInFirstHalf));

                                // For month view - straight edges at month boundaries
                                if (isMonthView) {
                                    // If this is the first day of the month and the reservation starts in the previous month - straight left edge
                                    if (isFirstDayOfWeek) {
                                        // Get the day of the month for the first day in the visible period
                                        const [, , firstDayOfMonth] = days[0].split('-').map(Number);
                                        
                                        // If this is the first day of the month (1st) and the reservation started earlier
                                        if (firstDayOfMonth === 1 && startsBeforeVisiblePeriod) {
                                            needsLeftRadius = false;
                                            console.log('Detected reservation starting in previous month:', boatMatch);
                                        }
                                    }
                                    
                                    // If this is the last day of the month and the reservation continues in the next month - straight right edge
                                    if (isLastDayOfWeek) {
                                        const [year, month, lastDayOfMonth] = days[days.length - 1].split('-').map(Number);
                                        
                                        // Correct determination of the last day of the current month
                                        // Months in JavaScript are indexed from 0, so for April we use month=4
                                        const lastDayInMonth = new Date(year, month, 0).getDate();
                                        
                                        console.log('Checking last day of month:', {
                                            year,
                                            month,
                                            currentDay: lastDayOfMonth,
                                            lastDayOfMonth: lastDayInMonth,
                                            continuesBeyond: endsAfterVisiblePeriod,
                                            boat: boatMatch.name,
                                            start: boatMatch.startDay,
                                            end: boatMatch.endDay
                                        });
                                        
                                        // For April (month 4 in our case) the last day is 30
                                        if (lastDayOfMonth === lastDayInMonth && endsAfterVisiblePeriod) {
                                            needsRightRadius = false;
                                            console.log('Detected reservation continuing to next month:', boatMatch);
                                        }
                                    }
                                }

                                // Debug for the specific case of April-May
                                const startMonth = parseInt(boatMatch.startDay.split('-')[1]);
                                const endMonth = parseInt(boatMatch.endDay.split('-')[1]);

                                if (isMonthView) {
                                    // If current day is April 30 and the reservation continues into May
                                    if (day.endsWith('-04-30') && endMonth === 5) {
                                        needsRightRadius = false;
                                        console.log('Applied special rule for April 30:', boatMatch);
                                    }
                                    
                                    // If current day is May 1 and the reservation started in April
                                    if (day.endsWith('-05-01') && startMonth === 4) {
                                        needsLeftRadius = false;
                                        console.log('Applied special rule for May 1:', boatMatch);
                                    }
                                }

                                // Определяем итоговый borderRadius
                                let borderRadius = "0";
                                if (needsLeftRadius && needsRightRadius) {
                                    borderRadius = "1000px";
                                } else if (needsLeftRadius) {
                                    borderRadius = "1000px 0 0 1000px";
                                } else if (needsRightRadius) {
                                    borderRadius = "0 1000px 1000px 0";
                                }

                                cells.push(
                                    <Td
                                        height="52px"
                                        key={`boat-${row.id}-${day}-${boatMatch.id}-${timeOfDay}`}
                                        color={getCellColor(boatMatch).textColor}
                                        colSpan={halfDayColspan}
                                        p={0}
                                        textAlign="center"
                                        onClick={() => handleCellClick(row.id, day, boatMatch, timeOfDay)}
                                        cursor="pointer"
                                        className={isSelected ? 'selected-cell' : ''}
                                        borderRight={dayIndex < days.length - 1 && (halfDayIndex + halfDayColspan) % 2 === 0 ? "1px solid var(--chakra-colors-basic-grey100)" : "none"}
                                        borderTop="1px solid var(--chakra-colors-basic-grey100)"
                                        data-boat-id={boatMatch.id}
                                        data-mooring-ball-id={boatMatch.mooring_ball_id}
                                        data-boat-name={boatMatch.name}
                                        data-boat-code={boatMatch.code}
                                        sx={{
                                            overflow: "hidden",
                                            '&.selected-cell': {
                                                zIndex: 1000,
                                            }
                                        }}
                                    >
                                        <Flex
                                            height="44px"
                                            width="calc(100% - 4px)"
                                            margin="0 2px"
                                            alignItems="center"
                                            justifyContent="center"
                                            bg={getCellColor(boatMatch).bg}
                                            borderRadius={borderRadius}
                                            className="boat-cell-container"
                                            data-boat-id={boatMatch.id}
                                            data-mooring-ball-id={boatMatch.mooring_ball_id}
                                        >
                                            {/* Показываем информацию о лодке */}
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
                                                src={BolaCell}
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
                        day={selectedCell.day}
                        timeOfDay={selectedCell.timeOfDay}
                    />
                    <PopupReserved
                        isOpen={isReservedOpen}
                        onClose={onReservedClose}
                        rowId={selectedCell.rowId}
                        day={selectedCell.day}
                        reservation={selectedCell.reservation}
                        timeOfDay={selectedCell.timeOfDay}
                    />
                </>
            )}
        </Box>
    );
};

export default TableReservations;
