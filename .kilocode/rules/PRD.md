# Product Requirements Document (PRD)

## AI-Assisted Property Maintenance Tool - MVP

---

## 1. Project Overview

### 1.1 Purpose

Build a lean MVP of a web-based AI-assisted property maintenance tool to validate product-market fit and generate initial revenue. This is NOT a polished final product but a functional prototype for customer demos and early paid users.

### 1.2 Problem Statement

Property managers and landlords struggle to efficiently diagnose maintenance issues, estimate costs, and determine appropriate responses. This tool uses AI to streamline the maintenance request analysis process.

### 1.3 Target Users

- Property managers
- Landlords
- Real estate professionals managing multiple properties

### 1.4 Success Metrics

- Users can successfully submit and analyze maintenance requests
- AI provides useful analysis within 5 seconds
- System can handle 10+ concurrent users
- App is deployed and accessible via public URL
- Early users willing to pay for the service

---

## 2. Technical Stack

### 2.1 Core Technologies

- **Frontend Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Vercel AI SDK
- **AI Provider**: OpenAI GPT-4 or Anthropic Claude (configurable)
- **Authentication**: NextAuth.js v5
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel
- **Version Control**: Git/GitHub

### 2.2 Development Environment

```bash
Node.js: 18+
Package Manager: npm or pnpm
```

### 2.3 Required API Keys

- OpenAI API key OR Anthropic API key
- Database connection string
- NextAuth secret

---

## 3. Functional Requirements

### 3.1 MUST HAVE (MVP Core Features)

#### Authentication

- User registration with email/password
- User login with email/password
- Logout functionality
- Protected routes (dashboard accessible only when logged in)
- Basic session management
- Password requirements: minimum 8 characters

#### Maintenance Request Submission

- Text area for issue description (required, max 2000 characters)
- Property address field (optional for MVP)
- Issue category dropdown (optional: Plumbing, Electrical, HVAC, Structural, Other)
- Submit button with loading state
- Form validation and error messages

#### AI Analysis Engine

- Analyze maintenance issue description
- Provide structured output including:
  - **Problem Diagnosis**: What the issue likely is
  - **Urgency Level**: Low, Medium, or High
  - **Estimated Cost Range**: Dollar range (e.g., $100-$300)
  - **Recommended Contractor Type**: Who should fix it
  - **Next Steps**: 2-3 actionable recommendations
- Response time: < 5 seconds
- Error handling for AI failures

#### Results Display

- Show AI analysis in clean, readable format
- Display all 5 components of analysis clearly
- Timestamp of analysis
- Save button to persist to database
- Option to submit another request

#### Request History Dashboard

- List all user's previous maintenance requests
- Show: date, issue summary (truncated), urgency level, status
- Click to view full analysis
- Basic filtering: All, High Urgency, Medium, Low
- Sort by: Date (newest first default)
- Pagination or infinite scroll (if > 20 requests)

#### User Interface

- Responsive design (desktop-first, but works on tablet)
- Clean, functional aesthetic (not fancy)
- Loading states for all async operations
- Error states with helpful messages
- Success confirmations
- Consistent layout/navigation

### 3.2 NICE TO HAVE (Post-MVP)

- Image upload for maintenance issues
- Multi-modal AI analysis (analyze photos)
- Email notifications
- PDF export of analysis
- Share request via link
- Contractor directory/recommendations
- Cost tracking over time
- Maintenance calendar
- Multi-property management
- Team/role-based access

### 3.3 OUT OF SCOPE (Not for MVP)

- Mobile native app
- Payment processing/billing
- Contractor marketplace
- In-app messaging
- Advanced analytics/reporting
- API for third-party integrations
- White-labeling
- Multi-language support

---

## 4. Data Models

### 4.1 Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String   // hashed
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

---

## 5. API Endpoints

### 5.1 Authentication

```
POST   /api/auth/signup          - Create new user account
POST   /api/auth/signin          - User login
POST   /api/auth/signout         - User logout
GET    /api/auth/session         - Get current session
```

### 5.2 Maintenance Requests

```
POST   /api/maintenance/analyze  - Submit request for AI analysis
POST   /api/maintenance/save     - Save analyzed request to database
GET    /api/maintenance/list     - Get user's requests (with pagination)
GET    /api/maintenance/[id]     - Get single request details
DELETE /api/maintenance/[id]     - Delete a request (optional)
```

---

## 6. User Flows

### 6.1 New User Flow

1. User visits homepage
2. Clicks "Sign Up"
3. Enters email, name, password
4. Submits form
5. Auto-logged in, redirected to dashboard

### 6.2 Returning User Flow

1. User visits homepage
2. Clicks "Login"
3. Enters email, password
4. Redirected to dashboard

### 6.3 Submit Maintenance Request Flow

1. User on dashboard, clicks "New Request"
2. Fills out form (description required, address/category optional)
3. Clicks "Analyze"
4. Loading state shows
5. AI analysis appears (5 sections)
6. User clicks "Save Request"
7. Request saved, appears in history
8. User can submit another or return to dashboard

