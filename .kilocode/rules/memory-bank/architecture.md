# Architecture Documentation

## System Architecture

The AI-Assisted Property Maintenance Tool follows a modern full-stack web architecture built on Next.js 14 with the App Router pattern.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  Next.js 14 App Router (React Server Components + RSC)       │
│  - Pages: Homepage, Login/Signup, Dashboard, Forms          │
│  - UI Components: Cards, Badges, Buttons, Forms              │
│  - State Management: React hooks + Server Actions           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Route Handlers)              │
│  Next.js API Routes (/api/*)                                 │
│  - /api/auth/* - Authentication endpoints                   │
│  - /api/maintenance/* - Maintenance request endpoints       │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│    External Services        │   │      Database Layer         │
│  - NextAuth.js (Auth)       │   │  PostgreSQL + Prisma ORM    │
│  - Vercel AI SDK (AI)       │   │  - User model               │
│  - OpenAI/Anthropic API     │   │  - MaintenanceRequest model │
└─────────────────────────────┘   └─────────────────────────────┘
```

## Source Code Paths

Actual directory structure (completed during Phase 1-5):

```
property-maintenance/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── login-page.tsx        # Legacy login component
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── requests/
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── analysis/
│   │   │   └── page.tsx
│   │   └── layout.tsx            # Dashboard layout with header
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts
│   │   │   └── signup/
│   │   │       └── route.ts
│   │   └── maintenance/
│   │       ├── analyze/route.ts
│   │       ├── save/route.ts
│   │       ├── list/route.ts
│   │       └── [id]/route.ts
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   └── globals.css               # Global styles
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components
│   │   ├── alert.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── error-boundary.tsx
│   │   ├── index.ts
│   │   ├── input.tsx
│   │   ├── loading-spinner.tsx
│   │   ├── modal.tsx
│   │   ├── password-strength-indicator.tsx
│   │   ├── skeleton-card.tsx
│   │   ├── skeleton-text.tsx
│   │   ├── toast-provider.tsx
│   │   └── toast.tsx
│   └── providers.tsx             # React providers
├── lib/                          # Utility functions and configurations
│   ├── auth.ts                   # NextAuth configuration
│   ├── db.ts                     # Database connection utilities
│   ├── prisma.ts                 # Prisma client singleton
│   ├── ai.ts                     # AI integration utilities
│   ├── ai/
│   │   └── prompts.ts            # AI system prompts
│   ├── validations.ts             # Input validation schemas
│   └── hooks/
│       └── use-password-strength.ts
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/              # Database migrations
├── public/                       # Static assets
│   └── favicon.ico              # Browser tab icon
├── middleware.ts                 # Route protection middleware
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── postcss.config.js             # PostCSS configuration
├── package.json                 # Dependencies and scripts
└── .env.example                 # Environment variables template
```

## Key Technical Decisions

### Frontend Framework: Next.js 14 (App Router)

**Rationale**:

- Server Components for better performance and SEO
- Built-in API routes for backend logic
- File-based routing for intuitive structure
- Excellent TypeScript support
- Vercel deployment optimization

**Implications**:

- Most pages will use Server Components by default
- Client Components only where interactivity needed
- API routes handle server-side logic
- Streaming and progressive rendering capabilities

### Authentication: NextAuth.js v5

**Rationale**:

- Battle-tested authentication library
- Credentials provider for email/password auth
- Session management built-in
- CSRF protection included
- Easy integration with Next.js

**Implementation**:

- Credentials provider for email/password
- Session stored in JWT (stateless)
- Middleware for route protection
- Password hashing with bcrypt

### Database: PostgreSQL + Prisma ORM

**Rationale**:

- PostgreSQL: Robust, ACID-compliant, scalable
- Prisma: Type-safe database client, excellent DX
- Migration system for schema changes
- Easy to switch databases if needed
- Excellent TypeScript integration

**Current Setup**:

- PostgreSQL 14.20 (Homebrew)
- Local development on port 5432
- User: thiagoricci
- Database name: property_maintenance
- Connection string: `postgresql://thiagoricci@localhost:5432/property_maintenance`
- Tables created: User, MaintenanceRequest

**Schema Design**:

- User model with email, name, hashed password
- MaintenanceRequest model with relation to User
- Indexes on userId and createdAt for performance
- Status field for request lifecycle tracking

### AI Integration: Vercel AI SDK

**Rationale**:

- Official Vercel SDK for AI integration
- Streaming support for better UX
- Type-safe API
- Easy provider switching (OpenAI/Anthropic)
- Built-in error handling

**Implementation**:

- System prompt for property maintenance analysis
- Structured output parsing
- Timeout handling (10s max)
- Fallback error handling

### Styling: Tailwind CSS

**Rationale**:

- Utility-first approach for rapid development
- Consistent design system
- No custom CSS needed for most components
- Excellent performance (purge unused styles)
- Easy responsive design

**Design System**:

- Primary color: blue-600 (configurable)
- Clear hierarchy with spacing scale
- Component variants for buttons, inputs
- Responsive breakpoints: sm, md, lg, xl

## Design Patterns in Use

### 1. Route Groups for Organization

Next.js App Router route groups `(auth)` and `(dashboard)` organize related routes without affecting URL structure. This enables:

- Shared layouts within groups
- Logical code organization
- Route protection at group level

### 2. Server Actions for Form Handling

Next.js Server Actions will be used for form submissions to:

- Reduce client-side JavaScript
- Handle server-side validation
- Direct database mutations
- Better security (no exposed API endpoints)

### 3. Repository Pattern (Planned)

For database operations, a repository pattern will abstract Prisma calls:

- Centralized query logic
- Easier testing with mocks
- Consistent error handling
- Transaction management

### 4. Error Boundary Pattern

React Error Boundaries will wrap key routes to:

- Catch and display errors gracefully
- Prevent app crashes
- Provide recovery options
- Log errors for debugging

## Component Relationships

### Authentication Flow

```
Homepage → Login/Signup Page → NextAuth → Dashboard (Protected)
                                              ↓
                                        Middleware checks session
                                              ↓
                                    Redirect to login if not authenticated
```

### Maintenance Request Flow

```
Dashboard → New Request Form → Submit → AI Analysis API → Display Results
                                                    ↓
                                              Save to Database
                                                    ↓
                                            Update Request History
```

### Request History Flow

```
Dashboard → Request List (filtered) → Click Request → Request Detail View
        ↑                                                   ↓
        └───────────────────────────────────────────────────┘
                        (Back navigation)
```

## Critical Implementation Paths

### 1. Authentication Path

**Entry Point**: User visits `/login` or `/signup`

**Flow**:

1. User enters credentials
2. Form validates client-side
3. Server Action calls NextAuth
4. NextAuth verifies credentials
5. Session created and stored
6. User redirected to `/dashboard`
7. Middleware validates session on protected routes

**Critical Files**:

- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `lib/auth.ts` (NextAuth config)
- `middleware.ts` (Route protection)

### 2. AI Analysis Path

**Entry Point**: User submits maintenance request form

**Flow**:

1. Form validates input
2. Server Action calls `/api/maintenance/analyze`
3. API route constructs prompt with user input
4. Vercel AI SDK calls OpenAI/Anthropic
5. AI returns structured response
6. API parses and validates response
7. Results returned to client
8. Client displays analysis

**Critical Files**:

- `app/(dashboard)/requests/new/page.tsx`
- `app/api/maintenance/analyze/route.ts`
- `lib/ai/prompts.ts`
- `lib/validations.ts`

### 3. Database Persistence Path

**Entry Point**: User clicks "Save to History"

**Flow**:

1. Client sends request data to `/api/maintenance/save`
2. API validates session
3. API validates request data
4. Prisma creates MaintenanceRequest record
5. Record linked to authenticated User
6. Success response returned
7. Client redirects to dashboard

**Critical Files**:

- `app/api/maintenance/save/route.ts`
- `prisma/schema.prisma`
- `lib/prisma.ts`

### 4. Request Retrieval Path

**Entry Point**: User navigates to dashboard

**Flow**:

1. Client requests `/api/maintenance/list`
2. API validates session
3. Prisma queries MaintenanceRequest records for user
4. Records sorted by createdAt (newest first)
5. Filter applied if specified
6. Pagination applied if needed
7. Results returned to client
8. Client renders request list

**Critical Files**:

- `app/(dashboard)/dashboard/page.tsx`
- `app/api/maintenance/list/route.ts`

## Security Architecture

### Authentication Security

- Passwords hashed with bcrypt (cost factor 10)
- Session tokens stored in HTTP-only cookies
- CSRF protection via NextAuth
- Session expiration: 7 days (configurable)

### API Security

- All API routes validate sessions
- Rate limiting: 10 requests/minute per IP
- Input validation on all endpoints
- SQL injection prevention via Prisma
- XSS prevention via React escaping

### Data Security

- Environment variables for secrets
- Database connection string encrypted
- AI API keys never exposed to client
- User data isolated by userId

## Performance Considerations

### Frontend Performance

- Server Components reduce client-side JS
- Image optimization with Next.js Image component
- Code splitting via dynamic imports
- Lazy loading for non-critical components

### Backend Performance

- Database connection pooling via Prisma
- Indexed queries (userId, createdAt)
- Response caching where appropriate
- Streaming for AI responses

### Scalability

- Stateless authentication (JWT)
- Database connection pooling
- CDN for static assets (Vercel)
- Horizontal scaling via Vercel

## Deployment Architecture

### Production Environment

- **Platform**: Vercel
- **Database**: Vercel Postgres or Supabase
- **Environment Variables**: Configured in Vercel dashboard
- **Domain**: Custom domain or Vercel subdomain
- **SSL**: Automatic HTTPS

### Deployment Pipeline

1. Push code to GitHub
2. Vercel automatically deploys on push to main branch
3. Prisma migrations run automatically
4. Environment variables injected
5. Zero-downtime deployments

### Monitoring & Observability

- Vercel Analytics for performance
- Error tracking (to be added post-MVP)
- Database query logs (Prisma)
- AI API usage monitoring

## Future Architecture Considerations

### Phase 2 Enhancements

- Redis for session management (if stateful sessions needed)
- CDN for static assets optimization
- Database read replicas for scaling
- Caching layer for AI responses

### Phase 3 Enhancements

- Microservices architecture for specific features
- Event-driven architecture for notifications
- Message queue for background jobs
- Separate AI service for better isolation

## Known Technical Debt

### Resolved Issues

1. **Prisma Build Initialization Error (Resolved - January 7, 2026)**
   - **Issue**: Prisma Client imported at top level in API routes caused build failures on Vercel
   - **Fix**: Changed to lazy imports using `const { prisma } = await import("@/lib/prisma")`
   - **Impact**: Build now completes successfully on Vercel
   - **Files Modified**: All API routes using Prisma

### Current Technical Debt

1. **No Automated Testing**

   - No unit tests, integration tests, or E2E tests
   - **Priority**: Medium (post-MVP)
   - **Plan**: Add Jest for unit tests, Playwright for E2E tests

2. **Limited Error Tracking**

   - No centralized error logging or monitoring
   - **Priority**: Medium (post-MVP)
   - **Plan**: Integrate Sentry or similar error tracking service

3. **No Analytics**

   - No user behavior analytics or usage metrics
   - **Priority**: Low (post-MVP)
   - **Plan**: Add Google Analytics or Vercel Analytics

4. **Basic Rate Limiting**

   - Simple IP-based rate limiting without sophisticated protection
   - **Priority**: Low (post-MVP)
   - **Plan**: Implement Redis-based rate limiting with user quotas

5. **No Background Job Processing**
   - All AI analysis happens synchronously in API routes
   - **Priority**: Low (post-MVP)
   - **Plan**: Add queue system for long-running tasks

## Notes

- Architecture designed for rapid MVP development
- Focus on simplicity over complex patterns
- Prioritize developer experience and maintainability
- Document patterns as they emerge during development
- All critical build issues resolved
- Application is production-ready for MVP launch
