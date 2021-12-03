# Using ALS with Electron

This tutorial will help you to set up ALS with Electron.

All the code should be in your Electron entry point.

# Make window title show project name

Before creating a window, execute following line: `app.commandLine.appendSwitch("enable-experimental-web-platform-features");`.

# Make app run and quit properly

Use {@link ElectronIntegration}:

```
const { app, BrowserWindow } = require("electron"); // Import Electron stuff
const remote = require("@electron/remote/main"); // Required since Electron 12
remote.initialize(); // Required since Electron 12
const integrate = require("leaflet-advenced-layer-system/ElectronIntegration"); // Import integration function
function createWindow () {
    // Create window
    const mainWindow = new BrowserWindow({
        frame: false, // Required to use ElectronIntegrationOptions.useToolbarAsFrame = true
        webPreferences: {
            enableRemoteModule: true, // Required to use ElectronIntegrationOptions.useToolbarAsFrame = true
            nodeIntegration: true,
            contextIsolation: false, // Required since Electron 12
         }
    });
    remote.enable(mainWindow.webContents); // Required since Electron 12
    // Integrate ALS with Electron
    integrate(mainWindow, {
        // Options...
    });
    // Do your other stuff...
}
```

# Example entry point

Let's put all of that together:

```
const { app, BrowserWindow } = require("electron");
const remote = require("@electron/remote/main");
remote.initialize();
const integrate = require("leaflet-advanced-layer-system/ElectronIntegration");

function createWindow () {
    const mainWindow = new BrowserWindow({
        frame: false,
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
            contextIsolation: false,
         }
        // Your other window options...
    });
    integrate(mainWindow, {/* Integration options... */});
    // Do your other stuff...
}

app.commandLine.appendSwitch("enable-experimental-web-platform-features");

// Boilerplate code provided when you set up Electron App:

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow();

	app.on("activate", function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
	if (process.platform !== "darwin") app.quit();
});
```