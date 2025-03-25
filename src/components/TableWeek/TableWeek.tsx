import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import './TableWeek.css';
import BollaCell from "../../../public/assets/images/bolla-cell.png";
import { ReservationsService } from '../../client';
import TableSwitch from '../TableSwitch/TableSwitch';

// Типы данных для кораблей и строк таблицы
interface Ship {
    id: string;         // ID швартовочного места
    name: string;       // Название лодки
    code: string;       // Модель лодки
    startDay: string;   // Дата начала брони (YYYY-MM-DD)
    endDay: string;     // Дата окончания брони (YYYY-MM-DD)
}

interface Row {
    id: string;         // ID строки (совпадает с номером швартовочного места)
    label: string;      // Отображаемый номер места
}

const Calendar: React.FC = () => {
    // Состояния компонента
    const [ships, setShips] = useState<Ship[]>([]);         // Список всех кораблей
    const [rows, setRows] = useState<Row[]>([]);            // Строки таблицы (швартовочные места)
    const [days, setDays] = useState<string[]>([]);          // Дни текущей недели (7 дат)
    const [currentWeekStart, setCurrentWeekStart] = useState<string>(''); // Понедельник текущей недели

    /**
     * Функция вычисляет дату понедельника для заданной даты
     * @param date - Опциональная дата (по умолчанию текущая дата)
     * @returns Строка с датой понедельника в формате YYYY-MM-DD
     */
    const getCurrentWeekMonday = (date = new Date()) => {
        const day = date.getDay(); // День недели (0 - воскресенье, 1 - понедельник и т.д.)
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Корректировка для воскресенья
        return new Date(date.setDate(diff)).toISOString().split('T')[0];
    };

    // Инициализация - устанавливаем понедельник текущей недели при загрузке
    useEffect(() => {
        setCurrentWeekStart(getCurrentWeekMonday());
    }, []);

    // Запрос данных о бронированиях с сервера
    const { data: reservations, isLoading, isError } = useQuery({
        queryKey: ['reservations', currentWeekStart],
        queryFn: () => ReservationsService.readReservations({ limit: 500 }),
        enabled: !!currentWeekStart // Запрос выполнится только после установки текущей недели
    });

    /**
     * Генерирует массив из 7 дат текущей недели
     * @param startDate - Дата понедельника
     * @returns Массив строк с датами в формате YYYY-MM-DD
     */
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

    // Эффект для обработки данных бронирований и формирования таблицы
    useEffect(() => {
        if (reservations?.data && currentWeekStart) {
            // Конец текущей недели (воскресенье)
            const endDate = new Date(new Date(currentWeekStart).getTime() + 6 * 24 * 60 * 60 * 1000)
                .toISOString().split('T')[0];

            // Получаем 7 дней текущей недели
            const targetDays = getWeekDates(currentWeekStart);

            // Извлекаем все уникальные номера швартовочных мест
            const allBallNumbers = Array.from(
                new Set(reservations.data.map(res => res.mooring_ball.ball_number.toString()))
            ).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

            // Создаем строки таблицы для каждого швартовочного места
            const uniqueRows = allBallNumbers.map(id => ({ id, label: id }));

            // Формируем данные о кораблях, которые попадают в текущую неделю
            const apiShips = reservations.data
                .filter(reservation => {
                    const resStart = new Date(reservation.start_date.split('T')[0]);
                    const resEnd = new Date(reservation.end_date.split('T')[0]);
                    const tableEnd = new Date(endDate);
                    const tableStart = new Date(currentWeekStart);
                    // Фильтруем только актуальные для текущей недели бронирования
                    return resStart <= tableEnd && resEnd >= tableStart;
                })
                .map(reservation => ({
                    id: reservation.mooring_ball.ball_number.toString(),
                    name: reservation.boat?.boatname || 'N/A',
                    code: reservation.boat?.model || 'N/A',
                    startDay: reservation.start_date.split('T')[0],
                    endDay: reservation.end_date.split('T')[0],
                }));

            // Обновляем состояния
            setShips(apiShips);
            setRows(uniqueRows);
            setDays(targetDays);
        }
    }, [reservations, currentWeekStart]);

    /**
     * Находит корабль для конкретного дня и швартовочного места
     * @param rowId - ID швартовочного места
     * @param day - Дата дня (YYYY-MM-DD)
     * @param occupiedDays - Массив флагов занятости дней
     * @returns Данные корабля и colspan для объединения ячеек или null
     */
    const getShipForDay = (rowId: string, day: string, occupiedDays: boolean[]) => {
        const dayIndex = days.indexOf(day);
        if (occupiedDays[dayIndex]) return null; // Ячейка уже занята другим кораблем

        // Ищем корабль, который занимает это место в указанный день
        const ship = ships.find(s =>
            s.id === rowId &&
            new Date(day) >= new Date(s.startDay) &&
            new Date(day) <= new Date(s.endDay)
        );

        if (!ship) return null; // Корабль не найден

        // Вычисляем диапазон дней, которые занимает корабль (с учетом границ недели)
        const startDate = new Date(Math.max(new Date(ship.startDay).getTime(), new Date(days[0]).getTime()));
        const endDate = new Date(Math.min(new Date(ship.endDay).getTime(), new Date(days[days.length - 1]).getTime()));
        const dayDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const colspan = Math.max(1, dayDiff);
        
        // Помечаем дни как занятые
        for (let i = dayIndex; i < dayIndex + colspan && i < occupiedDays.length; i++) {
            occupiedDays[i] = true;
        }

        return { ship, colspan };
    };

    /**
     * Форматирует диапазон дат текущей недели для отображения
     * @example "March 25 - March 31"
     */
    const formatWeekRange = () => {
        const start = new Date(currentWeekStart);
        const end = new Date(new Date(currentWeekStart).getTime() + 6 * 24 * 60 * 60 * 1000);
        return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
    };

    // Состояния загрузки
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading data</div>;
    if (!currentWeekStart) return <div>Initializing calendar...</div>;

    return (
        <div>
            {/* Компонент переключения недель */}
            <TableSwitch
                onPrevWeek={handlePrevWeek}
                onNextWeek={handleNextWeek}
                onToday={handleToday}
                weekRange={formatWeekRange()}
            />

            {/* Основная таблица */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            {/* Заголовки с днями недели */}
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
                        {/* Строки таблицы (по одной на каждое швартовочное место) */}
                        {rows.map(row => {
                            const occupiedDays = new Array(days.length).fill(false);
                            return (
                                <tr key={row.id}>
                                    {/* Ячейка с номером места */}
                                    <td className='column-cell'>
                                        <img src={BollaCell} alt="Bolla" />
                                        <div>{row.label}</div>
                                    </td>

                                    {/* Ячейки дней недели */}
                                    {days.map(day => {
                                        const shipData = getShipForDay(row.id, day, occupiedDays);
                                        if (!shipData) {
                                            // Пустая ячейка или занятая другим кораблем
                                            return occupiedDays[days.indexOf(day)] ? null : <td key={`${row.id}-${day}`} />;
                                        }

                                        // Ячейка с информацией о корабле
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