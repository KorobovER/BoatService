import React, { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalCloseButton,
    Box,
    Text,
    Image,
    Flex,
    Button,
    IconButton,
    useToast
} from '@chakra-ui/react';

interface QuantityInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceId: string | null;
    initialQuantity: number;
    serviceName: string;
    serviceIcon: string;
    unitOfMeasurement: string;
    isSubmitting?: boolean;
    onSubmit: (serviceId: string, quantity: number) => void;
}

const QuantityInputModal: React.FC<QuantityInputModalProps> = ({
    isOpen,
    onClose,
    serviceId,
    initialQuantity = 1,
    serviceName = 'Fuel',
    serviceIcon = '/assets/icons/fuel_service.svg',
    unitOfMeasurement = 'person',
    isSubmitting = false,
    onSubmit
}) => {
    const [quantity, setQuantity] = useState(initialQuantity);
    const toast = useToast();

    // Reset quantity when modal opens with a new serviceId
    React.useEffect(() => {
        if (isOpen && serviceId) {
            setQuantity(initialQuantity);
        }
    }, [isOpen, serviceId, initialQuantity]);

    const handleQuantitySubmit = () => {
        if (!serviceId) {
            toast({
                title: "Error",
                description: "Missing service information",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        
        // Call the parent component's submit handler with service ID and quantity
        onSubmit(serviceId, quantity);
    };

    // Determine the appropriate message based on the service type
    const getQuantityLabel = () => {
        // Check if the service is related to people/passengers
        if (unitOfMeasurement.toLowerCase() === 'person') {
            return 'Enter number of Passengers:';
        }
        
        return `Enter number of ${unitOfMeasurement} dispensed:`;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent padding='16px' borderRadius="md" maxW="600px">
                <Flex alignItems='center' justifyContent='end' height='42px'><ModalCloseButton position='static' variant='unstyled' w="42px" h="42px" /></Flex>
                <ModalBody>
                    <Flex direction="column" align="center" gap='3xl'>
                        <Flex direction="column" align="center" gap='xs'>
                            <Box w="62px" h="62px" bg="gradient.orange" borderRadius="md" p={3}>
                                <Image
                                    src={serviceIcon}
                                    alt={serviceName}
                                    filter="brightness(0) invert(1)"
                                    onError={(e) => {
                                        console.error('Error loading image:', serviceIcon);
                                        e.currentTarget.src = '/assets/icons/fuel_service.svg';
                                    }}
                                />
                            </Box>
                            <Text fontSize="24px" fontWeight="400" color="gray.800" textAlign="center">
                                {getQuantityLabel()}
                            </Text>
                        </Flex>

                        <Flex w="342px" h="70px" border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
                            <IconButton
                                aria-label="Decrease"
                                icon={<Text fontSize="24px">−</Text>}
                                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                borderRadius="0"
                                borderRight="1px solid"
                                borderColor="gray.200"
                                variant="ghost"
                                bg="white"
                                w="70px"
                                h="100%"
                                isDisabled={isSubmitting}
                            />
                            <Flex flex="1" align="center" justify="center" position="relative">
                                <Text fontSize="24px" fontWeight="400">{quantity}</Text>
                            </Flex>
                            <IconButton
                                aria-label="Increase"
                                icon={<Text fontSize="24px">+</Text>}
                                onClick={() => setQuantity(prev => prev + 1)}
                                borderRadius="0"
                                borderLeft="1px solid"
                                borderColor="gray.200"
                                variant="ghost"
                                bg="white"
                                w="70px"
                                h="100%"
                                isDisabled={isSubmitting}
                            />
                        </Flex>

                        <Flex gap={4} w="100%" mt={4}>
                            <Button
                                w="100%"
                                variant="outline"
                                borderRadius="var(--chakra-space-full)"
                                px='md'
                                py='10px'
                                onClick={onClose}
                                fontSize="16px"
                                fontWeight="400"
                                color="basic.grey900"
                                isDisabled={isSubmitting}
                            >
                                Go back
                            </Button>
                            <Button
                                w="100%"
                                bg="system.successGreen"
                                color="white"
                                borderRadius="var(--chakra-space-full)"
                                px='md'
                                py='10px'
                                onClick={handleQuantitySubmit}
                                fontSize="16px"
                                fontWeight="400"
                                isLoading={isSubmitting}
                                loadingText="Updating..."
                            >
                                Mark as done
                            </Button>
                        </Flex>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default QuantityInputModal; 