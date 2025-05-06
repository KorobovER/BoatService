import React, { useState, useMemo } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Text,
    SimpleGrid,
    Box,
    Image,
    Flex,
    Button,
    Center,
    useToast
} from '@chakra-ui/react';
import { MarinaServicePublic, ServiceOnReservationCreate, SubServiceRequest, ReservationPublic } from '../../../client/models';
import { ReservationsService } from '../../../client/services';

// Иконки для разных типов услуг
const SERVICE_ICONS = {
    TRASH: '/assets/icons/trash_service.svg',
    LAUNCH: '/assets/images/launch_service.svg',
    LAUNDRY: '/assets/images/laundry_service.svg',
    ICE: '/assets/images/ice_service.svg',
    FUEL: '/assets/images/fuel_service.svg',
    PUMP_OUT: '/assets/images/pump_out_service.svg',
    WATER: '/assets/images/water_service.svg',
    DEFAULT: '/assets/images/all_services.svg'
};

// Функция для определения иконки по имени услуги
const getServiceIcon = (name: string): string => {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('trash') || nameLower.includes('waste') || nameLower.includes('garbage')) {
        return SERVICE_ICONS.TRASH;
    } else if (nameLower.includes('launch') || nameLower.includes('boat')) {
        return SERVICE_ICONS.LAUNCH;
    } else if (nameLower.includes('laundry') || nameLower.includes('wash') || nameLower.includes('dry')) {
        return SERVICE_ICONS.LAUNDRY;
    } else if (nameLower.includes('ice')) {
        return SERVICE_ICONS.ICE;
    } else if (nameLower.includes('fuel') || nameLower.includes('gas') || nameLower.includes('diesel') || nameLower.includes('petrol')) {
        return SERVICE_ICONS.FUEL;
    } else if (nameLower.includes('pump') || nameLower.includes('sewage')) {
        return SERVICE_ICONS.PUMP_OUT;
    } else if (nameLower.includes('water')) {
        return SERVICE_ICONS.WATER;
    } else {
        return SERVICE_ICONS.DEFAULT;
    }
};

// Функция для определения типа элемента управления (не использует поле type)
const getItemType = (item: any): 'unit' | 'measured' => {
    // Определяем по единице измерения (unit)
    if (item.unit && typeof item.unit === 'string') {
        // Единицы, которые обычно измеряются (measured)
        const measuredUnits = ['gallon', 'liter', 'kg', 'lb', 'hour'];

        // Если единица измерения соответствует измеряемым, это measured
        if (measuredUnits.some(u => item.unit.toLowerCase().includes(u))) {
            return 'measured';
        }
    }

    // По умолчанию возвращаем unit
    return 'unit';
};

interface ServicePopupProps {
    isOpen: boolean;
    onClose: () => void;
    services: MarinaServicePublic[];
    reservation?: ReservationPublic;
    userName?: string;
    rowId?: string;
}

// Функция для извлечения ID резервации из объекта Boat
const getReservationId = (reservation?: ReservationPublic): string | undefined => {
    // Используем reservation_id из объекта Boat
    // Если его нет, используем id как запасной вариант (для обратной совместимости)
    return reservation ? reservation.reservation_id : undefined;
};

