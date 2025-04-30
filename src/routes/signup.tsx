import {
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Image,
  Input,
  Link,
  Text,
  useColorModeValue,
} from "@chakra-ui/react"
import {
  Link as RouterLink,
  createFileRoute,
  redirect,
} from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"

import LogoPrimary from "/assets/images/logo-primary.svg"
import LogoSecondary from "/assets/images/logo-secondary.svg"
import type { EmployeeRegister } from "../client"
import useAuth, { isLoggedIn } from "../hooks/useAuth"
import { confirmPasswordRules, emailPattern, passwordRules } from "../utils"

export const Route = createFileRoute("/signup")({
  component: SignUp,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

interface EmployeeRegisterForm extends EmployeeRegister {
  confirm_password: string
}

function SignUp() {
  const { signUpMutation } = useAuth()
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeRegisterForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      password: "",
      confirm_password: "",
    },
  })

  const onSubmit: SubmitHandler<EmployeeRegisterForm> = (data) => {
    signUpMutation.mutate(data)
  }

  return (
    <>
      <Flex flexDir={{ base: "column", md: "row" }} justify="center" h="100vh">
        <Container
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          h="100vh"
          maxW="sm"
          alignItems="stretch"
          justifyContent="center"
          gap={4}
          centerContent
        >
          <Image
            src={useColorModeValue(LogoPrimary, LogoSecondary)}
            alt="logo"
            height="auto"
            maxW="2xs"
            alignSelf="center"
            mb={4}
          />
          <FormControl id="first_name" isInvalid={!!errors.first_name}>
            <FormLabel htmlFor="first_name" srOnly>
              First Name
            </FormLabel>
            <Input
              id="first_name"
              minLength={3}
              {...register("first_name", { required: "First Name is required" })}
              placeholder="First Name"
              type="text"
            />
            {errors.first_name && (
              <FormErrorMessage>{errors.first_name.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl id="last_name" isInvalid={!!errors.last_name}>
            <FormLabel htmlFor="last_name" srOnly>
              Last Name
            </FormLabel>
            <Input
              id="last_name"
              minLength={3}
              {...register("last_name", { required: "Last Name is required" })}
              placeholder="Last Name"
              type="text"
            />
            {errors.last_name && (
              <FormErrorMessage>{errors.last_name.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl id="email" isInvalid={!!errors.email}>
            <FormLabel htmlFor="username" srOnly>
              Email
            </FormLabel>
            <Input
              id="email"
              {...register("email", {
                required: "Email is required",
                pattern: emailPattern,
              })}
              placeholder="Email"
              type="email"
            />
            {errors.email && (
              <FormErrorMessage>{errors.email.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl id="password" isInvalid={!!errors.password}>
            <FormLabel htmlFor="password" srOnly>
              Password
            </FormLabel>
            <Input
              id="password"
              {...register("password", passwordRules())}
              placeholder="Password"
              type="password"
            />
            {errors.password && (
              <FormErrorMessage>{errors.password.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl
            id="confirm_password"
            isInvalid={!!errors.confirm_password}
          >
            <FormLabel htmlFor="confirm_password" srOnly>
              Confirm Password
            </FormLabel>

            <Input
              id="confirm_password"
              {...register("confirm_password", confirmPasswordRules(getValues))}
              placeholder="Repeat Password"
              type="password"
            />
            {errors.confirm_password && (
              <FormErrorMessage>
                {errors.confirm_password.message}
              </FormErrorMessage>
            )}
          </FormControl>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Sign Up
          </Button>
          <Text>
            Already have an account?{" "}
            <Link as={RouterLink} to="/login" color="blue.500">
              Log In
            </Link>
          </Text>
        </Container>
      </Flex>
    </>
  )
}

export default SignUp
