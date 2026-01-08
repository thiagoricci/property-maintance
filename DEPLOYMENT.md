# Deployment Guide

This guide covers deploying the AI-Assisted Property Maintenance Tool to production on Vercel with Vercel Postgres.

## Prerequisites

Before deploying, ensure you have:

- A Vercel account ([vercel.com](https://vercel.com))
- An OpenAI API key ([platform.openai.com](https://platform.openai.com))
- Git installed and configured
- Node.js 18+ installed

## Quick Deployment Steps

### 1. Prepare Your Code

The codebase is already prepared for deployment:

- ✅ `.env.example` with all required variables
- ✅ `.gitignore` excludes sensitive files
- ✅ Build completes successfully
- ✅ No console.log statements in production code
- ✅ Favicon and metadata configured

### 2. Set Up Vercel Postgres Database

1. Log in to [Vercel](https://vercel.com)
2. Navigate to your project or create a new one
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose a region (closest to your users)
7. Click **Create**

**Pricing**: Free tier includes 512MB storage and 60 hours compute/month.

### 3. Get Database Connection String

1. In Vercel dashboard, go to **Storage** > **Postgres**
2. Click on your database
3. Go to **Settings** > **Connection String**
4. Copy the connection string

Format: `postgres://postgres.[user]:[password]@[host]/[database]?sslmode=require`

### 4. Deploy to Vercel

#### Option A: GitHub Integration (Recommended)

1. Push your code to GitHub:

   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. Connect repository to Vercel:

   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Click **Deploy**

3. Vercel will automatically build and deploy your app.

#### Option B: Vercel CLI

1. Install Vercel CLI:

   ```bash
   npm i -g vercel
   ```

2. Login:

   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

### 5. Configure Environment Variables

In Vercel dashboard, go to **Settings** > **Environment Variables** and add:

| Variable          | Value                                   | Environment                      |
| ----------------- | --------------------------------------- | -------------------------------- |
| `DATABASE_URL`    | Your Postgres connection string         | Production, Preview, Development |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | Production, Preview, Development |
| `NEXTAUTH_URL`    | `https://your-domain.vercel.app`        | Production, Preview, Development |
| `OPENAI_API_KEY`  | Your OpenAI API key                     | Production, Preview, Development |
| `NODE_ENV`        | `production`                            | Production                       |

**Important**: After adding variables, redeploy your app from the Vercel dashboard.

### 6. Run Database Migrations

Once deployed with environment variables configured, run migrations:

```bash
# Set DATABASE_URL to your production database
export DATABASE_URL="your-production-connection-string"

# Push schema to production database
npx prisma db push
```

Or use Vercel Postgres dashboard to run migrations automatically.

## Post-Deployment Checklist

### Immediate Verification

- [ ] App loads at production URL
- [ ] No console errors in browser
- [ ] SSL certificate valid (HTTPS)
- [ ] Homepage displays correctly

### Functional Testing

- [ ] User can sign up with new account
- [ ] User can log in with existing account
- [ ] User can submit maintenance request
- [ ] AI analysis completes successfully
- [ ] Request saves to database
- [ ] Dashboard displays request history
- [ ] Filtering by urgency works
- [ ] Request detail view loads
- [ ] User can log out

### Cross-Browser Testing

Test on:

- [ ] Google Chrome (latest)
- [ ] Mozilla Firefox (latest)
- [ ] Safari (latest, if on macOS)
- [ ] Microsoft Edge (latest)

### Responsive Testing

- [ ] Desktop view (1920x1080)
- [ ] Tablet view (768x1024)
- [ ] Mobile view (375x667)

## Environment Variables Reference

### Development (Local)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/property_maintenance"
NEXTAUTH_SECRET="development-secret"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-proj-..."
NODE_ENV="development"
```

### Production (Vercel)

```env
DATABASE_URL="postgres://postgres.[user]:[password]@[host]/[database]?sslmode=require"
NEXTAUTH_SECRET="strong-random-secret-32-chars"
NEXTAUTH_URL="https://your-app.vercel.app"
OPENAI_API_KEY="sk-proj-..."
NODE_ENV="production"
```

## Troubleshooting

### Build Fails

**Issue**: Build fails with TypeScript errors

**Solution**:

```bash
npm run lint
# Fix any linting errors
npm run build
```

### Database Connection Failed

**Issue**: App can't connect to production database

**Solutions**:

1. Verify DATABASE_URL in Vercel environment variables
2. Check database is active in Vercel dashboard
3. Ensure connection string includes `sslmode=require`
4. Try `npx prisma db push` again

### NextAuth Session Issues

**Issue**: Users can't log in

**Solutions**:

1. Verify NEXTAUTH_SECRET is set (32+ characters)
2. Verify NEXTAUTH_URL matches production domain exactly
3. Clear browser cookies
4. Check Vercel logs for errors

### AI Analysis Fails

**Issue**: AI analysis returns errors

**Solutions**:

1. Verify OPENAI_API_KEY is set correctly
2. Check API key has sufficient credits
3. Increase timeout in API route if needed
4. Check Vercel logs for AI SDK errors

### Deployment Fails

**Issue**: Vercel deployment fails

**Solutions**:

1. Check build logs in Vercel dashboard
2. Verify all dependencies in package.json
3. Check for missing environment variables
4. Try redeploying from Vercel dashboard

### Prisma Client Initialization Error on Vercel

**Issue**: Error: "Prisma has detected that this project was built on Vercel, which caches dependencies. This leads to an outdated Prisma Client because Prisma's auto-generation isn't triggered."

**Cause**: Vercel caches dependencies between builds, and Prisma Client needs to be regenerated during the build process to ensure it's compatible with the current database schema.

**Solution**: The build script in package.json has been updated to include `prisma generate`:

```json
"scripts": {
  "build": "prisma generate && next build"
}
```

This ensures that Prisma Client is regenerated during every build on Vercel, preventing initialization errors.

**If you still encounter this error**:

1. Verify package.json contains the updated build script
2. Clear Vercel build cache: Go to Vercel Dashboard > Settings > Git > Build Cache > Clear
3. Redeploy from Vercel dashboard
4. Check that `prisma generate` appears in the build logs

### Build Error: Failed to collect page data for /api/auth/[...nextauth]

**Issue**: Build fails with error "Failed to collect page data for /api/auth/[...nextauth]"

**Cause**: Unused import in middleware.ts that causes circular dependency during build

**Solution**: Ensure middleware.ts only imports what it needs. The middleware should only use `getToken` from `next-auth/jwt`, not `authOptions` from `@/lib/auth`.

**Fixed in version**: The middleware.ts file has been corrected to remove the unused import. If you encounter this error, verify that middleware.ts only contains:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
```

Do NOT import `authOptions` or other database-related code in middleware, as this causes build-time issues.

## Monitoring

### Vercel Analytics

Vercel provides built-in analytics:

- Page views
- Web Vitals (LCP, FID, CLS)
- Real User Monitoring (RUM)

Access from: Vercel Dashboard > Analytics

### Database Monitoring

Monitor your Vercel Postgres database:

- Storage usage
- Compute hours
- Connection count
- Query performance

Access from: Vercel Dashboard > Storage > Postgres

### Error Tracking

Monitor errors in Vercel:

- Build errors
- Runtime errors
- API route errors
- Function logs

Access from: Vercel Dashboard > Logs

## Security Best Practices

1. **Never commit secrets**: Ensure `.env` files are in `.gitignore`
2. **Use strong secrets**: Generate NEXTAUTH_SECRET with `openssl rand -base64 32`
3. **Rotate secrets**: Regularly update API keys and secrets
4. **Monitor usage**: Track API usage and costs
5. **Enable HTTPS**: Vercel automatically provides HTTPS
6. **Rate limiting**: API routes have built-in rate limiting

## Performance Optimization

### Build Optimization

The app is already optimized:

- Server Components by default
- Code splitting via Next.js
- Image optimization with Next.js Image
- Minified JavaScript bundles

### Database Optimization

- Indexes on `userId` and `createdAt`
- Connection pooling via Prisma
- Query result caching (consider adding)

### CDN

Vercel automatically serves static assets via CDN:

- Images
- Fonts
- Static pages
- JavaScript bundles

## Scaling Considerations

### When to Scale

- **10-100 users**: Free tier sufficient
- **100-1000 users**: Upgrade Vercel Postgres plan
- **1000+ users**: Consider:
  - Redis for session caching
  - CDN for static assets
  - Database read replicas
  - API response caching

### Cost Estimates

**Vercel Postgres**:

- Free: 512MB storage, 60 hours compute
- Pro: $20/month, 8GB storage, 500 hours compute
- Enterprise: Custom pricing

**OpenAI API**:

- GPT-4: ~$0.03-0.06 per 1K tokens
- Typical analysis: ~500 tokens = ~$0.015-0.03
- 1000 requests/month: ~$15-30

**Vercel Hosting**:

- Hobby: Free (100GB bandwidth, 100GB-hrs compute)
- Pro: $20/month (1TB bandwidth, 1000GB-hrs compute)

## Rollback Procedure

If you need to rollback to a previous deployment:

1. Go to Vercel Dashboard > Deployments
2. Find the deployment you want to rollback to
3. Click the three dots (...)
4. Click "Promote to Production"

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## Next Steps After Deployment

1. **Monitor**: Watch logs and analytics for first 24-48 hours
2. **Gather Feedback**: Get feedback from early users
3. **Iterate**: Fix bugs and improve based on feedback
4. **Scale**: Upgrade plans as usage grows
5. **Enhance**: Add features based on user needs

---

**Document Version**: 1.0
**Last Updated**: January 8, 2026
**Status**: Ready for Production Deployment
