interface EmailOptions {
  to: string
  subject: string
  body: string
}

export async function sendEmail({
  to,
  subject,
  body,
}: EmailOptions): Promise<void> {
  // TODO: Implement actual email sending logic
  // For now, just log the email details
  console.log('Sending email:', {
    to,
    subject,
    body,
  })
}
