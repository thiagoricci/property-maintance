# Phase 3: AI Analysis Engine - Implementation Plan

## Overview

Implement the core AI-powered maintenance analysis features that allow users to submit maintenance requests, receive instant AI analysis, and save results to the database.

## Current State

- ✅ Phase 2 complete: Authentication working, database connected
- ✅ Prisma schema created with User and MaintenanceRequest models
- ✅ Validation schemas defined in lib/validations.ts
- ✅ AI system prompt defined in lib/ai/prompts.ts
- ✅ Vercel AI SDK and OpenAI dependencies installed
- ⏳ Need to implement: AI SDK config, form, API endpoints, results display

## Technical Decisions

- **NextAuth**: v4 (already installed and working)
- **AI Provider**: OpenAI GPT-4 (SDK already installed)
- **Model**: gpt-4-turbo-preview (cost-effective, fast)
- **Timeout**: 10 seconds for AI analysis
- **Response Format**: Structured JSON with 5 components

---

## Implementation Steps

### Step 1: Create lib/ai.ts - AI SDK Configuration

**File**: `lib/ai.ts`

**Purpose**: Configure Vercel AI SDK with OpenAI and export reusable model instance.

**Implementation Details**:

```typescript
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

// Configure OpenAI model
export const aiModel = openai("gpt-4-turbo-preview", {
  // Optional: Add API key validation
});

// Helper function for AI analysis
export async function analyzeMaintenanceRequest(
  description: string,
  context?: string
) {
  const { text } = await generateText({
    model: aiModel,
    system: MAINTENANCE_ANALYSIS_SYSTEM_PROMPT,
    prompt: context
      ? `Property Address: ${context}\n\nIssue Description: ${description}`
      : description,
    maxTokens: 500,
    temperature: 0.7,
    timeout: 10000, // 10 seconds
  });

  return text;
}
```

**Error Handling**:

- Check for OPENAI_API_KEY environment variable
- Throw descriptive error if missing
- Handle API timeouts gracefully
- Log errors for debugging

---

### Step 2: Create Maintenance Request Form

**File**: `app/(dashboard)/requests/new/page.tsx`

**Purpose**: Client-side form for submitting maintenance requests.

**Features**:

1. Large textarea for issue description (required, 10-2000 chars)
2. Optional property address field
3. Optional category dropdown (Plumbing, Electrical, HVAC, Structural, Other)
4. Real-time character counter
5. Client-side validation with error messages
6. Loading state during AI analysis
7. Error handling for API failures

**UI Design**:

- Clean, centered form layout
- Primary "Analyze with AI" button
- Character counter showing "X/2000"
- Validation errors displayed inline
- Loading spinner during processing
- Tailwind CSS styling

**State Management**:

```typescript
const [formData, setFormData] = useState({
  description: "",
  propertyAddress: "",
  category: "",
});
const [errors, setErrors] = useState<Record<string, string>>({});
const [isLoading, setIsLoading] = useState(false);
const [apiError, setApiError] = useState<string | null>(null);
```

**Form Submission Flow**:

1. Validate form client-side
2. Set loading state
3. Call /api/maintenance/analyze
4. Handle success: Navigate to results page with data
5. Handle error: Display error message, reset loading state

---

### Step 3: Create AI Analysis API Endpoint

**File**: `app/api/maintenance/analyze/route.ts`

**Purpose**: Server-side API route that calls OpenAI and returns structured analysis.

**Implementation Details**:

