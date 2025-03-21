import { Flex, Icon, Text, useColorModeValue, IconButton, Image } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  FiCalendar,
  FiHome,
  FiUsers,
} from "react-icons/fi";
import UserMenu from "../Common/UserMenu";
import { GiHomeGarage, GiMooringBollard } from "react-icons/gi";
import type { EmployeePublic } from "../../client";
import PLACE from '../../../public/assets/images/place.png'

const items = [
  { icon: FiHome, title: "Dashboard", path: "/" },
  { icon: GiHomeGarage, title: "Marinas", path: "/marinas" },
  { icon: GiMooringBollard, title: "MooringBalls", path: "/mooringballs" },
  { icon: FiCalendar, title: "Reservations", path: "/reservations" },
];

interface SidebarItemsProps {
  onClose?: () => void;
}

const SidebarItems = ({ onClose }: SidebarItemsProps) => {
  const queryClient = useQueryClient();
  const textColor = useColorModeValue("ui.light", "ui.light");
  const bgActive = useColorModeValue("white", "#4A5568"); // todo fix this? highlighted item
  const currentUser = queryClient.getQueryData<EmployeePublic>(["currentUser"]);

  const finalItems = currentUser?.is_superuser
    ? [...items, { icon: FiUsers, title: "Admin", path: "/admin" }]
    : items;

  return (
    <Flex
      align="center"
      justify="space-between"
      w="full"
    >
      <Flex
        justify='space-between'
        gap='50px'
      >
        {finalItems.map(({ icon, title, path }) => (
          <Flex
            align="center"
            as={Link}
            to={path}
            key={title}
            p={2}
            borderRadius="md"
            activeProps={{
              style: {
                background: bgActive,
                color: "#DD6600",
              },
            }}
            _hover={{
              color: "#DD6600",
            }}
            transition="background 0.3s ease"
            onClick={onClose}
          >
            <Icon as={icon} mr={2} boxSize={4} />
            <Text
              fontSize='14px'
            >{title}</Text>
          </Flex>
        ))}
      </Flex>
      <Flex
        w='30%'
        p='4'
        align="center"
        justify='space-between'
      >
        <IconButton
          aria-label="Icon 1"
          bg="white"
          rounded="full"
          w="42px"
          h="42px"
          icon={
            <svg width="14" height="22" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M13.2227 0.75C14.207 0.75 14.9727 1.54297 14.9727 2.5V10.3477C14.9727 11.2773 14.1797 12.0703 13.2227 12.0703H9.28516L5.86719 14.6133C5.64844 14.7773 5.34766 14.6406 5.34766 14.3672V12.0703H2.72266C1.73828 12.0703 0.972656 11.3047 0.972656 10.3477V2.5C0.972656 1.54297 1.73828 0.75 2.72266 0.75H13.2227ZM13.6875 10.375V2.5C13.6875 2.28125 13.4688 2.0625 13.25 2.0625H2.75C2.50391 2.0625 2.3125 2.28125 2.3125 2.5V10.375C2.3125 10.6211 2.50391 10.8125 2.75 10.8125H6.6875V12.4531L8.875 10.8125H13.25C13.4688 10.8125 13.6875 10.6211 13.6875 10.375Z"
                fill="#777777"
              />
            </svg>
          }
        />

        <IconButton
          aria-label="Icon 2"
          bg="white"
          rounded="full"
          w="42px"
          h="42px"
          icon={
            <svg width="14" height="22" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M7.875 1.625V2.11719C9.84375 2.44531 11.375 4.16797 11.375 6.21875V7.14844C11.375 8.37891 11.7852 9.58203 12.5508 10.5664L12.9609 11.0586C13.125 11.2773 13.1523 11.5508 13.043 11.7695C12.9336 11.9883 12.7148 12.125 12.4688 12.125H1.53125C1.25781 12.125 1.03906 11.9883 0.929688 11.7695C0.820312 11.5508 0.847656 11.2773 1.01172 11.0586L1.42188 10.5664C2.1875 9.58203 2.625 8.37891 2.625 7.14844V6.21875C2.625 4.16797 4.12891 2.44531 6.125 2.11719V1.625C6.125 1.16016 6.50781 0.75 7 0.75C7.46484 0.75 7.875 1.16016 7.875 1.625ZM6.78125 3.375C5.19531 3.375 3.9375 4.66016 3.9375 6.21875V7.14844C3.9375 8.46094 3.55469 9.71875 2.84375 10.8125H11.1289C10.418 9.71875 10.0625 8.46094 10.0625 7.14844V6.21875C10.0625 4.66016 8.77734 3.375 7.21875 3.375H6.78125ZM8.75 13C8.75 13.4648 8.55859 13.9297 8.23047 14.2578C7.90234 14.5859 7.4375 14.75 7 14.75C6.53516 14.75 6.07031 14.5859 5.74219 14.2578C5.41406 13.9297 5.25 13.4648 5.25 13H8.75Z"
                fill="#777777"
              />
            </svg>
          }
        />

        <IconButton
          aria-label="Icon 3"
          bg="white"
          rounded="full"
          w="42px"
          h="42px"
          icon={
            <svg width="14" height="22" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4.375 7.75C4.375 6.30078 5.52344 5.125 7 5.125C8.44922 5.125 9.625 6.30078 9.625 7.75C9.625 9.19922 8.44922 10.375 7 10.375C5.52344 10.375 4.375 9.19922 4.375 7.75ZM7 6.4375C6.26172 6.4375 5.6875 7.03906 5.6875 7.75C5.6875 8.48828 6.26172 9.0625 7 9.0625C7.71094 9.0625 8.3125 8.48828 8.3125 7.75C8.3125 7.03906 7.71094 6.4375 7 6.4375ZM8.01172 0.75C8.61328 0.75 9.13281 1.1875 9.26953 1.76172L9.48828 2.66406C9.73438 2.77344 9.95312 2.91016 10.1445 3.04688L11.0469 2.77344C11.6211 2.60938 12.25 2.85547 12.5508 3.375L13.5625 5.15234C13.8633 5.67188 13.7539 6.32812 13.3164 6.73828L12.6602 7.36719C12.6602 7.50391 12.6875 7.64062 12.6875 7.75C12.6875 7.88672 12.6602 8.02344 12.6602 8.13281L13.3164 8.78906C13.7539 9.19922 13.8633 9.85547 13.5625 10.375L12.5508 12.1523C12.25 12.6719 11.6211 12.918 11.0469 12.7539L10.1445 12.4805C9.95312 12.6172 9.73438 12.7539 9.48828 12.8633L9.26953 13.7656C9.13281 14.3398 8.61328 14.75 8.01172 14.75H5.96094C5.35938 14.75 4.83984 14.3398 4.70312 13.7656L4.48438 12.8633C4.23828 12.7539 4.01953 12.6172 3.82812 12.4805L2.92578 12.7539C2.35156 12.918 1.72266 12.6719 1.42188 12.1523L0.410156 10.375C0.109375 9.85547 0.21875 9.19922 0.65625 8.78906L1.3125 8.13281C1.3125 8.02344 1.3125 7.88672 1.3125 7.75C1.3125 7.64062 1.3125 7.50391 1.3125 7.36719L0.65625 6.73828C0.21875 6.32812 0.109375 5.67188 0.410156 5.15234L1.42188 3.375C1.72266 2.85547 2.35156 2.60938 2.92578 2.77344L3.82812 3.04688C4.01953 2.91016 4.23828 2.77344 4.48438 2.66406L4.70312 1.76172C4.83984 1.1875 5.35938 0.75 5.96094 0.75H8.01172ZM5.60547 3.59375L5.30469 3.73047C4.94922 3.86719 4.62109 4.05859 4.34766 4.27734L4.07422 4.49609L2.57031 4.03125L1.55859 5.80859L2.67969 6.875L2.65234 7.20312C2.625 7.39453 2.625 7.58594 2.625 7.75C2.625 7.94141 2.625 8.13281 2.65234 8.32422L2.67969 8.65234L1.55859 9.71875L2.57031 11.4961L4.07422 11.0312L4.34766 11.25C4.62109 11.4688 4.94922 11.6602 5.30469 11.7969L5.60547 11.9336L5.96094 13.4375H8.01172L8.36719 11.9336L8.66797 11.7969C9.02344 11.6602 9.35156 11.4688 9.625 11.25L9.89844 11.0312L11.4023 11.4961L12.4141 9.71875L11.4023 8.03125L11.3203 8.32422C11.3477 8.13281 11.375 7.94141 11.375 7.75C11.375 7.58594 11.3477 7.39453 11.3203 7.20312L11.293 6.875L12.4141 5.80859L11.4023 4.03125L9.89844 4.49609L9.625 4.27734C9.35156 4.05859 9.02344 3.86719 8.66797 3.73047L8.36719 3.59375L8.01172 2.0625H5.96094L5.60547 3.59375Z"
                fill="#777777"
              />
            </svg>
          }
        />
        <Flex
          align='center'
          gap='3'
          w='236px'
          bg='white'
          p='1'
          rounded='full'
          border='1px solid #D2D2D2'
        >
          <Image rounded='full' src={PLACE} />
          <Text>Bitter End Yacht Club</Text>
        </Flex>
        <UserMenu />
      </Flex>
    </Flex>
  );
};

export default SidebarItems;