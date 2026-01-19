import React, { createContext, useContext, useState, useCallback } from 'react'

export type AlertType = 'success' | 'error' | 'info' | 'warning'

export interface Alert {
  id: string
  type: AlertType
  title: string
  message: string
  duration?: number
}

interface AlertContextType {
  alerts: Alert[]
  addAlert: (type: AlertType, title: string, message: string, duration?: number) => void
  removeAlert: (id: string) => void
  clearAlerts: () => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([])

  const addAlert = useCallback(
    (type: AlertType, title: string, message: string, duration = 5000) => {
      const id = Date.now().toString()
      const newAlert: Alert = { id, type, title, message, duration }

      setAlerts((prev) => [...prev, newAlert])

      if (duration > 0) {
        setTimeout(() => {
          removeAlert(id)
        }, duration)
      }
    },
    []
  )

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }, [])

  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert, clearAlerts }}>
      {children}
    </AlertContext.Provider>
  )
}

export function useAlert() {
  const context = useContext(AlertContext)
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider')
  }
  return context
}
