# Phase 0: Pre-Development Setup Guide

This guide walks you through completing Phase 0 of the Property Maintenance MVP project setup.

## ✅ Completed Steps

### 1. Environment Setup

- ✅ Node.js 18+ installed
- ✅ VS Code or preferred IDE installed
- ✅ Git installed

### 2. Project Repository Initialization

- ✅ Git repository initialized in current directory
- ✅ Main branch configured
- ✅ `.gitignore` created with Next.js and development exclusions
- ✅ `README.md` created with project overview and quick start instructions
- ✅ `.env.example` created with required environment variables template

## 📋 Remaining Steps

### Step 3: Create External Service Accounts

#### 3.1 Vercel Account (for deployment)

1. Go to https://vercel.com/signup
2. Sign up for a free account (GitHub login recommended)
3. Verify your email address
4. Note: You'll connect your GitHub repository later during deployment

#### 3.2 AI Provider Account (choose one)

**Option A: OpenAI**

1. Go to https://platform.openai.com/signup
2. Create an account
3. Navigate to https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy the API key (starts with `sk-`)
6. **Important**: Store this key securely - you'll add it to `.env` later
7. Note: Free tier includes $5 credit, upgrade as needed

**Option B: Anthropic Claude**

1. Go to https://console.anthropic.com/
2. Create an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key (starts with `sk-ant-`)
6. **Important**: Store this key securely - you'll add it to `.env` later

#### 3.3 Database Account (choose one)

**Option A: Vercel Postgres (Recommended)**

1. Go to https://vercel.com/docs/storage/vercel-postgres
2. In your Vercel dashboard, go to "Storage"
3. Click "Create Database"
4. Select "Postgres"
5. Choose a region closest to you
6. Note the connection string - you'll add it to `.env` later

**Option B: Supabase**

1. Go to https://supabase.com/
2. Sign up for a free account
3. Create a new project
4. Wait for project to be ready (2-3 minutes)
5. Go to Settings → Database
6. Copy the connection string
7. Note: You'll add this to `.env` later

### Step 4: Configure Environment Variables

1. Copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual values:

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@host:port/database"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
   NEXTAUTH_URL="http://localhost:3000"

   # AI Provider (choose one)
   # OpenAI API Key
   OPENAI_API_KEY="sk-your-actual-openai-key-here"
   # OR
   # Anthropic API Key
   ANTHROPIC_API_KEY="sk-ant-your-actual-anthropic-key-here"

   # Node Environment
   NODE_ENV="development"
   ```

3. Generate NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and paste it as the NEXTAUTH_SECRET value.

### Step 5: Verify Setup

#### 5.1 Check Node.js version

```bash
node --version
# Should show v18.x.x or higher
```

#### 5.2 Check Git status

```bash
git status
# Should show untracked files: .gitignore, .env.example, README.md
```

#### 5.3 Verify environment variables

```bash
# List .env file (ensure it exists and has your values)
cat .env
```

## 🎯 Phase 0 Completion Checklist

- [x] Development environment verified (Node.js, Git, VS Code)
- [x] Git repository initialized with main branch
- [x] `.gitignore` created
- [x] `README.md` created
- [x] `.env.example` created
- [ ] Vercel account created
- [ ] AI provider account created (OpenAI OR Anthropic)
- [ ] Database account created (Vercel Postgres OR Supabase)
- [ ] API keys obtained and stored securely
- [ ] `.env` file created with actual values
- [ ] NEXTAUTH_SECRET generated and added to `.env`

## 📝 Notes

### Security Best Practices

- **Never** commit `.env` file to Git (it's in `.gitignore`)
- **Never** share API keys publicly
- Rotate API keys if they're accidentally exposed
- Use different API keys for development and production

### Next Steps After Phase 0

Once Phase 0 is complete, you'll move to **Phase 1: Foundation**, which includes:

1. Initialize Next.js 14 project with TypeScript
2. Set up project structure
3. Configure Tailwind CSS
4. Set up Prisma with PostgreSQL
5. Implement NextAuth.js authentication

### Troubleshooting

**Git not found**: Ensure Git is installed and in your PATH

```bash
git --version
```

**Node.js version too old**: Download latest LTS from https://nodejs.org/

**Can't generate NEXTAUTH_SECRET**: Ensure OpenSSL is installed

```bash
openssl version
```

**Database connection issues**: Verify your connection string format and credentials

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)

---

**Phase 0 Status**: In Progress
**Estimated Time**: 1-2 hours
**Dependencies**: None
**Blocking**: None
