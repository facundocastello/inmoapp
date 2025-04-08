export const lightColorsPreset = {
  primary: {
    900: '#000000', // Very light background
    800: '#111111',
    700: '#222222', // Light interactive elements
    600: '#333333', // Secondary buttons
    500: '#D8B4A0', // Primary buttons
    400: '#C4A08C', // Button hover
    300: '#B08C78', // Button active
    200: '#EFF1F3', // Darker text
    100: '#EFF1F3', // Main text
  },
  secondary: {
    100: '#F0F9FF',
    200: '#E0F2FE',
    300: '#BAE6FD',
    400: '#7DD3FC',
    500: '#38BDF8',
    600: '#0EA5E9',
    700: '#0284C7',
    800: '#0369A1',
    900: '#075985',
  },
  tertiary: {
    100: '#FDF4FF',
    200: '#FAE8FF',
    300: '#F5D0FE',
    400: '#F0ABFC',
    500: '#E879F9',
    600: '#D946EF',
    700: '#C026D3',
    800: '#A21CAF',
    900: '#86198F',
  },
  neutral: {
    100: '#F8FAFC',
    200: '#F1F5F9',
    300: '#E2E8F0',
    400: '#CBD5E1',
    500: '#94A3B8',
    600: '#64748B',
    700: '#475569',
    800: '#334155',
    900: '#1E293B',
  },
  background: {
    100: '#FFFFFF',
    200: '#F8FAFC',
    300: '#F1F5F9',
    400: '#E2E8F0',
  },
  success: {
    100: '#F0FDF4',
    200: '#DCFCE7',
    300: '#BBF7D0',
    400: '#86EFAC',
    500: '#4ADE80',
    600: '#22C55E',
    700: '#16A34A',
    800: '#15803D',
    900: '#166534',
  },
  warning: {
    100: '#FFFBEB',
    200: '#FEF3C7',
    300: '#FDE68A',
    400: '#FCD34D',
    500: '#FBBF24',
    600: '#F59E0B',
    700: '#D97706',
    800: '#B45309',
    900: '#92400E',
  },
  error: {
    100: '#FEF2F2',
    200: '#FEE2E2',
    300: '#FECACA',
    400: '#FCA5A5',
    500: '#F87171',
    600: '#EF4444',
    700: '#DC2626',
    800: '#B91C1C',
    900: '#991B1B',
  },
}

export const darkColorsPreset = {
  primary: {
    100: '#0F172A', // Darkest background
    200: '#1E293B', // Slightly lighter
    300: '#334155', // Medium dark
    400: '#3B82F6', // Primary buttons
    500: '#2563EB', // Button hover
    600: '#1D4ED8', // Button active
    700: '#E2E8F0', // Lighter text
    800: '#F1F5F9', // Main text
    900: '#F8FAFC', // Main text
  },
  secondary: {
    100: '#0F172A',
    200: '#1E293B',
    300: '#334155',
    400: '#475569',
    500: '#64748B',
    600: '#94A3B8',
    700: '#CBD5E1',
    800: '#E2E8F0',
    900: '#F1F5F9',
  },
  tertiary: {
    100: '#581C87',
    200: '#6B21A8',
    300: '#7E22CE',
    400: '#9333EA',
    500: '#A855F7',
    600: '#C084FC',
    700: '#D8B4FE',
    800: '#E9D5FF',
    900: '#F3E8FF',
  },
  neutral: {
    100: '#0F172A',
    200: '#1E293B',
    300: '#334155',
    400: '#475569',
    500: '#64748B',
    600: '#94A3B8',
    700: '#CBD5E1',
    800: '#E2E8F0',
    900: '#F1F5F9',
  },
  background: {
    100: '#0F172A',
    200: '#1E293B',
    300: '#334155',
    400: '#475569',
  },
  success: {
    100: '#052E16',
    200: '#065F46',
    300: '#064E3B',
    400: '#065F46',
    500: '#047857',
    600: '#059669',
    700: '#10B981',
    800: '#34D399',
    900: '#6EE7B7',
  },
  warning: {
    100: '#451A03',
    200: '#7C2D12',
    300: '#9A3412',
    400: '#C2410C',
    500: '#EA580C',
    600: '#FB923C',
    700: '#FED7AA',
    800: '#FFEDD5',
    900: '#FFFBEB',
  },
  error: {
    100: '#FEF2F2',
    200: '#FEE2E2',
    300: '#FECACA',
    400: '#FCA5A5',
    500: '#F87171',
    600: '#EF4444',
    700: '#DC2626',
    800: '#B91C1C',
    900: '#991B1B',
  },
}

export const defaultPreset = darkColorsPreset
export type ColorPreset = typeof darkColorsPreset

