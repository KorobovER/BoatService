import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Box,
    Text,
    Image,
} from '@chakra-ui/react';
import { Boat } from './TableReservations';

interface PopupReservedProps {
    isOpen: boolean;
    onClose: () => void;
    rowId: string;
    day: string;
    boat?: Boat;
}

const PopupReserved: React.FC<PopupReservedProps> = ({ isOpen, onClose, rowId, day, boat }) => {
    if (!boat) return null;
    console.log(day); // todo: fix this

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Reservation Details</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box p={4}>
                        <Text fontSize="lg" fontWeight="bold" mb={4}>{boat.name}</Text>
                        <Box display="flex" alignItems="center" mb={2}>
                            {boat.vessel_type === 'power' ? (
                                <Image 
                                    src="/assets/images/power-boat.png" 
                                    alt={boat.name}
                                    width="24px"
                                    height="24px"
                                    objectFit="cover"
                                    borderRadius="4px"
                                    filter="brightness(0) invert(1)"
                                    mr={2}
                                />
                            ) : boat.vessel_type === 'catamaran' ? (
                                <Image 
                                    src="/assets/images/catamaran-boat.png" 
                                    alt={boat.name}
                                    width="24px"
                                    height="24px"
                                    objectFit="cover"
                                    borderRadius="4px"
                                    filter="brightness(0) invert(1)"
                                    mr={2}
                                />
                            ) : boat.vessel_type === 'monohull' ? (
                                <Image 
                                    src="/assets/images/monohul-boat.png" 
                                    alt={boat.name}
                                    width="24px"
                                    height="24px"
                                    objectFit="cover"
                                    borderRadius="4px"
                                    filter="brightness(0) invert(1)"
                                    mr={2}
                                />
                            ) : null}
                            <Text>Mooring Ball: {rowId}</Text>
                        </Box>
                        <Text>Code: {boat.code}</Text>
                        <Text>Period: {new Date(boat.startDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(boat.endDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default PopupReserved;
