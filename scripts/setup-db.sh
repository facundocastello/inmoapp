#!/bin/bash

# Check required environment variables
if [ -z "$DB_HOST" ]; then
    echo "Error: DB_HOST environment variable is not set"
    exit 1
fi

if [ -z "$DB_USER" ]; then
    echo "Error: DB_USER environment variable is not set"
    exit 1
fi

if [ -z "$DB_PASSWORD" ]; then
    echo "Error: DB_PASSWORD environment variable is not set"
    exit 1
fi

if [ -z "$DB_NAME" ]; then
    echo "Error: DB_NAME environment variable is not set"
    exit 1
fi

# Create shared database
echo "Creating shared database..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -c "CREATE DATABASE multi_tenant_shared;"

# Create template database for tenant migrations
echo "Creating template database..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -c "CREATE DATABASE multi_tenant_template;"

# Push schema for shared database
echo "Pushing shared database schema..."
npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss

# Push schema for tenant template database
echo "Pushing tenant template database schema..."
npx prisma db push --schema=./prisma/tenant-schema.prisma --accept-data-loss

# Generate Prisma clients
echo "Generating Prisma clients..."
npx prisma generate --schema=./prisma/schema.prisma
npx prisma generate --schema=./prisma/tenant-schema.prisma

# Run seeders
echo "Seeding databases..."
./scripts/seed-db.sh

echo "Database setup completed successfully!" 