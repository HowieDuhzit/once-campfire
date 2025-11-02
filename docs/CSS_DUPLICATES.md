# CSS Duplicates and Conflicts Documentation

## Overview

This document identifies duplicate CSS rules, conflicting selectors, and overlapping styles across the 27 stylesheet files.

## Duplicate :root Definitions

### Multiple :root Blocks Found

**Files with `:root` declarations:**
1. `base.css` - Defines font-family, hover variables
2. `colors.css` - Defines all color variables
3. `sidebar.css` - Defines sidebar-specific variables
4. `utilities.css` - Defines spacing variables

**Analysis:**
- All `:root` blocks are valid - CSS allows multiple `:root` selectors
- Each file defines its own namespace of variables
- No conflicts detected - each variable name is unique

**Recommendation:** This is fine - CSS variables cascade properly from multiple `:root` declarations.

## Conflicting Z-Index Values

### Z-Index: 3 Conflicts

**Found in:**
1. `layout.css:65` - `#left-sidebar` (with `.sidebar` class)
2. `layout.css:120` - `#sidebar` (with `.sidebar` class) 
3. `messages.css:339` - `.message__actions`
4. `actiontext.css:6` - `trix-toolbar`
5. `autocomplete.css:10` - `.autocomplete__list`
6. `base.css:241` - `.language-list`

**Issue:**
- Multiple unrelated components share the same z-index value
- Could cause layering issues if components overlap
- See `Z_INDEX_SCALE.md` for detailed analysis

**Recommendation:** Create standardized z-index scale with distinct values for each layer.

## Sidebar Selector Conflicts

### #sidebar Definition Conflicts

**Found in:**
1. `layout.css:109` - Base sidebar definition
2. `sidebar.css:88` - Override with different properties

**Specific Conflicts:**
- `layout.css:120`: `z-index: 3`
- `sidebar.css:98`: `z-index: 10`
- The `sidebar.css` rule takes precedence (later in cascade)

**Issue:**
- Confusing which styles apply
- Two different z-index values for same element
- Properties scattered across files

**Recommendation:** Consolidate sidebar styles or clearly document that `sidebar.css` overrides `layout.css`.

## Overflow Strategy Conflicts

### Multiple Overflow Declarations

**Same Selector, Different Values:**
- `html, body` in `_reset.css`: `overflow-x: hidden`
- `html, body` in `base.css`: `overflow: initial`

**Issue:**
- Conflicting overflow strategies for root elements
- `base.css` comes later and overrides reset

**Recommendation:** Standardize on one approach - either hide overflow at reset level or use initial.

## Duplicate Selector Patterns

### Common Selector Patterns Found

1. **Button Styles:**
   - `buttons.css` - Comprehensive button styles
   - `base.css` - Generic button/input styles via `:where(button, input...)`
   - Some overlap but different specificity

2. **Message Styles:**
   - `messages.css` - Main message styles
   - No duplicates found - clean separation

3. **Sidebar Styles:**
   - `layout.css` - Layout positioning
   - `sidebar.css` - Sidebar-specific styles
   - `nav.css` - Navigation within sidebar
   - Some overlap but intentional separation

## Text Overflow Utilities

### Duplicate Text Handling

**Found in:**
1. `utilities.css:76` - `.overflow-clip` utility
2. `utilities.css:77` - `.overflow-ellipsis` utility
3. `messages.css:246` - `.message__author` uses `overflow: hidden` + `text-overflow: ellipsis`

**Analysis:**
- Utility classes are intentionally reusable
- `.message__author` could use `.overflow-ellipsis` utility
- Not a conflict, but could be simplified

## Dark Mode Media Queries

### Duplicate Dark Mode Patterns

**Found in multiple files:**
- `colors.css:32` - Color variable overrides
- `actiontext.css:98, 111` - ActionText dark mode
- `autocomplete.css` - (none found)
- `buttons.css:37, 123, 159` - Button dark mode
- `code.css:22` - Code block dark mode
- `colorize.css:4, 12` - Image colorization dark mode
- `composer.css:72` - Composer dark mode
- `messages.css:514` - Messages dark mode
- `video_call.css:130, 251` - Video call dark mode

**Analysis:**
- Each file handles dark mode for its components
- No conflicts - each is component-specific
- Pattern is consistent but could use CSS custom properties

## Breakpoint Inconsistencies

### Media Query Patterns

**Primary Pattern:**
- `100ch` used in 20+ files
- `768px` was used in `video_call.css` (now fixed to `100ch`)

**Feature Detection:**
- `@media (any-hover: hover)` - Used in 5+ files
- `@media (prefers-color-scheme: dark)` - Used in 8+ files
- Consistent patterns, no conflicts

## CSS Variable Usage

### Potential Variable Conflicts

**Spacing Variables:**
- Defined in `utilities.css:2-8`
- Used consistently across files
- No conflicts found

**Color Variables:**
- Defined in `colors.css`
- Used consistently
- No conflicts found

## Recommendations

### High Priority

1. **Resolve Z-Index Conflicts**
   - Create standardized z-index scale
   - Assign unique values to each layer
   - Update all z-index declarations

2. **Clarify Sidebar Style Cascade**
   - Document that `sidebar.css` overrides `layout.css`
   - Or consolidate sidebar styles into one file
   - Remove duplicate `z-index: 3` from `layout.css` for `#sidebar`

3. **Resolve Root Overflow Conflict**
   - Choose one approach for `html, body` overflow
   - Either keep `overflow-x: hidden` from reset
   - Or use `overflow: initial` from base
   - Document the choice

### Medium Priority

4. **Standardize Text Overflow**
   - Use utility classes where possible
   - Replace inline `overflow: hidden` + `text-overflow: ellipsis` with `.overflow-ellipsis`

5. **Consolidate Dark Mode Styles**
   - Consider using CSS custom properties for dark mode
   - Or document the pattern for consistency

### Low Priority

6. **Review Button Style Overlap**
   - Verify `buttons.css` and `base.css` button styles work together
   - Document which takes precedence

## Testing Checklist

After resolving conflicts:
- [ ] Z-index layering works correctly
- [ ] Sidebar styles apply as expected
- [ ] Root overflow behavior is predictable
- [ ] Text overflow utilities work consistently
- [ ] Dark mode styles apply correctly
- [ ] No visual regressions

## Summary Statistics

- **:root blocks:** 4 (all unique variables - OK)
- **Z-index conflicts:** 6 uses of `z-index: 3` (needs standardization)
- **Sidebar conflicts:** 2 z-index values for same element (needs resolution)
- **Overflow conflicts:** 2 different values for `html, body` (needs resolution)
- **Duplicate patterns:** Mostly intentional utilities and consistent dark mode patterns

## Files with Most Potential Conflicts

1. `layout.css` + `sidebar.css` - Sidebar styles overlap
2. `_reset.css` + `base.css` - Root element styles overlap
3. Multiple files with `z-index: 3` - Needs standardization

