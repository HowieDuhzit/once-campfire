# Layout Structure Documentation

## Overview

The application uses a three-column CSS Grid layout system with responsive behavior that transitions between grid-based and fixed positioning based on viewport width.

## Grid Architecture

### Root Grid Container (`body`)

**Grid Configuration:**
- **Template Areas**: `"left-sidebar main sidebar"`
- **Template Columns**: 
  - Default: `var(--left-sidebar-width) 1fr var(--sidebar-width)` 
  - With `.sidebar` class at ≥100ch: `5vw 1fr 26vw`
- **Template Rows**: `1fr`
- **Max Height**: `100dvh`

**CSS Variables:**
- `--footer-height`: `calc((var(--block-space)) + 3.6em + var(--block-space))`
- `--navbar-height`: `4.125em`
- `--sidebar-width`: `0vw` (default), `26vw` (when `.sidebar` class present at ≥100ch)
- `--left-sidebar-width`: `0vw` (default), `5vw` (when `.sidebar` class present at ≥100ch)

## Component Hierarchy

### 1. Left Sidebar (`#left-sidebar`)

**Grid Area:** `left-sidebar`

**Positioning Strategy:**
- **Base**: `position: relative` (grid item)
- **With `.sidebar` class**: 
  - Desktop (≥100ch): Grid item with backdrop blur
  - Mobile (<100ch): `position: fixed` with `transform: translate(-100%)` (hidden off-screen)
  - When `.open`: `transform: translate(0)` (visible)

**Properties:**
- `z-index: 3` (when sidebar class active)
- `block-size: 100dvh`
- Backdrop filter blur (66px)
- Background: `oklch(var(--lch-white) / 0.66)`
- Transition: `transform 300ms ease`

**Child: Navigation (`#nav`)**
- `display: flex`
- `flex-direction: column`
- `align-items: center`
- `justify-content: flex-start`
- Contains: account logo, current room info, room settings button

### 2. Main Content (`#main-content`)

**Grid Area:** `main`

**Positioning Strategy:**
- `position: relative`
- `display: flex`
- `flex-direction: column`
- `overflow: auto` (scrollable container)

**Layout Behavior:**
- Without `.sidebar` class: Standard flex layout
- With `.sidebar` class: 
  - `justify-content: end` (pushes content to bottom)
  - Desktop (≥100ch): `border-inline: 1px solid var(--color-border-darker)`

**Internal Structure:**
```
#main-content
  ├── .message-area (display: contents)
  │   ├── .video-call (if active)
  │   ├── .messages (scrollable grid)
  │   │   └── .message (grid items)
  │   └── .message-area__return-to-latest (absolute positioned)
  └── .composer (flex: none)
```

