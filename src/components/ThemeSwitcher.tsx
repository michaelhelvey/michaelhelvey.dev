import React from 'react'
import 'react-toggle/style.css'
import Toggle from 'react-toggle'
import { useTheme, useThemeUpdater } from './providers/ThemeProvider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function() {
  const theme = useTheme()
  const updateTheme = useThemeUpdater()
  return (
    <Toggle
      checked={theme === 'dark'}
      onChange={() => updateTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={'toggle theme'}
      icons={{
        checked: (
          <div className="h-full w-full flex items-center justify-center">
            <FontAwesomeIcon icon="moon" className="w-3 h-3" />
          </div>
        ),
        unchecked: (
          <div className="h-full w-full flex items-center justify-center">
            <FontAwesomeIcon icon="sun" className="w-3 h-3 text-yellow-400" />
          </div>
        ),
      }}
    />
  )
}
