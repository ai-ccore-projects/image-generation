import { useState, useEffect } from 'react'

// Safe localStorage hook that handles SSR and browser compatibility
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Initialize state with a function to avoid SSR issues
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Check if we're in browser environment
      if (typeof window === "undefined") {
        return initialValue
      }
      
      // Check if localStorage is available
      if (typeof Storage === "undefined" || !window.localStorage) {
        return initialValue
      }

      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Save state
      setStoredValue(valueToStore)
      
      // Save to localStorage if available
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  // Remove item from localStorage
  const removeValue = () => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue, removeValue] as const
}

// Utility function to safely check if localStorage is available
export function isLocalStorageAvailable(): boolean {
  try {
    return typeof window !== "undefined" && 
           typeof Storage !== "undefined" && 
           window.localStorage !== null
  } catch (error) {
    return false
  }
} 