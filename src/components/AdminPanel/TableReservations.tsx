import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Text,
    Image,
    Spinner,
    Flex,
    Center,
    useDisclosure
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
    marina_id?: string;
    registration_image_url?: string;
    vessel_type?: string;
    service_requests?: Array<{
        is_completed: boolean;
    }>;
    is_completed?: boolean;
}

interface TableReservationsProps {
    days: string[];
    cellWidth: string;
    renderHeader: (day: string) => React.ReactNode;
    renderBoatCell: (boat: Boat, colspan: number, textColor: string) => React.ReactNode;
    currentDate: string;
    onReservationClick: (rowId: string, day: string, boat?: Boat) => void;
}

const TableReservations: React.FC<TableReservationsProps> = ({
    days,
    cellWidth,
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
    const [selectedCell, setSelectedCell] = useState<{ rowId: string; day: string; boat?: Boat } | null>(null);

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
                            const boat = {
                                id: reservation.mooring_ball.ball_number.toString(),
                                name: reservation.boat?.boatname || 'N/A',
                                code: reservation.boat?.model || 'N/A',
                                startDay: new Date(reservation.start_date).toISOString().split('T')[0],
                                endDay: new Date(reservation.end_date).toISOString().split('T')[0],
                                marina_id: reservation.marina?.marina_id,
                                registration_image_url: (reservation.boat as any)?.registration_image_url,
                                vessel_type: reservation.boat?.vessel_type,
                                service_requests: reservation.service_requests,
                                is_completed: reservation.is_completed,
                            };
                            console.log('Processed boat data:', boat);
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
                // Используем новые названия флагов для большей ясности
                startsBeforeVisiblePeriod,
                endsAfterVisiblePeriod
            };
        } catch (error) {
            console.error('Error in getBoatForDay:', error);
            return null;
        }
    };

    const handleCellClick = (rowId: string, day: string, boat?: Boat) => {
        setSelectedCell({ rowId, day, boat });
        onReservationClick(rowId, day, boat);
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
        <Box display="flex" alignItems="center">
            {/* Контейнер для швартовок */}
            <Box mt='56px' mr='20px' width="105px" display="flex" flexDirection="column" alignItems="center">
                {allRows.map(row => (
                    <Box key={row.id} p="16px 24px" width="100px" height="60px" display="flex" alignItems="center" justifyContent="space-between">
                        <Image width="24px" height="24px" src={row.marina?.logo_url || BollaCell} alt="Bolla" />
                        <Text fontSize="16px" lineHeight="52px">{row.label}</Text>
                    </Box>
                ))}
            </Box>

            {/* Таблица */}
            <Box 
                width="calc(100% - 50px)" 
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
                    }
                }}
            >
                <Table
                    variant="unstyled"
                    width="100%"
                    sx={{
                        borderCollapse: 'separate',
                        borderSpacing: '2px',
                        tableLayout: 'fixed',
                        minWidth: '100%'
                    }}
                >
                    <Thead>
                        <Tr>
                            {days.map(day => (
                                <Th
                                    key={`date-${day}`}
                                    width={cellWidth}
                                    minWidth={cellWidth}
                                    maxWidth={cellWidth}
                                    position="relative"
                                    p={1}
                                    height="58px"
                                    style={{ verticalAlign: 'middle' }}
                                >
                                    {renderHeader(day)}
                                </Th>
                            ))}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {allRows.map(row => {
                            const occupiedDays = new Array(days.length).fill(false);
                            return (
                                <Tr key={`row-${row.id}`}>
                                    {days.map((day, dayIndex) => {
                                        if (occupiedDays[dayIndex]) return null;
                                        const boatData = getBoatForDay(row.id, dayIndex, occupiedDays);

                                        const isSelected = selectedCell?.rowId === row.id && selectedCell?.day === day;

                                        if (!boatData) {
                                            return (
                                                <Td
                                                    key={`cell-${row.id}-${day}`}
                                                    width={cellWidth}
                                                    minWidth={cellWidth}
                                                    maxWidth={cellWidth}
                                                    height="58px"
                                                    p={1}
                                                    position="relative"
                                                    style={{ verticalAlign: 'middle' }}
                                                    _hover={{
                                                        bg: '#DD660026'
                                                    }}
                                                />
                                            );
                                        }

                                        return (
                                            <Td
                                                key={`cell-${row.id}-${day}`}
                                                bg={getCellColor(boatData.boat).bg}
                                                color={getCellColor(boatData.boat).textColor}
                                                colSpan={boatData.colspan}
                                                width={cellWidth}
                                                minWidth={cellWidth}
                                                maxWidth={cellWidth}
                                                height="58px"
                                                p={1}
                                                position="relative"
                                                style={{ 
                                                    verticalAlign: 'middle',
                                                    // Применяем точный borderRadius через inline styles
                                                    borderRadius: (() => {
                                                        const isFirstDayOfWeek = dayIndex === 0;
                                                        const isLastDayOfWeek = dayIndex + boatData.colspan - 1 === days.length - 1;
                                                        
                                                        if (isFirstDayOfWeek && boatData.startsBeforeVisiblePeriod) {
                                                            return '0 30px 30px 0'; // Плоский слева, круглый справа
                                                        } else if (isLastDayOfWeek && boatData.endsAfterVisiblePeriod) {
                                                            return '30px 0 0 30px'; // Круглый слева, плоский справа
                                                        }
                                                        
                                                        return '30px'; // По умолчанию полностью скругленный
                                                    })()
                                                }}
                                                onClick={() => handleCellClick(row.id, day, boatData.boat)}
                                                cursor="pointer"
                                                className={isSelected ? 'selected-cell' : ''}
                                                sx={{
                                                    '&.selected-cell': {
                                                        zIndex: 1000,
                                                    }
                                                }}
                                            >
                                                <Box
                                                    position="relative"
                                                    height="100%"
                                                >
                                                    {renderBoatCell(boatData.boat, boatData.colspan, getCellColor(boatData.boat).textColor)}
                                                </Box>
                                            </Td>
                                        );
                                    })}
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
                    />
                    <PopupReserved
                        isOpen={isReservedOpen}
                        onClose={onReservedClose}
                        rowId={selectedCell.rowId}
                        day={selectedCell.day}
                        boat={selectedCell.boat}
                    />
                </>
            )}
        </Box>
    );
};

export default TableReservations;