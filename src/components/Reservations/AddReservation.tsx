import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import {
  type ApiError,
  type ReservationCreate,
  ReservationsService,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface AddReservationProps {
  isOpen: boolean
  onClose: () => void
}

const AddReservation = ({ isOpen, onClose }: AddReservationProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReservationCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      start_date: "",
      end_date: "",
      mooring_ball_id: "",
      user_id: "",
      boat_id: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: ReservationCreate) =>
      ReservationsService.createReservation({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Reservation created successfully.", "success")
      reset()
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] })
    },
  })

  const onSubmit: SubmitHandler<ReservationCreate> = (data) => {
    mutation.mutate(data)
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Add Reservation</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired isInvalid={!!errors.mooring_ball_id}>
              <FormLabel htmlFor="mooring_ball_id">Mooring Ball ID</FormLabel>
              <Input
                id="mooring_ball_id"
                {...register("mooring_ball_id", {
                  required: "Mooring Ball ID is required.",
                })}
                placeholder="Mooring Ball ID"
                type="text"
              />
              {errors.mooring_ball_id && (
                <FormErrorMessage>
                  {errors.mooring_ball_id.message}
                </FormErrorMessage>
              )}
            </FormControl>
            <FormControl isRequired mt={4}>
              <FormLabel htmlFor="start_date">Start Date</FormLabel>
              <Input
                id="start_date"
                {...register("start_date", {
                  required: "Start date is required.",
                })}
                placeholder="Select start date"
                type="date"
              />
            </FormControl>
            <FormControl isRequired mt={4}>
              <FormLabel htmlFor="end_date">End Date</FormLabel>
              <Input
                id="end_date"
                {...register("end_date", {
                  required: "End date is required.",
                })}
                placeholder="Select end date"
                type="date"
              />
            </FormControl>
            <FormControl isRequired mt={1}>
              <FormLabel htmlFor="user_id">User ID</FormLabel>
              <Input
                id="user_id"
                {...register("user_id")}
                placeholder="User ID"
                type="text"
              />
            </FormControl>
            <FormControl isRequired mt={1}>
              <FormLabel htmlFor="boat_id">Boat ID</FormLabel>
              <Input
                id="boat_id"
                {...register("boat_id")}
                placeholder="Boat ID"
                type="Boat"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default AddReservation
