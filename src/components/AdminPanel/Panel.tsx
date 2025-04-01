import { Box } from '@chakra-ui/react';
import TableWeek from './TableWeek';
import TableSwitch from './TableSwitch';
import { useEffect } from 'react';
import { useState } from 'react';
import TableDay from './TableDay';
import TableMonth from './TableMonth';

type TableView = 'month' | 'week' | 'day';

const Panel: React.FC = () => {
    const [currentWeekStart, setCurrentWeekStart] = useState<string>('');
    const [currentView, setCurrentView] = useState<TableView>('week');

    const getCurrentWeekMonday = (date = new Date()) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff)).toISOString().split('T')[0];
    };

    useEffect(() => {
        setCurrentWeekStart(getCurrentWeekMonday());
    }, []);

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

    const formatWeekRange = () => {
        if (!currentWeekStart) return '';
        const start = new Date(currentWeekStart);
        const end = new Date(new Date(currentWeekStart).getTime() + 6 * 24 * 60 * 60 * 1000);
        return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
    };

    return (
        <>
            <Box m='auto' w='98%' bg='white' rounded='25px'>
                <TableSwitch
                    onPrevWeek={handlePrevWeek}
                    onNextWeek={handleNextWeek}
                    onToday={handleToday}
                    weekRange={formatWeekRange()}
                    currentView={currentView}
                    onViewChange={setCurrentView}
                />
                {currentView === 'week' && <TableWeek currentWeekStart={currentWeekStart} />}
                {currentView === 'month' && <TableMonth />}
                {currentView === 'day' && <TableDay />}
            </Box>
        </>
    );
};

export default Panel;