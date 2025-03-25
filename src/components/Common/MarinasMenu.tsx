import {
    Flex,
    Image,
    Text,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Box,
    HStack
} from "@chakra-ui/react"
import PLACE from '../../../public/assets/images/place.png'
import { useState } from "react"

const UserMenu = () => {
    const marinas = [
        { id: 1, name: "Marina 1", icon: PLACE },
        { id: 2, name: "Marina 2", icon: PLACE },
        { id: 3, name: "Marina 3", icon: PLACE }
    ]

    const [selectedMarina, setSelectedMarina] = useState(marinas[0])

    const handleMarinaSelect = (marina: typeof marinas[0]) => {
        setSelectedMarina(marina)
        console.log(`Selected marina: ${marina.name}`)
        // Здесь можно добавить логику для изменения текущей бухты
    }

    return (
        <Box>
            <Menu>
                <MenuButton>
                    <Flex
                        align='center'
                        gap='3'
                        w='236px'
                        bg='white'
                        p='1'
                        rounded='full'
                        border='1px solid #D2D2D2'
                        _hover={{ bg: 'gray.50' }}
                        cursor="pointer"
                    >
                        <Image
                            rounded='full'
                            src={selectedMarina.icon || PLACE}
                            boxSize="40px"
                            fallbackSrc={PLACE}
                        />
                        <Text fontWeight="medium">{selectedMarina.name}</Text>
                    </Flex>
                </MenuButton>
                <MenuList minWidth="240px" boxShadow="md" py={0}>
                    {marinas.map((marina) => (
                        <MenuItem
                            key={marina.id}
                            onClick={() => handleMarinaSelect(marina)}
                            _hover={{ bg: 'gray.100' }}
                            px={3}
                            py={2}
                        >
                            <HStack spacing={3}>
                                <Image
                                    src={marina.icon}
                                    boxSize="6"
                                    rounded="full"
                                    fallbackSrc={PLACE}
                                />
                                <Text>{marina.name}</Text>
                            </HStack>
                        </MenuItem>
                    ))}
                </MenuList>
            </Menu>
        </Box>
    )
}

export default UserMenu