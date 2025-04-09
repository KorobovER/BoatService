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
} from '@chakra-ui/react';

interface PopupFreeCellProps {
    isOpen: boolean;
    onClose: () => void;
    rowId: string;
    day: string;
}

const PopupFreeCell: React.FC<PopupFreeCellProps> = ({ isOpen, onClose, rowId, day }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Create Reservation</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box p={4}>
                        <Text>Mooring Ball: {rowId}</Text>
                        <Text>Date: {new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                        {/* Здесь можно добавить форму для создания резервации */}
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default PopupFreeCell;
