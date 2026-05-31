# Design Document

## Overview

This document describes the architecture and implementation design for the Visual Inspector UX improvements and bug fixes. The changes span the content script (`content.js`), the main App component (`App.vue`), the Mockup component (`Mockup.vue`), the Popup app (`PopupApp.vue`), locale files, and associated styles. All changes maintain backward compatibility with the existing Vue 2.5 + Webpack 4 + Manifest V3 stack.

## Architecture

The Visual Inspector extension follows a layered architecture:

```
┌─────────────────────────────────────────────────────┐
│  Chrome Extension Runtime (Manifest V3)             │
├─────────────────────────────────────────────────────┤
│  Popup App (popup.js → PopupApp.vue)                │
│    - File picker, quit button, lang switch          │
│    - Shortcut reference section (NEW)               │
├─────────────────────────────────────────────────────┤
│  Content Script (content.js)                        │
│    - CSP detection (checkCSPForGlob)                │
│    - Message routing                                │
│    - Vue app bootstrap into Shadow DOM              │
├─────────────────────────────────────────────────────┤
│  Shadow DOM UI                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │ App.vue (root component)                      │  │
│  │  - Toolbar (controls, inputs, dropdowns)      │  │
│  │  - Keyboard shortcut handlers                 │  │
│  │  - useRestore watcher (rAF loop)             │  │
│  │  - Drag handle (interact.js)                  │  │
│  ├───────────────────────────────────────────────┤  │
│  │ Mockup.vue (child component)                  │  │
│  │  - Props-based positioning (REFACTORED)       │  │
│  │  - Emits move/resize events (NEW)             │  │
│  │  - interact.js drag + resize                  │  │
│  ├───────────────────────────────────────────────┤  │
│  │ Tip.vue (notification overlay)                │  │
│  │  - Transient messages (3s fade)               │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. useRestore Watcher (Bug Fix)

**Current problem:** The watcher uses `requestAnimationFrame` recursively but never stores the frame ID. Rapid toggling of `useRestore` can spawn multiple concurrent rAF loops with no way to cancel them.

**Solution:**

```javascript
// App.vue - useRestore watcher
watch: {
  useRestore: {
    handler(val) {
      if (val) {
        const fn = throttle(() => {
          if (this.useRestore) {
            let { opacity, freeze, blendMode, wType, mockup, img, useRestore, showPanel } = this.$data;
            chrome.storage.local.set({
              _viData: JSON.stringify({ opacity, freeze, blendMode, wType, mockup, img, useRestore, showPanel })
            });
            this._rafId = requestAnimationFrame(fn);
          } else {
            chrome.storage.local.remove('_viData');
          }
        }, 500);

        // Cancel any existing loop before starting a new one
        if (this._rafId) {
          cancelAnimationFrame(this._rafId);
        }
        this._rafId = requestAnimationFrame(fn);
      } else {
        // Cancel the active rAF loop
        if (this._rafId) {
          cancelAnimationFrame(this._rafId);
          this._rafId = null;
        }
        chrome.storage.local.remove('_viData');
      }

      this.tipMsg = this.$t(val ? "tip.useRestore" : "tip.unUseRestore");
    },
    immediate: true
  }
}
```

In `beforeDestroy`:
```javascript
beforeDestroy() {
  this.unBindEvs();
  this.removeCss();
  if (this._rafId) {
    cancelAnimationFrame(this._rafId);
    this._rafId = null;
  }
  this.useRestore = false;
}
```

### 2. CSP Detection Race Condition Fix

**Current problem:** The `checkCSPForGlob` function uses a 200ms timeout which is too short for slow-loading pages. The event listener is not always cleaned up on the success path.

**Solution:**

```javascript
// content.js - checkCSPForGlob
checkCSPForGlob(dataUrl) {
  return new Promise((resolve, reject) => {
    let resolved = false;

    const handleCspOnce = (e) => {
      if (e.blockedURI === 'blob' && e.violatedDirective === 'img-src') {
        resolved = true;
        document.removeEventListener("securitypolicyviolation", handleCspOnce);
        div.remove();
        reject();
      }
    };

    let blobObj = this.dataURLtoBlob(dataUrl);
    let url = window.URL.createObjectURL(blobObj);
    let div = document.createElement('div');
    div.style.cssText = `
      display: none;
      width: 100px;
      height: 100px;
      background: url(${url});
    `;

    try {
      document.body.appendChild(div);
    } catch (e) {
      // Cannot append to body — fall back to data URL
      resolve(dataUrl);
      return;
    }

    document.addEventListener("securitypolicyviolation", handleCspOnce);

    setTimeout(() => {
      if (!resolved) {
        document.removeEventListener("securitypolicyviolation", handleCspOnce);
        div.remove();
        resolve(url);
      }
    }, 1000);
  });
}
```

### 3. Custom Size Input Character Filtering

**Current problem:** `handleCustomSizeInput` only allows digits (keyCodes 48-57) and Enter. It blocks minus (`-`) and period (`.`), preventing negative positions and decimal values.

**Solution:**

```javascript
// App.vue - template (differentiate inputs by data attribute)
<div class="vi_customSize vi_formLine" @keydown.stop @keyup.stop>
  <input title="width" aria-label="width" placeholder="width" type="text"
    class="vi_input" v-model.lazy="mockup.width"
    @keypress="e => handleCustomSizeInput(e, 'dimension')" />
  <input title="height" aria-label="height" placeholder="height" type="text"
    class="vi_input" v-model.lazy="mockup.height"
    @keypress="e => handleCustomSizeInput(e, 'dimension')" />
  <input title="left" aria-label="left" placeholder="left" type="text"
    class="vi_input" v-model.lazy="mockup.left"
    @keypress="e => handleCustomSizeInput(e, 'position')" />
  <input title="top" aria-label="top" placeholder="top" type="text"
    class="vi_input" v-model.lazy="mockup.top"
    @keypress="e => handleCustomSizeInput(e, 'position')" />
