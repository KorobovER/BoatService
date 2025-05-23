// TableMonth.tsx
import React from 'react';
import { Box, Text, Flex, Popover, PopoverTrigger, PopoverContent, PopoverBody } from '@chakra-ui/react';
import TableReservations from '../Calendar/TableReservations';
import BoatCell from './BoatCell';
import { ReservationExtenstion } from '../ReservationExtenstion';
import { renderEdgeIcon } from './TableReservations';
import HoverReservation from './HoverReservation';

interface TableMonthProps {
    currentMonthDate: string;
    onReservationClick: (rowId: string, day: string, boat?: ReservationExtenstion) => void;
}

const TableMonth: React.FC<TableMonthProps> = ({ currentMonthDate, onReservationClick }) => {
    // Simple function to generate month dates
    const getMonthDates = () => {
        try {
            // Parse the year and month from the date string
            const parts = currentMonthDate.split('-');
            if (parts.length < 2) return [];

            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);

            if (isNaN(year) || isNaN(month)) return [];

            // Get last day of month using UTC (day 0 of next month)
            const lastDayDate = new Date(Date.UTC(year, month, 0));
            const lastDay = lastDayDate.getUTCDate();

            // Generate dates array - ALWAYS starting from 1st day
            const dates = [];
            for (let day = 1; day <= lastDay; day++) {
                const formatted = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                dates.push(formatted);
            }

            return dates;
        } catch (error) {
            console.error('Error generating month dates:', error);
            return [];
        }
    };

    const isToday = (day: string) => {
        try {
            // Получаем текущую системную дату
            const today = new Date();
            const todayYear = today.getFullYear();
            const todayMonth = today.getMonth() + 1; // +1 потому что в JS месяцы от 0 до 11
            const todayDay = today.getDate();

            // Парсим дату из строки
            const [year, month, dayOfMonth] = day.split('-').map(Number);
            if (isNaN(year) || isNaN(month) || isNaN(dayOfMonth)) return false;

            // Сравниваем компоненты даты с системными
            return (
                dayOfMonth === todayDay &&
                month === todayMonth &&
                year === todayYear
            );
        } catch (error) {
            console.error('Error in isToday:', error);
            return false;
        }
    };

    const renderHeader = (day: string) => (
        <Flex
            position="relative"
            width="100%"
            height="100%"
            alignItems="center"
            justifyContent="center"
        >
            {isToday(day) && (
                <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    bg="var(--chakra-colors-calendar-todayBg)"
                    borderRadius="full"
                    width="90%"
                    height={{ base: "30px", sm: "34px", md: "36px" }}
                    zIndex="1"
                />
            )}
            <Text
                color={isToday(day) ? "basic.grey900" : "basic.grey600"}
                fontSize={{ base: "12px", sm: "13px", md: "14px" }}
                fontWeight="500"
                textAlign="center"
                position="relative"
                zIndex="2"
            >
                {(() => {
                    try {
                        const [year, month, dayOfMonth] = day.split('-').map(Number);
                        const date = new Date(Date.UTC(year, month - 1, dayOfMonth));
                        return date.getUTCDate();
                    } catch (error) {
                        console.error('Error parsing date:', error);
                        return '?';
                    }
                })()}
            </Text>
        </Flex>
    );

    const renderBoatCell = (boat: ReservationExtenstion, colspan: number, textColor: string) => {
        return (
            <Popover trigger="hover" placement="top" strategy="fixed">
                <PopoverTrigger>
                    <Flex
                        position="relative"
                        width="100%"
                        height="100%"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <BoatCell reservation={boat} textColor={textColor} colspan={colspan} isMonthView={true} />
                        {(boat.startsBefore || boat.endsAfter) && (
                            <>
                                {boat.startsBefore && (
                                    <Box
                                        position="absolute"
                                        top="0"
                                        left="0"
                                        height="100%"
                                        width="8px"
                                        bg="white"
                                    >
                                        {renderEdgeIcon(boat, true)}
                                    </Box>
                                )}
                                {boat.endsAfter && (
                                    <Box
                                        position="absolute"
                                        top="0"
                                        right="0"
                                        height="100%"
                                        width="8px"
                                        bg="white"
                                    >
                                        {renderEdgeIcon(boat, false)}
                                    </Box>
                                )}
                            </>
                        )}
                    </Flex>
                </PopoverTrigger>
                <PopoverContent
                    width='fit-content'
                    border="1px solid var(--chakra-colors-basic-grey200)"
                    borderRadius="var(--chakra-radii-md)"
                    bg="basic.grey100"
                    _focus={{ outline: 'none' }}
                    zIndex={9999}
                    style={{
                        opacity: '1 !important',
                        filter: 'none !important',
                        pointerEvents: 'auto',
                        visibility: 'visible',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                >
                    <PopoverBody>
                        <HoverReservation reservation={boat} />
                    </PopoverBody>
                </PopoverContent>
            </Popover>
        );
    };

    // Get the dates once
    const monthDays = getMonthDates();

    return (
        <TableReservations
            days={monthDays}
            cellWidth="32px"
            renderHeader={renderHeader}
            renderBoatCell={renderBoatCell}
            currentDate={currentMonthDate}
            onReservationClick={onReservationClick}
            isMonthView={true}
        />
    );
};

export default TableMonth;
