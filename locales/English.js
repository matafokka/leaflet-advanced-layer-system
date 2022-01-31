/**
 * English locale
 * @type {Object}
 */
L.ALS.Locales["English"] = {
	language: "en",
	region: "us",

	// Menu buttons tooltips

	menuButton: "Menu",
	menuCloseButton: "Close menu",
	menuNewProjectButton: "New project",
	menuSaveButton: "Save project",
	menuSaveAsButton: "Save project as...",
	menuLoadButton: "Load project",
	menuExportButton: "Export project",
	menuUndoButton: "Undo",
	menuRedoButton: "Redo",
	menuSettingsButton: "Settings",
	menuMapButton: "Map service",
	menuZoomInButton: "Zoom in",
	menuZoomOutButton: "Zoom out",
	menuAddButton: "Add new layer",

	// Sidebar window

	sidebarWindowCancelButton: "Cancel",

	// Wizard

	wizardSelectTitle: "New layer type",
	wizardContentTitle: "New layer options",
	wizardAddButton: "Add",
	wizardEmptyLabel: "This layer has no starting parameters",

	// Settings

	settingsGeneralSettings: "General Settings",
	settingsSelectTitle: "Settings sections",
	settingsContentTitle: "Settings for selected section",
	settingsApplyButton: "Apply and Close",
	settingsExportButton: "Export Settings",
	settingsImportButton: "Import Settings",
	settingsRevertButton: "Revert back to default value",
	settingsLoadingNotSupported: "Sorry, your browser doesn't support file loading. Please, update it.",
	settingsImportError: "File that you try to load is not a valid settings file",
	settingsSavingNotSupported: "Settings can't be saved upon page refresh because your browser doesn't support it. Please, install any modern browser, so it won't happen.",
	settingsAboutItem: "About",

	// General settings

	generalSettingsLanguage: "Language:",
	generalSettingsTheme: "Theme:",
	generalSettingsLightTheme: "Light",
	generalSettingsDarkTheme: "Dark",
	generalSettingsSystemTheme: "System",
	generalSettingsMenuPosition: "Menu position:",
	generalSettingsMenuLeft: "Left",
	generalSettingsMenuRight: "Right",
	generalSettingsNotify: "Notify when all long-running operations are complete (unchecking it removes annoying window that says: \"All operations complete\")",

	// System

	systemNewFileTabTitle: "New Project",
	systemProjectAlreadyOpen: "You already have an opened project. If you'll open another project, your changes won't be saved. Are you sure you wan't to load another one?",
	systemProjectLoadingNotSupported: "Sorry, your browser doesn't support project loading. However, you still can create a new project, save it and open it later in a newer browser.",
	systemConfirmDeletion: "Are you sure you want to delete this layer?",
	systemNotProject: "File that you're trying to load is not a valid project.",
	systemProjectSaved: "Project saved",
	systemBeforeNewProject: "Your project might have unsaved changes. Are you sure you want to create a new project?",
	systemBeforeExit: "Your project might have unsaved changes. Do you wan't to stay and save it?",
	systemBeforeExitStay: "Stay",
	systemBeforeExitExit: "Exit Without Saving",

	// Warnings displayed when file download is not supported

	// For IE9
	systemDownloadNotSupportedIE: "Please, download all the files",
	systemDownloadNotSupportedExtensionIE: "and manually set their extensions to",

	// For other browsers
	systemDownloadNotSupported: "Please, manually save text from all tabs that will open",
	systemDownloadNotSupportedNoExtension: "after you'll close this window",
	systemDownloadNotSupportedExtension1: "to", // ".extension"
	systemDownloadNotSupportedExtension2: "files",

	// If needed to change extension manually
	systemDownloadNotSupportedChangeExtensionManually: "Please, manually change extension of the downloaded file to",

	// Common line
	systemDownloadNotSupportedCommon: "Sorry for the inconvenience. Please, update your browser, so this won't happen.\n\nYour download will start after you'll close this window.",

	// Window that will be displayed in IE when user will try to load project.
	systemIEAdjustSettings1: "Sorry, to open projects, you'll need to either switch to a normal browser or adjust your settings. To adjust your settings:",
	systemIEAdjustSettings2: "At the top right corner of your browser's window you can find a gear icon. Click on that and select \"Internet options\".",
	systemIEAdjustSettings3: "In opened window, go to \"Security\" tab.",
	systemIEAdjustSettings4: "Click \"Custom level...\" button.",
	systemIEAdjustSettings5: "In opened window, change these two options:",
	systemIEAdjustSettings6: "Find \"Initialize and script ActiveX controls not marked as safe for scripting\" and set it to \"Prompt\".",
	systemIEAdjustSettings7: "Find \"Include local directory path when uploading files to a server\" and set it to \"Enable\".",
	systemIEAdjustSettings8: "Click \"Ok\" in both windows and reload this page.",
	systemIEAdjustSettingsOkButton: "Ok",

	// Notification when all long-running operations are complete
	systemOperationsComplete: "All operations complete",

	// Layer

	layerWizardName: "Layer",
	layerDefaultName: "Generic Layer",

	// File widget

	fileNoFilesSelected: "No files selected. Click here to select some files.",
	fileSelectedFile: "Selected files:",

};