# Repetitive Tasks Documentation

This file documents repetitive tasks and their workflows for future reference.

_No repetitive tasks documented yet. This file will be updated as patterns emerge during development._

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
4. Add database operations using Prisma client
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
