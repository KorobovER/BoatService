import { Flex, Text, Button, Image, useDisclosure } from '@chakra-ui/react';
import { useMarina } from '../../context/MarinaContext';
import ServiceAdd from './ServiceAdd';
import { ReservationExtenstion } from '../ReservationExtenstion';
import { useMemo } from 'react';
import useCustomToast from '../../hooks/useCustomToast';
interface NoServiceProps {
    reservation?: ReservationExtenstion;
    userName?: string;
    rowId?: string;
    onServicesAdded?: () => void;
}

const NoService: React.FC<NoServiceProps> = ({ reservation, userName, rowId}) => {
    const { isOpen: isServiceAddOpen, onOpen: onServiceAddOpen, onClose: onServiceAddClose } = useDisclosure();
    const { selectedMarina } = useMarina();
    const showToast = useCustomToast();

    // Проверка, можно ли добавлять сервисы к данному бронированию
    const canAddServices = useMemo(() => {
        if (!reservation) return true;

        // Нельзя добавлять сервисы к завершенным, отмененным или не показавшимся бронированиям
        if (
            reservation.is_completed ||
            reservation.status === "cancelled" ||
            reservation.status === "no_show" ||
            reservation.status === "checked_out"
        ) {
            return false;
        }

        return true;
    }, [reservation]);

    // Получаем сообщение о статусе бронирования
    const reservationStatusMessage = useMemo(() => {
        if (!reservation) return "";

        if (reservation.is_completed) {
            return "Cannot add services to a completed reservation.";
        }

        if (reservation.status === "cancelled") {
            return "Cannot add services to a cancelled reservation.";
        }

        if (reservation.status === "no_show") {
            return "Cannot add services to a no show reservation.";
        }

        if (reservation.status === "checked_out") {
            return "Cannot add services to a checked out reservation.";
        }

        return "";
    }, [reservation]);



    const openServiceAdd = () => {
        // Проверка статуса перед открытием модального окна
        if (!canAddServices) {
            const statusText = reservation?.status?.replace('_', ' ') || '';
            const title = reservation?.is_completed
                ? "Reservation Completed"
                : `Reservation ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`;

            showToast(title, reservationStatusMessage, 'warning');
            return;
        }

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
                    <Text textAlign="center" fontSize="14px" fontWeight="300" color="brand.primaryOrange">
                        {canAddServices
                            ? "Click here to add a service"
                            : "Cannot add services to this reservation"}
                    </Text>
                </Flex>
                <Button
                    variant="unstyled"
                    _hover={{ opacity: canAddServices ? 0.8 : 1 }}
                    borderRadius="100%"
                    onClick={openServiceAdd}
                    cursor={canAddServices ? "pointer" : "not-allowed"}
                    opacity={canAddServices ? 1 : 0.6}
                >
                    <Image src="/assets/images/button-plus.svg" alt="Add service" />
                </Button>
            </Flex>

            {selectedMarina && (
                <ServiceAdd
                    isOpen={isServiceAddOpen}
                    onClose={closeServiceAdd}
                    services={selectedMarina?.active_services || []}
                    reservation={reservation}
                    userName={userName}
                    rowId={rowId}
                />
            )}
        </Flex>
    );
};

export default NoService;
