# Technical Documentation

## Technologies Used

### Frontend Stack

- **Framework**: Next.js 14+ (App Router)

  - React Server Components (RSC)
  - File-based routing
  - API routes for backend logic
  - Built-in optimization (image, font, script)

- **Language**: TypeScript 5+

  - Strict type checking enabled
  - Interface definitions for all data models
  - Type-safe API responses

- **Styling**: Tailwind CSS 3+
  - Utility-first CSS framework
  - Responsive design utilities
  - Custom theme configuration
  - PostCSS for processing

### Backend Stack

- **Runtime**: Node.js 18+

  - Server-side JavaScript execution
  - npm or pnpm package manager

- **API Layer**: Next.js API Routes

  - Route handlers in `/app/api/*`
  - Server Actions for form handling
  - Built-in request/response handling

- **Authentication**: NextAuth.js v5

  - Credentials provider for email/password
  - JWT-based sessions
  - Middleware for route protection
  - CSRF protection built-in

- **Database**: PostgreSQL 14.20 (Homebrew)

  - ACID-compliant relational database
  - Local development setup on port 5432
  - User: thiagoricci
  - Database name: property_maintenance
  - Connection pooling via Prisma

- **ORM**: Prisma 5+
  - Type-safe database client
  - Schema-first approach
  - Automatic migrations
  - Query builder with TypeScript support

### AI Integration

- **SDK**: Vercel AI SDK

  - Streaming responses support
  - Provider-agnostic API
  - Built-in error handling

- **AI Provider**: OpenAI GPT-4 or Anthropic Claude (configurable)
  - Model selection via environment variable
  - Structured output parsing
  - Timeout handling

### Development Tools

- **Version Control**: Git

  - GitHub for remote repository
  - Branching strategy: main for production
  - Commit messages following conventional commits

- **Code Quality**: ESLint + Prettier

  - Linting for code consistency
  - Formatting for style consistency
  - Pre-commit hooks (optional)

- **Testing**: (To be added post-MVP)
  - Jest for unit tests
  - React Testing Library for component tests
  - Playwright for E2E tests

## Development Setup

### Prerequisites

```bash
# Required software
- Node.js 18+ (LTS recommended)
- npm 9+ or pnpm 8+
- Git
- PostgreSQL client (optional, for local development)
```

### Installation Steps

```bash
# 1. Clone repository
git clone <repository-url>
cd property-maintenance

# 2. Install dependencies
npm install
# or
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your values

# 4. Set up database
npx prisma generate
npx prisma migrate dev

# 5. Run development server
npm run dev
# or
pnpm dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# AI Provider (choose one)
OPENAI_API_KEY="sk-..."
# OR
ANTHROPIC_API_KEY="sk-ant-..."

# Optional: Node environment
NODE_ENV="development"
```

## Technical Constraints

### Performance Requirements

- **Page Load Time**: < 2 seconds
- **AI Analysis Response**: < 5 seconds
- **Database Query**: < 500ms
- **Lighthouse Score**: > 70 (MVP target)

### Scalability Constraints

- **Concurrent Users**: 10+ (MVP target)
- **Database Connections**: Pooling via Prisma (max 10 connections)
- **API Rate Limit**: 10 requests/minute per IP
- **Session Duration**: 7 days (configurable)

### Browser Support

- **Primary**: Chrome, Firefox, Safari (latest 2 versions)
- **Secondary**: Edge (latest version)
- **Mobile**: Works but not optimized for MVP

### Platform Constraints

- **Deployment**: Vercel only (for MVP)
- **Database**: PostgreSQL only (no MySQL, MongoDB, etc.)
- **AI Provider**: Single provider (no fallback for MVP)
- **Authentication**: Credentials only (no OAuth for MVP)

## Dependencies

### Core Dependencies

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "next-auth": "5.x",
    "@prisma/client": "5.x",
    "ai": "^3.x",
    "zod": "^3.x"
  }
}
```

### Development Dependencies

```json
{
  "devDependencies": {
    "typescript": "5.x",
    "@types/node": "20.x",
    "@types/react": "18.x",
    "@types/react-dom": "18.x",
    "prisma": "5.x",
    "tailwindcss": "3.x",
    "postcss": "8.x",
    "autoprefixer": "10.x",
    "eslint": "8.x",
    "eslint-config-next": "14.x",
    "prettier": "3.x"
  }
}
```

### AI Provider Dependencies (Conditional)

```json
{
  "dependencies": {
    // For OpenAI
    "openai": "^4.x",

    // OR for Anthropic
    "@anthropic-ai/sdk": "^0.x"
  }
}
```

## Tool Usage Patterns

### Database Operations

**Prisma Client Usage**:

```typescript
import { prisma } from "@/lib/prisma";

