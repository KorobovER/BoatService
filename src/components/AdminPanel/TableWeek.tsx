// TableWeek.tsx
import React from 'react';
import { Box, Text, Image, Flex, Button, Popover, PopoverTrigger, PopoverContent, PopoverBody, Link } from '@chakra-ui/react';
import TableReservations, { Boat } from './TableReservations';

interface TableWeekProps {
    currentWeekStart: string;
    onReservationClick: (rowId: string, day: string, boat?: Boat) => void;
}

const TableWeek: React.FC<TableWeekProps> = ({ currentWeekStart, onReservationClick }) => {
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
                        const date = new Date(day);
                        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
                        const month = date.getMonth() + 1;
                        const dayOfMonth = date.getDate();
                        return `${dayOfWeek} ${month}/${dayOfMonth}`;
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

    const renderBoatCell = (boat: Boat, _colspan: number, textColor: string) => (
        <Popover trigger="hover" placement="bottom" strategy="fixed">
            <PopoverTrigger>
                <Flex
                    width="100%"
                    height="100%"
                    p="5px"
                    gap="8px"
                    alignItems="center"
                    justifyContent="center"
                >
                    {boat.vessel_type === 'power' ? (
                        <Image
                            src="/assets/images/power-boat.png"
                            alt={boat.name}
                            width="22px"
                            height="22px"
                            objectFit="cover"
                            borderRadius="4px"
                            filter={textColor === "white" ? "brightness(0) invert(1)" : "brightness(0)"}
                        />
                    ) : boat.vessel_type === 'catamaran' ? (
                        <Image
                            src="/assets/images/catamaran-boat.png"
                            alt={boat.name}
                            width="22px"
                            height="22px"
                            objectFit="cover"
                            borderRadius="4px"
                            filter={textColor === "white" ? "brightness(0) invert(1)" : "brightness(0)"}
                        />
                    ) : boat.vessel_type === 'monohull' ? (
                        <Image
                            src="/assets/images/monohul-boat.png"
                            alt={boat.name}
                            width="22px"
                            height="22px"
                            objectFit="cover"
                            borderRadius="4px"
                            filter={textColor === "white" ? "brightness(0) invert(1)" : "brightness(0)"}
                        />
                    ) : (
                        <Text color={textColor} fontSize="14px" fontWeight="500">{boat.name}</Text>
                    )}
                    <Box>
                        <Text color={textColor} fontSize="16px" fontWeight="400">{boat.name}</Text>
                        <Text color={textColor} fontSize="12px" fontWeight="300" opacity="0.8">{boat.code}</Text>
                    </Box>
                </Flex>
            </PopoverTrigger>
            <PopoverContent 
                width="fit-content" 
                border="1px solid #D2D2D2" 
                borderRadius="8px"
                _focus={{ outline: 'none' }}
            >
                <PopoverBody p="8px">
                    <Flex gap='8px' alignItems='center' color="black">
                        <Box>
                            <Flex gap='8px' alignItems='center'>
                                {boat.vessel_type === 'power' ? (
                                    <Image
                                        src="/assets/images/power-boat.png"
                                        alt={boat.name}
                                        width="22px"
                                        height="22px"
                                        objectFit="cover"
                                        borderRadius="4px"
                                        filter="brightness(0)"
                                    />
                                ) : boat.vessel_type === 'catamaran' ? (
                                    <Image
                                        src="/assets/images/catamaran-boat.png"
                                        alt={boat.name}
                                        width="22px"
                                        height="22px"
                                        objectFit="cover"
                                        borderRadius="4px"
                                        filter="brightness(0)"
                                    />
                                ) : boat.vessel_type === 'monohull' ? (
                                    <Image
                                        src="/assets/images/monohul-boat.png"
                                        alt={boat.name}
                                        width="22px"
                                        height="22px"
                                        objectFit="cover"
                                        borderRadius="4px"
                                        filter="brightness(0)"
                                    />
                                ) : (
                                    <Text color="white" fontSize="14px" fontWeight="500">{boat.name}</Text>
                                )}
                                <Text fontSize="14px" fontWeight="500">{boat.name}</Text>
                                <Text fontSize="14px" fontWeight="300" opacity="0.8">|</Text>
                                <Text fontSize="14px" fontWeight="300" opacity="0.8">
                                    {boat.code}
                                </Text>
                            </Flex>
                            <Flex p='8px 0px' gap='16px'>
                                <Flex gap='4px'>
                                    <Text fontSize="14px" fontWeight="400" color='white' bg='black' p='0 8px' borderRadius='56px'>In</Text>
                                    <Text fontSize="14px" fontWeight="400" color='black'>{`${new Date(boat.startDay).getDate()} ${new Date(boat.startDay).toLocaleString('en-US', { month: 'long' })}`}</Text>
                                </Flex>
                                <Flex gap='4px'>
                                    <Text fontSize="14px" fontWeight="400" color='white' bg='black' p='0 8px' borderRadius='56px'>Out</Text>
                                    <Text fontSize="14px" fontWeight="400" color='black'>{`${new Date(boat.endDay).getDate()} ${new Date(boat.endDay).toLocaleString('en-US', { month: 'long' })}`}</Text>
                                </Flex>
                            </Flex>
                            <Flex gap='24px' alignItems="flex-end">
                                <Button 
                                    borderRadius='full' 
                                    bg='#FEA02F' 
                                    fontSize='14px' 
                                    fontWeight='400'
                                    color='black' 
                                    sx={{ 
                                        padding: '4px 8px !important',
                                        minHeight: 'unset',
                                        height: 'auto',
                                        lineHeight: '1.2'
                                    }}
                                >
                                    service request
                                </Button>
                                <Link variant="unstyled" textDecoration="underline" fontSize='14px' fontWeight='400'>Open detail view</Link>
                            </Flex>
                        </Box>
                    </Flex>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );

    return (
        <TableReservations
            days={days}
            cellWidth="150px"
            renderHeader={renderHeader}
            renderBoatCell={renderBoatCell}
            currentDate={currentWeekStart}
            onReservationClick={onReservationClick}
        />
    );
};

export default TableWeek;