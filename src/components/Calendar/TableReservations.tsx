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
import AddReservation from '../Reservations/AddReservation';
import BolaCell from "/assets/images/bola-cell.svg";
import { ReservationsService, MarinasService } from '../../client';
import { useMarina } from '../../context/MarinaContext';
import { ReservationExtenstion } from '../ReservationExtenstion';
import { getCellColor } from '../../utilsBola';

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
    isServiceOpen?: boolean; // Добавляем проп для отслеживания состояния компонента Service
}

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

const renderEdgeIcon = (reservation: ReservationExtenstion, isStart: boolean) => {
    const cellColor = getCellColor(reservation);

    return (
        <svg
            width="13"
            height="44"
            viewBox="0 0 13 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
                transform: (isStart && reservation.startsBefore) ? "rotate(180deg)" : "rotate(0deg)",
                transformOrigin: "center"
            }}
        >
            <path
                d="M4.02539 7.5L12.0254 0H0.0253906V44H12.0254L4.02539 36.5L12.0254 29.6629L4.02539 22L12.0254 13.8427L4.02539 7.5Z"
                fill={cellColor.bg}
            />
        </svg>
    );
};



export { renderEdgeIcon };

const TableReservations: React.FC<TableReservationsProps> = ({
    days,
    renderHeader,
    renderBoatCell,
    currentDate,
    onReservationClick,
    isMonthView,
    isServiceOpen = false, // По умолчанию компонент Service не открыт
}) => {
    const { selectedMarina } = useMarina();
    const [reservations, setReservations] = useState<ReservationExtenstion[]>([]);
    const [allRows, setAllRows] = useState<Row[]>([]);
    const reservedDisclosure = useDisclosure();
    const [selectedCell, setSelectedCell] = useState<{
        rowId: string;
        day: string;
        reservation?: ReservationExtenstion;
        timeOfDay?: 'AM' | 'PM';
    } | null>(null);
    // Add state for cell selection
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
    const [selectedEmptyCells, setSelectedEmptyCells] = useState<{
        rowId: string;
        day: string;
        timeOfDay: 'AM' | 'PM';
    }[]>([]);
    // Добавляем состояние для отслеживания строки, в которой началось выделение
    const [activeRowId, setActiveRowId] = useState<string | null>(null);
    // Добавляем состояние для управления модальным окном добавления резервации
    const [isAddReservationOpen, setIsAddReservationOpen] = useState<boolean>(false);
    // Добавляем состояние для отслеживания текущей временной зоны
    const [currentTimeZone, setCurrentTimeZone] = useState<string>(
        Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    // Добавляем queryClient для инвалидации запросов
    const queryClient = useQueryClient();

    // Define loading states
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isError, setIsError] = useState<boolean>(false);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    // Функция для обновления временной зоны
    const updateTimeZone = () => {
        setCurrentTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    };

    // Эффект для отслеживания изменений временной зоны
    useEffect(() => {
        // Проверяем доступность API Intl
        if (typeof window !== 'undefined' && 'Intl' in window) {
            updateTimeZone();
            window.addEventListener('focus', updateTimeZone);
            const intervalId = setInterval(updateTimeZone, 60000);
            return () => {
                window.removeEventListener('focus', updateTimeZone);
                clearInterval(intervalId);
            };
        }
    }, []);

    // Add event listener to handle mouse up outside the table - moved up to avoid conditional hooks
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            // Если компонент Service открыт, не обрабатываем события мыши
            if (isServiceOpen) return;
            
            if (isMouseDown) {
                setIsMouseDown(false);
                // Проверяем, были ли выбраны ячейки
                if (selectedEmptyCells.length > 0) {
                    // Открываем модальное окно добавления резервации
                    setIsAddReservationOpen(true);
                }
                // Сбрасываем активную строку при глобальном отпускании мыши
                setActiveRowId(null);
            }
        };

        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isMouseDown]);

    // Add handlers for mouse events - Moved these up before any hooks
    const handleMouseDown = (rowId: string, day: string, timeOfDay: 'AM' | 'PM', hasReservation: boolean) => {
        // Если компонент Service открыт, не обрабатываем события мыши
        if (isServiceOpen) return;
        
        if (!hasReservation) {
            setIsMouseDown(true);
            // Запоминаем строку, в которой началось выделение
            setActiveRowId(rowId);
            // Add the cell to selected cells
            setSelectedEmptyCells([{ rowId, day, timeOfDay }]);
        }
    };

    const handleMouseEnter = (rowId: string, day: string, timeOfDay: 'AM' | 'PM', hasReservation: boolean) => {
        // Если компонент Service открыт, не обрабатываем события мыши
        if (isServiceOpen) return;
        
        // Проверяем, что мышь нажата, ячейка не занята и находится в той же строке, где началось выделение
        if (isMouseDown && !hasReservation && rowId === activeRowId) {
            // Check if cell is already selected
            const isAlreadySelected = selectedEmptyCells.some(
                cell => cell.rowId === rowId && cell.day === day && cell.timeOfDay === timeOfDay
            );
            
            if (!isAlreadySelected) {
                setSelectedEmptyCells(prev => [...prev, { rowId, day, timeOfDay }]);
            }
        }
    };

    const handleMouseUp = () => {
        // Если компонент Service открыт, не обрабатываем события мыши
        if (isServiceOpen) return;
        
        setIsMouseDown(false);
        // Проверяем, были ли выбраны ячейки
        if (selectedEmptyCells.length > 0) {
            // Открываем модальное окно добавления резервации
            setIsAddReservationOpen(true);
        }
        // Сбрасываем активную строку при завершении выделения
        setActiveRowId(null);
    };
    
    // Обработчик закрытия модального окна добавления резервации
    const handleAddReservationClose = () => {
        setIsAddReservationOpen(false);
        // Очищаем выбранные ячейки после закрытия модального окна
        setSelectedEmptyCells([]);
    };

    // Function to check if a cell is selected
    const isCellSelected = (rowId: string, day: string, timeOfDay: 'AM' | 'PM') => {
        return selectedEmptyCells.some(
            cell => cell.rowId === rowId && cell.day === day && cell.timeOfDay === timeOfDay
        );
    };

    // Запрос швартовок с использованием TanStack Query и созданных опций
    const mooringBallsQuery = useQuery(getMooringBallsQueryOptions(selectedMarina?.marina_id, currentTimeZone));

    // Запрос резерваций с использованием TanStack Query и созданных опций
    const reservationsQuery = useQuery(getReservationsQueryOptions(currentDate, selectedMarina?.marina_id, currentTimeZone));

    // Update the loading states based on query results
    useEffect(() => {
        setIsLoading(mooringBallsQuery.isLoading || reservationsQuery.isLoading);
        setIsFetching(mooringBallsQuery.isFetching || reservationsQuery.isFetching);
        setIsError(reservationsQuery.isError);
    }, [
        mooringBallsQuery.isLoading, 
        reservationsQuery.isLoading,
        mooringBallsQuery.isFetching,
        reservationsQuery.isFetching,
        reservationsQuery.isError
    ]);

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
        if (mooringBallsQuery.data?.mooring_balls) {
            const apiMooringBalls = mooringBallsQuery.data.mooring_balls;
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
    }, [mooringBallsQuery.data]);

    // Обработка резерваций (общая логика)
    useEffect(() => {
        if (reservationsQuery.data?.data && days.length > 0) {
            try {
                // Создаем диапазон дат в локальной временной зоне
                const [startYear, startMonth, startDay] = days[0].split('-').map(Number);
                const periodStartDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0);

                const [endYear, endMonth, endDay] = days[days.length - 1].split('-').map(Number);
                const periodEndDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59);

                const apiBoats = reservationsQuery.data.data
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
                            const r: ReservationExtenstion = {
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
    }, [reservationsQuery.data, days, currentTimeZone]);

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
            reservedDisclosure.onOpen();
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

    // Prepare loading and error UI components
    const renderLoadingState = () => (
        <Flex width="98%" m="auto" height="100vh" alignItems="center" justifyContent="center" bg="white" rounded='25px'>
            <Spinner size="xl" color="ui.main" />
        </Flex>
    );

    const renderErrorState = () => (
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

    const renderInitializingState = () => (
        <Center width="100%" height="100vh" bg="white">
            <Text fontSize="xl">Initializing calendar...</Text>
        </Center>
    );

    // Main render
    if (isLoading) {
        return renderLoadingState();
    }

    if (isError) {
        return renderErrorState();
    }

    if (!currentDate || days.length === 0) {
        return renderInitializingState();
    }

    // Main component rendering
    return (
        <Box display="flex" alignItems="flex-start" width="100%" position="relative" minHeight="100vh" bg="white">
            {/* Модальное окно добавления резервации */}
            <AddReservation 
                isOpen={isAddReservationOpen} 
                onClose={handleAddReservationClose} 
                selectedCell={selectedEmptyCells.length > 0 ? {
                    rowId: selectedEmptyCells[0].rowId,
                    day: selectedEmptyCells[0].day,
                    endDay: selectedEmptyCells.length > 1 ? selectedEmptyCells[selectedEmptyCells.length - 1].day : selectedEmptyCells[0].day
                } : undefined}
            />
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
                                        const isSelected = isCellSelected(row.id, day, timeOfDay);
                                        
                                        // Check if we can merge adjacent selected cells
                                        if (isSelected) {
                                            // Start with one cell and check adjacent cells
                                            let emptyCellColspan = 1;
                                            let nextEmptyCellIndex = halfDayIndex + 1;

                                            // Check consecutive empty cells that are also selected
                                            while (nextEmptyCellIndex < occupiedHalfDays.length) {
                                                // If the next cell is occupied, stop
                                                if (occupiedHalfDays[nextEmptyCellIndex] !== null) {
                                                    break;
                                                }

                                                // Get the day and timeOfDay for the next cell
                                                const nextDayIndex = Math.floor(nextEmptyCellIndex / 2);
                                                const nextDay = days[nextDayIndex];
                                                const nextIsAM = nextEmptyCellIndex % 2 === 0;
                                                const nextTimeOfDay = nextIsAM ? 'AM' : 'PM';

                                                // Check if it's selected
                                                const isNextSelected = isCellSelected(row.id, nextDay, nextTimeOfDay);
                                                
                                                if (isNextSelected) {
                                                    emptyCellColspan++;
                                                    occupiedHalfDays[nextEmptyCellIndex] = 'processed'; // Mark as processed
                                                    nextEmptyCellIndex++;
                                                } else {
                                                    break;
                                                }
                                            }

                                            // Determine border radius for combined cells
                                            let borderRadius;
                                            if (emptyCellColspan === 1) {
                                                borderRadius = "1000px"; // Single cell is fully rounded
                                            } else {
                                                const isFirstCell = halfDayIndex === 0;
                                                const isLastCell = (halfDayIndex + emptyCellColspan) === occupiedHalfDays.length;
                                                
                                                if (isFirstCell && isLastCell) {
                                                    borderRadius = "1000px"; // Both ends rounded
                                                } else if (isFirstCell) {
                                                    borderRadius = "1000px 0 0 1000px"; // Left rounded
                                                } else if (isLastCell) {
                                                    borderRadius = "0 1000px 1000px 0"; // Right rounded
                                                } else if (emptyCellColspan > 1) {
                                                    borderRadius = "1000px"; // Multiple cells in the middle
                                                } else {
                                                    borderRadius = "1000px"; // Default
                                                }
                                            }

                                            cells.push(
                                                <Td
                                                    key={`empty-${row.id}-${day}-${timeOfDay}`}
                                                    height="52px"
                                                    padding={0}
                                                    position="relative"
                                                    colSpan={emptyCellColspan}
                                                    cursor="pointer"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault(); // Prevent text selection
                                                        handleMouseDown(row.id, day, timeOfDay, false);
                                                    }}
                                                    onMouseEnter={() => handleMouseEnter(row.id, day, timeOfDay, false)}
                                                    onMouseUp={handleMouseUp}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCellClick(row.id, day, undefined, timeOfDay);
                                                    }}
                                                    borderRight={!isAM && dayIndex < days.length - 1 ? "1px solid var(--chakra-colors-basic-grey100)" : "none"}
                                                    borderTop="1px solid var(--chakra-colors-basic-grey100)"
                                                    borderBottom={row.id === allRows[allRows.length - 1].id ? "1px solid var(--chakra-colors-basic-grey100)" : "none"}
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
                                                        bg={'basic.grey200'}
                                                        borderRadius={borderRadius}
                                                        className="empty-cell-container"
                                                    />
                                                </Td>
                                            );
                                            halfDayIndex += emptyCellColspan;
                                        } else {
                                            // Normal unselected empty cell
                                            cells.push(
                                                <Td
                                                    key={`empty-${row.id}-${day}-${timeOfDay}`}
                                                    height="52px"
                                                    padding={0}
                                                    position="relative"
                                                    cursor="pointer"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault(); // Prevent text selection
                                                        handleMouseDown(row.id, day, timeOfDay, false);
                                                    }}
                                                    onMouseEnter={() => handleMouseEnter(row.id, day, timeOfDay, false)}
                                                    onMouseUp={handleMouseUp}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCellClick(row.id, day, undefined, timeOfDay);
                                                    }}
                                                    borderRight={!isAM && dayIndex < days.length - 1 ? "1px solid var(--chakra-colors-basic-grey100)" : "none"}
                                                    borderTop="1px solid var(--chakra-colors-basic-grey100)"
                                                    borderBottom={row.id === allRows[allRows.length - 1].id ? "1px solid var(--chakra-colors-basic-grey100)" : "none"}
                                                    bg={'white'}
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
                                                        bg={'transparent'}
                                                        borderRadius="1000px"
                                                        className="empty-cell-container"
                                                    />
                                                </Td>
                                            );
                                            halfDayIndex++;
                                        }
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
                                            }
                                        }

                                        // If this is the last day of the month and the reservation continues in the next month - straight right edge
                                        if (isLastDayOfWeek) {
                                            const [year, month, lastDayOfMonth] = days[days.length - 1].split('-').map(Number);

                                            // Correct determination of the last day of the current month
                                            // Months in JavaScript are indexed from 0, so for April we use month=4
                                            const lastDayInMonth = new Date(year, month, 0).getDate();
                                            // For April (month 4 in our case) the last day is 30
                                            if (lastDayOfMonth === lastDayInMonth && endsAfterVisiblePeriod) {
                                                needsRightRadius = false;
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
                                        }

                                        // If current day is May 1 and the reservation started in April
                                        if (day.endsWith('-05-01') && startMonth === 4) {
                                            needsLeftRadius = false;
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
                                            onMouseDown={(e) => e.preventDefault()} // Just prevent selection for reserved cells
                                            cursor="pointer"
                                            className={isSelected ? 'selected-cell' : ''}
                                            borderRight={dayIndex < days.length - 1 && (halfDayIndex + halfDayColspan) % 2 === 0 ? "1px solid var(--chakra-colors-basic-grey100)" : "none"}
                                            borderTop="1px solid var(--chakra-colors-basic-grey100)"
                                            borderBottom={row.id === allRows[allRows.length - 1].id ? "1px solid var(--chakra-colors-basic-grey100)" : "none"}
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
                                                sx={{
                                                    '&:hover': {
                                                        opacity: '1 !important',
                                                        filter: 'none !important',
                                                        transition: 'opacity 0.2s ease, filter 0.2s ease'
                                                    }
                                                }}
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
                                            borderBottom={row.id === allRows[allRows.length - 1].id ? "1px solid var(--chakra-colors-basic-grey100)" : "none"}
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
        </Box>
    );
};

export default TableReservations;
