# Page Title Implementation Guide

## Overview
This project uses a standardized page title format: `KOBRA - Project Management Apps | {Page Name}` with a custom favicon.

## Implementation

### For Client Components ("use client")
Use the `useDocumentTitle` hook:

```typescript
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

function MyPage() {
  useDocumentTitle("Page Name");
  // ... rest of component
}
```

### For Server Components
Use Next.js metadata export:

```typescript
import { generateMetadata } from "../../metadata";
import type { Metadata } from 'next'

export const metadata: Metadata = generateMetadata("Page Name")

function MyPage() {
  // ... component code
}
```

## Examples

### Client Component Example
```typescript
// app/(pages)/teams/page.tsx
"use client";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

function TeamsPage() {
  useDocumentTitle("Teams Management");
  // Result: "KOBRA - Project Management Apps | Teams Management"
}
```

### Server Component Example
```typescript
// app/(pages)/about/page.tsx
import { generateMetadata } from "../../metadata";

export const metadata = generateMetadata("About Us")
// Result: "KOBRA - Project Management Apps | About Us"
```

## Files Structure
- `/src/app/metadata.ts` - Metadata configuration
- `/src/app/hooks/useDocumentTitle.ts` - Client-side title hook
- `/src/app/layout.tsx` - Root layout with default metadata
- `/public/img/favicon-bjb.png` - Custom favicon

## Implementation Status
✅ Root layout with default metadata and favicon
✅ useDocumentTitle hook for client components
✅ Examples implemented:
  - Home page: "Dashboard"
  - Landing page: "Login"  
  - Projects Import: "Project Import"
  - Teams: "Teams Management"

## Next Steps
Apply this pattern to all remaining pages using appropriate page names.
