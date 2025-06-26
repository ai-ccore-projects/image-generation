import { useState, useEffect } from 'react'

// Hook that prevents hydration mismatches when using localStorage
export function useHydrationSafeState<T>(
  key: string,
  initialValue: T,
  serialize: (value: T) => string = JSON.stringify,
  deserialize: (value: string) => T = JSON.parse
) {
  const [state, setState] = useState<T>(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage after hydration
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const item = window.localStorage.getItem(key)
        if (item !== null) {
          setState(deserialize(item))
        }
      }
    } catch (error) {
      console.warn(`Error loading from localStorage key "${key}":`, error)
    } finally {
      setIsHydrated(true)
    }
  }, [key, deserialize])

  // Save to localStorage when state changes (but only after hydration)
  useEffect(() => {
    if (!isHydrated) return
    
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, serialize(state))
      }
    } catch (error) {
      console.warn(`Error saving to localStorage key "${key}":`, error)
    }
  }, [key, state, serialize, isHydrated])

  const setValue = (value: T | ((prevState: T) => T)) => {
    setState(value)
  }

  const removeValue = () => {
    setState(initialValue)
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }

  return {
    value: state,
    setValue,
    removeValue,
    isHydrated
  }
} 