```typescript
export async function POST(request: Request) {
  try {
    // 1. Parse and validate request body
    const body = await request.json();
    const validatedData = maintenanceRequestSchema.parse(body);

    // 2. Construct prompt with context
    const context = validatedData.propertyAddress
      ? `Property Address: ${validatedData.propertyAddress}\nCategory: ${
          validatedData.category || "General"
        }`
      : `Category: ${validatedData.category || "General"}`;

    // 3. Call AI with timeout
    const { text } = await generateText({
      model: openai("gpt-4-turbo-preview"),
      system: MAINTENANCE_ANALYSIS_SYSTEM_PROMPT,
      prompt: `${context}\n\nIssue Description: ${validatedData.description}`,
      maxTokens: 500,
      timeout: 10000,
    });

    // 4. Parse AI response into structured format
    const analysis = parseAIResponse(text);

    // 5. Return structured data
    return Response.json({
      success: true,
      data: {
        ...validatedData,
        ...analysis,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    // Handle errors
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

**Response Parsing**:

- Extract 5 components from AI response
- Normalize urgency to lowercase (low/medium/high)
- Validate required fields
- Handle partial responses gracefully

**Error Handling**:

- Validation errors: 400 status
- AI API errors: 500 status with user-friendly message
- Timeout errors: Specific timeout message
- Parse errors: Fallback to raw text

---

### Step 4: Create Analysis Results Page

**File**: `app/(dashboard)/analysis/page.tsx`

**Purpose**: Display AI analysis results with options to save or submit another request.

**Features**:

1. Display all 5 analysis components in card sections
2. Color-coded urgency badge:
   - High: Red (bg-red-100 text-red-800)
   - Medium: Yellow (bg-yellow-100 text-yellow-800)
   - Low: Green (bg-green-100 text-green-800)
3. Timestamp display
4. "Save to History" button
5. "Submit Another Request" button
6. Professional card-based layout

**UI Design**:

- Page title: "Analysis Results"
- Cards for each analysis component:
  - Diagnosis (prominent card)
  - Urgency (with badge)
  - Estimated Cost
  - Contractor Type
  - Next Steps (bullet list)
- Action buttons at bottom
- Tailwind CSS styling

**Data Flow**:

- Receive data via URL search params or React state
- Parse urgency for color coding
- Display formatted timestamp
- Handle save action

**Save Flow**:

1. User clicks "Save to History"
2. Call /api/maintenance/save
3. Show loading state on button
4. On success: Show success message, redirect to dashboard
5. On error: Display error message

---

### Step 5: Create Save Request API Endpoint

**File**: `app/api/maintenance/save/route.ts`

**Purpose**: Save analyzed maintenance request to database.

**Implementation Details**:

```typescript
export async function POST(request: Request) {
  try {
    // 1. Validate session
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();

    // 3. Validate required fields
    if (!body.description || !body.diagnosis || !body.urgency) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 4. Save to database
    const savedRequest = await prisma.maintenanceRequest.create({
      data: {
        userId: session.user.id,
        description: body.description,
        propertyAddress: body.propertyAddress || null,
        category: body.category || null,
        diagnosis: body.diagnosis,
        urgency: body.urgency.toLowerCase(),
        estimatedCost: body.estimatedCost || null,
        contractorType: body.contractorType || null,
        nextSteps: body.nextSteps || null,
        status: "analyzed",
      },
    });

    // 5. Return success
    return Response.json({
      success: true,
      data: {
        id: savedRequest.id,
        createdAt: savedRequest.createdAt,
      },
    });
  } catch (error) {
    // Handle errors
    return Response.json(
      { success: false, error: "Failed to save request" },
      { status: 500 }
    );
  }
}
```

**Error Handling**:

- Unauthorized: 401 status
- Validation errors: 400 status
- Database errors: 500 status with generic message
- Log errors for debugging

---

### Step 6: Wire Up Form to Analysis Flow

**File**: `app/(dashboard)/requests/new/page.tsx`

**Updates**:

1. Add form submission handler
2. Integrate with /api/maintenance/analyze
3. Handle loading states
4. Navigate to results page with data
5. Implement error handling

**Implementation**:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setApiError(null);

  // Validate
  const validationErrors = validateForm(formData);
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setIsLoading(true);

  try {
    // Call AI API
    const response = await fetch("/api/maintenance/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Analysis failed");
    }

    // Navigate to results page with data
    router.push({
      pathname: "/dashboard/analysis",
      query: { data: JSON.stringify(result.data) },
    });
  } catch (error) {
    setApiError(error.message);
    setIsLoading(false);
  }
};
```

**Navigation**:

- Use Next.js router.push()
- Pass data via URL query params (encoded JSON)
- Alternative: Use React Context or sessionStorage

---

## Data Flow Diagram

```
User Input (Form)
    ↓
Client-side Validation
    ↓
POST /api/maintenance/analyze
    ↓
Server-side Validation
    ↓
Construct Prompt (system + user input)
    ↓
Call OpenAI API (10s timeout)
    ↓
Parse AI Response → Structured JSON
    ↓
Return to Client
    ↓
Display Results Page
    ↓
User clicks "Save to History"
    ↓
POST /api/maintenance/save
    ↓
Validate Session
    ↓
Save to PostgreSQL (Prisma)
    ↓
Return Success
    ↓
Redirect to Dashboard
```

