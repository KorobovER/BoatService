// TableMonth.tsx
import React from 'react';
import { Box, Text, Image, Flex, Button, Popover, PopoverTrigger, PopoverContent, PopoverBody, Link } from '@chakra-ui/react';
import TableReservations, { Boat } from './TableReservations';

interface TableMonthProps {
    currentMonthDate: string;
    onReservationClick: (rowId: string, day: string, boat?: Boat) => void;
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
        <>
            {isToday(day) && (
                <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    bg="#FAE8D9"
                    borderRadius="full"
                    width="44px"
                    height="44px"
                    zIndex="1"
                />
            )}
            <Text 
                color={isToday(day) ? "basic.grey900" : "basic.grey600"} 
                fontSize="14px"
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
        </>
    );

    const renderBoatCell = (boat: Boat, colspan: number, textColor: string) => {
        // Use colspan < 2 to determine if the reservation is short (< 2 days)
        const isShortReservation = colspan < 2; 
        // Keep the existing isHalfDay for potential specific half-day styling if needed elsewhere
        const isHalfDay = colspan < 1;

        return (
            <Popover trigger="hover" placement="bottom" strategy="fixed">
                <PopoverTrigger>
                    <Flex
                        width="100%"
                        height="100%"
                        p={isHalfDay ? "2px" : "5px"} // Padding might still depend on isHalfDay
                        gap={isShortReservation ? "0" : "8px"} // No gap if only icon
                        alignItems="center"
                        // Always justify center
                        justifyContent="center" 
                    >
                        {/* Boat Icon Logic (Image or Text) */}
                        {boat.vessel_type === 'power' ? (
                            <Image
                                src="/assets/images/power-boat.svg"
                                alt={boat.name}
                                width="22px" // Consistent size
                                height="22px"
                                objectFit="cover"
                                borderRadius="4px"
                                filter={textColor === "white" ? "brightness(0) invert(1)" : "brightness(0)"}
                            />
                        ) : boat.vessel_type === 'catamaran' ? (
                            <Image
                                src="/assets/images/catamaran-boat.svg"
                                alt={boat.name}
                                width="22px" // Consistent size
                                height="22px"
                                objectFit="cover"
                                borderRadius="4px"
                                filter={textColor === "white" ? "brightness(0) invert(1)" : "brightness(0)"}
                            />
                        ) : boat.vessel_type === 'monohull' ? (
                            <Image
                                src="/assets/images/monohul-boat.svg"
                                alt={boat.name}
                                width="22px" // Consistent size
                                height="22px"
                                objectFit="cover"
                                borderRadius="4px"
                                filter={textColor === "white" ? "brightness(0) invert(1)" : "brightness(0)"}
                            />
                        ) : (
                            // Fallback if no specific type, maybe just use first letter if short?
                            <Text color={textColor} fontSize="14px" fontWeight="400">
                                {isShortReservation ? boat.name[0] : boat.name} 
                            </Text>
                        )}
                        
                        {/* Conditionally render the text block */}
                        {!isShortReservation && (
                            <Box maxWidth="calc(100% - 30px)" overflow="hidden" textAlign="left">
                                <Text color={textColor} fontSize={"16px"} fontWeight="400" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{boat.name}</Text>
                                <Text color={textColor} fontSize={"12px"} fontWeight="300" opacity="0.8" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{boat.code}</Text>
                            </Box>
                        )}
                    </Flex>
                </PopoverTrigger>
                <PopoverContent 
                    width="fit-content" 
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
                                            src="/assets/images/power-boat.svg"
                                            alt={boat.name}
                                            width="22px"
                                            height="22px"
                                            objectFit="cover"
                                            borderRadius="4px"
                                            filter="brightness(0)"
                                        />
                                    ) : boat.vessel_type === 'catamaran' ? (
                                        <Image
                                            src="/assets/images/catamaran-boat.svg"
                                            alt={boat.name}
                                            width="22px"
                                            height="22px"
                                            objectFit="cover"
                                            borderRadius="4px"
                                            filter="brightness(0)"
                                        />
                                    ) : boat.vessel_type === 'monohull' ? (
                                        <Image
                                            src="/assets/images/monohul-boat.svg"
                                            alt={boat.name}
                                            width="22px"
                                            height="22px"
                                            objectFit="cover"
                                            borderRadius="4px"
                                            filter="brightness(0)"
                                        />
                                    ) : (
                                        <Text color="white" fontSize="14px" fontWeight="500" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{boat.name}</Text>
                                    )}
                                    <Text fontSize="14px" fontWeight="500" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{boat.name}</Text>
                                    <Text fontSize="14px" fontWeight="300" opacity="0.8">|</Text>
                                    <Text fontSize="14px" fontWeight="300" opacity="0.8" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                                        {boat.code}
                                    </Text>
                                </Flex>
                                <Flex p='8px 0px' gap='16px'>
                                    <Flex gap='4px'>
                                        <Text fontSize="14px" fontWeight="400" color='white' bg='black' p='0 8px' borderRadius='56px'>In</Text>
                                        <Text fontSize="14px" fontWeight="400" color='black' whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                                            {(() => {
                                                try {
                                                    const date = boat.startDateObj || new Date(boat.startDay);
                                                    // Использовать toLocaleString для форматирования даты в локальной временной зоне
                                                    return date.toLocaleString('en-US', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true,
                                                    }).replace(',', ' •');
                                                } catch (error) {
                                                    return boat.startDay;
                                                }
                                            })()}
                                        </Text>
                                    </Flex>
                                    <Flex gap='4px'>
                                        <Text fontSize="14px" fontWeight="400" color='white' bg='black' p='0 8px' borderRadius='56px'>Out</Text>
                                        <Text fontSize="14px" fontWeight="400" color='black' whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                                            {(() => {
                                                try {
                                                    const date = boat.endDateObj || new Date(boat.endDay);
                                                    // Использовать toLocaleString для форматирования даты в локальной временной зоне
                                                    return date.toLocaleString('en-US', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true,
                                                    }).replace(',', ' •');
                                                } catch (error) {
                                                    return boat.endDay;
                                                }
                                            })()}
                                        </Text>
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
                                    <Link variant="unstyled" textDecoration="underline" fontSize='14px' fontWeight='400' whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">Open detail view</Link>
                                </Flex>
                            </Box>
                        </Flex>
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