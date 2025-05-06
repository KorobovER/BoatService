import React, { useState, useMemo, useEffect } from 'react';
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
import { MarinaServicePublic, ServiceOnReservationCreate, SubServiceRequest, ReservationPublic, ServiceOnReservationPublic } from '../../../client/models';
import { ReservationsService } from '../../../client/services';
import { getServiceIcon } from './Services';

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
    existingServices?: Array<SubServiceRequest & { requestId: string }>;
    currentServiceRequest?: ServiceOnReservationPublic | null;
    onServiceAdded?: () => void;
}

// Функция для извлечения ID резервации из объекта Boat
const getReservationId = (reservation?: ReservationPublic): string | undefined => {
    // Используем reservation_id из объекта Boat
    // Если его нет, используем id как запасной вариант (для обратной совместимости)
    return reservation ? reservation.reservation_id : undefined;
};

const ServicePopup: React.FC<ServicePopupProps> = ({ 
    isOpen, 
    onClose, 
    services, 
    reservation, 
    userName = '', 
    rowId = '',
    existingServices = [],
    currentServiceRequest = null,
    onServiceAdded
}) => {
    const toast = useToast();

    // ... existing code ...

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

            // ... existing code for submitting services ...

            // Call onServiceAdded callback after successful submission
            if (failCount === 0) {
                if (onServiceAdded) {
                    onServiceAdded();
                }
                onClose();
            }
        } catch (error: any) {
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

    // ... rest of the component ...
} 