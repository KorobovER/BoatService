import { Flex, Spinner } from "@chakra-ui/react";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import Sidebar from "../components/Common/Sidebar";
import useAuth, { isLoggedIn } from "../hooks/useAuth";
import { MarinaProvider } from '../context/MarinaContext';

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
    <MarinaProvider>
      <Flex
        maxW="full"
        h="100vh"
        position="relative"
        flexDirection="column"
        gap="4"
      >
        <Sidebar />
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
          <Outlet />
        )}
      </Flex>
    </MarinaProvider>
  );
}