### 6.4 View Request History Flow

1. User on dashboard
2. Sees list of previous requests
3. Can filter by urgency
4. Clicks on a request
5. Sees full details and analysis
6. Can go back to list

---

## 7. AI Implementation Details

### 7.1 AI System Prompt

```
You are a professional property maintenance analyst. Analyze maintenance issues and provide structured recommendations.

For each maintenance issue description, provide:

1. DIAGNOSIS: Identify the likely problem in 1-2 sentences
2. URGENCY: Classify as LOW, MEDIUM, or HIGH
   - HIGH: Safety hazard, major damage risk, or essential service outage
   - MEDIUM: Affects daily function, could worsen quickly
   - LOW: Minor issue, cosmetic, or can wait for scheduled maintenance
3. ESTIMATED COST: Provide a realistic range in USD (e.g., $150-$400)
4. CONTRACTOR TYPE: Specify what professional is needed (plumber, electrician, HVAC, general contractor, etc.)
5. NEXT STEPS: List 2-3 specific, actionable recommendations

Be concise, practical, and helpful. Base estimates on typical market rates.
```

### 7.2 Input Format

```typescript
{
  description: string,      // User's issue description
  propertyAddress?: string, // Optional context
  category?: string         // Optional hint
}
```

### 7.3 Expected Output Structure

```typescript
{
  diagnosis: string,
  urgency: "low" | "medium" | "high",
  estimatedCost: string,
  contractorType: string,
  nextSteps: string
}
```

### 7.4 Fallback Behavior

- If AI fails: Show error message, don't save to database
- If AI returns incomplete data: Show what's available, mark as "partial analysis"
- Timeout: 10 seconds max, then show error

---

## 8. UI/UX Specifications

### 8.1 Page Structure

#### Homepage (Public)

- Hero section with value proposition
- "Sign Up" and "Login" buttons
- Brief feature overview (3-4 bullets)
- Footer with links

#### Login/Signup Pages

- Clean centered form
- Email and password fields
- Submit button
- Link to switch between login/signup
- Error messages inline

#### Dashboard (Protected)

- Header: Logo, user name, logout button
- Main CTA: "New Maintenance Request" button (prominent)
- Request history table/cards below
- Filter buttons: All | High | Medium | Low
- Each request shows: date, truncated description, urgency badge, status

#### New Request Form (Protected)

- Page title: "Submit Maintenance Request"
- Large text area for description
- Optional fields: property address, category dropdown
- "Analyze with AI" button (primary color)
- Cancel/back button

#### Analysis Results (Protected)

- Page title: "Analysis Results"
- 5 clear sections for analysis components
- Visual urgency indicator (color-coded badge)
- "Save to History" button
- "Submit Another Request" button
- Timestamp

#### Request Detail View (Protected)

- Full request information
- Complete AI analysis
- Timestamp
- Back to dashboard button
- Optional: Edit or Delete buttons

### 8.2 Design Guidelines

- Color Scheme: Use Tailwind's default palette, choose 1 primary color (e.g., blue-600)
- Typography: Use Tailwind's font stack, clear hierarchy
- Spacing: Generous padding, not cramped
- Buttons: Clear primary vs secondary styling
- Forms: Labels above fields, inline validation
- Loading States: Spinners or skeleton screens
- Mobile: Stack elements vertically, touch-friendly buttons (though desktop-first)

### 8.3 Key UI Components Needed

- Button (primary, secondary, danger variants)
- Input field (text, email, password, textarea)
- Card component (for request items)
- Badge component (for urgency levels)
- Loading spinner
- Error/success toast or alert
- Modal (optional, for confirmations)

---

## 9. Security & Performance

### 9.1 Security Requirements

- All passwords hashed with bcrypt (or NextAuth default)
- Environment variables for all secrets (never commit)
- HTTPS only in production
- CSRF protection (NextAuth handles this)
- SQL injection prevention (Prisma handles this)
- Rate limiting on API routes (basic: 10 requests/minute per IP)
- Input validation and sanitization

### 9.2 Performance Targets

- Page load: < 2 seconds
- AI analysis: < 5 seconds
- Database queries: < 500ms
- Lighthouse score: > 70 (acceptable for MVP)

### 9.3 Error Handling

- All API errors caught and logged
- User-friendly error messages (never expose stack traces)
- Graceful degradation when AI unavailable
- Form validation before submission

---

## 10. Development Phases

### Phase 1: Foundation (Week 1)

- [ ] Initialize Next.js project with TypeScript
- [ ] Set up Tailwind CSS
- [ ] Configure Prisma with PostgreSQL
- [ ] Set up NextAuth.js
- [ ] Create database schema
- [ ] Build authentication pages (login, signup)
- [ ] Implement protected route middleware

### Phase 2: Core Features (Week 2)

- [ ] Set up Vercel AI SDK
- [ ] Build maintenance request form
- [ ] Create AI analysis API endpoint
- [ ] Build results display page
- [ ] Implement save to database functionality
- [ ] Create basic dashboard layout

