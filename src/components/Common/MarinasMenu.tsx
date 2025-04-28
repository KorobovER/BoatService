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
import { useState, useEffect } from "react";
import { EmployeesService, MarinasService } from '../../client';
import { useMarina } from '../../context/MarinaContext';
import { useQuery } from '@tanstack/react-query';

// Определяем тип Marina
interface Marina {
    marina_id: string;
    name: string;
    logo_url: string | null;
    subregion: string;
}

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
    const { selectedMarina, setSelectedMarina, setFullMarinaData } = useMarina();
    const [marinas, setMarinas] = useState<Marina[]>([]);

    // Запрос данных сотрудника через readEmployeeMe
    const { data: employeeData, isLoading, isError } = useQuery({
        queryKey: ['employee'],
        queryFn: EmployeesService.readEmployeeMe
    });

    // Функция для получения полных данных марины при выборе
    const handleMarinaSelect = async (marina: Marina) => {
        try {
            console.log(`Fetching complete data for marina: ${marina.name} (${marina.marina_id})`);
            const fullMarinaData = await MarinasService.readMarina({ id: marina.marina_id });
            console.log('Full marina data:', fullMarinaData);

            // Сохраняем базовые и полные данные марины
            setSelectedMarina(marina);
            setFullMarinaData(fullMarinaData);
        } catch (error) {
            console.error('Error fetching marina data:', error);
            // Даже в случае ошибки устанавливаем выбранную марину
            setSelectedMarina(marina);
            setFullMarinaData(null);
        }
    };

    // Обработчик для опции "All marinas"
    /*
    const handleSelectAllMarinas = () => {
        setSelectedMarina(null);
        setFullMarinaData(null);
    };
    */

    useEffect(() => {
        console.log('Employee data:', employeeData);

        if (employeeData && employeeData.marinas && employeeData.marinas.length > 0) {
            // Преобразуем все марины сотрудника в массив для компонента
            const marinasArray = employeeData.marinas.map(marina => ({
                marina_id: marina.marina_id,
                name: marina.name,
                logo_url: marina.logo_url,
                subregion: marina.subregion
            }));

            setMarinas(marinasArray);
            console.log('Marinas array:', marinasArray);

            if (!selectedMarina && marinasArray.length > 0) {
                // При первой загрузке получаем полные данные выбранной марины
                handleMarinaSelect(marinasArray[0]);
            }
        }
    }, [employeeData, selectedMarina]);

    if (isLoading) {
        return (
            <Flex align="center" justify="center" w="300px">
                <Spinner size="sm" color="ui.main" />
            </Flex>
        );
    }

    if (isError) {
        return (
            <Flex align="center" justify="center" w="300px" color="bg.error">
                Failed to load marina information
            </Flex>
        );
    }

    if (marinas.length === 0) {
        return (
            <Flex align="center" justify="center" w="300px" color="basic.grey600">
                No marinas available
            </Flex>
        );
    }

    return (
        <Box>
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
                    {marinas.map((marina) => (
                        <MenuItem
                            key={marina.marina_id}
                            rounded='xl'
                            onClick={() => handleMarinaSelect(marina)}
                            _hover={{ bg: '#FAE8D9' }}
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