</div>
```

```javascript
// App.vue - method
handleCustomSizeInput(e, inputType) {
  const key = e.key || String.fromCharCode(e.which);
  const isDigit = key >= '0' && key <= '9';
  const isPeriod = key === '.';
  const isMinus = key === '-';
  const isEnter = key === 'Enter' || e.which === 13;

  if (isEnter) {
    e.target.blur();
    return;
  }

  // Allow: digits always, period always, minus only for position inputs
  if (isDigit || isPeriod) return;
  if (isMinus && inputType === 'position') return;

  e.preventDefault();
}
```

### 4. Dead Send Method Removal

Remove the `send` method from `App.vue` that references `chrome.tabs.query` / `chrome.tabs.sendMessage`. This API is only available in popup/background contexts, not content scripts. The method is never called within App.vue.

### 5. Mockup Component Decoupling

**Current problem:** `Mockup.vue` accesses `this.$parent.mockup` directly for both reading and writing, creating tight coupling.

**Solution — Props down, events up:**

```javascript
// Mockup.vue - props
props: {
  src: String,
  opacity: Number,
  freeze: [Boolean, Number],
  blendMode: String,
  mockup: {
    type: Object,
    required: true
    // { width, height, left, top }
  }
}
```

```javascript
// Mockup.vue - computed (use props instead of $parent)
computed: {
  mockupStyle() {
    let { width, height, left, top } = this.mockup;
    let style = {
      'mix-blend-mode': this.blendMode,
      width: width + 'px',
      height: height + 'px',
      transform: `translate(${left}px, ${top}px)`,
      backgroundImage: `url(${this.src})`,
      opacity: this.opacity
    };
    if (this.freeze) style.pointerEvents = 'none';
    return style;
  },
  rect() {
    let { width, height, left, top } = this.mockup;
    return { w: width, h: height, x: left, y: top };
  }
}
```

```javascript
// Mockup.vue - interact.js handlers emit events
initMockup() {
  interact(this.$el)
    .draggable({
      onmove: event => {
        let target = event.target,
          x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
          y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
        this.$emit('move', { left: x.toFixed(1), top: y.toFixed(1) });
      }
    })
    .resizable({
      edges: { left: true, right: true, bottom: true, top: true },
      restrictSize: { min: { width: 100, height: 50 } },
      inertia: true,
    })
    .on('resizemove', event => {
      let target = event.target,
        x = (parseFloat(target.getAttribute('data-x')) || 0),
        y = (parseFloat(target.getAttribute('data-y')) || 0);
      x += event.deltaRect.left;
      y += event.deltaRect.top;
      this.$emit('resize', {
        width: event.rect.width.toFixed(1),
        height: event.rect.height.toFixed(1),
        left: x.toFixed(1),
        top: y.toFixed(1)
      });
    });
}
```

```html
<!-- App.vue - template -->
<Mockup
  :opacity="opacity"
  :blendMode="blendMode"
  :freeze="freeze"
  :src="img.src"
  :mockup="mockup"
  v-if="img.src"
  :style="{ visibility: showMockup ? 'visible' : 'hidden' }"
  @move="onMockupMove"
  @resize="onMockupResize"
