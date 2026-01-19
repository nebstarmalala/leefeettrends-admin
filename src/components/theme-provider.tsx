import * as React from 'react'
import { ThemeProvider as CustomThemeProvider, useTheme } from '@/context/theme-context'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: 'light' | 'dark' | 'system'
  storageKey?: string
}

export function ThemeProvider({ children, defaultTheme = 'system', storageKey = 'theme' }: ThemeProviderProps) {
  return (
    <CustomThemeProvider defaultTheme={defaultTheme} storageKey={storageKey}>
      {children}
    </CustomThemeProvider>
  )
}

export { useTheme }
