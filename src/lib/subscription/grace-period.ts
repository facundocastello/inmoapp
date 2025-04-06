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
  console.log({
    daysRemaining,
  })

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
