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
import { ReservationsService } from '../../client';
import { useMarina } from '../../context/MarinaContext';

interface Ship {
    id: string;
    name: string;
    code: string;
    startDay: string;
    endDay: string;
    marina_id?: string;
}

interface Row {
    id: string;
    label: string;
}

interface TableWeekProps {
    currentWeekStart: string;
}

const Calendar: React.FC<TableWeekProps> = ({ currentWeekStart }) => {
    const { selectedMarina } = useMarina();
    const [ships, setShips] = useState<Ship[]>([]);
    const [allRows, setAllRows] = useState<Row[]>([]);
    const [days, setDays] = useState<string[]>([]);

    const { data: reservations, isLoading, isError } = useQuery({
        queryKey: ['reservations', currentWeekStart],
        queryFn: () => ReservationsService.readReservations({ limit: 500 }),
        enabled: !!currentWeekStart
    });

    const getWeekDates = (startDate: string) => {
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000);
            return date.toISOString().split('T')[0];
        });
    };

    useEffect(() => {
        if (reservations?.data) {
            const uniqueBalls = new Set<string>();
            reservations.data.forEach(res => {
                if (res.mooring_ball?.ball_number) {
                    uniqueBalls.add(res.mooring_ball.ball_number.toString());
                }
            });

            const ballsArray = Array.from(uniqueBalls).sort((a, b) => parseInt(a) - parseInt(b));
            const rows = ballsArray.map(id => ({ id, label: id }));
            setAllRows(rows);

            if (currentWeekStart) {
                const endDate = new Date(new Date(currentWeekStart).getTime() + 6 * 24 * 60 * 60 * 1000)
                    .toISOString().split('T')[0];

                const targetDays = getWeekDates(currentWeekStart);
                setDays(targetDays);

                const filteredReservations = selectedMarina
                    ? reservations.data.filter(res => res.marina?.marina_id === selectedMarina.marina_id)
                    : reservations.data;

                const apiShips = filteredReservations
                    .filter(reservation => {
                        const resStart = new Date(reservation.start_date.split('T')[0]);
                        const resEnd = new Date(reservation.end_date.split('T')[0]);
                        const tableEnd = new Date(endDate);
                        const tableStart = new Date(currentWeekStart);
                        return resStart <= tableEnd && resEnd >= tableStart;
                    })
                    .map(reservation => ({
                        id: reservation.mooring_ball.ball_number.toString(),
                        name: reservation.boat?.boatname || 'N/A',
                        code: reservation.boat?.model || 'N/A',
                        startDay: reservation.start_date.split('T')[0],
                        endDay: reservation.end_date.split('T')[0],
                        marina_id: reservation.marina?.marina_id
                    }));

                setShips(apiShips);
            }
        }
    }, [reservations, currentWeekStart, selectedMarina]);

    const getShipForDay = (rowId: string, day: string, occupiedDays: boolean[]) => {
        const dayIndex = days.indexOf(day);
        if (occupiedDays[dayIndex]) return null;

        const ship = ships.find(s =>
            s.id === rowId &&
            new Date(day) >= new Date(s.startDay) &&
            new Date(day) <= new Date(s.endDay)
        );

        if (!ship) return null;

        const startDate = new Date(Math.max(new Date(ship.startDay).getTime(), new Date(days[0]).getTime()));
        const endDate = new Date(Math.min(new Date(ship.endDay).getTime(), new Date(days[days.length - 1]).getTime()));
        const dayDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const colspan = Math.max(1, dayDiff);

        for (let i = dayIndex; i < dayIndex + colspan && i < occupiedDays.length; i++) {
            occupiedDays[i] = true;
        }

        return { ship, colspan };
    };

    if (isLoading) return (
        <Flex
            width="98%"
            m="auto"
            height="100vh"
            alignItems="center"
            justifyContent="center"
            bg="white"
            rounded='25px'
        >
            <Spinner
                size="xl"
                color="ui.main"
            />
        </Flex>
    );

    if (isError) return (
        <Center width="100vw" height="100vh" bg="white">
            <Text color="red.500" fontSize="xl">Error loading data</Text>
        </Center>
    );

    if (!currentWeekStart) return (
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
                    borderSpacing: '40px'
                }}
            >
                <Thead>
                    <Tr>
                        <Th width="150px"></Th>
                        {days.map(day => (
                            <Th
                                key={day}
                                color="#777777"
                                textAlign="center"
                                width="150px"
                                height="44px"
                                p={1}
                            >
                                {new Date(day).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </Th>
                        ))}
                    </Tr>
                </Thead>
                <Tbody>
                    {allRows.map(row => {
                        const occupiedDays = new Array(days.length).fill(false);
                        return (
                            <Tr key={row.id}>
                                <Td
                                    display="flex"
                                    gap="20px"
                                    alignItems="center"
                                    justifyContent="center"
                                    bg="transparent"
                                    border="none"
                                    width="150px"
                                    height="44px"
                                    p={1}
                                >
                                    <Image src={BollaCell} alt="Bolla" />
                                    <Text>{row.label}</Text>
                                </Td>

                                {days.map(day => {
                                    const shipData = getShipForDay(row.id, day, occupiedDays);
                                    if (!shipData) {
                                        return occupiedDays[days.indexOf(day)] ? null : (
                                            <Td
                                                key={`${row.id}-${day}`}
                                                width="150px"
                                                height="44px"
                                                p={1}
                                            />
                                        );
                                    }

                                    return (
                                        <Td
                                            key={`${row.id}-${day}`}
                                            bg="#007A7B"
                                            borderRadius="25px"
                                            colSpan={shipData.colspan}
                                            width="150px"
                                            height="44px"
                                            p={1}
                                        >
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                flexDirection="column"
                                                width="90%"
                                                margin="auto"
                                            >
                                                <Text color="white" textAlign="left" fontSize="14px" margin="0">
                                                    {shipData.ship.name}
                                                </Text>
                                                <Text color="white" textAlign="left" fontSize="12px" margin="0">
                                                    {shipData.ship.code}
                                                </Text>
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
    );
};

export default Calendar;