import { createFileRoute } from "@tanstack/react-router"
import { Box, Flex } from '@chakra-ui/react';
import TableWeek from '../../components/AdminPanel/TableWeek';
import TableSwitch from '../../components/AdminPanel/TableSwitch';
import { useEffect, useCallback, useState } from 'react';
import TableDay from '../../components/AdminPanel/TableDay';
import TableMonth from '../../components/AdminPanel/TableMonth';

type TableView = 'month' | 'week' | 'day';

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function Dashboard() {
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
        const date = new Date(currentMonthDate);
        date.setMonth(date.getMonth() - 1);
        setCurrentMonthDate(date.toISOString().split('T')[0]);
    };

    const handleNextMonth = () => {
        const date = new Date(currentMonthDate);
        date.setMonth(date.getMonth() + 1);
        setCurrentMonthDate(date.toISOString().split('T')[0]);
    };

    // Обработчик кнопки "Today"
    const handleToday = () => {
        const today = new Date();
        
        if (currentView === 'month') {
            const year = today.getFullYear();
            const month = today.getMonth();
            const newDate = new Date(Date.UTC(year, month, 1)).toISOString().split('T')[0];
            setCurrentMonthDate(newDate);
        } else {
            setCurrentWeekStart(getCurrentWeekMonday(today));
        }
    };

    // Форматирование отображаемого диапазона дат
    const formatDateRange = () => {
        if (currentView === 'month' && currentMonthDate) {
            const date = new Date(currentMonthDate + 'T00:00:00.000Z');
            return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        } else if (currentView === 'week' && currentWeekStart) {
            const start = new Date(currentWeekStart + 'T00:00:00.000Z');
            const end = new Date(currentWeekStart + 'T00:00:00.000Z');
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
        <Flex flexDir='column' w='100%' p='xl' gap='md' bg='white' rounded='25px'>
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
        </Flex>
    );
}
