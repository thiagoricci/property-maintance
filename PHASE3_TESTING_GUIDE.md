# Phase 3 Testing Guide

**Date**: January 7, 2026
**Status**: Ready for Testing

---

## Prerequisites

Before testing Phase 3, ensure you have:

1. ✅ PostgreSQL database running on port 5432
2. ✅ Database migrations applied
3. ✅ OpenAI API key ready
4. ✅ Node.js 18+ installed
5. ✅ Dependencies installed (`npm install`)

---

## Step 1: Configure Environment Variables

### Add OpenAI API Key

1. Open the `.env` file in your project root
2. Add your OpenAI API key:

```env
# Add this line to your .env file
OPENAI_API_KEY="sk-your-actual-openai-api-key-here"
```

**Note**: Your `.env.example` file already has a placeholder. Do NOT use that key - it's just an example!

### Verify All Environment Variables

Your `.env` file should contain:

```env
# Database
DATABASE_URL="postgresql://thiagoricci@localhost:5432/property_maintenance"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI (NEW for Phase 3)
OPENAI_API_KEY="sk-your-actual-openai-api-key-here"

# Optional
NODE_ENV="development"
```

---

## Step 2: Start Development Server

```bash
# Navigate to project directory
cd "/Users/thiagoricci/Downloads/Projects/Property Maintenance"

# Start development server
npm run dev
```

The server will start on `http://localhost:3000`

---

## Step 3: Test Complete User Flow

### 3.1 Authentication

1. Open browser to `http://localhost:3000`
2. Click "Login" or "Sign Up"
3. **If new user**:
   - Fill out signup form
   - Submit
   - Should be auto-logged in and redirected to dashboard
4. **If existing user**:
   - Fill out login form
   - Submit
   - Should be redirected to dashboard

**Expected Result**: Dashboard displays with welcome message and "Create Request" button

---

### 3.2 Submit Maintenance Request

1. On dashboard, click the blue "Create Request" button
2. Fill out the form:
   - **Description (required)**: Type a maintenance issue (min 10 chars, max 2000)
     - Example: "The kitchen sink is leaking water from the bottom, and there's water damage on the cabinet below"
   - **Property Address (optional)**: Leave blank or add address
   - **Category (optional)**: Select "Plumbing" or leave as "Select a category"
3. Observe the character counter (should show X/2000)
4. Click "Analyze with AI" button

**Expected Result**:

- Button shows loading spinner with "Analyzing..." text
- No validation errors if description is valid
- Page navigates to analysis results after ~3-5 seconds

---

### 3.3 View Analysis Results

After AI analysis completes, you should see:

1. **Page Title**: "Analysis Results"
2. **Diagnosis Card**: Blue left border with AI diagnosis
3. **Urgency Card**: Color-coded badge
   - **Red** = High urgency
   - **Yellow** = Medium urgency
   - **Green** = Low urgency
4. **Estimated Cost Card**: Large, bold cost display
5. **Contractor Type Card**: Recommended professional type
6. **Next Steps Card**: Numbered list of recommendations
7. **Original Request Info**: Shows your input data and timestamp

**Expected Result**: All 5 analysis components displayed in clean, professional cards

---

### 3.4 Save to Database

1. Review the analysis results
2. Click the "Save to History" button
3. Wait for save to complete

**Expected Result**:

- Button shows "Saving..." with spinner
- Success message appears: "Request saved successfully! Redirecting to dashboard..."
- Automatically redirects to dashboard after 1.5 seconds

---

### 3.5 Verify Database Save

1. Open new terminal window
2. Run Prisma Studio:

```bash
cd "/Users/thiagoricci/Downloads/Projects/Property Maintenance"
npx prisma studio
```

3. Prisma Studio opens in browser (usually at `http://localhost:5555`)
4. Navigate to **MaintenanceRequest** table
5. Verify your request appears with:
   - Description
   - Diagnosis
   - Urgency (low/medium/high)
   - Estimated Cost
   - Contractor Type
   - Next Steps
   - Status: "analyzed"
   - CreatedAt timestamp
   - UserId (linked to your user)

**Expected Result**: Your request is saved in the database with all analysis data

---

## Step 4: Test Error Handling

### 4.1 Form Validation

1. Go to "New Request" page
2. Click "Analyze with AI" without filling description
3. **Expected**: Validation error "Description is required"
4. Type only 5 characters in description
5. **Expected**: Validation error "Description must be at least 10 characters"
6. Type 2001+ characters
7. **Expected**: Character counter turns red, validation error appears

### 4.2 API Errors (Without API Key)

