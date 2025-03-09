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
  type MarinaPublic,
  type MarinaUpdate,
  MarinasService,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface EditMarinaProps {
  item: MarinaPublic
  isOpen: boolean
  onClose: () => void
}

const EditMarina = ({ item, isOpen, onClose }: EditMarinaProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<MarinaUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: item,
  })

  const mutation = useMutation({
    mutationFn: (data: MarinaUpdate) =>
      MarinasService.updateMarina({ id: item.marina_id, requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Marina updated successfully.", "success")
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["marinas"] })
    },
  })

  const onSubmit: SubmitHandler<MarinaUpdate> = async (data) => {
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
          <ModalHeader>Edit Marina</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={8}>
            <FormControl isRequired isInvalid={!!errors.name}>
              <FormLabel htmlFor="name">Name</FormLabel>
              <Input
                id="name"
                {...register("name", {
                  required: "Name is required.",
                })}
                placeholder="Name"
                type="text"
              />
              {errors.name && (
                <FormErrorMessage>{errors.name.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={3}>
              <FormLabel htmlFor="description">Description</FormLabel>
              <Input
                id="description"
                {...register("description")}
                placeholder="Description"
                type="text"
              />
            </FormControl>
            <FormControl isRequired mt={3}>
              <FormLabel htmlFor="address">Address</FormLabel>
              <Input
                id="address"
                {...register("address")}
                placeholder="Address"
                type="text"
              />
            </FormControl>
            <FormControl isRequired mt={1}>
              <FormLabel htmlFor="website">Website</FormLabel>
              <Input
                id="website"
                {...register("website")}
                placeholder="Website"
                type="text"
              />
            </FormControl>
            <FormControl isRequired mt={1}>
              <FormLabel htmlFor="contact_email">Email</FormLabel>
              <Input
                id="contact_email"
                {...register("contact_email")}
                placeholder="Email"
                type="text"
              />
            </FormControl>
            <FormControl isRequired mt={1}>
              <FormLabel htmlFor="contact_phone">Phone Number</FormLabel>
              <Input
                id="contact_phone"
                {...register("contact_phone")}
                placeholder="Phone Number"
                type="text"
              />
            </FormControl>
            <FormControl mt={1}>
              <FormLabel htmlFor="approach">Approach</FormLabel>
              <Input
                id="approach"
                {...register("approach")}
                placeholder="Approach"
                type="text"
              />
            </FormControl>
            <FormControl mt={1}>
              <FormLabel htmlFor="vhf_channel">VHF Channel</FormLabel>
              <Input
                id="vhf_channel"
                {...register("vhf_channel")}
                placeholder="VHF Channel"
                type="text"
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

export default EditMarina
