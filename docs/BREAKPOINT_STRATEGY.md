# Breakpoint Strategy Documentation

## Current Breakpoint Usage

### Primary Breakpoint: `100ch`
**Usage:** Main responsive breakpoint used throughout the application
- **Approximate equivalent:** ~40em / ~640px (varies by font size)
- **Files using it:** 
  - `layout.css` (7 occurrences)
  - `sidebar.css` (3 occurrences)
  - `messages.css` (8 occurrences)
  - `composer.css` (3 occurrences)
  - `autocomplete.css` (1 occurrence)
  - `base.css` (1 occurrence)
  - `embeds.css` (3 occurrences)
  - `panels.css` (1 occurrence)
  - `signup.css` (1 occurrence)

**Behavior:**
- **Mobile (<100ch)**: Sidebars use fixed positioning and slide in/out
- **Desktop (≥100ch)**: Full three-column grid layout with sidebars always visible

### Secondary Breakpoint: `768px`
**Usage:** Currently used only in `video_call.css`
- **Occurrences:** 1 media query block
- **Purpose:** Mobile adjustments for video call component

**Issues:**
- Inconsistent with primary breakpoint (`100ch`)
- `100ch` ≈ 640px (with default font), so `768px` is larger
- Creates a potential "in-between" breakpoint range (640px-768px) where behavior may be inconsistent

### Feature Detection Queries
**Purpose:** Detect browser/device capabilities rather than viewport size

- `@media (any-hover: hover)` - Devices with hover capability
- `@media (hover: hover) and (pointer: fine)` - Precise pointer with hover
- `@media (hover: none) and (pointer: coarse)` - Touch devices
- `@media (prefers-color-scheme: dark)` - Dark mode preference
- `@media (prefers-reduced-motion: reduce)` - Reduced motion preference
- `@media (display-mode: standalone)` - PWA standalone mode

## Analysis: 100ch vs 768px

### 100ch (Character-based)
**Advantages:**
- Scales with user's font size preference
- Accessibility-friendly
- Content-aware (based on character width)
- Already used consistently throughout the app

**Disadvantages:**
- Actual pixel value varies by font size and font family
- Can be harder to reason about in pixels

**Calculated Values:**
- With 16px base font (typical): `100ch` = `1600px` (100 × 16px)
- Wait, that's incorrect. `ch` unit = width of "0" character
- Typical: 16px font → `ch` ≈ 8-10px → `100ch` ≈ 800-1000px
- But in practice, with proportional fonts: `100ch` ≈ 40-50em ≈ 640-800px

### 768px (Fixed pixel)
**Advantages:**
- Fixed, predictable value
- Common tablet breakpoint
- Easy to reason about

**Disadvantages:**
- Doesn't adapt to user preferences
- Less accessible
- Inconsistent with rest of application
- Fixed breakpoint may not align with content needs

## Recommendation

### Standardize on `100ch`

**Reasoning:**
1. **Consistency:** Already used in 27+ places across the codebase
2. **Accessibility:** Adapts to user font size preferences
3. **Content-aware:** Better matches content-based responsive design
4. **Maintainability:** Single breakpoint is easier to maintain

### Action Plan

1. **Replace `768px` with `100ch` in `video_call.css`**
   - Convert the mobile media query from `max-width: 768px` to `max-width: 100ch`
   - Test to ensure video call still works correctly on mobile devices

2. **Document breakpoint rationale**
   - Use `100ch` for main layout/content breakpoint
   - Reserve fixed pixels only for specific component needs if truly necessary

3. **Consider creating CSS custom property**
   ```css
   :root {
     --breakpoint-mobile: 100ch;
   }
   
   @media (max-width: var(--breakpoint-mobile)) {
     /* mobile styles */
   }
   ```

## Testing Considerations

After standardizing to `100ch`:
- Test video call on devices with various screen sizes
- Verify mobile layouts still work correctly
- Check that video controls are appropriately sized
- Ensure video grid adapts correctly to viewport

## Additional Breakpoint Opportunities

While `100ch` is the primary breakpoint, consider if additional breakpoints would help:

- **Small mobile:** `< 50ch` or `< 30em` - Very small screens
- **Large desktop:** `> 120ch` or `> 80em` - Large monitors with extra space

Currently, the app appears to use a mobile-first approach with `100ch` as the single breakpoint, which is a valid strategy.

## Implementation Status

- [x] Document current breakpoint usage
- [x] Analyze 100ch vs 768px
- [ ] Update video_call.css to use 100ch
- [ ] Test breakpoint changes
- [ ] Consider CSS custom property for breakpoint

