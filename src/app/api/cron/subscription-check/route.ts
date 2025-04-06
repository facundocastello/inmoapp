import { NextResponse } from 'next/server'

import { checkSubscriptions } from '@/lib/subscription/subscription-checker'

// This endpoint will be called by Vercel Cron Jobs daily
export async function GET() {
  try {
    const result = await checkSubscriptions()

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Subscription check failed:', error)
    return NextResponse.json(
      { error: 'Failed to process subscription checks' },
      { status: 500 },
    )
  }
}
