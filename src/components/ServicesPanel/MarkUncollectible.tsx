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
import { PaymentReceiptPublic, SubServiceRequest } from '../../client/models';

interface MarkUncollectibleProps {
    isOpen: boolean;
    onClose: () => void;
    payment: PaymentReceiptPublic;
    reservationId: string;
}

const MarkUncollectible: React.FC<MarkUncollectibleProps> = ({
    isOpen,
    onClose,
    payment,
}) => {
    // Extract data from PaymentReceiptPublic
    const subtotal = payment?.subtotal || 0;
    const serviceFee = payment?.service_fee || 0;
    const taxes = payment?.taxes || 0;
    const total = subtotal + serviceFee + taxes;
    const services = payment?.service_requests?.flatMap(service => service.services) || [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent display='flex' flexDirection='column' gap='32px' padding='16px' borderRadius="12px" maxW="600px">
                <ModalHeader display='flex' flexDirection='column' p='0'>
                    <Flex flexDirection="column" align="center" gap='sm'>
                        <Box w='90px' h='90px' bg='system.errorRedNew' borderRadius='full' display='flex' alignItems='center' justifyContent='center'>
                            <Image w='90px' h='90px' src='assets/images/alert-icon-red.svg' alt="alert" />
                        </Box>
                        <Flex border="1px solid" borderColor="system.errorRedNew" bg="bg.error" borderRadius="20px" w="100%" p='10px 20px' direction="row" align="center" gap='md' position="relative">
                            <Box flex='1'>
                                <Text fontSize="16px" color="system.errorRedNew" fontWeight="500" mb="2px">
                                    Mark bill uncollectible?
                                </Text>
                                <Text color="gray.700" fontSize="14px" fontWeight="300">
                                    The remaining ${total.toFixed(2)} due will be marked as uncollectible, and the bill will be moved to the Statement Charges section.
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
                        {services.map((s: SubServiceRequest, i: number) => (
                            <Flex key={i} justify="space-between" pl="lg">
                                <Text fontSize='14px' fontWeight='300' color='basic.grey700'>{s.name}</Text>
                                <Text fontSize='14px' fontWeight='400' color='basic.grey300'>${(s.price * s.quantity).toFixed(2)}</Text>
                            </Flex>
                        ))}
                        <Flex justify="space-between">
                            <Text fontSize='14px' fontWeight='300' color='basic.grey700'>Service fee (7.5%)</Text>
                            <Text fontSize='14px' fontWeight='400' color='basic.grey300'>${serviceFee.toFixed(2)}</Text>
                        </Flex>
                        <Flex justify="space-between">
                            <Text fontSize='14px' fontWeight='300' color='basic.grey700'>Taxes</Text>
                            <Text fontSize='14px' fontWeight='400' color='basic.grey300'>${taxes.toFixed(2)}</Text>
                        </Flex>
                    </Flex>
                    <Flex justify="space-between" fontWeight="bold" mt='12px'>
                        <Text fontSize='16px' fontWeight='500' color='basic.grey900'>Total</Text>
                        <Text fontSize='16px' fontWeight='500' color='basic.grey900'>${total.toFixed(2)}</Text>
                    </Flex>
                </ModalBody>

                <ModalFooter p='0' display='flex' justifyContent='space-between' gap='md'>
                    <Button
                        flex='1'
                        h="50px"
                        bg='system.errorRedNew'
                        color='white'
                        borderRadius='full'
                        fontSize="16px"
                        fontWeight="400"
                        leftIcon={<Image ml='4px' h='auto' src='assets/images/close-red.svg' filter="brightness(0) invert(1)" />}
                    >
                        Mark uncollectible
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
                        leftIcon={<Image mr='4px' w='17px' h='auto' src='assets/images/goback-icon.svg' />}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default MarkUncollectible; 