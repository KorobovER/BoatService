import { createFileRoute } from "@tanstack/react-router"
import { Box, Flex} from '@chakra-ui/react';
import TableWeek from '../../components/Calendar/TableWeek';
import TableSwitch from '../../components/Calendar/TableSwitch';
import { useEffect, useState, useRef } from 'react';
import TableDay from '../../components/Calendar/TableDay';
import TableMonth from '../../components/Calendar/TableMonth';
import PopupReserved from '../../components/AdminPanel/ServiceView/Services';
import { ReservationExtenstion } from "../../components/ReservationExtenstion";

type TableView = 'month' | 'week' | 'day';

// Date format configuration
const DATE_CONFIG = {
  LOCALE: 'en-US',
  FORMAT_OPTIONS: {
    monthYear: { month: 'long', year: 'numeric', timeZone: 'UTC' } as Intl.DateTimeFormatOptions,
    monthDay: { month: 'long', day: 'numeric', timeZone: 'UTC' } as Intl.DateTimeFormatOptions,
    weekday: { weekday: 'long', timeZone: 'UTC' } as Intl.DateTimeFormatOptions,
  }
};

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function Dashboard() {
    const [currentWeekStart, setCurrentWeekStart] = useState<string>('');
    // Use separate month and year for simplicity
    const [currentMonth, setCurrentMonth] = useState<number>(0);
    const [currentYear, setCurrentYear] = useState<number>(0);
    const [currentView, setCurrentView] = useState<TableView>('week');
    const [currentDay, setCurrentDay] = useState<string>('');
    const [selectedReservation, setSelectedReservation] = useState<{rowId: string; day: string; reservation?: ReservationExtenstion} | null>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    // Date utility functions
    const formatDateToYMD = (date: Date): string => {
        return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
    };

    const parseYMDToDate = (dateString: string): Date => {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day));
    };

    const formatDateWithOptions = (date: Date, options: Intl.DateTimeFormatOptions): string => {
        return date.toLocaleDateString(DATE_CONFIG.LOCALE, options);
    };

    const getCurrentWeekMonday = (date: Date = new Date()) => {
        // Create a copy of the date to avoid modifying the original
        const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        const day = d.getUTCDay();
        // If it's Sunday (0), go back 6 days, otherwise go back (day-1) days
        const diff = day === 0 ? 6 : day - 1;
        d.setUTCDate(d.getUTCDate() - diff);
        return formatDateToYMD(d);
    };

    // Инициализация начальных дат
    useEffect(() => {
        const today = new Date();

        // Устанавливаем текущую неделю
        setCurrentWeekStart(getCurrentWeekMonday(today));

        // Устанавливаем текущий день
        setCurrentDay(formatDateToYMD(today));

        // Устанавливаем текущий месяц и год напрямую (1-12 для месяца)
        setCurrentMonth(today.getUTCMonth() + 1);
        setCurrentYear(today.getUTCFullYear());

        // Ensure we're in week view by default
        setCurrentView('week');
    }, []);

    // Simple function to get date string from month/year
    const getMonthDateString = () => {
        return `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    };

    // Обработчики для дневного представления
    const handlePrevDay = () => {
        const date = parseYMDToDate(currentDay);
        date.setUTCDate(date.getUTCDate() - 1);
        setCurrentDay(formatDateToYMD(date));
    };

    const handleNextDay = () => {
        const date = parseYMDToDate(currentDay);
        date.setUTCDate(date.getUTCDate() + 1);
        setCurrentDay(formatDateToYMD(date));
    };

    // Обработчики для недельного представления
    const handlePrevWeek = () => {
        const date = parseYMDToDate(currentWeekStart);
        date.setUTCDate(date.getUTCDate() - 7);
        setCurrentWeekStart(formatDateToYMD(date));
    };

    const handleNextWeek = () => {
        const date = parseYMDToDate(currentWeekStart);
        date.setUTCDate(date.getUTCDate() + 7);
        setCurrentWeekStart(formatDateToYMD(date));
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
        } else if (currentView === 'day') {
            setCurrentDay(formatDateToYMD(today));
        } else {
            setCurrentWeekStart(getCurrentWeekMonday(today));
        }
    };

    // Форматирование отображаемого диапазона дат
    const formatDateRange = () => {
        if (currentView === 'month' && currentMonth > 0) {
            // Create date for formatting month name
            const date = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
            return formatDateWithOptions(date, DATE_CONFIG.FORMAT_OPTIONS.monthYear);
        } else if (currentView === 'week' && currentWeekStart) {
            const start = parseYMDToDate(currentWeekStart);
            const end = new Date(start);
            end.setUTCDate(end.getUTCDate() + 6);

            return `${formatDateWithOptions(start, DATE_CONFIG.FORMAT_OPTIONS.monthDay)} - ${formatDateWithOptions(end, DATE_CONFIG.FORMAT_OPTIONS.monthDay)}`;
        } else if (currentView === 'day' && currentDay) {
            const date = parseYMDToDate(currentDay);
            // Format as "Tuesday 3/4"
            const weekday = formatDateWithOptions(date, DATE_CONFIG.FORMAT_OPTIONS.weekday);
            const shortDate = `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
            return `${weekday} ${shortDate}`;
        }
        return '';
    };

    // Обработчик переключения между режимами
    const handleViewChange = (view: TableView) => {
        setCurrentView(view);

        // When switching to day view, always set the current day to today
        if (view === 'day') {
            const today = new Date();
            setCurrentDay(formatDateToYMD(today));
        }
    };

    // Общий обработчик для кнопок переключения
    const handleNavigation = (direction: 'prev' | 'next') => {
        if (currentView === 'week') {
            direction === 'prev' ? handlePrevWeek() : handleNextWeek();
        } else if (currentView === 'month') {
            direction === 'prev' ? handlePrevMonth() : handleNextMonth();
        } else if (currentView === 'day') {
            direction === 'prev' ? handlePrevDay() : handleNextDay();
        }
    };

    const handleReservationClick = (rowId: string, day: string, reservation?: ReservationExtenstion) => {
        setSelectedReservation({ rowId, day, reservation });
        if (!reservation) {
            setSelectedReservation(null);
        }
    };

    // Adapter for TableDay component
    const handleTableDayReservationClick = (rowId: string, hour: string, boat?: any) => {
        // If a boat was passed, make it compatible with TableReservations.Boat
        if (boat) {
            // Add the required fields that might be missing in TableDay.Boat
            const compatibleBoat = {
                ...boat,
                mooring_ball_id: boat.mooring_ball_id || rowId,
                reservation_id: boat.reservation_id || boat.id
            };
            handleReservationClick(rowId, hour, compatibleBoat);
        } else {
            handleReservationClick(rowId, hour, undefined);
        }
    };

    const handleClosePopup = () => {
        setSelectedReservation(null);
    };

    return (
        <Box
            bg="var(--chakra-colors-ui-light)"
            padding="var(--chakra-space-xl)"
            minH="100vh"
        >
            <Flex direction="row">
                <Box
                    width={selectedReservation ? "70%" : "100%"}
                    transition="all 0.3s ease"
                    padding="var(--chakra-space-xl)"
                    bg="white"
                    borderRadius="var(--chakra-space-xl)"
                >
                    <Box mb="var(--chakra-space-xl)">
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
                        overflow="hidden"
                        bg="white"
                    >
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
                        {currentView === 'day' && (
                            <TableDay
                                currentDate={currentDay}
                                onReservationClick={handleTableDayReservationClick}
                            />
                        )}
                    </Box>
                </Box>
                {selectedReservation && (
                    <Box
                        width="30%"
                        paddingLeft="var(--chakra-space-lg)"
                    >
                        <PopupReserved
                            isOpen={!!selectedReservation}
                            onClose={handleClosePopup}
                            rowId={selectedReservation.rowId}
                            day={selectedReservation.day}
                            reservation={selectedReservation.reservation}
                        />
                    </Box>
                )}
            </Flex>
        </Box>
    );
}
