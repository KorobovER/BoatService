import { Flex, Text, Button, Image, useDisclosure } from '@chakra-ui/react';
import { useMarina } from '../../context/MarinaContext';
import ServiceAdd from './ServiceAdd';
import { ReservationExtenstion } from '../ReservationExtenstion';


interface NoServiceProps {
    reservation?: ReservationExtenstion;
    userName?: string;
    rowId?: string;
    onServicesAdded?: () => void;
}

const NoService: React.FC<NoServiceProps> = ({ reservation, userName, rowId}) => {
    const { isOpen: isServiceAddOpen, onOpen: onServiceAddOpen, onClose: onServiceAddClose } = useDisclosure();
    const { selectedMarina } = useMarina();

    const openServiceAdd = () => {
        onServiceAddOpen();
    };

    const closeServiceAdd = () => {
        onServiceAddClose();
    };


    return (
        <Flex alignSelf="stretch" gap='sm' justifyContent="center" alignItems="center" flexDirection="column" border="1px dashed" borderColor="brand.primaryOrange" borderRadius="var(--chakra-space-sm)" w="100%">
            <Flex flexDirection="column" alignItems="center" gap='20px' py='3xl' px='md' w="100%">
                <Image width="52px" height="52px" src="/assets/images/service.svg" alt="service" />
                <Flex flexDirection="column" alignItems="center">
                    <Text textAlign="center" fontSize="20px" fontWeight="500" color="brand.primaryOrange">No service requests</Text>
                    <Text textAlign="center" fontSize="14px" fontWeight="300" color="brand.primaryOrange">Click here to add a service</Text>
                </Flex>
                <Button variant="unstyled" _hover={{ opacity: 0.8 }} borderRadius="100%" onClick={openServiceAdd}>
                    <Image src="/assets/images/button-plus.svg" alt="Add service" />
                </Button>
            </Flex>

            {selectedMarina && (
                <ServiceAdd
                    isOpen={isServiceAddOpen}
                    onClose={closeServiceAdd}
                    services={selectedMarina.active_services || []}
                    reservation={reservation}
                    userName={userName}
                    rowId={rowId}
                />
            )}
        </Flex>
    );
};

export default NoService;
