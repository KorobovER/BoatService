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
import { ReservationsService, MooringBallsService, MarinasService } from '../../client';
import { useMarina } from '../../context/MarinaContext';
import PopupFreeCell from './PopupFreeCell';
import PopupReserved from './PopupReserved';

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
    cellWidth,
    renderHeader,
    renderBoatCell,
    currentDate,
    onReservationClick,
    isMonthView = false,
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
                    const marinaData = await MarinasService.readMarina({ id: selectedMarina.marina_id });
                    if (marinaData.mooring_balls) result.mooring_balls = marinaData.mooring_balls;
                } else {
                    const response = await MooringBallsService.readMooringBalls({ limit: 5000 });
                    if (response.data) result.mooring_balls = Array.isArray(response.data) ? response.data : (response.data as any).data || [];
                }
                return result;
            } catch (error) {
                console.error('Error fetching mooring balls:', error);
                throw error;
            }
        },
        enabled: true,
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
                console.log('Raw reservations data:', reservations.data);
                
                const periodStart = new Date(days[0] + 'T00:00:00.000Z');
                const periodEnd = new Date(days[days.length - 1] + 'T23:59:59.999Z');

                const apiBoats = reservations.data
                    .filter(reservation => {
                        try {
                            const resStart = new Date(reservation.start_date);
                            const resEnd = new Date(reservation.end_date);
                            
                            // Проверяем, если хотя бы часть резервации попадает в видимый период
                            // Резервация начинается до конца периода И заканчивается после начала периода
                            return resStart <= periodEnd && resEnd >= periodStart;
                        } catch (error) {
                            console.error('Invalid date in reservation:', reservation);
                            return false;
                        }
                    })
                    .map(reservation => {
                        try {
                            const startDate = new Date(reservation.start_date);
                            const endDate = new Date(reservation.end_date);
                            
                            // Добавляем дополнительную проверку для отладки
                            const dateOptions = { hour: 'numeric', minute: 'numeric', hour12: false };
                            const rawStartTime = startDate.toLocaleTimeString('en-US', dateOptions as any);
                            const rawEndTime = endDate.toLocaleTimeString('en-US', dateOptions as any);
                            
                            const boat = {
                                id: reservation.mooring_ball.ball_number.toString(),
                                name: reservation.boat?.boatname || 'N/A',
                                code: reservation.boat?.model || 'N/A',
                                startDay: startDate.toISOString().split('T')[0],
                                endDay: endDate.toISOString().split('T')[0],
                                startTime: startDate.toISOString().split('T')[1].substring(0, 5),
                                endTime: endDate.toISOString().split('T')[1].substring(0, 5),
                                // Добавляем дополнительные поля для более точного определения
                                rawStartTime,
                                rawEndTime,
                                startsInSecondHalf: startDate.getHours() >= 12,
                                endsInFirstHalf: endDate.getHours() < 12,
                                marina_id: reservation.marina?.marina_id,
                                registration_image_url: (reservation.boat as any)?.registration_image_url,
                                vessel_type: reservation.boat?.vessel_type,
                                service_requests: reservation.service_requests,
                                is_completed: reservation.is_completed,
                            };
                            console.log('Processed boat data with time:', {
                                boat,
                                startDateTime: startDate.toISOString(),
                                endDateTime: endDate.toISOString(),
                                startTimeHour: parseInt(boat.startTime?.split(':')[0] || '0'),
                                endTimeHour: parseInt(boat.endTime?.split(':')[0] || '0'),
                                startsInSecondHalf: parseInt(boat.startTime?.split(':')[0] || '0') >= 12,
                                endsInFirstHalf: parseInt(boat.endTime?.split(':')[0] || '0') < 12
                            });
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

    /**
     * Определяет лодку для ячейки и вычисляет colspan
     */
    const getBoatForDay = (rowId: string, dayIndex: number, occupiedDays: boolean[]) => {
        if (occupiedDays[dayIndex]) return null;
        
        try {
            const day = new Date(days[dayIndex] + 'T00:00:00.000Z');
            
            const boat = boats.find(b => {
                try {
                    const startDate = new Date(b.startDay + 'T00:00:00.000Z');
                    const endDate = new Date(b.endDay + 'T00:00:00.000Z');
                    return b.id === rowId && day >= startDate && day <= endDate;
                } catch (error) {
                    console.error('Invalid date in boat:', b);
                    return false;
                }
            });

            if (!boat) return null;

            // Вычисляем colspan (разное для недели/месяца)
            let colspan = 1;
            let currentDayIndex = dayIndex;

            // Проверяем следующие дни в рамках текущего просмотра
            while (currentDayIndex + 1 < days.length) {
                try {
                    const nextDay = new Date(days[currentDayIndex + 1] + 'T00:00:00.000Z');
                    const endDate = new Date(boat.endDay + 'T00:00:00.000Z');
                    
                    // Если следующий день уже занят другой резервацией или выходит за пределы текущей резервации
                    if (occupiedDays[currentDayIndex + 1] || nextDay > endDate) {
                        break;
                    }
                    
                    // Увеличиваем colspan и отмечаем день как занятый
                    colspan++;
                    occupiedDays[currentDayIndex + 1] = true;
                    currentDayIndex++;
                } catch (error) {
                    console.error('Error processing next day:', error);
                    break;
                }
            }

            // Определение, находится ли резервация на границе периода просмотра
            const firstVisibleDay = new Date(days[0] + 'T00:00:00.000Z');
            const lastVisibleDay = new Date(days[days.length-1] + 'T23:59:59.999Z');
            const boatStartDate = new Date(boat.startDay + 'T00:00:00.000Z');
            const boatEndDate = new Date(boat.endDay + 'T23:59:59.999Z');
            
            // Проверяем, выходит ли начало резервации за пределы видимого периода
            const startsBeforeVisiblePeriod = boatStartDate < firstVisibleDay;
            
            // Проверяем, выходит ли конец резервации за пределы видимого периода
            const endsAfterVisiblePeriod = boatEndDate > lastVisibleDay;

            return { 
                boat,
                colspan,
                dayIndex, // Добавляем индекс дня для корректного позиционирования
                // Используем новые названия флагов для большей ясности
                startsBeforeVisiblePeriod,
                endsAfterVisiblePeriod
            };
        } catch (error) {
            console.error('Error in getBoatForDay:', error);
            return null;
        }
    };

    const handleCellClick = (rowId: string, day: string, boat?: Boat, timeOfDay?: 'AM' | 'PM') => {
        setSelectedCell({ rowId, day, boat, timeOfDay });
        onReservationClick(rowId, day, boat, timeOfDay);
    };

    const getCellColor = (boat: Boat) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const startDate = new Date(boat.startDay);
        const endDate = new Date(boat.endDay);
        
        console.log('Checking color for boat:', {
            boat,
            today: today.toISOString(),
            tomorrow: tomorrow.toISOString(),
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            hasUncompletedServices: boat.service_requests?.some(service => !service.is_completed),
            isToday: startDate.toDateString() === today.toDateString(),
            hasServices: boat.service_requests?.length,
            isFuture: startDate >= tomorrow,
            isPast: endDate < today,
            isCompleted: boat.is_completed
        });
        
        // Если есть незавершенные сервисы и дата начала сегодня
        if (boat.service_requests?.some(service => !service.is_completed) && 
            startDate.toDateString() === today.toDateString()) {
            console.log('Color: Red (uncompleted services today)');
            return { bg: "#A85555", textColor: "white" }; // red
        }
        
        // Если есть сервисы и дата начала в будущем
        if (boat.service_requests?.length && startDate >= tomorrow) {
            console.log('Color: Yellow (future services)');
            return { bg: "#FEA02F", textColor: "white" }; // yellow
        }
        
        // Если резервация завершена и дата окончания в прошлом
        if (endDate < today && boat.is_completed) {
            console.log('Color: Light Green (completed past)');
            return { bg: "#E5F2F2", textColor: "black" }; // light green
        }
        
        // Если резервация не завершена и дата окончания в прошлом
        if (endDate < today && !boat.is_completed) {
            console.log('Color: Red (uncompleted past)');
            return { bg: "#A85555", textColor: "white" }; // red
        }
        
        console.log('Color: Green (default)');
        return { bg: "#007A7B", textColor: "white" }; // green (default)
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
            {/* Контейнер для швартовок */}
            <Box mt='56px' mr='20px' width="105px" flexShrink={0} display="flex" flexDirection="column" alignItems="center">
                {allRows.map(row => (
                    <Box key={row.id} p="16px 24px" width="100px" height="60px" display="flex" alignItems="center" justifyContent="space-between">
                        <Image width="24px" height="24px" src={row.marina?.logo_url || BollaCell} alt="Bolla" />
                        <Text fontSize="16px" lineHeight="52px">{row.label}</Text>
                    </Box>
                ))}
            </Box>

            {/* Таблица вместо Grid */}
            <Box 
                width="100%"
                flex="1"
                overflowX="auto"
                sx={{
                    '&:focus': {
                        outline: 'none'
                    },
                    '&:focus-visible': {
                        outline: 'none'
                    },
                    '*:focus': {
                        outline: 'none'
                    },
                    '& table': {
                        tableLayout: 'fixed',
                        width: '100%'
                    }
                }}
            >
                <Table variant="unstyled" width="100%">
                    <Thead>
                        <Tr>
                            {days.map((day, dayIndex) => (
                                <Th 
                                    key={`date-${day}`}
                                    p={1}
                                    height="58px"
                                    textAlign="center"
                                    fontWeight="normal"
                                    colSpan={2} // Каждый день занимает 2 ячейки (AM и PM)
                                    position="relative" // Добавляем относительное позиционирование
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
                                        const currentDay = new Date(day + 'T00:00:00.000Z');
                                        const startDate = new Date(b.startDay + 'T00:00:00.000Z');
                                        const endDate = new Date(b.endDay + 'T00:00:00.000Z');
                                        const isStartDay = b.startDay === day;
                                        const isEndDay = b.endDay === day;
                                        
                                        // Если это месячное представление и резервация занимает только половину дня, 
                                        // и начинается и заканчивается в один день, пропускаем ее
                                        if (isMonthView && isStartDay && isEndDay) {
                                            if ((isStartDay && b.startsInSecondHalf) || (isEndDay && b.endsInFirstHalf)) {
                                                return false;
                                            }
                                        }
                                        
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
                                            height="58px"
                                            padding={0}
                                            position="relative"
                                            _hover={{
                                                bg: '#DD660026'
                                            }}
                                            cursor="pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCellClick(row.id, day, undefined, timeOfDay);
                                            }}
                                        />
                                    );
                                    halfDayIndex++;
                                    continue;
                                }
                                
                                // Ищем лодку для этой половины дня
                                const boatMatch = boats.find(b => {
                                    try {
                                        const currentDay = new Date(day + 'T00:00:00.000Z');
                                        const startDate = new Date(b.startDay + 'T00:00:00.000Z');
                                        const endDate = new Date(b.endDay + 'T00:00:00.000Z');
                                        const isStartDay = b.startDay === day;
                                        const isEndDay = b.endDay === day;
                                        
                                        // Если это месячное представление и резервация занимает только половину дня, 
                                        // и начинается и заканчивается в один день, пропускаем ее
                                        if (isMonthView && isStartDay && isEndDay) {
                                            if ((isStartDay && b.startsInSecondHalf) || (isEndDay && b.endsInFirstHalf)) {
                                                return false;
                                            }
                                        }
                                        
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
                                        
                                        const nextDayDate = new Date(nextDay + 'T00:00:00.000Z');
                                        const startDate = new Date(b.startDay + 'T00:00:00.000Z');
                                        const endDate = new Date(b.endDay + 'T00:00:00.000Z');
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
                                const startHalfDayIndex = halfDayIndex;
                                const endHalfDayIndex = halfDayIndex + halfDayColspan - 1;
                                const isFirstHalfDay = startHalfDayIndex === 0;
                                const isLastHalfDay = endHalfDayIndex === occupiedHalfDays.length - 1;
                                
                                const isStartDay = boatMatch.startDay === day;
                                const isEndDay = boatMatch.endDay === days[Math.floor(endHalfDayIndex / 2)];
                                
                                // Проверка границ видимого периода
                                const firstVisibleDay = new Date(days[0] + 'T00:00:00.000Z');
                                const lastVisibleDay = new Date(days[days.length-1] + 'T23:59:59.999Z');
                                const boatStartDate = new Date(boatMatch.startDay + 'T00:00:00.000Z');
                                const boatEndDate = new Date(boatMatch.endDay + 'T23:59:59.999Z');
                                
                                const startsBeforeVisiblePeriod = boatStartDate < firstVisibleDay;
                                const endsAfterVisiblePeriod = boatEndDate > lastVisibleDay;
                                
                                const isSelected = selectedCell?.rowId === row.id && selectedCell?.day === day;
                                
                                // Определяем, находится ли ячейка на границе недели (первый или последний день)
                                const isFirstDayOfWeek = dayIndex === 0;
                                const isLastDayOfWeek = dayIndex === days.length - 1;
                                
                                // Определяем, нужно ли скруглять каждый из краев
                                let needsLeftRadius = true;  // По умолчанию скругляем
                                let needsRightRadius = true; // По умолчанию скругляем
                                
                                // Проверяем, является ли это резервацией, переходящей через границу недели
                                const isPartOfCrossingReservation = startsBeforeVisiblePeriod || endsAfterVisiblePeriod;
                                
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
                                
                                // Для отладки: логирование параметров скругления
                                console.log('Border Radius Details:', {
                                    day,
                                    timeOfDay,
                                    halfDayColspan,
                                    isStartDay,
                                    isEndDay,
                                    startsBeforeVisiblePeriod,
                                    endsAfterVisiblePeriod,
                                    isFirstDayOfWeek,
                                    isLastDayOfWeek,
                                    isPartOfCrossingReservation,
                                    needsLeftRadius,
                                    needsRightRadius,
                                    borderRadius,
                                    startMatch: boatMatch.startDay,
                                    endMatch: boatMatch.endDay
                                });
                                
                                // Добавляем ячейку для резервации
                                cells.push(
                                    <Td
                                        key={`boat-${row.id}-${day}-${boatMatch.id}-${timeOfDay}`}
                                        bg={getCellColor(boatMatch).bg}
                                        color={getCellColor(boatMatch).textColor}
                                        colSpan={halfDayColspan}
                                        height="58px"
                                        p={0}
                                        textAlign="center"
                                        onClick={(e) => handleCellClick(row.id, day, boatMatch, timeOfDay)}
                                        cursor="pointer"
                                        className={isSelected ? 'selected-cell' : ''}
                                        sx={{
                                            borderRadius,
                                            overflow: "hidden",
                                            '&.selected-cell': {
                                                zIndex: 1000,
                                            }
                                        }}
                                    >
                                        <Flex
                                            height="100%"
                                            width="100%"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            {/* Показываем информацию только в центре резервации или если это единственная ячейка */}
                                            {halfDayColspan >= 2 || (halfDayColspan === 1 && ((isStartDay && !boatMatch.startsInSecondHalf) || (isEndDay && boatMatch.endsInFirstHalf))) ?
                                                renderBoatCell(boatMatch, halfDayColspan / 2, getCellColor(boatMatch).textColor) :
                                                null
                                            }
                                        </Flex>
                                    </Td>
                                );
                                
                                // Переходим к следующей необработанной половине дня
                                halfDayIndex += halfDayColspan;
                            }

                            return (
                                <Tr key={`row-${row.id}`} height="60px">
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