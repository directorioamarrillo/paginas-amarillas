# DIRECTORIO2.0 - Design System Documentation

## 📋 Overview

Complete design system implementation for enterprise SaaS platform inspired by Páginas Amarillas modernized with contemporary design patterns.

---

## 🎨 Color System

### Primary Brand Colors
```
Yellow Institucional: #FDD600
Yellow Hover:         #E6C200
Yellow Light:         #FFF4B8
```

### Dark Mode Colors
```
Dark Primary:   #111111
Dark Secondary: #1A1A1A
Dark Tertiary:  #2A2A2A
Dark Quaternary: #333333
Text:           #F2F2F2
Text Secondary: #E0E0E0
```

### Status Colors
```
Success: #22C55E
Danger:  #EF4444
Warning: #F59E0B
Info:    #3B82F6
```

---

## 🔤 Typography

### Font Family
- **Primary**: Inter (already installed)
- **Fallback**: ui-sans-serif, system-ui, sans-serif

### Type Hierarchy

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| h1 | 32px | 700 | 40px | Page titles, main headers |
| h2 | 24px | 700 | 32px | Section headers |
| h3 | 20px | 600 | 28px | Subsection headers |
| body | 16px | 400 | 24px | Main text |
| body-medium | 16px | 500 | 24px | Medium emphasis text |
| body-semibold | 16px | 600 | 24px | Slightly emphasized |
| caption | 14px | 400 | 20px | Small text, labels |
| caption-semibold | 14px | 600 | 20px | Small labeled text |
| xs | 12px | 400 | 16px | Extra small text |
| xs-semibold | 12px | 600 | 16px | Extra small strong |

---

## 📏 Spacing System

All spacing uses 4px base units:

```
xs:   2px
sm:   4px
md:   8px
lg:   12px
xl:   16px
2xl:  24px
3xl:  32px
4xl:  40px
5xl:  48px
6xl:  64px
7xl:  80px
8xl:  96px
```

---

## 🔲 Border Radius

```
xs:     4px
sm:     6px
md:     8px
lg:     12px
xl:     16px
2xl:    20px
full:   9999px
```

---

## 💫 Shadows

### Subtle SaaS Shadows
```
xs:      0 1px 2px rgba(0, 0, 0, 0.05)
sm:      0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)
md:      0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)
lg:      0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)
xl:      0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)
2xl:     0 25px 50px rgba(0, 0, 0, 0.15)
```

### Elevation Shadows (Hover Effects)
```
elevation-sm:  0 2px 4px rgba(0, 0, 0, 0.08)
elevation-md:  0 4px 12px rgba(0, 0, 0, 0.12)
elevation-lg:  0 8px 24px rgba(0, 0, 0, 0.15)
```

---

## ⏱️ Transitions

### Durations
```
fast:   150ms
base:   200ms
slow:   300ms
slower: 500ms
```

### Timing Functions
```
smooth:   cubic-bezier(0.4, 0, 0.2, 1)
ease-out: cubic-bezier(0, 0, 0.2, 1)
ease-in:  cubic-bezier(0.4, 0, 1, 1)
bounce:   cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

---

## 📚 Component Library

### Base Components (Complete)
- ✅ **Button**: 8 variants, 4 sizes, all states
- ✅ **Card**: Flexible container with elevation and hover
- 🔄 **Input**: In progress
- 🔄 **Select**: In progress
- 🔄 **Modal**: In progress
- 🔄 **Toast**: In progress

### Forms (Planned)
- [ ] **Input Fields**: Text, email, password, number
- [ ] **TextArea**: Resizable with character counter
- [ ] **Checkbox**: Custom styling
- [ ] **Radio Button**: Custom styling
- [ ] **Switch**: Toggle switch
- [ ] **DatePicker**: Modern calendar
- [ ] **MultiSelect**: Multi-value select

### Data Display (Planned)
- [ ] **Table**: Advanced with sorting, filtering
- [ ] **Pagination**: Modern pagination
- [ ] **Tabs**: Tabbed interface
- [ ] **Dropdown**: Menu dropdown

### Feedback (Planned)
- [ ] **Alert**: Dismissible alerts
- [ ] **Tooltip**: Hover tooltips
- [ ] **EmptyState**: State visualization
- [ ] **Loader**: Spinner, skeleton

### Complex (Planned)
- [ ] **SearchBar**: Autocomplete, history
- [ ] **Breadcrumbs**: Navigation
- [ ] **RatingStars**: Interactive ratings
- [ ] **DataGrid**: Advanced table

---

## 🎯 Button Variants

### Variant Usage

**Primary** - Main actions, CTA
```jsx
<Button variant="primary">Save Changes</Button>
```

**Secondary** - Alternative actions
```jsx
<Button variant="secondary">Cancel</Button>
```

**Outline** - Tertiary actions
```jsx
<Button variant="outline">Learn More</Button>
```

**Ghost** - Minimal style
```jsx
<Button variant="ghost">Skip</Button>
```

**Danger** - Destructive actions
```jsx
<Button variant="danger">Delete</Button>
```

**Success** - Confirmatory actions
```jsx
<Button variant="success">Confirm</Button>
```

**Warning** - Cautionary actions
```jsx
<Button variant="warning">Attention</Button>
```

**Info** - Informational actions
```jsx
<Button variant="info">Learn More</Button>
```

### Size Options

```jsx
<Button size="sm">Small</Button>        {/* 12px font */}
<Button size="md">Medium</Button>      {/* 14px font - default */}
<Button size="lg">Large</Button>       {/* 16px font */}
<Button size="xl">Extra Large</Button> {/* 16px font, extra padding */}
```

### States

**Loading**
```jsx
<Button loading>Saving...</Button>
```

**Disabled**
```jsx
<Button disabled>Disabled</Button>
```

**With Icon**
```jsx
<Button icon={SaveIcon}>Save</Button>
<Button icon={CheckIcon} iconPosition="right">Confirm</Button>
```

**Full Width**
```jsx
<Button fullWidth>Full Width Button</Button>
```

---

## 🎴 Card Component

### Basic Usage
```jsx
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

