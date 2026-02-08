# Jawafdehi Frontend - Product Guide

## Overview

React-based public-facing web application for browsing and interacting with Nepal's open corruption database. This frontend provides a bilingual (English/Nepali) interface for citizens to view cases, explore entity profiles, and submit allegations.

## Core Features

- **Browse Cases**: View allegations of corruption and misconduct
- **Entity Profiles**: Explore profiles of public officials and organizations
- **Submit Allegations**: Allow users to submit new cases
- **Bilingual Support**: Full English and Nepali language support
- **Responsive Design**: Mobile-first, accessible interface
- **Real-time Data**: Powered by React Query for efficient data fetching

## Technology Stack

- **Language**: TypeScript
- **Runtime**: Bun
- **Package Manager**: Bun
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: react-router-dom
- **UI Components**: Radix UI, shadcn/ui
- **Styling**: Tailwind CSS
- **Forms**: react-hook-form, zod
- **State Management**: @tanstack/react-query
- **Internationalization**: i18next, react-i18next
- **Testing**: Vitest, jsdom

## Project Structure

```
services/jawafdehi-frontend/
├── src/
│   ├── components/       # React components
│   │   └── ui/          # Reusable UI components (shadcn)
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API services
│   ├── api/             # API client code
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── i18n/            # Internationalization
│   │   ├── config.ts    # i18n configuration
│   │   └── locales/     # Translation files
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── tests/               # Test files
├── docs/                # Documentation
├── package.json         # npm configuration
├── tsconfig.json        # TypeScript config
├── vite.config.ts       # Vite config
└── tailwind.config.ts   # Tailwind config
```

## Common Commands

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun run build

# Run tests
bun test

# Lint
bun run lint

# Preview production build
bun run preview

# Deploy (GitHub Pages)
bun run deploy
```

**Important**: Always use `bun` for testing and package management, NOT `npm`.

## Code Quality Standards

- **Linter**: ESLint
- **Type Checking**: TypeScript strict mode
- **Testing**: Vitest
- **Component Library**: shadcn/ui for consistent UI patterns

## Development Conventions

- **Components**: Organized by feature/page, with shared UI components
- **Routing**: File-based routing with react-router-dom
- **State Management**: 
  - React Query for server state
  - React hooks for local state
- **Styling**: Tailwind utility classes, shadcn components
- **i18n**: Separate locale files for English and Nepali

## Testing Conventions

- **Framework**: Vitest with jsdom
- **Property Testing**: Vitest for component and integration tests
- **Test Data**: Use authentic Nepali names and entities
- **Coverage**: Component, integration, and E2E tests

## Deployment

- **Platform**: Google Cloud Platform (Cloud Run)
- **Production URL**: https://beta.jawafdehi.org (this is the production endpoint)
- **Build Output**: `dist/` directory
- **Development Server Port**: 8080
- **Development URL Examples**:
  - Production: https://beta.jawafdehi.org/case/175
  - Local equivalent: http://localhost:8080/case/175

**Note**: Despite having "beta" in the URL, https://beta.jawafdehi.org is the actual production endpoint where the live application runs. This is intentional naming, not a staging environment.

## Key Principles

- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Optimized bundle size and lazy loading
- **Nepali Context**: Authentic Nepali names, organizations, and locations
- **Bilingual First**: Equal support for English and Nepali
- **Mobile-First**: Responsive design for all screen sizes
- **Open Data**: Transparent access to accountability information

## Documentation & Verification

- **Screenshots**: Always provide screenshots when making UI changes or when verifying functionality. Screenshots are preferred for validation and documentation purposes.
