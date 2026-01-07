# Phase 4: Request History Implementation Plan

## Overview

Implement the request history feature that allows users to view, filter, and manage their maintenance requests.

## Current State

- ✅ Phase 2: Authentication complete (signup, login, logout, middleware)
- ✅ Phase 3: AI Analysis Engine complete (form, analysis, save to database)
- 🔄 Phase 4: Request History (in progress)

## Implementation Steps

### Step 1: Create List Requests API Endpoint

**File**: `app/api/maintenance/list/route.ts`

**Requirements**:

- GET endpoint to fetch all user's maintenance requests
- Validate user session
- Support filtering by urgency via query parameter (?urgency=high|medium|low)
- Order by createdAt DESC (newest first)
- Return array of request objects
- Include pagination logic (optional for MVP, but good to have)

**API Response Structure**:

```typescript
{
  success: true,
  data: [
    {
      id: string,
      description: string,
      propertyAddress: string | null,
      category: string | null,
      diagnosis: string,
      urgency: "low" | "medium" | "high",
      estimatedCost: string | null,
      contractorType: string | null,
      nextSteps: string | null,
      status: string,
      createdAt: string,
      updatedAt: string
    }
  ],
  count: number
}
```

**Error Handling**:

- 401: Unauthorized (no session)
- 500: Server error

### Step 2: Create Get Single Request API Endpoint

**File**: `app/api/maintenance/[id]/route.ts`

**Requirements**:

- GET endpoint to fetch a single request by ID
- Validate user session
- Verify user owns the request (security check)
- Return full request details or 404 if not found
- Return 403 if user doesn't own request

**API Response Structure**:

```typescript
{
  success: true,
  data: {
    id: string,
    description: string,
    propertyAddress: string | null,
    category: string | null,
    diagnosis: string,
    urgency: "low" | "medium" | "high",
    estimatedCost: string | null,
    contractorType: string | null,
    nextSteps: string | null,
    status: string,
    createdAt: string,
    updatedAt: string
  }
}
```

**Error Handling**:

- 401: Unauthorized (no session)
- 403: Forbidden (user doesn't own request)
- 404: Request not found
- 500: Server error

### Step 3: Update Dashboard Page

**File**: `app/(dashboard)/dashboard/page.tsx`

**Requirements**:

- Keep existing welcome section and "New Request" CTA
- Replace "Coming Soon" placeholder with actual request history
- Add filter buttons: All | High | Medium | Low
- Display request cards with:
  - Date (formatted nicely)
  - Truncated description (first 100 chars)
  - Urgency badge (color-coded)
  - Status
- Click on request to view details (navigate to /requests/[id])
- Empty state if no requests yet
- Show count of filtered results

**UI Components**:

- Filter button group (highlight active filter)
- Request card grid/list
- Empty state with illustration
- Loading states
- Error states

**State Management**:

- `requests`: array of request objects
- `filter`: current filter (all, high, medium, low)
- `isLoading`: boolean
- `error`: string | null

### Step 4: Update Request Detail Page

**File**: `app/(dashboard)/requests/[id]/page.tsx`

**Requirements**:

- Fetch single request by ID from database
- Display complete request information:
  - Original description
  - Property address (if provided)
  - Category (if provided)
  - All 5 AI analysis components (diagnosis, urgency, cost, contractor, next steps)
  - Timestamps (created, updated)
- Show urgency with color-coded badge
- "Back to Dashboard" button
- Optional: "Delete Request" button (nice to have)
- Loading and error states

**UI Layout**:

- Header with title and back button
- Original request info card
- AI analysis cards (similar to analysis page)
- Timestamps section
- Action buttons (back, delete)

### Step 5: Testing & Validation

**Test Cases**:

1. Dashboard shows all user requests
2. Filtering by urgency works correctly
3. Clicking request navigates to detail page
4. Detail page shows all information
5. Empty state displays for new users
6. Loading states work properly
7. Error handling works (network errors, unauthorized)
8. Security: User cannot access other users' requests

## Technical Decisions

### Data Fetching Strategy

- Use client-side fetching with `useEffect` for simplicity
- Consider Server Components for better performance (future enhancement)
- Implement proper loading and error states

### Filtering Implementation

- Client-side filtering (fetch all, filter in UI) for MVP
- Server-side filtering via API for better performance (future)
- Show count of filtered results

### Styling Approach

- Consistent with existing Phase 3 styling
- Use Tailwind CSS utility classes
- Color-coded urgency badges (red=high, yellow=medium, green=low)
- Card-based layout for requests
- Responsive design (mobile-friendly)

### Security Considerations

- Always validate session in API routes
- Verify user ownership before returning request data
- Use Prisma's `where` clause to filter by userId
- Never expose other users' requests

## File Structure

```
app/
├── api/
│   └── maintenance/
│       ├── list/
│       │   └── route.ts          (NEW)
│       └── [id]/
│           └── route.ts          (NEW)
├── (dashboard)/
│   ├── dashboard/
│   │   └── page.tsx             (UPDATE)
│   └── requests/
│       └── [id]/
│           └── page.tsx          (UPDATE)
```

## Success Criteria

✅ Dashboard displays all user requests
✅ Filtering by urgency works correctly
✅ User can click to view full request details
✅ Detail page shows all request information
✅ Empty state displays for users with no requests
✅ Loading states work properly
✅ Error handling is robust
✅ Security prevents unauthorized access

## Future Enhancements (Post-MVP)

- Pagination for large datasets
- Search functionality
- Sort by date/urgency
- Edit request functionality
- Export to PDF
- Share request via link
- Delete request functionality
- Bulk actions (archive, delete multiple)