---

## File Structure After Phase 3

```
app/
├── (dashboard)/
│   ├── requests/
│   │   ├── new/
│   │   │   └── page.tsx          [UPDATED] - Full form implementation
│   │   └── [id]/
│   │       └── page.tsx           [EXISTS] - Request detail view
│   └── analysis/
│       └── page.tsx               [NEW] - Results display page
└── api/
    └── maintenance/
        ├── analyze/
        │   └── route.ts           [NEW] - AI analysis endpoint
        └── save/
            └── route.ts           [NEW] - Save request endpoint

lib/
├── ai/
│   └── prompts.ts                 [EXISTS] - System prompt
└── ai.ts                          [NEW] - AI SDK configuration
```

---

## Testing Checklist

### Manual Testing Steps

1. **Form Validation**

   - [ ] Submit empty form → Shows validation errors
   - [ ] Submit description < 10 chars → Shows error
   - [ ] Submit description > 2000 chars → Shows error
   - [ ] Character counter updates in real-time
   - [ ] Optional fields work correctly

2. **AI Analysis**

   - [ ] Submit valid form → Loading state shows
   - [ ] AI returns analysis within 5 seconds
   - [ ] All 5 components present in response
   - [ ] Urgency classification works (low/medium/high)
   - [ ] Cost estimates are reasonable
   - [ ] Contractor type is specified
   - [ ] Next steps are actionable

3. **Results Display**

   - [ ] Results page displays correctly
   - [ ] Urgency badge has correct color
   - [ ] All sections are readable
   - [ ] Timestamp shows correctly
   - [ ] "Save to History" button works
   - [ ] "Submit Another Request" button works

4. **Save to Database**

   - [ ] Save button triggers API call
   - [ ] Request saved to database
   - [ ] Redirects to dashboard
   - [ ] Request appears in history (when Phase 4 implemented)
   - [ ] Unauthorized users cannot save

5. **Error Handling**
   - [ ] AI API failure shows user-friendly error
   - [ ] Timeout shows appropriate message
   - [ ] Network errors handled gracefully
   - [ ] Database errors show generic message
   - [ ] Form can be resubmitted after error

---

## Performance Targets

- **Form Validation**: < 100ms (client-side)
- **AI Analysis**: < 5 seconds (target), < 10 seconds (timeout)
- **Save to Database**: < 500ms
- **Page Navigation**: < 200ms

---

## Security Considerations

1. **API Key Protection**

   - OPENAI_API_KEY stored in environment variables
   - Never exposed to client
   - Validated at server startup

2. **Session Validation**

   - All API routes validate session
   - Unauthorized requests rejected with 401
   - User data isolated by userId

3. **Input Sanitization**

   - All inputs validated with Zod
   - SQL injection prevented by Prisma
   - XSS prevented by React escaping

4. **Rate Limiting**
   - Consider rate limiting AI endpoint (to be added)
   - Prevent API abuse

---

## Environment Variables Required

```env
# Existing
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# New for Phase 3
OPENAI_API_KEY="sk-..."  # Required for AI analysis
```

---

## Known Limitations

1. **AI Accuracy**: Not 100% accurate, may need manual review
2. **Cost Estimates**: Based on typical rates, may vary by location
3. **Single Provider**: No fallback if OpenAI is down
4. **No Image Support**: Text-only analysis for MVP
5. **No Streaming**: Waits for complete response (acceptable for MVP)

---

## Success Criteria

Phase 3 is complete when:

- ✅ User can submit maintenance request form
- ✅ AI analyzes and returns all 5 components
- ✅ Results display correctly with proper styling
- ✅ Analysis completes in < 5 seconds
- ✅ User can save results to database
- ✅ All error scenarios handled gracefully
- ✅ Build completes without errors
- ✅ TypeScript type checking passes

---

## Next Steps (Phase 4)

After Phase 3 completion:

1. Build request history list in dashboard
2. Implement filtering by urgency
3. Add pagination for large datasets
4. Create request detail view
5. Add delete functionality
6. Polish UI/UX
7. Performance optimization
8. End-to-end testing

---

**Document Version**: 1.0
**Created**: January 7, 2026
**Status**: Ready for Implementation
