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

/**
 * Интерфейс для данных лодки в резервации
 */
interface Boat {
    id: string;
    name: string;
    code: string;
    startDay: string;
    endDay: string;
    marina_id?: string;
    registration_image_url?: string;
}

/**
 * Интерфейс для строки таблицы (швартовки)
 */
interface Row {
    id: string;
    label: string;
}

interface TableWeekProps {
    currentWeekStart: string;
}

/**
 * Компонент таблицы с недельным представлением резерваций
 */
const TableWeek: React.FC<TableWeekProps> = ({ currentWeekStart }) => {
    const { selectedMarina } = useMarina();
    const [boats, setBoats] = useState<Boat[]>([]);
    const [allRows, setAllRows] = useState<Row[]>([]);
    const [days, setDays] = useState<string[]>([]);

    // Запрос всех швартовок для выбранной марины
    const { data: mooringBalls, isLoading: isLoadingMooringBalls, error: mooringBallsError } = useQuery({
        queryKey: ['mooringBalls', selectedMarina?.marina_id],
        queryFn: async () => {
            try {
                // Создаем объект результата с одинаковой структурой
                let result = { mooring_balls: [] as Array<any> };
                
                // Если выбрана конкретная марина, используем readMarina
                if (selectedMarina?.marina_id) {
                    const marinaData = await MarinasService.readMarina({ 
                        id: selectedMarina.marina_id 
                    });
                    
                    // Извлекаем швартовки из данных марины
                    if (marinaData.mooring_balls && Array.isArray(marinaData.mooring_balls)) {
                        result.mooring_balls = marinaData.mooring_balls;
                    }
                } else {
                    // Если марина не выбрана, получаем все швартовки
                    const response = await MooringBallsService.readMooringBalls({
                        limit: 5000
                    });
                    
                    // Извлекаем швартовки из ответа API
                    if (response.data && Array.isArray(response.data)) {
                        result.mooring_balls = response.data;
                    } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
                        const dataArray = (response.data as any).data;
                        if (Array.isArray(dataArray)) {
                            result.mooring_balls = dataArray;
                        }
                    }
                }
                
                return result;
            } catch (error) {
                console.error('Error fetching mooring balls:', error);
                throw error;
            }
        },
        enabled: true
    });

    // Запрос резерваций для выбранной марины
    const { data: reservations, isLoading: isLoadingReservations, isError } = useQuery({
        queryKey: ['reservations', currentWeekStart, selectedMarina?.marina_id],
        queryFn: () => ReservationsService.readReservations({ 
            limit: 500,
            marinaId: selectedMarina?.marina_id || undefined
        }),
        enabled: !!currentWeekStart
    });

    /**
     * Получает массив дат недели, начиная с указанной даты
     */
    const getWeekDates = (startDate: string) => {
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000);
            return date.toISOString().split('T')[0];
        });
    };

    // Обрабатываем данные о швартовках из API
    useEffect(() => {
        if (mooringBallsError) {
            console.error('Mooring balls error:', mooringBallsError);
        }
        
        try {
            // Получаем швартовки из ответа API
            if (mooringBalls?.mooring_balls) {
                const apiMooringBalls = mooringBalls.mooring_balls;
                
                if (apiMooringBalls.length > 0) {
                    // Проверяем, какое поле содержит номер швартовки
                    let numberField = 'ball_number';
                    if (apiMooringBalls[0] && !apiMooringBalls[0].ball_number) {
                        if (apiMooringBalls[0].number) numberField = 'number';
                        else if (apiMooringBalls[0].id) numberField = 'id';
                    }
                    
                    // Создаем строки таблицы для швартовок
                    const rows = apiMooringBalls
                        .filter(ball => ball && ball[numberField]) 
                        .map(ball => ({ 
                            id: ball[numberField].toString(), 
                            label: ball[numberField].toString() 
                        }))
                        .sort((a, b) => parseInt(a.id) - parseInt(b.id));
                    
                    setAllRows(rows);
                } else {
                    setAllRows([]);
                }
            } else {
                setAllRows([]);
            }
        } catch (error) {
            console.error('Error processing mooring balls:', error);
            setAllRows([]);
        }
    }, [mooringBalls, mooringBallsError]);

    // Обрабатываем резервации
    useEffect(() => {
        if (reservations?.data && currentWeekStart) {
            const endDate = new Date(new Date(currentWeekStart).getTime() + 6 * 24 * 60 * 60 * 1000)
                .toISOString().split('T')[0];

            const targetDays = getWeekDates(currentWeekStart);
            setDays(targetDays);

            // Фильтруем резервации по дате и преобразуем в формат для отображения
            const apiBoats = reservations.data
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
                    marina_id: reservation.marina?.marina_id,
                    registration_image_url: (reservation.boat as any)?.registration_image_url
                }));

            setBoats(apiBoats);
        }
    }, [reservations, currentWeekStart, selectedMarina]);

    /**
     * Определяет лодку для отображения в конкретной ячейке таблицы
     */
    const getBoatForDay = (rowId: string, day: string, occupiedDays: boolean[]) => {
        const dayIndex = days.indexOf(day);
        if (occupiedDays[dayIndex]) return null;

        // Находим лодку, зарезервированную на эту дату
        const boat = boats.find(b =>
            b.id === rowId &&
            new Date(day) >= new Date(b.startDay) &&
            new Date(day) <= new Date(b.endDay)
        );

        if (!boat) return null;

        // Вычисляем количество дней резервации в пределах видимой недели
        const startDate = new Date(Math.max(new Date(boat.startDay).getTime(), new Date(days[0]).getTime()));
        const endDate = new Date(Math.min(new Date(boat.endDay).getTime(), new Date(days[days.length - 1]).getTime()));
        const dayDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const colspan = Math.max(1, dayDiff);

        // Отмечаем занятые дни
        for (let i = dayIndex; i < dayIndex + colspan && i < occupiedDays.length; i++) {
            occupiedDays[i] = true;
        }

        return { boat, colspan };
    };

    /**
     * Проверяет, соответствует ли дата сегодняшнему дню
     */
    const isToday = (day: string) => {
        const today = new Date();
        const date = new Date(day);
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const isLoading = isLoadingMooringBalls || isLoadingReservations;

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
            <Spinner size="xl" color="ui.main" />
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
                                position="relative"
                            >
                                {new Date(day).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                })}
                                {isToday(day) && (
                                    <Box
                                        position="absolute"
                                        top="50%"
                                        left="50%"
                                        transform="translate(-50%, -50%)"
                                        bg="#DD660026"
                                        borderRadius="full"
                                        width="150px"
                                        height="44px"
                                        zIndex="1"
                                    />
                                )}
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
                                    const boatData = getBoatForDay(row.id, day, occupiedDays);
                                    if (!boatData) {
                                        return occupiedDays[days.indexOf(day)] ? null : (
                                            <Td
                                                key={`${row.id}-${day}`}
                                                width="150px"
                                                height="44px"
                                                p={1}
                                                position="relative"
                                            >
                                                {isToday(day) && (
                                                    <Box
                                                        position="absolute"
                                                        top="50%"
                                                        left="50%"
                                                        transform="translate(-50%, -50%)"
                                                        bg="#DD660026"
                                                        borderRadius="full"
                                                        width="34px"
                                                        height="34px"
                                                        zIndex="-1"
                                                    />
                                                )}
                                            </Td>
                                        );
                                    }

                                    return (
                                        <Td
                                            key={`${row.id}-${day}`}
                                            bg="#007A7B"
                                            borderRadius="25px"
                                            colSpan={boatData.colspan}
                                            width="150px"
                                            height="44px"
                                            p={2}
                                            position="relative"
                                        >
                                            {isToday(day) && (
                                                <Box
                                                    position="absolute"
                                                    top="50%"
                                                    left="50%"
                                                    transform="translate(-50%, -50%)"
                                                    bg="#DD660026"
                                                    borderRadius="full"
                                                    width="34px"
                                                    height="34px"
                                                    zIndex="-1"
                                                />
                                            )}
                                            <Box
                                                borderRadius="5px"
                                                p="5px"
                                                width="fit-content"
                                                height="100%"
                                                display="flex"
                                                gap="8px"
                                                alignItems="center"
                                                margin="0 auto"
                                            >
                                                <Box flexShrink={0}>
                                                    {boatData.boat.registration_image_url ? (
                                                        <Image 
                                                            src={boatData.boat.registration_image_url} 
                                                            alt={boatData.boat.name}
                                                            width="24px"
                                                            height="24px"
                                                            objectFit="cover"
                                                            borderRadius="4px"
                                                        />
                                                    ) : (
                                                        <Box
                                                            width="24px"
                                                            height="24px"
                                                            borderRadius="4px"
                                                            bg="white"
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                        >
                                                            <Text color="#007A7B" fontSize="12px">
                                                                {boatData.boat.name[0]}
                                                            </Text>
                                                        </Box>
                                                    )}
                                                </Box>
                                                <Box>
                                                    <Text color="white" textAlign="left" fontSize="14px" fontWeight="500" margin="0">
                                                        {boatData.boat.name}
                                                    </Text>
                                                    <Text color="white" textAlign="left" fontSize="12px" margin="0" opacity="0.8">
                                                        {boatData.boat.code}
                                                    </Text>
                                                </Box>
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

export default TableWeek;