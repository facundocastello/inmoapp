import { z } from 'zod'

export const indexSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  currentValue: z.number().min(0, 'Value must be positive'),
  updateFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
  source: z.enum(['MANUAL', 'AUTOMATIC']),
  isActive: z.boolean(),
  historyValues: z.array(
    z.object({
      value: z.number(),
      date: z.string(),
    }),
  ),
})

export type IndexForm = z.infer<typeof indexSchema>

export const currencySchema = z.object({
  type: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  valueInPesos: z.number(),
  historyValues: z.array(
    z.object({
      value: z.number(),
      date: z.string(),
    }),
  ),
})

export type CurrencyForm = z.infer<typeof currencySchema>

export const personSchema = z.object({
  documentType: z.string(),
  document: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  address: z.string(),
  phoneNumber: z.string(),
  email: z.string().email(),
  dateOfBirth: z.string(),
  taxId: z.string().optional(),
  emergencyContact: z.string().optional(),
})

export type PersonForm = z.infer<typeof personSchema>

export const propertySchema = z.object({
  address: z.string(),
  floorUnit: z.string().optional(),
  propertyType: z.string(),
  isRented: z.boolean().default(false),
  size: z.number().optional(),
  numberOfRooms: z.number().optional(),
  services: z.string().optional(),
  description: z.string().optional(),
  rentalPrice: z.number(),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
  constructionYear: z.number().optional(),
  propertyId: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  ownerId: z.string(),
  occupantId: z.string().optional(),
  applicantId: z.string().optional(),
})

export type PropertyForm = z.infer<typeof propertySchema>

export const contractSchema = z.object({
  propertyId: z.string(),
  ownerId: z.string(),
  tenantId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  monthlyRent: z.number(),
  deposit: z.number(),
  contractTypeId: z.string(),
  priceCalculationId: z.string(),
  paymentMethodId: z.string(),
  isActive: z.boolean(),
})

export type ContractForm = z.infer<typeof contractSchema>

export const priceCalculationSchema = z.object({
  updatePeriod: z.number(),
  initialPrice: z.number(),
  currentPrice: z.number(),
  historyValues: z.array(
    z.object({
      value: z.number(),
      date: z.string().transform((str) => new Date(str)),
    }),
  ),
  fixedAmount: z.number().optional(),
  fixedPercentage: z.number().optional(),
  currencyLock: z.boolean().default(false),
  indexId: z.string().optional(),
  currencyId: z.string().optional(),
})

export type PriceCalculationForm = z.infer<typeof priceCalculationSchema>

export const contractTypeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean(),
})

export type ContractTypeForm = z.infer<typeof contractTypeSchema>
