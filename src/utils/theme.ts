import type { ColorPreset } from '@/theme/colors'

export function updateColorScheme(colorScheme: ColorPreset) {
  const flattenColors = (obj: Record<string, any>, prefix = ''): Record<string, string> => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const newKey = prefix ? `${prefix}-${key}` : key
      if (typeof value === 'object' && value !== null) {
        return { ...acc, ...flattenColors(value, newKey) }
      }
      return { ...acc, [newKey]: value }
    }, {} as Record<string, string>)
  }

  const flattenedColors = flattenColors(colorScheme)

  Object.entries(flattenedColors).forEach(([key, value]) => {
    if (!value || typeof value !== 'string') return
    document.documentElement.style.setProperty(`--color-${key}`, value)
  })
}

export function setThemeMode(mode: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', mode)
  if (mode === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function convertThemeSettingsToPreset(settings: any): ColorPreset {
  return {
    primary: {
      '100': settings.primary100,
      '200': settings.primary200,
      '300': settings.primary300,
      '400': settings.primary400,
      '500': settings.primary500,
      '600': settings.primary600,
      '700': settings.primary700,
      '800': settings.primary800,
      '900': settings.primary900,
    },
    secondary: {
      '100': settings.secondary100,
      '200': settings.secondary200,
      '300': settings.secondary300,
      '400': settings.secondary400,
      '500': settings.secondary500,
      '600': settings.secondary600,
      '700': settings.secondary700,
      '800': settings.secondary800,
      '900': settings.secondary900,
    },
    tertiary: {
      '100': settings.tertiary100,
      '200': settings.tertiary200,
      '300': settings.tertiary300,
      '400': settings.tertiary400,
      '500': settings.tertiary500,
      '600': settings.tertiary600,
      '700': settings.tertiary700,
      '800': settings.tertiary800,
      '900': settings.tertiary900,
    },
    neutral: {
      '100': settings.neutral100,
      '200': settings.neutral200,
      '300': settings.neutral300,
      '400': settings.neutral400,
      '500': settings.neutral500,
      '600': settings.neutral600,
      '700': settings.neutral700,
      '800': settings.neutral800,
      '900': settings.neutral900,
    },
    background: {
      '100': settings.background100,
      '200': settings.background200,
      '300': settings.background300,
      '400': settings.background400,
    },
    success: {
      '100': settings.success100,
      '200': settings.success200,
      '300': settings.success300,
      '400': settings.success400,
      '500': settings.success500,
      '600': settings.success600,
      '700': settings.success700,
      '800': settings.success800,
      '900': settings.success900,
    },
    warning: {
      '100': settings.warning100,
      '200': settings.warning200,
      '300': settings.warning300,
      '400': settings.warning400,
      '500': settings.warning500,
      '600': settings.warning600,
      '700': settings.warning700,
      '800': settings.warning800,
      '900': settings.warning900,
    },
    error: {
      '100': settings.error100,
      '200': settings.error200,
      '300': settings.error300,
      '400': settings.error400,
      '500': settings.error500,
      '600': settings.error600,
      '700': settings.error700,
      '800': settings.error800,
      '900': settings.error900,
    },
  }
} 