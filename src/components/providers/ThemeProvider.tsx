import React, { useState, useContext, useEffect } from 'react'

type AppTheme = 'light' | 'dark'
type AppThemeUpdater = (newTheme: AppTheme) => void

const AppThemeContext = React.createContext<AppTheme>(
  (undefined as any) as AppTheme
)
const AppThemeUpdaterContext = React.createContext<AppThemeUpdater>(
  (undefined as any) as AppThemeUpdater
)

interface IThemeProviderProps {
  children: React.ReactNode
}

export default function ThemeProvider({ children }: IThemeProviderProps) {
  const getThemeFromStorage = (): AppTheme => {
    // could be called on the server
    // tslint:disable-next-line: strict-type-predicates
    if (typeof window === 'undefined') {
      return 'light'
    }

    const value = window.localStorage.getItem('theme')
    if (value) {
      return value as AppTheme
    }

    return 'light'
  }
  const [currentTheme, _setCurrentTheme] = useState(getThemeFromStorage())
  const setCurrentTheme = (value: AppTheme) => {
    window.localStorage.setItem('theme', value)
    _setCurrentTheme(value)
  }

  return (
    <AppThemeContext.Provider value={currentTheme}>
      <AppThemeUpdaterContext.Provider value={setCurrentTheme}>
        {children}
      </AppThemeUpdaterContext.Provider>
    </AppThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(AppThemeContext)

  if (!context) {
    throw new Error('useTheme() must be used within a ThemeProvider component')
  }

  return context
}

export function useThemeUpdater() {
  const context = useContext(AppThemeUpdaterContext)

  if (!context) {
    throw new Error(
      'useThemeUpdater() must be used within a ThemeProvider component'
    )
  }

  return context
}

interface ITASConfig {
  baseStyles: string
  light: string
  dark: string
}
/*
 Theme Aware Styles creator
*/
export function TAS(theme: AppTheme, config: ITASConfig) {
  const base = config.baseStyles + ' '
  switch (theme) {
    case 'light':
      return base + config.light
    case 'dark':
      return base + config.dark
    default:
      return base
  }
}
