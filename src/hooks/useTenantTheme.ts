import { useEffect } from 'react'

import { convertThemeSettingsToPreset } from '@/utils/theme'

import { useTheme } from './useTheme'
import { ThemeSettings } from '.prisma/shared'

export function useTenantTheme(themeSettings?: ThemeSettings | null) {
  const { isDark, toggleTheme, updateThemeColors } = useTheme()

  useEffect(() => {
    if (themeSettings) {
      const colorPreset = convertThemeSettingsToPreset(themeSettings)
      updateThemeColors(colorPreset)
    }
  }, [themeSettings, updateThemeColors])

  return {
    isDark,
    toggleTheme,
  }
}
