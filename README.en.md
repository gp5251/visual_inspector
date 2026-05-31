## Visual Inspector (v2.1)

> A Chrome extension that helps front-end engineers and designers quickly locate differences between design mockups and web pages. Reduces communication costs by enabling visual QA during the development phase.

> Freely adjust the mockup's `size`, `position`, `opacity`, and `blend mode` to compare against various design styles.

> The [Auto Restore] feature preserves the mockup state (size, position, opacity, etc.) across page refreshes — ideal for iterative page reconstruction.

> When you no longer need to move or resize the mockup, enable Freeze mode. The mockup will stop responding to mouse events, leaving the page's own interactions unaffected.

> Keyboard shortcuts are provided for all common operations.

### Features

- Overlay design mockups on any web page with drag and resize
- 16 CSS blend modes for flexible visual comparison
- Auto Restore: persist mockup state across page refreshes
- Freeze mode: lock the mockup so it doesn't interfere with page interactions
- Draggable toolbar that won't block page content
- Quick match: instantly fit to natural size, window width, and more
- Bilingual support (Chinese / English)
- Shortcuts are automatically suppressed when form elements are focused

### Keyboard Shortcuts

- `H` — Show/hide mockup
- `F` — Show/hide toolbar
- `D` — Freeze/unfreeze mockup
- `0-9` — Set opacity. Press two digits within 1 second for an exact percentage (e.g. 55 = 55%). A single digit auto-fills with 0 after 1 second (e.g. 5 = 50%).
- `Arrow keys` — Move mockup by 1px
- `Shift + Arrow keys` — Move mockup by 10px
- Quick match:
    - `Alt + 0` — Reset
    - `Alt + 1` — Natural size
    - `Alt + 2` — Natural size × 2
    - `Alt + 3` — Natural size ÷ 2
    - `Alt + 4` — Window width

### Tips

- Shortcuts are automatically disabled when focus is inside input, textarea, or contenteditable elements.
- A notification appears in the top-right corner if an image fails to load.
- Hover over the opacity slider to see a tooltip explaining the number-key shortcut.
