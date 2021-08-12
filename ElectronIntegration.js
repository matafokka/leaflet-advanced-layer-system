const {app, ipcMain, dialog} = require("electron");

/**
 * Integrates ALS with Electron by making app properly show dialog before quitting. Maybe, more integrations will come later.
 *
 * Usage:
 *
 * ```
 * // Your Electron entry point
 * const { app, BrowserWindow } = require("electron"); // Import Electron stuff
 * const integrate = require("leaflet-advenced-layer-system/ElectronIntegration"); // Import integration function
 *
 * function createWindow () {
 *      const mainWindow = new BrowserWindow({
 *          // Window options...
 *      }); // Create window instance
 *      integrate(mainWindow); // Integrate ALS with Electron
 *      // Do your other stuff...
 * }
 *
 * ```
 *
 * @param mainWindow {Electron.BrowserWindow} Electron main window
 * @namespace ElectronIntegration
 */
module.exports = function (mainWindow) {
	// Import renderer process
	mainWindow.webContents.executeJavaScript(`const {ipcRenderer} = require("electron");`);

	// Show messagebox on exit
	ipcMain.on("close", (e, locale) => {
		dialog.showMessageBox(mainWindow, {
			type: "warning",
			buttons: [
				locale.systemBeforeExitStay,
				locale.systemBeforeExitExit,
			],
			title: "",
			detail: locale.systemBeforeExit
		}).then((value) => {
			if (value.response === 0)
				return;
			mainWindow.destroy();
		});
	});

	// Add event listener that will send L.ALS.locale to the main process
	mainWindow.on("close", (e) => {
		e.preventDefault();
		mainWindow.webContents.executeJavaScript(`ipcRenderer.send("close", L.ALS.locale);`);
	});
}