import { Flex, Spinner } from "@chakra-ui/react";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import Sidebar from "../components/Common/Sidebar";
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
      maxW="full"
      h="100vh"
      position="relative"
      flexDirection="column" 
      gap="4" 
    >
      {/* Боковая панель */}
      <Sidebar/>

      {/* Главное содержимое */}
      {isLoading ? (
        <Flex
          flex="3"
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
    </Flex>
  );
}