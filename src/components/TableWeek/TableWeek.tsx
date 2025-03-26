import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import './TableWeek.css';
import BollaCell from "../../../public/assets/images/bolla-cell.png";
import { ReservationsService } from '../../client';
import TableSwitch from '../TableSwitch/TableSwitch';
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

const Calendar: React.FC = () => {
    const { selectedMarina } = useMarina();
    const [ships, setShips] = useState<Ship[]>([]);
    const [allRows, setAllRows] = useState<Row[]>([]);
    const [days, setDays] = useState<string[]>([]);
    const [currentWeekStart, setCurrentWeekStart] = useState<string>('');

    const getCurrentWeekMonday = (date = new Date()) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff)).toISOString().split('T')[0];
    };

    useEffect(() => {
        setCurrentWeekStart(getCurrentWeekMonday());
    }, []);

    // Получаем все бронирования, из которых извлечем швартовочные места
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

    // Обработчики навигации по неделям
    const handlePrevWeek = () => {
        const newStartDate = new Date(new Date(currentWeekStart).getTime() - 7 * 24 * 60 * 60 * 1000);
        setCurrentWeekStart(newStartDate.toISOString().split('T')[0]);
    };

    const handleNextWeek = () => {
        const newStartDate = new Date(new Date(currentWeekStart).getTime() + 7 * 24 * 60 * 60 * 1000);
        setCurrentWeekStart(newStartDate.toISOString().split('T')[0]);
    };

    const handleToday = () => {
        setCurrentWeekStart(getCurrentWeekMonday());
    };

    useEffect(() => {
        if (reservations?.data) {
            // Извлекаем все уникальные швартовочные места из бронирований
            const uniqueBalls = new Set<string>();
            reservations.data.forEach(res => {
                if (res.mooring_ball?.ball_number) {
                    uniqueBalls.add(res.mooring_ball.ball_number.toString());
                }
            });

            // Создаем список всех швартовочных мест
            const ballsArray = Array.from(uniqueBalls).sort((a, b) => parseInt(a) - parseInt(b));
            const rows = ballsArray.map(id => ({ id, label: id }));
            setAllRows(rows);

            // Если есть выбранная бухта, фильтруем бронирования
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

    const formatWeekRange = () => {
        const start = new Date(currentWeekStart);
        const end = new Date(new Date(currentWeekStart).getTime() + 6 * 24 * 60 * 60 * 1000);
        return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
    };

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading data</div>;
    if (!currentWeekStart) return <div>Initializing calendar...</div>;

    return (
        <div>
            <TableSwitch
                onPrevWeek={handlePrevWeek}
                onNextWeek={handleNextWeek}
                onToday={handleToday}
                weekRange={formatWeekRange()}
            />

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            {days.map(day => (
                                <th key={day}>
                                    {new Date(day).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {allRows.map(row => {
                            const occupiedDays = new Array(days.length).fill(false);
                            return (
                                <tr key={row.id}>
                                    <td className='column-cell'>
                                        <img src={BollaCell} alt="Bolla" />
                                        <div>{row.label}</div>
                                    </td>

                                    {days.map(day => {
                                        const shipData = getShipForDay(row.id, day, occupiedDays);
                                        if (!shipData) {
                                            return occupiedDays[days.indexOf(day)] ? null : <td key={`${row.id}-${day}`} />;
                                        }

                                        return (
                                            <td
                                                key={`${row.id}-${day}`}
                                                className='boat-cell'
                                                colSpan={shipData.colspan}
                                            >
                                                <div>
                                                    <div className='boat-name'>{shipData.ship.name}</div>
                                                    <div className='boat-code'>{shipData.ship.code}</div>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Calendar;