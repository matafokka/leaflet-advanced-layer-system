# Miscellaneous events fired by ALS

ALS fires following events on the `window.document` object:

| Event                                | Fired when                         |
| ------------------------------------ | ---------------------------------- |
| `als-set-menu-to-left`               | Menu changes position to the left  |
| `als-set-menu-to-right`              | Menu changes position to the right |
| **Electron integraion enabled and**  |                                    |
| `als-electron-hide-window`           | Window is minimized                |
| `als-electron-expand-window`         | Window is maximized or unmaximized |
| `als-electron-close-window`          | Window is closed                   |