import {
    Flex,
    Image,
    Text,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Box,
    HStack,
    Spinner,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { MarinaPublicBase } from '../../client';
import { useMarina } from '../../context/MarinaContext';
import useAuth from "../../hooks/useAuth";

// Добавляем функцию преобразования URL в начало файла, перед компонентом
const transformS3Url = (url: string): string => {
    if (!url) return '';

    // Преобразование URL из формата s3://bola-public-assets/...
    // в https://s3.amazonaws.com/bola-public-assets/...
    if (url.startsWith('s3://')) {
        const path = url.substring(5); // Убираем 's3://'
        const parts = path.split('/');
        const bucket = parts[0];
        const key = parts.slice(1).join('/');
        return `https://s3.amazonaws.com/${bucket}/${key}`;
    }

    return url;
};

const MarinasMenu = () => {
    const { user: currentUser, isLoading } = useAuth();
    const { selectedMarina, setSelectedMarina } = useMarina();

    const handleMarinaSelect = async (marina: MarinaPublicBase) => {
        setSelectedMarina(marina);
    };

    useEffect(() => {
        if (currentUser?.marinas && currentUser?.marinas.length > 0) {
            if (!selectedMarina && currentUser?.marinas.length > 0) {
                handleMarinaSelect(currentUser?.marinas[0]);
            }
        }
    }, [currentUser]);

    if (isLoading) {
        return (
            <Flex align="center" justify="center" w="300px">
                <Spinner size="sm" color="ui.main" />
            </Flex>
        );
    }

    if (currentUser?.marinas.length === 0) {
        return (
            <Flex align="center" justify="center" w="300px" color="basic.grey600">
                No marinas available
            </Flex>
        );
    }

    return (
        <Box position="relative" style={{ zIndex: 9999 }}>
            <Menu>
                <MenuButton>
                    <Flex
                        align='center'
                        gap='md'
                        w='236px'
                        p='xs'
                        pr='lg'
                        bg='white'
                        rounded='full'
                        border='1px solid var(--chakra-colors-basic-grey200)'
                        _hover={{ bg: 'gray.50' }}
                        cursor="pointer"
                    >
                        <Image
                            rounded='full'
                            src={selectedMarina?.logo_url ? transformS3Url(selectedMarina.logo_url) : undefined}
                            boxSize="35px"
                            fallbackSrc={selectedMarina?.logo_url ? transformS3Url(selectedMarina.logo_url) : undefined}
                            alt={selectedMarina?.name || "Marina"}
                        />
                        <Flex align='center' gap='sm'>
                            <Text color='basic.grey900' fontSize='14px' fontWeight="400" noOfLines={1} textAlign="left">
                                {selectedMarina?.name || "Select marina"}
                            </Text>
                            <Box>
                                <svg width="14" height="8" viewBox="0 0 14 8" fill="var(--chakra-colors-basic-grey900)" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13.0001 1.63461L7.49048 6.91346C7.3174 7.05769 7.14433 7.11538 7.00009 7.11538C6.82702 7.11538 6.65394 7.05769 6.50971 6.94231L0.971248 1.63461C0.682786 1.375 0.682786 0.913461 0.942402 0.653846C1.20202 0.365384 1.66356 0.365384 1.92317 0.624999L7.00009 5.47115L12.0482 0.624999C12.3078 0.365384 12.7693 0.365384 13.0289 0.653846C13.2886 0.913461 13.2886 1.375 13.0001 1.63461Z" fill="#262626" />
                                </svg>
                            </Box>
                        </Flex>
                    </Flex>
                </MenuButton>
                <MenuList minWidth="240px" rounded='xl' boxShadow="md" py={0} zIndex={1000}>
                    {currentUser?.marinas.map((marina) => (
                        <MenuItem
                            key={marina.marina_id}
                            rounded='xl'
                            onClick={() => handleMarinaSelect(marina)}
                            _hover={{ bg: 'var(--chakra-colors-calendar-todayBg)' }}
                            p='xs'
                        >
                            <HStack gap='sm'>
                                <Image
                                    src={marina.logo_url ? transformS3Url(marina.logo_url) : undefined}
                                    boxSize="35px"
                                    rounded="full"
                                    fallbackSrc={marina.logo_url ? transformS3Url(marina.logo_url) : undefined}
                                    alt={marina.name}
                                />
                                <Box>
                                    <Text color='basic.grey900' fontSize='14px' fontWeight="400" noOfLines={1}>
                                        {marina.name}
                                    </Text>
                                </Box>
                            </HStack>
                        </MenuItem>
                    ))}
                </MenuList>
            </Menu>
        </Box>
    );
};

export default MarinasMenu;
