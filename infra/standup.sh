#!/bin/bash

# Path: /COSMIC_AXIOM/infra/standup.sh

MYSQL_HOST="127.0.0.1"


MYSQL_PORT="3306"
MYSQL_USER="root"
MYSQL_PASSWORD="rootpassword"

echo "Using MySQL host: $MYSQL_HOST"

# Tear down existing containers cleanly
echo "Tearing down any existing containers..."
docker compose -f docker-compose.local.yml down --volumes --remove-orphans

echo "[COSMIC_AXIOM] Standing up MySQL and databases..."

# Bring up MySQL container
docker compose -f docker-compose.local.yml up -d mysql

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
until mysqladmin ping -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" --password="$MYSQL_PASSWORD" --silent; do
    sleep 2
done

echo "MySQL is ready! Continuing..."

MICROSERVICES=("astral" "library")  # Add more as needed

for DB in "${MICROSERVICES[@]}"; do
    echo "Creating database: $DB..."
    mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" --password="$MYSQL_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB;"
done

echo "[COSMIC_AXIOM] All databases ready."

# Run Prisma setup for each service
echo "Running Prisma setup for each microservice..."

for SERVICE in "${MICROSERVICES[@]}"; do
  echo "Setting up Prisma for $SERVICE..."
  pushd "../services/$SERVICE" > /dev/null || continue

  # Generate client and apply migrations
  npx prisma generate
  npx prisma migrate deploy

  popd > /dev/null
done

echo "Prisma setup complete for all services."

# Seed data into astral from raw SQL
echo "Seeding astral with test data..."
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" --password="$MYSQL_PASSWORD" astral < "seed_files/seed_astral.sql"

# Seed data into library from raw SQL
echo "Seeding library with test data..."
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" --password="$MYSQL_PASSWORD" library < "seed_files/seed_library.sql"

echo "Standup Complete!
