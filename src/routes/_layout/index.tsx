import { Box, Container, Text } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import Header from '../../components/Header/Header'
import Panel from "../../components/Panel/Panel"

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
          <Header />
          <Panel />
        </Box>
      </Container>
    </>
  )
}
