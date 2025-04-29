import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Box,
    Text,
    Image,
    Spinner,
    Flex,
    Center,
    useDisclosure,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td
} from '@chakra-ui/react';
import BollaCell from "../../../public/assets/images/bolla-cell.svg";
import { ReservationsService, MarinasService } from '../../client';
import { useMarina } from '../../context/MarinaContext';
import PopupFreeCell from './PopupFreeCell';
import PopupReserved from './PopupReserved';

// Функция для преобразования S3 URL
const transformS3Url = (url: string): string => {
    if (!url) return '';

    if (url.startsWith('s3://')) {
        const path = url.substring(5);
        const parts = path.split('/');
        const bucket = parts[0];
        const key = parts.slice(1).join('/');
        return `https://s3.amazonaws.com/${bucket}/${key}`;
    }

    return url;
};

interface Row {
    id: string;
    label: string;
    marina?: {
        logo_url: string | null;
    };
}

export interface Boat {
    id: string;
    name: string;
    code: string;
    startDay: string;
    endDay: string;
    startTime?: string;
    endTime?: string;
    marina_id?: string;
    registration_image_url?: string;
    vessel_type?: string;
    service_requests?: Array<{
        is_completed: boolean;
    }>;
    is_completed?: boolean;
    rawStartTime: string;
    rawEndTime: string;
    startsInSecondHalf: boolean;
    endsInFirstHalf: boolean;
    admin_status?: string;
    selectedTimeOfDay?: 'AM' | 'PM';
    displayTime?: string;
    startDateObj: Date;
    endDateObj: Date;
    startsInSecondHalfLocal: boolean;
    endsInFirstHalfLocal: boolean;
}

interface TableDayProps {
    currentDate: string;
    onReservationClick: (rowId: string, hour: string, boat?: Boat) => void;
}

export const getCellColor = (boat: Boat): { bg: string; textColor: string } => {
    if (boat.admin_status === 'require_action') {
        return { bg: "system-error", textColor: "white" };
    }
    
    if (boat.admin_status === 'future_action') {
        return { bg: "system.warningYellow", textColor: "white" };
    }
    
    if (boat.admin_status === 'completed') {
        return { bg: "bg.success", textColor: "basic.grey700" };
    }
    
    return { bg: "system.successGreen", textColor: "white" };
};

