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
  ModalCloseButton
} from '@chakra-ui/react';

interface ServiceItem {
  name: string;
  price: number;
  quantity: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: ServiceItem[];
  serviceFee: number;
  taxes: number;
  total: number;
  onCharge: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  services,
  serviceFee,
  taxes,
  total,
  onCharge
}) => (
  <Modal isOpen={isOpen} onClose={onClose} isCentered>
    <ModalOverlay />
    <ModalContent display='flex' flexDirection='column' gap='32px' padding='16px' borderRadius="12px" maxW="600px">
      <ModalHeader display='flex' flexDirection='column' p='0'>
        <Flex display='flex' justifyContent='space-between' alignItems='center'>
          <Text fontSize='20px' fontWeight='500' color='basic.grey900'>Are you sure you want to process this payment?</Text>
          <Flex alignItems='center' justifyContent='end'>
            <ModalCloseButton position='static' variant='unstyled' w="9px" h="9px" />
          </Flex>
        </Flex>
        <Text fontSize="14px" color="gray.900" fontWeight='300'>
          Charges apply only to services marked as completed
        </Text>
      </ModalHeader>
      <ModalBody p='0'>
        <Flex direction="column" gap='12px'>
          <Flex justify="space-between">
            <Text fontSize='14px' fontWeight='300' color='basic.grey700'>Paid services</Text>
            <Text fontSize='14px' fontWeight='400' color='basic.grey700'>${services.reduce((sum, s) => sum + s.price * s.quantity, 0).toFixed(2)}</Text>
          </Flex>
          {services.map((s, i) => (
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
        <Flex justify="space-between" fontWeight="bold" mt='24px'>
          <Text fontSize='16px' fontWeight='500' color='basic.grey900'>Total</Text>
          <Text fontSize='16px' fontWeight='500' color='basic.grey900'>${total.toFixed(2)}</Text>
        </Flex>
      </ModalBody>
      <ModalFooter display='flex' justifyContent='space-between' gap='md'>
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
        <Button
          flex='1'
          h="50px"
          bg='system.successGreen'
          color='white'
          borderRadius='full'
          onClick={onCharge}
          fontSize="16px"
          fontWeight="400"
          leftIcon={<Image ml='4px' h='auto' src='assets/images/check-icon.svg' />}
        >
          CHARGE NOW
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export default PaymentModal; 