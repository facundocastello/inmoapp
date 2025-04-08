import { Plan, Subscription, Tenant } from '.prisma/shared'

interface GracePeriodStatus {
  isActive: boolean
  isExpired: boolean
  daysRemaining: number
  totalDays: number
  startedAt: Date | null
  endsAt: Date | null
}

const ONE_DAY = 1000 * 60 * 60 * 24

export function getGracePeriodStatus(
  graceStartedAt: Date | null,
  gracePeriodDays: number = 15,
): GracePeriodStatus {
  if (!graceStartedAt) {
    return {
      isActive: false,
      isExpired: false,
      daysRemaining: 0,
      totalDays: gracePeriodDays,
      startedAt: null,
      endsAt: null,
    }
  }

  const now = new Date()
  const endsAt = new Date(graceStartedAt)
  endsAt.setDate(endsAt.getDate() + gracePeriodDays)
  const daysRemaining = Math.ceil((endsAt.getTime() - now.getTime()) / ONE_DAY)

  return {
    isActive: daysRemaining > 0,
    isExpired: daysRemaining <= 0,
    daysRemaining,
    totalDays: gracePeriodDays,
    startedAt: graceStartedAt,
    endsAt,
  }
}

export function shouldStartGracePeriod(
  graceStartedAt: Date | null,
  gracePeriodDays: number = 15,
): boolean {
  if (!graceStartedAt) return true

  const status = getGracePeriodStatus(graceStartedAt, gracePeriodDays)
  return !status.isActive
}

export class PlanChecker {
  private tenant: Tenant & {
    subscription: Subscription & { plan: Plan | null }
  }
  private plan: Plan | null

  constructor(
    tenant: Tenant & {
      subscription: Subscription & { plan: Plan | null }
    },
  ) {
    this.tenant = tenant
    this.plan = tenant.subscription.plan
  }

  canUseFeature(feature: string): boolean {
    if (!this.plan) return false

    const features = this.plan.features as Record<string, boolean> | null
    return features?.[feature] ?? false
  }

  canAddUser(currentUserCount: number): boolean {
    if (!this.plan) return false

    const features = this.plan.features as Record<string, number> | null
    const maxUsers = features?.maxUsers ?? 0
    return currentUserCount < maxUsers
  }

  canAddStorage(currentStorage: number, requestedMB: number): boolean {
    if (!this.plan) return false

    const features = this.plan.features as Record<string, number> | null
    const maxStorage = features?.maxStorage ?? 0
    return currentStorage + requestedMB <= maxStorage
  }

  canAddProject(currentProjects: number): boolean {
    if (!this.plan) return false

    const features = this.plan.features as Record<string, number> | null
    const maxProjects = features?.maxProjects ?? 0
    return currentProjects < maxProjects
  }

  getPlanLimits(): {
    name: string
    price: number
    billingCycle: number
    features: Record<string, number | boolean>
  } | null {
    if (!this.plan) return null

    const features = this.plan.features as Record<
      string,
      number | boolean
    > | null
    return {
      name: this.plan.name,
      price: this.plan.price,
      billingCycle: this.tenant.subscription.billingCycle,
      features: features ?? {},
    }
  }
}
