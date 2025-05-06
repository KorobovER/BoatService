import { Flex, Text, Button, Image } from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { useMarina } from '../../../context/MarinaContext';
import ServicePopup from './ServicePopup';
import { ReservationExtenstion } from '../TableReservations';
import { useQueryClient } from '@tanstack/react-query';
import { ReservationsService } from '../../../client/services';

interface NoServiceProps {
    reservation?: ReservationExtenstion;
    userName?: string;
    rowId?: string;
    onServicesAdded?: () => void;
}

const NoService = ({ reservation, userName, rowId, onServicesAdded }: NoServiceProps) => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const { selectedMarina } = useMarina();
    const queryClient = useQueryClient();

    const openServicePopup = () => {
        setIsPopupOpen(true);
    };

    // Функция для принудительного обновления данных о резервации
    const refreshReservationData = useCallback(async () => {
        if (!reservation?.reservation_id) return;

        console.log('NoService: Refreshing reservation data...');
        
        try {
            // Принудительно запрашиваем актуальные данные с сервера
            await ReservationsService.readReservation({ id: reservation.reservation_id });
            
            // Инвалидируем кэш, чтобы данные были заново загружены
            queryClient.invalidateQueries();
            
            // Вызываем коллбэк, если он передан
            if (onServicesAdded) {
                console.log('NoService: Calling onServicesAdded callback');
                onServicesAdded();
            }
        } catch (error) {
            console.error('Failed to refresh reservation data in NoService:', error);
        }
    }, [reservation?.reservation_id, queryClient, onServicesAdded]);

    const closeServicePopup = () => {
        setIsPopupOpen(false);
        
        // Обновляем данные после закрытия окна
        setTimeout(() => {
            // Добавляем небольшую задержку, чтобы API успело обновить данные
            refreshReservationData();
        }, 500);
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
                    reservation={reservation}
                    userName={userName}
                    rowId={rowId}
                />
            )}
        </Flex>
    );
};

export default NoService;