const colors = {
  primary: {
    100: `var(--color-primary-100, ${defaultPreset.primary[100]})`,
    200: `var(--color-primary-200, ${defaultPreset.primary[200]})`,
    300: `var(--color-primary-300, ${defaultPreset.primary[300]})`,
    400: `var(--color-primary-400, ${defaultPreset.primary[400]})`,
    500: `var(--color-primary-500, ${defaultPreset.primary[500]})`,
    600: `var(--color-primary-600, ${defaultPreset.primary[600]})`,
    700: `var(--color-primary-700, ${defaultPreset.primary[700]})`,
    800: `var(--color-primary-800, ${defaultPreset.primary[800]})`,
    900: `var(--color-primary-900, ${defaultPreset.primary[900]})`,
  },
  secondary: {
    100: `var(--color-secondary-100, ${defaultPreset.secondary[100]})`,
    200: `var(--color-secondary-200, ${defaultPreset.secondary[200]})`,
    300: `var(--color-secondary-300, ${defaultPreset.secondary[300]})`,
    400: `var(--color-secondary-400, ${defaultPreset.secondary[400]})`,
    500: `var(--color-secondary-500, ${defaultPreset.secondary[500]})`,
    600: `var(--color-secondary-600, ${defaultPreset.secondary[600]})`,
    700: `var(--color-secondary-700, ${defaultPreset.secondary[700]})`,
    800: `var(--color-secondary-800, ${defaultPreset.secondary[800]})`,
    900: `var(--color-secondary-900, ${defaultPreset.secondary[900]})`,
  },
  tertiary: {
    100: `var(--color-tertiary-100, ${defaultPreset.tertiary[100]})`,
    200: `var(--color-tertiary-200, ${defaultPreset.tertiary[200]})`,
    300: `var(--color-tertiary-300, ${defaultPreset.tertiary[300]})`,
    400: `var(--color-tertiary-400, ${defaultPreset.tertiary[400]})`,
    500: `var(--color-tertiary-500, ${defaultPreset.tertiary[500]})`,
    600: `var(--color-tertiary-600, ${defaultPreset.tertiary[600]})`,
    700: `var(--color-tertiary-700, ${defaultPreset.tertiary[700]})`,
    800: `var(--color-tertiary-800, ${defaultPreset.tertiary[800]})`,
    900: `var(--color-tertiary-900, ${defaultPreset.tertiary[900]})`,
  },
  neutral: {
    100: `var(--color-neutral-100, ${defaultPreset.neutral[100]})`,
    200: `var(--color-neutral-200, ${defaultPreset.neutral[200]})`,
    300: `var(--color-neutral-300, ${defaultPreset.neutral[300]})`,
    400: `var(--color-neutral-400, ${defaultPreset.neutral[400]})`,
    500: `var(--color-neutral-500, ${defaultPreset.neutral[500]})`,
    600: `var(--color-neutral-600, ${defaultPreset.neutral[600]})`,
    700: `var(--color-neutral-700, ${defaultPreset.neutral[700]})`,
    800: `var(--color-neutral-800, ${defaultPreset.neutral[800]})`,
    900: `var(--color-neutral-900, ${defaultPreset.neutral[900]})`,
  },
  background: {
    100: `var(--color-background-100, ${defaultPreset.background[100]})`,
    200: `var(--color-background-200, ${defaultPreset.background[200]})`,
    300: `var(--color-background-300, ${defaultPreset.background[300]})`,
    400: `var(--color-background-400, ${defaultPreset.background[400]})`,
  },
  success: {
    100: `var(--color-success-100, ${defaultPreset.success[100]})`,
    200: `var(--color-success-200, ${defaultPreset.success[200]})`,
    300: `var(--color-success-300, ${defaultPreset.success[300]})`,
    400: `var(--color-success-400, ${defaultPreset.success[400]})`,
    500: `var(--color-success-500, ${defaultPreset.success[500]})`,
    600: `var(--color-success-600, ${defaultPreset.success[600]})`,
    700: `var(--color-success-700, ${defaultPreset.success[700]})`,
    800: `var(--color-success-800, ${defaultPreset.success[800]})`,
    900: `var(--color-success-900, ${defaultPreset.success[900]})`,
  },
  warning: {
    100: `var(--color-warning-100, ${defaultPreset.warning[100]})`,
    200: `var(--color-warning-200, ${defaultPreset.warning[200]})`,
    300: `var(--color-warning-300, ${defaultPreset.warning[300]})`,
    400: `var(--color-warning-400, ${defaultPreset.warning[400]})`,
    500: `var(--color-warning-500, ${defaultPreset.warning[500]})`,
    600: `var(--color-warning-600, ${defaultPreset.warning[600]})`,
    700: `var(--color-warning-700, ${defaultPreset.warning[700]})`,
    800: `var(--color-warning-800, ${defaultPreset.warning[800]})`,
    900: `var(--color-warning-900, ${defaultPreset.warning[900]})`,
  },
  error: {
    100: `var(--color-error-100, ${defaultPreset.error[100]})`,
    200: `var(--color-error-200, ${defaultPreset.error[200]})`,
    300: `var(--color-error-300, ${defaultPreset.error[300]})`,
    400: `var(--color-error-400, ${defaultPreset.error[400]})`,
    500: `var(--color-error-500, ${defaultPreset.error[500]})`,
    600: `var(--color-error-600, ${defaultPreset.error[600]})`,
    700: `var(--color-error-700, ${defaultPreset.error[700]})`,
    800: `var(--color-error-800, ${defaultPreset.error[800]})`,
    900: `var(--color-error-900, ${defaultPreset.error[900]})`,
  },
}

export const getHtmlStyleColors = (colorSchema: ColorPreset) => {
  return Object.entries(colorSchema).reduce((acc, [colorName, value]) => {
    return {
      ...acc,
      ...Object.entries(value).reduce((acc, [shade, value]) => {
        return {
          ...acc,
          [`--color-${colorName}-${shade}`]: value,
        }
      }, {}),
    }
  }, {})
}

export default colors
