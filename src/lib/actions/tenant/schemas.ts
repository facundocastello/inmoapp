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
  dateOfBirth: z.date(),
  taxId: z.string().optional(),
  emergencyContact: z.string().optional(),
})

export type PersonForm = z.infer<typeof personSchema>

export const propertySchema = z.object({
  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  country: z.string(),
  floorUnit: z.string().optional(),
  propertyType: z.string().optional(),
  isRented: z.boolean().default(false),
  size: z.number().optional(),
  numberOfRooms: z.number().optional(),
  services: z.string().optional(),
  description: z.string().optional(),
  rentalPrice: z.number().optional(),
  occupiedFrom: z.string().optional(),
  occupiedTo: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  propertyId: z.string().optional(),
  ownerId: z.string().optional(),
  occupantId: z.string().optional(),
  applicantId: z.string().optional(),
})

export type PropertyForm = z.infer<typeof propertySchema>

export const contractSchema = z.object({
  name: z.string().min(1),
  propertyId: z.string().optional(),
  ownerId: z.string().optional(),
  tenantId: z.string().optional(),
  contractTypeId: z.string().optional(),
  priceCalculationId: z.string().optional(),
  paymentMethodId: z.string().optional(),
  applicantId: z.string().optional(),
  occupantId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  duration: z.number().optional(),
  latePaymentPenalty: z.number().optional(),
  renewalConditions: z.string().optional(),
  earlyTermination: z.string().optional(),
  notes: z.string().optional(),
  status: z
    .enum(['DRAFT', 'PENDING', 'ACTIVE', 'TERMINATED', 'EXPIRED', 'CANCELLED'])
    .optional(),
})

export type ContractForm = z.infer<typeof contractSchema>

export const priceCalculationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  updatePeriod: z.number(),
  initialPrice: z.number(),
  currentPrice: z.number(),
  historyValues: z.array(
    z.object({
      value: z.number(),
      date: z.date(),
      // date: z.string().transform((str) => new Date(str)),
    }),
  ),
  fixedAmount: z.number(),
  fixedPercentage: z.number(),
  currencyLock: z.boolean(),
  indexId: z.string().optional(),
  currencyId: z.string().optional(),
})

export type PriceCalculationForm = z.infer<typeof priceCalculationSchema>

export const contractTypeSchema = z.object({
  name: z.string().min(1),
  templateIds: z.array(z.string()).optional(),
  description: z.string().optional(),
  isActive: z.boolean(),
})

export type ContractTypeForm = z.infer<typeof contractTypeSchema>

export const guaranteeSchema = z.object({
  type: z.enum(['SALARY_GUARANTEE', 'PROPERTY_GUARANTEE', 'COMPANY_BOND']),
  amount: z.number().min(0, 'Amount must be positive'),
  supportingDocs: z.array(z.union([z.string(), z.instanceof(File)])),
  personId: z.string().optional(),
  propertyId: z.string().optional(),
  companyId: z.string().optional(),
  contractId: z.string().optional(),
  guaranteeId: z.string().optional(),
})

export type GuaranteeForm = z.infer<typeof guaranteeSchema>

export const contractTemplateSchema = z.object({
  name: z.string().min(1),
  template: z.string().min(1),
  isPublic: z.boolean(),
  contractTypeIds: z.array(z.string()).optional(),
})

export type ContractTemplateForm = z.infer<typeof contractTemplateSchema>
