## Visual Inspector
> This is a chrome plugin to help front-end engineers and designers to quickly locate differences between design mockups and web pages. as well as front-end engineers UI self-examination.

> You can modify the design manuscript size, `position`, `transparency`, `mix mode`, etc. at will, to facilitate UI comparison of various design styles.

> If you are doing page refactoring, the real-time function can be easily restored to the state before the page is refreshed after the page is refreshed (such as the size, position, transparency, etc. of the design draft).

> At the same time, if you do not need to move the stretch design, it is recommended to open the freeze function, so that the design will no longer respond to mouse events, can not stretch and drag, and will not affect the interactive function of the page itself.

> Preset shortcuts for frequently used commands for easier operation and comparison


### key concepts:

- Freeze: (Not enabled by default)
    
     When this is enabled, the mockup will not respond to mouse events, that is, you cannot move or resize the mockup.
    
- Realtime: (default is not enabled)

    The state(size, position, opacity, blend mode) is saved in real time, and will be restored when you refresh your page.

- Layer blend mode: (default normal mode)
    
    Similar to photoshop blend mode, which is convenient for quick comparison of different styles of design drafts.

- Quick adaptation:

	Quickly manipulate the size and location. Currently 6 ways are predefined

	- Reset, which is also the default way to show the mockup. When the mockup is inserted into the page, if the original size of the mockup exceeds the width of the page, the image is scaled. If the original size of the mockup is smaller than the page width, the original size is displayed.
	- Original image size. The mockup is displayed in its original size at the current location.
	- Original size /2. The mockup is reduced to half of the original mockup at the current position.
	- Original size *2. The mockup is stretched to double of the original mockup at the current position.
	- Window Width. The width of the mockup is the width of the window
	- centered in window. Centers the mockup at the current window position.

###  shortcut keys:

- h: show or hide mockup
- f: show or hide the bottom toolbar
- d: freeze or unfreeze mockup
- m: enable or disable measurement
- Number keys (0-9): Quickly set the mockup transparency. For example, if you press 5 twice in 1 second, the transparency of the mockup will be set at 55%. If only the number key is pressed once in 1 second, such as 5, it will automatically fill 0 after one second, that is, set the mockup transparency to 50%.
- Arrow keys: Move the mockup and move 1px at a time. If you press the Shift key at the same time, you will move 10px at a time.
- Quick adaptation:
	- alt + 0: Reset
	- alt + 1: Original image size
	- alt + 2: Original size *2
	- alt + 3: Original size /2
	- alt + 4: Window Width

### Tips:
- In measurement mode, double-click the page to pause the guide line to follow the mouse, and then double-click to resume the follow.
- If the shortcut does not work, please check if the current page's focus is inside other form controls (such as input, textarea...)? The easiest way, click on the mockup, or on the blank area in the page and to try again :)