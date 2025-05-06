import React from 'react';
import { Box, Text, Image, Flex, Button, Link } from '@chakra-ui/react';
import { ReservationExtenstion } from './TableReservations';

interface PopoverBoatContentProps {
    reservation: ReservationExtenstion;
}

const PopoverBoatContent: React.FC<PopoverBoatContentProps> = ({ reservation }) => {
    return (
        <Flex gap='8px' alignItems='center' color="black">
            <Box>
                <Flex gap='8px' alignItems='center'>
                    {reservation.boat.vessel_type === 'power' ? (
                        <Image
                            src="/assets/images/power-boat.svg"
                            alt={reservation.boat.boatname}
                            width="22px"
                            height="22px"
                            objectFit="cover"
                            borderRadius="4px"
                            filter="brightness(0)"
                        />
                    ) : reservation.boat.vessel_type === 'catamaran' ? (
                        <Image
                            src="/assets/images/catamaran-boat.svg"
                            alt={reservation.boat.boatname}
                            width="22px"
                            height="22px"
                            objectFit="cover"
                            borderRadius="4px"
                            filter="brightness(0)"
                        />
                    ) : reservation.boat.vessel_type === 'monohull' ? (
                        <Image
                            src="/assets/images/monohul-boat.svg"
                            alt={reservation.boat.boatname}
                            width="22px"
                            height="22px"
                            objectFit="cover"
                            borderRadius="4px"
                            filter="brightness(0)"
                        />
                    ) : (
                        <Text color="white" fontSize="14px" fontWeight="500">{reservation.boat.boatname}</Text>
                    )}
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
