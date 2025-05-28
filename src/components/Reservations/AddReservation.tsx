import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Flex,
  Text,
  Box,
  ModalOverlay,
  Textarea
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import { FiCalendar } from "react-icons/fi"
import CustomIcon from "../../components/Icon"

import {
  type ApiError,
  type ReservationCreate,
  type Reservation,
  ReservationsService,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface AddReservationProps {
  isOpen: boolean
  onClose: () => void
  selectedCell?: {
    rowId: string;
    day?: string;
    endDay?: string;
    reservation?: Reservation;
  };
}


const AddReservation = ({ isOpen, onClose, selectedCell }: AddReservationProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const [bookingType, setBookingType] = useState<'daily' | 'hourly'>('daily')
  const [displayStartDate, setDisplayStartDate] = useState<string>('')
  const [displayEndDate, setDisplayEndDate] = useState<string>('')
  const [startTime, setStartTime] = useState<string>('15:00')
  const [endTime, setEndTime] = useState<string>('16:00')
  const [showStartTimeDropdown, setShowStartTimeDropdown] = useState<boolean>(false)
  const [showEndTimeDropdown, setShowEndTimeDropdown] = useState<boolean>(false)

  // Helper function to format time in AM/PM format
  const formatTimeAmPm = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  // Reusable TimeDropdown component
  const TimeDropdown = ({
    value,
    onChange,
    placeholder,
    isOpen,
    onToggle
  }: {
    value: string,
    onChange: (value: string) => void,
    placeholder: string,
    isOpen: boolean,
    onToggle: () => void
  }) => {
    return (
      <FormControl>
        <Flex
          height="50px"
          borderRadius="full"
          borderColor="gray.200"
          borderWidth="1px"
          fontSize="18px"
          p="4px 10px 4px 24px"
          position="relative"
          cursor="pointer"
          alignItems="center"
          onClick={onToggle}
        >
          <Box flex="1">
            <Text fontSize="16px" fontWeight="300">
              {value ? formatTimeAmPm(value) : placeholder}
            </Text>
          </Box>
          <Box position="absolute" right="10px" top="50%" p="10px" transform="translateY(-50%)" cursor="pointer">
            <Box transform={isOpen ? "rotate(0deg)" : "rotate(180deg)"} transition="transform 0.2s">
              <CustomIcon name="dropdown" category="ui" color="#B7B7B7" size={10} />
            </Box>
          </Box>
          {isOpen && (
            <Box
              position="absolute"
              top="55px"
              left="-100px"
              width="234px"
              h='166px'
              zIndex="1000"
              maxHeight="200px"
              overflowY="auto"
              borderRadius="4px"
              boxShadow="md"
              bg='#F6F6F6'
              css={{
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '24px',
                },
              }}
            >
              {Array.from({ length: 24 }).map((_, hour) => {
                const formattedHour = `${hour.toString().padStart(2, '0')}:00`;
                const isSelected = value === formattedHour;
                const today = new Date();
                const dateStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

                return (
                  <Flex
                    key={hour}
                    p='10px'
                    _hover={{ bg: "gray.100" }}
                    cursor="pointer"
                    alignItems="center"
                    gap="10px"
                    bg={isSelected ? "gray.100" : "transparent"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(formattedHour);
                    }}
                  >
                    <Text fontSize="16px" color='basic.grey700' fontWeight="400">{formatTimeAmPm(formattedHour)}</Text>
                    <Flex flex="1" gap="10px" alignItems="center" justifyContent="flex-end">
                      <Text fontSize="10px" color="basic.grey600">{dateStr}</Text>
                      {isSelected && (
                        <CustomIcon color='#DD6600' name="check-orange" category="ui" size={16} />
                      )}
                    </Flex>
                  </Flex>
                );
              })}
            </Box>
          )}
        </Flex>
      </FormControl>
    );
  }
  const [bookingTitle, setBookingTitle] = useState<string>('')
  const [bookingDescription, setBookingDescription] = useState<string>('')
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReservationCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      start_date: "",
      end_date: "",
      mooring_ball_id: selectedCell?.rowId || "",
      user_id: "",
      boat_id: "",
    },
  })

  // Update form values when selectedCell changes
  useEffect(() => {
    if (selectedCell) {
      // Set mooring_ball_id from rowId
      if (selectedCell.rowId) {
        setValue('mooring_ball_id', selectedCell.rowId);
      }

      // Set start_date from the day property if available
      if (selectedCell.day) {
        try {
          // Parse the date string and format it correctly for the input
          const startDate = new Date(selectedCell.day);
          if (!isNaN(startDate.getTime())) {
            // Format for form submission (YYYY-MM-DD)
            const formattedStartDate = startDate.toISOString().split('T')[0];
            setValue('start_date', formattedStartDate);

            // Format for display (MM/DD/YYYY) with leading zeros
            const month = String(startDate.getMonth() + 1).padStart(2, '0');
            const day = String(startDate.getDate()).padStart(2, '0');
            const formattedDisplayDate = `${month}/${day}/${startDate.getFullYear()}`;
            setDisplayStartDate(formattedDisplayDate);

            // Directly update the input value as a fallback
            setTimeout(() => {
              const startDateInput = document.getElementById('start_date') as HTMLInputElement;
              if (startDateInput) {
                startDateInput.value = formattedStartDate;
              }
            }, 0);
          }
        } catch (error) {
          console.error("Error setting start date from selectedCell:", error);
        }
      }

      // Set end_date from the endDay property if available, otherwise use day as fallback
      if (selectedCell.endDay || selectedCell.day) {
        try {
          // Parse the date string and format it correctly for the input
          const endDate = new Date(selectedCell.endDay || selectedCell.day || '');
          if (!isNaN(endDate.getTime())) {
            // Format for form submission (YYYY-MM-DD)
            const formattedEndDate = endDate.toISOString().split('T')[0];
            setValue('end_date', formattedEndDate);

            // Format for display (MM/DD/YYYY) with leading zeros
            const month = String(endDate.getMonth() + 1).padStart(2, '0');
            const day = String(endDate.getDate()).padStart(2, '0');
            const formattedDisplayDate = `${month}/${day}/${endDate.getFullYear()}`;
            setDisplayEndDate(formattedDisplayDate);

            // Directly update the input value as a fallback
            setTimeout(() => {
              const endDateInput = document.getElementById('end_date') as HTMLInputElement;
              if (endDateInput) {
                endDateInput.value = formattedEndDate;
              }
            }, 0);
          }
        } catch (error) {
          console.error("Error setting end date from selectedCell:", error);
        }
      }

      // Determine booking type based on date range
      if (selectedCell.day && selectedCell.endDay) {
        try {
          const startDate = new Date(selectedCell.day);
          const endDate = new Date(selectedCell.endDay);
          
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            // Check if the dates are different
            const sameDay = 
              startDate.getFullYear() === endDate.getFullYear() &&
              startDate.getMonth() === endDate.getMonth() &&
              startDate.getDate() === endDate.getDate();
            
            if (sameDay) {
              // If it's the same day, use Hourly mode
              setBookingType('hourly');
            } else {
              // If different days are selected, use Daily mode
              setBookingType('daily');
            }
          }
        } catch (error) {
          console.error("Error determining booking type from date range:", error);
        }
      } else if (selectedCell.day) {
        // If only one day is selected, default to Hourly
        setBookingType('hourly');
      }
      
      // If there's an existing reservation, populate its data
      if (selectedCell.reservation) {
        if (selectedCell.reservation.start_date) {
          try {
            const date = new Date(selectedCell.reservation.start_date);
            if (!isNaN(date.getTime())) {
              const formattedDate = date.toISOString().split('T')[0];
              setValue('start_date', formattedDate);

              // Directly update the input value as a fallback
              setTimeout(() => {
                const startDateInput = document.getElementById('start_date') as HTMLInputElement;
                if (startDateInput) startDateInput.value = formattedDate;
              }, 0);
            }
          } catch (error) {
            console.error("Error setting start_date from reservation:", error);
          }
        }

        if (selectedCell.reservation.end_date) {
          try {
            const date = new Date(selectedCell.reservation.end_date);
            if (!isNaN(date.getTime())) {
              const formattedDate = date.toISOString().split('T')[0];
              setValue('end_date', formattedDate);

              // Directly update the input value as a fallback
              setTimeout(() => {
                const endDateInput = document.getElementById('end_date') as HTMLInputElement;
                if (endDateInput) endDateInput.value = formattedDate;
              }, 0);
            }
          } catch (error) {
            console.error("Error setting end_date from reservation:", error);
          }
        }

        if (selectedCell.reservation.user_id) {
          setValue('user_id', selectedCell.reservation.user_id);
        }

        if (selectedCell.reservation.boat_id) {
          setValue('boat_id', selectedCell.reservation.boat_id);
        }
      }
    }
  }, [selectedCell, setValue])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

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
        isCentered
      >
        <ModalOverlay />
        <ModalContent borderRadius="var(--chakra-space-xl)" minWidth="582px" minHeight="686px" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader p='2xl' display="flex" alignItems="center" gap="lg">
            <Flex flex="1" gap="lg">
              <Flex alignItems="center">
                <Text fontSize="20px" fontWeight="500" color="gray.900" borderRight="1px solid" borderColor="gray.200" pr="lg">
                  Add Services
                </Text>
              </Flex>
              <Flex bg="basic.grey100" border='1px solid' borderColor='basic.grey200' borderRadius='var(--chakra-space-sm)' py="xs" gap="xs" px="sm" align="center">
                <CustomIcon
                  name="bola-cell-white"
                  category="ui"
                  size={24}
                />
                <Text fontSize="20px" fontWeight="400" color="gray.900">
                  {selectedCell?.rowId}
                </Text>
              </Flex>
            </Flex>
            <Button
              onClick={() => {
                reset();
                onClose();
              }}
              variant="unstyled"
              position="relative"
              ml={2}
              fontSize="14px"
              color="gray.600"
              fontWeight="400"
              lineHeight="1"
              height="auto"
              p={0}
            >
              ✕
            </Button>
          </ModalHeader>
          <ModalBody
            px='2xl'
            py='0'
            display="flex"
            flexDirection="column"
            flex="1"
            gap='lg'
            overflowY="auto"
            sx={{
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <Flex border="1px solid" borderColor="brand.secondaryBlue" bg="bg.info" borderRadius="20px" w="100%" p='10px 20px' direction="row" align="center" position="relative">
              <Box flex='1'>
                <Text fontSize="16px" color="brand.secondaryBlue" fontWeight="500" mb="2px">
                  Payment notice
                </Text>
                <Text color="gray.700" fontSize="14px" fontWeight="300">
                  Please note that the reservation will be created and charged to the boater's primary payment method.                </Text>
              </Box>
            </Flex>
            <Flex direction="column" gap="12px">
              {!selectedCell && (
                <>
                  <FormControl>
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
                  <FormControl>
                    <FormLabel htmlFor="user_id">User ID</FormLabel>
                    <Input
                      id="user_id"
                      {...register("user_id")}
                      placeholder="User ID"
                      type="text"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor="boat_id">Boat ID</FormLabel>
                    <Input
                      id="boat_id"
                      {...register("boat_id")}
                      placeholder="Boat ID"
                      type="Boat"
                    />
                  </FormControl>
                </>
              )}
              <Flex
                width="100%"
                borderRadius="full"
                overflow="hidden"
                border="1px solid"
                borderColor="gray.200"
                height="40px"
                bg="basic.grey100"
              >
                <Button
                  variant="unstyled"
                  p="10px"
                  fontSize="12px"
                  fontWeight="500"
                  flex="1"
                  borderRadius="full"
                  bg={bookingType === 'daily' ? "gradient.orange" : "transparent"}
                  color={bookingType === 'daily' ? "white" : "gray.900"}
                  height="100%"
                  onClick={() => setBookingType('daily')}
                >
                  Daily booking
                </Button>
                <Button
                  fontSize="12px"
                  fontWeight="500"
                  variant="unstyled"
                  p="10px"
                  flex="1"
                  borderRadius="full"
                  bg={bookingType === 'hourly' ? "gradient.orange" : "transparent"}
                  color={bookingType === 'hourly' ? "white" : "gray.600"}
                  height="100%"
                  onClick={() => setBookingType('hourly')}
                >
                  Hourly booking
                </Button>
              </Flex>
              <FormControl
                isRequired
                borderRadius="full"
                borderColor="gray.200"
                borderWidth="1px"
                fontSize="18px"
                p='4px 10px 4px 24px'
                position="relative"
                cursor="text"
                onClick={() => {
                  const boaterEmailInput = document.getElementById('boater-email') as HTMLInputElement;
                  if (boaterEmailInput) boaterEmailInput.focus();
                }}
              >
                <Text fontSize="12px" color="gray.900" fontWeight="300">
                  Boater email
                </Text>
                <Input
                  id='boater-email'
                  {...register("user_id", {
                    required: "Boater email is required."
                  })}
                  fontSize="16px"
                  fontWeight="300"
                  variant="unstyled"
                  placeholder="Boater email"
                  _placeholder={{ fontSize: "16px", fontWeight: "300", color: "gray.400" }}
                  maxLength={20}
                />
              </FormControl>
              {bookingType === 'hourly' && (
                <Flex gap="sm">
                  <FormControl
                    isRequired
                    flex="1"
                    height="50px"
                    borderRadius="full"
                    borderColor="gray.200"
                    borderWidth="1px"
                    fontSize="18px"
                    p='4px 10px 4px 24px'
                    position="relative"
                    cursor="text"
                  >
                    <Text fontSize="12px" color="gray.900" fontWeight="300">Date</Text>
                    <Flex alignItems="center" justifyContent="space-between">
                      <Box
                        position="relative"
                        width="100%"
                        onClick={() => {
                          const startDateInput = document.getElementById('start_date') as HTMLInputElement;
                          if (startDateInput && startDateInput.showPicker) {
                            startDateInput.showPicker();
                          } else if (startDateInput) {
                            startDateInput.click();
                          }
                        }}
                        cursor="pointer"
                      >
                        <Input
                          id="start_date"
                          {...register("start_date", {
                            required: "Start date is required.",
                            onChange: (e) => {
                              // Update the display date when input changes manually
                              const date = new Date(e.target.value);
                              if (!isNaN(date.getTime())) {
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                setDisplayStartDate(`${month}/${day}/${date.getFullYear()}`);
                              }
                            }
                          })}
                          fontSize="16px"
                          fontWeight="300"
                          variant="unstyled"
                          type="date"
                          sx={{
                            '&::-webkit-calendar-picker-indicator': {
                              display: 'none',
                            },
                            opacity: 0,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none'
                          }}
                        />
                        <Text fontSize="16px" fontWeight="300">
                          {displayStartDate}
                        </Text>
                      </Box>
                      <Box position='absolute' right='10px' top='50%' p='10px' transform='translateY(-50%)' cursor="pointer" onClick={() => {
                        const startDateInput = document.getElementById('start_date') as HTMLInputElement;
                        if (startDateInput && startDateInput.showPicker) {
                          startDateInput.showPicker();
                        } else if (startDateInput) {
                          startDateInput.click();
                        }
                      }}>
                        <FiCalendar color='#B7B7B7' size={20} />
                      </Box>
                    </Flex>
                  </FormControl>
                  <Flex flex="2" gap="2">
                    <TimeDropdown
                      value={startTime}
                      onChange={(value) => {
                        setStartTime(value);
                        setShowStartTimeDropdown(false);
                      }}
                      placeholder="3:00pm"
                      isOpen={showStartTimeDropdown}
                      onToggle={() => {
                        setShowStartTimeDropdown(!showStartTimeDropdown);
                        // Close the other dropdown if opening this one
                        if (!showStartTimeDropdown) {
                          setShowEndTimeDropdown(false);
                        }
                      }}
                    />
                    <CustomIcon name="line" category="ui" size={20} />
                    <TimeDropdown
                      value={endTime}
                      onChange={(value) => {
                        setEndTime(value);
                        setShowEndTimeDropdown(false);
                      }}
                      placeholder="4:00pm"
                      isOpen={showEndTimeDropdown}
                      onToggle={() => {
                        setShowEndTimeDropdown(!showEndTimeDropdown);
                        // Close the other dropdown if opening this one
                        if (!showEndTimeDropdown) {
                          setShowStartTimeDropdown(false);
                        }
                      }}
                    />
                  </Flex>
                </Flex>
              )}

              {bookingType !== 'hourly' && (
                <Flex gap="sm">
                  <FormControl
                    isRequired
                    flex="1"
                    height="50px"
                    borderRadius="full"
                    borderColor="gray.200"
                    borderWidth="1px"
                    fontSize="18px"
                    p='4px 10px 4px 24px'
                    position="relative"
                    cursor="text"
                  >
                    <Text fontSize="12px" color="gray.900" fontWeight="300">Start Date</Text>
                    <Flex alignItems="center" justifyContent="space-between">
                      <Box
                        position="relative"
                        width="100%"
                        onClick={() => {
                          const startDateInput = document.getElementById('start_date') as HTMLInputElement;
                          if (startDateInput && startDateInput.showPicker) {
                            startDateInput.showPicker();
                          } else if (startDateInput) {
                            startDateInput.click();
                          }
                        }}
                        cursor="pointer"
                      >
                        <Input
                          id="start_date"
                          {...register("start_date", {
                            required: "Start date is required.",
                            onChange: (e) => {
                              // Update the display date when input changes manually
                              const date = new Date(e.target.value);
                              if (!isNaN(date.getTime())) {
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                setDisplayStartDate(`${month}/${day}/${date.getFullYear()}`);
                              }
                            }
                          })}
                          fontSize="16px"
                          fontWeight="300"
                          variant="unstyled"
                          type="date"
                          sx={{
                            '&::-webkit-calendar-picker-indicator': {
                              display: 'none',
                            },
                            opacity: 0,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none'
                          }}
                        />
                        <Text fontSize="16px" fontWeight="300">
                          {displayStartDate}
                        </Text>
                      </Box>
                      <Box position='absolute' right='10px' top='50%' p='10px' transform='translateY(-50%)' cursor="pointer" onClick={() => {
                        const startDateInput = document.getElementById('start_date') as HTMLInputElement;
                        if (startDateInput && startDateInput.showPicker) {
                          startDateInput.showPicker();
                        } else if (startDateInput) {
                          startDateInput.click();
                        }
                      }}>
                        <FiCalendar color='#B7B7B7' size={20} />
                      </Box>
                    </Flex>
                  </FormControl>
                  <FormControl
                    flex="1"
                    height="50px"
                    borderRadius="full"
                    borderColor="gray.200"
                    borderWidth="1px"
                    fontSize="18px"
                    p='4px 10px 4px 24px'
                    position="relative"
                    cursor="text"
                    isRequired
                  >
                    <Text fontSize="12px" color="gray.900" fontWeight="300">End Date</Text>
                    <Flex alignItems="center" justifyContent="space-between">
                      <Box
                        position="relative"
                        width="100%"
                        onClick={() => {
                          const endDateInput = document.getElementById('end_date') as HTMLInputElement;
                          if (endDateInput && endDateInput.showPicker) {
                            endDateInput.showPicker();
                          } else if (endDateInput) {
                            endDateInput.click();
                          }
                        }}
                        cursor="pointer"
                      >
                        <Input
                          id="end_date"
                          {...register("end_date", {
                            required: "End date is required.",
                            onChange: (e) => {
                              // Update the display date when input changes manually
                              const date = new Date(e.target.value);
                              if (!isNaN(date.getTime())) {
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                setDisplayEndDate(`${month}/${day}/${date.getFullYear()}`);
                              }
                            }
                          })}
                          fontSize="16px"
                          fontWeight="300"
                          variant="unstyled"
                          type="date"
                          sx={{
                            '&::-webkit-calendar-picker-indicator': {
                              display: 'none',
                            },
                            opacity: 0,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none'
                          }}
                        />
                        <Text fontSize="16px" fontWeight="300">
                          {displayEndDate}
                        </Text>
                      </Box>
                      <Box position='absolute' right='10px' top='50%' p='10px' transform='translateY(-50%)' cursor="pointer" onClick={() => {
                        const endDateInput = document.getElementById('end_date') as HTMLInputElement;
                        if (endDateInput && endDateInput.showPicker) {
                          endDateInput.showPicker();
                        } else if (endDateInput) {
                          endDateInput.click();
                        }
                      }}>
                        <FiCalendar color='#B7B7B7' size={20} />
                      </Box>
                    </Flex>
                  </FormControl>
                </Flex>
              )}
              <Box
                borderRadius="full"
                borderColor="gray.200"
                borderWidth="1px"
                fontSize="18px"
                p='4px 10px 4px 24px'
                position="relative"
                cursor="text"
                onClick={() => {
                  const bookingTitleInput = document.getElementById('booking-title') as HTMLInputElement;
                  if (bookingTitleInput) bookingTitleInput.focus();
                }}
              >
                <Text fontSize="12px" color="gray.900" fontWeight="300">
                  Booking title (optional)
                </Text>
                <Input
                  id='booking-title'
                  value={bookingTitle}
                  onChange={(e) => setBookingTitle(e.target.value)}
                  fontSize="16px"
                  fontWeight="300"
                  variant="unstyled"
                  placeholder="Enter your booking title here"
                  _placeholder={{ fontSize: "16px", fontWeight: "300", color: "gray.400" }}
                  maxLength={20}
                />
              </Box>
            </Flex>
            <Box
              borderRadius="24px"
              borderColor="gray.200"
              borderWidth="1px"
              fontSize="18px"
              p='4px 10px 4px 24px'
              position="relative"
              cursor="text"
              onClick={() => {
                const bookingDescriptionInput = document.getElementById('booking-description') as HTMLInputElement;
                if (bookingDescriptionInput) bookingDescriptionInput.focus();
              }}
            >
              <Text fontSize="12px" color="gray.900" fontWeight="300">
                Description (optional)
              </Text>
              <Textarea
                id='booking-description'
                value={bookingDescription}
                onChange={(e) => setBookingDescription(e.target.value)}
                fontSize="16px"
                fontWeight="300"
                variant="unstyled"
                placeholder="Any notes to remember this booking"
                _placeholder={{ fontSize: "16px", fontWeight: "300", color: "gray.400" }}
              />
            </Box>
          </ModalBody>

          <ModalFooter borderTop="1px solid #E5E5E5" p="xl">
            <Button
              h='50px'
              px="xl"
              py="10px"
              fontSize="16px"
              fontWeight="400"
              borderRadius="var(--chakra-space-full)"
              bg={!errors.user_id && !errors.start_date && !errors.end_date &&
                !!watch("user_id") && !!watch("start_date") && !!watch("end_date") ?
                "gradient.orange" : "#B7B7B7"}
              color="white"
              _hover={{
                bg: !errors.user_id && !errors.start_date && !errors.end_date &&
                  !!watch("user_id") && !!watch("start_date") && !!watch("end_date") ?
                  "#E55511" : "#B7B7B7"
              }}
              variant="unstyled"
              type="submit"
              isLoading={isSubmitting}
            >
              Enter details to continue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal >
    </>
  )
}

export default AddReservation
