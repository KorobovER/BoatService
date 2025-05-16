import React from 'react';
import {
    Box,
    Text,
    Flex,
    CloseButton
} from '@chakra-ui/react';
import {
    WarningIcon,
    InfoIcon
} from '@chakra-ui/icons';

interface CustomToastProps {
    title: string;
    description?: string;
    status?: 'success' | 'error' | 'warning' | 'info' | 'loading';
    onClose?: () => void;
    toastId?: string;
    index?: number;
}

const CustomToast: React.FC<CustomToastProps> = ({
    title,
    description,
    status = 'info',
    onClose,
    toastId,
    index = 0
}) => {
    const getIconAndColor = () => {
        switch (status) {
            case 'success':
                return {
                    color: 'system.successGreen',
                    bg: 'bg.success',
                    borderColor: 'system.successGreen'
                };
            case 'error':
                return {
                    color: 'system.errorRedNew',
                    bg: 'system.error15',
                    borderColor: 'system.errorRedNew'
                };
            case 'warning':
                return {
                    icon: WarningIcon,
                    color: 'orange.500',
                    bg: 'orange.50',
                    borderColor: 'orange.200'
                };
            case 'loading':
                return {
                    color: 'blue.500',
                    bg: 'blue.50',
                    borderColor: 'blue.200'
                };
            default:
                return {
                    icon: InfoIcon,
                    color: 'blue.500',
                    bg: 'blue.50',
                    borderColor: 'blue.200'
                };
        }
    };

    const { color, bg, borderColor } = getIconAndColor();

    return (
        <Flex
            position="absolute"
            top={`${146 + (index * 120)}px`}
            right="28px"
            bg={bg}
            borderRadius="12px"
            border="1px solid"
            borderColor={borderColor}
            p='10px 20px'
            alignItems="start"
            boxShadow="md"
            maxWidth="400px"
            width="100%"
            zIndex={9999 - index}
            data-toast-id={toastId}
            transition="all 0.3s ease-in-out"
        >
            <Box flex="1">
                <Flex justifyContent="space-between" alignItems="center">
                    <Text
                        fontWeight="bold"
                        color={color}
                        mb={description ? 1 : 0}
                    >
                        {title}
                    </Text>
                    {onClose && (
                        <CloseButton
                            onClick={onClose}
                        />
                    )}
                </Flex>

                {description && (
                    <Text
                        fontSize="sm"
                        color="basic.grey900"
                    >
                        {description}
                    </Text>
                )}
            </Box>
        </Flex>
    );
};

export default CustomToast; 