/>
```

```javascript
// App.vue - methods
onMockupMove({ left, top }) {
  this.mockup.left = left;
  this.mockup.top = top;
},
onMockupResize({ width, height, left, top }) {
  Object.assign(this.mockup, { width, height, left, top });
}
```

### 6. wType Watcher Guard

```javascript
// App.vue - wType watcher
wType(val) {
  if (val === -1) return; // Guard: skip processing for reset value

  let mockup = this.mockup;
  switch (val) {
    case 0:
      this.moveAndResize({ width: this.img.width, height: this.img.height });
      this.tipMsg = this.$t("quickMatch.naturalWidth");
      break;
    case 1:
      this.moveAndResize({ width: this.img.width * 2, height: this.img.height * 2 });
      this.tipMsg = this.$t("quickMatch.naturalWidth*2");
      break;
    case 2:
      this.moveAndResize({ width: this.img.width / 2, height: this.img.height / 2 });
      this.tipMsg = this.$t("quickMatch.naturalWidth/2");
      break;
    case 3:
      let width = window.innerWidth,
        height = this.img.height / (this.img.width / width);
      this.moveAndResize({ left: 0, top: 0, width, height });
      this.tipMsg = this.$t("quickMatch.windowWidth");
      break;
    case 4:
      this.moveAndResize({
        left: Math.max(0, (window.innerWidth - mockup.width) / 2),
        top: Math.max(0, (window.innerHeight - mockup.height) / 2 + Math.max(document.documentElement.scrollTop, document.body.scrollTop))
      });
      this.tipMsg = this.$t("quickMatch.centerInScreen");
      break;
  }
}
```

### 7. Toolbar Drag Handle Indicator

Add an inline SVG grip-dots icon inside the `<h3>` element:

```html
<h3>
  <svg class="vi_grip_icon" width="8" height="14" viewBox="0 0 8 14" fill="currentColor" aria-hidden="true">
    <circle cx="2" cy="2" r="1.5"/>
    <circle cx="6" cy="2" r="1.5"/>
    <circle cx="2" cy="7" r="1.5"/>
    <circle cx="6" cy="7" r="1.5"/>
    <circle cx="2" cy="12" r="1.5"/>
    <circle cx="6" cy="12" r="1.5"/>
  </svg>
  Visual Inspector
</h3>
```

CSS already sets `cursor: move` on `h3` via the existing `cursor: move; user-select: none;` rules. The SVG uses `fill="currentColor"` to inherit the title color (`#2d8cf0`).

### 8. Custom Size Input Accessibility

Add `aria-label` attributes to each input (shown in Section 3 template above). The `title` attribute already exists; `aria-label` provides explicit screen reader support.

### 9. Image Load Error Feedback

```javascript
// App.vue - src watcher
src: {
  handler(val) {
    this.getImg(val).then(({ width, height, src }) => {
      this.img = { width, height, src };
      if (!this.useRestore) this.reset();
    }, err => {
      console.error('failed to get img', err);
      this.tipMsg = this.$t("tip.imgLoadError");
    });
  },
  immediate: true
}
```

Add locale keys:
```json
// en.json
"tip": {
  ...
  "imgLoadError": "Image failed to load. Please check the file."
}

// cn.json
"tip": {
  ...
  "imgLoadError": "图片加载失败，请检查文件。"
}
```

### 10. Keyboard Shortcut Conflict Prevention

Add a helper method to check if the active element is a form field:

```javascript
// App.vue - methods
isFormElement(el) {
  if (!el) return false;
  const tag = el.tagName && el.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea') return true;
  if (el.getAttribute && el.getAttribute('contenteditable') === 'true') return true;
  return false;
}
```

Update `fastToggle` and `fastOpacity`:

```javascript
fastToggle(e) {
  if (e.target !== e.currentTarget) return;
  if (this.isFormElement(e.target)) return;
  // ... existing logic
},

fastOpacity(e) {
  if (e.target !== e.currentTarget || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (this.isFormElement(e.target)) return;
  // ... existing logic
}
```

