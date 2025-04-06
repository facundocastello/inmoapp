import { Plan, Tenant } from '.prisma/shared'

export class PlanChecker {
  private tenant: Tenant & { plan: Plan | null }

  constructor(tenant: Tenant & { plan: Plan | null }) {
    this.tenant = tenant
  }

  canUseFeature(feature: string): boolean {
    if (!this.tenant.plan) return false

    const features = this.tenant.plan.features as Record<string, boolean> | null
    return features?.[feature] ?? false
  }

  canAddUser(currentUserCount: number): boolean {
    if (!this.tenant.plan) return false

    const features = this.tenant.plan.features as Record<string, number> | null
    const maxUsers = features?.maxUsers ?? 0
    return currentUserCount < maxUsers
  }

  canAddStorage(currentStorage: number, requestedMB: number): boolean {
    if (!this.tenant.plan) return false

    const features = this.tenant.plan.features as Record<string, number> | null
    const maxStorage = features?.maxStorage ?? 0
    return currentStorage + requestedMB <= maxStorage
  }

  canAddProject(currentProjects: number): boolean {
    if (!this.tenant.plan) return false

    const features = this.tenant.plan.features as Record<string, number> | null
    const maxProjects = features?.maxProjects ?? 0
    return currentProjects < maxProjects
  }

  getPlanLimits(): {
    name: string
    price: number
    billingCycle: number
    features: Record<string, number | boolean>
  } | null {
    if (!this.tenant.plan) return null

    const features = this.tenant.plan.features as Record<
      string,
      number | boolean
    > | null
    return {
      name: this.tenant.plan.name,
      price: this.tenant.plan.price,
      billingCycle: this.tenant.plan.billingCycle,
      features: features ?? {},
    }
  }
}
