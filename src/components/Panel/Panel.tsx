import { Box } from '@chakra-ui/react';
import TableWeek from '../TableWeek/TableWeek';
import TableSwitch from '../TableSwitch/TableSwitch';
import { useEffect } from 'react';
import { useState } from 'react';

const Panel: React.FC = () => {
    const [currentWeekStart, setCurrentWeekStart] = useState<string>('');

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
                />
                <TableWeek currentWeekStart={currentWeekStart} />
            </Box>
        </>
    );
};

export default Panel;