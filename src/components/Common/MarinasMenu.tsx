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
import { ReservationsService } from '../../client';

interface Marina {
    name: string;
    logo_url: string | null;
    marina_id: string;
    subregion: string;
}

const MarinasMenu = () => {
    const [marinas, setMarinas] = useState<Marina[]>([]);
    const [selectedMarina, setSelectedMarina] = useState<Marina | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleMarinaSelect = (marina: Marina) => {
        setSelectedMarina(marina);
        console.log("Selected marina:", marina);
        // Здесь можно добавить логику фильтрации
    };

    useEffect(() => {
        const fetchMarinas = async () => {
            try {
                setLoading(true);

                // Формируем даты в правильном формате
                const now = new Date();
                const startDate = now.toISOString();
                const endDate = new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();

                // Делаем запрос с обязательными параметрами
                const response = await ReservationsService.readReservations({
                    limit: 100,
                    skip: 0,
                    startDate: startDate, // Обратите внимание на нижнее подчеркивание
                    endDate: endDate    // Как указано в сигнатуре метода
                });

                console.log("API Response:", response);

                if (!response.data || !Array.isArray(response.data)) {
                    throw new Error("Invalid data format from API");
                }

                // Собираем уникальные марины
                const marinaMap = new Map<string, Marina>();

                response.data.forEach((reservation) => {
                    if (reservation?.marina) {
                        const marina = reservation.marina;
                        marinaMap.set(marina.marina_id, {
                            name: marina.name,
                            logo_url: marina.logo_url,
                            marina_id: marina.marina_id,
                            subregion: marina.subregion
                        });
                    }
                });

                const uniqueMarinas = Array.from(marinaMap.values());
                setMarinas(uniqueMarinas);
                setSelectedMarina(uniqueMarinas[0] || null);

            } catch (err) {
                console.error("Error fetching marinas:", err);
                setError("Failed to load marinas. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchMarinas();
    }, []);

    if (loading) {
        return (
            <Flex align="center" justify="center" w="300px">
                <Spinner size="sm" />
            </Flex>
        );
    }

    if (error) {
        return (
            <Flex align="center" justify="center" w="300px" color="red.500">
                {error}
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