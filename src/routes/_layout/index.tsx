import { createFileRoute } from "@tanstack/react-router"
import { Box, Flex } from '@chakra-ui/react';
import TableWeek from '../../components/AdminPanel/TableWeek';
import TableSwitch from '../../components/AdminPanel/TableSwitch';
import { useEffect, useCallback, useState, useRef } from 'react';
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
    const [currentMonthDate, setCurrentMonthDate] = useState<string>('');
    const [currentView, setCurrentView] = useState<TableView>('week');
    const [selectedReservation, setSelectedReservation] = useState<{rowId: string; day: string; boat?: Boat} | null>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const getCurrentWeekMonday = useCallback((date = new Date()) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff)).toISOString().split('T')[0];//Разобраться с этим
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
        const firstDayOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;//Разобраться с этим 
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
                        {currentView === 'month' && (
                            <TableMonth 
                                key={currentMonthDate} 
                                currentMonthDate={currentMonthDate}
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
