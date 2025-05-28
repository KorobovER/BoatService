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
    Box,
} from '@chakra-ui/react';
import { PaymentReceiptPublic, SubServiceRequest } from '../../client/models';
import { ReservationsService } from '../../client/services';
import { useState } from 'react';
import useCustomToast from '../../hooks/useCustomToast';
import CustomIcon from '../../components/Icon';
interface MarkUncollectibleProps {
    isOpen: boolean;
    onClose: () => void;
    payment: PaymentReceiptPublic;
    reservationId: string;
    onServiceStatusChange?: (updatedReservation: any) => void;
}

const MarkUncollectible: React.FC<MarkUncollectibleProps> = ({
    isOpen,
    onClose,
    payment,
    reservationId,
    onServiceStatusChange,
}) => {
    // Extract data from PaymentReceiptPublic
    const subtotal = payment?.subtotal || 0;
    const serviceFee = payment?.service_fee || 0;
    const taxes = payment?.taxes || 0;
    const total = subtotal + serviceFee + taxes;
    const services = payment?.service_requests?.flatMap(service => service.services) || [];
    const showToast = useCustomToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleMarkUncollectible = async () => {
        // Ensure we have a reservationId and at least one service
        if (!reservationId || !payment?.service_requests?.length) {
            showToast('Error', 'No services found to mark uncollectible', 'error');
            return;
        }

        setIsLoading(true);
        try {
            // Prepare updated reservation for local state
            const updatedReservation = {
                ...payment,
                service_requests: payment.service_requests.map(service => ({
                    ...service,
                    status: 'payment_failed'
                }))
            };

            // Optimistically update local state
            if (onServiceStatusChange) {
                onServiceStatusChange(updatedReservation);
            }

            // Update status for each service in the payment
            await Promise.all(payment.service_requests.map(service =>
                ReservationsService.updateReservationServiceStatus({
                    reservationId: reservationId,
                    serviceId: service.service_reservation_id,
                    statusIn: 'payment_failed'
                })
            ));

            // Fetch the updated reservation to ensure data consistency
            const updatedReservationData = await ReservationsService.readReservation({
                id: reservationId
            });

            // Update local state with the fetched reservation data
            if (onServiceStatusChange) {
                onServiceStatusChange(updatedReservationData);
            }

            // Show success toast
            showToast('Services marked uncollectible', 'success');

            // Close the modal
            onClose();
        } catch (error) {
            // Revert local state update if API call fails
            showToast('Error', 'Failed to mark services as uncollectible', 'error');
            console.error('Error marking services uncollectible:', error);

            // If onServiceStatusChange is provided, revert to original state
            if (onServiceStatusChange) {
                onServiceStatusChange(payment);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent display='flex' flexDirection='column' gap='32px' padding='16px' borderRadius="12px" maxW="600px">
                <ModalHeader display='flex' flexDirection='column' p='0'>
                    <Flex flexDirection="column" align="center" gap='sm'>
                        <Box w='90px' h='90px' bg='system.errorRedNew' borderRadius='full' display='flex' alignItems='center' justifyContent='center'>
                            <CustomIcon size={90} name='alert-icon-red' category='alerts' />
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
                            h="50px"
                            bg='system.errorRedNew'
                            color='white'
                            borderRadius='full'
                            fontSize="16px"
                            fontWeight="400"
                            leftIcon={<CustomIcon size={17} name='close-red' category='ui' style={{ marginRight: '4px', filter:"brightness(0) invert(1)" }} />}
                            onClick={handleMarkUncollectible}
                            isLoading={isLoading}
                            loadingText="Marking Uncollectible"
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
                            leftIcon={<CustomIcon size={17} name='goback-icon' category='ui' style={{ marginRight: '4px'}} />}
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
                        leftIcon={<CustomIcon size={22} name='message-boater' category='ui' />}
                        color='basic.grey900'>Message boater instead</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default MarkUncollectible;
