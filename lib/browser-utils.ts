// Utility functions to safely handle browser-specific APIs

export const isBrowser = typeof window !== "undefined"
export const isLocalStorageAvailable = isBrowser && typeof Storage !== "undefined" && window.localStorage !== null
export const isSessionStorageAvailable = isBrowser && typeof Storage !== "undefined" && window.sessionStorage !== null
export const isNavigatorAvailable = isBrowser && typeof navigator !== "undefined"
export const isDocumentAvailable = typeof document !== "undefined"

// Safe localStorage operations
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isLocalStorageAvailable) return null
    try {
      return window.localStorage.getItem(key)
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return null
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    if (!isLocalStorageAvailable) return false
    try {
      window.localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
      return false
    }
  },
  
  removeItem: (key: string): boolean => {
    if (!isLocalStorageAvailable) return false
    try {
      window.localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
      return false
    }
  }
}

// Safe sessionStorage operations
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (!isSessionStorageAvailable) return null
    try {
      return window.sessionStorage.getItem(key)
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error)
      return null
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    if (!isSessionStorageAvailable) return false
    try {
      window.sessionStorage.setItem(key, value)
      return true
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error)
      return false
    }
  },
  
  removeItem: (key: string): boolean => {
    if (!isSessionStorageAvailable) return false
    try {
      window.sessionStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error)
      return false
    }
  }
}

// Safe window operations
export const safeWindow = {
  addEventListener: (event: string, handler: EventListener): boolean => {
    if (!isBrowser) return false
    try {
      window.addEventListener(event, handler)
      return true
    } catch (error) {
      console.warn(`Error adding window event listener for "${event}":`, error)
      return false
    }
  },
  
  removeEventListener: (event: string, handler: EventListener): boolean => {
    if (!isBrowser) return false
    try {
      window.removeEventListener(event, handler)
      return true
    } catch (error) {
      console.warn(`Error removing window event listener for "${event}":`, error)
      return false
    }
  },
  
  getOrigin: (): string => {
    if (!isBrowser) return ''
    return window.location.origin
  }
}

// Safe document operations
export const safeDocument = {
  addEventListener: (event: string, handler: EventListener): boolean => {
    if (!isDocumentAvailable) return false
    try {
      document.addEventListener(event, handler)
      return true
    } catch (error) {
      console.warn(`Error adding document event listener for "${event}":`, error)
      return false
    }
  },
  
  removeEventListener: (event: string, handler: EventListener): boolean => {
    if (!isDocumentAvailable) return false
    try {
      document.removeEventListener(event, handler)
      return true
    } catch (error) {
      console.warn(`Error removing document event listener for "${event}":`, error)
      return false
    }
  },
  
  setCookie: (name: string, value: string, path?: string, maxAge?: number): boolean => {
    if (!isDocumentAvailable) return false
    try {
      const pathStr = path ? `; path=${path}` : '; path=/'
      const maxAgeStr = maxAge ? `; max-age=${maxAge}` : ''
      document.cookie = `${name}=${value}${pathStr}${maxAgeStr}`
      return true
    } catch (error) {
      console.warn(`Error setting cookie "${name}":`, error)
      return false
    }
  }
}

// Safe navigator operations
export const safeNavigator = {
  share: async (data: ShareData): Promise<boolean> => {
    if (!isNavigatorAvailable || !navigator.share) return false
    try {
      await navigator.share(data)
      return true
    } catch (error) {
      console.warn('Error sharing:', error)
      return false
    }
  },
  
  writeText: async (text: string): Promise<boolean> => {
    if (!isNavigatorAvailable || !navigator.clipboard) return false
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      console.warn('Error copying to clipboard:', error)
      return false
    }
  }
} 