### Phase 3: Request Management (Week 3)

- [ ] Build request history list
- [ ] Implement filtering
- [ ] Create request detail view
- [ ] Add loading and error states
- [ ] Implement pagination (if needed)

### Phase 4: Polish & Deploy (Week 4)

- [ ] Add form validation
- [ ] Improve error handling
- [ ] Responsive design fixes
- [ ] Performance optimization
- [ ] Set up Vercel deployment
- [ ] Configure environment variables
- [ ] Test end-to-end flows
- [ ] Deploy to production

---

## 11. Testing Requirements

### 11.1 Manual Testing Checklist

- [ ] User can sign up with email/password
- [ ] User can log in
- [ ] User can log out
- [ ] Protected routes redirect to login
- [ ] Maintenance form validates required fields
- [ ] AI analysis completes successfully
- [ ] Results display all 5 components
- [ ] Request saves to database
- [ ] Request history shows all user requests
- [ ] Filtering works correctly
- [ ] Request detail view displays correctly
- [ ] App works on desktop Chrome, Firefox, Safari
- [ ] App works on tablet size

### 11.2 Error Scenarios to Test

- [ ] Invalid login credentials
- [ ] Duplicate email signup
- [ ] Empty form submission
- [ ] AI API failure
- [ ] Database connection failure
- [ ] Network timeout
- [ ] Session expiration

---

## 12. Deployment

### 12.1 Environment Variables Required

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="random-secret-here"
NEXTAUTH_URL="https://yourdomain.com"

# AI Provider (choose one)
OPENAI_API_KEY="sk-..."
# OR
ANTHROPIC_API_KEY="sk-ant-..."
```

### 12.2 Deployment Steps

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Set up PostgreSQL database (Vercel Postgres or Supabase)
5. Run Prisma migrations
6. Deploy
7. Test production deployment

### 12.3 Post-Deployment

- [ ] Verify all environment variables set
- [ ] Test signup/login in production
- [ ] Submit test maintenance request
- [ ] Verify AI analysis works
- [ ] Check database saves correctly
- [ ] Test on different browsers
- [ ] Share URL for customer demos

---

## 13. Known Limitations & Future Considerations

### 13.1 MVP Limitations

- Desktop-optimized only (mobile works but not optimized)
- Single AI provider (no fallback)
- Basic auth only (no OAuth)
- No real-time updates
- Limited to text analysis (no image support)
- No email notifications
- No payment/subscription system
- No analytics dashboard

### 13.2 Scalability Considerations

- Current design supports 100s of users
- For 1000s of users, will need:
  - Redis for session management
  - CDN for static assets
  - Database connection pooling
  - API rate limiting per user
  - Caching layer

### 13.3 Future Feature Ideas

- Image upload and analysis
- Email/SMS notifications
- Stripe integration for subscriptions
- Contractor marketplace
- Mobile app
- Team collaboration features
- Integration with property management software
- Advanced analytics and reporting
- Maintenance scheduling calendar
- Automated follow-ups

---

## 14. Success Criteria

### 14.1 MVP is Complete When:

✅ User can sign up and log in securely  
✅ User can submit a maintenance request  
✅ AI analyzes the request and provides all 5 components  
✅ Analysis is displayed clearly  
✅ Request is saved to database  
✅ User can view request history  
✅ User can filter requests by urgency  
✅ User can view individual request details  
✅ App is deployed and accessible via URL  
✅ All critical bugs are fixed  
✅ App works on major desktop browsers

### 14.2 Ready for Customer Demos When:

✅ All success criteria above met  
✅ UI is clean and professional (not buggy)  
✅ Error handling is graceful  
✅ Performance is acceptable (< 5s for AI)  
✅ Demo script/flow is prepared  
✅ Test accounts created

---

## 15. Resources & References

### 15.1 Documentation Links

- Next.js: https://nextjs.org/docs
- Vercel AI SDK: https://sdk.vercel.ai/docs
- NextAuth.js: https://next-auth.js.org/
- Prisma: https://www.prisma.io/docs
- Tailwind CSS: https://tailwindcss.com/docs

### 15.2 Example Prompts for AI Agents

**Setup Phase:**
"Using this PRD, initialize a Next.js 14 project with TypeScript, Tailwind CSS, and create the basic file structure."

**Authentication Phase:**
"Based on the PRD, implement NextAuth.js with credentials provider, create login and signup pages, and protect the dashboard route."

**AI Integration Phase:**
"Following the PRD specifications, create the AI analysis API endpoint using Vercel AI SDK and OpenAI, including the specified system prompt."

**Database Phase:**
"Using the data models in the PRD, create the Prisma schema, generate migrations, and implement CRUD operations for maintenance requests."

---

## 16. Contact & Questions

Before starting development, clarify with client:

- Which AI provider should be used? (OpenAI or Anthropic)
- Is there a budget for AI API costs?
- What's the target launch date?
- Who will handle database hosting costs?
- Are there any specific compliance requirements?
- What's the plan for post-MVP iteration?

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Ready for Development
