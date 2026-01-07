# Phase 6: Deployment Plan

## Overview

This plan outlines the complete deployment process for the AI-Assisted Property Maintenance Tool MVP to production on Vercel with Vercel Postgres database.

## Current Status Assessment

### ✅ Already Complete

- `.env.example` exists with all required variables
- `.gitignore` properly excludes `.env*.local` files
- No console.log statements found in codebase
- All dependencies installed
- Build scripts configured in package.json

### ⚠️ Needs Attention

- `README.md` status shows "Phase 0 - Pre-Development" (needs update to Phase 6)
- No favicon in public folder (public folder doesn't exist yet)
- Page titles and meta descriptions may need review
- Need to verify no exposed API keys in code

## Step-by-Step Deployment Plan

### Step 30: Prepare for Deployment

#### 30.1 Verify Environment Configuration

**Status**: ✅ Already complete

- `.env.example` contains all required variables:
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
  - `OPENAI_API_KEY`
  - `NODE_ENV`

**Action**: No changes needed

#### 30.2 Verify .gitignore

**Status**: ✅ Already complete

- `.env` and `.env*.local` are excluded
- `.vercel` folder excluded
- All standard Next.js exclusions present

**Action**: No changes needed

#### 30.3 Update README.md

**Status**: ⚠️ Needs update

- Current status shows "Phase 0 - Pre-Development"
- Should reflect "Phase 6 Complete - Production Deployed"
- Update project status and next steps

**Action**: Update README.md to reflect current state

#### 30.4 Run Production Build

**Command**:

```bash
npm run build
```

**Expected Outcome**:

- Build completes without errors
- All TypeScript compilation passes
- All routes generated successfully
- Middleware compiled successfully

**Potential Issues & Solutions**:

- TypeScript errors: Fix type mismatches
- Missing dependencies: Run `npm install`
- Build timeout: Check for infinite loops or large bundles

#### 30.5 Test Production Build Locally

**Command**:

```bash
npm run start
```

**Testing Checklist**:

- [ ] Server starts on port 3000
- [ ] Homepage loads correctly
- [ ] Login/signup pages accessible
- [ ] Dashboard loads (with authentication)
- [ ] No console errors in browser
- [ ] All links work
- [ ] Forms submit correctly

**Action**: Fix any issues found during testing

---

### Step 31: Set Up Production Database

#### 31.1 Create Vercel Postgres Database

**Steps**:

1. Go to [vercel.com](https://vercel.com) and login
2. Navigate to your project or create new project
3. Go to "Storage" tab in project dashboard
4. Click "Create Database"
5. Select "Postgres" (Vercel Postgres)
6. Choose region (closest to your users)
7. Click "Create"

**Pricing Note**:

- Free tier: 512MB storage, 60 hours compute/month
- Paid tier: Starts at $20/month for 8GB storage
- For MVP: Start with free tier, upgrade as needed

#### 31.2 Get Production Connection String

**Steps**:

1. In Vercel dashboard, go to "Storage" > "Postgres"
2. Click on your database
3. Go to "Settings" > "Connection String"
4. Copy the connection string

**Format**:

```
postgres://postgres.[user]:[password]@[host]/[database]?sslmode=require
```

**Important**: The connection string will include `sslmode=require` for security.

#### 31.3 Update Local Environment for Testing

**Action**: Create `.env.production.local` (for local testing with production DB)

```env
DATABASE_URL="postgres://[production-connection-string]"
NEXTAUTH_SECRET="[your-production-secret]"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="[your-openai-key]"
NODE_ENV="production"
```

#### 31.4 Run Prisma Migrations on Production Database

**Command**:

```bash
npx prisma db push
```

**Alternative (if using migrations)**:

```bash
npx prisma migrate deploy
```

**Expected Outcome**:

- Prisma connects to production database
- User table created
- MaintenanceRequest table created
- Indexes created on userId and createdAt

**Verification**:

```bash
npx prisma studio
```

Open Prisma Studio and verify tables exist.

---

### Step 32: Deploy to Vercel

#### Option A: Deploy via Vercel CLI (Recommended for first deployment)

**Steps**:

1. **Install Vercel CLI**:

```bash
npm i -g vercel
```

2. **Login to Vercel**:

```bash
vercel login
```

Follow the prompts to authenticate.

3. **Deploy**:

```bash
vercel
```

**Prompts**:

- Set up and deploy? → Yes
- Link to existing project? → No (for first deployment)
- Project name? → property-maintenance (or your preferred name)
- Build command? → (default: `npm run build`)
- Output directory? → (default: `.next`)
- Override settings? → No

4. **Verify Deployment**:

- Vercel will provide a preview URL
- Visit the URL and verify the app loads
- Note the production URL (e.g., `https://property-maintenance.vercel.app`)

#### Option B: Deploy via GitHub Integration (Recommended for ongoing deployments)

**Steps**:

1. **Push Code to GitHub**:

```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

2. **Connect Repository to Vercel**:

- Go to [vercel.com](https://vercel.com)
- Click "Add New Project"
- Select your GitHub repository
- Import the repository

3. **Configure Project Settings**:

- Framework Preset: Next.js
- Root Directory: `./` (default)
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

4. **Deploy**:

- Click "Deploy"
- Wait for build and deployment to complete
- Note the production URL

**Advantages of GitHub Integration**:

- Automatic deployments on push to main branch
- Preview deployments for pull requests
- Better collaboration workflow
- Deployment history

---

### Step 33: Configure Environment Variables

#### 33.1 Access Environment Variables in Vercel

**Steps**:

1. Go to your project in Vercel dashboard
2. Click "Settings" tab
3. Click "Environment Variables"

#### 33.2 Add Required Environment Variables

Add each variable with the following settings:

| Variable          | Value                                       | Environment                      |
| ----------------- | ------------------------------------------- | -------------------------------- |
| `DATABASE_URL`    | Production connection string from Step 31.2 | Production, Preview, Development |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32`     | Production, Preview, Development |
| `NEXTAUTH_URL`    | `https://your-domain.vercel.app`            | Production, Preview, Development |
| `OPENAI_API_KEY`  | Your OpenAI API key                         | Production, Preview, Development |
| `NODE_ENV`        | `production`                                | Production                       |

**Important Notes**:

- `NEXTAUTH_URL` must match your production domain exactly
- `NEXTAUTH_SECRET` should be unique and strong (32+ characters)
- Never commit actual values to Git
- Use different values for different environments if needed

#### 33.3 Generate NEXTAUTH_SECRET

**Command**:

```bash
openssl rand -base64 32
```

**Alternative (Windows)**:

```powershell
powershell -Command "New-Guid"
```

#### 33.4 Redeploy After Adding Variables

**Steps**:

1. After adding all environment variables
2. Go to "Deployments" tab
3. Click the three dots (...) on the latest deployment
4. Click "Redeploy"

**Expected Outcome**:

- New deployment starts
- Build completes successfully
- All environment variables are available
- App functions correctly in production

---

### Step 34: Run Production Tests

#### 34.1 Visit Production URL

**Action**: Open your production URL in browser

**Verification**:

- [ ] Homepage loads without errors
- [ ] No console errors in browser dev tools
- [ ] SSL certificate valid (HTTPS)
- [ ] Page loads quickly (< 2 seconds)

#### 34.2 Test Signup Flow

**Steps**:

1. Click "Sign Up" button
2. Fill in form with test email and password
3. Submit form
4. Verify redirect to dashboard
5. Verify user name displayed in header

**Expected Outcome**:

- Form validates correctly
- User created in production database
- Session established
- Redirected to dashboard

#### 34.3 Test Login Flow

**Steps**:

1. Log out if logged in
2. Click "Login" button
3. Enter credentials from signup
4. Submit form
5. Verify redirect to dashboard

**Expected Outcome**:

- Credentials validated correctly
- Session established
- Redirected to dashboard

#### 34.4 Submit Maintenance Request

**Steps**:

1. Click "New Request" button
2. Enter test description (e.g., "Water leaking from ceiling in bedroom")
3. Optional: Add property address
4. Optional: Select category
5. Click "Analyze with AI"

**Expected Outcome**:

- Form validates correctly
- Loading state shows
- AI analysis completes (< 5 seconds)
- Results displayed

#### 34.5 Verify AI Analysis Works

**Verification**:

- [ ] Diagnosis displayed
- [ ] Urgency level shown (Low/Medium/High)
- [ ] Estimated cost range provided
- [ ] Contractor type recommended
- [ ] Next steps listed
- [ ] All 5 components present

#### 34.6 Save Request to History

**Steps**:

1. On analysis results page
2. Click "Save to History" button
3. Verify success message
4. Verify redirect to dashboard

**Expected Outcome**:

- Request saved to production database
- Success message displayed
- Redirected to dashboard
- Request appears in history

#### 34.7 View Dashboard and Request List

**Verification**:

- [ ] Dashboard loads correctly
- [ ] Request list shows saved request
- [ ] Date displayed correctly
- [ ] Description truncated if long
- [ ] Urgency badge displayed
- [ ] Status shown

#### 34.8 Test Filtering by Urgency

**Steps**:

1. Click "High" filter button
2. Verify only high urgency requests shown
3. Click "Medium" filter button
4. Verify only medium urgency requests shown
5. Click "Low" filter button
6. Verify only low urgency requests shown
7. Click "All" filter button
8. Verify all requests shown

**Expected Outcome**:

- Filtering works correctly
- Active filter button highlighted
- Request list updates immediately

#### 34.9 View Request Details

**Steps**:

1. Click on a request in the list
2. Verify detail page loads
3. Verify all information displayed
4. Click "Back to Dashboard"

**Expected Outcome**:

- Detail page loads with full request information
- All AI analysis components displayed
- Back navigation works

#### 34.10 Test Logout/Login

**Steps**:

1. Click "Logout" button
2. Verify redirect to homepage
3. Click "Login"
4. Enter credentials
5. Verify redirect to dashboard

**Expected Outcome**:

- Session cleared
- Redirected to homepage
- Can log back in
- Previous requests still accessible

#### 34.11 Test on Different Browsers

**Browsers to Test**:

- [ ] Google Chrome (latest)
- [ ] Mozilla Firefox (latest)
- [ ] Safari (latest, if on macOS)
- [ ] Microsoft Edge (latest)

**Verification**:

- All features work across browsers
- UI renders correctly
- No console errors
- Performance acceptable

#### 34.12 Test on Tablet Size

**Steps**:

1. Open browser dev tools
2. Switch to tablet viewport (e.g., iPad: 768x1024)
3. Test all major flows:
   - Signup/Login
   - Submit request
   - View dashboard
   - Filter requests

**Expected Outcome**:

- Responsive design works
- No horizontal scrolling
- Touch targets large enough
- All functionality accessible

---

### Step 35: Final Polish

#### 35.1 Add Favicon

**Action**: Create public folder and add favicon

**Steps**:

1. Create `public/` directory if it doesn't exist
2. Add favicon files:
   - `favicon.ico` (16x16, 32x32)
   - `icon.png` (180x180 for Apple)
   - `site.webmanifest` (optional, for PWA)

**Simple Approach**:

- Use a simple icon or logo
- Can use online favicon generators
- Or use default Next.js favicon (optional)

#### 35.2 Update Page Titles and Meta Descriptions

**Files to Review**:

- `app/layout.tsx` (root layout)
- `app/page.tsx` (homepage)
- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/requests/new/page.tsx`

**Checklist**:

- [ ] Root layout has proper title
- [ ] Root layout has meta description
- [ ] Each page has descriptive title
- [ ] Meta descriptions are SEO-friendly
- [ ] Open Graph tags (optional, for social sharing)

**Example**:

```tsx
export const metadata = {
  title: "AI Property Maintenance - Smart Maintenance Analysis",
  description:
    "Get instant AI-powered maintenance analysis, cost estimates, and contractor recommendations for your property.",
};
```

#### 35.3 Remove or Control Console.log Statements

**Status**: ✅ Already verified

- No console.log statements found in codebase
- All logging is properly controlled

**Action**: No changes needed

#### 35.4 Check for Exposed API Keys or Secrets

**Files to Check**:

- All `.env` files
- All configuration files
- All API route files
- All library files

**Verification**:

- [ ] No hardcoded API keys in code
- [ ] No secrets in Git history
- [ ] All sensitive data in environment variables
- [ ] `.env` files in `.gitignore`

**Tools**:

```bash
# Search for potential secrets
git log --all --full-history --source -- "**/.env"
git log --all --full-history --source -- "**/secrets.*"
```

#### 35.5 Verify All Links Work

**Links to Test**:

- [ ] Homepage → Sign Up
- [ ] Homepage → Login
- [ ] Sign Up → Login
- [ ] Login → Sign Up
- [ ] Dashboard → New Request
- [ ] Dashboard → Request Detail
- [ ] Request Detail → Back to Dashboard
- [ ] Logout → Homepage

**Action**: Click through all navigation and verify no broken links

#### 35.6 Check for Typos in User-Facing Text

**Areas to Review**:

- Homepage content
- Form labels and placeholders
- Error messages
- Success messages
- Button text
- Dashboard labels

**Action**: Read through all user-facing text and correct typos

---

## Post-Deployment Checklist

### Immediate Actions (Day 1)

- [ ] App deployed to production URL
- [ ] All environment variables configured
- [ ] Database migrations run successfully
- [ ] End-to-end testing passed
- [ ] No critical bugs found
- [ ] SSL certificate valid
- [ ] Performance acceptable

### Monitoring Setup (Week 1)

- [ ] Set up Vercel Analytics
- [ ] Monitor error logs in Vercel dashboard
- [ ] Set up database monitoring (Vercel Postgres dashboard)
- [ ] Monitor AI API usage and costs
- [ ] Check for any performance issues

### Documentation Updates

- [ ] Update README.md with production URL
- [ ] Create DEPLOYMENT.md with deployment instructions
- [ ] Update memory bank context.md
- [ ] Document any deployment issues encountered
- [ ] Create user guide (optional)

### Security Review

- [ ] Verify all environment variables set correctly
- [ ] Check for exposed secrets
- [ ] Verify HTTPS enforced
- [ ] Review API rate limiting
- [ ] Check CORS settings (if applicable)

---

## Troubleshooting Guide

### Build Fails

**Issue**: `npm run build` fails with errors

**Solutions**:

1. Check TypeScript errors: `npm run lint`
2. Clear Next.js cache: `rm -rf .next`
3. Reinstall dependencies: `rm -rf node_modules && npm install`
4. Check for missing environment variables

### Database Connection Failed

**Issue**: App can't connect to production database

**Solutions**:

1. Verify DATABASE_URL in Vercel environment variables
2. Check database is active in Vercel dashboard
3. Verify connection string format
4. Check for SSL certificate issues
5. Try `npx prisma db push` again

### NextAuth Session Issues

**Issue**: Users can't log in or sessions don't persist

**Solutions**:

1. Verify NEXTAUTH_SECRET is set
2. Verify NEXTAUTH_URL matches production domain exactly
3. Check cookie settings in browser
4. Clear browser cookies and try again
5. Check Vercel logs for errors

### AI Analysis Fails

**Issue**: AI analysis returns errors or times out

**Solutions**:

1. Verify OPENAI_API_KEY is set correctly
2. Check API key has sufficient credits
3. Increase timeout in API route
4. Check Vercel logs for AI SDK errors
5. Verify network connectivity to OpenAI

### Deployment Fails

**Issue**: Vercel deployment fails

**Solutions**:

1. Check build logs in Vercel dashboard
2. Verify all dependencies are in package.json
3. Check for missing environment variables
4. Try redeploying from Vercel dashboard
5. Check for Node.js version compatibility

---

## Success Criteria

Phase 6 is complete when:

✅ App deployed to production URL and accessible
✅ All environment variables configured correctly
✅ Database migrations run successfully on production database
✅ End-to-end testing passed (all 34.1-34.12 steps)
✅ No critical bugs found
✅ Performance acceptable (< 2s page load, < 5s AI analysis)
✅ SSL certificate valid and HTTPS enforced
✅ All major features working in production
✅ Documentation updated (README.md, deployment docs)

---

## Next Steps After Deployment

### Week 1-2: Monitoring and Bug Fixes

- Monitor production usage and errors
- Fix any bugs discovered by users
- Gather user feedback
- Make quick improvements based on feedback

### Week 3-4: Iteration and Enhancement

- Add requested features from user feedback
- Improve performance based on metrics
- Enhance UI/UX based on usage patterns
- Prepare for paid subscription model

### Month 2+: Scaling and Growth

- Implement payment processing (Stripe)
- Add advanced features (image upload, notifications)
- Scale infrastructure if needed
- Marketing and user acquisition

---

## Notes

- This is an MVP - expect some rough edges
- Focus on core functionality and user feedback
- Don't over-optimize prematurely
- Keep deployment process simple and repeatable
- Document any issues encountered for future reference

---

**Document Version**: 1.0
**Last Updated**: January 7, 2026
**Status**: Ready for Execution
