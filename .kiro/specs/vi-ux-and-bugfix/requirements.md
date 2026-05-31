# Requirements Document

## Introduction

This specification covers bug fixes and UX improvements for the Visual Inspector Chrome extension. Visual Inspector is a Manifest V3 Chrome extension that overlays design mockups on web pages to assist front-end developers with visual inspection and pixel-perfect development. The extension uses Vue 2.5 with a content script that injects a Shadow DOM UI, a separate popup Vue app, and interact.js for drag/resize. Priority is given to bug fixes first, followed by UX enhancements.

## Glossary

- **Content_Script**: The main JavaScript module (`content.js`) injected into web pages that bootstraps the Visual Inspector UI inside a Shadow DOM
- **App_Component**: The root Vue component (`App.vue`) that renders the toolbar, mockup overlay, and handles keyboard shortcuts
- **Mockup_Component**: The Vue component (`Mockup.vue`) responsible for rendering and positioning the design mockup image overlay
- **Popup_App**: The separate Vue application rendered in the Chrome extension popup for inserting images and changing language
- **Toolbar**: The floating control panel rendered at the bottom of the viewport containing all mockup manipulation controls
- **Tip_System**: The notification component and plugin that displays transient feedback messages in the top-right corner
- **useRestore_Watcher**: The Vue watcher on the `useRestore` data property that persists application state to `chrome.storage.local` using recursive `requestAnimationFrame`
- **CSP_Detector**: The `checkCSPForGlob` function that tests whether the page's Content Security Policy blocks blob URLs for images
- **Custom_Size_Inputs**: The four text input fields (width, height, left, top) that allow manual entry of mockup dimensions and position
- **wType_Watcher**: The Vue watcher on the `wType` data property that triggers quick-match presets (natural width, window width, center, etc.)
- **Shadow_DOM_Host**: The `window.appRoot` element with an attached shadow root that encapsulates the extension UI from the host page

## Requirements

### Requirement 1: useRestore Memory Leak Fix

**User Story:** As a developer, I want the auto-restore feature to properly clean up animation frames when toggled off, so that rapid toggling does not cause memory leaks or performance degradation.

#### Acceptance Criteria

1. WHEN the useRestore_Watcher activates with a value of true, THE App_Component SHALL store the requestAnimationFrame ID in an instance property.
2. WHEN the useRestore_Watcher activates with a value of false, THE App_Component SHALL cancel the stored requestAnimationFrame using cancelAnimationFrame before removing storage data.
3. WHEN the App_Component is destroyed, THE App_Component SHALL cancel any active requestAnimationFrame associated with the useRestore_Watcher.
4. WHILE useRestore is true, THE App_Component SHALL maintain only one active requestAnimationFrame loop at any time.

### Requirement 2: CSP Detection Race Condition Fix

**User Story:** As a developer, I want CSP detection to work reliably on slow-loading pages, so that blob URL support is correctly determined without false positives.

#### Acceptance Criteria

1. WHEN the CSP_Detector tests blob URL support, THE Content_Script SHALL wait a minimum of 1000ms before resolving the promise as successful.
2. WHEN a securitypolicyviolation event fires for a blob img-src directive, THE CSP_Detector SHALL immediately reject the promise and clean up the test element.
3. WHEN the CSP_Detector timeout elapses without a violation event, THE CSP_Detector SHALL remove the event listener and the test DOM element before resolving.
4. IF the CSP_Detector test element cannot be appended to the document body, THEN THE CSP_Detector SHALL fall back to using the data URL directly.

### Requirement 3: Custom Size Input Character Filtering Fix

**User Story:** As a developer, I want to enter negative numbers and decimal values in the left and top position inputs, so that I can precisely position the mockup off-screen or at sub-pixel coordinates.

#### Acceptance Criteria

1. WHEN a user types in the left or top Custom_Size_Inputs, THE App_Component SHALL allow the minus character (keyCode 45 / character `-`).
2. WHEN a user types in any Custom_Size_Input, THE App_Component SHALL allow the period character (keyCode 46 / character `.`).
3. WHEN a user types in the width or height Custom_Size_Inputs, THE App_Component SHALL block the minus character.
4. THE App_Component SHALL allow digit characters (0-9) in all Custom_Size_Inputs.
5. WHEN a user presses Enter in any Custom_Size_Input, THE App_Component SHALL blur the input to commit the value.

### Requirement 4: Dead Send Method Removal

**User Story:** As a developer, I want dead code removed from App.vue, so that the codebase is clean and does not reference unavailable APIs.

#### Acceptance Criteria

1. THE App_Component SHALL NOT contain a `send` method that references the `chrome.tabs` API.
2. THE App_Component SHALL retain all other methods that are actively used by the component.

### Requirement 5: Mockup Component Decoupling

**User Story:** As a developer, I want the Mockup component to receive data through props and emit events to the parent, so that the component is reusable and not fragile to hierarchy changes.

#### Acceptance Criteria

