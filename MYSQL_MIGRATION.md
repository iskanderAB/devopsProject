# Database Migration: PostgreSQL to MySQL

This project has been migrated from PostgreSQL to MySQL. Here's what has changed and how to set it up.

## Changes Made

### 1. GitHub Workflows Updated
- **CI/CD Pipeline**: Changed from PostgreSQL service to MySQL 8.0 service
- **Environment Variables**: Updated test database configuration to use MySQL
- **Health Checks**: Changed to use `mysqladmin ping` instead of `pg_isready`

### 2. Dependencies Updated
- **Removed**: `pg` and `pg-hstore` (PostgreSQL dependencies)
- **Kept**: `mysql2` (already present in the project)

### 3. Configuration Files Added
- **`.env.example`**: Sample environment variables for MySQL
- **`docker-compose.yml`**: Production-ready MySQL setup
- **`docker-compose.dev.yml`**: Development setup with hot-reloading
- **`mysql-init/01-init.sql`**: Database initialization script

## Local Development Setup

### Option 1: Using Docker Compose (Recommended)

1. **Development Environment (with hot-reloading):**
   ```bash
   # Start all services
   docker-compose -f docker-compose.dev.yml up -d
   
   # Check logs
   docker-compose -f docker-compose.dev.yml logs -f
   
   # Stop services
   docker-compose -f docker-compose.dev.yml down
   ```

2. **Production-like Environment:**
   ```bash
   # Build and start all services
   docker-compose up -d
   
   # Stop and remove
   docker-compose down
   ```

### Option 2: Local MySQL Installation

1. **Install MySQL 8.0** on your system

2. **Create databases:**
   ```sql
   CREATE DATABASE conduit_dev;
   CREATE DATABASE conduit_test;
   CREATE USER 'conduit'@'localhost' IDENTIFIED BY 'conduit';
   GRANT ALL PRIVILEGES ON conduit_dev.* TO 'conduit'@'localhost';
   GRANT ALL PRIVILEGES ON conduit_test.* TO 'conduit'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Set up environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit the .env file with your MySQL credentials
   ```

4. **Install dependencies and run migrations:**
   ```bash
   cd backend
   npm install
   npm run sqlz db:migrate
   npm run sqlz db:seed:all  # Optional: seed with sample data
   npm run dev
   ```

## Database Configuration

The application uses environment variables for database configuration:

### Development
- `DEV_DB_USERNAME`: MySQL username (default: conduit)
- `DEV_DB_PASSWORD`: MySQL password (default: conduit)
- `DEV_DB_NAME`: Database name (default: conduit_dev)
- `DEV_DB_HOSTNAME`: MySQL host (default: localhost)
- `DEV_DB_DIALECT`: Database type (mysql)

### Test
- `TEST_DB_USERNAME`: MySQL username for tests
- `TEST_DB_PASSWORD`: MySQL password for tests
- `TEST_DB_NAME`: Test database name (conduit_test)
- `TEST_DB_HOSTNAME`: MySQL host for tests
- `TEST_DB_DIALECT`: Database type (mysql)

### Production
- `PROD_DB_USERNAME`: Production MySQL username
- `PROD_DB_PASSWORD`: Production MySQL password
- `PROD_DB_NAME`: Production database name
- `PROD_DB_HOSTNAME`: Production MySQL host
- `PROD_DB_DIALECT`: Database type (mysql)

## Migration Commands

If you need to run database migrations:

```bash
# Run all pending migrations
npm run sqlz db:migrate

# Undo last migration
npm run sqlz db:migrate:undo

# Run seeders
npm run sqlz db:seed:all

# Undo all seeders
npm run sqlz db:seed:undo:all
```

## Troubleshooting

### Connection Issues
- Ensure MySQL is running on the specified host and port
- Check firewall settings
- Verify credentials and database exists

### Authentication Issues
If you get authentication errors, ensure you're using the correct authentication plugin:
```sql
ALTER USER 'conduit'@'localhost' IDENTIFIED WITH mysql_native_password BY 'conduit';
```

### Charset Issues
Ensure your database uses UTF8MB4:
```sql
ALTER DATABASE conduit_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## CI/CD Integration

The GitHub Actions workflows now automatically:
- Spin up MySQL 8.0 service for testing
- Run tests against MySQL database
- Build Docker images with MySQL support

No additional configuration needed for CI/CD - it will work automatically when you push to the repository.

## Docker Services

The Docker Compose setup includes:
- **MySQL 8.0**: Database server with persistent storage
- **Backend**: Node.js API server connected to MySQL
- **Frontend**: React application served via Nginx

All services are properly networked and configured to work together.