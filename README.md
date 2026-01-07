# AI-Assisted Property Maintenance Tool - MVP

A web-based application that leverages artificial intelligence to streamline property maintenance management. The tool analyzes maintenance issues submitted by property managers and landlords, providing instant diagnostic assessments, cost estimates, and actionable recommendations.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- Git
- PostgreSQL database (Vercel Postgres or Supabase recommended)
- OpenAI or Anthropic API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd property-maintenance
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your values:

   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: `http://localhost:3000` for development
   - `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`: Your AI provider API key

4. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Run the development server**

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 📋 Features

- **User Authentication**: Secure login and registration system
- **Maintenance Request Submission**: Text-based issue reporting with optional property details
- **AI-Powered Analysis**: Automated diagnosis with urgency classification, cost estimation, and contractor recommendations
- **Request History Dashboard**: Track and filter past maintenance requests
- **Responsive Web Interface**: Clean, functional UI optimized for desktop use

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js for authentication
- **AI Integration**: Vercel AI SDK with OpenAI GPT-4 or Anthropic Claude
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel platform

## 📁 Project Structure

```
property-maintenance/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Auth route group
│   ├── (dashboard)/              # Protected dashboard routes
│   ├── api/                      # API routes
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components
│   ├── auth/                     # Auth-specific components
│   ├── dashboard/                # Dashboard components
│   └── maintenance/              # Maintenance request components
├── lib/                          # Utility functions and configurations
│   ├── auth.ts                   # NextAuth configuration
│   ├── prisma.ts                 # Prisma client singleton
│   ├── ai/                       # AI-related utilities
│   └── validations.ts           # Input validation schemas
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/              # Database migrations
├── public/                       # Static assets
├── middleware.ts                 # Route protection middleware
└── package.json                   # Dependencies and scripts
```

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📖 Documentation

- [Product Requirements Document](./.kilocode/rules/PRD.md)
- [Architecture Documentation](./.kilocode/rules/memory-bank/architecture.md)
- [Technical Documentation](./.kilocode/rules/memory-bank/tech.md)

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test
```

## 🤝 Contributing

This is an MVP project. Contributions are welcome but please note that this is in active development.

## 📝 License

MIT License - see LICENSE file for details

## 📞 Support

For questions or issues, please open an issue on GitHub.

## 🎯 Project Status

**Current Phase**: Phase 0 - Pre-Development

**Target Timeline**: 4 weeks from initialization to production deployment

**Next Steps**: Initialize Next.js project and begin Phase 1 development

---

Built with ❤️ for property managers and landlords
