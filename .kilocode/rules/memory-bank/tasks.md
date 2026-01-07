# Repetitive Tasks Documentation

This file documents repetitive tasks and their workflows for future reference.

---

## Fix Prisma Build Initialization Error

**Last performed:** January 7, 2026
**Files to modify:**

- All API route files that import Prisma at the top level
- [`lib/auth.ts`](lib/auth.ts:1) - If it uses Prisma in NextAuth authorize function
- [`app/api/auth/signup/route.ts`](app/api/auth/signup/route.ts:1) - User signup endpoint
- [`app/api/maintenance/save/route.ts`](app/api/maintenance/save/route.ts:1) - Save maintenance request endpoint
- [`app/api/maintenance/list/route.ts`](app/api/maintenance/list/route.ts:1) - List requests endpoint
- [`app/api/maintenance/[id]/route.ts`](app/api/maintenance/[id]/route.ts:1) - Get/delete request endpoint

**Steps:**

1. Identify all API route files that import Prisma at the top level: `import { prisma } from "@/lib/prisma";`
2. Remove the top-level import statement
3. Add lazy import inside the function that uses Prisma: `const { prisma } = await import("@/lib/prisma");`
4. Ensure the import is placed before the first Prisma query in the function
5. Test the build locally with `npm run build` to verify the fix

**Important notes:**

- This fix is required for Vercel deployments where DATABASE_URL is not available during build time
- Prisma Client attempts to initialize when imported, which fails without DATABASE_URL
- Lazy loading ensures Prisma initializes only at runtime when the environment variable is available
- This pattern should be followed for ALL new API routes that use Prisma
- The fix does not affect functionality - Prisma works exactly the same, just loads later

**Example of completed implementation:**

```typescript
// BEFORE (causes build error):
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await prisma.user.findUnique({
    where: { email: "test@example.com" },
  });
  // ...
}

// AFTER (builds successfully):
export async function POST(request: Request) {
  const { prisma } = await import("@/lib/prisma");

  const user = await prisma.user.findUnique({
    where: { email: "test@example.com" },
  });
  // ...
}
```

---

## Common Development Patterns

## Task Template

When adding a new task, use this format:

````markdown
## [Task Name]

**Last performed:** [date]
**Files to modify:**

- `/path/to/file1` - Description of changes
- `/path/to/file2` - Description of changes

**Steps:**

1. First step description
2. Second step description
3. Third step description

**Important notes:**

- Important consideration 1
- Important consideration 2

**Example of completed implementation:**

```typescript
// Example code showing the completed task
```
````

```

---

## Common Development Patterns

### Adding New API Endpoints

When adding new API routes, follow this pattern:

1. Create route file in `app/api/[category]/[endpoint]/route.ts`
2. Add session validation using `auth()` from `@/lib/auth`
3. Implement request validation using Zod schemas
4. Add database operations using **lazy-loaded** Prisma client (see "Fix Prisma Build Initialization Error" above)
5. Return appropriate HTTP status codes and error messages

### Adding New UI Components

When adding new UI components, follow this pattern:

1. Create component in `components/[category]/[ComponentName].tsx`
2. Use TypeScript interfaces for props
3. Implement responsive design with Tailwind CSS
4. Add loading and error states
5. Export from `components/index.ts` for easy imports

### Database Schema Changes

When modifying the database schema:

1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev` to create migration
3. Review generated migration file
4. Run `npx prisma generate` to update client
5. Update TypeScript interfaces if needed
6. Test changes locally before committing

---

**Note**: This file will be populated with specific tasks as development progresses and repetitive patterns are identified.
```
