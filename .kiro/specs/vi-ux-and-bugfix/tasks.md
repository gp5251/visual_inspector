# Implementation Plan: Visual Inspector UX & Bug Fixes

## Overview

This plan implements 6 bug fixes and 7 UX improvements for the Visual Inspector Chrome extension. Tasks are ordered to address critical bugs first (memory leaks, race conditions), then structural refactors (component decoupling, dead code removal), and finally UX enhancements (accessibility, icons, shortcut reference). All code is JavaScript (Vue 2.5 + Webpack 4 + Manifest V3).

## Tasks

- [x] 1. Fix useRestore rAF memory leak and CSP race condition
  - [x] 1.1 Fix useRestore watcher to store and cancel rAF IDs
    - Store `requestAnimationFrame` return value in `this._rafId`
    - Cancel existing rAF before starting a new loop when `useRestore` becomes true
    - Cancel rAF and set `this._rafId = null` when `useRestore` becomes false
    - Cancel rAF in `beforeDestroy` lifecycle hook before setting `useRestore = false`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 1.2 Write property test for single rAF loop invariant
    - **Property 1: Single rAF Loop Invariant**
    - **Validates: Requirements 1.4**

  - [x] 1.3 Fix CSP detection race condition in content.js
    - Increase timeout from 200ms to 1000ms
    - Track `resolved` flag to prevent double resolution
    - Remove event listener on both success and failure paths
    - Add try/catch around `document.body.appendChild` with data URL fallback
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Fix custom size input filtering and remove dead code
  - [x] 3.1 Update handleCustomSizeInput to allow minus and period characters
    - Accept `inputType` parameter ('dimension' or 'position')
    - Allow digits (0-9) and period (.) for all inputs
    - Allow minus (-) only for position inputs (left, top)
    - Keep Enter key blur behavior
    - Update template to pass input type to handler: `@keypress="e => handleCustomSizeInput(e, 'dimension')"` for width/height, `@keypress="e => handleCustomSizeInput(e, 'position')"` for left/top
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 3.2 Write property test for custom size input character filtering
    - **Property 2: Custom Size Input Character Filtering**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

  - [x] 3.3 Remove dead `send` method from App.vue
    - Delete the `send` method that references `chrome.tabs.query` / `chrome.tabs.sendMessage`
    - Verify no other code in App.vue calls `this.send()`
    - _Requirements: 4.1, 4.2_

- [x] 4. Decouple Mockup component from parent and add wType guard
  - [x] 4.1 Refactor Mockup.vue to use props and emit events
    - Add `mockup` prop (Object, required) with shape `{ width, height, left, top }`
    - Replace all `this.$parent.mockup` reads with `this.mockup` prop in computed properties
    - Replace `this.$parent.mockup` writes in drag handler with `this.$emit('move', { left, top })`
    - Replace `this.$parent.mockup` writes in resize handler with `this.$emit('resize', { width, height, left, top })`
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 4.2 Update App.vue to pass mockup prop and handle events
    - Pass `:mockup="mockup"` prop to Mockup component in template
    - Add `onMockupMove({ left, top })` method to update `this.mockup`
    - Add `onMockupResize({ width, height, left, top })` method to update `this.mockup`
    - Bind `@move="onMockupMove"` and `@resize="onMockupResize"` on Mockup component
    - _Requirements: 5.4, 5.5_

  - [ ]* 4.3 Write property test for Mockup event emission correctness
    - **Property 3: Mockup Emits Correct Interaction Events**
    - **Validates: Requirements 5.2, 5.3**

  - [ ]* 4.4 Write property test for parent mockup data update from events
    - **Property 4: Parent Updates Mockup Data from Events**
    - **Validates: Requirements 5.5**

  - [x] 4.5 Add guard to wType watcher for -1 value
    - Add `if (val === -1) return;` at the top of the wType watcher
    - _Requirements: 6.1, 6.2_

  - [ ]* 4.6 Write property test for wType quick-match dimensions
    - **Property 5: wType Quick-Match Produces Correct Dimensions**
    - **Validates: Requirements 6.2**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement keyboard shortcut conflict prevention
  - [x] 6.1 Add isFormElement helper and update shortcut handlers
    - Add `isFormElement(el)` method that checks for input, textarea, or contenteditable
    - Update `fastToggle` to check `shadowRoot.activeElement` (or `document.activeElement`) via `isFormElement` before processing
    - Update `fastOpacity` to check active element via `isFormElement` before processing
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ]* 6.2 Write property test for keyboard shortcut suppression
    - **Property 6: Keyboard Shortcuts Suppressed on Form Elements**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6**

