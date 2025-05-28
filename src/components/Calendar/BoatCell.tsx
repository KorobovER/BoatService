import React from 'react';
import { Box, Text, Image, Flex, Popover, PopoverTrigger, PopoverContent, PopoverBody } from '@chakra-ui/react';
import HoverReservation from './HoverReservation';
import { ReservationExtenstion } from '../ReservationExtenstion';
import { getBoatImageProps } from '../../utilsBola';

interface BoatCellProps {
    reservation: ReservationExtenstion;
    textColor: string;
    colspan?: number;
    isMonthView?: boolean;
}


const BoatCell: React.FC<BoatCellProps> = ({ reservation, textColor, colspan = 0, isMonthView = false }) => {
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
                    {(() => {
                        const boatProps = getBoatImageProps(
                            reservation.boat.vessel_type,
                            reservation.boat.boatname,
                            textColor
                        );
                        
                        return boatProps.isImage ? (
                            <Image
                                src={boatProps.src}
                                alt={boatProps.alt}
                                width={boatProps.width}
                                height={boatProps.height}
                                objectFit={boatProps.objectFit}
                                borderRadius={boatProps.borderRadius}
                                filter={boatProps.filter}
                            />
                        ) : (
                            <Text 
                                color={boatProps.color} 
                                fontSize={boatProps.fontSize} 
                                fontWeight={boatProps.fontWeight}
                            >
                                {boatProps.text}
                            </Text>
                        );
                    })()}

                    {/* Only show name and code if not a short reservation in month view */}
                    {!isShortReservation && (
                        <Box maxWidth="calc(100% - 30px)" overflow="hidden" textAlign="left">
                            <Text color={textColor} fontSize={isMonthView ? "16px" : "16px"} fontWeight="400" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{reservation.boat.boatname}</Text>
                            <Text color={textColor} fontSize={isMonthView ? "12px" : "12px"} fontWeight="300" opacity="0.8" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{reservation.boat.registration_number}</Text>
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
                zIndex={9999}
                style={{
                    opacity: '1 !important',
                    filter: 'none !important',
                    pointerEvents: 'auto',
                    visibility: 'visible',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
            >
                <PopoverBody>
                    <HoverReservation reservation={reservation} />
                </PopoverBody>
            </PopoverContent>
        </Popover >
    );
};

export default BoatCell;
