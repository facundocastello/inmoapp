import { NextResponse } from 'next/server'

import { handlePaymentNotification } from '@/lib/utils/payments/mercadopago'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received webhook:', body)
    // Verify the webhook signature if needed
    // const signature = request.headers.get('x-signature');
    // if (!verifySignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    // Handle payment.created notifications
    if (
      body.type === 'payment' &&
      (body.action === 'payment.created' || body.action === 'payment.updated')
    ) {
      const result = await handlePaymentNotification(body.data.id)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
    }

    // Handle preapproval updates
    if (body.type === 'subscription_preapproval') {
      // Handle preapproval updates
      // You might want to update the subscription status in your database
      console.log('Preapproval update received:', body)
      // TODO: Implement preapproval update handling
    }

    // Always return 200 OK to acknowledge receipt
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// {
//   action: 'created',
//   application_id: 2230215623841484,
//   data: { id: '290ec7dee90847a7bcfb76749dde2d21' },
//   date: '2025-04-08T21:08:37Z',
//   entity: 'preapproval',
//   id: 120460139456,
//   type: 'subscription_preapproval',
//   version: 0
// }

// {
//   action: 'updated',
//   application_id: 2230215623841484,
//   data: { id: '290ec7dee90847a7bcfb76749dde2d21' },
//   date: '2025-04-08T21:08:37Z',
//   entity: 'preapproval',
//   id: 120460196552,
//   type: 'subscription_preapproval',
//   version: 1
// }

// {
//   action: 'payment.created',
//   api_version: 'v1',
//   data: { id: '107344763641' },
//   date_created: '2025-04-08T21:23:52Z',
//   id: 120394962529,
//   live_mode: true,
//   type: 'payment',
//   user_id: '1158858070'
// }

// {
//   action: 'payment.created',
//   api_version: 'v1',
//   data: { id: '107344763641' },
//   date_created: '2025-04-08T21:23:52Z',
//   id: 120393492363,
//   live_mode: true,
//   type: 'payment',
//   user_id: '1158858070'
// }

// {
//   action: 'payment.created',
//   api_version: 'v1',
//   data: { id: '107344763641' },
//   date_created: '2025-04-08T21:23:52Z',
//   id: 120394977599,
//   live_mode: true,
//   type: 'payment',
//   user_id: '1158858070'
// }

// {
//   action: 'created',
//   application_id: 2230215623841484,
//   data: { id: '7017540116' },
//   date: '2025-04-08T21:25:28Z',
//   entity: 'authorized_payment',
//   id: 120460584032,
//   type: 'subscription_authorized_payment',
//   version: 0
// }

// {
//   action: 'updated',
//   application_id: 2230215623841484,
//   data: { id: '290ec7dee90847a7bcfb76749dde2d21' },
//   date: '2025-04-08T21:23:53Z',
//   entity: 'preapproval',
//   id: 120460525272,
//   type: 'subscription_preapproval',
//   version: 2
// }
