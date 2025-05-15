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
    Textarea,
} from '@chakra-ui/react';
import { SubServiceRequest} from '../../client/models';

interface ServiceCancelProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    service: SubServiceRequest & {
        iconUrl?: string;
    };
    loading?: boolean;
}

const ServiceCancel: React.FC<ServiceCancelProps> = ({
    isOpen,
    onClose,
    onConfirm,
    service,
    loading = false
}) => {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        onConfirm(reason.trim());
        setReason('');
    };

    const handleClose = () => {
        setReason('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} isCentered>
            <ModalOverlay />
            <ModalContent padding='16px' borderRadius="12px" maxW="600px">
                <Flex alignItems='center' justifyContent='end' height='28px'>
                    <ModalCloseButton position='static' variant='unstyled' w="42px" h="42px" />
                </Flex>
                <ModalBody p='0'>
                    <Flex direction="column" align="center" gap='2xl'>
                        <Flex direction="column" align="center" gap='sm' w="100%">
                            <Box bg='system.errorRedNew' w='90px' h='90px' borderRadius='full' display='flex' alignItems='center' justifyContent='center'>
                                <Image w='90px' h='90px' src='assets/images/alert-icon-red.svg'></Image>
                            </Box>
                            <Flex border="1px solid" borderColor="system.errorRedNew" bg="bg.error" borderRadius="20px" w="100%" p='10px 20px' direction="column" justifyContent="center" gap='xs'>
                                <Text fontSize="16px" color="system.errorRedNew" fontWeight="400" textAlign="start">
                                    Cancel this service?
                                </Text>
                                <Text color="basic.grey900" fontSize="14px" textAlign="start" fontWeight="300">
                                    This action will remove the request from the boater's account and cannot be undone.
                                </Text>
                            </Flex>
                        </Flex>

                        <Flex gap='13px' align="center" bg="basic.grey100" borderRadius="20px" p='xl'>
                            <Box bg='system.errorRedNew' w='80px' h='80px' borderRadius='20px' display='flex' alignItems='center' justifyContent='center'>
                                <Image
                                    w='80px'
                                    h='80px'
                                    src={service.iconUrl}
                                    alt={service.name}
                                    boxSize="40px"
                                    borderRadius="md"
                                    filter="brightness(0) invert(1)"
                                />
                            </Box>

                            <Box display='flex' flexDirection='column' gap='7px'>
                                <Text fontWeight="500" color="basic.grey900" fontSize="24px">{service.name}</Text>
                                <Text color="basic.grey900" fontSize="24px" fontWeight='400'>
                                    ${service.price.toFixed(2)} / {service.unit}
                                </Text>
                            </Box>
                        </Flex>

                        <div style={{ position: 'relative', width: '100%', marginBottom: '0' }}>
                            <Text
                                as="label"
                                htmlFor="cancel-reason-textarea"
                                position="absolute"
                                left="24px"
                                top="6px"
                                fontSize="12px"
                                color="gray.500"
                                fontWeight={400}
                                pointerEvents="none"
                                bg="white"
                                px="2px"
                                zIndex={2}
                            >
                                Reason for Cancellation
                            </Text>
                            <Textarea
                                id="cancel-reason-textarea"
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="20px"
                                bg="white"
                                color="gray.600"
                                fontSize="16px"
                                fontWeight={300}
                                minH="90px"
                                p="20px 24px 20px 24px"
                                w="100%"
                                resize="none"
                                boxShadow="none"
                                mb="0"
                                placeholder="Please provide a short explanation for why this service is being canceled. This message will be sent to the boater to help avoid confusion"
                                _placeholder={{ fontSize: '16px', color: 'gray.600', fontWeight: 300 }}
                            />
                        </div>

                        <Flex w="100%" gap='md'>
                            <Button
                                flex='1'
                                w="100%"
                                h="50px"
                                bg="system.errorRedNew"
                                color="white"
                                borderRadius="var(--chakra-space-full)"
                                px='md'
                                py='10px'
                                onClick={handleConfirm}
                                fontSize="16px"
                                fontWeight="400"
                                isLoading={loading}
                                loadingText="Cancelling..."
                                leftIcon={<Image mr='4px' h='auto' src='assets/images/alert-icon.svg' />}
                            >
                                Yes, cancel service
                            </Button>
                            <Button
                                flex='1'
                                w="100%"
                                h="50px"
                                variant="outline"
                                borderRadius="var(--chakra-space-full)"
                                px='md'
                                py='10px'
                                onClick={handleClose}
                                fontSize="16px"
                                fontWeight="400"
                                color="basic.grey900"
                                isDisabled={loading}
                                leftIcon={<Image mr='4px' w='17px' h='auto' src='assets/images/goback-icon.svg' />}
                            >
                                Go back
                            </Button>
                        </Flex>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ServiceCancel;