const TableDay: React.FC<TableDayProps> = ({
    currentDate,
    onReservationClick,
}) => {
    const { selectedMarina } = useMarina();
    const [boats, setBoats] = useState<Boat[]>([]);
    const [allRows, setAllRows] = useState<Row[]>([]);
    const { isOpen: isFreeCellOpen, onClose: onFreeCellClose } = useDisclosure();
    const { isOpen: isReservedOpen, onClose: onReservedClose } = useDisclosure();
    const [selectedCell, setSelectedCell] = useState<{
        rowId: string;
        hour: string;
        halfHour?: 'first' | 'second';
        boat?: Boat;
    } | null>(null);
    const [currentTimeZone, setCurrentTimeZone] = useState<string>(
        Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    const queryClient = useQueryClient();

    // Generate hours array from 1 AM to 11 PM (23 hours)
    const hours = Array.from({ length: 23 }, (_, i) => {
        const hour = i + 1;
        return hour <= 12 ? `${hour}am` : `${hour - 12}pm`;
    });

    // Update timezone function
    const updateTimeZone = () => {
        setCurrentTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Intl' in window) {
            updateTimeZone();
            window.addEventListener('languagechange', updateTimeZone);
            window.addEventListener('focus', updateTimeZone);
            const intervalId = setInterval(updateTimeZone, 60000);
            
            return () => {
                window.removeEventListener('languagechange', updateTimeZone);
                window.removeEventListener('focus', updateTimeZone);
                clearInterval(intervalId);
            };
        }
    }, []);

    useEffect(() => {
        if (boats.length > 0) {
            queryClient.invalidateQueries({ queryKey: ['mooringBalls'] });
            queryClient.invalidateQueries({ queryKey: ['reservations'] });
        }
    }, [currentTimeZone, queryClient, boats.length]);

    // Fetch mooring balls
    const { data: mooringBalls, isLoading: isLoadingMooringBalls } = useQuery({
        queryKey: ['mooringBalls', selectedMarina?.marina_id, currentTimeZone],
        queryFn: async () => {
            try {
                let result = { mooring_balls: [] as Array<any> };

                if (selectedMarina?.marina_id) {
                    const marinaData = await MarinasService.readMarina({ id: selectedMarina.marina_id });
                    if (marinaData.mooring_balls) result.mooring_balls = marinaData.mooring_balls;
                } else {
                    console.warn('No marina selected, skipping mooring balls request.');
                    return result;
                }
                return result;
            } catch (error) {
                console.error('Error fetching mooring balls:', error);
                throw error;
            }
        },
        enabled: !!selectedMarina?.marina_id && !!currentDate,
    });

    // Fetch reservations
    const { data: reservations, isLoading: isLoadingReservations, isError } = useQuery({
        queryKey: ['reservations', currentDate, selectedMarina?.marina_id, currentTimeZone],
        queryFn: () => ReservationsService.readReservations({
            limit: 500,
            marinaId: selectedMarina?.marina_id || undefined,
        }),
        enabled: !!currentDate,
    });

    // Process mooring balls
    useEffect(() => {
        if (mooringBalls?.mooring_balls) {
            const apiMooringBalls = mooringBalls.mooring_balls;
            let numberField = 'ball_number';
            if (apiMooringBalls[0] && !apiMooringBalls[0].ball_number) {
                if (apiMooringBalls[0].number) numberField = 'number';
                else if (apiMooringBalls[0].id) numberField = 'id';
            }

            const rows = apiMooringBalls
                .filter(ball => ball && ball[numberField])
                .map(ball => ({
                    id: ball[numberField].toString(),
                    label: ball[numberField].toString(),
                    marina: ball.marina
                }))
                .sort((a, b) => parseInt(a.id) - parseInt(b.id));

            setAllRows(rows);
        }
    }, [mooringBalls]);

    // Process reservations
    useEffect(() => {
        if (reservations?.data && currentDate) {
            try {
                const [year, month, day] = currentDate.split('-').map(Number);
                const currentDayDate = new Date(year, month - 1, day);

                const apiBoats = reservations.data
                    .filter(reservation => {
                        try {
                            const resStart = new Date(reservation.start_date);
                            const resEnd = new Date(reservation.end_date);
                            
                            // Check if reservation is on the current day
                            return resStart.toDateString() === currentDayDate.toDateString() ||
                                   resEnd.toDateString() === currentDayDate.toDateString();
                        } catch (error) {
                            console.error('Invalid date in reservation:', reservation);
                            return false;
                        }
                    })
                    .map(reservation => {
                        try {
                            const startDateUTC = new Date(reservation.start_date.endsWith('Z') ? 
                                reservation.start_date : reservation.start_date + 'Z');
                            const endDateUTC = new Date(reservation.end_date.endsWith('Z') ? 
                                reservation.end_date : reservation.end_date + 'Z');

                            return {
                                id: reservation.mooring_ball.ball_number.toString(),
                                name: reservation.boat?.boatname || 'N/A',
                                code: reservation.boat?.registration_number || 'N/A',
                                startDay: currentDate,
                                endDay: currentDate,
                                startTime: startDateUTC.toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit', 
                                    hour12: true 
                                }),
                                endTime: endDateUTC.toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit', 
                                    hour12: true 
                                }),
                                rawStartTime: startDateUTC.toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: 'numeric', 
                                    hour12: false 
                                }),
                                rawEndTime: endDateUTC.toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: 'numeric', 
                                    hour12: false 
                                }),
                                marina_id: reservation.marina?.marina_id,
                                registration_image_url: (reservation.boat as any)?.registration_image_url,
                                vessel_type: reservation.boat?.vessel_type,
                                service_requests: reservation.service_requests,
                                is_completed: reservation.is_completed,
                                admin_status: reservation.admin_status,
                                startDateObj: startDateUTC,
                                endDateObj: endDateUTC,
                                startsInSecondHalf: startDateUTC.getMinutes() >= 30,
                                endsInFirstHalf: endDateUTC.getMinutes() < 30,
                                startsInSecondHalfLocal: startDateUTC.getMinutes() >= 30,
                                endsInFirstHalfLocal: endDateUTC.getMinutes() < 30,
                            };
                        } catch (error) {
                            console.error('Error processing reservation:', reservation);
                            return null;
                        }
                    })
                    .filter(Boolean) as Boat[];

                setBoats(apiBoats);
            } catch (error) {
                console.error('Error processing reservations:', error);
            }
        }
    }, [reservations, currentDate, currentTimeZone]);

    const handleCellClick = (rowId: string, hour: string, halfHour?: 'first' | 'second', boat?: Boat) => {
        setSelectedCell({ rowId, hour, halfHour, boat });
        onReservationClick(rowId, hour, boat);
    };

    const isLoading = isLoadingMooringBalls || isLoadingReservations;

    if (isLoading) return (
        <Flex width="98%" m="auto" height="100vh" alignItems="center" justifyContent="center" bg="white" rounded='25px'>
            <Spinner size="xl" color="ui.main" />
        </Flex>
    );

    if (isError) return (
        <Center width="100vw" height="100vh" bg="white">
            <Text color="red.500" fontSize="xl">Error loading data</Text>
        </Center>
    );

    if (!currentDate) return (
        <Center width="100vw" height="100vh" bg="white">
            <Text fontSize="xl">Initializing calendar...</Text>
        </Center>
    );

    return (
        <Box display="flex" alignItems="flex-start" width="100%">
            <Box flex="1" overflowX="auto" sx={{
                '&:focus': { outline: 'none' },
                '&:focus-visible': { outline: 'none' },
                '*:focus': { outline: 'none' },
                '& table': {
                    tableLayout: 'fixed',
                    width: '100%',
                }
            }}>
                <Table variant="unstyled" width="100%">
                    <Thead>
                        <Tr>
                            <Th
                                w="105px"
                                p={1}
                                height="52px"
                                textAlign="center"
                                fontWeight="normal"
                                position="sticky"
                                left="0"
                                bg="white"
                                zIndex={2}
                            />
                            {hours.map((hour) => (
                                <Th
                                    key={`hour-${hour}`}
                                    p={1}
                                    height="52px"
                                    textAlign="center"
                                    fontWeight="normal"
                                    position="relative"
                                    colSpan={2} // Each hour spans 2 columns (30-min intervals)
                                    borderBottom="1px solid var(--chakra-colors-basic-grey100)"
                                    borderLeft="1px solid var(--chakra-colors-basic-grey100)"
                                >
                                    <Text fontWeight="bold">{hour}</Text>
                                </Th>
                            ))}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {allRows.map(row => {
                            // For each hour, we have two half-hour slots (0-29 min and 30-59 min)
                            const occupiedHalfHours = Array(hours.length * 2).fill(null);
                            
                            // Mark occupied half-hours
                            hours.forEach((hour, hourIndex) => {
                                const firstHalfIndex = hourIndex * 2;
                                const secondHalfIndex = hourIndex * 2 + 1;
                                const hourNum = hourIndex + 1;
                                
                                // Find boats for this hour and row
                                const boatsForHour = boats.filter(boat => {
                                    const boatStartHour = parseInt(boat.rawStartTime.split(':')[0]);
                                    const boatEndHour = parseInt(boat.rawEndTime.split(':')[0]);
                                    const boatStartMinute = parseInt(boat.rawStartTime.split(':')[1]);
                                    const boatEndMinute = parseInt(boat.rawEndTime.split(':')[1]);
                                    
                                    return boat.id === row.id && 
                                           ((hourNum > boatStartHour || (hourNum === boatStartHour && (boatStartMinute < 30 || !boat.startsInSecondHalf))) && 
                                            (hourNum < boatEndHour || (hourNum === boatEndHour && (boatEndMinute >= 30 || !boat.endsInFirstHalf))));
                                });
                                
                                // Check first half (0-29 min)
                                const firstHalfBoat = boatsForHour.find(boat => {
                                    const boatStartHour = parseInt(boat.rawStartTime.split(':')[0]);
                                    const boatStartMinute = parseInt(boat.rawStartTime.split(':')[1]);
                                    
                                    return !(hourNum === boatStartHour && boatStartMinute >= 30);
                                });
                                
                                // Check second half (30-59 min)
                                const secondHalfBoat = boatsForHour.find(boat => {
                                    const boatEndHour = parseInt(boat.rawEndTime.split(':')[0]);
                                    const boatEndMinute = parseInt(boat.rawEndTime.split(':')[1]);
                                    
                                    return !(hourNum === boatEndHour && boatEndMinute < 30);
                                });
                                
                                if (firstHalfBoat) {
                                    occupiedHalfHours[firstHalfIndex] = firstHalfBoat;
                                }
                                
                                if (secondHalfBoat) {
                                    occupiedHalfHours[secondHalfIndex] = secondHalfBoat;
                                }
                            });
                            
                            // Generate cells
                            const cells: JSX.Element[] = [];
                            
                            // Process all half-hour slots
                            let halfHourIndex = 0;
                            while (halfHourIndex < occupiedHalfHours.length) {
                                const hourIndex = Math.floor(halfHourIndex / 2);
                                const hour = hours[hourIndex];
                                const isFirstHalf = halfHourIndex % 2 === 0;
                                const halfHour = isFirstHalf ? 'first' : 'second';
                                const boatForHalfHour = occupiedHalfHours[halfHourIndex];
                                
                                if (!boatForHalfHour) {
                                    // Empty cell
                                    cells.push(
                                        <Td
                                            key={`empty-${row.id}-${hour}-${halfHour}`}
                                            height="52px"
                                            padding={0}
                                            position="relative"
                                            _hover={{
                                                bg: 'brand.primaryOrange26'
                                            }}
                                            cursor="pointer"
                                            onClick={() => handleCellClick(row.id, hour, halfHour)}
                                            borderRight={!isFirstHalf || hourIndex < hours.length - 1 ? "1px solid var(--chakra-colors-basic-grey100)" : "none"}
                                            borderTop="1px solid var(--chakra-colors-basic-grey100)"
                                        >
                                            <Box height="100%" width="100%" display="flex" alignItems="center" justifyContent="center" />
                                        </Td>
                                    );
                                    halfHourIndex++;
                                    continue;
                                }
                                
                                // Determine consecutive half-hours with the same reservation
                                let halfHourColspan = 1;
                                let nextIndex = halfHourIndex + 1;
                                
                                while (nextIndex < occupiedHalfHours.length) {
                                    const nextBoat = occupiedHalfHours[nextIndex];
                                    
                                    if (nextBoat && 
                                        boatForHalfHour.id === nextBoat.id && 
                                        boatForHalfHour.name === nextBoat.name) {
                                        halfHourColspan++;
                                        occupiedHalfHours[nextIndex] = null; // Mark as processed
                                        nextIndex++;
                                    } else {
                                        break;
                                    }
                                }
                                
                                // Determine if cell needs rounded corners
                                let borderRadius = "4px";
                                
                                cells.push(
                                    <Td
                                        height="52px"
                                        key={`boat-${row.id}-${hour}-${boatForHalfHour.id}-${halfHour}`}
                                        color={getCellColor(boatForHalfHour).textColor}
                                        colSpan={halfHourColspan}
                                        p={0}
                                        textAlign="center"
                                        onClick={() => handleCellClick(row.id, hour, halfHour, boatForHalfHour)}
                                        cursor="pointer"
                                        borderRight={hourIndex < hours.length - 1 && (halfHourIndex + halfHourColspan) % 2 === 0 ? "1px solid var(--chakra-colors-basic-grey100)" : "none"}
                                        borderTop="1px solid var(--chakra-colors-basic-grey100)"
                                        sx={{
                                            overflow: "hidden",
                                        }}
                                    >
                                        <Flex
                                            height="44px"
                                            width="calc(100% - 4px)"
                                            margin="0 2px"
                                            alignItems="center"
                                            justifyContent="center"
                                            bg={getCellColor(boatForHalfHour).bg}
                                            borderRadius={borderRadius}
                                        >
                                            <Text fontSize="sm" fontWeight="medium">
                                                {boatForHalfHour.name}
                                            </Text>
                                        </Flex>
                                    </Td>
                                );
                                
                                halfHourIndex += halfHourColspan;
                            }
                            
                            return (
                                <Tr key={`row-${row.id}`} height="52px">
                                    <Td
                                        height="52px"
                                        p={0}
                                        position="sticky"
                                        left="0"
                                        bg="white"
                                        zIndex={1}
                                        borderRight="1px solid var(--chakra-colors-basic-grey100)"
                                        borderTop="1px solid var(--chakra-colors-basic-grey100)"
                                    >
                                        <Flex
                                            height="44px"
                                            alignItems="center"
                                            justifyContent="flex-start"
                                            gap="8px"
                                            padding="16px"
                                        >
                                            <Image
                                                w="24px"
                                                h="24px"
                                                src={row.marina?.logo_url ? transformS3Url(row.marina.logo_url) : BollaCell}
                                                alt="Bolla"
                                            />
                                            <Text
                                                fontSize="16px"
                                                lineHeight="24px"
                                                textOverflow="ellipsis"
                                                whiteSpace="nowrap"
                                                overflow="hidden"
                                                flex="1"
                                                color="basic.grey900"
                                                fontWeight="500"
                                            >
                                                {row.label}
                                            </Text>
                                        </Flex>
                                    </Td>
                                    {cells}
                                </Tr>
                            );
                        })}
                    </Tbody>
                </Table>
            </Box>
            {selectedCell && (
                <>
                    <PopupFreeCell
                        isOpen={isFreeCellOpen}
                        onClose={onFreeCellClose}
                        rowId={selectedCell.rowId}
                        day={currentDate}
                        timeOfDay={selectedCell.hour.includes('am') ? 'AM' : 'PM'}
                    />
                    <PopupReserved
                        isOpen={isReservedOpen}
                        onClose={onReservedClose}
                        rowId={selectedCell.rowId}
                        day={currentDate}
                        boat={selectedCell.boat}
                        timeOfDay={selectedCell.hour.includes('am') ? 'AM' : 'PM'}
                    />
                </>
            )}
        </Box>
    );
};

export default TableDay;
