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
    Center
} from '@chakra-ui/react';
import BollaCell from "../../../public/assets/images/bolla-cell.png";
import { ReservationsService, MooringBallsService, MarinasService } from '../../client';
import { useMarina } from '../../context/MarinaContext';

interface Row {
    id: string;
    label: string;
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
}

interface TableReservationsProps {
    days: string[];
    cellWidth: string;
    renderHeader: (day: string) => React.ReactNode;
    renderBoatCell: (boat: Boat, colspan: number) => React.ReactNode;
    currentDate: string;
}

const TableReservations: React.FC<TableReservationsProps> = ({
    days,
    cellWidth,
    renderHeader,
    renderBoatCell,
    currentDate,
}) => {
    const { selectedMarina } = useMarina();
    const [boats, setBoats] = useState<Boat[]>([]);
    const [allRows, setAllRows] = useState<Row[]>([]);

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
                .map(ball => ({ id: ball[numberField].toString(), label: ball[numberField].toString() }))
                .sort((a, b) => parseInt(a.id) - parseInt(b.id));
            
            setAllRows(rows);
        }
    }, [mooringBalls]);

    // Обработка резерваций (общая логика)
    useEffect(() => {
        if (reservations?.data && days.length > 0) {
            try {
                const periodStart = new Date(days[0] + 'T00:00:00.000Z');
                const periodEnd = new Date(days[days.length - 1] + 'T00:00:00.000Z');

                const apiBoats = reservations.data
                    .filter(reservation => {
                        try {
                            const resStart = new Date(reservation.start_date);
                            const resEnd = new Date(reservation.end_date);
                            return resStart <= periodEnd && resEnd >= periodStart;
                        } catch (error) {
                            console.error('Invalid date in reservation:', reservation);
                            return false;
                        }
                    })
                    .map(reservation => {
                        try {
                            return {
                                id: reservation.mooring_ball.ball_number.toString(),
                                name: reservation.boat?.boatname || 'N/A',
                                code: reservation.boat?.model || 'N/A',
                                startDay: new Date(reservation.start_date).toISOString().split('T')[0],
                                endDay: new Date(reservation.end_date).toISOString().split('T')[0],
                                marina_id: reservation.marina?.marina_id,
                                registration_image_url: (reservation.boat as any)?.registration_image_url,
                                vessel_type: reservation.boat?.vessel_type,
                            };
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

            while (currentDayIndex + 1 < days.length && !occupiedDays[currentDayIndex + 1]) {
                try {
                    const nextDay = new Date(days[currentDayIndex + 1] + 'T00:00:00.000Z');
                    const sameBoat = boats.find(b => {
                        try {
                            const startDate = new Date(b.startDay + 'T00:00:00.000Z');
                            const endDate = new Date(b.endDay + 'T00:00:00.000Z');
                            return b.id === rowId && nextDay >= startDate && nextDay <= endDate;
                        } catch (error) {
                            console.error('Invalid date in boat:', b);
                            return false;
                        }
                    });

                    if (sameBoat) {
                        colspan++;
                        occupiedDays[currentDayIndex + 1] = true;
                        currentDayIndex++;
                    } else {
                        break;
                    }
                } catch (error) {
                    console.error('Error processing next day:', error);
                    break;
                }
            }

            return { boat, colspan };
        } catch (error) {
            console.error('Error in getBoatForDay:', error);
            return null;
        }
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
        <Box width="98%" margin="auto" overflowX="auto">
            <Table
                variant="unstyled"
                width="100%"
                sx={{
                    borderCollapse: 'separate',
                    borderSpacing: cellWidth === '150px' ? '40px' : '5px',
                }}
            >
                <Thead>
                    <Tr>
                        <Th width="150px"></Th>
                        {days.map(day => (
                            <Th
                                key={`date-${day}`}
                                width={cellWidth}
                                position="relative"
                                p={1}
                                height={cellWidth === '150px' ? '44px' : '52px'}
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
                                <Td
                                    display="flex"
                                    gap="20px"
                                    alignItems="center"
                                    justifyContent="center"
                                    bg="transparent"
                                    border="none"
                                    width="150px"
                                    height={cellWidth === '150px' ? '44px' : '52px'}
                                    p={1}
                                    style={{ verticalAlign: 'middle' }}
                                >
                                    <Image src={BollaCell} alt="Bolla" />
                                    <Text>{row.label}</Text>
                                </Td>

                                {days.map((day, dayIndex) => {
                                    if (occupiedDays[dayIndex]) return null;
                                    const boatData = getBoatForDay(row.id, dayIndex, occupiedDays);

                                    if (!boatData) {
                                        return (
                                            <Td
                                                key={`cell-${row.id}-${day}`}
                                                width={cellWidth}
                                                height={cellWidth === '150px' ? '44px' : '52px'}
                                                p={1}
                                                position="relative"
                                                style={{ verticalAlign: 'middle' }}
                                            />
                                        );
                                    }

                                    return (
                                        <Td
                                            key={`cell-${row.id}-${day}`}
                                            bg="#007A7B"
                                            borderRadius={cellWidth === '150px' ? '25px' : '10px'}
                                            colSpan={boatData.colspan}
                                            width={cellWidth}
                                            height={cellWidth === '150px' ? '44px' : '52px'}
                                            p={1}
                                            position="relative"
                                            style={{ verticalAlign: 'middle' }}
                                        >
                                            {renderBoatCell(boatData.boat, boatData.colspan)}
                                        </Td>
                                    );
                                })}
                            </Tr>
                        );
                    })}
                </Tbody>
            </Table>
        </Box>
    );
};

export default TableReservations;