1. Temporarily remove or comment out `OPENAI_API_KEY` from `.env`
2. Restart dev server (`Ctrl+C`, then `npm run dev`)
3. Try to submit a request
4. **Expected**: Error message "AI service not configured. Please contact support."

### 4.3 Timeout Handling

1. Restore `OPENAI_API_KEY` in `.env`
2. Restart dev server
3. Submit a very long, complex request
4. **Expected**: If AI takes >10 seconds, shows "Analysis timed out. Please try again."

---

## Step 5: Test Navigation

1. On analysis results page, click "Submit Another Request"
2. **Expected**: Navigates back to form
3. Fill out another request
4. Submit and analyze
5. On results page, click browser back button
6. **Expected**: Returns to form or dashboard

---

## Performance Testing

### Measure AI Analysis Time

1. Open browser DevTools (F12)
2. Go to Network tab
3. Submit a maintenance request
4. Note the time for `/api/maintenance/analyze` call
5. **Target**: < 5 seconds
6. **Maximum**: < 10 seconds (timeout)

### Measure Database Save Time

1. On analysis results page, click "Save to History"
2. Note the time for `/api/maintenance/save` call
3. **Target**: < 500ms

---

## Common Issues & Solutions

### Issue: "AI service not configured"

**Solution**: Add `OPENAI_API_KEY` to `.env` file and restart server

### Issue: "Unauthorized" when saving

**Solution**: Ensure you're logged in. Try logging out and back in.

### Issue: Analysis takes too long (>10 seconds)

**Solution**:

- Check your internet connection
- Verify OpenAI API key is valid
- Try a simpler description

### Issue: Build errors

**Solution**: Run `npm run build` to see specific errors. Check TypeScript types.

### Issue: Database connection errors

**Solution**:

- Verify PostgreSQL is running: `psql -U thiagoricci -d property_maintenance`
- Check `DATABASE_URL` in `.env` matches your setup
- Run migrations: `npx prisma migrate dev`

---

## Testing Checklist

Use this checklist to verify Phase 3 is working correctly:

### Authentication

- [ ] Can sign up new user
- [ ] Can log in with existing user
- [ ] Dashboard displays user name
- [ ] Logout button works

### Form

- [ ] Form validates required fields
- [ ] Character counter updates in real-time
- [ ] Validation errors display correctly
- [ ] Optional fields work when filled
- [ ] Optional fields work when empty

### AI Analysis

- [ ] Submit button shows loading state
- [ ] AI returns analysis within 5 seconds
- [ ] All 5 components present in response
- [ ] Urgency classification is accurate
- [ ] Cost estimates are reasonable
- [ ] Contractor type is specified
- [ ] Next steps are actionable

### Results Display

- [ ] Results page displays correctly
- [ ] Urgency badge has correct color
- [ ] All sections are readable
- [ ] Timestamp shows correctly
- [ ] Cards are well-styled

### Save Functionality

- [ ] Save button triggers API call
- [ ] Request saved to database
- [ ] Redirects to dashboard
- [ ] Success message appears
- [ ] Request appears in Prisma Studio

### Error Handling

- [ ] Form validation errors show
- [ ] API errors display user-friendly messages
- [ ] Timeout errors handled
- [ ] Can resubmit after error
- [ ] Unauthorized users cannot save

### Performance

- [ ] AI analysis completes in < 5 seconds
- [ ] Database save completes in < 500ms
- [ ] Page navigation is smooth
- [ ] No console errors

---

## Success Criteria

Phase 3 testing is successful when:

✅ All items in testing checklist above are complete
✅ AI analysis provides helpful, accurate results
✅ Save to database works reliably
✅ Error handling is graceful and user-friendly
✅ Performance meets targets (<5s for AI, <500ms for DB)
✅ Build completes without errors
✅ No console errors in browser DevTools

---

## Next Steps After Testing

Once Phase 3 is tested and working:

1. **Document any bugs or issues found**
2. **Report back with test results**
3. **Proceed to Phase 4**: Request History & Management
   - Build request history list
   - Implement filtering by urgency
   - Add pagination
   - Create request detail view
   - Add delete functionality

---

## Support

If you encounter issues during testing:

1. Check browser console for errors (F12 → Console tab)
2. Check terminal for server errors
3. Review implementation plan: [`plans/phase3-ai-analysis-engine.md`](plans/phase3-ai-analysis-engine.md:1)
4. Review completion report: [`PHASE3_COMPLETION.md`](PHASE3_COMPLETION.md:1)

---

**Happy Testing! 🚀**
