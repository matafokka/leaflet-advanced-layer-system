const {ipcMain, dialog} = require("electron");
const mergeOptions = require("./_service/mergeOptions.js");

/**
 * Integration options
 * @typedef ElectronIntegrationOptions
 * @property {boolean} [useToolbarAsFrame=true] If true, ALS toolbar will be used as a window frame. Takes effect only when {@link SystemOptions.enableToolbar} is `true`. Set `BrowserWindow`'s `frame` option to `false` and webPreferences.enableRemoteModule to `true` before using this option!
 */

/**
 * Integrates ALS with Electron by making app properly show dialog before quitting. Additional integrations can be set up by providing options.
 *
 * Usage:
 *
 * ```
 * // Your Electron entry point
 * const { app, BrowserWindow } = require("electron"); // Import Electron stuff
 * const remote = require("@electron/remote/main"); // Required since Electron 12
 * remote.initialize(); // Required since Electron 12
 *
 * const integrate = require("leaflet-advenced-layer-system/ElectronIntegration"); // Import integration function
 *
 * function createWindow () {
 *      // Create window
 *      const mainWindow = new BrowserWindow({
 *          frame: false, // Required to use ElectronIntegrationOptions.useToolbarAsFrame = true
 *          webPreferences: {
 *               enableRemoteModule: true, // Required to use ElectronIntegrationOptions.useToolbarAsFrame = true
 *               nodeIntegration: true,
 *               contextIsolation: false, // Required since Electron 12
 *           }
 *      });
 *
 *      remote.enable(mainWindow.webContents); // Required since Electron 12
 *
 *      // Integrate ALS with Electron
 *      integrate(mainWindow, {
 *          // Options...
 *      });
 *      // Do your other stuff...
 * }
 * ```
 *
 * @param mainWindow {Electron.BrowserWindow} Electron main window
 * @param options {ElectronIntegrationOptions} Integration options
 * @namespace ElectronIntegration
 */
module.exports = function (mainWindow, options = {}) {

	/** @type {ElectronIntegrationOptions} */
	let defaultOptions = {
		useToolbarAsFrame: true
	}

	/** @type {ElectronIntegrationOptions} */
	let newOptions = mergeOptions(defaultOptions, options);

	// Import renderer process

	let importRemote = () => {
		mainWindow.webContents.executeJavaScript(`
		let electron;
		try {electron = require("@electron/remote");}
		catch (e) {
			console.log(e)
			try {electron = require("electron");}
			catch (e) {console.error("You need to install '@electron/remote' package or downgrade to Electron 11 to use ALS Electron integration!");}
		}
		const {ipcRenderer} = require("electron"), remote = electron.remote || electron;
	`);
	}

	importRemote();

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

	let addButtons = () => {
		if (!newOptions.useToolbarAsFrame)
			return;

		mainWindow.webContents.executeJavaScript(`
			(() => {
			
			// Just a nice touch
			if (!remote)
				throw new Error(\`Add following to your Electron window options: "webPreferences: { enableRemoteModule: true }"\`);
		
			document.body.classList.add("als-electron-toolbar-as-frame");
			let sheet = document.styleSheets[0];
			sheet.insertRule(".als-top-panel-spacer {-webkit-app-region: drag;}", 0);
			
			// Catch window buttons events added by L.ALS.System
			
			document.addEventListener("als-electron-hide-window", () => { remote.getCurrentWindow().minimize(); });
			
			document.addEventListener("als-electron-expand-window", () => {
				let currentWindow = remote.getCurrentWindow();
				if (currentWindow.isMaximized())
					currentWindow.unmaximize();
				else
					currentWindow.maximize();
			});
			
			document.addEventListener("als-electron-close-window", () => { remote.getCurrentWindow().close(); });
			
			})();
		`);
		mainWindow.setMinimumSize(520, 120); // Restrict width, so app will look nice
	}

	let calledFirstTime = true;

	mainWindow.webContents.on("did-finish-load", () => {
		if (!calledFirstTime)
			importRemote();
		addButtons();
		calledFirstTime = false;
	});

	addButtons();
}