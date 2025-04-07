// TableMonth.tsx
import React from 'react';
import { Box, Text, Image } from '@chakra-ui/react';
import TableReservations, { Boat } from './TableReservations';

interface TableMonthProps {
    currentMonthDate: string;
}

const TableMonth: React.FC<TableMonthProps> = ({ currentMonthDate }) => {
    const getMonthDates = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = date.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            
            const datesArray = [];
            const currentDate = new Date(firstDay);

            while (currentDate <= lastDay) {
                datesArray.push(currentDate.toISOString().split('T')[0]);
                currentDate.setDate(currentDate.getDate() + 1);
            }

            return datesArray;
        } catch (error) {
            console.error('Error in getMonthDates:', error);
            return [];
        }
    };

    const days = getMonthDates(currentMonthDate);

    const isToday = (day: string) => {
        try {
            const today = new Date();
            const date = new Date(day);
            return (
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear()
            );
        } catch (error) {
            console.error('Error in isToday:', error);
            return false;
        }
    };

    const renderHeader = (day: string) => (
        <>
            {isToday(day) && (
                <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    bg="#DD660026"
                    borderRadius="full"
                    width="44px"
                    height="44px"
                    zIndex="1"
                />
            )}
            <Text textAlign="center">
                {(() => {
                    try {
                        return new Date(day).getDate();
                    } catch (error) {
                        console.error('Error in renderHeader:', error);
                        return '?';
                    }
                })()}
            </Text>
        </>
    );

    const renderBoatCell = (boat: Boat, colspan: number) => (
        <Box width="100%" height="100%" position="relative" display="flex" justifyContent="center" alignItems="center">
            {boat.registration_image_url ? (
                <Image
                    src={boat.registration_image_url}
                    alt={boat.name}
                    width="18px"
                    height="18px"
                    objectFit="cover"
                    borderRadius="4px"
                />
            ) : (
                <Text color="white" fontSize="10px">{boat.name[0]}</Text>
            )}
            {colspan > 1 && <Text color="white" fontSize="10px" ml="4px">{boat.name}</Text>}
        </Box>
    );

    return (
        <TableReservations
            days={days}
            cellWidth="40px"
            renderHeader={renderHeader}
            renderBoatCell={renderBoatCell}
            currentDate={currentMonthDate}
        />
    );
};

export default TableMonth;