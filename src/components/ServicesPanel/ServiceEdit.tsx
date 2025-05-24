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
    IconButton
} from '@chakra-ui/react';
import CustomIcon from '../../components/Icon';
import { SubServiceRequest } from '../../client/models';

interface ServiceEditProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (quantity: number) => void;
    service: SubServiceRequest & {
        iconUrl?: string;
    };
    loading?: boolean;
}

const ServiceEdit: React.FC<ServiceEditProps> = ({
    isOpen,
    onClose,
    onUpdate,
    service,
    loading = false
}) => {
    const [quantity, setQuantity] = useState(service.quantity);

    React.useEffect(() => {
        if (isOpen) setQuantity(service.quantity);
    }, [isOpen, service.quantity]);

    const handleUpdate = () => {
        onUpdate(quantity);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent padding='16px' borderRadius="12px" maxW="600px">
                <Flex alignItems='center' justifyContent='end' height='28px'>
                    <ModalCloseButton position='static' variant='unstyled' w="42px" h="42px" />
                </Flex>
                <ModalBody p='0'>
                    <Flex direction="column" align="center" gap='3xl'>
                        <Flex flexDirection="column" align="center" gap='sm'>
                            <Box w='90px' h='90px' bg='brand.secondaryBlue' borderRadius='full' display='flex' alignItems='center' justifyContent='center'>
                                <CustomIcon name="alert-icon-blue" category="alerts" size={90} />
                            </Box>
                            <Flex border="1px solid" borderColor="brand.secondaryBlue" bg="bg.info" borderRadius="20px" w="100%" p='10px 20px' direction="row" align="center" gap='md' position="relative">
                                <Box flex='1'>
                                    <Text fontSize="16px" color="brand.secondaryBlue" fontWeight="500" mb="2px">
                                        Edit service quantity?
                                    </Text>
                                    <Text color="gray.700" fontSize="14px" fontWeight="300">
                                        You're about to update the quantity for this service. The boater will be notified if the updated quantity is different from what was originally requested.
                                    </Text>
                                </Box>
                            </Flex>
                        </Flex>
                        <Flex direction="column" align="center">
                            <Box border="1px solid" borderColor="gray.200" borderRadius="24px" bg="white" p="lg" w="248px" display="flex" flexDirection="column" alignItems="center" gap="sm">
                                <Text fontSize="16px" fontWeight="500" color="brand.secondaryBlue" textAlign="center">
                                    {service.name}
                                </Text>
                                <Image src={service.iconUrl} alt={service.name} w="50px" h="50px" />
                                <Flex alignItems="center" color="gray.900" fontSize="16px" fontWeight="400">
                                    ${service.price.toFixed(2)}<Text ml="4px" color="gray.900" fontSize="12px" fontWeight="300">/ {service.unit}</Text>
                                </Flex>
                                <Flex h="48px" border="1px solid" borderColor="gray.200" borderRadius="12px" overflow="hidden" alignItems="center" justifyContent="center" bg="white">
                                    <IconButton
                                        aria-label="Decrease"
                                        icon={<Text fontSize="17px" color="gray.300" fontWeight="400">−</Text>}
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        borderRadius="0"
                                        borderRight="1px solid"
                                        borderColor="gray.200"
                                        variant="ghost"
                                        bg="white"
                                        w="42px"
                                        h="42px"
                                        isDisabled={loading}
                                    />
                                    <Flex w="46px" align="center" justify="center" position="relative">
                                        <Text fontSize="20px" fontWeight="400">{quantity}</Text>
                                    </Flex>
                                    <IconButton
                                        aria-label="Increase"
                                        icon={<Text fontSize="17px" color="gray.900" fontWeight="400">+</Text>}
                                        onClick={() => setQuantity(q => q + 1)}
                                        borderRadius="0"
                                        borderLeft="1px solid"
                                        borderColor="gray.200"
                                        variant="ghost"
                                        bg="white"
                                        w="42px"
                                        h="42px"
                                        isDisabled={loading}
                                    />
                                </Flex>
                            </Box>
                        </Flex>
                        {/* Кнопки */}
                        <Flex w="100%" gap='md'>
                            <Button
                                flex='1'
                                w="100%"
                                h="50px"
                                variant="outline"
                                borderRadius="var(--chakra-space-full)"
                                px='md'
                                py='10px'
                                onClick={onClose}
                                fontSize="16px"
                                fontWeight="400"
                                color="basic.grey900"
                                isDisabled={loading}
                                leftIcon={<CustomIcon name="goback-icon" category="ui" size={17} style={{ marginRight: '4px' }} />}
                            >
                                Go back
                            </Button>
                            <Button
                                flex='1'
                                w="100%"
                                h="50px"
                                bg="gradient.orange"
                                color="white"
                                borderRadius="var(--chakra-space-full)"
                                px='md'
                                py='10px'
                                onClick={handleUpdate}
                                fontSize="16px"
                                fontWeight="400"
                                isLoading={loading}
                                loadingText="Updating..."
                                leftIcon={<CustomIcon name="check-icon" category="ui" size={17} style={{ marginLeft: '4px' }} />}
                            >
                                Update
                            </Button>
                        </Flex>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ServiceEdit;
