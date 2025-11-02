# Z-Index Scale Documentation

## Overview

This document catalogs all z-index values used across the application stylesheets and provides a standardized scale to resolve conflicts and ensure consistent layering.

## Current Z-Index Values

### Layer 0: Base Content
**Value: `0`**
- `.message` (default state) - `messages.css:102`
  - Base stacking context for messages
  - Purpose: Default message positioning

### Layer 1: Content Overlays
**Value: `1`**
- `#system_welcome` - `messages.css:42`
  - System welcome message
  - Purpose: Ensure welcome message visibility
  
- `.message` (when has `[open]` menu) - `messages.css:121`
  - Message with open action menu
  - Purpose: Raise message above others when menu is open
  
- `.video-call__participant-name` - `video_call.css:126`
  - Participant name overlay on video
  - Purpose: Overlay text on video element
  
- `.message__pending-upload::before` - `messages.css:578`
  - Progress bar background
  - Purpose: Background layer for upload progress

### Layer 2: Interactive Elements
**Value: `2`**
- `.message__avatar` - `messages.css:195`
  - Message avatar
  - Purpose: Ensure avatar appears above message background
  
- `.video-call__remote-controls` - `video_call.css:271`
  - Control buttons on remote video
  - Purpose: Overlay controls on video
  
- `.attachment__toolbar` (in trix-editor) - `actiontext.css:77`
  - Attachment toolbar in editor
  - Purpose: Toolbar overlay on attachments
  
- `.attachment__toolbar` (in mentions) - `autocomplete.css:45`
  - Attachment toolbar in mentions
  - Purpose: Toolbar overlay on mention attachments
  
- `.mention` - `autocomplete.css:61`
  - Mention element with avatar
  - Purpose: Ensure mention appears above content
  
- `blockquote .attachment--preview` - `autocomplete.css:90`
  - Preview attachment in blockquote
  - Purpose: Ensure preview appears above blockquote content
  
- `.message__pending-upload > div` - `messages.css:582`
  - Upload progress content
  - Purpose: Content above progress bar background

### Layer 3: Sidebars and Popups
**Value: `3`**
- `#left-sidebar` (with `.sidebar` class) - `layout.css:65`
  - Left navigation sidebar
  - Purpose: Sidebar backdrop overlay
  
- `#sidebar` (with `.sidebar` class) - `layout.css:120`
  - Right sidebar
  - Purpose: Sidebar backdrop overlay (NOTE: Duplicate value with left sidebar)
  
- `.message__actions` - `messages.css:339`
  - Message action buttons
  - Purpose: Action buttons overlay
  
- `trix-toolbar` - `actiontext.css:6`
  - Rich text editor toolbar (sticky)
  - Purpose: Toolbar stays above content when scrolling
  
- `.autocomplete__list` - `autocomplete.css:10`
  - Autocomplete dropdown list
  - Purpose: Dropdown appears above input and other content
  
- `.language-list` - `base.css:241`
  - Language selection list
  - Purpose: Dropdown appears above page content

### Layer 5: Sidebar Controls
**Value: `5`**
- `.sidebar__toggle` - `sidebar.css:67`
  - Sidebar toggle button
  - Purpose: Toggle button above sidebar content

### Layer 6: Flash Messages
**Value: `6`**
- `.flash` - `flash.css:8`
  - Flash notification messages
  - Purpose: Flash messages appear above most content (but below modal overlays)

### Layer 10: Main Sidebar
**Value: `10`**
- `#sidebar` (with `.sidebar` class) - `sidebar.css:98`
  - Right sidebar container
  - Purpose: Sidebar appears above main content
  - **CONFLICT**: This overrides the z-index: 3 in layout.css for the same element

### Layer 11: Skip Navigation
**Value: `11`**
- `.skip-navigation` - `nav.css:41`
  - Skip to main content link
  - Purpose: Always accessible for keyboard navigation

### Layer 100: Video Call Indicators
**Value: `100`**
- `.video-call--reconnecting::after` - `video_call.css:332`
  - Reconnecting indicator overlay
  - Purpose: Connection status indicator
  
