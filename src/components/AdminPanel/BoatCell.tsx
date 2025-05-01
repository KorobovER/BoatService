import React from 'react';
import { Box, Text, Image, Flex, Popover, PopoverTrigger, PopoverContent, PopoverBody } from '@chakra-ui/react';
import { Boat } from './TableReservations';
import HoverReservation from './HoverReservation';

interface BoatCellProps {
    boat: Boat;
    textColor: string;
    colspan?: number;
    isMonthView?: boolean;
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

const BoatCell: React.FC<BoatCellProps> = ({ boat, textColor, colspan = 0, isMonthView = false }) => {
    // For month view, check if the reservation is short (less than 2 days)
    const isShortReservation = isMonthView && colspan < 2;

    return (
            <Popover trigger="hover" placement="bottom" strategy="fixed">
                <PopoverTrigger>
                    <Flex
                        width={isMonthView ? "98%" : "100%"}
                        margin={isMonthView ? "auto" : "0"}
                        height="100%"
                        gap={isShortReservation ? "0" : "8px"}
                        alignItems="center"
                        justifyContent="center"
                        marginLeft={isMonthView ? "2px" : "0"}
                        marginRight={isMonthView ? "2px" : "0"}
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
                            <Text color={textColor} fontSize="14px" fontWeight="400">
                                {boat.name[0]}
                            </Text>
                        )}

                        {/* Only show name and code if not a short reservation in month view */}
                        {!isShortReservation && (
                            <Box maxWidth="calc(100% - 30px)" overflow="hidden" textAlign="left">
                                <Text color={textColor} fontSize={isMonthView ? "16px" : "16px"} fontWeight="400" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{boat.name}</Text>
                                <Text color={textColor} fontSize={isMonthView ? "12px" : "12px"} fontWeight="300" opacity="0.8" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{boat.code}</Text>
                            </Box>
                        )}
                    </Flex>
                </PopoverTrigger>
                <PopoverContent
                    width='fit-content'
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

export default BoatCell;
