import { ThemeSettings } from '@prisma/client'
import { useEffect } from 'react'

import { convertThemeSettingsToPreset } from '@/lib/utils/theme'

import { useTheme } from './useTheme'

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
