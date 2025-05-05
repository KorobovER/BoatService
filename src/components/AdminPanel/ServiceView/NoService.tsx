import { Flex, Text, Button, Image } from '@chakra-ui/react';
import { useState } from 'react';
import { useMarina } from '../../../context/MarinaContext';
import ServicePopup from './ServicePopup';
import { Boat } from '../TableReservations';

interface NoServiceProps {
    boat?: Boat;
    userName?: string;
    rowId?: string;
}

const NoService = ({ boat, userName, rowId }: NoServiceProps) => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const { selectedMarina } = useMarina();

    const openServicePopup = () => {
        setIsPopupOpen(true);
    };

    const closeServicePopup = () => {
        setIsPopupOpen(false);
    };

    return (
        <Flex alignSelf="stretch" gap='sm' justifyContent="center" alignItems="center" flexDirection="column" border="1px dashed" borderColor="brand.primaryOrange" borderRadius="var(--chakra-space-sm)" w="100%">
            <Flex flexDirection="column" alignItems="center" gap='20px' py='3xl' px='md' w="100%">
                <Image width="52px" height="52px" src="/assets/images/service.svg" alt="service" />
                <Flex flexDirection="column" alignItems="center">
                    <Text textAlign="center" fontSize="20px" fontWeight="500" color="brand.primaryOrange">No service requests</Text>
                    <Text textAlign="center" fontSize="14px" fontWeight="300" color="brand.primaryOrange">Click here to add a service</Text>
                </Flex>
                <Button variant="unstyled" _hover={{ opacity: 0.8 }} borderRadius="100%" onClick={openServicePopup}>
                    <Image src="/assets/images/button-plus.svg" alt="plus" />
                </Button>
            </Flex>
            
            {selectedMarina && (
                <ServicePopup 
                    isOpen={isPopupOpen} 
                    onClose={closeServicePopup} 
                    services={selectedMarina.active_services || []} 
                    boat={boat}
                    userName={userName}
                    rowId={rowId}
                />
            )}
        </Flex>
    );
};

export default NoService; 