import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Text, SimpleGrid, Box, Flex, Button, Center, Input, Textarea } from '@chakra-ui/react';
import CustomIcon from '../../components/Icon';
import { MarinaServicePublic, SubServiceRequest, ReservationPublic } from '../../client/models';
import { ReservationsService } from '../../client/services';
import { getServiceIconInfo } from '../../utilsBola';
import { useQueryClient } from '@tanstack/react-query';
import useCustomToast from '../../hooks/useCustomToast';



interface ServiceAddProps {
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

const ServiceAdd: React.FC<ServiceAddProps> = ({
    isOpen,
    onClose,
    services,
    reservation,
    rowId = ''
}) => {
    const showToast = useCustomToast();
    const queryClient = useQueryClient();

    // Извлекаем все элементы сервисов из всех сервисов с нужными полями
    const allServiceItems = services.flatMap((service) =>
        service.service_items
            ? service.service_items.map(item => ({
                ...item,
                // Сохраняем title из родительского сервиса
                parentServiceTitle: service.title,
                // Имитация типа для демонстрации - каждый второй элемент будет иметь тип 'measured'
            }))
            : []
    );

    // State to track quantity for each item
    const [quantities, setQuantities] = useState<Record<number, number>>({});

    // Clear quantities when popup opens
    useEffect(() => {
        if (isOpen) {
            setQuantities({});
            // Reset servicesAdded state when modal opens
            setServicesAdded(false);
        }
    }, [isOpen]);

    // Increment quantity
    const incrementQuantity = (index: number) => {
        setQuantities(prev => ({
            ...prev,
            [index]: (prev[index] || 0) + 1
        }));
    };

    // Decrement quantity
    const decrementQuantity = (index: number) => {
        setQuantities(prev => {
            const newQuantities = { ...prev };
            newQuantities[index] = Math.max((prev[index] || 0) - 1, 0);
            if (newQuantities[index] === 0) {
                delete newQuantities[index];
            }
            return newQuantities;
        });
    };

    // Calculate total selected services
    const totalSelectedServices = useMemo(() => {
        return Object.keys(quantities).length;
    }, [quantities]);

    // Clear all selections
    const clearAll = () => {
        setQuantities({});
    };

    // Функция для подготовки выбранных сервисов
    const getSelectedServices = (): SubServiceRequest[] => {
        const selectedServices: SubServiceRequest[] = [];

        // Получаем все активные сервисы (с ненулевым количеством)
        const validQuantities: Record<string, number> = {};
        for (const [idx, qty] of Object.entries(quantities)) {
            if (qty > 0) {
                validQuantities[idx] = qty;
            }
        }
        // Проходим по всем выбранным сервисам
        for (const [idx, qty] of Object.entries(validQuantities)) {
            const index = parseInt(idx, 10);
            let item;

            // Определяем, откуда брать элемент
            if (index < allServiceItems.length) {
                item = allServiceItems[index];
            } else if (index < allServiceItems.length + customServices.length) {
                const customIndex = index - allServiceItems.length;
                item = customServices[customIndex];
            } else {
                continue; // Пропускаем некорректные индексы
            }

            if (!item || !item.name) {
                continue; // Пропускаем элементы без имени
            }

            // Создаем новый объект с точными типами данных
            // ВАЖНО: price, quantity должны быть числами (не строками)
            const price = typeof item.price === 'number' ? item.price :
                typeof item.price === 'string' ? parseFloat(item.price) : 1;

            // Создаем объект в полном соответствии с типом SubServiceRequest
            const serviceItem: SubServiceRequest = {
                title: item.parentServiceTitle || "Service",
                name: item.name,
                price: isNaN(price) ? 1 : price, // Если NaN, используем 1
                unit: item.unit || "item",
                quantity: qty
            };

            selectedServices.push(serviceItem);
        }

        return selectedServices;
    };

    // Создаём объект Open Charge
    const openChargeItem = {
        name: 'Open Charge',
        price: 1,
        unit: 'item',
        type: 'open_charge',
        parentServiceTitle: '',
    };

    const [mode, setMode] = useState<'list' | 'openCharge'>('list');

    // Refs для инпутов
    const itemNameRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const amountRef = useRef<HTMLInputElement>(null);

    // Состояние для описания и имени товара
    const [description, setDescription] = useState('');
    const [itemName, setItemName] = useState('');
    const [amount, setAmount] = useState('');

    // Состояние для хранения пользовательских сервисов
    const [customServices, setCustomServices] = useState<any[]>([]);

    // Объединяем сервисы из API и пользовательские сервисы
    const combinedServiceItems = useMemo(() => {
        return [...allServiceItems, ...customServices];
    }, [allServiceItems, customServices]);

    // Обработчик изменения описания с ограничением в 20 слов
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        const words = text.trim().split(/\s+/);

        if (words.length <= 20) {
            setDescription(text);
        } else {
            // Ограничиваем до 20 слов
            setDescription(words.slice(0, 20).join(' '));
        }
    };

