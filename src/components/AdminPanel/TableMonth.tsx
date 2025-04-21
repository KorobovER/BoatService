// TableMonth.tsx
import React from 'react';
import { Box, Text, Image, Flex, Button, Popover, PopoverTrigger, PopoverContent, PopoverBody, Link } from '@chakra-ui/react';
import TableReservations, { Boat } from './TableReservations';

interface TableMonthProps {
    currentMonthDate: string;
    onReservationClick: (rowId: string, day: string, boat?: Boat) => void;
}

const TableMonth: React.FC<TableMonthProps> = ({ currentMonthDate, onReservationClick }) => {
    const getMonthDates = (dateString: string) => {
        try {
            // Создаем дату в UTC
            const date = new Date(dateString + 'T00:00:00.000Z');
            const year = date.getUTCFullYear();
            const month = date.getUTCMonth();
            
            // Получаем первый день месяца в UTC
            const firstDay = new Date(Date.UTC(year, month, 1));
            // Получаем последний день месяца в UTC
            const lastDay = new Date(Date.UTC(year, month + 1, 0));
            
            const datesArray = [];
            // Начинаем с первого дня месяца
            const currentDate = new Date(firstDay);
            
            // Добавляем дни до последнего дня месяца включительно
            while (currentDate <= lastDay) {
                datesArray.push(currentDate.toISOString().split('T')[0]);
                currentDate.setUTCDate(currentDate.getUTCDate() + 1);
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

    const renderBoatCell = (boat: Boat, colspan: number, textColor: string) => {
        const isSingleDay = colspan === 1;
        
        return (
            <Popover trigger="hover" placement="bottom" strategy="fixed">
                <PopoverTrigger>
                    <Flex
                        width="100%"
                        height="100%"
                        p="5px"
                        gap="8px"
                        alignItems="center"
                        justifyContent="center"
                        maxWidth="100%"
                        overflow="hidden"
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
                            <Text color={textColor} fontSize="10px">{boat.name[0]}</Text>
                        )}
                        {!isSingleDay && (
                            <Box maxWidth="calc(100% - 30px)" overflow="hidden">
                                <Text color={textColor} fontSize="16px" fontWeight="400" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{boat.name}</Text>
                                <Text color={textColor} fontSize="12px" fontWeight="300" opacity="0.8" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{boat.code}</Text>
                            </Box>
                        )}
                    </Flex>
                </PopoverTrigger>
                <PopoverContent 
                    width="300px" 
                    border="1px solid #D2D2D2" 
                    borderRadius="8px" 
                    overflow="hidden"
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
                                        <Text color="white" fontSize="14px" fontWeight="500" whiteSpace="nowrap">{boat.name}</Text>
                                    )}
                                    <Text fontSize="14px" fontWeight="500" whiteSpace="nowrap">{boat.name}</Text>
                                    <Text fontSize="14px" fontWeight="300" opacity="0.8">|</Text>
                                    <Text fontSize="14px" fontWeight="300" opacity="0.8" whiteSpace="nowrap">
                                        {boat.code}
                                    </Text>
                                </Flex>
                                <Flex p='8px 0px' gap='16px'>
                                    <Flex gap='4px'>
                                        <Text fontSize="14px" fontWeight="400" color='white' bg='black' p='0 8px' borderRadius='56px'>In</Text>
                                        <Text fontSize="14px" fontWeight="400" color='black' whiteSpace="nowrap">{`${new Date(boat.startDay).getDate()} ${new Date(boat.startDay).toLocaleString('en-US', { month: 'long' })}`}</Text>
                                    </Flex>
                                    <Flex gap='4px'>
                                        <Text fontSize="14px" fontWeight="400" color='white' bg='black' p='0 8px' borderRadius='56px'>Out</Text>
                                        <Text fontSize="14px" fontWeight="400" color='black' whiteSpace="nowrap">{`${new Date(boat.endDay).getDate()} ${new Date(boat.endDay).toLocaleString('en-US', { month: 'long' })}`}</Text>
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
                                    <Link variant="unstyled" textDecoration="underline" fontSize='14px' fontWeight='400' whiteSpace="nowrap">Open detail view</Link>
                                </Flex>
                            </Box>
                        </Flex>
                    </PopoverBody>
                </PopoverContent>
            </Popover>
        );
    };

    return (
        <TableReservations
            days={days}
            cellWidth="32px"
            renderHeader={renderHeader}
            renderBoatCell={renderBoatCell}
            currentDate={currentMonthDate}
            onReservationClick={onReservationClick}
        />
    );
};

export default TableMonth;