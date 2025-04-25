import { createFileRoute } from "@tanstack/react-router"
import { Box, Flex} from '@chakra-ui/react';
import TableWeek from '../../components/AdminPanel/TableWeek';
import TableSwitch from '../../components/AdminPanel/TableSwitch';
import { useEffect, useState, useRef } from 'react';
import TableDay from '../../components/AdminPanel/TableDay';
import TableMonth from '../../components/AdminPanel/TableMonth';
import PopupReserved from '../../components/AdminPanel/PopupReserved';
import { Boat } from '../../components/AdminPanel/TableReservations';

type TableView = 'month' | 'week' | 'day';

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function Dashboard() {
    const [currentWeekStart, setCurrentWeekStart] = useState<string>('');
    // Use separate month and year for simplicity
    const [currentMonth, setCurrentMonth] = useState<number>(0);
    const [currentYear, setCurrentYear] = useState<number>(0);
    const [currentView, setCurrentView] = useState<TableView>('week');
    const [selectedReservation, setSelectedReservation] = useState<{rowId: string; day: string; boat?: Boat} | null>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const getCurrentWeekMonday = (date: Date = new Date()) => {
        // Create a copy of the date to avoid modifying the original
        const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        const day = d.getUTCDay();
        // If it's Sunday (0), go back 6 days, otherwise go back (day-1) days
        const diff = day === 0 ? 6 : day - 1;
        d.setUTCDate(d.getUTCDate() - diff);
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    };

    // Инициализация начальных дат
    useEffect(() => {
        const today = new Date();
        
        // Устанавливаем текущую неделю
        setCurrentWeekStart(getCurrentWeekMonday(today));
        
        // Устанавливаем текущий месяц и год напрямую (1-12 для месяца)
        setCurrentMonth(today.getUTCMonth() + 1);
        setCurrentYear(today.getUTCFullYear());
    }, []);

    // Simple function to get date string from month/year 
    const getMonthDateString = () => {
        return `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    };

    // Обработчики для недельного представления
    const handlePrevWeek = () => {
        const [year, month, day] = currentWeekStart.split('-').map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));
        date.setUTCDate(date.getUTCDate() - 7);
        const newDate = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
        setCurrentWeekStart(newDate);
    };

    const handleNextWeek = () => {
        const [year, month, day] = currentWeekStart.split('-').map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));
        date.setUTCDate(date.getUTCDate() + 7);
        const newDate = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
        setCurrentWeekStart(newDate);
    };

    // Simplified month navigation - just increment/decrement numbers
    const handlePrevMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    // Обработчик кнопки "Today"
    const handleToday = () => {
        const today = new Date();
        
        if (currentView === 'month') {
            setCurrentMonth(today.getUTCMonth() + 1);
            setCurrentYear(today.getUTCFullYear());
        } else {
            setCurrentWeekStart(getCurrentWeekMonday(today));
        }
    };

    // Форматирование отображаемого диапазона дат
    const formatDateRange = () => {
        if (currentView === 'month' && currentMonth > 0) {
            // Create date for formatting month name
            const date = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
            return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
        } else if (currentView === 'week' && currentWeekStart) {
            const [year, month, day] = currentWeekStart.split('-').map(Number);
            const start = new Date(Date.UTC(year, month - 1, day));
            const end = new Date(Date.UTC(year, month - 1, day));
            end.setUTCDate(end.getUTCDate() + 6);
            return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })} - ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })}`;
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

    const handleReservationClick = (rowId: string, day: string, boat?: Boat) => {
        setSelectedReservation({ rowId, day, boat });
    };

    const handleClosePopup = () => {
        setSelectedReservation(null);
    };

    return (
        <Box 
            position="relative" 
            bg="white" 
            minH="100vh"
            transition="all 0.3s ease"
        >
            <Flex w='100%' p='24px' gap='24px' position="relative">
                <Box 
                    width={selectedReservation ? "70%" : "100%"}
                    transition="all 0.3s ease"
                >
                    <Box mb="24px">
                        <TableSwitch
                            onPrevWeek={() => handleNavigation('prev')}
                            onNextWeek={() => handleNavigation('next')}
                            onToday={handleToday}
                            weekRange={formatDateRange()}
                            currentView={currentView}
                            onViewChange={handleViewChange}
                        />
                    </Box>
                    <Box 
                        ref={tableContainerRef}
                        position="relative"
                        borderRadius="16px"
                        overflow="hidden"
                        bg="white"
                    >
                        {selectedReservation && (
                            <Box
                                position="absolute"
                                top="58px"
                                left="80px"
                                right="0"
                                bottom="0"
                                bg="rgba(255, 255, 255, 0.6)"
                                backdropFilter="blur(1px)"
                                zIndex="2"
                                onClick={handleClosePopup}
                                cursor="pointer"
                                transition="all 0.3s ease"
                                sx={{
                                    '.selected-cell': {
                                        position: 'relative',
                                        zIndex: 3,
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'transparent',
                                            zIndex: 3
                                        }
                                    }
                                }}
                            />
                        )}
                        {currentView === 'week' && (
                            <TableWeek 
                                currentWeekStart={currentWeekStart} 
                                onReservationClick={handleReservationClick}
                            />
                        )}
                        {currentView === 'month' && currentMonth > 0 && (
                            <TableMonth 
                                key={`month-${currentYear}-${currentMonth}`} 
                                currentMonthDate={getMonthDateString()}
                                onReservationClick={handleReservationClick}
                            />
                        )}
                        {currentView === 'day' && <TableDay />}
                    </Box>
                </Box>
                {selectedReservation && (
                    <Box
                        position="absolute"
                        right="24px"
                        width="25%"
                    >
                        <PopupReserved
                            isOpen={!!selectedReservation}
                            onClose={handleClosePopup}
                            rowId={selectedReservation.rowId}
                            day={selectedReservation.day}
                            boat={selectedReservation.boat}
                        />
                    </Box>
                )}
            </Flex>
        </Box>
    );
}
