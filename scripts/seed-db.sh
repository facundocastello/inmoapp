#!/bin/bash

# Seed shared database
echo "Seeding shared database..."
NODE_OPTIONS='--experimental-specifier-resolution=node' npx ts-node --esm prisma/seeders/shared-seed.ts

# Seed tenant template database
echo "Seeding tenant template database..."
NODE_OPTIONS='--experimental-specifier-resolution=node' npx ts-node --esm prisma/seeders/tenant-seed.ts

echo "Database seeding completed!" 