**Note:** Since events are bound on `document.body` and the check is `e.target !== e.currentTarget`, the existing guard already prevents firing when the target is a child element. However, within the Shadow DOM, `e.target` may be `document.body` even when a shadow input has focus. The fix should check `document.activeElement` (or the shadow root's `activeElement`) instead:

```javascript
fastToggle(e) {
  const activeEl = (window.appRoot && window.appRoot.shadowRoot)
    ? window.appRoot.shadowRoot.activeElement
    : document.activeElement;
  if (this.isFormElement(activeEl)) return;
  if (e.target !== e.currentTarget) return;
  // ... existing logic
},

fastOpacity(e) {
  const activeEl = (window.appRoot && window.appRoot.shadowRoot)
    ? window.appRoot.shadowRoot.activeElement
    : document.activeElement;
  if (this.isFormElement(activeEl)) return;
  if (e.target !== e.currentTarget || e.ctrlKey || e.shiftKey || e.altKey) return;
  // ... existing logic
}
```

### 11. Popup Shortcut Reference

Add a shortcut reference section to `PopupApp.vue`:

```html
<div class="shortcuts">
  <h4>{{ $t("shortcuts.title") }}</h4>
  <ul>
    <li><kbd>H</kbd> — {{ $t("shortcuts.toggleMockup") }}</li>
    <li><kbd>F</kbd> — {{ $t("shortcuts.toggleToolbar") }}</li>
    <li><kbd>D</kbd> — {{ $t("shortcuts.toggleFreeze") }}</li>
    <li><kbd>0-9</kbd> — {{ $t("shortcuts.opacity") }}</li>
    <li><kbd>←↑→↓</kbd> — {{ $t("shortcuts.move") }}</li>
    <li><kbd>Shift+←↑→↓</kbd> — {{ $t("shortcuts.moveFast") }}</li>
    <li><kbd>Alt+0</kbd> — {{ $t("shortcuts.reset") }}</li>
    <li><kbd>Alt+1~4</kbd> — {{ $t("shortcuts.quickMatch") }}</li>
  </ul>
</div>
```

Add locale messages to `popup.js`:

```javascript
messages: {
  cn: {
    insert: "点击插入设计稿",
    quit: '退出',
    shortcuts: {
      title: "快捷键",
      toggleMockup: "显示/隐藏设计稿",
      toggleToolbar: "显示/隐藏工具栏",
      toggleFreeze: "冻结/解冻设计稿",
      opacity: "设置透明度",
      move: "移动设计稿 (1px)",
      moveFast: "移动设计稿 (10px)",
      reset: "重置",
      quickMatch: "快速匹配"
    }
  },
  en: {
    insert: "Click here to insert mockup",
    quit: 'Quit',
    shortcuts: {
      title: "Shortcuts",
      toggleMockup: "Show/hide mockup",
      toggleToolbar: "Show/hide toolbar",
      toggleFreeze: "Freeze/unfreeze mockup",
      opacity: "Set opacity",
      move: "Move mockup (1px)",
      moveFast: "Move mockup (10px)",
      reset: "Reset",
      quickMatch: "Quick match"
    }
  }
}
```

### 12. Opacity Shortcut UI Guidance

Add a tooltip to the opacity slider area using the existing `title` attribute pattern or a small help icon:

```html
<div class="vi_formLine vi_opacity" :title="$t('opacityHelp')">
  <Slider class="vi_slider" v-model="opacity" :step="0.01" :min="0" :max="1"></Slider>
</div>
```

Add locale keys to `en.json` and `cn.json`:

```json
// en.json
"opacityHelp": "Tip: Press a number key (1-9) to set opacity to that digit ×10%. Press two digits within 1s for exact percentage (e.g. 55 = 55%)."

// cn.json
"opacityHelp": "提示：按数字键(1-9)设置透明度为该数字×10%。1秒内按两位数字可精确设置百分比（如55=55%）。"
```

### 13. Dropdown SVG Chevron Icons

Replace the `<span class="ico">^</span>` elements with inline SVG chevrons:

```html
<!-- Reusable chevron SVG -->
<svg class="vi_chevron_icon" width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M1 1 L5 5 L9 1"/>
</svg>
```

Applied in both dropdown triggers:

```html
<span class="tit">{{ modes[blendMode] }}
  <svg class="vi_chevron_icon" ...>...</svg>
</span>

<span class="tit">{{ this.$t("quickMatch.quickMatch") }}
  <svg class="vi_chevron_icon" ...>...</svg>
</span>
```

CSS for the chevron:
```css
.vi_chevron_icon {
  vertical-align: middle;
  margin-left: 4px;
  transition: transform 0.2s;
}
```

## Data Models

No new data models are introduced. The existing `mockup` object `{ width, height, left, top }` remains the canonical shape. The `_viData` storage format is unchanged.

## Error Handling

| Scenario | Handling |
|----------|----------|
| Image load failure | Display localized error via Tip_System, log to console |
| CSP blocks blob URLs | Fall back to data URL (existing behavior, now with proper cleanup) |
| CSP test element cannot be appended | Resolve with data URL directly |
| rAF loop leak on rapid toggle | Cancel previous frame before starting new loop |
| Keyboard events during form input | Suppress shortcuts via activeElement check |

## Testing Strategy

**Unit Tests (example-based):**
- useRestore rAF ID storage and cancellation on toggle/destroy (Requirements 1.1, 1.2, 1.3)
- CSP detection timing, rejection on violation, cleanup on timeout, fallback on append failure (Requirements 2.1–2.4)
- Enter key blurs custom size inputs (Requirement 3.5)
- Dead `send` method absence (Requirement 4.1)
- Mockup receives mockup prop from App (Requirement 5.4)
- wType -1 guard skips processing (Requirement 6.1)
- Drag handle SVG presence and cursor style (Requirements 7.1–7.3)
- aria-label attributes on all four inputs (Requirements 8.1–8.4)
- Image load error triggers tip message (Requirements 9.1–9.3)
- Popup shortcut reference rendering and content (Requirements 11.1, 11.2)
- Opacity help tooltip presence and content (Requirements 12.1–12.3)
- SVG chevron icons replace `^` text (Requirements 13.1–13.4)

**Property Tests (100+ iterations):**
- Single rAF loop invariant across toggle sequences (Requirement 1.4)
- Custom size input character filtering across all key/input combinations (Requirements 3.1–3.4)
- Mockup event emission correctness for random drag/resize deltas (Requirements 5.2, 5.3)
- Parent mockup data update from random event payloads (Requirement 5.5)
- wType quick-match dimension formulas for all valid indices (Requirement 6.2)
- Keyboard shortcut suppression across form element types (Requirements 10.1–10.6)
- Locale consistency in shortcut reference (Requirement 11.3)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Single rAF Loop Invariant

*For any* sequence of `useRestore` toggles (true/false) applied to the App_Component, there SHALL be at most one active `requestAnimationFrame` loop at any point in time.

**Validates: Requirements 1.4**

### Property 2: Custom Size Input Character Filtering

*For any* keypress event on a Custom_Size_Input, the character SHALL be allowed if and only if it is a digit (0-9), a period (`.`), or — for position inputs (left, top) only — a minus sign (`-`). All other characters SHALL be prevented.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 3: Mockup Emits Correct Interaction Events

*For any* drag interaction producing deltas (dx, dy) on the Mockup_Component, the component SHALL emit a `move` event where `left` equals the previous data-x plus dx and `top` equals the previous data-y plus dy. *For any* resize interaction, the component SHALL emit a `resize` event containing the resulting width, height, left, and top values matching the interact.js event rect.

**Validates: Requirements 5.2, 5.3**

### Property 4: Parent Updates Mockup Data from Events

*For any* `move` event payload `{ left, top }` or `resize` event payload `{ width, height, left, top }` received by the App_Component from the Mockup_Component, the App_Component's `mockup` data object SHALL reflect those exact values after the event handler completes.

**Validates: Requirements 5.5**

### Property 5: wType Quick-Match Produces Correct Dimensions

*For any* wType value in the range [0, 4] and any image with natural dimensions (imgWidth, imgHeight), the resulting mockup dimensions SHALL match the formula defined for that wType index (e.g., wType 0 → width = imgWidth, height = imgHeight; wType 1 → width = imgWidth × 2, height = imgHeight × 2).

**Validates: Requirements 6.2**

### Property 6: Keyboard Shortcuts Suppressed on Form Elements

*For any* keyboard event where the active element is an `input`, `textarea`, or element with `contenteditable="true"`, the App_Component SHALL not modify `showMockup`, `showPanel`, `freeze`, or `opacity` in response to h, f, d, or number-key presses.

**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6**

### Property 7: Shortcut Reference Locale Consistency

*For any* supported locale (cn, en), the Popup_App shortcut reference section SHALL render all shortcut descriptions using text from that locale's message dictionary, with no mixed-language content.

**Validates: Requirements 11.3**
