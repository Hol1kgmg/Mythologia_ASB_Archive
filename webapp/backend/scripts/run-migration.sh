#!/bin/bash

# Mythologia Database Migration Script
# Usage: ./scripts/run-migration.sh

echo "🗃️  Starting database migration..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

echo "🔍 Connected to: $(echo $DATABASE_URL | sed 's/postgresql:\/\/[^@]*@/postgresql:\/\/***@/')"

# Run migration SQL file
echo "📋 Executing migration: 001_create_admin_tables.sql"
psql "$DATABASE_URL" -f sql/001_create_admin_tables.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
else
    echo "❌ Migration failed!"
    exit 1
fi

echo "🔒 Migration finished"