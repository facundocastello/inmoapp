#!/bin/bash

# Load environment variables
set -a
source .env
set +a

# Extract database names from URLs
SHARED_DB_NAME=$(echo $SHARED_DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
TENANT_DB_NAME=$(echo $TENANT_DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Function to drop and recreate a database
reset_database() {
    local db_name=$1
    echo "Dropping database $db_name if it exists..."
    PGPASSWORD=$(echo $SHARED_DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p') \
    psql -h $(echo $SHARED_DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p') \
         -U $(echo $SHARED_DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p') \
         -d postgres -c "DROP DATABASE IF EXISTS $db_name;"
    
    echo "Creating database $db_name..."
    PGPASSWORD=$(echo $SHARED_DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p') \
    psql -h $(echo $SHARED_DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p') \
         -U $(echo $SHARED_DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p') \
         -d postgres -c "CREATE DATABASE $db_name;"
}

# Drop and recreate shared database
reset_database $SHARED_DB_NAME

# Drop and recreate template database
reset_database $TENANT_DB_NAME

# Push schema changes for shared database
echo "Pushing schema for shared database..."
npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss

# Push schema changes for tenant template database
echo "Pushing schema for tenant template database..."
npx prisma db push --schema=./prisma/tenant-schema.prisma --accept-data-loss

# Generate Prisma clients
echo "Generating Prisma clients..."
npx prisma generate --schema=./prisma/schema.prisma
npx prisma generate --schema=./prisma/tenant-schema.prisma

echo "Database cleanup completed!" 