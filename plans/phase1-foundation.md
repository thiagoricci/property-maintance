# Phase 1: Project Foundation - Implementation Plan

## Overview

Initialize the Next.js 14 project with all required dependencies, database setup, and project structure for the AI-Assisted Property Maintenance Tool MVP.

## Technology Decisions

- **AI Provider**: OpenAI GPT-4 (with Vercel AI SDK for easy switching to Gemini/Anthropic later)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 with credentials provider
- **Styling**: Tailwind CSS

## Implementation Steps

### Step 1: Initialize Next.js Project

**Command:**

```bash
npx create-next-app@latest .
```

**Configuration Options:**

- ✅ TypeScript: Yes
- ✅ ESLint: Yes
- ✅ Tailwind CSS: Yes
- ✅ src/ directory: No
- ✅ App Router: Yes
- ✅ Import alias: Yes (@/\*)

**Expected Output:**

- Next.js project initialized in current directory
- package.json with Next.js 14, React 18, TypeScript, Tailwind CSS
- Basic file structure created
- Configuration files: next.config.mjs, tailwind.config.ts, tsconfig.json

---

### Step 2: Install Required Dependencies

**AI SDK:**

```bash
npm install ai @ai-sdk/openai
```

**Authentication:**

```bash
npm install next-auth@beta
```

**Database:**

```bash
npm install prisma @prisma/client
```

**Additional Utilities:**

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

**Validation (for later phases):**

```bash
npm install zod
```

**Expected Output:**

- All packages installed in node_modules
- package.json updated with dependencies
- No installation errors

---

### Step 3: Create Environment Files

**Create .env.local:**

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/property_maintenance"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key-here"

# Optional: Node environment
NODE_ENV="development"
```

**Create .env.example:**

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# NextAuth
NEXTAUTH_SECRET="your-secret-here-generate-with-openssl"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-..."

# Optional: Node environment
NODE_ENV="development"
```

**Generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

**Expected Output:**

- .env.local created with placeholders
- .env.example created for repository
- .env.local added to .gitignore (if not already)

---

### Step 4: Initialize Prisma & Create Database Schema

**Initialize Prisma:**

```bash
npx prisma init
```

**Create prisma/schema.prisma:**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  requests  MaintenanceRequest[]
}

model MaintenanceRequest {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])

  // Input fields
  description     String
  propertyAddress String?
  category        String?

  // AI Analysis output
  diagnosis       String?
  urgency         String?  // "low" | "medium" | "high"
  estimatedCost   String?
  contractorType  String?
  nextSteps       String?

  // Metadata
  status          String   @default("pending") // "pending" | "analyzed" | "archived"
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
  @@index([createdAt])
}
```

**Generate Prisma Client:**

```bash
npx prisma generate
```

**Create Database Tables:**

```bash
npx prisma db push
```

**Expected Output:**

- prisma/schema.prisma created with User and MaintenanceRequest models
- Prisma client generated in node_modules
- Database tables created in PostgreSQL
- No schema errors

---

### Step 5: Create Project Folder Structure

**Create directories:**

```bash
mkdir -p app/api/auth
mkdir -p app/api/maintenance
mkdir -p app/\(auth\)/login
mkdir -p app/\(auth\)/signup
mkdir -p app/\(dashboard\)/dashboard
mkdir -p app/\(dashboard\)/requests/new
mkdir -p app/\(dashboard\)/requests/\[id\]
mkdir -p components/ui
mkdir -p components/auth
mkdir -p components/dashboard
mkdir -p components/maintenance
mkdir -p lib/ai
mkdir -p prisma/migrations
mkdir -p public
```

**Create placeholder files:**

**Root layout:**

```typescript
// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Property Maintenance AI",
  description: "AI-powered property maintenance analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

**Homepage:**

```typescript
// app/page.tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Property Maintenance AI</h1>
        <p className="text-gray-600 mb-8">
          AI-powered property maintenance analysis
        </p>
        <div className="space-x-4">
          <a href="/login" className="px-6 py-2 bg-blue-600 text-white rounded">
            Login
          </a>
          <a
            href="/signup"
            className="px-6 py-2 border border-blue-600 text-blue-600 rounded"
          >
            Sign Up
          </a>
        </div>
      </div>
    </main>
  );
}
```

**Prisma client singleton:**

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**AI prompts:**

```typescript
// lib/ai/prompts.ts
export const MAINTENANCE_ANALYSIS_SYSTEM_PROMPT = `You are a professional property maintenance analyst. Analyze maintenance issues and provide structured recommendations.

