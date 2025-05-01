import React from 'react';
import { Text, Image, Flex, Button, Link } from '@chakra-ui/react';
import { Boat } from './TableReservations';

interface HoverReservationProps {
    boat: Boat;
}

const HoverReservation: React.FC<HoverReservationProps> = ({ boat }) => {
    const serviceRequests = boat.service_requests || [];
    const hasServiceRequests = serviceRequests.length > 0;
    const buttonStyle = {
        bg: hasServiceRequests ? 'system.warningYellow' : 'system.successGreen',
        text: hasServiceRequests
            ? `${serviceRequests.length} service request${serviceRequests.length > 1 ? 's' : ''}`
            : 'No pending items',
        color: hasServiceRequests ? 'basic.grey900' : 'white'
    };

    // Helper function to format date and time correctly
    const formatDateTime = (dateObj: Date) => {
        if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
            return 'Invalid date';
        }

        const time = dateObj.toLocaleString('en-US', {
            hour: 'numeric',
            hour12: true,
        }).toLowerCase();

        const dateStr = dateObj.toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
        });

        return (
            <>
                <Text as="span" color='basic.grey900' fontWeight="400">{time}</Text>
                <Text as="span" color='basic.grey900' fontWeight="300">, {dateStr}</Text>
            </>
        );
    };

     // todo: fix margin issue on right side

    return (
        <Flex flexDirection='column' gap='8px'>
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
                <Text color='basic.grey900' fontSize="14px" fontWeight="400">{boat.name}</Text>
                <Text fontSize="14px" fontWeight="400" color='basic.grey600'>|</Text>
                <Text color='basic.grey600' fontSize="14px" fontWeight="400">
                    {boat.code}
                </Text>
            </Flex>
            <Flex gap='lg'>
                <Flex gap='4px' whiteSpace="nowrap">
                    <Text fontSize="14px" fontWeight="400" color='white' bg='black' p='0 8px' borderRadius='56px'>In</Text>
                    <Text fontSize="14px" fontWeight="400" color='basic.grey700' whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                        {boat.startDateObj ? formatDateTime(boat.startDateObj) : 'N/A'}
                    </Text>
                </Flex>
                <Flex gap='4px' whiteSpace="nowrap">
                    <Text fontSize="14px" fontWeight="400" color='white' bg='black' p='0 8px' borderRadius='56px'>Out</Text>
                    <Text fontSize="14px" fontWeight="400" color='basic.grey700' whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                        {boat.endDateObj ? formatDateTime(boat.endDateObj) : 'N/A'}
                    </Text>
                </Flex>
            </Flex>
            <Flex gap='24px' alignItems="flex-end">
                <Button
                    borderRadius='full'
                    bg={buttonStyle.bg}
                    fontSize='14px'
                    fontWeight='400'
                    color={buttonStyle.color}
                    sx={{
                        padding: '4px 8px !important',
                        minHeight: 'unset',
                        height: 'auto',
                        lineHeight: '1.2'
                    }}
                >
                    {buttonStyle.text}
                </Button>
                <Link color='basic.grey700' variant="unstyled" textDecoration="underline" fontSize='14px' fontWeight='400'>Open detail view</Link>
            </Flex>
        </Flex>
    );
};

export default HoverReservation;
