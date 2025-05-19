import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Text,
    Flex,
    Image,
    Box
} from '@chakra-ui/react';
import { PaymentReceiptPublic } from '../../client/models';
import Icon from '../Icon';

interface RetryChargeProps {
    isOpen: boolean;
    onClose: () => void;
    payment: PaymentReceiptPublic;
    onRetryCharge: (reservationId: string) => void;
    reservationId: string;
}

const RetryCharge: React.FC<RetryChargeProps> = ({
    isOpen,
    onClose,
    payment,
    onRetryCharge,
    reservationId
}) => {
    // Extract data from PaymentReceiptPublic
    const services = payment?.service_requests.flatMap(service => service.services) || [];
    const subtotal = payment?.subtotal || 0;
    const serviceFee = payment?.service_fee || 0;
    const taxes = payment?.taxes || 0;
    const total = subtotal + serviceFee + taxes;

    // Handler for retry charge button
    const handleRetryCharge = () => {
        if (onRetryCharge && reservationId) {
            onRetryCharge(reservationId);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent display='flex' flexDirection='column' gap='32px' padding='16px' borderRadius="12px" maxW="600px">
                <ModalHeader display='flex' flexDirection='column' p='0'>
                    <Flex flexDirection="column" align="center" gap='sm'>
                        <Box w='80px' h='80px' bg='brand.secondaryBlue' borderRadius='full' display='flex' alignItems='center' justifyContent='center'>
                            <Icon size={80} color='#EFF4FB' name='infotmation-exclamation' />
                        </Box>
                        <Flex border="1px solid" borderColor="brand.secondaryBlue" bg="bg.info" borderRadius="20px" w="100%" p='10px 20px' direction="row" align="center" gap='md' position="relative">
                            <Box flex='1'>
                                <Text fontSize="16px" color="brand.secondaryBlue" fontWeight="500" mb="2px">
                                    Retry Charge?
                                </Text>
                                <Text color="gray.700" fontSize="14px" fontWeight="300">
                                    Retrying the charge too many times may cause the card to be blocked by the issuer. If you're unsure, consider waiting or reaching out to the boater before trying again
                                </Text>
                            </Box>
                        </Flex>
                    </Flex>
                </ModalHeader>
                <ModalBody p='0'>
                    <Flex pb='12px' borderBottom="1px solid" borderColor="basic.grey200" direction="column" gap='12px'>
                        <Flex justify="space-between">
                            <Text fontSize='14px' fontWeight='300' color='basic.grey700'>Services</Text>
                            <Text fontSize='14px' fontWeight='400' color='basic.grey700'>${subtotal.toFixed(2)}</Text>
                        </Flex>
                        {services.map((s, i) => (
                            <Flex key={i} justify="space-between" pl="lg">
                                <Text fontSize='14px' fontWeight='300' color='basic.grey700'>{s.name}</Text>
                                <Text fontSize='14px' fontWeight='400' color='basic.grey300'>${(s.price * s.quantity).toFixed(2)}</Text>
                            </Flex>
                        ))}
                        <Flex justify="space-between">
                            <Text fontSize='14px' fontWeight='300' color='basic.grey700'>Service fee (7.5%)</Text>
                            <Text fontSize='14px' fontWeight='400' color='basic.grey700'>${serviceFee.toFixed(2)}</Text>
                        </Flex>
                        <Flex justify="space-between">
                            <Text fontSize='14px' fontWeight='300' color='basic.grey700'>Taxes</Text>
                            <Text fontSize='14px' fontWeight='400' color='basic.grey700'>${taxes.toFixed(2)}</Text>
                        </Flex>
                    </Flex>
                    <Flex justify="space-between" fontWeight="bold" mt='12px'>
                        <Text fontSize='16px' fontWeight='500' color='basic.grey900'>Total</Text>
                        <Text fontSize='16px' fontWeight='500' color='basic.grey900'>${total.toFixed(2)}</Text>
                    </Flex>
                </ModalBody>

                <ModalFooter p='0' display='flex' flexDirection='column' gap='sm'>
                    <Flex width="100%" justifyContent='space-between' gap='md'>
                        <Button
                            flex='1'
                            display="flex"
                            w="100%"
                            justifyContent="center"
                            px='md'
                            py='10px'
                            leftIcon={<Icon name="alert-icon" size={30} />}
                            bg="brand.secondaryBlue"
                            color="white"
                            size="lg"
                            borderRadius="full"
                            fontWeight="500"
                            _hover={{ bg: "teal.400" }}
                            onClick={handleRetryCharge}
                        >
                            <Flex gap="4px" fontSize="16px" fontWeight="400" color="white">RETRY CHARGE</Flex>
                        </Button>
                        <Button
                            flex='1'
                            h="50px"
                            variant="outline"
                            border='1px solid'
                            borderColor='basic.grey200'
                            borderRadius="full"
                            px='md'
                            py='10px'
                            onClick={onClose}
                            fontSize="16px"
                            fontWeight="400"
                            color="basic.grey900"
                            display='flex'
                            alignItems='center'
                            gap='4px'
                            leftIcon={<Icon size={17} name='goback' />}
                        >
                            Cancel
                        </Button>
                    </Flex>
                    <Button
                        variant='unstyled'
                        textDecoration='underline'
                        py='10px'
                        px='md'
                        fontSize='16px'
                        fontWeight='400'
                        display='flex'
                        alignItems='center'
                        gap='4px'
                        leftIcon={<Icon size={22} name='message-boater' />}
                        color='basic.grey900'>Message boater instead</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default RetryCharge;
