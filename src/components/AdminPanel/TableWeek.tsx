// TableWeek.tsx
import React, { useMemo } from 'react';
import { Box, Text, Image, Flex, Button, Popover, PopoverTrigger, PopoverContent, PopoverBody, Link, Spinner, Center } from '@chakra-ui/react';
import TableReservations, { Boat } from './TableReservations';

interface TableWeekProps {
    currentWeekStart: string;
    onReservationClick: (rowId: string, day: string, boat?: Boat) => void;
}

const TableWeek: React.FC<TableWeekProps> = ({ currentWeekStart, onReservationClick }) => {
    // Функция для получения текущего понедельника как запасного варианта
    const getCurrentMonday = (): string => {
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Корректировка для недели, начинающейся с понедельника
        
        const monday = new Date(today);
        monday.setDate(diff);
        
        const year = monday.getFullYear();
        const month = String(monday.getMonth() + 1).padStart(2, '0');
        const date = String(monday.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${date}`;
    };
    
    const getWeekDates = (startDate: string): string[] => {
        try {
            // Если startDate пустая, используем текущий понедельник
            const effectiveStartDate = startDate && startDate.trim() !== '' 
                ? startDate 
                : getCurrentMonday();
            
            // Если всё еще проблемы с датой, логируем и возвращаем пустой массив
            if (!effectiveStartDate || typeof effectiveStartDate !== 'string' || effectiveStartDate.trim() === '') {
                console.error('Invalid startDate even after fallback:', effectiveStartDate);
                return [];
            }

            // Разбираем дату вручную для избежания проблем с часовыми поясами
            const [year, month, day] = effectiveStartDate.split('-').map(num => parseInt(num, 10));
            
            // Проверяем корректность компонентов даты
            if (isNaN(year) || isNaN(month) || isNaN(day) || 
                month < 1 || month > 12 || day < 1 || day > 31) {
                console.error('Invalid date components:', { year, month, day });
                return [];
            }
            
            // Создаем дату в локальном часовом поясе
            const baseDate = new Date(year, month - 1, day);
            
            // Проверяем, что baseDate - валидная дата
            if (isNaN(baseDate.getTime())) {
                console.error('Invalid date created:', baseDate);
                return [];
            }

            // Формируем массив из 7 дней
            return Array.from({ length: 7 }, (_, i) => {
                // Создаем новую дату для каждого дня недели
                const currentDate = new Date(baseDate);
                currentDate.setDate(baseDate.getDate() + i);
                
                // Форматируем дату вручную для избежания проблем с toISOString()
                const currentYear = currentDate.getFullYear();
                const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
                const currentDay = String(currentDate.getDate()).padStart(2, '0');
                
                return `${currentYear}-${currentMonth}-${currentDay}`;
            });
        } catch (error) {
            console.error('Error in getWeekDates:', error);
            return [];
        }
    };

    // Используем useMemo для вычисления массива дней только при изменении currentWeekStart
    const days = useMemo(() => getWeekDates(currentWeekStart), [currentWeekStart]);

    // Если массив дней пуст, показываем спиннер
    if (days.length === 0) {
        return (
            <Center height="100vh">
                <Spinner size="xl" color="ui.main" />
            </Center>
        );
    }

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

    const renderBoatCell = (boat: Boat, colspan: number, textColor: string) => {
        const isHalfDay = colspan < 1; // Определяем, что это половина дня или меньше
        
        return (
            <Popover trigger="hover" placement="bottom" strategy="fixed">
                <PopoverTrigger>
                    <Flex
                        width="100%"
                        height="100%"
                        p={isHalfDay ? "2px" : "5px"}
                        gap={isHalfDay ? "2px" : "8px"}
                        alignItems="center"
                        justifyContent="center"
                    >
                        {boat.vessel_type === 'power' ? (
                            <Image
                                src="/assets/images/power-boat.svg"
                                alt={boat.name}
                                width="22px"
                                height="22px"
                                objectFit="cover"
                                borderRadius="4px"
                                filter={textColor === "white" ? "brightness(0) invert(1)" : "brightness(0)"}
                            />
                        ) : boat.vessel_type === 'catamaran' ? (
                            <Image
                                src="/assets/images/catamaran-boat.svg"
                                alt={boat.name}
                                width="22px"
                                height="22px"
                                objectFit="cover"
                                borderRadius="4px"
                                filter={textColor === "white" ? "brightness(0) invert(1)" : "brightness(0)"}
                            />
                        ) : boat.vessel_type === 'monohull' ? (
                            <Image
                                src="/assets/images/monohul-boat.svg"
                                alt={boat.name}
                                width="22px"
                                height="22px"
                                objectFit="cover"
                                borderRadius="4px"
                                filter={textColor === "white" ? "brightness(0) invert(1)" : "brightness(0)"}
                            />
                        ) : (
                            <Text color={textColor} fontSize="14px" fontWeight="400">{boat.name[0]}</Text>
                        )}
                        {/* Показываем дополнительный текст */}
                        <Box maxWidth="calc(100% - 30px)" overflow="hidden" textAlign="left">
                            <Text color={textColor} fontSize="16px" fontWeight="400" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{boat.name}</Text>
                            <Text color={textColor} fontSize="12px" fontWeight="300" opacity="0.8" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{boat.code}</Text>
                        </Box>
                    </Flex>
                </PopoverTrigger>
                <PopoverContent 
                    width="auto" 
                    maxWidth="400px"
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
                                        <Text color="white" fontSize="14px" fontWeight="500">{boat.name}</Text>
                                    )}
                                    <Text fontSize="14px" fontWeight="500" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{boat.name}</Text>
                                    <Text fontSize="14px" fontWeight="300" opacity="0.8">|</Text>
                                    <Text fontSize="14px" fontWeight="300" opacity="0.8" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                                        {boat.code}
                                    </Text>
                                </Flex>
                                <Flex p='8px 0px' gap='16px'>
                                    <Flex gap='4px' whiteSpace="nowrap">
                                        <Text fontSize="14px" fontWeight="400" color='white' bg='black' p='0 8px' borderRadius='56px'>In</Text>
                                        <Text fontSize="14px" fontWeight="400" color='black' whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{`${new Date(boat.startDay).getDate()} ${new Date(boat.startDay).toLocaleString('en-US', { month: 'long' })} • ${boat.startTime || '--:--'}`} <Text as="span" fontSize="10px" fontWeight="bold">{parseInt(boat.startTime?.split(':')[0] || '0') < 12 ? 'AM' : 'PM'}</Text></Text>
                                    </Flex>
                                    <Flex gap='4px' whiteSpace="nowrap">
                                        <Text fontSize="14px" fontWeight="400" color='white' bg='black' p='0 8px' borderRadius='56px'>Out</Text>
                                        <Text fontSize="14px" fontWeight="400" color='black' whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{`${new Date(boat.endDay).getDate()} ${new Date(boat.endDay).toLocaleString('en-US', { month: 'long' })} • ${boat.endTime || '--:--'}`} <Text as="span" fontSize="10px" fontWeight="bold">{parseInt(boat.endTime?.split(':')[0] || '0') < 12 ? 'AM' : 'PM'}</Text></Text>
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
    };

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