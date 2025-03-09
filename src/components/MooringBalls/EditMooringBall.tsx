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
  Select,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import {
  type ApiError,
  MooringBallsService,
  type MooringBallPublic,
  type MooringBallUpdate,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface EditMooringBallProps {
  item: MooringBallPublic
  isOpen: boolean
  onClose: () => void
}

const EditMooringBall = ({ item, isOpen, onClose }: EditMooringBallProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<MooringBallUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: item,
  })

  const mutation = useMutation({
    mutationFn: (data: MooringBallUpdate) =>
      MooringBallsService.updateMooringBall({
        id: item.mooring_ball_id,
        requestBody: data,
      }),
    onSuccess: () => {
      showToast("Success!", "MooringBall updated successfully.", "success")
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["mooringballs"] })
    },
  })

  const onSubmit: SubmitHandler<MooringBallUpdate> = async (data) => {
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
          <ModalHeader>Edit MooringBall</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={8}>
            <FormLabel htmlFor="ball_number">Ball Number</FormLabel>
            <FormControl isRequired isInvalid={!!errors.ball_number}>
              <Input
                id="ball_number"
                {...register("ball_number", {
                  required: "Ball Number is required.",
                })}
                placeholder="Ball Number"
                type="text"
              />
              {errors.ball_number && (
                <FormErrorMessage>
                  {errors.ball_number.message}
                </FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={1}>
              <FormLabel htmlFor="is_active">Is Active</FormLabel>
              <Select
                id="is_active"
                {...register("is_active")}
                placeholder="Is Active"
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </Select>
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

export default EditMooringBall
