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

import { type ApiError, type MarinaCreate, MarinasService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface AddMarinaProps {
  isOpen: boolean
  onClose: () => void
}

const AddMarina = ({ isOpen, onClose }: AddMarinaProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MarinaCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      description: "",
      address: "",
      latitude: 0,
      longitude: 0,
      website: "",
      contact_phone: "",
      contact_email: "",
      approach: "",
      vhf_channel: 0,
      image_thumbnail_url: "",
      logo_url: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: MarinaCreate) =>
      MarinasService.createMarina({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Marina created successfully.", "success")
      reset()
      onClose()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["marinas"] })
    },
  })

  const onSubmit: SubmitHandler<MarinaCreate> = (data) => {
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
          <ModalHeader>Add Marina</ModalHeader>
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
              <FormLabel htmlFor="latitude">Latitude</FormLabel>
              <Input
                id="latitude"
                {...register("latitude")}
                placeholder="Latitude"
                type="text"
              />
            </FormControl>
            <FormControl isRequired mt={1}>
              <FormLabel htmlFor="longitude">Longitude</FormLabel>
              <Input
                id="longitude"
                {...register("longitude")}
                placeholder="Longitude"
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
            <FormControl mt={1}>
              <FormLabel htmlFor="image_thumbnail_url">Image URL</FormLabel>
              <Input
                id="image_thumbnail_url"
                {...register("image_thumbnail_url")}
                placeholder="Image URL"
                type="text"
              />
            </FormControl>
            <FormControl mt={1}>
              <FormLabel htmlFor="logo_url">Logo URL</FormLabel>
              <Input
                id="logo_url"
                {...register("logo_url")}
                placeholder="Logo URL"
                type="text"
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

export default AddMarina
