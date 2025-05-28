import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    Text,
    Flex,
    Box,
    Icon
} from '@chakra-ui/react';
import { FiDownload } from 'react-icons/fi';
import { ServiceOnReservationPublic } from '../../client/models';
import { SERVICE_FEE_PERCENTAGE } from '../../utilsBola';
import CustomIcon from '../Icon';

interface CompletedServiceProps {
    isOpen: boolean;
    onClose: () => void;
    service: ServiceOnReservationPublic;
}

const CompletedService: React.FC<CompletedServiceProps> = ({
    isOpen,
    onClose,
    service
}) => {
    // Calculate service details
    const subtotal = service.total_price || 0;
    const serviceFee = subtotal * SERVICE_FEE_PERCENTAGE; // 7.5% service fee
    const taxes = 0; // Taxes (currently 0)
    const total = subtotal + serviceFee + taxes;


    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered >
            <ModalOverlay />
            <ModalContent p='16px' display="flex" flexDirection="column" gap="32px" maxW="600px" borderRadius="md">
                <ModalHeader p='0' display="flex" justifyContent="space-between" alignItems="center">
                    <Text fontSize="20px" fontWeight="500" color="basic.grey900">Completed service details</Text>
                    <ModalCloseButton position='static' variant='unstyled' w="9px" h="9px" />
                </ModalHeader>
                <ModalBody p='0'>
                    <Flex direction="column" gap="12px">
                        {/* Paid services section */}
                        <Box>
                            <Flex justify="space-between" mb={2}>
                                <Text fontSize="14px" fontWeight="300" color="basic.grey700">Paid services</Text>
                                <Text fontSize="13px" fontWeight="400" color="basic.grey700">${subtotal.toFixed(2)}</Text>
                            </Flex>

                            {service.services.map((subService, index) => (
                                <Flex key={index} justify="space-between" pl="lg" >
                                    <Text fontSize="14px" fontWeight="300" color="basic.grey700">
                                        {subService.quantity}x {subService.name}
                                    </Text>
                                    <Text fontSize="14px" fontWeight="300" color="basic.grey300">
                                        ${(subService.price * subService.quantity).toFixed(2)}
                                    </Text>
                                </Flex>
                            ))}
                        </Box>
                        {/* Service fee */}
                        <Flex justify="space-between">
                            <Flex align="center">
                                <Text fontSize="14px" fontWeight="300" color="basic.grey700">Service fee (7.5%)</Text>
                            </Flex>
                            <Text fontSize="14px" fontWeight="400" color="basic.grey700">${serviceFee.toFixed(2)}</Text>
                        </Flex>

                        {/* Taxes */}
                        <Flex justify="space-between">
                            <Text fontSize="14px" fontWeight="300" color="basic.grey700">Taxes</Text>
                            <Text fontSize="14px" fontWeight="400" color="basic.grey700">${taxes.toFixed(2)}</Text>
                        </Flex>

                        <Box borderBottom="1px solid" borderColor="gray.200" ></Box>

                        {/* Total */}
                        <Flex justify="space-between">
                            <Text fontSize="16px" color="basic.grey900" fontWeight="500">Total</Text>
                            <Text fontSize="16px" color="basic.grey900" fontWeight="500">${total.toFixed(2)}</Text>
                        </Flex>

                        {/* Receipt details */}
                        <Flex direction="column" gap={2} mt={2}>
                            <Flex align="center">
                                <Text fontSize="14px" color="gray.600" >Receipt number</Text>
                                <Text fontSize="14px" ml="auto">number</Text>
                            </Flex>

                            <Flex align="center">
                                <Text fontSize="14px" color="gray.600" >Stripe transaction number</Text>
                                <Text fontSize="14px" ml="auto">number</Text>
                            </Flex>

                            <Flex align="center">
                                <Text fontSize="14px" color="gray.600">Payment method</Text>
                                <Text fontSize="14px" ml="auto">number</Text>
                            </Flex>

                            <Flex align="center">
                                <Text fontSize="14px" color="gray.600">Payment date</Text>
                                <Text fontSize="14px" ml="auto">number</Text>
                            </Flex>
                        </Flex>
                    </Flex>
                </ModalBody>

                <ModalFooter p='0' display="flex" gap="md">
                    <Button
                        flex='1'
                        w="100%"
                        h="50px"
                        border='1px solid'
                        bg='basic.grey0'
                        borderColor='basic.grey200'
                        borderRadius="var(--chakra-space-full)"
                        px='md'
                        py='10px'
                        onClick={() => onClose()}
                        fontSize="16px"
                        fontWeight="400"
                        color="basic.grey900"
                        leftIcon={<CustomIcon name="goback-icon" category="ui" size={16} />}
                    >
                        Go back
                    </Button>
                    <Button
                        flex='1'
                        w="100%"
                        h="50px"
                        bg="gradient.orange"
                        color="white"
                        borderRadius="full"
                        leftIcon={<Icon as={FiDownload} />}
                    >
                        Download
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CompletedService;