- [x] 7. Add UX enhancements to toolbar and inputs
  - [x] 7.1 Add drag handle grip-dots SVG icon to toolbar title
    - Insert inline SVG with 6 circles (grip-dots pattern) before "Visual Inspector" text in `<h3>`
    - Use `fill="currentColor"` to inherit title color
    - Add `aria-hidden="true"` to SVG
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 7.2 Add aria-label attributes to custom size inputs
    - Add `aria-label="width"` to width input
    - Add `aria-label="height"` to height input
    - Add `aria-label="left"` to left input
    - Add `aria-label="top"` to top input
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 7.3 Add image load error feedback via Tip system
    - In the `src` watcher error handler, set `this.tipMsg = this.$t("tip.imgLoadError")`
    - Add `"imgLoadError": "Image failed to load. Please check the file."` to `en.json` tip section
    - Add `"imgLoadError": "图片加载失败，请检查文件。"` to `cn.json` tip section
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 7.4 Replace dropdown `^` text with SVG chevron icons
    - Replace `<span class="ico">^</span>` in blend-mode dropdown with inline SVG chevron
    - Replace `<span class="ico">^</span>` in quick-match dropdown with inline SVG chevron
    - Add `.vi_chevron_icon` CSS for vertical alignment and sizing
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [x] 7.5 Add opacity shortcut tooltip to slider area
    - Add `:title="$t('opacityHelp')"` to the `.vi_opacity` wrapper div
    - Add `"opacityHelp"` locale key to `en.json` explaining number-key shortcut behavior
    - Add `"opacityHelp"` locale key to `cn.json` with Chinese translation
    - _Requirements: 12.1, 12.2, 12.3_

- [x] 8. Add popup shortcut reference section
  - [x] 8.1 Add shortcut reference UI to PopupApp.vue
    - Add a `<div class="shortcuts">` section below existing controls
    - List all keyboard shortcuts (H, F, D, 0-9, arrows, Shift+arrows, Alt+0, Alt+1~4) with descriptions
    - Use `$t()` for all text to support locale switching
    - _Requirements: 11.1, 11.2_

  - [x] 8.2 Add shortcut locale messages to popup.js i18n config
    - Add `shortcuts` object to Chinese messages with title and all shortcut descriptions
    - Add `shortcuts` object to English messages with title and all shortcut descriptions
    - _Requirements: 11.3_

  - [ ]* 8.3 Write property test for shortcut reference locale consistency
    - **Property 7: Shortcut Reference Locale Consistency**
    - **Validates: Requirements 11.3**

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses Vue 2.5, Webpack 4, and Chrome Manifest V3
- All UI runs inside a Shadow DOM, which affects how `activeElement` is accessed for shortcut suppression

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.3"] },
    { "id": 1, "tasks": ["1.2", "3.1", "3.3"] },
    { "id": 2, "tasks": ["3.2", "4.1", "4.5"] },
    { "id": 3, "tasks": ["4.2", "4.6"] },
    { "id": 4, "tasks": ["4.3", "4.4", "6.1"] },
    { "id": 5, "tasks": ["6.2", "7.1", "7.2", "7.3", "7.4", "7.5"] },
    { "id": 6, "tasks": ["8.1", "8.2"] },
    { "id": 7, "tasks": ["8.3"] }
  ]
}
```
