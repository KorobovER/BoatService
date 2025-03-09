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
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { z } from "zod"

import { ReservationsService } from "../../client"
import ActionsMenu from "../../components/Common/ActionsMenu"
import Navbar from "../../components/Common/Navbar"
import AddReservation from "../../components/Reservations/AddReservation"
import { ReservationPublic } from "../../client"

const reservationsSearchSchema = z.object({
  page: z.number().catch(1),
})

export const Route = createFileRoute("/_layout/reservations")({
  component: Reservations,
  validateSearch: (search) => reservationsSearchSchema.parse(search),
})

const PER_PAGE = 5

function getReservationsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      ReservationsService.readReservations({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["reservations", { page }],
  }
}

function ReservationsTable() {
  const queryClient = useQueryClient()
  const { page } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (page: number) =>
    navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, page }) })

  const {
    data: reservations,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getReservationsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const hasNextPage =
    !isPlaceholderData && reservations?.data.length === PER_PAGE
  const hasPreviousPage = page > 1

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getReservationsQueryOptions({ page: page + 1 }))
    }
  }, [page, queryClient, hasNextPage])

  async function handleCommand({
    reservation,
    command,
  }: {
    reservation: ReservationPublic
    command: string
  }) {
    if (command === "complete") {
      await ReservationsService.completeReservation({
        id: reservation.reservation_id,
      })
    } else {
      await ReservationsService.activateReservation({
        id: reservation.reservation_id,
      })
    }
  }

  return (
    <>
      <TableContainer>
        <Table size={{ base: "sm", md: "md" }}>
          <Thead>
            <Tr>
              <Th>Mooring Ball ID</Th>
              <Th>Status</Th>
              <Th>Start Date</Th>
              <Th>End Date</Th>
              <Th>Boater</Th>
              <Th>Boat Make</Th>
              <Th>Boat Model</Th>
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
              {reservations?.data.map((reservation) => (
                <Tr
                  key={reservation.mooring_ball_id}
                  opacity={isPlaceholderData ? 0.5 : 1}
                >
                  <Td>{reservation.mooring_ball_id}</Td>
                  <Td>
                    {reservation.status}
                  </Td>
                  <Td isTruncated maxWidth="150px">
                    {new Date(reservation.start_date).toLocaleDateString()}
                  </Td>
                  <Td isTruncated maxWidth="150px">
                    {new Date(reservation.end_date).toLocaleDateString()}
                  </Td>
                  <Td>
                    {`${reservation.user.first_name} ${reservation.user.last_name}`}
                  </Td>
                  <Td>
                    {reservation.boat.make}
                  </Td>
                  <Td>
                    {reservation.boat.model}
                  </Td>
                  <Td>
                    <ActionsMenu type={"Reservation"} value={reservation} />
                    <button
                      onClick={() => {
                        handleCommand({ reservation, command: "activate" })
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    ></button>
                    <button
                      onClick={() => {
                        handleCommand({ reservation, command: "complete" })
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    ></button>
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

function Reservations() {
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Reservations Management
      </Heading>

      <Navbar type={"Reservation"} addModalAs={AddReservation} />
      <ReservationsTable />
    </Container>
  )
}
