import React from 'react';
import { Box, Text, Image, Button, Flex, IconButton, Divider } from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { Boat } from './TableReservations';

interface PopupReservedProps {
    isOpen: boolean;
    onClose: () => void;
    rowId: string;
    day: string;
    boat?: Boat;
}

const PopupReserved: React.FC<PopupReservedProps> = ({
    isOpen,
    onClose,
    rowId,
    day,
    boat,
}) => {
    if (!isOpen || !boat) return null;

    return (
        <Box
            position="relative"
            height="100%"
            bg="white"
            overflow="hidden"
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
                            ? "/assets/images/power-boat.png"
                            : boat.vessel_type === 'catamaran'
                            ? "/assets/images/catamaran-boat.png"
                            : "/assets/images/monohul-boat.png"}
                        alt={boat.name}
                        width="32px"
                        height="32px"
                    />
                    <Box>
                        <Text fontSize="18px" fontWeight="600" color="gray.900">{boat.name}</Text>
                        <Text fontSize="14px" color="gray.500">{boat.code}</Text>
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
                                {new Date(boat.startDay).toLocaleDateString('en-US', { 
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </Text>
                        </Box>
                        <Box flex="1">
                            <Text fontSize="12px" color="gray.500" mb="4px">Check-out</Text>
                            <Text fontSize="14px" color="gray.900">
                                {new Date(boat.endDay).toLocaleDateString('en-US', { 
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
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