- `.video-call--quality-poor::before` - `video_call.css:350`
  - Quality indicator (poor)
  - Purpose: Network quality indicator
  
- `.video-call--quality-fair::before` - `video_call.css:363`
  - Quality indicator (fair)
  - Purpose: Network quality indicator
  
- `.video-call--quality-good::before`, `.video-call--quality-excellent::before` - `video_call.css:377`
  - Quality indicators (good/excellent)
  - Purpose: Network quality indicators

### Layer 1000: Error Messages
**Value: `1000`**
- `.video-call__error` - `video_call.css:394`
  - Video call error message container
  - Purpose: Error messages appear above all other content

## Identified Conflicts and Issues

### 1. Duplicate Z-Index: 3
**Conflict:** Both `#left-sidebar` and `#sidebar` use `z-index: 3`
- **Location**: `layout.css:65` (left-sidebar) and `layout.css:120` (sidebar)
- **Issue**: Both sidebars have the same z-index, but right sidebar also has `z-index: 10` in `sidebar.css:98`
- **Resolution**: The `sidebar.css` value (10) takes precedence for right sidebar, but left sidebar remains at 3

### 2. Inconsistent Sidebar Z-Index
**Conflict:** Right sidebar has two different z-index values
- `layout.css:120`: `z-index: 3`
- `sidebar.css:98`: `z-index: 10`
- **Issue**: The later stylesheet rule wins, but this creates confusion
- **Resolution**: Standardize to use `z-index: 10` consistently, or use CSS specificity to make it clear

### 3. Video Call Indicators Very High
**Observation:** Video call quality indicators use `z-index: 100`
- **Consideration**: This is unnecessarily high given the current scale
- **Recommendation**: Could be reduced to match the layer 10-11 range

## Recommended Z-Index Scale

### Proposed Standardized Scale

```
Base Content Layer:      0-1
  - Default content: 0
  - Content overlays: 1

Interactive Elements:    2-3
  - Avatars, toolbars: 2
  - Action menus: 3

Sidebars & Popups:       4-6
  - Sidebar backdrop: 4
  - Sidebar content: 5
  - Flash messages: 6

Top-Level UI:           10-11
  - Main sidebars: 10
  - Skip navigation: 11

High Priority Overlays: 100-1000
  - Connection indicators: 100
  - Critical errors: 1000
```

## Recommendations

### 1. Resolve Sidebar Z-Index Conflicts
- **Action**: Remove duplicate `z-index: 3` from `layout.css` for `#sidebar`
- **Keep**: `z-index: 10` from `sidebar.css` for right sidebar
- **Update**: Left sidebar should remain at `z-index: 3` or be standardized

### 2. Standardize Sidebar Z-Index
- **Option A**: Use `z-index: 3` for both (lower priority)
- **Option B**: Use `z-index: 10` for both (current right sidebar value)
- **Recommendation**: Option B to ensure sidebars are clearly above main content

### 3. Reduce Video Call Indicator Z-Index
- **Current**: `z-index: 100`
- **Recommended**: `z-index: 10` or `z-index: 11`
- **Reason**: These indicators don't need to be higher than sidebars

### 4. Create Z-Index Variables
Consider adding CSS custom properties for z-index values:
```css
:root {
  --z-base: 0;
  --z-content-overlay: 1;
  --z-interactive: 2;
  --z-popup: 3;
  --z-sidebar-backdrop: 4;
  --z-sidebar-control: 5;
  --z-flash: 6;
  --z-sidebar: 10;
  --z-skip-nav: 11;
  --z-video-indicator: 10;
  --z-error: 1000;
}
```

## Implementation Priority

1. **High Priority**: Resolve sidebar z-index conflicts
2. **Medium Priority**: Standardize video call indicator z-index
3. **Low Priority**: Implement z-index CSS variables

## Testing Checklist

After implementing changes, test:
- [ ] Sidebars don't overlap incorrectly
- [ ] Flash messages appear above content but below sidebars
- [ ] Video call indicators don't block important UI elements
- [ ] Message action menus appear correctly
- [ ] Autocomplete dropdowns appear above input fields
- [ ] Skip navigation link is always accessible

