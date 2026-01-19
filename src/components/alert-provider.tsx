

import React from "react"

import { AlertProvider } from '@/context/alert-context'
import AlertDisplay from './alert-display'

export function AppAlertProvider({ children }: { children: React.ReactNode }) {
  return (
    <AlertProvider>
      <AlertDisplay />
      {children}
    </AlertProvider>
  )
}
