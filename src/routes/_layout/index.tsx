import { Box, Container, Text } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import Panel from "../../components/AdminPanel/Panel"

import useAuth from "../../hooks/useAuth"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function Dashboard() {
  const { user: currentUser } = useAuth()

  return (
    <>
      <Container maxW="full"
       
      >
        <Box>
          {/* <Text fontSize="2xl">
            Hi, {currentUser?.full_name || currentUser?.email}
          </Text> */}
          <Panel />
        </Box>
      </Container>
    </>
  )
}
