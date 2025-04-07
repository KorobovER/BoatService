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

interface TableMonthProps {
  currentMonthDate: string;
}

/**
 * Компонент таблицы с месячным представлением резерваций
 */
const TableMonth: React.FC<TableMonthProps> = ({ currentMonthDate }) => {
  const { selectedMarina } = useMarina();
  const [boats, setBoats] = useState<Boat[]>([]);
  const [allRows, setAllRows] = useState<Row[]>([]);
  const [monthDays, setMonthDays] = useState<string[]>([]);

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
  const { data: reservations, isLoading: isLoadingReservations, isError, refetch: refetchReservations } = useQuery({
    queryKey: ['reservations', currentMonthDate, selectedMarina?.marina_id],
    queryFn: () => {
      console.log('TableMonth - Fetching reservations for date:', currentMonthDate);
      return ReservationsService.readReservations({
        limit: 500,
        marinaId: selectedMarina?.marina_id || undefined
      });
    },
    enabled: !!currentMonthDate
  });

  /**
   * Получает массив дат всего месяца
   */
  const getMonthDates = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth();

    // Получаем первый день месяца
    const firstDay = new Date(year, month, 1);

    // Получаем последний день месяца
    const lastDay = new Date(year, month + 1, 0);

    // Создаем массив дат
    const datesArray = [];
    const currentDate = new Date(firstDay);

    while (currentDate <= lastDay) {
      datesArray.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return datesArray;
  };

  // Обработчик изменения текущей даты
  useEffect(() => {
    if (currentMonthDate) {
      refetchReservations();
    }
  }, [currentMonthDate, refetchReservations]);

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

  // Обрабатываем резервации и устанавливаем дни месяца
  useEffect(() => {
    if (currentMonthDate) {
      const days = getMonthDates(currentMonthDate);
      setMonthDays(days);

      if (reservations?.data) {
        const monthStart = days[0];
        const monthEnd = days[days.length - 1];

        // Фильтруем резервации по дате и преобразуем в формат для отображения
        const apiBoats = reservations.data
          .filter(reservation => {
            const resStart = new Date(reservation.start_date.split('T')[0]);
            const resEnd = new Date(reservation.end_date.split('T')[0]);
            const tableEnd = new Date(monthEnd);
            const tableStart = new Date(monthStart);
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
    }
  }, [reservations, currentMonthDate, selectedMarina]);

  /**
   * Проверяет, соответствует ли дата сегодняшнему дню
   */
  const isToday = (day: string) => {
    if (!day) return false;
    const today = new Date();
    const date = new Date(day);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  /**
   * Определяет лодку для конкретной ячейки и вычисляет colspan
   */
  const getBoatWithColspan = (rowId: string, dayIndex: number, occupiedDays: boolean[]) => {
    if (occupiedDays[dayIndex]) return null;

    const day = monthDays[dayIndex];
    const boat = boats.find(b =>
      b.id === rowId &&
      new Date(day) >= new Date(b.startDay) &&
      new Date(day) <= new Date(b.endDay)
    );

    if (!boat) return null;

    // Найдем последовательность дней для этой лодки
    let colspan = 1;
    let currentDayIndex = dayIndex;

    while (
      currentDayIndex + 1 < monthDays.length &&
      !occupiedDays[currentDayIndex + 1]
    ) {
      const nextDay = monthDays[currentDayIndex + 1];
      const sameBoat = boats.find(b =>
        b.id === rowId &&
        b.name === boat.name &&
        new Date(nextDay) >= new Date(b.startDay) &&
        new Date(nextDay) <= new Date(b.endDay)
      );

      if (sameBoat) {
        colspan++;
        occupiedDays[currentDayIndex + 1] = true;
        currentDayIndex++;
      } else {
        break;
      }
    }

    return { boat, colspan };
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

  if (!currentMonthDate || monthDays.length === 0) return (
    <Center width="100vw" height="100vh" bg="white">
      <Text fontSize="xl">Initializing calendar...</Text>
    </Center>
  );

  return (
    <Box width="98%" margin="auto" overflowX="auto">
      <Table
        variant="unstyled"
        width="100%"
        style={{
          tableLayout: 'fixed',
          borderCollapse: 'separate',
          borderSpacing: '5px'
        }}
      >
        <Thead>
          <Tr>
            <Th width="150px" height="52px"></Th>
            {monthDays.map((day) => (
              <Th
                key={`date-${day}`}
                textAlign="center"
                width="40px"
                position="relative"
                p={1}
                height="52px"
                style={{ verticalAlign: 'middle' }}
              >
                {isToday(day) && (
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    bg="#DD660026"
                    borderRadius="full"
                    width="44px"
                    height="44px"
                    zIndex="1"
                  />
                )}
                {new Date(day).getDate()}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {allRows.map(row => (
            <Tr key={`row-${row.id}`}>
              <Td
                display="flex"
                gap="20px"
                alignItems="center"
                justifyContent="center"
                bg="transparent"
                border="none"
                width="150px"
                height="52px"
                p={1}
                style={{ verticalAlign: 'middle' }}
              >
                <Image src={BollaCell} alt="Bolla" />
                <Text>{row.label}</Text>
              </Td>

              {(() => {
                const occupiedDays = new Array(monthDays.length).fill(false);
                return monthDays.map((day, dayIndex) => {
                  if (occupiedDays[dayIndex]) return null;

                  const boatData = getBoatWithColspan(row.id, dayIndex, occupiedDays);

                  if (!boatData) {
                    return (
                      <Td
                        key={`cell-${row.id}-${day}`}
                        width="40px"
                        height="52px"
                        p={1}
                        position="relative"
                        style={{ verticalAlign: 'middle' }}
                      >
                      </Td>
                    );
                  }

                  return (
                    <Td
                      key={`cell-${row.id}-${day}`}
                      bg="#007A7B"
                      borderRadius="10px"
                      colSpan={boatData.colspan}
                      width="40px"
                      height="52px"
                      p={1}
                      position="relative"
                      style={{ verticalAlign: 'middle' }}
                    >
                      <Box
                        width="100%"
                        height="100%"
                        position="relative"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                      >
                        {boatData.boat.registration_image_url ? (
                          <Image
                            src={boatData.boat.registration_image_url}
                            alt={boatData.boat.name}
                            width="18px"
                            height="18px"
                            objectFit="cover"
                            borderRadius="4px"
                          />
                        ) : (
                          <Text color="white" fontSize="10px" textAlign="center">
                            {boatData.boat.name[0]}
                          </Text>
                        )}
                        {boatData.colspan > 1 && (
                          <Text color="white" fontSize="10px" ml="4px">
                            {boatData.boat.name}
                          </Text>
                        )}
                      </Box>
                    </Td>
                  );
                });
              })()}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default TableMonth;
