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

import { MarinasService } from "../../client"
import ActionsMenu from "../../components/Common/ActionsMenu"
import Navbar from "../../components/Common/Navbar"
import AddMarina from "../../components/Marinas/AddMarina"

const marinasSearchSchema = z.object({
  page: z.number().catch(1),
})

export const Route = createFileRoute("/_layout/marinas")({
  component: Marinas,
  validateSearch: (search) => marinasSearchSchema.parse(search),
})

const PER_PAGE = 5

function getMarinasQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      MarinasService.readMarinas({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["marinas", { page }],
  }
}

function MarinasTable() {
  const queryClient = useQueryClient()
  const { page } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (page: number) =>
    navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, page }) })

  const {
    data: marinas,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getMarinasQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const hasNextPage = !isPlaceholderData && marinas?.data.length === PER_PAGE
  const hasPreviousPage = page > 1

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getMarinasQueryOptions({ page: page + 1 }))
    }
  }, [page, queryClient, hasNextPage])

  return (
    <>
      <TableContainer>
        <Table size={{ base: "sm", md: "md" }}>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Description</Th>
              <Th>Address</Th>
              <Th>Latitude</Th>
              <Th>Longitude</Th>
              <Th>Website</Th>
              <Th>Phone Number</Th>
              <Th>Email</Th>
              <Th>Approach</Th>
              <Th>VHF Channel</Th>
              <Th>Image</Th>
              <Th>Logo</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          {isPending ? (
            <Tbody>
              <Tr>
                {new Array(13).fill(null).map((_, index) => (
                  <Td key={index}>
                    <SkeletonText noOfLines={1} paddingBlock="16px" />
                  </Td>
                ))}
              </Tr>
            </Tbody>
          ) : (
            <Tbody>
              {marinas?.data.map((marina) => (
                <Tr
                  key={marina.marina_id}
                  opacity={isPlaceholderData ? 0.5 : 1}
                >
                  <Td>{marina.marina_id}</Td>
                  <Td>{marina.name}</Td>
                  <Td
                    color={!marina.description ? "ui.dim" : "inherit"}
                    isTruncated
                    maxWidth="150px"
                  >
                    {marina.description}
                  </Td>
                  <Td
                    color={!marina.address ? 'ui.dim' : 'inherit'}
                    isTruncated
                    maxWidth="150px"
                  >
                    {marina.address}
                  </Td>
                  <Td>{marina.latitude}</Td>
                  <Td>{marina.longitude}</Td>
                  <Td>
                    <a
                      href={marina.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {marina.website}
                    </a>
                  </Td>
                  <Td>{marina.contact_email}</Td>
                  <Td>{marina.contact_phone}</Td>
                  <Td>{marina.approach}</Td>
                  <Td>{marina.vhf_channel}</Td>
                  <Td>
                    {marina.image_thumbnail_url ? (
                      <img src={marina.image_thumbnail_url} alt="Thumbnail" width="50px" />
                    ) : (
                      "No Image"
                    )}
                  </Td>
                  <Td>
                    {marina.logo_url ? (
                      <img src={marina.logo_url} alt="Thumbnail" width="50px" />
                    ) : (
                      "No Image"
                    )}
                  </Td>
                  <Td>
                    <ActionsMenu type={"Marina"} value={marina} />
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

function Marinas() {
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Marinas Management
      </Heading>

      <Navbar type={"Marina"} addModalAs={AddMarina} />
      <MarinasTable />
    </Container>
  )
}