1. THE Mockup_Component SHALL receive mockup position and size data exclusively through props rather than accessing `this.$parent.mockup`.
2. WHEN the user drags the mockup, THE Mockup_Component SHALL emit a `move` event with the updated left and top values.
3. WHEN the user resizes the mockup, THE Mockup_Component SHALL emit a `resize` event with the updated width, height, left, and top values.
4. THE App_Component SHALL pass the mockup data object as a prop to the Mockup_Component.
5. WHEN the App_Component receives a move or resize event from the Mockup_Component, THE App_Component SHALL update the mockup data accordingly.

### Requirement 6: wType Watcher Guard

**User Story:** As a developer, I want the wType watcher to skip processing when the value is -1, so that the `moveAndResize` method does not trigger unnecessary watcher executions.

#### Acceptance Criteria

1. WHEN the wType_Watcher receives a value of -1, THE App_Component SHALL skip all switch-case processing and return immediately.
2. WHEN the wType_Watcher receives a value of 0 through 4, THE App_Component SHALL execute the corresponding quick-match logic.

### Requirement 7: Toolbar Drag Handle Indicator

**User Story:** As a user, I want a visible drag handle icon on the toolbar title, so that I can discover that the toolbar is draggable.

#### Acceptance Criteria

1. THE Toolbar SHALL display a grip-dots SVG icon immediately before the title text.
2. THE grip-dots icon SHALL be visually consistent with the toolbar styling (matching the title color and size).
3. WHEN the user hovers over the title area, THE Toolbar SHALL display a `move` cursor to indicate draggability.

### Requirement 8: Custom Size Input Accessibility

**User Story:** As a user relying on assistive technology, I want the custom size inputs to have proper labels, so that screen readers can announce the purpose of each field.

#### Acceptance Criteria

1. THE App_Component SHALL add an `aria-label` attribute to the width Custom_Size_Input with the value "width".
2. THE App_Component SHALL add an `aria-label` attribute to the height Custom_Size_Input with the value "height".
3. THE App_Component SHALL add an `aria-label` attribute to the left Custom_Size_Input with the value "left".
4. THE App_Component SHALL add an `aria-label` attribute to the top Custom_Size_Input with the value "top".

### Requirement 9: Image Load Error Feedback

**User Story:** As a user, I want to see a notification when a mockup image fails to load, so that I know the image URL is invalid or inaccessible.

#### Acceptance Criteria

1. WHEN the `getImg` method promise rejects, THE App_Component SHALL display an error message through the Tip_System.
2. THE error message SHALL clearly indicate that the image failed to load.
3. THE Tip_System SHALL display the error message for the standard 3-second duration before fading out.

### Requirement 10: Keyboard Shortcut Conflict Prevention

**User Story:** As a user, I want keyboard shortcuts to be suppressed when I am typing in form fields, so that pressing h, f, or d in an input does not toggle extension features.

#### Acceptance Criteria

1. WHEN the active element is an `input` element, THE App_Component SHALL ignore the h, f, and d toggle shortcuts.
2. WHEN the active element is a `textarea` element, THE App_Component SHALL ignore the h, f, and d toggle shortcuts.
3. WHEN the active element has the `contenteditable` attribute set to true, THE App_Component SHALL ignore the h, f, and d toggle shortcuts.
4. WHEN the active element is an `input` element, THE App_Component SHALL ignore the number-key opacity shortcuts.
5. WHEN the active element is a `textarea` element, THE App_Component SHALL ignore the number-key opacity shortcuts.
6. WHEN the active element has the `contenteditable` attribute set to true, THE App_Component SHALL ignore the number-key opacity shortcuts.

### Requirement 11: Popup Shortcut Reference

**User Story:** As a user, I want to see a keyboard shortcut reference in the popup, so that I can quickly learn the available shortcuts without consulting external documentation.

#### Acceptance Criteria

1. THE Popup_App SHALL display a shortcut reference section below the existing controls.
2. THE shortcut reference SHALL list the h, f, d, number-key, and arrow-key shortcuts with brief descriptions.
3. THE shortcut reference SHALL respect the current locale (English or Chinese) selected in the Popup_App.

### Requirement 12: Opacity Shortcut UI Guidance

**User Story:** As a user, I want guidance on how the number-key opacity shortcut works, so that I can use it without memorizing the console help output.

#### Acceptance Criteria

1. THE Toolbar SHALL display a tooltip or help text near the opacity slider explaining the number-key shortcut behavior.
2. THE help text SHALL describe that pressing one digit sets opacity to that digit times 10%, and pressing two digits within one second sets opacity to that two-digit percentage.
3. THE help text SHALL respect the current locale (English or Chinese).

### Requirement 13: Dropdown SVG Chevron Icons

**User Story:** As a user, I want dropdown indicators to use proper SVG chevron icons instead of the `^` text character, so that the UI looks polished and professional.

#### Acceptance Criteria

1. THE Toolbar blend-mode dropdown SHALL display an inline SVG chevron icon instead of the `^` text character.
2. THE Toolbar quick-match dropdown SHALL display an inline SVG chevron icon instead of the `^` text character.
3. THE SVG chevron icons SHALL point downward to indicate a dropdown action.
4. THE SVG chevron icons SHALL match the surrounding text size and color.
