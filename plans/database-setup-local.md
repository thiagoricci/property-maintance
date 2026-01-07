# Database Setup Plan - Local PostgreSQL

## Problem

The application is failing to connect to the database with this error:

```
PrismaClientInitializationError: Invalid `prisma.user.findUnique()` invocation:
User `user` was denied access on the database `property_maintenance.public`
```

The current `.env.local` contains placeholder credentials that don't connect to a real database.

## Solution: Use Local PostgreSQL with Prisma

### Why Local PostgreSQL?

- Full control over database
- No external dependencies
- Fast development iteration
- Free (no cloud costs)
- Works offline

---

## Step-by-Step Setup

### Step 1: Verify PostgreSQL Installation

Check if PostgreSQL is installed and running:

```bash
# Check PostgreSQL version
psql --version

# Check if PostgreSQL service is running (macOS with Homebrew)
brew services list | grep postgresql

# Start PostgreSQL if not running (macOS with Homebrew)
brew services start postgresql

# Or on Linux
sudo systemctl start postgresql
```

### Step 2: Create Database and User

You have two options:

#### Option A: Use Default PostgreSQL User (Recommended for Development)

If you have PostgreSQL installed locally, you can use the default `postgres` user:

```bash
# Connect to PostgreSQL as postgres user
psql -U postgres

# Once connected, create the database
CREATE DATABASE property_maintenance;

# Exit psql
\q
```

#### Option B: Create Dedicated User (Recommended for Production-like Setup)

Create a dedicated user for this project:

```bash
# Connect to PostgreSQL as postgres user
psql -U postgres

# Create a new user with password
CREATE USER property_maintenance_user WITH PASSWORD 'your_secure_password_here';

# Create the database owned by the new user
CREATE DATABASE property_maintenance OWNER property_maintenance_user;

# Grant all privileges on the database
GRANT ALL PRIVILEGES ON DATABASE property_maintenance TO property_maintenance_user;

# Exit psql
\q
```

**Important**: Replace `your_secure_password_here` with a strong password. Save this password!

### Step 3: Update `.env.local`

Replace the `DATABASE_URL` in `.env.local` with your local PostgreSQL connection string.

#### If using Option A (default postgres user):

```env
DATABASE_URL="postgresql://postgres@localhost:5432/property_maintenance"
```

#### If using Option B (dedicated user):

```env
DATABASE_URL="postgresql://property_maintenance_user:your_secure_password_here@localhost:5432/property_maintenance"
```

**Note**: If your PostgreSQL is running on a different port (not 5432), update the port number accordingly.

### Step 4: Test Database Connection

Before running Prisma, verify the connection works:

```bash
# Test connection with psql
psql -U postgres -d property_maintenance

# Or with dedicated user
psql -U property_maintenance_user -d property_maintenance

# If successful, you should see:
# property_maintenance=#

# Exit
\q
```

### Step 5: Run Prisma Migrations

Once `.env.local` is updated and connection is verified:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# You should see output like:
# ✔ Generated Prisma Client
# ✔ Generated Prisma Client
# Your database is now in sync with your Prisma schema.
```

### Step 6: Verify Tables Created

Use Prisma Studio to verify the database setup:

```bash
npx prisma studio
```

This will open a browser interface (usually at http://localhost:5555) showing:

- `User` table with columns: id, email, name, password, createdAt, updatedAt
- `MaintenanceRequest` table with all columns from schema

You can also verify using psql:

```bash
psql -U postgres -d property_maintenance

# List all tables
\dt

# Describe User table
\d User

# Describe MaintenanceRequest table
\d MaintenanceRequest

# Exit
\q
```

### Step 7: Test Application

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/signup`

3. Try to create a new account with:

   - Email: `test@example.com`
   - Password: `password123`
   - Name: `Test User`

4. If successful, you should be redirected to the dashboard

5. Verify the user was created in the database:
   ```bash
   psql -U postgres -d property_maintenance
   SELECT * FROM "User";
   \q
   ```

---

## Troubleshooting

### Error: "Connection refused"

```bash
# Check if PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql    # Linux

# Start PostgreSQL
brew services start postgresql        # macOS
sudo systemctl start postgresql      # Linux
```

### Error: "FATAL: database does not exist"

```bash
# Connect to PostgreSQL and create the database
psql -U postgres
CREATE DATABASE property_maintenance;
\q
```

### Error: "FATAL: password authentication failed"

- Verify the password in `.env.local` matches the user's password
- Check PostgreSQL authentication settings in `pg_hba.conf`
- Try connecting with psql to verify credentials work:
  ```bash
  psql -U property_maintenance_user -d property_maintenance
  ```

### Error: "FATAL: role does not exist"

```bash
# Create the user
psql -U postgres
CREATE USER property_maintenance_user WITH PASSWORD 'your_password';
\q
```

### Error: Prisma client not generated

```bash
npx prisma generate
```

### Error: Tables not created

```bash
npx prisma db push
```

### Reset database (if needed)

```bash
# Drop and recreate database
psql -U postgres
DROP DATABASE property_maintenance;
CREATE DATABASE property_maintenance;
\q

# Re-run migrations
npx prisma db push
```

⚠️ **Warning**: This will delete all data in the database

---

## PostgreSQL Installation Guides

### macOS (Homebrew)

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify installation
psql --version
```

### Linux (Ubuntu/Debian)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql

# Enable PostgreSQL to start on boot
sudo systemctl enable postgresql

# Verify installation
sudo -u postgres psql --version
```

### Windows

Download and install from: https://www.postgresql.org/download/windows/

---

## Production Considerations

### Environment Variables

When deploying to Vercel, you'll need to:

1. Set up a cloud PostgreSQL database (Supabase, Vercel Postgres, or AWS RDS)
2. Update `DATABASE_URL` in Vercel's environment variables
3. Add `NEXTAUTH_SECRET` with a secure random string
4. Add `NEXTAUTH_URL` with your production URL
5. Add `OPENAI_API_KEY` (when ready for AI features)

### Database Security

- Use strong passwords
- Never commit `.env.local` to Git
- Use environment variables for all sensitive data
- Consider using a connection pooler for production
- Enable SSL/TLS for production connections

### Connection Pooling

For production, consider using:

- PgBouncer (connection pooler)
- Supabase/Vercel Postgres built-in pooling
- AWS RDS Proxy

---

## Next Steps After Database Setup

Once the database is connected and working:

1. ✅ Test signup flow
2. ✅ Test login flow
3. ✅ Test logout functionality
4. ✅ Verify session persistence
5. ✅ Begin Phase 3: Maintenance Request Features

---

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

## Quick Reference Commands

```bash
# Start PostgreSQL
brew services start postgresql@15  # macOS
sudo systemctl start postgresql    # Linux

# Connect to database
psql -U postgres -d property_maintenance

# Create database
psql -U postgres
CREATE DATABASE property_maintenance;
\q

# Run Prisma migrations
npx prisma generate
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Reset database (⚠️ deletes all data)
psql -U postgres
DROP DATABASE property_maintenance;
CREATE DATABASE property_maintenance;
\q
npx prisma db push
```

---

**Status**: Ready for implementation
**Estimated Time**: 5-10 minutes to complete setup
