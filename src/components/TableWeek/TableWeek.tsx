import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import './TableWeek.css';
import BollaCell from "../../../public/assets/images/bolla-cell.png";
import { ReservationsService } from '../../client';
import TableSwitch from '../TableSwitch/TableSwitch';

interface Ship {
    id: string;
    name: string;
    code: string;
    startDay: string;
    endDay: string;
}

interface Row {
    id: string;
    label: string;
}

const Calendar: React.FC = () => {
    const [ships, setShips] = useState<Ship[]>([]);
    const [rows, setRows] = useState<Row[]>([]);
    const [days, setDays] = useState<string[]>([]);
    const [currentWeekStart, setCurrentWeekStart] = useState<string>('2025-03-03');

    const { data: reservations, isLoading, isError } = useQuery({
        queryKey: ['reservations', currentWeekStart],
        queryFn: () => ReservationsService.readReservations({
            limit: 500
        })
    });

    const getWeekDates = (startDate: string) => {
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000);
            return date.toISOString().split('T')[0];
        });
    };

    const handlePrevWeek = () => {
        const newStartDate = new Date(new Date(currentWeekStart).getTime() - 7 * 24 * 60 * 60 * 1000);
        setCurrentWeekStart(new Date(newStartDate).toISOString().split('T')[0]);
    };

    const handleNextWeek = () => {
        const newStartDate = new Date(new Date(currentWeekStart).getTime() + 7 * 24 * 60 * 60 * 1000);
        setCurrentWeekStart(new Date(newStartDate).toISOString().split('T')[0]);
    };

    const handleToday = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
        const monday = new Date(today.setDate(diff));
        setCurrentWeekStart(monday.toISOString().split('T')[0]);
    };

    useEffect(() => {
        if (reservations?.data) {
            const endDate = new Date(new Date(currentWeekStart).getTime() + 6 * 24 * 60 * 60 * 1000)
                .toISOString().split('T')[0];

            // Формируем дни для отображения
            const targetDays = getWeekDates(currentWeekStart);

            // Извлекаем все уникальные швартовки из резерваций
            const allBallNumbers = Array.from(
                new Set(reservations.data.map(res => res.mooring_ball.ball_number.toString()))
            ).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

            // Создаем строки для всех найденных швартовок
            const uniqueRows = allBallNumbers.map(id => ({ id, label: id }));

            // Преобразуем резервации в корабли
            const apiShips = reservations.data
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
                }));

            setShips(apiShips);
            setRows(uniqueRows);
            setDays(targetDays);
        }
    }, [reservations, currentWeekStart]);

    const getShipForDay = (rowId: string, day: string, occupiedDays: boolean[]) => {
        const dayIndex = days.indexOf(day);
        if (occupiedDays[dayIndex]) return null;

        const ship = ships.find(s => 
            s.id === rowId && 
            new Date(day) >= new Date(s.startDay) && 
            new Date(day) <= new Date(s.endDay)
        );

        if (!ship) return null;

        // Вычисляем colspan
        const startDate = new Date(Math.max(new Date(ship.startDay).getTime(), new Date(days[0]).getTime()));
        const endDate = new Date(Math.min(new Date(ship.endDay).getTime(), new Date(days[days.length - 1]).getTime()));
        const dayDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const colspan = Math.max(1, dayDiff);

        // Помечаем дни как занятые
        for (let i = dayIndex; i < dayIndex + colspan && i < occupiedDays.length; i++) {
            occupiedDays[i] = true;
        }

        return {
            ship,
            colspan
        };
    };

    const formatWeekRange = () => {
        const start = new Date(currentWeekStart);
        const end = new Date(new Date(currentWeekStart).getTime() + 6 * 24 * 60 * 60 * 1000);
        return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
    };

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading data</div>;

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
                        {rows.map(row => {
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