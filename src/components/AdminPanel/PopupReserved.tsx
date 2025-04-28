import React from 'react';
import { Box, Text, Image, Flex, Divider } from '@chakra-ui/react';
import { Boat } from './TableReservations';

interface PopupReservedProps {
    isOpen: boolean;
    onClose: () => void;
    rowId: string;
    day: string;
    boat?: Boat;
    timeOfDay?: 'AM' | 'PM';
}

const PopupReserved: React.FC<PopupReservedProps> = ({
    isOpen,
    rowId,
    boat,
    timeOfDay
}) => {
    if (!isOpen || !boat) return null;

    return (
        <Box
            bg="white"
            overflow="hidden"
            padding="var(--chakra-space-xl)"
            borderRadius="var(--chakra-space-xl)"
        >
            {/* Header */}
            <Flex 
                borderBottom="1px solid"
                borderColor="gray.100"
                justify="space-between"
                align="center"
                bg="white"
            >
                <Flex align="center" gap="12px">
                    <Image
                        src={boat.vessel_type === 'power' 
                            ? "/assets/images/power-boat.svg"
                            : boat.vessel_type === 'catamaran'
                            ? "/assets/images/catamaran-boat.svg"
                            : "/assets/images/monohul-boat.svg"}
                        alt={boat.name}
                        width="32px"
                        height="32px"
                    />
                    <Box>
                        <Text fontSize="18px" fontWeight="600" color="gray.900">{boat.name}</Text>
                        <Text fontSize="14px" color="gray.500">{boat.code}</Text>
                        <Text fontSize="14px" color="gray.500">Time: {timeOfDay || 'Full Day'}</Text>
                    </Box>
                </Flex>
             
            </Flex>

            {/* Content */}
            <Box 
                p="24px"
                height="calc(100% - 85px)" // 85px - высота header
                overflowY="auto"
            >
                {/* Reservation Info */}
                <Box mb="24px">
                    <Text fontSize="14px" fontWeight="600" color="gray.700" mb="16px">
                        Reservation Info
                    </Text>
                    <Flex gap="16px">
                        <Box flex="1">
                            <Text fontSize="12px" color="gray.500" mb="4px">Check-in</Text>
                            <Text fontSize="14px" color="gray.900">
                                {(() => {
                                    try {
                                        const date = boat.startDateObj || new Date(boat.startDay);
                                        return date.toLocaleString('en-US', { 
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true,
                                            timeZoneName: 'short'
                                        });
                                    } catch (error) {
                                        return new Date(boat.startDay).toLocaleDateString('en-US', { 
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        });
                                    }
                                })()}
                            </Text>
                        </Box>
                        <Box flex="1">
                            <Text fontSize="12px" color="gray.500" mb="4px">Check-out</Text>
                            <Text fontSize="14px" color="gray.900">
                                {(() => {
                                    try {
                                        const date = boat.endDateObj || new Date(boat.endDay);
                                        return date.toLocaleString('en-US', { 
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true,
                                            timeZoneName: 'short'
                                        });
                                    } catch (error) {
                                        return new Date(boat.endDay).toLocaleDateString('en-US', { 
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        });
                                    }
                                })()}
                            </Text>
                        </Box>
                    </Flex>
                </Box>

                <Divider mb="24px" />

                {/* Mooring Ball */}
                <Box mb="24px">
                    <Text fontSize="14px" fontWeight="600" color="gray.700" mb="16px">
                        Mooring Ball
                    </Text>
                    <Text fontSize="14px" color="gray.900">Ball #{rowId}</Text>
                </Box>
            </Box>
        </Box>
    );
};

export default PopupReserved;