// Create
const user = await prisma.user.create({
  data: { email, name, password: hashedPassword },
});

// Read
const requests = await prisma.maintenanceRequest.findMany({
  where: { userId },
  orderBy: { createdAt: "desc" },
});

// Update
await prisma.maintenanceRequest.update({
  where: { id },
  data: { status: "analyzed" },
});

// Delete
await prisma.maintenanceRequest.delete({
  where: { id },
});
```

### Authentication Patterns

**NextAuth Configuration**:

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // Verify credentials and return user
      },
    }),
  ],
  session: { strategy: "jwt" },
});
```

**Session Validation in API Routes**:

```typescript
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  // Proceed with authenticated request
}
```

### AI Integration Patterns

**Vercel AI SDK Usage**:

```typescript
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(request: Request) {
  const { description } = await request.json();

  const { text } = await generateText({
    model: openai("gpt-4"),
    system: "You are a property maintenance analyst...",
    prompt: description,
    maxTokens: 500,
    timeout: 10000,
  });

  // Parse and return structured response
}
```

### Form Validation Patterns

**Zod Schema Validation**:

```typescript
import { z } from "zod";

const maintenanceRequestSchema = z.object({
  description: z.string().min(10).max(2000),
  propertyAddress: z.string().optional(),
  category: z
    .enum(["Plumbing", "Electrical", "HVAC", "Structural", "Other"])
    .optional(),
});

// Usage
const validatedData = maintenanceRequestSchema.parse(formData);
```

### Server Actions Pattern

```typescript
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createMaintenanceRequest(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const request = await prisma.maintenanceRequest.create({
    data: {
      userId: session.user.id,
      description: formData.get("description") as string,
    },
  });

  return request;
}
```

## Build and Deployment

### Build Commands

```bash
# Development
npm run dev          # Start dev server on port 3000

# Production build
npm run build        # Build for production
npm start            # Start production server

# Database
npx prisma generate  # Generate Prisma client
npx prisma migrate dev    # Create and apply migration
npx prisma migrate deploy  # Apply migration (production)
npx prisma studio    # Open Prisma Studio (database GUI)

# Code quality
npm run lint         # Run ESLint
npm run format       # Run Prettier
```

### Deployment Process

**Vercel Deployment**:

1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Push to main branch triggers automatic deployment
4. Prisma migrations run automatically via build script
5. Zero-downtime deployments

**Environment-Specific Configurations**:

```javascript
// next.config.mjs
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [], // Add external image domains if needed
  },
};

export default nextConfig;
```

## Security Best Practices

### Environment Variables

- Never commit `.env` files
- Use `.env.example` as template
- All secrets in Vercel dashboard
- Rotate secrets regularly

### Password Security

- Hash with bcrypt (cost factor 10)
- Never store plain-text passwords
- Use NextAuth's built-in hashing
- Enforce minimum password length (8 chars)

### API Security

- Validate all inputs with Zod
- Sanitize user data
- Rate limit API routes
- Use HTTPS only in production
- Never expose stack traces

### Database Security

- Use parameterized queries (Prisma handles this)
- Implement row-level security (userId filtering)
- Regular backups (Vercel handles this)
- Encrypt sensitive data at rest

## Troubleshooting

### Common Issues

**Prisma Client Not Generated**:

```bash
npx prisma generate
```

**Database Connection Failed**:

- Check DATABASE_URL in `.env`
- Verify PostgreSQL is running
- Check network connectivity

**NextAuth Session Issues**:

- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches current domain
- Clear browser cookies

**AI API Timeout**:

- Increase timeout in API route
- Check API key validity
- Verify network connectivity

### Debug Mode

Enable debug logging:

```bash
# Prisma debug
DEBUG="prisma:*" npm run dev

# NextAuth debug
NEXTAUTH_DEBUG=true npm run dev
```

## Performance Optimization

### Frontend Optimization

- Use Server Components by default
- Implement code splitting with dynamic imports
- Optimize images with Next.js Image component
- Lazy load non-critical components
- Minimize client-side JavaScript

### Backend Optimization

- Use database indexes (userId, createdAt)
- Implement query result caching
- Use connection pooling (Prisma default)
- Optimize AI prompts for faster responses
- Implement pagination for large datasets

### Monitoring

- Vercel Analytics for performance metrics
- Database query logs (Prisma)
- AI API usage monitoring
- Error tracking (to be added post-MVP)

## Future Technical Considerations

### Phase 2 Enhancements

- Redis for session caching
- CDN for static assets
- Database read replicas
- API response caching

### Phase 3 Enhancements

- Microservices architecture
- Event-driven notifications
- Background job processing
- Advanced monitoring and logging
