# Phase 2: Authentication Implementation Plan

## Overview

Implement complete authentication flow including signup, login, route protection, and session management.

## Implementation Steps

### Step 1: Create Signup API Route

**File:** `app/api/auth/signup/route.ts`

**Purpose:** Handle user registration with password hashing and database storage.

**Implementation Details:**

- Validate request body (email, name, password)
- Check if email already exists in database
- Hash password using bcrypt (cost factor 10)
- Create user record in database via Prisma
- Return success/error responses with appropriate HTTP status codes
- Handle duplicate email errors gracefully

**Validation Rules:**

- Email: valid email format, required
- Name: required, min 2 characters
- Password: required, min 8 characters

**Success Response:**

```json
{
  "success": true,
  "user": {
    "id": "cuid...",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**

- 400: Invalid input
- 409: Email already exists
- 500: Server error

---

### Step 2: Implement Full Signup Page

**File:** `app/(auth)/signup/page.tsx`

**Purpose:** User-facing signup form with validation and error handling.

**Implementation Details:**

- Mark as Client Component: `"use client"`
- Form fields: Email, Name, Password
- Client-side validation before submission
- Loading state during API call
- Error message display
- Success redirect to dashboard
- Link to login page for existing users

**Form Features:**

- Real-time validation feedback
- Password visibility toggle (optional)
- Disabled submit button while loading
- Clear error messages
- Success notification

**Styling:**

- Centered card layout
- Tailwind CSS styling
- Responsive design
- Professional appearance

---

### Step 3: Implement Full Login Page

**File:** `app/(auth)/login/page.tsx`

**Purpose:** User-facing login form with NextAuth integration.

**Implementation Details:**

- Mark as Client Component: `"use client"`
- Form fields: Email, Password
- Client-side validation
- Loading state during authentication
- Error message display
- Use NextAuth `signIn` function
- Redirect to dashboard on success
- Link to signup page for new users

**Form Features:**

- Real-time validation
- Password visibility toggle (optional)
- Disabled submit button while loading
- Clear error messages
- Remember me option (optional for MVP)

**Styling:**

- Centered card layout
- Tailwind CSS styling
- Responsive design
- Professional appearance

---

### Step 4: Create Middleware for Route Protection

**File:** `middleware.ts` (root level)

**Purpose:** Protect dashboard routes and redirect unauthenticated users.

**Implementation Details:**

- Import `auth` from `@/lib/auth`
- Define protected routes: `/dashboard/*`
- Define public routes: `/`, `/login`, `/signup`
- Check session on protected routes
- Redirect to `/login` if not authenticated
- Allow authenticated users to access protected routes

**Middleware Logic:**

```typescript
export function middleware(request: NextRequest) {
  const session = await auth();
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup");

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}
```

**Route Configuration:**

```typescript
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

### Step 5: Update Dashboard Layout

**File:** `app/(dashboard)/layout.tsx`

**Purpose:** Display user information and provide logout functionality.

**Implementation Details:**

- Mark as Client Component: `"use client"`
- Get current session using `auth()` from NextAuth
- Display user name in header
- Implement logout button using `signOut()` function
- Redirect to homepage after logout
- Maintain existing layout structure

**Header Features:**

- Logo/brand name
- User name display
- Logout button with hover state
- Navigation links (if needed)

**Logout Logic:**

```typescript
const handleLogout = async () => {
  await signOut({ redirectTo: "/" });
};
```

---

## Testing Checklist

### Signup Flow

- [ ] User can access /signup page
- [ ] Form validates required fields
- [ ] Email format validation works
- [ ] Password minimum length enforced
- [ ] Duplicate email shows error
- [ ] Successful signup redirects to dashboard
- [ ] User is automatically logged in after signup
- [ ] Loading state displays during signup

### Login Flow

- [ ] User can access /login page
- [ ] Form validates required fields
- [ ] Invalid credentials show error
- [ ] Valid credentials log user in
- [ ] Successful login redirects to dashboard
- [ ] Loading state displays during login
- [ ] "Remember me" works (if implemented)

### Route Protection

- [ ] Unauthenticated user redirected from /dashboard to /login
- [ ] Authenticated user can access /dashboard
- [ ] Authenticated user redirected from /login to /dashboard
- [ ] Authenticated user redirected from /signup to /dashboard
- [ ] Public routes (/) accessible without auth

### Session Management

- [ ] Session persists on page refresh
- [ ] Session persists across browser tabs
- [ ] Logout clears session
- [ ] User name displays correctly in dashboard
- [ ] Logout button redirects to homepage

### Error Handling

- [ ] Network errors display user-friendly messages
- [ ] Form validation errors are clear
- [ ] Duplicate signup email shows specific error
- [ ] Invalid login credentials show specific error
- [ ] Loading states prevent double submission

---

## File Structure After Phase 2

```
property-maintenance/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # ✅ Full implementation
│   │   └── signup/
│   │       └── page.tsx          # ✅ Full implementation
│   ├── (dashboard)/
│   │   └── layout.tsx            # ✅ Updated with logout
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/
│   │       │   └── route.ts      # ✅ Already exists
│   │       └── signup/
│   │           └── route.ts      # ✅ New file
│   └── page.tsx                  # ✅ Already exists
├── lib/
│   ├── auth.ts                   # ✅ Already exists
│   └── prisma.ts                 # ✅ Already exists
└── middleware.ts                 # ✅ New file
```

---

## Dependencies Used

- **next-auth**: Authentication framework (v5)
- **bcryptjs**: Password hashing
- **prisma**: Database ORM
- **zod**: Input validation (already in lib/validations.ts)

---

## Security Considerations

1. **Password Security**

   - Hash passwords with bcrypt (cost factor 10)
   - Never store plain-text passwords
   - Enforce minimum password length (8 chars)

2. **Session Security**

   - HTTP-only cookies for session tokens
   - CSRF protection via NextAuth
   - Secure cookie flag in production

3. **Input Validation**

   - Validate all inputs on both client and server
   - Sanitize user data
   - Use parameterized queries (Prisma handles this)

4. **Route Protection**
   - Middleware protects all dashboard routes
   - Session validation on protected routes
   - Redirect unauthenticated users

---

## Success Criteria

Phase 2 is complete when:

✅ User can sign up successfully with valid credentials
✅ User can log in with correct email/password
✅ Invalid login attempts show appropriate errors
✅ Duplicate signup attempts show appropriate errors
✅ Protected routes redirect unauthenticated users to /login
✅ Authenticated users can access /dashboard routes
✅ User can log out successfully
✅ Session persists on page refresh
✅ User name displays in dashboard header
✅ All forms have loading states
✅ All forms have error handling
✅ No console errors in browser

---

## Next Steps After Phase 2

Once Phase 2 is complete and tested, proceed to:

**Phase 3: Maintenance Request Features**

- Build maintenance request form
- Implement AI analysis API endpoint
- Create results display page
- Implement save to database functionality

---

**Phase 2 Estimated Complexity:** Medium
**Files to Create:** 2
**Files to Modify:** 3
**Testing Focus:** Authentication flow, session management, route protection
