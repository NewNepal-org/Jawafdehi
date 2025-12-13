# Case Detail Page Layout Options

This document describes the four layout variants created for the Case Detail page redesign.

## Overview

All layouts support the new `thumbnail_url` field in the Case interface and use the test image:
```
https://s3.jawafdehi.org/cases/giribandhu/giribandhu-tea-estate.jpeg
```

## Accessing the Layouts

To preview all four layouts for any case:

1. Navigate to: `/case/{id}/layout/selector`
   - Example: `/case/175/layout/selector`

2. Choose a layout to preview:
   - Layout 1: `/case/{id}/layout/1`
   - Layout 2: `/case/{id}/layout/2`
   - Layout 3: `/case/{id}/layout/3`
   - Layout 4: `/case/{id}/layout/4`

## Layout Descriptions

### Layout 1: Hero Image with Overlay

**File:** `src/pages/case-layouts/CaseDetailLayout1.tsx`

**Key Features:**
- Full-width hero image (500px height) at the top
- Dark gradient overlay for text readability
- Title, badges, and metadata overlaid on the image bottom
- Metadata displayed in white text on the image
- Content flows below the hero section
- Magazine-style, dramatic presentation

**Best For:**
- Cases with compelling, high-quality images
- Creating strong visual impact
- Drawing immediate attention to the case

**Design Elements:**
- Hero image with gradient: `bg-gradient-to-t from-black/80 via-black/40 to-transparent`
- White text with drop shadows for readability
- Badges with adjusted opacity for overlay visibility
- Three-column metadata grid on image bottom

---

### Layout 2: Side-by-Side

**File:** `src/pages/case-layouts/CaseDetailLayout2.tsx`

**Key Features:**
- Two-column layout (desktop), stacked on mobile
- Image in left column with sticky positioning
- Content in right column
- Key information cards in left column below image
- Clean, organized presentation

**Best For:**
- Cases requiring detailed information alongside imagery
- Professional, report-style presentation
- Desktop-focused viewing

**Design Elements:**
- Sticky image on scroll: `sticky top-6`
- Separate metadata cards with icons
- Grid layout: `grid grid-cols-1 lg:grid-cols-2`
- Full-width sections below two-column area

---

### Layout 3: Card-Based with Featured Image

**File:** `src/pages/case-layouts/CaseDetailLayout3.tsx`

**Key Features:**
- Featured image in prominent card at top (400px height)
- Three-column metadata card grid
- All content organized in distinct cards
- Clean, modular sections
- Well-defined information hierarchy

**Best For:**
- Structured, easy-to-scan information
- Mobile-friendly card-based design
- Cases with multiple distinct information types

**Design Elements:**
- Featured image card with rounded corners
- Metadata cards in 3-column grid: `grid-cols-1 md:grid-cols-3`
- Consistent card styling throughout
- Icon-based section headers

---

### Layout 4: Compact Inline

**File:** `src/pages/case-layouts/CaseDetailLayout4.tsx`

**Key Features:**
- Title and badges first
- Image floats to right (desktop) or displays at top (mobile)
- Inline metadata with icons
- Information-dense, compact design
- Traditional article/blog style

**Best For:**
- Text-heavy cases
- Traditional article layout preferences
- Maximum content density
- Desktop text-focused reading

**Design Elements:**
- Floating image: `md:float-right md:ml-6`
- Inline metadata with label-value pairs
- Compact spacing
- Responsive float behavior

---

## Common Features Across All Layouts

All four layouts include:

1. **Header Elements:**
   - Case status badge
   - Case type badge (Corruption/Broken Promise)
   - Tag badges
   - Case title

2. **Metadata:**
   - Alleged entities (with links to entity profiles)
   - Location (with links to entity profiles)
   - Case period/dates

3. **Content Sections:**
   - Key allegations (numbered list)
   - Related entities/parties involved
   - Overview/description (with HTML rendering)
   - Timeline (if available)
   - Evidence (if available)
   - Audit history (if available)

4. **Responsive Design:**
   - Mobile-first approach
   - Breakpoints for tablets and desktop
   - Touch-friendly interactive elements

5. **Accessibility:**
   - Semantic HTML structure
   - Icon + text labels
   - Proper heading hierarchy
   - Screen reader friendly

## Technical Implementation

### Type Definition

The `Case` interface in `src/types/jds.ts` has been updated to include:

```typescript
export interface Case {
  // ... existing fields
  thumbnail_url?: string | null; // Optional thumbnail image URL
  // ... other fields
}
```

### Fallback Behavior

If no `thumbnail_url` is provided by the API, all layouts use the test image:
```typescript
const thumbnailUrl = caseData.thumbnail_url || "https://s3.jawafdehi.org/cases/giribandhu/giribandhu-tea-estate.jpeg";
```

### Routing

Routes are configured in `src/App.tsx`:
```typescript
<Route path="/case/:id/layout/selector" element={<CaseDetailLayoutDemo />} />
<Route path="/case/:id/layout/:layout" element={<CaseDetailLayoutDemo />} />
```

## Testing

To test the layouts:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to a case layout selector:
   ```
   http://localhost:8080/case/175/layout/selector
   ```

3. Click on any layout option to preview it

4. Use the "Back to Layout Selector" button to return and try another layout

## Recommendations

After reviewing the layouts, here are our recommendations:

**For general use:** Layout 3 (Card-Based) offers the best balance of visual appeal, information organization, and mobile responsiveness.

**For high-impact cases:** Layout 1 (Hero Image) creates the strongest visual impression and is ideal for flagship cases.

**For detailed reports:** Layout 2 (Side-by-Side) works well for cases requiring extensive documentation review.

**For text-heavy content:** Layout 4 (Compact Inline) maximizes content density while maintaining readability.

## Next Steps

1. Review each layout with stakeholders
2. Select preferred layout or identify elements from multiple layouts to combine
3. Update main `CaseDetail.tsx` component with chosen design
4. Remove unused layout files
5. Add any final polish and refinements
