# Nested Scroll Container Analysis

**Date:** 2025-01-02  
**Status:** Analysis Complete | Recommendation Provided

## Current Structure

```
body (grid, height: 100dvh)
└── main#main-content (flex column, overflow: auto) [SCROLL CONTAINER]
    └── .message-area (display: contents)
        ├── .video-call
        └── .messages (flex: 1, overflow-y: auto) [NESTED SCROLL CONTAINER]
    └── footer#footer
        └── .composer (flex: none)
```

## The Problem

Both `#main-content` and `.messages` have scroll capabilities:

1. **`#main-content`** (`layout.css:97`): `overflow: auto`
   - Can scroll entire content area (video call + messages + composer)
   
2. **`.messages`** (`messages.css:77`): `overflow-y: auto`
   - Scrolls only the message list
   - Has `flex: 1` to take available space
   - Has `overscroll-behavior: contain` to prevent scroll chaining

## Current Behavior

### Desktop (≥100ch)
- `#main-content` is a flex column container
- `.messages` takes available flex space (`flex: 1`)
- If messages exceed available space, `.messages` scrolls
- `#main-content` would only scroll if total height exceeds viewport (unlikely with flex layout)

### Mobile (<100ch)
- Same behavior, but with different spacing

## Analysis

### Is Nested Scrolling Intentional?

**Evidence FOR nested scrolling:**
- `.messages` has `overscroll-behavior: contain` - explicitly prevents scroll chaining
- `.messages` has `flex: 1` - designed to take available space
- Composer is `flex: none` - fixed at bottom
- Video call is above messages - should stay visible

**Evidence AGAINST nested scrolling:**
- `#main-content` scrolls the entire area (would scroll video call + messages together)
- This could create UX confusion (which element scrolls?)
- Browser testing showed `.messages` scrolling correctly, suggesting `#main-content` overflow may be unnecessary

### Recommendation

**Remove `overflow: auto` from `#main-content`**

**Rationale:**
1. `#main-content` is a flex container (`display: flex; flex-direction: column`)
2. `.messages` is `flex: 1` - takes available space automatically
3. `.messages` has `overflow-y: auto` - handles scrolling
4. Composer is `flex: none` - stays at bottom
5. Video call should remain visible (doesn't scroll)
6. The flex layout naturally prevents `#main-content` from needing to scroll

**Expected Result:**
- `#main-content` becomes a flex container only (no scroll)
- `.messages` is the single scroll container
- Cleaner UX - only one scrolling element
- Video call stays fixed while messages scroll

## Proposed Change

```css
/* layout.css:91-107 */
#main-content {
  align-content: start;
  background-color: var(--color-bg);
  display: flex;
  flex-direction: column;
  grid-area: main;
  /* overflow: auto; REMOVE - not needed with flex layout */
  position: relative;

  .sidebar & {
    justify-content: end;

    @media (min-width: 100ch) {
      border-inline: 1px solid var(--color-border-darker);
    }
  }
}
```

## Testing Checklist

After making the change, verify:

- [ ] Messages scroll correctly in `.messages` container
- [ ] Video call stays visible (doesn't scroll with messages)
- [ ] Composer stays at bottom
- [ ] No content is cut off or hidden
- [ ] Layout height calculations still work
- [ ] Mobile behavior unchanged
- [ ] Desktop behavior unchanged

## Alternative: Keep Nested Scrolling

If nested scrolling is intentional (e.g., for very long video call sessions), document it:

1. Add comment explaining why both scroll
2. Ensure `overscroll-behavior: contain` on `.messages` is sufficient
3. Test scroll UX to ensure it's not confusing

**Current observation:** Browser testing showed only `.messages` scrolling, suggesting `#main-content` overflow may not be active in practice.

---

*Status: Ready for implementation decision*

