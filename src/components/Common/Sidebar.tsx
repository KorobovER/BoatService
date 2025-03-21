import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  IconButton,
  Image,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { FiLogOut, FiMenu } from "react-icons/fi";

import LogoPrimary from "/assets/images/logo-primary.png";
import LogoSecondary from "/assets/images/logo-secondary.svg";
import type { EmployeePublic } from "../../client";
import useAuth from "../../hooks/useAuth";
import SidebarItems from "./SidebarItems";

const Sidebar = () => {
  const queryClient = useQueryClient();
  const bgColor = useColorModeValue("ui.light", "ui.dark");
  const textColor = useColorModeValue("ui.light", "ui.light");
  const currentUser = queryClient.getQueryData<EmployeePublic>(["currentUser"]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { logout } = useAuth();

  const handleLogout = async () => {
    logout();
  };

  return (
    <>
      {/* Mobile */}
      <IconButton
        onClick={onOpen}
        display={{ base: "flex", md: "none" }}
        aria-label="Open Menu"
        position="absolute"
        fontSize="20px"
        m={4}
        icon={<FiMenu />}
      />
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent maxW="250px">
          <DrawerCloseButton />
          <DrawerBody py={8}>
            <Flex justify="space-between">
              <Box>
                <Image src={useColorModeValue(LogoPrimary, LogoSecondary)} alt="logo" p={1} />
                <SidebarItems onClose={onClose} />
                <Flex
                  as="button"
                  onClick={handleLogout}
                  p={2}
                  color="ui.danger"
                  fontWeight="bold"
                  alignItems="center"
                >
                  <FiLogOut />
                  <Text ml={2}>Log out</Text>
                </Flex>
              </Box>
              {currentUser?.email && (
                <Text color={textColor} noOfLines={2} fontSize="sm" p={2}>
                  Logged in as: {currentUser.email}
                </Text>
              )}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Desktop */}
      <Box
        bg={bgColor}
        w="full"
        position="relative"
        display={{ base: "none", md: "flex" }}
      >
        <Flex
          flexDir="column"
          justify="space-between"
          bg={bgColor}
          borderRadius={12}
          p={4}
          w="full"
        >
          {/* Верхняя часть: Логотип и элементы в строку */}
          <Flex align="center" justify="space-between" w="full">
            {/* Логотип */}
            <Image
              src={useColorModeValue(LogoPrimary, LogoSecondary)}
              alt="Logo"
              w="100px"
              maxW="full"
              p={6}
            />

            {/* Элементы в строку */}
            <Flex flexDir="row" gap={4} flexGrow={1} justify="flex-end">
              <SidebarItems />
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </>
  );
};

export default Sidebar;