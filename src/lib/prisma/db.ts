export async function createTenantDatabase(subdomain: string) {
  try {
    // Now run prisma db push
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)

    console.log(`Starting database creation for tenant: ${subdomain}`)
    console.log(`Using schema: ./prisma/tenant-schema.prisma`)

    await execAsync(
      `TENANT_DATABASE_URL="${process.env.TENANT_DATABASE_URL?.replace('test', subdomain)}" prisma db push --schema=./prisma/tenant-schema.prisma`,
    )

    console.log(`Successfully created database for tenant: ${subdomain}`)
    return { success: true }
  } catch (error) {
    console.error('Error creating tenant database:', error)
    return { success: false, error }
  }
}
