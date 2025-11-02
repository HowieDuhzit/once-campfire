# Overflow Strategy Documentation

## Overview

This document maps all overflow strategies across the application, identifies nested scroll containers, and documents scrolling behavior patterns.

## Scroll Container Hierarchy

```
body (overflow-x: hidden)
└── #main-content (overflow: auto) [MAIN SCROLL CONTAINER]
    └── .message-area (display: contents - no box)
        └── .messages (overflow-y: auto) [NESTED SCROLL CONTAINER]
            └── .message (no overflow - content)

#sidebar (overflow: hidden - container)
└── turbo-frame (overflow: hidden - boundary)
    └── .sidebar__container (overflow-y: auto) [SIDEBAR SCROLL CONTAINER]
```

## Overflow Declarations by Component

### Root Level

**`html`** (`_reset.css`)
- `overscroll-behavior: none` - Prevents overscroll on root

**`body`** (`_reset.css`)
- `overflow-x: hidden` - Prevents horizontal scrolling at body level
- `overflow: initial` (`base.css`) - Resets to initial value

### Main Content Area

**`#main-content`** (`layout.css:97`)
- `overflow: auto` - **Primary scroll container**
- Allows both horizontal and vertical scrolling if needed
- This is the main scrollable area for the application

### Message Area

**`.message-area`** (`messages.css`)
- `display: contents` - Doesn't create a box, so no overflow
- When empty: Creates full viewport grid (no overflow needed)

**`.messages`** (`messages.css:77`)
- `overflow-y: auto` - **Nested scroll container**
- `overscroll-behavior: contain` - Prevents scroll chaining
- Scrollable message list within main content
- **Issue**: Nested scroll container within `#main-content` which also scrolls

**`.message__body-content`** (`messages.css`)
- `overflow: unset` (in `#system_welcome` context) - Removes overflow constraint
- Default: No overflow declaration (allows content to flow)

**`.message__author`** (`messages.css:246`)
- `overflow: hidden` - Prevents text overflow
- `text-overflow: ellipsis` - Shows ellipsis for long names

**`.message__pending-upload`** (`messages.css:566`)
- `overflow: hidden` - Clips upload progress animation

### Sidebar

**`#sidebar`** (`sidebar.css:95`)
- `overflow: hidden` - Prevents sidebar container overflow
- Used when sidebar is fixed positioned (mobile)

**`#sidebar > turbo-frame`** (`sidebar.css:116`)
- `overflow: hidden` - Frame boundary, prevents overflow

**`.sidebar__container`** (`sidebar.css:41`)
- `overflow-y: auto` - **Sidebar scroll container**
- Scrollable list of rooms and directs
- Has bottom padding to account for fixed `.sidebar__tools`

### Video Call Component

**`.video-call`** (`video_call.css:9`)
- `overflow: hidden` - Prevents container scrolling
- Comment: "Prevent scrolling of the container"

**`.video-call__videos`** (`video_call.css:22`)
- `overflow: hidden` - Never scroll, fit to container
- Comment: "Never scroll - fit to container"

**`.video-call__local`** (`video_call.css:45`)
- `overflow: hidden` - Clips video to rounded corners

**`.video-call__remote-video`** (`video_call.css:100`)
- `overflow: hidden` - Clips video to rounded corners

### Other Components

**`.lightbox`** (`lightbox.css:10`)
- `overflow: hidden` - Prevents lightbox content overflow

**`.autocomplete__list`** (`autocomplete.css:8`)
- `overflow-y: auto` - Scrollable autocomplete dropdown

**Utility Classes** (`utilities.css`)
- `.overflow-x` - `overflow-x: auto` with scroll snap
- `.overflow-y` - `overflow-y: auto` with scroll snap
- `.overflow-clip` - `overflow: hidden` with text clipping
- `.overflow-ellipsis` - `overflow: hidden` with text ellipsis

## Nested Scroll Containers

### Primary Nesting Issue

**Nested Scroll Containers:**
1. `#main-content` (`overflow: auto`) - Main scroll container
2. `.messages` (`overflow-y: auto`) - Nested scroll container inside main-content

**Potential Problems:**
- Scroll confusion: Which container scrolls?
- Scroll chaining: Overscroll can propagate between containers
- Performance: Nested scrolling can be janky
- UX: Users may not know which area is scrollable

**Current Mitigation:**
- `.messages` uses `overscroll-behavior: contain` to prevent scroll chaining
- This helps but doesn't fully solve the nesting issue

### Scroll Container Strategy Analysis

**Current Approach:**
- Main content scrolls the entire page
- Messages container also scrolls independently
- This creates a "scroll within scroll" scenario

