# Phase 5 Component Architecture

## UI Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Root                        │
│                     (app/layout.tsx)                         │
│  - ToastProvider                                             │
│  - SessionProvider                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Route Groups                             │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │   (auth) Routes     │    │   (dashboard) Routes       │ │
│  │                     │    │                             │ │
│  │  - login/page.tsx   │    │  - layout.tsx              │ │
│  │  - signup/page.tsx  │    │    - ErrorBoundary         │ │
│  │                     │    │  - dashboard/page.tsx      │ │
│  │  Uses:              │    │  - requests/new/page.tsx   │ │
│  │  - Button           │    │  - requests/[id]/page.tsx │ │
│  │  - Input            │    │  - analysis/page.tsx        │ │
│  │  - Alert            │    │                             │ │
│  │  - LoadingSpinner   │    │  Uses:                      │ │
│  │  - PasswordStrength│    │  - Button                   │ │
│  │  - Toast           │    │  - Card                     │ │
│  │                     │    │  - Badge                    │ │
│  └─────────────────────┘    │  - Input                    │ │
│                             │  - LoadingSpinner           │ │
│                             │  - SkeletonCard             │ │
│                             │  - Alert                    │ │
│                             │  - Modal                    │ │
│                             │  - Toast                   │ │
│                             └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Reusable UI Components                      │
│                   (components/ui/)                            │
├─────────────────────────────────────────────────────────────────┤
│  button.tsx           - Primary, secondary, danger variants   │
│  input.tsx            - Text, email, password, textarea     │
│  badge.tsx            - Success, warning, error, info         │
│  card.tsx             - Header, body, footer sections        │
│  loading-spinner.tsx   - Size variants, with/without text    │
│  alert.tsx            - Success, error, warning, info        │
│  modal.tsx            - Open/close, backdrop click           │
│  skeleton-card.tsx     - Card placeholder skeleton          │
│  skeleton-text.tsx     - Text placeholder skeleton          │
│  password-strength-indicator.tsx - Visual strength meter    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Custom Hooks                            │
│                       (lib/hooks/)                          │
├─────────────────────────────────────────────────────────────────┤
│  use-toast.ts          - Show/hide toasts                   │
│  use-password-strength.ts - Calculate password strength      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Context Providers                         │
│                   (components/ui/)                           │
├─────────────────────────────────────────────────────────────────┤
│  toast-provider.tsx   - Toast context and state management  │
│  error-boundary.tsx   - React Error Boundary component      │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌──────────────────┐
│  User Action     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  API Request    │
└────────┬─────────┘
         │
         ▼
    ┌────────┐
    │ Error? │
    └───┬────┘
        │
   ┌────┴────┐
   │         │
   ▼         ▼
┌─────┐  ┌────────────┐
│ Yes │  │   Success   │
└──┬──┘  └─────┬──────┘
   │            │
   ▼            ▼
┌──────────┐  ┌──────────────┐
│ API Route│  │ Show Success │
│ Returns  │  │   Toast      │
│  Error   │  └──────────────┘
└────┬─────┘
     │
     ▼
┌──────────────────┐
│ Client Receives │
│   Error        │
└────────┬───────┘
         │
         ▼
┌──────────────────┐
│ Show Error Toast│
│  (useToast)     │
└──────────────────┘
```

## Form Validation Flow

```
┌──────────────────┐
│  User Input     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  onChange Event │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Validate Field  │
│  (Debounced)    │
└────────┬─────────┘
         │
         ▼
    ┌────────┐
    │ Valid? │
    └───┬────┘
        │
   ┌────┴────┐
   │         │
   ▼         ▼
┌─────┐  ┌────────────┐
│ Yes │  │    No      │
└──┬──┘  └─────┬──────┘
   │            │
   ▼            ▼
┌──────────┐  ┌──────────────┐
│ Clear    │  │ Show Error   │
│  Error   │  │  Message    │
└──────────┘  └──────────────┘
```

## Loading State Flow

```
┌──────────────────┐
│  User Action    │
│  (Submit, etc.) │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Set isLoading   │
│   = true       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Show Loading    │
│  State         │
│  (Spinner or    │
│   Skeleton)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  API Request    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Response      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Set isLoading   │
│   = false      │
└──────────────────┘
```

## Responsive Breakpoints

```
┌─────────────────────────────────────────────────────────────────┐
│  Desktop (lg: 1024px+)                                     │
│  - Multi-column layouts                                      │
│  - Side-by-side cards                                       │
│  - Horizontal navigation                                    │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Tablet (md: 768px - 1023px)                              │
│  - Adjusted column layouts                                   │
│  - Stacked cards where needed                                │
│  - Responsive navigation                                     │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Mobile (sm: < 768px)                                      │
│  - Single column layouts                                     │
│  - Full-width components                                    │
│  - Stacked navigation                                      │
│  - Touch-friendly targets (44x44px min)                     │
└─────────────────────────────────────────────────────────────────┘
```

## Component Usage by Page

### Login Page

```
Button (primary, secondary)
Input (email, password)
Alert (error)
LoadingSpinner
Toast
```

### Signup Page

```
Button (primary, secondary)
Input (text, email, password)
PasswordStrengthIndicator
Alert (error)
LoadingSpinner
Toast
```

### Dashboard

```
Button (primary, secondary)
Card
Badge (urgency levels)
LoadingSpinner
SkeletonCard
Alert (error, empty state)
Toast
ErrorBoundary
```

### New Request Form

```
Button (primary, secondary)
Input (textarea, text, select)
Alert (error)
LoadingSpinner
Toast
```

### Request Detail

```
Button (primary, secondary, danger)
Card
Badge
Alert (error)
LoadingSpinner
Modal (delete confirmation)
Toast
ErrorBoundary
```

### Analysis Results

```
Button (primary, secondary)
Card
Badge
Alert (success, error)
LoadingSpinner
Toast
```

## File Structure After Phase 5

```
components/
├── ui/
│   ├── button.tsx
│   ├── input.tsx
│   ├── badge.tsx
│   ├── card.tsx
│   ├── loading-spinner.tsx
│   ├── alert.tsx
│   ├── modal.tsx
│   ├── skeleton-card.tsx
│   ├── skeleton-text.tsx
│   ├── password-strength-indicator.tsx
│   ├── toast.tsx
│   ├── toast-provider.tsx
│   ├── error-boundary.tsx
│   └── index.ts
├── providers.tsx
└── (existing components)

lib/
├── hooks/
│   ├── use-toast.ts
│   └── use-password-strength.ts
└── (existing utilities)

app/
├── layout.tsx (with ToastProvider)
├── (auth)/
│   ├── login/page.tsx (refactored)
│   └── signup/page.tsx (refactored)
└── (dashboard)/
    ├── layout.tsx (with ErrorBoundary)
    ├── dashboard/page.tsx (refactored)
    ├── requests/
    │   ├── new/page.tsx (refactored)
    │   └── [id]/page.tsx (refactored)
    └── analysis/page.tsx (refactored)
```

---

**Document Version**: 1.0
**Created**: January 7, 2026
