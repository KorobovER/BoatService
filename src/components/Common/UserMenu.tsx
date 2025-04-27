import {
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Avatar,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"
import { FaUserAlt } from "react-icons/fa"
import { FiLogOut, FiUser } from "react-icons/fi"
import { useQuery } from '@tanstack/react-query'
import { EmployeesService } from '../../client'
import { useState } from 'react'

import useAuth from "../../hooks/useAuth"


const UserMenu = () => {
  const { logout } = useAuth()
  const [isHovered, setIsHovered] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  // Стили должны применяться при наведении или когда меню открыто
  const isActive = isHovered || isOpen
  
  // Запрос данных пользователя с типом any для обхода ограничений типизации
  const { data, isLoading } = useQuery({
    queryKey: ['employee'],
    queryFn: async () => {
      const result = await EmployeesService.readEmployeeMe();
      return result;
    }
  });

  const handleLogout = async () => {
    logout()
  }

  // Получаем инициалы пользователя из display_name
  const userInitials = data?.display_initials;

  return (
    <>
      {/* Desktop */}
      <Box>
        <Menu isOpen={isOpen} onClose={onClose} onOpen={onOpen}>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={
              isLoading ? (
                <Spinner size="sm" color="white" />
              ) : userInitials ? (
                <Avatar 
                  name={userInitials} 
                  size="sm" 
                  bg={isActive ? "basic.grey200" : "none"}
                  bgGradient={isActive ? "none" : "var(--chakra-colors-gradient-orange)"}
                  color={isActive ? "orange.500" : "white"}
                  fontWeight="500"
                  fontSize="14px"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  transition="all 0.2s ease-in-out"
                  getInitials={(name) => name}
                />
              ) : (
                <FaUserAlt color="white" fontSize="18px" />
              )
            }
            bg={isActive ? "basic.grey200" : "none"}
            bgGradient={isActive ? "none" : "var(--chakra-colors-gradient-orange)"}
            isRound
            data-testid="user-menu"
            _hover={{ 
              bg: isActive ? "basic.grey200" : "none",
              bgGradient: isActive ? "none" : "var(--chakra-colors-gradient-orange)"
            }}
            _active={{ 
              bg: "basic.grey200",
              bgGradient: "none"
            }}
            sx={{
              "&:hover, &:focus, &:active": {
                boxShadow: "none",
                outline: "none",
                border: "none"
              }
            }}
          />
          <MenuList>
            <MenuItem icon={<FiUser fontSize="18px" />} as={Link} to="settings">
              My profile
            </MenuItem>
            <MenuItem
              icon={<FiLogOut fontSize="18px" />}
              onClick={handleLogout}
              color="system.errorRed"
              fontWeight="bold"
            >
              Log out
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </>
  )
}

export default UserMenu
