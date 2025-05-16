import React from 'react'
import { useToast } from "@chakra-ui/react"
import { useCallback, useState } from "react"
import CustomToast from "../components/CustomToast"

// Create a global container for toasts if it doesn't exist
const ensureToastContainer = () => {
  let container = document.getElementById('custom-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'custom-toast-container';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.right = '0';
    container.style.zIndex = '9999';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);
  }
  return container;
};

const useCustomToast = () => {
  const toast = useToast()
  const [toastCount, setToastCount] = useState(0)

  const showToast = useCallback(
    (title: string, statusOrDescription?: "success" | "error" | "warning" | "info" | "loading" | string, status?: "success" | "error" | "warning" | "info" | "loading") => {
      // Determine if first argument is a description or status
      const toastOptions = typeof statusOrDescription === 'string' && ['success', 'error', 'warning', 'info', 'loading'].includes(statusOrDescription)
        ? {
          title,
          status: statusOrDescription as "success" | "error" | "warning" | "info" | "loading",
          description: undefined
        }
        : {
          title,
          status: status || 'info',
          description: statusOrDescription as string | undefined
        }

      // Generate a unique ID to ensure multiple toasts can be shown
      const toastId = `toast-${Date.now()}-${Math.random()}`

      // Increment toast count
      const currentIndex = toastCount
      setToastCount(prev => prev + 1)

      // Ensure toast container exists
      const container = ensureToastContainer()

      // Create a wrapper for this specific toast
      const toastWrapper = document.createElement('div')
      toastWrapper.id = toastId
      toastWrapper.style.position = 'relative'
      container.appendChild(toastWrapper)

      // Render toast into the wrapper
      const toastInstance = toast({
        id: toastId,
        position: "top-right",
        duration: 5000,
        render: (props: { onClose: () => void }) => (
          React.createElement(CustomToast, {
            title: toastOptions.title,
            description: toastOptions.description,
            status: toastOptions.status,
            onClose: () => {
              props.onClose()
              // Remove the wrapper when toast is closed
              const wrapper = document.getElementById(toastId)
              if (wrapper) wrapper.remove()
              // Decrement toast count
              setToastCount(prev => Math.max(0, prev - 1))
            },
            toastId: toastId,
            index: currentIndex
          })
        ),
        isClosable: false,
        onCloseComplete: () => {
          // Remove the wrapper if still exists
          const wrapper = document.getElementById(toastId)
          if (wrapper) wrapper.remove()
          // Ensure toast count is managed
          setToastCount(prev => Math.max(0, prev - 1))
        }
      })

      return toastInstance
    },
    [toast, toastCount]
  )

  return showToast
}

export default useCustomToast
