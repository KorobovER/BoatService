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

import { MooringBallsService } from "../../client"
import ActionsMenu from "../../components/Common/ActionsMenu"
import Navbar from "../../components/Common/Navbar"
import AddMooringBall from "../../components/MooringBalls/AddMooringBall"

const mooringballsSearchSchema = z.object({
  page: z.number().catch(1),
})

export const Route = createFileRoute("/_layout/mooringballs")({
  component: MooringBalls,
  validateSearch: (search) => mooringballsSearchSchema.parse(search),
})

const PER_PAGE = 5

function getMooringBallsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      MooringBallsService.readMooringBalls({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["mooringballs", { page }],
  }
}

function MooringBallsTable() {
  const queryClient = useQueryClient()
  const { page } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (page: number) =>
    navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, page }) })

  const {
    data: mooringballs,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getMooringBallsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const hasNextPage =
    !isPlaceholderData && mooringballs?.data.length === PER_PAGE
  const hasPreviousPage = page > 1

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getMooringBallsQueryOptions({ page: page + 1 }))
    }
  }, [page, queryClient, hasNextPage])

  return (
    <>
      <TableContainer>
        <Table size={{ base: "sm", md: "md" }}>
          <Thead>
            <Tr>
              <Th>Device ID</Th>
              <Th>Ball Number</Th>
              <Th>Version</Th>
              <Th>Latitude</Th>
              <Th>Longitude</Th>
              <Th>Marina Name</Th>
              <Th>Depth</Th>
              <Th>Active</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          {isPending ? (
            <Tbody>
              <Tr>
                {new Array(4).fill(null).map((_, index) => (
                  <Td key={index}>
                    <SkeletonText noOfLines={1} paddingBlock="16px" />
                  </Td>
                ))}
              </Tr>
            </Tbody>
          ) : (
            <Tbody>
              {mooringballs?.data.map((mooringball) => (
                <Tr
                  key={mooringball.mooring_ball_id}
                  opacity={isPlaceholderData ? 0.5 : 1}
                >
                  <Td>{mooringball.mooring_ball_id}</Td>
                  <Td isTruncated maxWidth="150px">
                    {mooringball.ball_number}
                  </Td>
                  <Td
                    color={!mooringball.version ? "ui.dim" : "inherit"}
                    isTruncated
                    maxWidth="150px"
                  >
                    {mooringball.version || "N/A"}
                  </Td>
                  <Td>{mooringball.latitude}</Td>
                  <Td>{mooringball.longitude}</Td>
                  <Td>{mooringball.marina.name}</Td>
                  <Td>{mooringball.depth}</Td>
                  <Td>
                    <Checkbox isChecked={mooringball.is_active} isDisabled></Checkbox>
                  </Td>
                  <Td>
                    <ActionsMenu type={"MooringBall"} value={mooringball} />
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

function MooringBalls() {
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        MooringBalls Management
      </Heading>

      <Navbar type={"MooringBall"} addModalAs={AddMooringBall} />
      <MooringBallsTable />
    </Container>
  )
}
