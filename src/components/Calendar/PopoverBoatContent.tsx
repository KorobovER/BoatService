import React from 'react';
import { Box, Text, Image, Flex, Button, Link } from '@chakra-ui/react';
import { ReservationExtenstion } from '../ReservationExtenstion';
import { getBoatImageProps } from '../../utilsBola';

interface PopoverBoatContentProps {
    reservation: ReservationExtenstion;
}

const PopoverBoatContent: React.FC<PopoverBoatContentProps> = ({ reservation }) => {
    return (
        <Flex gap='8px' alignItems='center' color="black">
            <Box>
                <Flex gap='8px' alignItems='center'>
                    {(() => {
                        const boatProps = getBoatImageProps(
                            reservation.boat.vessel_type,
                            reservation.boat.boatname
                            // No textColor passed, will use default filter
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
                                color="white" 
                                fontSize={boatProps.fontSize} 
                                fontWeight="500"
                            >
                                {boatProps.text}
                            </Text>
                        );
                    })()}
                    <Text color='basic.grey900' fontSize="14px" fontWeight="400" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{reservation.boat.boatname}</Text>
                    <Text fontSize="14px" fontWeight="400" color='basic.grey600'>|</Text>
                    <Text color='basic.grey600' fontSize="14px" fontWeight="400" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                        {reservation.boat.registration_number}
                    </Text>
                </Flex>
                <Flex p='8px 0px' gap='16px'>
                    <Flex gap='4px' whiteSpace="nowrap">
                        <Text fontSize="14px" fontWeight="400" color='white' bg='black' p='0 8px' borderRadius='56px'>In</Text>
                        <Text fontSize="14px" fontWeight="400" color='basic.grey700' whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                            {(() => {
                                try {
                                    const date = reservation.startDateObj || new Date(reservation.startDay);
                                    return date.toLocaleString('en-US', {
                                        day: 'numeric',
                                        month: 'long',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true,
                                    }).replace(',', ' •');
                                } catch (error) {
                                    return `${reservation.startDay} • ${reservation.startTime || '--:--'}`;
                                }
                            })()}
                        </Text>
                    </Flex>
                    <Flex gap='4px' whiteSpace="nowrap">
                        <Text fontSize="14px" fontWeight="400" color='white' bg='black' p='0 8px' borderRadius='56px'>Out</Text>
                        <Text fontSize="14px" fontWeight="400" color='basic.grey700' whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                            {(() => {
                                try {
                                    const date = reservation.endDateObj || new Date(reservation.endDay);
                                    return date.toLocaleString('en-US', {
                                        day: 'numeric',
                                        month: 'long',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true,
                                    }).replace(',', ' •');
                                } catch (error) {
                                    return `${reservation.endDay} • ${reservation.endTime || '--:--'}`;
                                }
                            })()}
                        </Text>
                    </Flex>
                </Flex>
                <Flex gap='24px' alignItems="flex-end">
                    <Button
                        borderRadius='full'
                        bg="var(--chakra-colors-system-warningYellow)"
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
    );
};

export default PopoverBoatContent;
