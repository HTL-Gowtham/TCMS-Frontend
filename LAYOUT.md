# ALTCM Frontend — Layout & UI/UX Specification

> **Version:** 1.0  
> **Date:** March 21, 2026  
> **Scope:** New project (`d:\taiga\ALTCM\Frontend\New\`) — port **5175**  
> **Source files:** `styles/variables.css`, `styles/layout.css`, component CSS files

---

## 1. Typography

### Font Family

```
Primary: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
```

Inter is loaded via the browser stack. It is applied globally on `html, body, #root` and explicitly declared on every component container to avoid cascade bleed.

---

### Font Size Scale

| Token | Value | Pixel Equivalent | Usage |
|-------|-------|-----------------|-------|
| `--font-size-xs` | `0.65rem` | ~10–11 px | Tiny labels, badge text, tree dots |
| `--font-size-sm` | `0.75rem` | ~12 px | Table headers (`th`), secondary metadata, dropdown roles, empty-leaf messages |
| `--font-size-md` | `0.85rem` | ~14 px | **Default UI text** — nav links, body copy, table cells, sidebar tree items, form inputs |
| `--font-size-lg` | `1rem` | 16 px | Section headings, dropdown names, project names in navigator |
| `--font-size-xl` | `1.1rem` | ~18 px | Brand text (`AL TCMS` in header), panel H2 subheadings |

---

### Font Weight

| Weight | Usage |
|--------|-------|
| `400` | Body text, muted labels |
| `600` | Nav links, button labels, item-text, table cells |
| `700` | Section headings, active nav items, table `th`, brand text, `.text-bold` |
| `800` | Project name in navigator row (`.nav-project-name`) |

---

### Line Height & Letter Spacing

| Property | Value | Context |
|----------|-------|---------|
| `letter-spacing` | `0.5px` | Brand text (`.brand-text`) |
| `text-transform` | `none` | Table headers (explicitly overridden — no all-caps) |
| `white-space: nowrap` | Applied on | Nav links, sidebar item text (prevents wrapping in constrained widths) |
| `text-overflow: ellipsis` | Applied on | Sidebar `.item-text` — clips overflow with `…` |

---

## 2. Color System

### Design Token Reference (`variables.css`)

#### Brand / Primary

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#0088CF` | Buttons, active nav underline, action badge, links |
| `--color-primary-hover` | `#006fa3` | Button hover state |
| `--color-primary-light` | `#EBF3FD` | Table header bg, panel header bg, project button hover bg |
| `--color-brand-dark` | `#163860` | Table cell text, project name, nav project name |
| `--color-brand-navy` | `#1e3a8a` | Dashboard heading H2, header brand text |

#### Neutral / Surface

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#F8FAFC` | App shell background, dashboard container |
| `--color-surface` | `#FFFFFF` | Cards, table rows, sidebar children, form areas |
| `--color-border` | `#e2e8f0` | Default borders (header bottom, navigator, table) |
| `--color-border-strong` | `#cbd5e1` | Table card border, modal border, stronger dividers |

#### Text

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-text` | `#334155` | Default body text, table cell text, form inputs |
| `--color-text-dark` | `#1e293b` | Sidebar item text, dropdown name |
| `--color-text-muted` | `#64748b` | Secondary metadata, placeholders, muted labels, arrows |

#### Semantic

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#166534` | Pass status text |
| `--color-success-bg` | `#dcfce7` | Pass status background pill |
| `--color-success-border` | `#bbf7d0` | Pass status pill border |
| `--color-danger` | `#b91c1c` | Fail/Delete text |
| `--color-danger-bg` | `#fef2f2` | Fail status background |
| `--color-danger-border` | `#fecaca` | Fail status pill border |
| `--color-warning-text` | `#c2410c` | Warning text (amber-orange) |
| `--color-warning-bg` | `#fff7ed` | Warning background |

#### Sidebar-Specific (TestDesignSidebar — dark theme)

| Element | Hex | Usage |
|---------|-----|-------|
| Sidebar background | `#F4F7FE` | `.td-sidebar` background (light version) |
| Dropdown card bg | `#ffffff` | `.custom-dropdown-wrapper` |
| Tree item text | `#475569` | Default tree item color |
| Tree item hover bg | `#e2e8f0` | `.tree-item:hover` |
| Active suite bg | `#eff6ff` | `.suite-item.active` background |
| Active suite text | `#2563eb` | `.suite-item.active` text |
| Active TC text | `#0ea5e9` | `.tc-item.active` text |
| Folder icon | `#facc15` | Yellow folder emoji color |
| Tree dot | `#0ea5e9` | Vertical tree connector dot |

> **Note:** The parent workspace (port 5178) uses a dark sidebar (`#1a2a3a` bg, `#0066cc` active).  
> See section 8 for the two-theme comparison.

---

## 3. Spacing Scale

All spacing values are defined as CSS custom properties in `variables.css`.

| Token | Value | Common Usage |
|-------|-------|-------------|
| `--spacing-xs` | `4px` | Icon gaps, tight inner padding |
| `--spacing-sm` | `8px` | Table cell padding (vertical), form group gap |
| `--spacing-md` | `16px` | Default padding inside cards, form sections |
| `--spacing-lg` | `24px` | Header horizontal padding, panel padding, page padding |
| `--spacing-xl` | `32px` | Dashboard page top padding |

---

## 4. Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `4px` | Inputs, search bar, small buttons, nav underline caps |
| `--radius-md` | `6px` | Dropdown cards, action menus, sidebar dropdown wrapper, profile dropdown |
| `--radius-lg` | `8px` | Main content cards, dashboard project panel |

---

## 5. Shadow Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Sidebar dropdown wrapper, table card |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)` | Modals, floating panels |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.05)` | Dashboard project panel (`0 4px 16px rgba(0,0,0,0.06)`) |

Profile dropdown uses: `0 4px 12px rgba(0,0,0,0.1)`

---

## 6. Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-dropdown` | `100` | Action menus, nav dropdowns |
| `--z-sticky` | `200` | Sticky table headers (`z-index: 10` in tables) |
| `--z-modal` | `1000` | Modals, overlay panels. Header navbar: `z-index: 1000` |
| `--z-toast` | `2000` | `react-hot-toast` notifications |

Profile dropdown uses `z-index: 1100` (above navbar).

---

## 7. App Shell Layout

### Overall Structure

```
┌──────────────────────────────────────────────────── 100vw ───┐
│                    .navbar  (height: 50px)                    │  ← Header
├──────────────────────────────────────────────────────────────┤
│                 .navigator-container  (height: 85px)          │  ← Navigator (tab bar)
├────────────┬─────────────────────────────────────────────────┤
│            │                                                  │
│ .td-sidebar│              .app-main / Outlet                  │  ← Page content
│ (260px)    │         (flex: 1, overflow: auto)                │
│            │                                                  │
│            │                                                  │
└────────────┴─────────────────────────────────────────────────┘
         100vh total, overflow: hidden at shell level
```

### CSS Classes & Dimensions

| Class | Dimensions | Notes |
|-------|-----------|-------|
| `.app-shell` / `.app-container` | `100vw × 100vh`, `flex-direction: column` | Root container, `overflow: hidden` |
| `.app-body` | `flex: 1`, `flex-direction: row` | Contains sidebar + main |
| `.app-main` / `.right-panel-wrapper` | `flex: 1`, `min-width: 0` | Prevents flex overflow |
| `.app-page` / `.app-content-scrollable` | `flex: 1`, `overflow: auto` | Scrollable page area |

---

## 8. Component Dimensions & Specs

### 8.1 Header (`.navbar`)

| Property | Value |
|----------|-------|
| Height | `50px` (fixed, `flex-shrink: 0`) |
| Background | `#ffffff` |
| Bottom border | `1px solid #e2e8f0` |
| Horizontal padding | `0 24px` |
| `z-index` | `1000` |
| Brand icon size | `28px × 28px`, `border-radius: 50%`, bg `#0f4c81` |
| Brand text | `1.1rem`, `font-weight: 700`, `letter-spacing: 0.5px` |
| Profile avatar | `32px × 32px`, `border-radius: 50%` |
| Profile dropdown width | `180px`, `border-radius: 6px`, opens `45px` from top of avatar |
| Gap between right items | `20px` |
| Nav divider | `1px × 24px` vertical line, `#cbd5e1` |
| Secondary logo | `28px × 28px`, `border-radius: 50%` |

#### Header Interaction States
| Element | Default | Hover |
|---------|---------|-------|
| Brand | cursor: pointer | — |
| "All Projects" link | `#0088CF`, weight 600 | color `#005f9e`, underline |
| Profile avatar border | `#cbd5e1` | `#0088CF` |
| Dropdown logout item | `#ef4444` | bg `#f8fafc` |

---

### 8.2 Navigator (`.navigator-container`)

| Property | Value |
|----------|-------|
| Height | `85px` (fixed, `flex-shrink: 0`) |
| Background | `#ffffff` |
| Bottom border | `1px solid #e2e8f0` |
| Horizontal padding | `0 24px` |
| Font family | `Inter, system-ui` |

#### Internal Rows

**Project row** (`.nav-project-row`) — `margin-top: 12px`
- Folder icon: `1.1rem`, color `#fbbf24` (amber/yellow)
- Project name: `0.9rem`, `font-weight: 800`, `color: #163860`

**Links row** (`.nav-links-row`) — `height: 40px`, flexbox space-between

#### Nav Link States

| State | Color | Font Weight | Underline bar |
|-------|-------|------------|---------------|
| Default | `#163860` | `600` | none |
| Hover | `#0088CF` | `600` | `width: 100%`, `3px`, `#0088CF` |
| Active | `#0088CF` | `700` | `width: 100%`, `3px`, `#0088CF` |
| Disabled | `#cbd5e1` | — | none, `pointer-events: none` |

Gap between nav links: `30px`  
Underline transition: `width 0.2s ease-in-out`  
Border radius on underline caps: `3px 3px 0 0`

#### Search Bar (`.nav-search-input`)
| Property | Value |
|----------|-------|
| Height | `32px` |
| Width | `240px` |
| Padding | `0 32px 0 12px` (right space for SVG search icon) |
| Border | `1px solid #94a3b8`, `border-radius: 4px` |
| Font size | `0.85rem` |
| Placeholder color | `#94a3b8` |
| Focus | border-color stays `#94a3b8` (no glow) |

#### Action Button (`.nav-action-btn`)
| Property | Value |
|----------|-------|
| Height | `32px` |
| Padding | `0 16px` |
| Background | `#0088CF` → hover `#0076b5` |
| Color | `white` |
| Border-radius | `4px` |
| Font | `0.85rem`, `font-weight: 700` |

---

### 8.3 TestDesign Sidebar (`.td-sidebar`)

| Property | Value |
|----------|-------|
| Width | `260px` (fixed, `flex-shrink: 0`) |
| Height | `100vh` |
| Background | `#F4F7FE` (light) |
| Right border | `1px solid #e2e8f0` |
| Font | `Inter, -apple-system, BlinkMacSystemFont` |
| `user-select` | `none` |

#### Project Dropdown (`.custom-dropdown-wrapper`)
| Property | Value |
|----------|-------|
| Height | `40px` |
| Background | `#ffffff` |
| Border | `1px solid #cbd5e1`, `border-radius: 6px` |
| Shadow | `0 1px 2px rgba(0,0,0,0.05)` |
| Font | `0.85rem`, `font-weight: 600`, `color: #334155` |
| Arrow icon | `0.7rem`, `color: #64748b`, `right: 12px` |
| Hover | `border-color: #94a3b8` |
| Focus | `border: 1px solid #2563eb` |

#### Tree Items (`.tree-item`)
| Property | Value |
|----------|-------|
| Padding | `8px 12px` |
| Min-height | `36px` |
| Font size | `0.85rem` |
| Default color | `#475569` |
| Hover bg | `#e2e8f0` |
| Hover color | `#1e293b` |
| Active color | `#0f172a`, `font-weight: 600` |
| Transition | `background-color 0.15s ease` |

#### Suite Items (`.suite-item`)
| Property | Value |
|----------|-------|
| Left padding | `34px` (indented under project) |
| Active bg | `#eff6ff` |
| Active text | `#2563eb`, `font-weight: 600` |

#### Test Case Items (`.tc-item`)
| Property | Value |
|----------|-------|
| Font size | `0.8rem` |
| Left padding | `20px` (offset from tree line) |
| Background | `#FFFFFF` |
| Color | `#334155` |
| Hover bg | `#f8fafc` |
| Active bg | `#f1f5f9` |
| Active color | `#0ea5e9` |

#### Tree connector
- Vertical line: `border-left: 1px solid #cbd5e1`, `margin-left: 42px`
- Dot: `7px × 7px`, `border-radius: 50%`, `bg: #0ea5e9`, positioned `left: -4px`

#### (+) Add button (`.icon-btn-add`)
- Hidden by default (`display: none`), revealed on `.tree-item:hover`
- Font size: `1.2rem`, color `#94a3b8`
- Hover: `color: #2563eb`, bg `#cbd5e1`, `font-weight: bold`

---

### 8.4 Dashboard Panel (`.dashboard-projects-panel`)

| Property | Value |
|----------|-------|
| Max-width | `680px` (centered) |
| Background | `#ffffff` |
| Border | `1px solid #cbd5e1`, `border-radius: 8px` |
| Shadow | `0 4px 16px rgba(0,0,0,0.06)` |
| Panel header bg | `#EBF3FD` |
| Panel header H2 | `18px`, `font-weight: 700`, `color: #1e3a8a` |
| Project list max-height | `calc(100vh - 200px)`, scrollable |
| Project button padding | `14px 18px` |
| Project button border-radius | `6px` |
| Project button hover bg | `#EBF3FD`, border `#0088CF` |
| Active badge | `border-radius: 20px`, `font-size: 12px`, `color: #0088CF` |

---

### 8.5 Data Tables (`.tp-table`)

| Property | Value |
|----------|-------|
| Layout | `table-layout: fixed`, `border-collapse: collapse` |
| Min-width | `900px` |
| `th` bg | `#EBF3FD` (sticky, `z-index: 10`) |
| `th` padding | `10px 12px` |
| `th` font | `0.7rem`, `font-weight: 700`, `color: #163860` |
| `th` `text-transform` | `none` |
| `td` padding | `8px 12px` |
| `td` font | `0.8rem`, `color: #163860` |
| `td` border-bottom | `0.7px solid #A2BAD6` |
| Row hover | `background: #f8fafc` (typically) |
| Container | Wrapped in `.table-card` with `border: 1px solid #e2e8f0`, `border-radius: 0` |

---

## 9. Scrollbar Styling (Custom, WebKit)

Applied globally in `layout.css`:

| Property | Value |
|----------|-------|
| Width / Height | `8px` |
| Track | `transparent` |
| Thumb | `#cbd5e1`, `border-radius: 4px` |
| Thumb hover | `#94a3b8` |

---

## 10. Interactive States — Summary

| State | Background | Border | Text/Color |
|-------|-----------|--------|-----------|
| Button default | `#0088CF` | — | `white` |
| Button hover | `#006fa3` / `#0076b5` | — | `white` |
| Button danger | `#ef4444` | — | `white` |
| Input default | `white` | `1px solid #cbd5e1` | `#334155` |
| Input focus | `white` | `1px solid #2563eb` (sidebar) / `#94a3b8` (nav search) | — |
| Input placeholder | — | — | `#94a3b8` |
| Table row hover | `#f8fafc` | — | — |
| Nav link hover | — | `3px bottom #0088CF` | `#0088CF` |
| Nav link active | — | `3px bottom #0088CF` | `#0088CF`, weight 700 |
| Sidebar item hover | `#e2e8f0` | — | `#1e293b` |
| Active suite | `#eff6ff` | — | `#2563eb` |
| Active test case | `#f1f5f9` | — | `#0ea5e9` |
| Profile avatar hover | — | `#0088CF` | — |

---

## 11. Status & Badge Pills

Used in `ProjectListPage` table and execution results:

| Status | Background | Text Color | Border |
|--------|-----------|-----------|--------|
| Active | `#dcfce7` | `#166534` | `#bbf7d0` |
| Inactive | `#fef2f2` | `#b91c1c` | `#fecaca` |
| Public | `#EBF3FD` | `#0088CF` | `#bfdbfe` |
| Private | `#f8fafc` | `#64748b` | `#e2e8f0` |
| Pass | `#dcfce7` | `#166534` | — |
| Fail | `#fef2f2` | `#b91c1c` | — |
| Skipped / Not Run | `#f8fafc` | `#64748b` | — |

Pills use: `padding: 3px 10px`, `border-radius: 20px`, `font-size: 0.72rem`, `font-weight: 600`

---

## 12. Transitions & Animations

| Element | Property | Duration | Easing |
|---------|----------|----------|--------|
| Nav link color | `color` | `0.2s` | `ease` |
| Nav underline bar | `width` | `0.2s` | `ease-in-out` |
| Button bg | `background-color` | `0.2s` | `ease` |
| Tree item bg | `background-color` | `0.15s` | `ease` |
| Profile avatar border | `border-color` | `0.2s` | — |
| Project choice button | `all` | `0.2s` | — |
| "All Projects" link | `color` | `0.2s` | — |
| Dashboard popup fade (old) | `opacity + translateY(10px→0)` | `0.3s` | `ease-out` |

---

## 13. Two-Theme Comparison (Port 5175 vs Port 5178)

The `New/` project (port 5175) uses the **original token values** from `variables.css`.  
The parent workspace (port 5178) has been updated to a **darker, more professional palette**.

| Element | New (5175) | Parent (5178) |
|---------|-----------|---------------|
| App background | `#F8FAFC` | `#f0f2f5` |
| Body text | `#334155` | `#1a2a3a` |
| Primary color | `#0088CF` | `#0066cc` |
| Primary hover | `#006fa3` | `#0052a3` |
| Header brand text | `#1e3a8a` | `#1a3c5e` |
| Sidebar background | `#F4F7FE` | `#1a2a3a` (dark) |
| Sidebar dropdown bg | `#ffffff` | `#243447` (dark) |
| Sidebar text | `#475569` | `#94a3b8` |
| Sidebar item hover bg | `#e2e8f0` | `#243447` |
| Sidebar item hover text | `#1e293b` | `#ffffff` |
| Active suite bg | `#eff6ff` | `#0066cc` |
| Active suite text | `#2563eb` | `#ffffff` |
| Active TC text | `#0ea5e9` | `#0066cc` |
| Tree dot color | `#0ea5e9` | `#0066cc` |
| Folder icon (blue) | `#0ea5e9` | `#0066cc` |
| Dashboard H2 | `#1e3a8a` | `#1a3c5e` |
| Active badge | `#0088CF` | `#0066cc` |
| Nav link active | `#0088CF` | `#0066cc` |

---

## 14. Responsive & Overflow Handling

| Rule | Implementation |
|------|---------------|
| Page height | `100vh`, `overflow: hidden` at shell — individual panels scroll internally |
| Sidebar | `flex-shrink: 0` — never compresses below `260px` |
| Main content | `flex: 1`, `min-width: 0` — absorbs all remaining width |
| Tables | `min-width: 900px` inside `.tp-table-scroll` (horizontal scroll on small viewports) |
| Sidebar item text | `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` |
| Dashboard list | `max-height: calc(100vh - 200px); overflow-y: auto` |
| Global scrollbar | Custom 8px WebKit scrollbar, always-visible track transparent |
| Box sizing | `*, *::before, *::after { box-sizing: border-box }` — universal |

---

## 15. Accessibility Notes

| Feature | Implementation |
|---------|---------------|
| Keyboard nav on brand/links | `role="button"`, `tabIndex={0}`, `onKeyDown` Enter handler |
| Profile avatar alt text | `alt="Profile"` |
| Company logo alt text | `alt="Company Logo"` |
| Disabled nav items | `pointer-events: none; cursor: not-allowed; color: #cbd5e1` |
| Form required indicator | `<span style={{color: '#ef4444'}}>*</span>` |
| Sidebar `user-select: none` | Prevents accidental text selection in tree navigation |
| Toast notifications | Positioned `top-right`, `duration: 3500ms`, `font-size: 0.875rem` |