**Alternative Approach:**
- Make `#main-content` not scrollable (`overflow: visible` or `overflow: hidden`)
- Only `.messages` container scrolls
- Would require ensuring message area fills viewport correctly

## Overflow Strategies Summary

| Strategy | Usage Count | Purpose |
|----------|-------------|---------|
| `overflow: hidden` | 15+ | Clip content, prevent scrolling |
| `overflow-y: auto` | 3 | Vertical scrolling containers |
| `overflow: auto` | 1 | Main scroll container |
| `overflow-x: hidden` | 1 | Prevent horizontal scroll |
| `overflow: unset` | 2 | Remove overflow constraints |
| `overflow: clip` | 5 | Modern clipping (CSS spec) |
| `overflow: initial` | 1 | Reset to initial value |

## Overscroll Behavior

**Root Level:**
- `html`: `overscroll-behavior: none` - Prevents all overscroll

**Message Container:**
- `.messages`: `overscroll-behavior: contain` - Prevents scroll chaining from messages

**Other Containers:**
- No explicit overscroll behavior declarations
- Default behavior applies (scroll chaining enabled)

## Identified Issues

### 1. Nested Scroll Containers
**Issue:** `#main-content` and `.messages` both scroll
- **Location:** Layout.css and messages.css
- **Impact:** Can cause scroll confusion and performance issues
- **Recommendation:** Consider making main-content non-scrollable if messages should be the only scroll container

### 2. Text Overflow Handling
**Issue:** Mix of `overflow: clip` and `overflow: hidden`
- **Location:** Various files
- **Impact:** `clip` is newer CSS spec, may have browser support differences
- **Recommendation:** Standardize on `overflow: hidden` for wider support, or document browser requirements

### 3. Video Call Overflow
**Issue:** Multiple `overflow: hidden` declarations in video call
- **Location:** video_call.css
- **Impact:** All containers prevent scrolling, which is intentional but may be over-specified
- **Recommendation:** Verify all are necessary

### 4. Sidebar Scroll Boundary
**Issue:** Both `#sidebar` and `turbo-frame` have `overflow: hidden`
- **Location:** sidebar.css
- **Impact:** Double boundary - may be redundant
- **Recommendation:** Verify both are necessary for the frame structure

## Recommendations

### 1. Resolve Nested Scroll Containers
**Option A:** Remove scrolling from `#main-content`
```css
#main-content {
  overflow: visible; /* or hidden if content shouldn't overflow */
}
```
**Pros:** Single scroll container, clearer UX
**Cons:** May need layout adjustments

**Option B:** Keep current approach but enhance
- Add clear visual indicators of scrollable areas
- Ensure `overscroll-behavior: contain` is working correctly
- Test scroll behavior thoroughly

### 2. Standardize Overflow Values
- Use `overflow: hidden` consistently (better browser support than `clip`)
- Document where `clip` is intentionally used for modern browsers

### 3. Document Scroll Boundaries
- Clearly mark scroll container hierarchy
- Ensure developers understand which areas scroll

### 4. Test Scroll Performance
- Test nested scrolling on mobile devices
- Verify smooth scrolling with many messages
- Check scroll restoration behavior

## Testing Checklist

- [ ] Main content scrolls correctly
- [ ] Message area scrolls independently
- [ ] No scroll confusion between containers
- [ ] Sidebar scrolls independently
- [ ] Video call doesn't create scroll issues
- [ ] Overscroll behavior works as expected
- [ ] Scroll restoration works after navigation
- [ ] Jump-to-newest button positions correctly
- [ ] Mobile scroll behavior is smooth
- [ ] No horizontal scroll appears unexpectedly

## Scroll Container Map

```
┌─────────────────────────────────────────┐
│ body (no scroll)                        │
│ ┌─────────────────────────────────────┐ │
│ │ #main-content (scroll: auto)       │ │ ← MAIN SCROLL
│ │ ┌───────────────────────────────┐ │ │
│ │ │ .message-area (no box)        │ │ │
│ │ │ ┌───────────────────────────┐ │ │ │
│ │ │ │ .messages (scroll-y: auto) │ │ │ │ ← NESTED SCROLL
│ │ │ │                           │ │ │ │
│ │ │ │ .message (no scroll)      │ │ │ │
│ │ │ └───────────────────────────┘ │ │ │
│ │ └───────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ #sidebar (overflow: hidden)         │ │
│ │ ┌───────────────────────────────┐ │ │
│ │ │ .sidebar__container            │ │ │
│ │ │ (scroll-y: auto)               │ │ │ ← INDEPENDENT SCROLL
│ │ └───────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

