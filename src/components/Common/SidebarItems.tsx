import { Box, Flex, Icon, Text, useColorModeValue } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import {
  FiCalendar,
  FiHome,
  FiUsers,
} from "react-icons/fi"
import { GiHomeGarage, GiMooringBollard } from "react-icons/gi"
import type { EmployeePublic } from "../../client"

const items = [
  { icon: FiHome, title: "Dashboard", path: "/" },
  { icon: GiHomeGarage, title: "Marinas", path: "/marinas" },
  { icon: GiMooringBollard, title: "MooringBalls", path: "/mooringballs" },
  { icon: FiCalendar, title: "Reservations", path: "/reservations" },
]

interface SidebarItemsProps {
  onClose?: () => void
}

const SidebarItems = ({ onClose }: SidebarItemsProps) => {
  const queryClient = useQueryClient()
  const textColor = useColorModeValue("ui.light", "ui.light")
  const bgActive = useColorModeValue("#0099DB", "#4A5568") // todo fix this? highlighted item
  const currentUser = queryClient.getQueryData<EmployeePublic>(["currentUser"])

  const finalItems = currentUser?.is_superuser
    ? [...items, { icon: FiUsers, title: "Admin", path: "/admin" }]
    : items

  const listItems = finalItems.map(({ icon, title, path }) => (
    <Flex
      as={Link}
      to={path}
      w="100%"
      p={2}
      key={title}
      activeProps={{
        style: {
          background: bgActive,
          borderRadius: "12px",
        },
      }}
      color={textColor}
      onClick={onClose}
    >
      <Icon as={icon} alignSelf="center" />
      <Text ml={2}>{title}</Text>
    </Flex>
  ))

  return (
    <>
      <Box>{listItems}</Box>
    </>
  )
}

export default SidebarItems