    // Обработчик изменения имени товара с ограничением в 20 символов
    const handleItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;

        if (text.length <= 20) {
            setItemName(text);
        } else {
            // Ограничиваем до 20 символов
            setItemName(text.slice(0, 20));
        }
    };

    // Обработчик изменения суммы
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Удаляем лишние символы, оставляем только цифры и точку
        const value = e.target.value.replace(/[^\d.]/g, '');
        setAmount(value);
    };

    // Add a new state for loading
    const [isOpenChargeLoading, setIsOpenChargeLoading] = useState(false);

    // Add a new state to track successful service addition
    const [servicesAdded, setServicesAdded] = useState(false);

    // Modify the addOpenCharge function to handle loading state
    const addOpenCharge = async () => {
        try {
            // Set loading state to true at the start
            setIsOpenChargeLoading(true);

            // Existing validation logic
            if (!itemName.trim()) {
                showToast('Service name not entered', 'Please enter item name', 'error');
                itemNameRef.current?.focus();
                return;
            }

            // Конвертируем сумму в число
            const priceValue = parseFloat(amount.replace(/[^\d.]/g, ''));
            if (isNaN(priceValue) || priceValue <= 0) {

                showToast('Service amount not entered', 'Please enter amount', 'error');
                amountRef.current?.focus();
                return;
            }

            // Existing logic for creating and adding service
            const newService: SubServiceRequest = {
                title: "Open Charge",
                name: itemName.trim(),
                price: priceValue,
                unit: description.trim() || "item",
                quantity: 1
            };

            const newServiceForDisplay = {
                name: newService.name,
                price: newService.price,
                unit: newService.unit,
                type: 'open_charge',
                parentServiceTitle: newService.title
            };

            const newCustomServices = [...customServices, newServiceForDisplay];
            setCustomServices(newCustomServices);

            const newItemIndex = allServiceItems.length + newCustomServices.length - 1;

            setQuantities(prev => ({
                ...prev,
                [newItemIndex]: 1
            }));


            showToast('Service created', 'success');

            // Reset form and return to services list
            setItemName('');
            setDescription('');
            setAmount('');
            setMode('list');

        } catch (error: any) {
            console.error('Error creating Open Charge service:', error);
            showToast('Error creating service', error.message || "An error occurred while creating the service", 'error');
        } finally {
            // Always set loading state back to false
            setIsOpenChargeLoading(false);
        }
    };

    // Функция для удаления пользовательского сервиса
    const removeCustomService = (idx: number) => {
        // Проверяем, является ли сервис пользовательским
        const customIndex = idx - allServiceItems.length;
        if (customIndex >= 0 && customIndex < customServices.length) {
            // Удаляем из массива customServices
            const newCustomServices = [...customServices];
            newCustomServices.splice(customIndex, 1);
            setCustomServices(newCustomServices);

            // Удаляем из quantities
            const newQuantities = { ...quantities };
            delete newQuantities[idx];
            setQuantities(newQuantities);
            showToast('Service removed', 'The service has been removed from the list', 'loading');
        }
    };

    // Add a new state for loading
    const [isAddServicesLoading, setIsAddServicesLoading] = useState(false);

    // Modify the addServices function to handle loading state
    const addServices = async () => {
        try {
            // Set loading state to true at the start
            setIsAddServicesLoading(true);
            // Получаем все выбранные сервисы
            const selectedServices = getSelectedServices();
            if (selectedServices.length === 0) {
                showToast('No services selected', 'Please select at least one service to add', 'error');
                return;
            }

            // Получаем ID резервации
            const reservationId = getReservationId(reservation);
            if (!reservationId) {
                console.error('Missing reservation ID', { reservation });
                showToast('No reservation ID found', 'No reservation ID found. Please make sure a valid reservation is selected.', 'error');
                return;
            }

            // ВАЖНОЕ ИЗМЕНЕНИЕ: Отправляем отдельный запрос для каждого сервиса
            // Создаем массив промисов для отправки каждого сервиса
            const servicePromises = selectedServices.map(async (service) => {
                // Создаем запрос для одного сервиса
                const serviceRequest = {
                    requested_date: new Date().toISOString(),
                    services: [service], // Массив с одним элементом
                    special_instructions: null
                };

                try {
                    // Отправляем запрос для одного сервиса
                    const response = await ReservationsService.requestReservationService({
                        reservationId,
                        requestBody: serviceRequest
                    });
                    return { success: true, service, response };
                } catch (err) {
                    console.error(`Error adding service "${service.name}":`, err);
                    return { success: false, service, error: err };
                }
            });

            // Ждем завершения всех запросов
            const results = await Promise.all(servicePromises);

            // Подсчитываем успешные и неуспешные запросы
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;

            // Показываем соответствующее уведомление
            if (successful > 0 && failed === 0) {
                showToast('Services added', 'success');
                // Mark services as added successfully
                setServicesAdded(true);
            } else if (successful > 0 && failed > 0) {
                showToast('Partial success', 'warning');
                setServicesAdded(true);
            } else {
                showToast('Services not added', 'Failed to add any services. Something went wrong', 'error');
            }


            // Инвалидируем кэш React Query
            queryClient.invalidateQueries();

            // Закрываем модальное окно если есть хотя бы 1 успешный запрос
            if (successful > 0) {
                setTimeout(() => {
                    onClose();
                }, 500);
            }
        } catch (error: any) {
            console.error('Error in addServices function:', error);
            // Показываем больше информации об ошибке
            console.error('Error details:', {
                message: error.message,
                status: error.status,
                data: error.data,
                statusText: error.statusText,
                stack: error.stack
            });
            showToast('Error adding services', 'An error occurred while adding the services' ,'error');
        } finally {
            // Always set loading state back to false
            setIsAddServicesLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent
                borderRadius="var(--chakra-space-xl)"
                width="866px"
                maxWidth="866px"
                minWidth="866px"
                height={mode === 'openCharge' ? '502px' : '820px'}
                maxHeight={mode === 'openCharge' ? '502px' : '820px'}
                display="flex"
                flexDirection="column"
            >
                <ModalHeader p='2xl' display="flex" alignItems="center" gap="lg">
                    <Flex flex="1" alignItems="center">
                        <Text fontSize="20px" fontWeight="500" color="gray.900" borderRight="1px solid" borderColor="gray.200" pr="lg">
                            Add Services
                        </Text>
                        {reservation && (
                            <>
                                <CustomIcon
                                    name={reservation?.boat?.vessel_type === 'power'
                                        ? "power-boat"
                                        : reservation?.boat?.vessel_type === 'catamaran'
                                            ? "catamaran-boat"
                                            : "monohul-boat"}
                                    category="boats"
                                    size={32}
                                    style={{
                                        filter: "invert(40%) sepia(90%) saturate(2259%) hue-rotate(352deg) brightness(98%) contrast(97%)",
                                        marginLeft: "var(--chakra-space-lg)"
                                    }}
                                />
                                <Text fontSize="14px" fontWeight="500" color="gray.600" pl="lg" pr="4px">
                                    {reservation?.boat?.boatname || 'Unknown Boat'}
                                </Text>
                                <Text fontSize="12px" fontWeight="300" color="gray.600">|</Text>
                                <Text fontSize="12px" fontWeight="300" color="gray.600" pl="4px">
                                    {`${reservation?.user?.first_name || ''} ${reservation?.user?.last_name || ''}`.trim() || 'Unknown User'}
                                </Text>
                            </>
                        )}
                    </Flex>
                    <Flex bg="basic.grey100" border='1px solid' borderColor='basic.grey200' borderRadius='var(--chakra-space-sm)' py="xs" px="sm" align="center" gap="xs">
                        <CustomIcon
                            name="bola-cell-white"
                            category="ui"
                            size={24}
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
                <ModalBody
                    pb={6}
                    flex="1"
                    overflowY="auto"
                    sx={{
                        '&::-webkit-scrollbar': {
                            display: 'none',
                        },
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}
                >
                    {mode === 'list' ? (
                        allServiceItems.length === 0 ? (
                            <Text>No service items available</Text>
                        ) : (
                            <SimpleGrid gap="2xl" columns={3} spacing={4}>
                                {[...combinedServiceItems, openChargeItem].map((item, idx, arr) => {
                                    // Если это Open Charge
                                    if (idx === arr.length - 1) {
                                        return (
                                            <Flex
                                                key="open-charge"
                                                flexDirection="column"
                                                alignItems="center"
                                                gap="sm"
                                                w="246px"
                                                p='lg'
                                                borderWidth="1px"
                                                borderColor="gray.200"
                                                borderRadius="xl"
                                                bg="white"
                                                cursor="pointer"
                                                display="flex"
                                                transition="all 0.2s"
                                                position="relative"
                                            >
                                                <Text color="brand.secondaryBlue" fontSize="16px" fontWeight="500">Open Charge</Text>
                                                <CustomIcon
                                                    {...getServiceIconInfo('Open Charge')}
                                                    size={50}
                                                />
                                                <Text h="22px" color="gray.900" fontSize="12px" fontWeight="300">
                                                    Other products / services / fees
                                                </Text>
                                                <Button
                                                    variant="unstyled"
                                                    borderWidth="1px"
                                                    borderStyle="dashed"
                                                    borderColor="brand.secondaryBlue"
                                                    borderRadius="md"
                                                    width="100%"
                                                    height="42px"
                                                    display="flex"
                                                    justifyContent="center"
                                                    alignItems="center"
                                                    gap="4px"
                                                    px="md"
                                                    py="10px"
                                                    bg="white"
                                                    onClick={() => setMode('openCharge')}
                                                >
                                                    <Text fontSize="14px" fontWeight="400">
                                                        Add item
                                                    </Text>
                                                    <Box display="flex" justifyContent="center" alignItems="center" textAlign="center" p='10px' as="span" fontSize="17px" fontWeight="400">
                                                        +
                                                    </Box>
                                                </Button>
                                            </Flex>
                                        );
                                    }
                                    // Обычный рендер для сервисов
                                    return (
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
                                                <CustomIcon
                                                    name="check-green"
                                                    category="ui"
                                                    size={24}
                                                    style={{
                                                        position: "absolute",
                                                        top: "8px",
                                                        right: "4px"
                                                    }}
                                                />
                                            )}

                                            <CustomIcon
                                                {...getServiceIconInfo(item.name)}
                                                size={50}
                                            />
                                            <Flex gap="xs" alignItems="center">
                                                <Text color="gray.900" fontSize="16px" fontWeight="400">
                                                    ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                                                </Text>
                                                <Text color="gray.900" fontSize="12px" fontWeight="300">
                                                    / {item.unit}
                                                </Text>
                                            </Flex>

                                            {/* Для пользовательских сервисов показываем просто кнопку Remove service */}
                                            {item.type === 'user_defined' ? (
                                                <Button
                                                    onClick={() => {
                                                        if (quantities[idx] && quantities[idx] > 0) {
                                                            // Полностью удаляем пользовательский сервис
                                                            removeCustomService(idx);
                                                        } else {
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
                                                        {(quantities[idx] || 0) > 0 ? "Remove service" : "Add item"}
                                                    </Text>
                                                    <Box display="flex" justifyContent="center" alignItems="center" textAlign="center" p='10px' as="span" fontSize="17px" fontWeight="400">
                                                        {(quantities[idx] || 0) > 0 ? "−" : "+"}
                                                    </Box>
                                                </Button>
                                            ) : item.type === 'unit' ? (
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
                                                            setQuantities(prev => ({ ...prev, [idx]: 0 }));
                                                        } else {
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
                                                        {quantities[idx] && quantities[idx] > 0 ? "Remove service" : "Add item"}
                                                    </Text>
                                                    <Box display="flex" justifyContent="center" alignItems="center" textAlign="center" p='10px' as="span" fontSize="17px" fontWeight="400">
                                                        {quantities[idx] && quantities[idx] > 0 ? "−" : "+"}
                                                    </Box>
                                                </Button>
                                            )}
                                        </Flex>
                                    );
                                })}
                            </SimpleGrid>
                        )
                    ) : (
                        <Flex flexDirection="column" gap="lg" width="574px" margin="0 auto">
                            <Text fontSize="14px" fontWeight="500" color="gray.700">Add fee</Text>
                            <Box display="flex" gap="12px" flexDirection="column">
                                <Box
                                    borderRadius="full"
                                    borderColor="gray.200"
                                    borderWidth="1px"
                                    fontSize="18px"
                                    p='4px 10px 4px 24px'
                                    position="relative"
                                    cursor="text"
                                    onClick={() => itemNameRef.current?.focus()}
                                >
                                    <Text fontSize="12px" color="gray.900" fontWeight="300">
                                        Product / service / fee
                                    </Text>
                                    <Input
                                        ref={itemNameRef}
                                        fontSize="16px"
                                        fontWeight="300"
                                        variant="unstyled"
                                        placeholder="Item name"
                                        _placeholder={{ fontSize: "16px", fontWeight: "300", color: "gray.400" }}
                                        value={itemName}
                                        onChange={handleItemNameChange}
                                        maxLength={20}
                                    />
                                </Box>
                                {/* Description */}
                                <Box
                                    borderRadius="24px"
                                    borderColor="gray.200"
                                    borderWidth="1px"
                                    fontSize="18px"
                                    p='4px 10px 4px 24px'
                                    position="relative"
                                    cursor="text"
                                    onClick={() => descriptionRef.current?.focus()}
                                >
                                    <Text fontSize="12px" color="gray.900" fontWeight="300">
                                        Description
                                    </Text>
                                    <Textarea
                                        ref={descriptionRef}
                                        fontSize="16px"
                                        fontWeight="300"
                                        variant="unstyled"
                                        placeholder="Add a short description so the boater knows what the charge is for. It will be displayed on the boater's bill."
                                        _placeholder={{ fontSize: "16px", fontWeight: "300", color: "gray.400" }}
                                        value={description}
                                        onChange={handleDescriptionChange}
                                    />
                                </Box>
                                {/* Amount */}
                                <Box
                                    borderRadius="full"
                                    borderColor="gray.200"
                                    borderWidth="1px"
                                    fontSize="18px"
                                    p='4px 10px 4px 24px'
                                    position="relative"
                                    cursor="text"
                                    onClick={() => amountRef.current?.focus()}
                                >
                                    <Text fontSize="12px" color="gray.900" fontWeight="300">
                                        Amount
                                    </Text>
                                    <Input
                                        ref={amountRef}
                                        fontSize="16px"
                                        fontWeight="300"
                                        variant="unstyled"
                                        placeholder="$ 0.00"
                                        _placeholder={{ fontSize: "16px", fontWeight: "300", color: "gray.400" }}
                                        value={amount}
                                        onChange={handleAmountChange}
                                    />
                                </Box>
                            </Box>
                        </Flex>
                    )}
                </ModalBody>

                {mode === 'list' && Object.keys(quantities).length > 0 && (
                    <ModalFooter
                        position="sticky"
                        bottom="0"
                        bg="white"
                        zIndex="1"
                        boxShadow="0 -2px 8px rgba(0,0,0,0.04)"
                        width="100%"
                        p='xl'
                        borderTop="1px solid"
                        borderColor="gray.200"
                        display="flex"
                        alignItems="center"
                        mt={4}
                        mb={0}
                        borderBottomRadius="var(--chakra-space-xl)"
                    >
                        <Text flex='1' w='100%' fontWeight="medium">{totalSelectedServices} services added</Text>
                        <Flex flex='1' w='100%' gap="md">
                            <Button
                                flex='1'
                                w='100%'
                                h='50px'
                                variant="outline"
                                onClick={clearAll}
                                leftIcon={<CustomIcon name="close" category="ui" size={11} style={{ marginRight: '10px' }} />}
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
                                flex='1'
                                w='100%'
                                h='50px'
                                px="xl"
                                py="10px"
                                borderRadius="var(--chakra-space-full)"
                                bg="gradient.orange"
                                color="white"
                                _hover={{ bg: "#E55511" }}
                                onClick={addServices}
                                fontSize="16px"
                                fontWeight="400"
                                isLoading={isAddServicesLoading}
                                isDisabled={isAddServicesLoading || servicesAdded}
                            >
                                Add services
                            </Button>
                        </Flex>
                    </ModalFooter>
                )}

                {mode === 'openCharge' && (
                    <ModalFooter
                        position="sticky"
                        bottom="0"
                        bg="white"
                        zIndex="1"
                        boxShadow="0 -2px 8px rgba(0,0,0,0.04)"
                        width="100%"
                        p={4}
                        borderTop="1px solid"
                        borderColor="gray.200"
                        display="flex"
                        justifyContent="flex-end"
                        alignItems="center"
                        mt={4}
                        mb={0}
                        borderBottomRadius="var(--chakra-space-xl)"
                    >
                        <Flex gap="md" w="50%">
                            <Button
                                flex='1'
                                w="100%"
                                h="50px"
                                variant="outline"
                                borderRadius="var(--chakra-space-full)"
                                px='md'
                                py='10px'
                                onClick={() => setMode('list')}
                                fontSize="16px"
                                fontWeight="400"
                                color="basic.grey900"
                                leftIcon={<CustomIcon name="goback-icon" category="ui" size={17} style={{ marginRight: '4px' }} />}
                            >
                                Go back
                            </Button>
                            <Button
                                flex='1'
                                w="100%"
                                h="50px"
                                px="xl"
                                py="10px"
                                borderRadius="var(--chakra-space-full)"
                                bg="gradient.orange"
                                color="white"
                                _hover={{ bg: "#E55511" }}
                                fontSize="16px"
                                fontWeight="400"
                                onClick={addOpenCharge}
                                isLoading={isOpenChargeLoading}
                            >
                                Add fee
                            </Button>
                        </Flex>
                    </ModalFooter>
                )}
            </ModalContent>
        </Modal>
    );
};

export default ServiceAdd;
