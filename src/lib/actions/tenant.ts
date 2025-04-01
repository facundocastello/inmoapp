'use server'

import { darkColorsPreset } from '@/theme/colors'

export const getTenantColorSchema = async (_tenantId: string) => {
  return darkColorsPreset
}
