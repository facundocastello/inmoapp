import { useEffect, useState } from 'react'
import { updateColorScheme, setThemeMode } from '@/utils/theme'
import { darkColorsPreset, lightColorsPreset } from '@/theme/colors'
import type { ColorPreset } from '@/theme/colors'

export interface UseThemeReturn {
  isDark: boolean
  toggleTheme: () => void
  updateThemeColors: (colors: ColorPreset) => void
}

export function useTheme(tenantColors?: ColorPreset): UseThemeReturn {
  const [isDark, setIsDark] = useState(true) // Default to dark mode

  useEffect(() => {
    // Use tenant colors if provided, otherwise use default dark theme
    const colors = tenantColors || darkColorsPreset
    handleThemeChange(true) // Always start with dark mode
    updateColorScheme(colors)
  }, [tenantColors])

  const handleThemeChange = (isDarkMode: boolean) => {
    setIsDark(isDarkMode)
    setThemeMode(isDarkMode ? 'dark' : 'light')
    updateColorScheme(tenantColors || (isDarkMode ? darkColorsPreset : lightColorsPreset))
  }

  const toggleTheme = () => {
    handleThemeChange(!isDark)
  }

  const updateThemeColors = (colors: ColorPreset) => {
    updateColorScheme(colors)
  }

  return {
    isDark,
    toggleTheme,
    updateThemeColors
  }
} 