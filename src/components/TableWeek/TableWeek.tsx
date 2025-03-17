import React from 'react';
import './TableWeek.css';
import BollaCell from "../../../public/assets/images/bolla-cell.png";

// Интерфейсы для типизации данных
interface Ship {
    id: string;
    name: string;
    code: string;
    startDay: string;
    endDay: string;
}

interface Day {
    day: string;
}

interface Row {
    id: string;
    label: string;
}

// Данные о кораблях
const ships: Ship[] = [
    {
        id: 'A1',
        name: 'Babieca',
        code: 'PA 8132 EG',
        startDay: 'Mon 3/9',
        endDay: 'Mon 3/9',
    },
    {
        id: 'A1',
        name: 'Portside Essentials',
        code: 'PA 8132 EG',
        startDay: 'Wed 3/5',
        endDay: 'Wed 3/5',
    },
    {
        id: 'A1',
        name: 'Portside Essentials',
        code: 'PA 8132 EG',
        startDay: 'Sat 3/8',
        endDay: 'Sat 3/8',
    },
    {
        id: 'A2',
        name: 'Ships & Giggles',
        code: 'TT 2749 WP',
        startDay: 'Tue 3/4',
        endDay: 'Fri 3/7',
    },
    {
        id: 'A2',
        name: 'Seas the Day',
        code: 'PA 8132 EG',
        startDay: 'Sat 3/8',
        endDay: 'Sat 3/8',
    },
    {
        id: 'B1',
        name: 'Ocean ...',
        code: 'SA 1234 XY',
        startDay: 'Tue 3/4',
        endDay: 'Fri 3/7',
    },
];

// Дни недели
const days: string[] = ['Mon 3/9', 'Tue 3/4', 'Wed 3/5', 'Thu 3/6', 'Fri 3/7', 'Sat 3/8', 'Sun 3/10'];

// Данные о строках (местах для яхт)
const rows: Row[] = [
    { id: 'A1', label: 'A1' },
    { id: 'A2', label: 'A2' },
    { id: 'A3', label: 'A3' },
    { id: 'A4', label: 'A4' },
    { id: 'B1', label: 'B1' },
    { id: 'B2', label: 'B2' },
    { id: 'B3', label: 'B3' },
    { id: 'B4', label: 'B4' },
    { id: 'C1', label: 'C1' },
    { id: 'C2', label: 'C2' },
    { id: 'C3', label: 'C3' },
    { id: 'C4', label: 'C4' },
];

const Calendar: React.FC = () => {
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

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th></th> {/* Пустой заголовок для первого столбца */}
                        {days.map((day) => (
                            <th key={day}>{day}</th>
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
                                    <div>{row.label}</div>
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
                                            return <td key={`${row.id}-${day}`}></td>;
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