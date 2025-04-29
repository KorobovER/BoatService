// TableWeek.tsx
import React, { useMemo } from 'react';
import { Box, Text, Image, Flex, Popover, PopoverTrigger, PopoverContent, PopoverBody, Spinner, Center } from '@chakra-ui/react';
import TableReservations, { Boat } from './TableReservations';
import HoverReservation from './HoverReservation';

interface TableWeekProps {
    currentWeekStart: string;
    onReservationClick: (rowId: string, day: string, boat?: Boat) => void;
}

const TableWeek: React.FC<TableWeekProps> = ({ currentWeekStart, onReservationClick }) => {
    // Функция для получения текущего понедельника как запасного варианта
    const getCurrentMonday = (): string => {
        const today = new Date();
        // Используем UTC для избежания проблем с часовыми поясами
        const utcToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
        const day = utcToday.getUTCDay();
        const diff = utcToday.getUTCDate() - day + (day === 0 ? -6 : 1); // Корректировка для недели, начинающейся с понедельника
        
        const monday = new Date(utcToday);
        monday.setUTCDate(diff);
        
        const year = monday.getUTCFullYear();
        const month = String(monday.getUTCMonth() + 1).padStart(2, '0');
        const date = String(monday.getUTCDate()).padStart(2, '0');
        
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
            
            // Создаем дату в UTC
            const baseDate = new Date(Date.UTC(year, month - 1, day));
            
            // Проверяем, что baseDate - валидная дата
            if (isNaN(baseDate.getTime())) {
                console.error('Invalid date created:', baseDate);
                return [];
            }

            // Формируем массив из 7 дней
            return Array.from({ length: 7 }, (_, i) => {
                // Создаем новую дату для каждого дня недели
                const currentDate = new Date(baseDate);
                currentDate.setUTCDate(baseDate.getUTCDate() + i);
                
                // Форматируем дату в UTC
                const currentYear = currentDate.getUTCFullYear();
                const currentMonth = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
                const currentDay = String(currentDate.getUTCDate()).padStart(2, '0');
                
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
                        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
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
                    bg="#FAE8D9"
                    borderRadius="full"
                    width="100%"
                    height="44px"
                    zIndex="1"
                />
            )}
        </>
    );

    const renderBoatCell = (boat: Boat, _colspan: number, textColor: string) => {
        return (
            <Popover trigger="hover" placement="bottom" strategy="fixed">
                <PopoverTrigger>
                    <Flex
                        width="100%"
                        height="100%"
                        gap="8px"
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
                    border="1px solid var(--chakra-colors-basic-grey200)"
                    borderRadius="var(--chakra-radii-md)"
                    bg="basic.grey100"
                    _focus={{ outline: 'none' }}
                >
                    <PopoverBody>
                        <HoverReservation boat={boat} />
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