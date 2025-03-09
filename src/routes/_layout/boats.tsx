import {
  Button,
  Container,
  Flex,
  Heading,
  SkeletonText,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Checkbox,
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { z } from "zod"

import { BoatsService } from "../../client"
import AddBoat from "../../components/Boats/AddBoat"
import ActionsMenu from "../../components/Common/ActionsMenu"
import Navbar from "../../components/Common/Navbar"

const boatsSearchSchema = z.object({
  page: z.number().catch(1),
})

export const Route = createFileRoute("/_layout/boats")({
  component: Boats,
  validateSearch: (search) => boatsSearchSchema.parse(search),
})

const PER_PAGE = 5

function getBoatsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      BoatsService.readBoats({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["boats", { page }],
  }
}

function BoatsTable() {
  const queryClient = useQueryClient()
  const { page } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (page: number) =>
    navigate({ search: (prev: { page?: number }) => ({ ...prev, page }) })

  const {
    data: boats,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getBoatsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const hasNextPage = !isPlaceholderData && boats?.data.length === PER_PAGE
  const hasPreviousPage = page > 1

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getBoatsQueryOptions({ page: page + 1 }))
    }
  }, [page, queryClient, hasNextPage])

  return (
    <>
      <TableContainer>
        <Table size={{ base: "sm", md: "md" }}>
          <Thead>
            <Tr>
              <Th>Owner ID</Th>
              <Th>Boat Name</Th>
              <Th>Default</Th>
              <Th>Make</Th>
              <Th>Model</Th>
              <Th>LOA</Th>
              <Th>Beam</Th>
              <Th>Freeboard</Th>
              <Th>Draft</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          {isPending ? (
            <Tbody>
              <Tr>
                {new Array(9).fill(null).map((_, index) => (
                  <Td key={index}>
                    <SkeletonText noOfLines={1} paddingBlock="10px" />
                  </Td>
                ))}
              </Tr>
            </Tbody>
          ) : (
            <Tbody>
              {boats?.data.map((boat) => (
                <Tr key={boat.boatname} opacity={isPlaceholderData ? 0.5 : 1}>
                  <Td>{boat.owner_id}</Td>
                  <Td>{boat.boatname}</Td>
                  <Td>
                    {boat.is_default}
                    <Checkbox isChecked={boat.is_default} isDisabled></Checkbox>
                  </Td>
                  <Td>{boat.make}</Td>
                  <Td>{boat.model}</Td>
                  <Td>{boat.loa}</Td>
                  <Td>{boat.beam}</Td>
                  <Td>{boat.freeboard}</Td>
                  <Td>{boat.draft}</Td>
                  <Td>
                    <ActionsMenu type={"Boat"} value={boat} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          )}
        </Table>
      </TableContainer>
      <Flex
        gap={4}
        alignItems="center"
        mt={4}
        direction="row"
        justifyContent="flex-end"
      >
        <Button onClick={() => setPage(page - 1)} isDisabled={!hasPreviousPage}>
          Previous
        </Button>
        <span>Page {page}</span>
        <Button isDisabled={!hasNextPage} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </Flex>
    </>
  )
}

function Boats() {
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Boats Management
      </Heading>

      <Navbar type={"Boat"} addModalAs={AddBoat} />
      <BoatsTable />
    </Container>
  )
}
