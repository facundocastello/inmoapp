export async function pushTenantDatabase(subdomain: string) {
  try {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)

    console.log(`Starting database creation for tenant: ${subdomain}`)
    console.log(`Using schema: ./prisma/tenant-schema.prisma`)

    await execAsync(
      `TENANT_DATABASE_URL="${process.env.TENANT_DATABASE_URL?.replace('test', subdomain)}" prisma db push --accept-data-loss --schema=./prisma/tenant-schema.prisma`,
    )

    console.log(`Successfully created database for tenant: ${subdomain}`)
    return { success: true }
  } catch (error) {
    console.error('Error creating tenant database:', error)
    return { success: false, error }
  }
}

export async function deleteTenantDatabase(subdomain: string) {
  try {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)

    console.log(`Starting database deletion for tenant: ${subdomain}`)
    console.log(`Using schema: ./prisma/tenant-schema.prisma`)

    // First terminate all connections to the database
    await execAsync(
      `prisma db execute --stdin << EOF
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = '${subdomain}'
  AND pid <> pg_backend_pid();
EOF`,
    )

    // Then drop the database
    await execAsync(
      `prisma db execute --stdin << EOF
DROP DATABASE IF EXISTS "${subdomain}";
EOF`,
    )

    console.log(`Successfully deleted database for tenant: ${subdomain}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting tenant database:', error)
    return { success: false, error }
  }
}
