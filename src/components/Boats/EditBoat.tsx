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
  type BoatPublic,
  type BoatUpdate,
  BoatsService,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface EditBoatProps {
  item: BoatPublic
  isOpen: boolean
  onClose: () => void
}

const EditBoat = ({ item, isOpen, onClose }: EditBoatProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<BoatUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: item,
  })

  const mutation = useMutation({
    mutationFn: (data: BoatUpdate) =>
      BoatsService.updateBoat({ id: item.boat_id, requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Boat updated successfully.", "success")
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] })
    },
  })

  const onSubmit: SubmitHandler<BoatUpdate> = async (data) => {
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
          <ModalHeader>Edit Boat</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired isInvalid={!!errors.boatname}>
              <FormLabel htmlFor="boatname">Boat Name</FormLabel>
              <Input
                id="boatname"
                {...register("boatname", {
                  required: "Boat Name is required.",
                })}
                placeholder="Boat Name"
                type="text"
              />
              {errors.boatname && (
                <FormErrorMessage>{errors.boatname.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4} isRequired isInvalid={!!errors.model}>
              <FormLabel htmlFor="model">Model</FormLabel>
              <Input
                id="model"
                {...register("model", {
                  required: "Model is required.",
                })}
                placeholder="Model"
                type="text"
              />
              {errors.model && (
                <FormErrorMessage>{errors.model.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4} isRequired isInvalid={!!errors.make}>
              <FormLabel htmlFor="make">Make</FormLabel>
              <Input
                id="make"
                {...register("make", {
                  required: "Make is required.",
                })}
                placeholder="Make"
                type="text"
              />
              {errors.make && (
                <FormErrorMessage>{errors.make.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4} isRequired isInvalid={!!errors.loa}>
              <FormLabel htmlFor="loa">LOA</FormLabel>
              <Input
                id="loa"
                {...register("loa", {
                  required: "LOA is required.",
                  valueAsNumber: true,
                })}
                placeholder="LOA"
                type="number"
              />
              {errors.loa && (
                <FormErrorMessage>{errors.loa.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4} isRequired isInvalid={!!errors.beam}>
              <FormLabel htmlFor="beam">Beam</FormLabel>
              <Input
                id="beam"
                {...register("beam", {
                  required: "Beam is required.",
                  valueAsNumber: true,
                })}
                placeholder="Beam"
                type="number"
              />
              {errors.beam && (
                <FormErrorMessage>{errors.beam.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4} isRequired isInvalid={!!errors.freeboard}>
              <FormLabel htmlFor="freeboard">Freeboard</FormLabel>
              <Input
                id="freeboard"
                {...register("freeboard", {
                  required: "Freeboard is required.",
                  valueAsNumber: true,
                })}
                placeholder="Freeboard"
                type="number"
              />
              {errors.freeboard && (
                <FormErrorMessage>{errors.freeboard.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4} isRequired isInvalid={!!errors.draft}>
              <FormLabel htmlFor="draft">Draft</FormLabel>
              <Input
                id="draft"
                {...register("draft", {
                  required: "Draft is required.",
                  valueAsNumber: true,
                })}
                placeholder="Draft"
                type="number"
              />
              {errors.draft && (
                <FormErrorMessage>{errors.draft.message}</FormErrorMessage>
              )}
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

export default EditBoat
