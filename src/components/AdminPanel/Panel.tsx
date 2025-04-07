import { Box } from '@chakra-ui/react';
import TableWeek from './TableWeek';
import TableSwitch from './TableSwitch';
import { useEffect, useCallback } from 'react';
import { useState } from 'react';
import TableDay from './TableDay';
import TableMonth from './TableMonth';

type TableView = 'month' | 'week' | 'day';

const Panel: React.FC = () => {
    const [currentWeekStart, setCurrentWeekStart] = useState<string>('');
    const [currentMonthDate, setCurrentMonthDate] = useState<string>('');
    const [currentView, setCurrentView] = useState<TableView>('week');

    const getCurrentWeekMonday = useCallback((date = new Date()) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff)).toISOString().split('T')[0];
    }, []);

    // Инициализация начальных дат
    useEffect(() => {
        const today = new Date();
        
        // Устанавливаем текущую неделю
        setCurrentWeekStart(getCurrentWeekMonday(today));
        
        // Устанавливаем текущий месяц
        const year = today.getFullYear();
        const month = today.getMonth(); // 0-11
        
        // Создаем ISO строку даты первого дня текущего месяца
        const firstDayOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        setCurrentMonthDate(firstDayOfMonth);
    }, [getCurrentWeekMonday]);

    // Обработчики для недельного представления
    const handlePrevWeek = () => {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() - 7);
        setCurrentWeekStart(date.toISOString().split('T')[0]);
    };

    const handleNextWeek = () => {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + 7);
        setCurrentWeekStart(date.toISOString().split('T')[0]);
    };

    // Обработчики для месячного представления
    const handlePrevMonth = () => {
        // Разбираем текущую дату на компоненты
        const date = new Date(currentMonthDate);
        let year = date.getFullYear();
        let month = date.getMonth();
        
        // Переходим к предыдущему месяцу
        if (month === 0) {
            month = 11;
            year--;
        } else {
            month--;
        }
        
        // Создаем ISO строку даты первого дня нового месяца
        const newDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        
        // Обновляем состояние
        setCurrentMonthDate(newDate);
    };

    const handleNextMonth = () => {
        // Разбираем текущую дату на компоненты
        const date = new Date(currentMonthDate);
        let year = date.getFullYear();
        let month = date.getMonth();
        
        // Переходим к следующему месяцу
        if (month === 11) {
            month = 0;
            year++;
        } else {
            month++;
        }
        
        // Создаем ISO строку даты первого дня нового месяца
        const newDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        
        // Обновляем состояние
        setCurrentMonthDate(newDate);
    };

    // Обработчик кнопки "Today"
    const handleToday = () => {
        const today = new Date();
        
        if (currentView === 'month') {
            // Получаем текущий год и месяц
            const year = today.getFullYear();
            const month = today.getMonth(); // 0-11
            
            // Создаем ISO строку даты первого дня текущего месяца
            const firstDayOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
            setCurrentMonthDate(firstDayOfMonth);
        } else { // week или day
            setCurrentWeekStart(getCurrentWeekMonday(today));
        }
    };

    // Форматирование отображаемого диапазона дат
    const formatDateRange = () => {
        if (currentView === 'month' && currentMonthDate) {
            // Преобразуем ISO строку в объект Date для форматирования
            const date = new Date(currentMonthDate + 'T00:00:00'); // Добавляем время для корректной работы в разных часовых поясах
            return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        } else if (currentView === 'week' && currentWeekStart) {
            const start = new Date(currentWeekStart);
            const end = new Date(currentWeekStart);
            end.setDate(end.getDate() + 6);
            return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
        }
        return '';
    };

    // Обработчик переключения между режимами
    const handleViewChange = (view: TableView) => {
        setCurrentView(view);
    };

    // Общий обработчик для кнопок переключения
    const handleNavigation = (direction: 'prev' | 'next') => {
        if (currentView === 'week') {
            direction === 'prev' ? handlePrevWeek() : handleNextWeek();
        } else if (currentView === 'month') {
            direction === 'prev' ? handlePrevMonth() : handleNextMonth();
        }
    };

    return (
        <>
            <Box m='auto' w='98%' bg='white' rounded='25px'>
                <TableSwitch
                    onPrevWeek={() => handleNavigation('prev')}
                    onNextWeek={() => handleNavigation('next')}
                    onToday={handleToday}
                    weekRange={formatDateRange()}
                    currentView={currentView}
                    onViewChange={handleViewChange}
                />
                {currentView === 'week' && (
                    <TableWeek currentWeekStart={currentWeekStart} />
                )}
                {currentView === 'month' && (
                    <TableMonth 
                        key={currentMonthDate} 
                        currentMonthDate={currentMonthDate}
                    />
                )}
                {currentView === 'day' && <TableDay />}
            </Box>
        </>
    );
};

export default Panel;