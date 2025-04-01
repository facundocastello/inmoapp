import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export class TenantManager {
  private sharedPrisma: PrismaClient
  private tenantPrisma: PrismaClient
  private dbHost: string
  private dbUser: string
  private dbPassword: string

  constructor() {
    this.sharedPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.SHARED_DATABASE_URL,
        },
      },
    })
    this.tenantPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TENANT_DATABASE_URL,
        },
      },
    })

    // Parse connection details from DATABASE_URL_PREFIX
    const urlPrefix = process.env.DATABASE_URL_PREFIX || ''
    const match = urlPrefix.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)/)
    if (match) {
      this.dbUser = match[1]
      this.dbPassword = match[2]
      this.dbHost = match[3]
    } else {
      throw new Error('Invalid DATABASE_URL_PREFIX format')
    }
  }

  async createTenantDatabase(
    tenantId: string,
    databaseName: string,
  ): Promise<void> {
    try {
      // Create the database using psql if it doesn't exist
      await execAsync(
        `PGPASSWORD=${this.dbPassword} psql -h ${this.dbHost} -U ${this.dbUser} -c "CREATE DATABASE IF NOT EXISTS ${databaseName};"`,
      )

      // Update tenant record with database name
      await this.sharedPrisma.tenant.update({
        where: { id: tenantId },
        data: { databaseName },
      })

      // Run migrations for the new tenant database
      await execAsync(
        `DATABASE_URL="${process.env.DATABASE_URL_PREFIX}/${databaseName}" npx prisma migrate deploy`,
      )

      console.log(`Successfully created tenant database: ${databaseName}`)
    } catch (error) {
      console.error('Error creating tenant database:', error)
      throw error
    }
  }

  async deleteTenantDatabase(databaseName: string): Promise<void> {
    try {
      // Drop the database using psql
      await execAsync(
        `PGPASSWORD=${this.dbPassword} psql -h ${this.dbHost} -U ${this.dbUser} -c "DROP DATABASE ${databaseName};"`,
      )
      console.log(`Successfully deleted tenant database: ${databaseName}`)
    } catch (error) {
      console.error('Error deleting tenant database:', error)
      throw error
    }
  }

  async getTenantDatabaseUrl(tenantId: string): Promise<string> {
    const tenant = await this.sharedPrisma.tenant.findUnique({
      where: { id: tenantId },
      select: { databaseName: true },
    })

    if (!tenant) {
      throw new Error('Tenant not found')
    }

    return `${process.env.DATABASE_URL_PREFIX}/${tenant.databaseName}`
  }
}
