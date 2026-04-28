#!/bin/bash
# Build script que ignora errores de migración

echo "Generating Prisma Client..."
npx prisma generate

echo "Deploying migrations..."
npx prisma migrate deploy || echo "Migration failed (DB may not be available yet)"

echo "Building Next.js..."
npm run build:next
