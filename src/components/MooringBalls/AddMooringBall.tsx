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
  type MooringBallCreate,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface AddMooringBallProps {
  isOpen: boolean
  onClose: () => void
}

const AddMooringBall = ({ isOpen, onClose }: AddMooringBallProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MooringBallCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      mooring_ball_id: "",
      ball_number: 0,
      version: "",
      latitude: 0,
      longitude: 0,
      depth: 0,
      is_active: false,
      marina_id: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: MooringBallCreate) =>
      MooringBallsService.createMooringBall({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "MooringBall created successfully.", "success")
      reset()
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["mooringballs"] })
    },
  })

  const onSubmit: SubmitHandler<MooringBallCreate> = (data) => {
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
          <ModalHeader>Add MooringBall</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={8}>
            <FormControl isRequired isInvalid={!!errors.ball_number}>
              <FormLabel htmlFor="ball_number">Ball Number</FormLabel>
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
            <FormControl isRequired isInvalid={!!errors.mooring_ball_id}>
              <FormLabel htmlFor="mooring_ball_id">Device ID</FormLabel>
              <Input
                id="mooring_ball_id"
                {...register("mooring_ball_id", {
                  required: "Mooring Ball ID is required.",
                })}
                placeholder="Device ID"
                type="text"
              />
              {errors.mooring_ball_id && (
                <FormErrorMessage>
                  {errors.mooring_ball_id.message}
                </FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={1}>
              <FormLabel htmlFor="version">Version</FormLabel>
              <Input
                id="version"
                {...register("version")}
                placeholder="Version"
                type="text"
              />
            </FormControl>
            <FormControl mt={1}>
              <FormLabel htmlFor="latitude">Latitude</FormLabel>
              <Input
                id="latitude"
                {...register("latitude")}
                placeholder="Latitude"
                type="text"
              />
            </FormControl>
            <FormControl mt={1}>
              <FormLabel htmlFor="longitude">Longitude</FormLabel>
              <Input
                id="longitude"
                {...register("longitude")}
                placeholder="Longitude"
                type="text"
              />
            </FormControl>
            <FormControl mt={1}>
              <FormLabel htmlFor="depth">Depth</FormLabel>
              <Input
                id="depth"
                {...register("depth")}
                placeholder="Depth"
                type="text"
              />
            </FormControl>
            <FormControl mt={1}>
              <FormLabel htmlFor="marina_id">Marina ID</FormLabel>
              <Input
                id="marina_id"
                {...register("marina_id")}
                placeholder="Marina ID"
                type="text"
              />
            </FormControl>
            <FormControl mt={1}>
              <FormLabel htmlFor="is_active">Is Active</FormLabel>
              <Select
                id="is_active"
                {...register("is_active")}
                placeholder="Select Active"
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </Select>
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

export default AddMooringBall