### With Elevation
```jsx
<Card elevated>
  Elevated card with more shadow
</Card>
```

### With Custom Padding
```jsx
<Card padding="lg">
  <p>Larger padding card</p>
</Card>
```

### Options
- `elevated`: boolean (default: false) - Adds more shadow
- `hoverable`: boolean (default: true) - Hover animation
- `padding`: sm|md|lg|xl (default: md) - Padding size
- `className`: string - Additional CSS classes

---

## 🔧 Using Design Tokens

Import from `src/config/designSystem.js`:

```javascript
import { COLORS, TYPOGRAPHY, SPACING, THEME } from '../../config/designSystem';

// Access colors
const yellowColor = COLORS.brand.yellow;      // #FDD600
const successColor = COLORS.status.success;   // #22C55E

// Access spacing
const largePadding = SPACING['3xl'];           // 32px

// Access entire theme
const allColors = THEME.colors;
const fontSize = THEME.typography.fontSizes.h1;
```

---

## 📱 Responsive Breakpoints

```
xs:   0px    (mobile)
sm:   640px  (mobile landscape)
md:   768px  (tablet)
lg:   1024px (desktop)
xl:   1280px (large desktop)
2xl:  1536px (ultra-wide)
```

### Tailwind Usage
```jsx
<div className="text-sm md:text-base lg:text-lg">
  Responsive text sizes
</div>
```

---

## 🌙 Dark Mode

Tailwind CSS dark mode is configured and ready to use:

```jsx
<div className="bg-white dark:bg-dark-primary text-gray-900 dark:text-dark-text">
  Dark mode compatible content
</div>
```

---

## 🎬 Animations

### Available Animations
- `fade-in` - 200ms fade in
- `fade-out` - 200ms fade out
- `slide-up` - 300ms slide from bottom
- `slide-down` - 300ms slide from top
- `scale-in` - 200ms scale from 0.95
- `bounce-in` - 500ms bounce scale
- `shimmer` - 2s infinite shimmer
- `spin-slow` - 3s slow rotation

### Usage
```jsx
<div className="animate-fade-in">
  Fades in on load
</div>
```

---

## ✅ Implementation Checklist

### Phase 1: Foundation (Current)
- ✅ Tailwind config update with complete design tokens
- ✅ Design system JS file with THEME object
- ✅ Button component redesign (8 variants)
- ✅ Card component creation
- 🔄 Input component redesign
- 🔄 Installation of framer-motion & lucide-react

### Phase 2: Layout
- [ ] Sidebar redesign (collapsible, hover effects)
- [ ] Topbar redesign (search, notifications, profile)
- [ ] Footer component
- [ ] MainLayout integration

### Phase 3: Complex Components
- [ ] Table (advanced with sorting, filtering)
- [ ] Select/Dropdown (multiselect, search)
- [ ] Modal (backdrop blur, animations)
- [ ] SearchBar (autocomplete, history)
- [ ] Pagination, Tabs, DatePicker

### Phase 4: Page Redesigns
- [ ] Auth pages (login, signup, reset)
- [ ] Dashboard (KPIs, activity feed)
- [ ] Marketplace (product cards, filters)
- [ ] Admin panel (widgets, analytics)
- [ ] User profile

### Phase 5: Polish
- [ ] Dark mode implementation
- [ ] Framer Motion animations
- [ ] WCAG AA compliance
- [ ] Responsive testing
- [ ] Performance optimization

---

## 📖 Resources

- **Tailwind CSS**: https://tailwindcss.com
- **Design System Best Practices**: https://www.designsystems.com
- **Accessibility**: https://www.w3.org/WAI/WCAG21/quickref/

---

## 🚀 Next Steps

1. Install missing dependencies (framer-motion, lucide-react)
2. Continue with Input component redesign
3. Create remaining base components
4. Test components in isolation
5. Begin layout redesigns (Sidebar, Topbar)

