import { Box, Container, Text } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

import useAuth from "../../hooks/useAuth"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function Dashboard() {
  const { user: currentUser } = useAuth()

  return (
    <>
      <Container maxW="full">
        <Box pt={16}>
          <Text fontSize="2xl">
            Hi, {currentUser?.full_name || currentUser?.email}
          </Text>
          <Text pb={3}>Welcome to BolaBuddy!</Text>
        </Box>
      </Container>
    </>
  )
}
