import { Flex, Spinner } from "@chakra-ui/react";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import Sidebar from "../components/Common/Sidebar";
import UserMenu from "../components/Common/UserMenu";
import useAuth, { isLoggedIn } from "../hooks/useAuth";

export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

function Layout() {
  const { isLoading } = useAuth();

  return (
    <Flex
      maxW="full" // Изменил на "full", чтобы занимал всю доступную ширину
      h="100vh" // Установил высоту во весь экран
      position="relative"
      flexDirection="column" // Горизонтальное расположение
      gap="4" // Добавил отступ между элементами
    >
      {/* Боковая панель */}
      <Sidebar/>

      {/* Главное содержимое */}
      {isLoading ? (
        <Flex
          flex="3" // Занимает большую часть пространства
          justify="center"
          align="center"
          height="100%"
          width="100%"
        >
          <Spinner size="xl" color="ui.main" />
        </Flex>
      ) : (
        <Outlet /> // Основной контент
      )}

      {/* Пользовательское меню */}
      <UserMenu />
    </Flex>
  );
}