import { useState, useCallback, useRef } from 'react'
import { useAppState } from '../context/useAppState'

export interface UseOptimisticMutationOptions<TData, TVariables = void> {
  currentValue: TData
  setValue: (value: TData | ((prev: TData) => TData)) => void
  getOptimisticValue: (current: TData, variables: TVariables) => TData
  mutationFn: (variables: TVariables) => Promise<unknown>
  errorMessage?: string | ((err: unknown, variables: TVariables) => string)
  successMessage?: string | ((variables: TVariables) => string)
  onSuccess?: (variables: TVariables) => void
  onError?: (err: unknown, variables: TVariables) => void
}

export function useOptimisticMutation<TData, TVariables = void>({
  currentValue,
  setValue,
  getOptimisticValue,
  mutationFn,
  errorMessage = 'Action failed. Changes have been rolled back.',
  successMessage,
  onSuccess,
  onError,
}: UseOptimisticMutationOptions<TData, TVariables>) {
  const [isPending, setIsPending] = useState(false)
  const { pushToast } = useAppState()
  const previousValueRef = useRef<TData>(currentValue)

  const mutate = useCallback(
    async (variables: TVariables) => {
      // 1. Snapshot previous value for rollback
      previousValueRef.current = currentValue

      // 2. Optimistically update local state immediately
      const nextValue = getOptimisticValue(currentValue, variables)
      setValue(nextValue)
      setIsPending(true)

      try {
        // 3. Execute the async operation
        await mutationFn(variables)
        setIsPending(false)

        if (successMessage) {
          const msg = typeof successMessage === 'function' ? successMessage(variables) : successMessage
          pushToast(msg, 'success')
        }
        if (onSuccess) {
          onSuccess(variables)
        }
      } catch (err) {
        // 4. Roll back to prior snapshot on failure
        setValue(previousValueRef.current)
        setIsPending(false)

        const msg =
          typeof errorMessage === 'function' ? errorMessage(err, variables) : errorMessage
        pushToast(msg, 'error')

        if (onError) {
          onError(err, variables)
        }
      }
    },
    [currentValue, getOptimisticValue, setValue, mutationFn, successMessage, onSuccess, errorMessage, pushToast, onError],
  )

  return {
    mutate,
    isPending,
  }
}
