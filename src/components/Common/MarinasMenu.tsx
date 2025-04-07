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
    Spinner
} from "@chakra-ui/react";
import PLACE from '../../../public/assets/images/place.png';
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
    const handleSelectAllMarinas = () => {
        setSelectedMarina(null);
        setFullMarinaData(null);
    };

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
            <Flex align="center" justify="center" w="300px" color="red.500">
                Failed to load marina information
            </Flex>
        );
    }

    if (marinas.length === 0) {
        return (
            <Flex align="center" justify="center" w="300px" color="gray.500">
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
                        gap='3'
                        w='300px'
                        bg='white'
                        p='1'
                        rounded='full'
                        border='1px solid #D2D2D2'
                        _hover={{ bg: 'gray.50' }}
                        cursor="pointer"
                    >
                        <Image
                            rounded='full'
                            src={selectedMarina?.logo_url || PLACE}
                            boxSize="40px"
                            fallbackSrc={PLACE}
                            alt={selectedMarina?.name || "Marina"}
                        />
                        <Text fontWeight="medium" noOfLines={1} textAlign="left">
                            {selectedMarina?.name || "Select marina"}
                        </Text>
                    </Flex>
                </MenuButton>
                <MenuList minWidth="240px" boxShadow="md" py={0}>
                    {marinas.map((marina) => (
                        <MenuItem
                            key={marina.marina_id}
                            onClick={() => handleMarinaSelect(marina)}
                            _hover={{ bg: 'gray.100' }}
                            px={3}
                            py={2}
                        >
                            <HStack spacing={3}>
                                <Image
                                    src={marina.logo_url || PLACE}
                                    boxSize="6"
                                    rounded="full"
                                    fallbackSrc={PLACE}
                                    alt={marina.name}
                                />
                                <Box>
                                    <Text fontWeight="medium" noOfLines={1}>
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