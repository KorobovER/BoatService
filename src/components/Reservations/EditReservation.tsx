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
  type ReservationPublic,
  type ReservationUpdate,
  ReservationsService,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface EditReservationProps {
  item: ReservationPublic
  isOpen: boolean
  onClose: () => void
}

const EditReservation = ({ item, isOpen, onClose }: EditReservationProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<ReservationUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: item,
  })

  const mutation = useMutation({
    mutationFn: (data: ReservationUpdate) =>
      ReservationsService.updateReservation({
        id: item.reservation_id,
        requestBody: data,
      }),
    onSuccess: () => {
      showToast("Success!", "Reservation updated successfully.", "success")
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] })
    },
  })

  const onSubmit: SubmitHandler<ReservationUpdate> = async (data) => {
    mutation.mutate(data)
  }

  const onCancel = () => {
    reset()
    onClose()
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
          <ModalHeader>Edit Reservation</ModalHeader>
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
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              isDisabled={!isDirty}
            >
              Save
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default EditReservation
