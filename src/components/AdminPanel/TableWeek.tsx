// TableWeek.tsx
import React from 'react';
import { Box, Text, Image, Tooltip } from '@chakra-ui/react';
import TableReservations, { Boat } from './TableReservations';

interface TableWeekProps {
    currentWeekStart: string;
}

const TableWeek: React.FC<TableWeekProps> = ({ currentWeekStart }) => {
    const getWeekDates = (startDate: string) => {
        try {
            const date = new Date(startDate);
            return Array.from({ length: 7 }, (_, i) => {
                const currentDate = new Date(date);
                currentDate.setDate(date.getDate() + i);
                return currentDate.toISOString().split('T')[0];
            });
        } catch (error) {
            console.error('Error in getWeekDates:', error);
            return [];
        }
    };

    const days = getWeekDates(currentWeekStart);

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
            <Text color="#777777" textAlign="center">
                {(() => {
                    try {
                        return new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    } catch (error) {
                        console.error('Error in renderHeader:', error);
                        return 'Invalid Date';
                    }
                })()}
            </Text>
            {isToday(day) && (
                <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    bg="#DD660026"
                    borderRadius="full"
                    width="150px"
                    height="44px"
                    zIndex="1"
                />
            )}
        </>
    );

    const renderBoatCell = (boat: Boat) => (
        <Tooltip
            hasArrow
            label={
                <Box width="200px" p="2" bg="white" borderRadius="sm" color="black">
                    <Text fontSize="14px" fontWeight="500">{boat.name}</Text>
                    <Text fontSize="14px" fontWeight="300" opacity="0.8">
                        {boat.code} - {new Date(boat.startDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(boat.endDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                </Box>
            }
            bg="transparent"
            placement="bottom"
        >
            <Box
                borderRadius="5px"
                p="5px"
                width="fit-content"
                height="100%"
                display="flex"
                gap="8px"
                alignItems="center"
                margin="0 auto"
            >
                {boat.vessel_type === 'power' ? (
                    <Image
                        src="/assets/images/power-boat.png"
                        alt={boat.name}
                        width="22px"
                        height="22px"
                        objectFit="cover"
                        borderRadius="4px"
                        filter="brightness(0) invert(1)"
                    />
                ) : boat.vessel_type === 'catamaran' ? (
                    <Image
                        src="/assets/images/catamaran-boat.png"
                        alt={boat.name}
                        width="22px"
                        height="22px"
                        objectFit="cover"
                        borderRadius="4px"
                        filter="brightness(0) invert(1)"
                    />
                ) : boat.vessel_type === 'monohull' ? (
                    <Image
                        src="/assets/images/monohul-boat.png"
                        alt={boat.name}
                        width="22px"
                        height="22px"
                        objectFit="cover"
                        borderRadius="4px"
                        filter="brightness(0) invert(1)"
                    />
                ) : (
                    <Text color="white" fontSize="14px" fontWeight="500">{boat.name}</Text>
                )}
                <Box>
                    <Text color="white" fontSize="16px" fontWeight="400">{boat.name}</Text>
                    <Text color="white" fontSize="12px" fontWeight="300" opacity="0.8">{boat.code}</Text>
                </Box>
            </Box>
        </Tooltip>
    );

    return (
        <TableReservations
            days={days}
            cellWidth="150px"
            renderHeader={renderHeader}
            renderBoatCell={renderBoatCell}
            currentDate={currentWeekStart}
        />
    );
};

export default TableWeek;