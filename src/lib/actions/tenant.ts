'use server'

import { darkColorsPreset } from '@/theme/colors'

export const getTenantColorSchema = async (tenantId: string) => {
    return darkColorsPreset
}