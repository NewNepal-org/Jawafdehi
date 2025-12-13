# Case Detail Page - Layout Visual Guide

This guide provides a visual description of each layout variant to help stakeholders understand the design differences.

## How to View the Layouts Live

Visit any case with the layout selector:
- **Layout Selector:** `https://beta.jawafdehi.org/case/175/layout/selector`
- **Layout 1:** `https://beta.jawafdehi.org/case/175/layout/1`
- **Layout 2:** `https://beta.jawafdehi.org/case/175/layout/2`
- **Layout 3:** `https://beta.jawafdehi.org/case/175/layout/3`
- **Layout 4:** `https://beta.jawafdehi.org/case/175/layout/4`

---

## Layout 1: Hero Image with Overlay

### Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Header (Navigation)                                          │
├─────────────────────────────────────────────────────────────┤
│ [← Back to Cases]                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              HERO IMAGE (Full Width, 500px)                │
│                                                             │
│              [Gradient Overlay: Dark at bottom]            │
│                                                             │
│   ┌──────────────────────────────────────────────┐         │
│   │ [Ongoing] [Corruption] [Tag1] [Tag2]        │         │
│   │                                              │         │
│   │ CASE TITLE IN LARGE WHITE TEXT              │         │
│   │                                              │         │
│   │ 👤 Alleged: Name    📍 Location    📅 Period │         │
│   └──────────────────────────────────────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🚨 Key Allegations                                      │ │
│ │ 1. First allegation...                                  │ │
│ │ 2. Second allegation...                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Additional content sections below...]                      │
```

**Characteristics:**
- **Image Position:** Full-width at top, dominates the page
- **Title Position:** Overlaid on image with white text
- **Metadata:** Displayed on image in white text
- **Visual Impact:** ⭐⭐⭐⭐⭐ Very high
- **Information Density:** ⭐⭐⭐ Medium

---

## Layout 2: Side-by-Side

### Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Header (Navigation)                                          │
├─────────────────────────────────────────────────────────────┤
│ [← Back to Cases]                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌────────────────────┬────────────────────────────────────┐ │
│ │                    │ [Ongoing] [Corruption] [Tags]     │ │
│ │    IMAGE           │                                    │ │
│ │   (Sticky)         │ CASE TITLE                        │ │
│ │                    │                                    │ │
│ │                    ├────────────────────────────────────┤ │
│ │                    │ 🚨 Key Allegations                 │ │
│ ├────────────────────┤ • Allegation 1                     │ │
│ │ 📋 Key Info        │ • Allegation 2                     │ │
│ │                    │                                    │ │
│ │ 👤 Alleged:        ├────────────────────────────────────┤ │
│ │    Names...        │ 📄 Overview                        │ │
│ │                    │ Description text...                │ │
│ │ 📍 Location:       │                                    │ │
│ │    Place...        ├────────────────────────────────────┤ │
│ │                    │ 👥 Related Entities                │ │
│ │ 📅 Period:         │ Names...                           │ │
│ │    Dates...        │                                    │ │
│ └────────────────────┴────────────────────────────────────┘ │
│                                                             │
│ [Timeline, Evidence sections full-width below...]           │
```

**Characteristics:**
- **Image Position:** Left column, sticky on scroll
- **Title Position:** Top of right column
- **Metadata:** Organized in left column cards
- **Visual Impact:** ⭐⭐⭐⭐ High
- **Information Density:** ⭐⭐⭐⭐ High

---

## Layout 3: Card-Based with Featured Image

### Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Header (Navigation)                                          │
├─────────────────────────────────────────────────────────────┤
│ [← Back to Cases]                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Ongoing] [Corruption] [Tag1] [Tag2]                       │
│                                                             │
│ CASE TITLE                                                  │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │              FEATURED IMAGE                             │ │
│ │              (400px height)                             │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌──────────────┬──────────────┬──────────────┐             │
│ │ 👤 Alleged   │ 📍 Location  │ 📅 Period    │             │
│ │ Entities     │              │              │             │
│ │ Names...     │ Place...     │ Dates...     │             │
│ └──────────────┴──────────────┴──────────────┘             │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🚨 Key Allegations                                      │ │
│ │ 1. First allegation...                                  │ │
│ │ 2. Second allegation...                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [More card sections below...]                               │
```

**Characteristics:**
- **Image Position:** Featured card near top
- **Title Position:** Above image
- **Metadata:** Three-column card grid
- **Visual Impact:** ⭐⭐⭐⭐ High
- **Information Density:** ⭐⭐⭐⭐ High

---

## Layout 4: Compact Inline

### Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Header (Navigation)                                          │
├─────────────────────────────────────────────────────────────┤
│ [← Back to Cases]                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Ongoing] [Corruption] [Tag1] [Tag2]                       │
│                                          ┌────────────────┐ │
│ CASE TITLE                               │                │ │
│                                          │     IMAGE      │ │
│ 👤 Alleged: Name, Name                   │   (Floated)    │ │
│ 📍 Location: Place                       │                │ │
│ 📅 Period: Date - Date                   └────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🚨 Key Allegations                                      │ │
│ │ 1. First allegation...                                  │ │
│ │ 2. Second allegation...                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [More sections below...]                                    │
```

**Characteristics:**
- **Image Position:** Floats to right (desktop), top (mobile)
- **Title Position:** Top, before image
- **Metadata:** Inline with icons, compact format
- **Visual Impact:** ⭐⭐⭐ Medium
- **Information Density:** ⭐⭐⭐⭐⭐ Very high

---

## Feature Comparison Table

| Feature | Layout 1 | Layout 2 | Layout 3 | Layout 4 |
|---------|----------|----------|----------|----------|
| **Image Prominence** | Very High | High | High | Medium |
| **Title Visibility** | High (on image) | High | High | Very High |
| **Metadata Organization** | Overlay | Sidebar Cards | Grid Cards | Inline |
| **Mobile Experience** | Excellent | Good | Excellent | Very Good |
| **Desktop Experience** | Excellent | Excellent | Very Good | Good |
| **Content Density** | Medium | High | High | Very High |
| **Visual Impact** | Dramatic | Professional | Balanced | Traditional |
| **Best Use Case** | Flagship cases | Detailed reports | General use | Text-heavy |

---

## Responsive Behavior

### Mobile (< 768px)
- **Layout 1:** Hero image scales down, overlay readable
- **Layout 2:** Stacks to single column, image at top
- **Layout 3:** Cards stack vertically, maintains card structure
- **Layout 4:** Image moves to top, metadata stacks

### Tablet (768px - 1024px)
- **Layout 1:** Full-width hero maintained
- **Layout 2:** Two columns maintained if space allows
- **Layout 3:** 2-column metadata grid
- **Layout 4:** Image may float or stack based on screen width

### Desktop (> 1024px)
- **Layout 1:** Full hero image experience
- **Layout 2:** Optimal two-column layout with sticky image
- **Layout 3:** Full 3-column metadata grid
- **Layout 4:** Floating image with inline text flow

---

## Recommendations by Use Case

### 🎯 For Maximum Visual Impact (Hero Cases)
**→ Choose Layout 1**
- Best for cases with compelling imagery
- Creates strong first impression
- Ideal for homepage featured cases

### 📊 For Detailed Documentation
**→ Choose Layout 2**
- Best for cases with extensive information
- Professional, organized presentation
- Good for desktop-primary audiences

### ⚖️ For Balanced Presentation
**→ Choose Layout 3**
- Best general-purpose option
- Works well across all devices
- Clean, modern card-based design

### 📝 For Text-Heavy Cases
**→ Choose Layout 4**
- Best for cases with lots of text
- Maximizes content above the fold
- Traditional article-style reading

---

## Testing Instructions

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the layout selector:**
   ```
   http://localhost:8080/case/175/layout/selector
   ```

3. **Click each layout option to preview**

4. **Test responsive behavior:**
   - Resize browser window
   - Use browser DevTools device emulation
   - Test on actual mobile devices

5. **Provide feedback on:**
   - Visual appeal
   - Information hierarchy
   - Ease of reading
   - Mobile experience
   - Overall preference
