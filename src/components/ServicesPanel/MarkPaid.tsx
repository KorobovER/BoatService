import React, { useRef, useState } from 'react';
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
    Box,
    Input,
    Textarea,
    useToast
} from '@chakra-ui/react';
import { PaymentReceiptPublic, SubServiceRequest} from '../../client/models';
import { ReservationsService } from '../../client/services';
import { useQueryClient} from '@tanstack/react-query';

interface MarkPaidProps {
    isOpen: boolean;
    onClose: () => void;
    payment: PaymentReceiptPublic;
    reservationId: string;
    onServiceStatusChange?: (updatedReservation: any) => void;
}

const MarkPaid: React.FC<MarkPaidProps> = ({
    isOpen,
    onClose,
    payment,
    reservationId,
    onServiceStatusChange,
}) => {
    // Refs for input fields
    const itemNameRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    // State for input values
    const [itemName, setItemName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const toast = useToast();
    const queryClient = useQueryClient();

    // Handle input changes
    const handleItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setItemName(e.target.value);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
    };

    // Extract data from PaymentReceiptPublic
    const services = payment?.service_requests?.flatMap(service => service.services) || [];
    const subtotal = payment?.subtotal || 0;
    const serviceFee = payment?.service_fee || 0;
    const taxes = payment?.taxes || 0;
    const total = subtotal + serviceFee + taxes;

    const handleMarkPaid = async () => {
        // Validate input
        if (!itemName.trim()) {
            toast({
                title: "Error",
                description: "Please specify the payment method",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Ensure we have a reservationId and at least one service
        if (!reservationId || !payment?.service_requests?.length) {
            toast({
                title: "Error",
                description: "No services found to mark as paid",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsLoading(true);
        try {
            // Prepare updated reservation for local state
            const updatedReservation = {
                ...payment,
                service_requests: payment.service_requests.map(service => ({
                    ...service,
                    status: 'paid'
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
                    statusIn: 'paid'
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
            toast({
                title: "Payment Marked Manually Paid",
                description: `The remaining $${total.toFixed(2)} has been marked as manually paid via ${itemName}${description ? `: ${description}` : ''}.`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            // Close the modal
            onClose();

            // Invalidate queries related to this reservation
            queryClient.invalidateQueries({
                predicate: (query) => {
                    const queryKey = query.queryKey as string[];
                    return queryKey.includes('reservations') &&
                           queryKey.includes(reservationId);
                }
            });
        } catch (error) {
            // Revert local state update if API call fails
            toast({
                title: "Error",
                description: "Failed to mark payment as manually paid",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            console.error('Error marking payment as manually paid:', error);

            // Invalidate queries related to this reservation to ensure fresh data
            queryClient.invalidateQueries({
                predicate: (query) => {
                    const queryKey = query.queryKey as string[];
                    return queryKey.includes('reservations') &&
                           queryKey.includes(reservationId);
                }
            });

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
                        <Box w='90px' h='90px' bg='system.successGreen' borderRadius='full' display='flex' alignItems='center' justifyContent='center'>
                            <Image w='90px' h='90px' src='assets/images/alert-icon-blue.svg' alt="alert" />
                        </Box>
                        <Flex border="1px solid" borderColor="system.successGreen" bg="bg.success" borderRadius="20px" w="100%" p='10px 20px' direction="row" align="center" gap='md' position="relative">
                            <Box flex='1'>
                                <Text fontSize="16px" color="system.successGreen" fontWeight="500" mb="2px">
                                    Mark Bill as Manually Paid?
                                </Text>
                                <Text color="gray.700" fontSize="14px" fontWeight="300">
                                    The remaining ${total.toFixed(2)}  (including 7.5% platform fee) will be marked as manually paid, and the bill will be moved to the Statement Charges section.
                                </Text>
                            </Box>
                        </Flex>
                    </Flex>
                </ModalHeader>
                <ModalBody display='flex' flexDirection='column' gap='24px' p='0'>
                    <Flex flexDirection="column" gap='lg'>
                        <Box
                            borderRadius="full"
                            borderColor="gray.200"
                            borderWidth="1px"
                            fontSize="18px"
                            p='4px 10px 4px 24px'
                            position="relative"
                            cursor="text"
                            onClick={() => itemNameRef.current?.focus()}
                        >
                            <Text fontSize="12px" color="gray.900" fontWeight="300">
                                Payment method
                            </Text>
                            <Input
                                ref={itemNameRef}
                                fontSize="16px"
                                fontWeight="300"
                                variant="unstyled"
                                placeholder="Cash / Check / Other"
                                _placeholder={{ fontSize: "16px", fontWeight: "300", color: "gray.400" }}
                                value={itemName}
                                onChange={handleItemNameChange}
                                maxLength={20}
                            />
                        </Box>
                        {/* Description */}
                        <Box
                            borderRadius="24px"
                            borderColor="gray.200"
                            borderWidth="1px"
                            fontSize="18px"
                            p='4px 10px 4px 24px'
                            position="relative"
                            cursor="text"
                            onClick={() => descriptionRef.current?.focus()}
                        >
                            <Textarea
                                ref={descriptionRef}
                                fontSize="16px"
                                fontWeight="300"
                                variant="unstyled"
                                placeholder="Notes about this payment (optional)"
                                _placeholder={{ fontSize: "16px", fontWeight: "300", color: "gray.400" }}
                                value={description}
                                onChange={handleDescriptionChange}
                            />
                        </Box>
                    </Flex>
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
                        bg='system.successGreen'
                        color='white'
                        borderRadius='full'
                        fontSize="16px"
                        fontWeight="400"
                        onClick={handleMarkPaid}
                        isLoading={isLoading}
                        loadingText="Marking as Paid"
                        leftIcon={<Image ml='4px' h='auto' src='assets/images/check-icon-green.svg' filter="brightness(0) invert(1)" />}
                    >
                        Mark as paid
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

export default MarkPaid;