**Message Area (`.message-area`)**
- `display: contents` (doesn't create a box)
- When empty: Creates full viewport grid centered layout
- When has messages: Normal flow

**Messages Container (`.messages`)**
- `display: grid`
- `flex: 1` (grows to fill available space)
- `overflow-y: auto` (scrollable)
- `overscroll-behavior: contain`
- `position: relative`
- Mobile (<100ch): `padding-block-start: var(--navbar-height)`

**Individual Message (`.message`)**
- `display: grid`
- `position: relative`
- `z-index: 0` (default), `z-index: 1` (when has [open] menu)
- Grid template areas:
  - Normal: `"sep sep sep" / "avatar body body"`
  - Own messages: `"sep sep sep" / "body body avatar"`

### 3. Right Sidebar (`#sidebar`)

**Grid Area:** `sidebar`

**Positioning Strategy:**
- **Base**: `position: relative` (grid item)
- **With `.sidebar` class**:
  - Desktop (≥100ch): `position: relative` (grid item)
  - Mobile (<100ch): `position: fixed` with `inset-inline-end: calc(var(--sidebar-width) * -1)` (hidden off-screen)
  - When `.open`: `inset-inline-end: 0` (visible)

**Properties:**
- `z-index: 10` (higher than left sidebar)
- `block-size: 100dvh`
- `display: flex`
- `flex-direction: column`
- `overflow: hidden`
- Backdrop filter blur (66px)
- Background: `oklch(var(--lch-white) / 0.66)` (with sidebar class)
- Transition: `inset-inline-end 300ms ease` (mobile) or `transform 300ms ease` (when using transform)

**Internal Structure:**
```
#sidebar
  └── turbo-frame
      ├── .sidebar__navbar (flex column, flex-shrink: 0)
      ├── .sidebar__container (flex: 1, overflow-y: auto)
      │   ├── .directs (horizontal flex)
      │   ├── .rooms (vertical flex)
      │   └── .sidebar__toggle (absolute positioned)
      └── .sidebar__tools (fixed positioned at bottom)
```

**Sidebar Container (`.sidebar__container`)**
- `flex: 1` (fills available space)
- `overflow-y: auto` (scrollable)
- `padding-block-end: var(--sidebar-tools-height)` (space for fixed tools)

**Sidebar Toggle (`.sidebar__toggle`)**
- `position: absolute`
- `z-index: 5`
- Positioned outside sidebar on left edge
- When sidebar open: moves to `inset-inline-start: var(--inline-space)`

**Sidebar Tools (`.sidebar__tools`)**
- `position: fixed`
- `inset: auto 0 0 0` (fixed at bottom)
- Desktop (≥100ch): `inline-size: calc(var(--sidebar-width))`

## Responsive Breakpoints

### Primary Breakpoint: `100ch` (~40em / ~640px)

**Mobile (<100ch):**
- Left sidebar: Fixed positioning, hidden off-screen left
- Right sidebar: Fixed positioning, hidden off-screen right
- Both use transform or inset positioning for slide animations
- Messages have top padding for navbar height

**Desktop (≥100ch):**
- Left sidebar: Grid item, 5vw width
- Right sidebar: Grid item, 26vw width
- Main content: Has inline borders
- Full grid layout active

### Secondary Breakpoint: `768px` (video_call.css only)

Used only in video call component for mobile adjustments.

## Positioning Strategies Summary

| Component | Desktop (≥100ch) | Mobile (<100ch) |
|-----------|------------------|-----------------|
| `#left-sidebar` | Grid item (relative) | Fixed, hidden left |
| `#main-content` | Grid item (relative) | Grid item (relative) |
| `#sidebar` | Grid item (relative) | Fixed, hidden right |
| `.sidebar__tools` | Fixed (within sidebar width) | Fixed (full width) |
| `.sidebar__toggle` | Absolute | Absolute |

## Z-Index Hierarchy

| Value | Component | Context |
|-------|-----------|---------|
| 1 | `.message` (when has [open] menu) | Message actions menu open |
| 1 | `#system_welcome` | System welcome message |
| 2 | `.message__avatar` | Avatar overlay |
| 3 | `#left-sidebar` (with .sidebar) | Left sidebar backdrop |
| 3 | `.message__actions` | Message action buttons |
| 5 | `.sidebar__toggle` | Sidebar toggle button |
| 10 | `#sidebar` (with .sidebar) | Right sidebar backdrop |
| 11 | `.skip-navigation` | Skip navigation link |

## Overflow Strategies

| Component | Strategy | Reason |
|-----------|----------|--------|
| `body` | `overscroll-behavior: none` | Prevent overscroll |
| `#main-content` | `overflow: auto` | Scrollable main area |
| `.messages` | `overflow-y: auto` | Scrollable message list |
| `.messages` | `overscroll-behavior: contain` | Prevent scroll chaining |
| `.sidebar__container` | `overflow-y: auto` | Scrollable sidebar content |
| `#sidebar` | `overflow: hidden` | Prevent sidebar overflow |
| `#sidebar > turbo-frame` | `overflow: hidden` | Frame boundary |

## Height Constraints

| Component | Constraint | Unit |
|-----------|-----------|------|
| `body` | `max-block-size: 100dvh` | Dynamic viewport height |
| `#left-sidebar` | `block-size: 100dvh` | Dynamic viewport height |
| `#sidebar` | `block-size: 100dvh` | Dynamic viewport height |
| `.message-area` (empty) | `block-size: 100vh` | Viewport height |
| `.video-call` | `max-height: 60vh`, `min-height: 300px` | Viewport relative + fixed |

## Key Layout Interactions

1. **Sidebar Toggle**: Absolute positioned button that slides with sidebar
2. **Jump to Newest**: Absolute positioned button in message area, offset by footer height
3. **Message Actions Menu**: Absolutely positioned relative to message, z-index 1 when open
4. **Video Call**: Flex container within message area, uses viewport-relative heights
5. **Composer**: `flex: none` prevents it from growing, always at bottom of flex container

## Responsive Behavior Details

### Mobile (<100ch)
- Sidebars slide in/out using transforms or inset positioning
- Message area adds top padding for navbar
- Video call adjusts to smaller viewport (max-height: 50vh, min-height: 250px)
- Composer input hints hide on focus

### Desktop (≥100ch)
- All three columns visible in grid
- Sidebars are always visible (no toggle needed)
- Inline borders on main content
- Rich text toolbar visible in composer
- Message actions menu positioned differently