For each maintenance issue description, provide:

1. DIAGNOSIS: Identify the likely problem in 1-2 sentences
2. URGENCY: Classify as LOW, MEDIUM, or HIGH
   - HIGH: Safety hazard, major damage risk, or essential service outage
   - MEDIUM: Affects daily function, could worsen quickly
   - LOW: Minor issue, cosmetic, or can wait for scheduled maintenance
3. ESTIMATED COST: Provide a realistic range in USD (e.g., $150-$400)
4. CONTRACTOR TYPE: Specify what professional is needed (plumber, electrician, HVAC, general contractor, etc.)
5. NEXT STEPS: List 2-3 specific, actionable recommendations

Be concise, practical, and helpful. Base estimates on typical market rates.`;
```

**Validation schemas:**

```typescript
// lib/validations.ts
import { z } from "zod";

export const maintenanceRequestSchema = z.object({
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000),
  propertyAddress: z.string().optional(),
  category: z
    .enum(["Plumbing", "Electrical", "HVAC", "Structural", "Other"])
    .optional(),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
```

**NextAuth configuration:**

```typescript
// lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
});
```

**Auth API route:**

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

**Placeholder pages:**

```typescript
// app/(auth)/login/page.tsx
export default function LoginPage() {
  return <div>Login Page - To be implemented</div>;
}

// app/(auth)/signup/page.tsx
export default function SignupPage() {
  return <div>Signup Page - To be implemented</div>;
}

// app/(dashboard)/dashboard/page.tsx
export default function DashboardPage() {
  return <div>Dashboard - To be implemented</div>;
}

// app/(dashboard)/requests/new/page.tsx
export default function NewRequestPage() {
  return <div>New Request Form - To be implemented</div>;
}

// app/(dashboard)/requests/[id]/page.tsx
export default function RequestDetailPage() {
  return <div>Request Detail - To be implemented</div>;
}
```

**Dashboard layout:**

```typescript
// app/(dashboard)/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Property Maintenance AI</h1>
          <nav className="space-x-4">
            <a href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </a>
            <button className="text-gray-600 hover:text-gray-900">
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
```

**Expected Output:**

- Complete folder structure created
- All placeholder files created
- Prisma client singleton configured
- NextAuth configured with credentials provider
- Validation schemas defined
- AI system prompt defined

---

### Step 6: Verify Setup

**Start development server:**

```bash
npm run dev
```

**Expected Results:**

- Server starts on http://localhost:3000
- No TypeScript errors
- Homepage loads with "Property Maintenance AI" title
- Login and Signup buttons visible

**Test database connection:**

```bash
npx prisma studio
```

**Expected Results:**

- Prisma Studio opens in browser
- Can view User and MaintenanceRequest tables
- No connection errors

---

## Completion Criteria

Phase 1 is complete when:

- ✅ Next.js 14 project initialized with TypeScript and App Router
- ✅ All dependencies installed (AI SDK, NextAuth, Prisma, bcryptjs)
- ✅ Environment files created (.env.local and .env.example)
- ✅ Prisma initialized with User and MaintenanceRequest models
- ✅ Database tables created in PostgreSQL
- ✅ Project folder structure created (app, components, lib, prisma)
- ✅ Project runs with `npm run dev` without errors
- ✅ No TypeScript errors
- ✅ Database connection successful (verified via Prisma Studio)

---

## Next Steps (Phase 2)

After Phase 1 completion:

1. Implement authentication pages (login, signup)
2. Create protected route middleware
3. Build maintenance request form
4. Implement AI analysis API endpoint
5. Create results display page

---

## Troubleshooting

**Issue: `npx create-next-app` fails**

- Ensure Node.js 18+ is installed: `node --version`
- Clear npm cache: `npm cache clean --force`

**Issue: Prisma connection fails**

- Verify DATABASE_URL in .env.local
- Ensure PostgreSQL is running
- Check network connectivity

**Issue: TypeScript errors**

- Run `npm run build` to see all errors
- Ensure tsconfig.json is correct
- Restart TypeScript server in VSCode

**Issue: Environment variables not loading**

- Restart development server after creating .env.local
- Verify .env.local is in project root
- Check .gitignore doesn't exclude .env.local

---

## Notes

- This phase focuses on foundation setup only
- No authentication logic implementation yet (Phase 2)
- No AI integration yet (Phase 2)
- Database is ready but empty
- All placeholder files will be implemented in subsequent phases
- The Vercel AI SDK makes switching AI providers trivial - just change the import and model initialization