const ServicePopup: React.FC<ServicePopupProps> = ({ isOpen, onClose, services, reservation, userName = '', rowId = '' }) => {
    const toast = useToast();

    // Извлекаем все элементы сервисов из всех сервисов с нужными полями
    const allServiceItems = services.flatMap((service, serviceIndex) =>
        service.service_items
            ? service.service_items.map(item => ({
                ...item,
                // Сохраняем title из родительского сервиса
                parentServiceTitle: service.title,
                // Имитация типа для демонстрации - каждый второй элемент будет иметь тип 'measured'
                type: serviceIndex % 2 === 0 ? 'unit' : 'measured'
            }))
            : []
    );

    // State to track quantity for each item
    const [quantities, setQuantities] = useState<Record<number, number>>({});

    // Increment quantity
    const incrementQuantity = (index: number) => {
        setQuantities(prev => ({
            ...prev,
            [index]: (prev[index] || 0) + 1
        }));
    };

    // Decrement quantity
    const decrementQuantity = (index: number) => {
        setQuantities(prev => ({
            ...prev,
            [index]: Math.max((prev[index] || 0) - 1, 0)
        }));
    };

    // Calculate total selected services
    const totalSelectedServices = useMemo(() => {
        return Object.values(quantities).filter(qty => qty > 0).length;
    }, [quantities]);

    // Clear all selections
    const clearAll = () => {
        setQuantities({});
    };

    // Функция для подготовки выбранных сервисов
    const getSelectedServices = (): SubServiceRequest[] => {
        const selectedServices: SubServiceRequest[] = [];

        for (const [idx, qty] of Object.entries(quantities)) {
            const index = parseInt(idx, 10);
            if (qty > 0 && index < allServiceItems.length) {
                const item = allServiceItems[index];

                try {
                    // Validate title
                    if (!item.parentServiceTitle || typeof item.parentServiceTitle !== 'string') {
                        console.warn('Invalid service title:', item.parentServiceTitle);
                        continue;
                    }

                    // Validate name
                    if (!item.name || typeof item.name !== 'string') {
                        console.warn('Invalid service name:', item.name);
                        continue;
                    }

                    // Validate and convert price
                    let price: number;
                    if (typeof item.price === 'number') {
                        price = item.price;
                    } else if (typeof item.price === 'string') {
                        price = parseFloat(item.price);
                        if (isNaN(price)) {
                            console.warn('Invalid service price (NaN):', item.price);
                            continue;
                        }
                    } else {
                        console.warn('Invalid service price type:', typeof item.price);
                        continue;
                    }

                    // Validate unit
                    if (!item.unit || typeof item.unit !== 'string') {
                        console.warn('Invalid service unit:', item.unit);
                        continue;
                    }

                    // Validate quantity
                    if (typeof qty !== 'number' || qty <= 0) {
                        console.warn('Invalid quantity:', qty);
                        continue;
                    }

                    // All validations passed, create the SubServiceRequest object
                    selectedServices.push({
                        title: item.parentServiceTitle,
                        name: item.name,
                        price: price,
                        unit: item.unit,
                        quantity: qty
                    });

                    console.log('Added valid service:', {
                        title: item.parentServiceTitle,
                        name: item.name,
                        price,
                        unit: item.unit,
                        quantity: qty
                    });
                } catch (error) {
                    console.error('Error validating service item:', error, item);
                }
            }
        }

        return selectedServices;
    };

    // Функция для добавления сервисов к резервации
    const submitServices = async () => {
        try {
            const selectedServices = getSelectedServices();

            if (selectedServices.length === 0) {
                toast({
                    title: "No services selected",
                    description: "Please select at least one service to add",
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            // Используем функцию для извлечения ID резервации
            const reservationId = getReservationId(reservation);

            if (!reservationId) {
                console.error('Missing reservation ID', { reservation });
                toast({
                    title: "Error",
                    description: "No reservation ID found. Please make sure a valid reservation is selected.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            // Создаем объект ServiceOnReservationCreate
            const serviceRequest: ServiceOnReservationCreate = {
                requested_date: new Date().toISOString(),
                services: selectedServices,
                special_instructions: null
            };

            console.log('Creating service request:', JSON.stringify(serviceRequest, null, 2));
            console.log('For reservation ID:', reservationId);

            try {
                // Используем ReservationsService для добавления сервисов
                console.log('API Request Payload:', {
                    reservationId,
                    requestBody: JSON.parse(JSON.stringify(serviceRequest))
                });

                // Log auth token status from local storage (if available)
                try {
                    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                    console.log('Auth token available:', !!token);
                    if (token) {
                        console.log('Token first 10 chars:', token.substring(0, 10) + '...');
                    }
                } catch (e) {
                    console.error('Error checking token:', e);
                }

                const response = await ReservationsService.requestReservationService({
                    reservationId,
                    requestBody: serviceRequest
                });

                console.log('Service creation response:', response);

                // Показываем уведомление об успешном добавлении
                toast({
                    title: "Services added",
                    description: `Successfully added ${selectedServices.length} services to reservation`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });

                // Закрываем модальное окно
                onClose();
            } catch (error: any) {
                console.error('API error details:', {
                    error,
                    message: error.message,
                    body: error.body,
                    status: error.status,
                    statusText: error.statusText
                });

                // Подробная информация об ошибке
                let errorMessage = "Failed to add services to reservation.";

                // Check specifically for 422 Validation Error
                if (error.status === 422) {
                    errorMessage = "Validation Error (422): The data format doesn't match API requirements.";

                    if (error.body?.detail) {
                        // Попытка извлечь детали ошибки валидации
                        const details = Array.isArray(error.body.detail) ? error.body.detail : [error.body.detail];
                        errorMessage = details.map((d: any) =>
                            `Field '${d.loc?.join('.')}': ${d.msg}`
                        ).join('\n');

                        console.error('Validation error details:', details);
                    }
                } else if (error.status === 403) {
                    errorMessage = "Permission Error (403): You don't have permission to access this resource.";
                    console.error('Permission error details:', {
                        reservationId: getReservationId(reservation),
                        reservation: reservation,
                        error: {
                            status: error.status,
                            statusText: error.statusText,
                            message: error.message,
                            body: error.body
                        }
                    });
                    // Show a more user-friendly message with more details
                    toast({
                        title: "Permission Error",
                        description: "You don't have sufficient permissions for this action. This might be because:\n- You're not logged in\n- Your session expired\n- You don't have access to this reservation",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    return; // Exit early
                } else if (error.message) {
                    errorMessage = error.message;
                }

                toast({
                    title: "Error adding services",
                    description: errorMessage,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });

                // Не пробрасываем ошибку выше, обрабатываем здесь
            }

        } catch (error) {
            console.error('Error in service request preparation:', error);
            toast({
                title: "Error adding services",
                description: "Failed to prepare service request. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Обновляем функцию addServices
    const addServices = () => {
        submitServices();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent borderRadius="var(--chakra-space-xl)" width="866px" maxWidth="866px" minWidth="866px">
                <ModalHeader display="flex" alignItems="center" gap="lg">
                    <Flex flex="1" alignItems="center">
                        <Text fontSize="20px" fontWeight="500" color="gray.900" borderRight="1px solid" borderColor="gray.200" pr="lg">Add Services</Text>
                        {reservation && (
                            <>
                                <Image
                                    src={reservation.boat.vessel_type === 'power'
                                        ? "/assets/images/power-boat.svg"
                                        : reservation.boat.vessel_type === 'catamaran'
                                            ? "/assets/images/catamaran-boat.svg"
                                            : "/assets/images/monohul-boat.svg"}
                                    alt={reservation.boat.boatname}
                                    width="40px"
                                    height="40px"
                                    filter="invert(40%) sepia(90%) saturate(2259%) hue-rotate(352deg) brightness(98%) contrast(97%)"
                                    marginLeft="lg"
                                />
                                <Text fontSize="14px" fontWeight="500" color="gray.600" pl="lg" pr="4px">{reservation.boat.boatname}</Text>
                                <Text fontSize="12px" fontWeight="300" color="gray.600">|</Text>
                                <Text fontSize="12px" fontWeight="300" color="gray.600" pl="4px">
                                    {userName || `${reservation.user.first_name || ''} ${reservation.user.last_name || ''}`}
                                </Text>
                            </>
                        )}
                    </Flex>
                    <Flex bg="basic.grey100" border='1px solid' borderColor='basic.grey200' borderRadius='var(--chakra-space-sm)' py="xs" px="sm" align="center" gap="xs">
                        <Image
                            src="/assets/images/bola-cell-secondary.svg"
                            alt={rowId}
                        />
                        <Text fontSize="20px" fontWeight="400" color="gray.900">{rowId}</Text>
                    </Flex>
                    <Button
                        onClick={onClose}
                        variant="unstyled"
                        position="relative"
                        ml={2}
                        fontSize="14px"
                        color="gray.600"
                        fontWeight="400"
                        lineHeight="1"
                        height="auto"
                        p={0}
                    >
                        ✕
                    </Button>
                </ModalHeader>
                <ModalBody pb={6}>
                    {allServiceItems.length === 0 ? (
                        <Text>No service items available</Text>
                    ) : (
                        <SimpleGrid gap="2xl" columns={3} spacing={4}>
                            {allServiceItems.map((item, idx) => (
                                <Flex
                                    flexDirection="column"
                                    alignItems="center"
                                    gap="sm"
                                    w="246px"
                                    key={idx}
                                    p='lg'
                                    borderWidth={(quantities[idx] || 0) > 0 ? "2px" : "1px"}
                                    borderColor={(quantities[idx] || 0) > 0 ? "#007A7B" : "gray.200"}
                                    borderRadius="xl"
                                    bg={(quantities[idx] || 0) > 0 ? "#E5F2F2" : "white"}
                                    cursor="pointer"
                                    display="flex"
                                    transition="all 0.2s"
                                    position="relative"
                                >
                                    <Text color="brand.secondaryBlue" fontSize="16px" fontWeight="500">{item.name}</Text>
                                    {(quantities[idx] || 0) > 0 && (
                                        <Image
                                            src="/assets/images/AddButton.svg"
                                            alt="Selected"
                                            position="absolute"
                                            top="8px"
                                            right="4px"
                                            width="24px"
                                            height="24px"
                                        />
                                    )}

                                    <Image
                                        src={getServiceIcon(item.name)}
                                        alt={item.name}
                                        width="40px"
                                        height="40px"
                                    />
                                    <Flex gap="xs" alignItems="center">
                                        <Text color="gray.900" fontSize="16px" fontWeight="400">
                                            ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                                        </Text>
                                        <Text color="gray.900" fontSize="12px" fontWeight="300">
                                            / {item.unit}
                                        </Text>
                                    </Flex>

                                    {getItemType(item) === 'unit' ? (
                                        <Flex
                                            borderWidth="1px"
                                            borderRadius="md"
                                            borderColor="gray.200"
                                            overflow="hidden"
                                            alignItems="center"
                                        >
                                            <Button
                                                onClick={() => decrementQuantity(idx)}
                                                variant="unstyled"
                                                minW="42px"
                                                h="42px"
                                                borderRadius="0"
                                                borderRight="1px solid"
                                                borderColor="gray.100"
                                                fontSize="17px"
                                            >
                                                −
                                            </Button>
                                            <Center width="46px" flex={1}>
                                                <Text>{quantities[idx] || 0}</Text>
                                            </Center>
                                            <Button
                                                onClick={() => incrementQuantity(idx)}
                                                variant="unstyled"
                                                minW="42px"
                                                h="42px"
                                                borderRadius="0"
                                                borderLeft="1px solid"
                                                borderColor="gray.100"
                                                fontSize="17px"
                                            >
                                                +
                                            </Button>
                                        </Flex>
                                    ) : (
                                        <Button
                                            onClick={() => {
                                                if (quantities[idx] && quantities[idx] > 0) {
                                                    // Если услуга уже выбрана, удаляем ее
                                                    setQuantities(prev => ({ ...prev, [idx]: 0 }));
                                                } else {
                                                    // Иначе добавляем
                                                    incrementQuantity(idx);
                                                }
                                            }}
                                            variant="outline"
                                            borderWidth="1px"
                                            borderColor={quantities[idx] && quantities[idx] > 0 ? "#007A7B" : "gray.200"}
                                            borderRadius="md"
                                            width="100%"
                                            height="42px"
                                            display="flex"
                                            justifyContent="center"
                                            alignItems="center"
                                            gap="4px"
                                            px="md"
                                            py="10px"
                                            bg={quantities[idx] && quantities[idx] > 0 ? "#E5F2F2" : "white"}
                                        >
                                            <Text fontSize="14px" fontWeight="400">
                                                {quantities[idx] && quantities[idx] > 0 ? "Remove service" : "Add service"}
                                            </Text>
                                            <Box display="flex" justifyContent="center" alignItems="center" textAlign="center" p='10px' as="span" fontSize="17px" fontWeight="400">
                                                {quantities[idx] && quantities[idx] > 0 ? "−" : "+"}
                                            </Box>
                                        </Button>
                                    )}
                                </Flex>
                            ))}
                        </SimpleGrid>
                    )}
                </ModalBody>

                {totalSelectedServices > 0 && (
                    <ModalFooter
                        position="relative"
                        width="100%"
                        bg="white"
                        p={4}
                        borderTop="1px solid"
                        borderColor="gray.200"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mt={4}
                        mb={0}
                        borderBottomRadius="var(--chakra-space-xl)"
                    >
                        <Text fontWeight="medium">{totalSelectedServices} services added</Text>
                        <Flex gap={4}>
                            <Button
                                variant="outline"
                                onClick={clearAll}
                                leftIcon={<Box as="span" fontSize="sm">×</Box>}
                                color="gray.900"
                                borderColor="gray.200"
                                borderRadius="var(--chakra-space-full)"
                                px="md"
                                py="10px"
                                fontSize="16px"
                                fontWeight="400"
                            >
                                Clear all
                            </Button>
                            <Button
                                px="xl"
                                py="10px"
                                borderRadius="var(--chakra-space-full)"
                                bg="gradient.orange"
                                color="white"
                                _hover={{ bg: "#E55511" }}
                                onClick={addServices}
                                fontSize="16px"
                                fontWeight="400"
                            >
                                Add services
                            </Button>
                        </Flex>
                    </ModalFooter>
                )}
            </ModalContent>
        </Modal>
    );
};

export default ServicePopup;
