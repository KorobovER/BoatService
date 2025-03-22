import React, { useEffect, useState } from 'react';
import './TableWeek.css';
import BollaCell from "../../../public/assets/images/bolla-cell.png";
import MooringBallsList from '../TestComponent/TestComponent';

// Интерфейсы для типизации данных
interface Ship {
    id: string; // Используем ball_number как ID
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

    // Функция для вычисления количества дней, которые занимает корабль
    const getColspan = (startDay: string, endDay: string): number => {
        const startIndex = days.indexOf(startDay);
        const endIndex = days.indexOf(endDay);

        // Если startDay или endDay не найдены, возвращаем 1
        if (startIndex === -1 || endIndex === -1) return 1;

        // Если endDay раньше startDay, возвращаем 1
        if (endIndex < startIndex) return 1;

        return endIndex - startIndex + 1;
    };

    // Получение данных из API
    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDI5MDYyNzUsInN1YiI6ImYxYzkxOTY4LTI2MTEtNDMyYi1iODUwLThlODc4YWQ4ZTZlNCJ9.rPHJjlCUn44RsGTXmS3ks7zUEXa12O0Krwc4C_K7wlI'; // Замените на реальный access token
                const response = await fetch('https://staging.bolabuddy.com/api/v1/reservations/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка при получении данных: ${response.status}`);
                }

                const data = await response.json();

                // Ограничиваем дни диапазоном с 3 по 9 марта
                const startDate = new Date('2025-02-03').toISOString().split('T')[0];
                const endDate = new Date('2025-02-09').toISOString().split('T')[0];

                const targetDays = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000);
                    return date.toISOString().split('T')[0];
                });

                // Получаем все уникальные ball_number из данных
                const allBallNumbers = Array.from(
                    new Set(data.data.map((reservation: any) => reservation.mooring_ball.ball_number.toString()))
                ).sort((a, b) => parseInt(a, 10) - parseInt(b, 10)); // Сортируем по возрастанию

                // Преобразование данных из API в нужный формат
                const apiShips = data.data
                    .filter((reservation: any) => {
                        const reservationStart = new Date(reservation.start_date.split('T')[0]);
                        const reservationEnd = new Date(reservation.end_date.split('T')[0]);
                        return reservationStart <= new Date(endDate) && reservationEnd >= new Date(startDate);
                    })
                    .map((reservation: any) => ({
                        id: reservation.mooring_ball.ball_number.toString(), // Используем ball_number как ID
                        name: `${reservation.boat.boatname}`, // Название лодки
                        code: reservation.boat.model || 'N/A', // модель лодки
                        startDay: reservation.start_date.split('T')[0], // Дата начала
                        endDay: reservation.end_date.split('T')[0], // Дата окончания
                    }));

                // Создаем строки для всех ball_number
                const uniqueRows = allBallNumbers.map(id => ({ id, label: id }));

                // Обновление состояния
                setShips(apiShips);
                setRows(uniqueRows);
                setDays(targetDays); // Устанавливаем ограниченный диапазон дней
            } catch (error) {
                console.error('Ошибка при получении данных:', error);
            }
        };

        fetchReservations();
    }, []);

    return (
        <div className="table-container">
            <MooringBallsList/>
            <table>
                <thead>
                    <tr>
                        <th></th> {/* Пустой заголовок для первого столбца */}
                        {days.map((day) => (
                            <th key={day}>{new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => {
                        // Находим яхты, которые должны быть в этой строке
                        const rowShips = ships.filter((ship) => ship.id === row.id);

                        return (
                            <tr key={row.id}>
                                <td className='column-cell'>
                                    <img src={BollaCell} alt="" />
                                    <div>{row.label}</div> {/* Выводим ball_number здесь */}
                                </td>
                                {days.map((day, dayIndex) => {
                                    // Проверяем, есть ли яхта, которая начинается в этот день
                                    const ship = rowShips.find((ship) => {
                                        const startIndex = days.indexOf(ship.startDay);
                                        return startIndex === dayIndex;
                                    });

                                    if (ship) {
                                        const colspan = getColspan(ship.startDay, ship.endDay);
                                        return (
                                            <td
                                                key={`${row.id}-${day}`}
                                                className='boat-cell'
                                                colSpan={colspan}
                                            >
                                                <div>
                                                    <div className='boat-name'>{ship.name}</div>
                                                    <div className='boat-code'>{ship.code}</div>
                                                </div>
                                            </td>
                                        );
                                    } else {
                                        // Проверяем, не является ли этот день частью диапазона другой яхты
                                        const isPartOfRange = rowShips.some((ship) => {
                                            const startIndex = days.indexOf(ship.startDay);
                                            const endIndex = days.indexOf(ship.endDay);
                                            return dayIndex > startIndex && dayIndex <= endIndex;
                                        });

                                        // Если день является частью диапазона, пропускаем отрисовку ячейки
                                        if (isPartOfRange) {
                                            return null;
                                        } else {
                                            return <td key={`${row.id}-${day}`}></td>; // Отображаем пустую ячейку
                                        }
                                    }
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default Calendar;