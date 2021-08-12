// Polyfills. These polyfills has been moved from polyfills.js because CoreJS and Babel polyfills throws an error in old Chrome and prevents other polyfills from running
require("./node_modules/classlist/classList.min.js");
require("keyboardevent-key-polyfill").polyfill();

/**
 * Leaflet namespace
 * @external L
 * @see https://leafletjs.com/reference-1.7.1.html
 */

/**
 * JSZip instance
 * @external JSZip
 * @see https://stuk.github.io/jszip/
 */

/**
 * Root object containing all Layer System stuff.
 *
 * Layer System contains these important "subsystems":
 * 1. System itself. See {@link L.ALS.System} docs for examples of general usage.
 * 1. Layers. See {@link L.ALS.System} example on how to create a basic layer:
 *      1. Layers themselves. Those are not Leaflet layers but wrappers around theme. System works with these layers, not with Leaflet layers. See {@link L.ALS.Layer} docs for examples on how to create custom layers.
 *      1. Wizards - widgetables (see below) that provides initial layer parameters. See {@link L.ALS.Wizard} for examples of general usage.
 *      1. Settings - widgetables that provides settings for your layers. See {@link L.ALS.Settings} for examples of general usage.
 * 1. Widget system:
 *      1. Widgetables - containers for widgets. See {@link L.ALS.Widgetable} docs for examples of general usage.
 *      1. Widgets. See {@link L.ALS.Widgets} for examples of general usage. See {@Link L.ALS.Widgets.BaseWidget} for examples on how to create custom widgets.
 * 1. Serialization and deserialization - used to save and load projects. See {@link L.ALS.Serializable} docs for examples on how to use it and create custom mechanisms.
 * 1. Locales - allows you to localize your whole application. See {@link L.ALS.Locales} docs for examples on how to use it.
 * 1. Useful helpers. See {@link L.ALS.Helpers}.
 * 1. Zoom control which matches ALS aesthetics. See {@link L.ALS.ControlZoom}.
 * 1. Patches:
 *      1. `L.Layer#setInteractive`, `L.Layer#getInteractive`, `L.Layer#isInteractive` - patch made by [Piero "Jadaw1n" Steinger](https://github.com/Jadaw1n) which adds ability to set and check interactive state of Leaflet layers.
 *      1. Serialization patches: `RegExp#serialize`, `RegExp.deserialize`, `L.LatLng#serialize`, `L.LatLng.deserialize`
 *
 * **Note:** ALS uses Leaflet class system. Please, read about it at [Leaflet docs](https://leafletjs.com/reference-1.7.1.html#class).
 *
 * @namespace
 */
L.ALS = {

	/**
	 * Current locale which contains both default and custom locale properties.
	 *
	 * Use it only "one-time", for example, in `window.alert()`.
	 *
	 * Do NOT use it in HTML elements, use {@link L.ALS.Locales} for that.
	 */
	locale: undefined,

	/**
	 * Contains classes only for system's internal use. Docs and architecture here sucks. I warned you.
	 * @namespace
	 * @ignore
	 */
	_service: {},
};

const Sortable = require("sortablejs");
const JSZip = require("jszip");
const saveAs = require("file-saver");
require("./ControlZoom.js");
require("./locales/Locales.js");
require("./InteractiveLayerPatch.js");
require("./Helpers.js");
require("./Serializable.js");
require("./Widgetable.js");
require("./widgets/Widgets.js");
require("./Wizard.js");
require("./Settings.js");
require("./Layer.js");
require("./_service/GeneralSettings.js");
require("./WidgetableWindow.js");
require("./_service/SidebarWindow.js");
require("./_service/WizardWindow.js");
require("./_service/SettingsWindow.js");
require("./_service/IEErrorWindow.js");
require("./OperationsWindow.js");
require("./LeafletLayers/LeafletLayers.js");

/**
 * A loading window for your long-running operations
 * @type {L.ALS.OperationsWindow}
 */
L.ALS.operationsWindow = new L.ALS.OperationsWindow();
document.body.appendChild(L.ALS.operationsWindow.windowContainer);

/**
 * @callback onJsonSave
 * @param JSON {string} JSON to save.
 * @param filename {string} Default filename. @see {SystemOptions}
 */

/**
 * @callback onJsonLoad
 * @param fileInput {HTMLInputElement} File input containing JSON. You must only read this file as text, you shouldn't parse it, handle parsing errors or anything, system will do this for you.
 * @return {string} Content of the file
 */

/**
 * @callback onProjectExport
 * @param zip {JSZip} A JSZip instance to save
 */

/**
 * Options for the Layer System
 * @typedef {Object} SystemOptions
 * @property {string} [aboutHTML=undefined] HTML that will be displayed in "About" section in settings. Defaults to undefined.
 * @property {string} [defaultLocale="English"] Locale to use by default. Defaults to "English".
 * @property {string} [filePrefix=""] Prefix that will be added to the saved files, i.e. if equals to "MyApp", saved project file will be called "MyAppProject.json" instead of "Project.json". Defaults to empty string.
 * @property {"project-and-title"|"project"|"title"} [tabTitle="project-and-title"] For Chrome with FileSystem API support only. Defines what to put in tab title, uses existing `<title>` tag. Possible values: `project-and-title` - will prepend project name to the existing title, so it'll look like "ProjectFileNameWithoutExtension - Existing Title"; `"project-name"` - will replace existing title with project name; `"title"` - will not change title. **Note:** to enable this feature in Electron, add `app.commandLine.appendSwitch("enable-experimental-web-platform-features");` to your main script. Defaults to "project-and-title".
 * @property {boolean} [enableNotificationOnExit=true] If true, on exit, will show a notification that says: "Your project might have unsaved changes. Do you wan't to stay and save it?". It uses a well known hack that prevents tab on closing. However, this hack might interfere with frameworks such as Electron or NW.js. If you're experiencing issues with it, set it to `false`. For Electron, use {@link ElectronIntegration.integrate} in your Electron entry point. For other frameworks, show a dialog box and pass `L.ALS.locale.systemBeforeExit` property to it. Doesn't take effect in Electron. Defaults to `true`.
 * @property {boolean} [enableKeyboardShortcuts=true] If true, enables `Ctrl+S` (works only in browsers that supports Blob) and `Ctrl+O` shortcuts for project saving and loading respectively.
 * @property {boolean} [enableSettings=true] If true, user will be able to set up your application using built-in settings system. Otherwise, settings button will be removed. Setting this option to `false` is not recommended because you'll need to implement theme and locale switching yourself. System doesn't provide any API for that, so disabling this option is not recommended. Defaults to true.
 * @property {boolean} [enableProjects=true] If true, user will be able to save and load projects using built-in serialization system. Otherwise, save and load buttons will be removed. Defaults to true.
 * @property {boolean} [enableExport=true] If true, user will be able to export project to JSON. Otherwise, export button will be removed. Defaults to true.
 * @property {boolean} [enableBaseLayerSwitching=true] If true, user will be able to switch Leaflet base layers (i.e. map providers). Otherwise, maps select menu will be removed. Defaults to true.
 * @property {"topleft"|"topright"|"bottomleft"|"bottomright"} [position="topright"] Position of the menu button. If set to topleft or bottom left, menu itself will be on the left side. Defaults to "topright".
 * @property {Function} [useOnlyThisLayer=undefined] If you need to display only one layer and disable ability to add other layers, pass your layer's class (class, not an instance, i.e. `L.ALS.Layer`, not `new L.ALS.Layer()`) here. So you'll end up with pretty much static menu. Defaults to undefined.
 * @property {onJsonSave} [onJsonSave=undefined] A function to call when project is being saved. Replaces default saving routine. Will be used ONLY if user's browser doesn't support Blob. Here you must provide a routine to save a string to a file. Use it ONLY if you have a backend to upload files to and simulate a download! ALS already provides all the needed hacks, fixes bugs in saveAs and much more. If you don't trust this text, check the source code. Don't waste your time on making your own hacks. Value defaults to undefined.
 * @property {onJsonLoad} [onJsonLoad=undefined] A function to call when user wants to load a project. Replaces default file loading routine. Will be used ONLY if user's browser doesn't support FileReader. Here you must provide a routine to read file from an input as text and return it. Use it ONLY if you have a backend to upload files to and simulate a download! ALS already provides all the needed hacks, fixes bugs in saveAs and much more. If you don't trust this text, check the source code. Don't waste your time on making your own hacks. Value defaults to undefined.
 * @property {onProjectExport} [onProjectExport=undefined] A function to call when user exports project. Replaces default file saving routine. It will be called ONLY if user's browser doesn't support Blob. Here you must provide a routine to save a JSZip instance. Use it ONLY if you have a backend to upload files to and simulate a download! ALS already provides all the needed hacks , fixes bugs in saveAs and much more. If you don't trust this text, check the source code. Don't waste your time on making your own hacks. Value defaults to undefined.
 */

/**
 * Advanced extensible layer system for Leaflet. Manages things like layer creation, ordering, deletion and much more for you.
 *
 * Just add it, implement your layer types by extending {@link L.ALS.Layer}, register them, and you're good to go.
 *
 * @example Create a basic project with custom layer, wizard and settings.
 *
 * // Project's structure:
 * // ./path/to/System.js - Directory with the system
 * // ./main.js - Entry point. Initialize system, add layers, etc here
 * // ./MyLayerWizard.js - Contains layer's wizard
 * // ./MyLayerSettings.js - Contains layer's settings
 * // ./MyLayer.js - Contains layer itself
 *
 * // File "MyLayerWizard.js"
 *
 * // Wizard's values will be passed to the layer's constructor.
 *
 * L.ALS.MyLayerWizard = L.ALS.Wizard.extend({
 *
 *     initialize: function () {
 *          L.ALS.Wizard.prototype.initialize.call(this); // Call parent constructor
 *
 *         // Add some widgets to the wizard
 *         this.addWidget(new L.ALS.Color("myColorId", "Select a color"));
 *
 *         // Let's assign a callback to this one
 *         this.addWidget(new L.ALS.Number("myNumberId", "Enter a number", this, "numberInputCallback"));
 *     }
 *
 *     // Implement a callback
 *
 *     numberInputCallback: function (widget) {
 *         window.alert("Your number is: " + widget.getValue());
 *     }
 *
 * });
 *
 * // File "MyLayerSettings.js"
 *
 * // Settings also will be passed to the layer's constructor. When settings are changed, L.ALS.Layer.applyNewSettings() method will be called.
 *
 * L.ALS.MyLayerSettings = L.ALS.Settings.extend({
 *
 *     initialize: function () {
 *         L.ALS.Settings.prototype.initialize.call(this); // Call parent constructor
 *
 *         // Let's add a checkbox to our settings and make it checked by default
 *         this.addWidget(new L.ALS.Checkbox("myCheckboxId", "Checkbox"), true);
 *         this.addWidget(checkbox);
 *     }
 *
 * });
 *
 * // File "MyLayer.js"
 *
 * // Require wizard and settings
 * require("./MyLayerWizard.js");
 * require("./MyLayerSettings.js");
 *
 * L.ALS.MyLayer = L.ALS.Layer.extend({
 *
 *     // Note: we're overriding init() instead of initialize(). Do NOT override initialize()!
 *     init: function(wizardResults, settings) {
 *         // this.copySettingsToThis(settings); // If you need to copy settings to layer's properties, use copySettingsToThis()
 *
 *         // Build a menu for the layer. Let's create labels with wizard results and manage their appearance by the checkbox in the settings.
 *         // Let's also add a color widget for demonstration purposes
 *         // See L.ALS.Widgets.BaseWidget docs for explanation on what's going on
 *
 *         this._colorLabel = new L.ALS.SimpleLabel("colorLabel", "Color value from the wizard");
 *         this._numberLabel = new L.ALS.SimpleLabel("numberLabel", "Number value from the wizard");
 *         this.addWidgets(this._colorLabel, this._numberLabel,
 *              new L.ALS.Color("colorWidget", "Polygon color", this, "_applyPolygonColor").setValue("red")
 *         );
 *         this.applyNewSettings(settings); // Apply the settings
 *
 *         // Let's also add polygon to the layer. Its fill color will be controlled by the color widget
 *         this._polygon = L.polygon([[20, 20], [30, 30], [15, 15]]);
 *         this._polyon.setStyle({
 *             fillColor: "red",
 *             fill: true
 *         });
 *     },
 *
 *     // Override method for applying new settings
 *
 *     applyNewSettings: function (settings) {
 *         // Define labels' style based on checkbox
 *         let style = (settings.MyCheckboxId) ? "success" : "error";
 *
 *         // Set this style to the labels
 *         this._colorLabel.setStyle(style);
 *         this._numberLabel.setStyle(style);
 *     },
 *
 *     // This callback accepts associated widget as an argument.
 *     // Let's apply new polygon color here
 *     _applyPolygonColor: function (widget) {
 *         this._polygon.setStyle({ fillColor: widget.getValue() });
 *     },
 *
 *     statics: {
 *         // Assign wizard and settings to the layer
 *         wizard: new L.ALS.MyLayerWizard(),
 *         settings: new L.ALS.MyLayerSettings(),
 *     },
 *
 * })
 *
 * // File "main.js"
 *
 * require("leaflet-advanced-layer-system"); // Require this plugin or add it to your html page via "script" tag
 * require("./MyLayer.js"); // Require layer
 *
 * L.ALS.System.initializeSystem(); // Initialize system. This method MUST be called after all Leaflet and ALS imports.
 *
 * let map = L.map("map", { // Create a map
 *     preferCanvas: true, // Use it to improve performance
 *     keyboard: false // Setting this option to false is a MANDATORY! If you don't do that, you'll encounter problems when using L.ALS.LeafletLayers.WidgetLayer!
 * });
 *
 * let layerSystem = new L.ALS.System(map); // Create an instance of this class
 * let baseLayer = ...; // Create some base layers
 * layerSystem.addBaseLayer(baseLayer, "My Base Layer"); // Add your base layers to the system
 * layerSystem.addLayerType(L.MyLayerType); // Add your layer types
 *
 * @param map {L.Map} Leaflet map object to manage
 * @param options {SystemOptions} Options
 *
 * @class
 * @extends L.Control
 */
L.ALS.System = L.Control.extend( /** @lends L.ALS.System.prototype */ {

	/** @private */
	skipSerialization: true,

	/** @private */
	skipDeserialization: true,

	/**
	 * Indicates whether system should only one single layer or not
	 * @package
	 * @ignore
	 */
	_useOnlyOneLayer: false,

	/**
	 * @see SystemOptions.tabTitle
	 * @type {"project-and-title"|"project"|"title"}
	 * @private
	 */
	_tabTitle: "",

	initialize: function (map, options) {
		L.Control.prototype.initialize.call(this);

		/** @type {SystemOptions} */
		let defaultOptions = {
			aboutHTML: undefined,
			defaultLocale: "English",
			enableSettings: true,
			enableProjects: true,
			enableExport: true,
			enableBaseLayerSwitching: true,
			position: "topright",
			useOnlyThisLayer: undefined,
			filePrefix: "",
			tabTitle: "project-and-title",
			enableKeyboardShortcuts: true,
			enableNotificationOnExit: true,
		}

		let callbacks = ["onJsonSave", "onJsonLoad", "onProjectExport"];
		for (let callback of callbacks)
			defaultOptions[callback] = undefined;

		/** @type {SystemOptions} */
		let newOptions = L.ALS.Helpers.mergeOptions(defaultOptions, options);

		for (let callback of callbacks)
			L.ALS._service[callback] = newOptions[callback];

		L.ALS._service.filePrefix = newOptions.filePrefix;

		this._tabTitle = (L.ALS.Helpers._chromeFSSupported) ? newOptions.tabTitle : "title";
		if (!L.ALS._service.tabTitle) // In case multiple ALS instances used
			L.ALS._service.tabTitle = document.title;
		this._setTabTitle(L.ALS.locale.systemNewFileTabTitle);

		/**
		 * Contains base layers. Layers will be added in format: "Name": layer object. addBaseLayer() will update this object.
		 * @private
		 */
		this._baseLayers = {};

		/**
		 * Contains layers' types, containers and settings
		 * @type{{
		 *     layerType: L.ALS.Layer.prototype,
		 *     container: Element
		 *     settings: L.ALS.Layer.prototype.settings
		 * }}
		 * @private
		 */
		this._layerTypes = {};

		/**
		 * Contains all added layers. Needed to track z-Index changes.
		 * @type {Object<string, L.ALS.Layer>}
		 * @package
		 * @ignore
		 */
		this._layers = {};

		/**
		 * Currently selected layer
		 * @type {L.ALS.Layer}
		 * @private
		 */
		this._selectedLayer = undefined;

		/**
		 * A map passed to the constructor
		 * @type {L.Map}
		 */
		this.map = map;

		let mapContainer = this.map.getContainer().parentElement;
		L.ALS.Helpers.HTMLToElement(require("./_service/markup.js"), mapContainer);

		// Wizard-related stuff
		let addButton = mapContainer.getElementsByClassName("als-menu-add")[0];
		this._wizardWindow = new L.ALS._service.WizardWindow(addButton);
		let wizardWindow = this._wizardWindow.window;

		this._wizardMenu = wizardWindow.getElementsByClassName("als-wizard-menu")[0];

		/**
		 * Container for the layers
		 * @type {Element}
		 * @package
		 * @ignore
		 */
		this._layerContainer = mapContainer.getElementsByClassName("als-menu-items")[0];

		// Add event listeners to "Add" button
		wizardWindow.getElementsByClassName("als-wizard-add-button")[0].addEventListener("click", () => {
			this._createLayer();
		});

		// Menu-related stuff
		this._menu = mapContainer.getElementsByClassName("als-menu")[0];
		L.ALS.Helpers.makeHideable(mapContainer.getElementsByClassName("als-menu-close")[0], this._menu);

		this._baseLayerMenu = mapContainer.getElementsByClassName("als-menu-maps-select")[0];
		this._baseLayerMenu.addEventListener("change", (event) => {
			this._onBaseLayerChange(event);
		});

		this._saveButton = mapContainer.getElementsByClassName("als-save-button")[0];
		this._saveButton.setAttribute("data-mobile-class", "ri ri-save-3-line");
		this._saveButton.addEventListener("click", () => {
			this._saveProject();
		});

		/**
		 * Points to input, not to a button in the menu
		 * @type {HTMLInputElement}
		 * @private
		 */
		this._loadButton = document.getElementById("als-load-input");
		this._loadButton.addEventListener("change", () => {
			this._loadProject();
		});

		this._exportButton = mapContainer.getElementsByClassName("als-export-button")[0];
		this._exportButton.addEventListener("click", () => {
			this._exportProject();
		});

		this._settingsButton = mapContainer.getElementsByClassName("als-settings-button")[0];
		this._settingsWindow = new L.ALS._service.SettingsWindow(this._settingsButton, () => {
			this._applyNewSettings();
		}, newOptions.aboutHTML);
		this._settingsWindow.addItem("settingsGeneralSettings", new L.ALS._service.GeneralSettings(newOptions.defaultLocale));

		// IE and old browsers (which are unsupported by ALS) either doesn't implement LocalStorage or doesn't support it when app runs locally
		if (!window.localStorage) {
			this._settingsButton.addEventListener("click", () => {
				window.alert(L.ALS.locale.settingsSavingNotSupported);
			});
		}

		let deleteButton = mapContainer.getElementsByClassName("als-menu-delete")[0];
		deleteButton.addEventListener("click", () => {
			this._deleteLayer();
		});

		// Make layers sortable. We have to reorder layers when their widgets has been reordered and when map state changes. See _reorderLayers() implementation.
		// noinspection JSUnusedGlobalSymbols
		new Sortable(this._layerContainer, {
			handle: ".als-layer-handle",
			animation: 250,
			onEnd: () => {
				this._reorderLayers();
			}
		});

		this.setPosition(newOptions.position);

		// Add new window asking to change settings when user tries to load project if browser is IE
		if (L.ALS.Helpers.isIElte9 && newOptions.enableProjects) {

			/**
			 * Error window to display when user tries to load prokect in IE <= 9 and error occurs
			 * @memberOf L.ALS.Helpers
			 * @type {L.ALS._service.IEErrorWindow}
			 */
			L.ALS.Helpers._ieProjectErrorWindow = new L.ALS._service.IEErrorWindow();
			document.body.appendChild(L.ALS.Helpers._ieProjectErrorWindow.windowContainer);
		}

		// Keyboard shortcuts
		document.addEventListener("keydown", (e) => {
			if (!newOptions.enableKeyboardShortcuts || !e.ctrlKey)
				return;

			let preventDefault = true;

			let symbol = (e.code) ? e.code[2] : "";
			let code = e.keyCode || e.which;

			if ((symbol === "S" || code === 83) && L.ALS.Helpers.supportsBlob) // Without blob, it's a headache to save files
				this._saveProject();
			else if (symbol === "O" || code === 79)
				this._loadProject();
			else
				preventDefault = false;
			if (preventDefault)
				e.preventDefault();
		});

		// Add notification that says "Successfuly saved"
		if (L.ALS.Helpers._chromeFSSupported) {
			this._saveLabel = new L.ALS.Widgets.SimpleLabel("als-saved-notification", "systemProjectSaved", "center", "success").container;
			this._saveLabel.classList.add("als-saved-notification");
			mapContainer.appendChild(this._saveLabel);
		}

		// Add notification on tab closing
		if (!L.ALS._closeEventAdded && newOptions.enableNotificationOnExit && !L.ALS.Helpers.isElectron) {
			L.ALS._closeEventAdded = true;
			window.addEventListener("beforeunload", (e) => {
				e.returnValue = L.ALS.locale.systemBeforeExit;
				return L.ALS.locale.systemBeforeExit;
			});
		}

		// Remove unused items from the menu. Doing this after adding all the stuff is way easier and cleaner than writing ifs above :D

		let topPanel = this._menu.getElementsByClassName("als-top-panel")[0];
		if (!newOptions.enableBaseLayerSwitching) {
			topPanel.removeChild(this._baseLayerMenu);
			topPanel.classList.add("als-no-layer-switching");
		}
		if (!newOptions.enableExport)
			topPanel.removeChild(this._exportButton);
		if (!newOptions.enableProjects) {
			topPanel.removeChild(this._saveButton);
			topPanel.removeChild(topPanel.getElementsByClassName("als-load-button")[0]);
		}
		if (!newOptions.enableSettings)
			topPanel.removeChild(this._settingsButton);

		if (!newOptions.useOnlyThisLayer)
			return;
		topPanel.removeChild(addButton);
		topPanel.removeChild(deleteButton);
		this._useOnlyOneLayer = true;
		new newOptions.useOnlyThisLayer(this, {}, newOptions.useOnlyThisLayer.settings);
	},

	// Base layers

	/**
	 * Changes base layer
	 * @param event - onchange event
	 * @private
	 */
	_onBaseLayerChange: function (event) {
		this.map.removeLayer(this._previousBaseLayer); // Remove previously set layer
		this._previousBaseLayer = this._baseLayers[event.target.value]; // Get currently selected layer and mark it as previously added
		this._previousBaseLayer.addTo(this.map); // Add it to the map
	},

	/**
	 * Adds base layer
	 * @param layer - Layer to add
	 * @param name {string} - Name of the layer to be displayed in the drop-down menu
	 */
	addBaseLayer: function (layer, name) {
		let item = document.createElement("option"); // Create an option element
		item.text = name; // Set its text to the passed layer's name
		this._baseLayers[name] = layer; // Add layer to the base layers' object
		this._baseLayerMenu.appendChild(item); // Add option to the "select" element

		if (this._previousBaseLayer === undefined) {
			this._previousBaseLayer = layer;
			this._previousBaseLayer.addTo(this.map);
		}
	},

	// Layer system

	/**
	 * Adds given layer type to the layer system
	 * @param layerType - Class of the layer to add
	 */
	addLayerType: function (layerType) {
		let name = layerType.wizard.displayName;
		this._wizardWindow.addItem(name, layerType.wizard);
		this._settingsWindow.addItem(name, layerType.settings);
		this._layerTypes[name] = {
			layerType: layerType,
			container: layerType.wizard.container,
			settings: layerType.settings,
		};
	},

	// Layers-related stuff

	/**
	 * Creates new layer from wizard, acts as factory. Will be called when user adds layer through the wizard.
	 * @private
	 */
	_createLayer: function () {
		let type = this._layerTypes[L.ALS.Locales.getLocalePropertyOrValue(this._wizardMenu.options[this._wizardMenu.selectedIndex])].layerType;
		// Gather arguments from wizard
		let args = {};
		for (let property in type.wizard._widgets) {
			if (!type.wizard._widgets.hasOwnProperty(property))
				continue;
			let widget = type.wizard._widgets[property];
			args[widget.id] = widget.getValue();
		}
		new type(this, args, type.settings.getSettings());
	},

	/**
	 * Selects layer with given ID
	 * @param layerId ID of a layer to select.
	 * @package
	 * @ignore
	 */
	_selectLayer: function (layerId) {
		if (this._selectedLayer !== undefined) {
			if (this._selectedLayer.id === layerId)
				return;
			this._selectedLayer.onDeselect();
		}

		// Deselect other layers, remove interactive and dragging abilities, and select given layer
		for (let prop in this._layers) {
			let layer = this._layers[prop];
			layer.isSelected = false;
			if (!layer._leafletLayers)
				continue;
			layer._leafletLayers.eachLayer((leafletLayer) => {
				if (leafletLayer.wasInteractive === undefined && leafletLayer.getInteractive)
					leafletLayer.wasInteractive = leafletLayer.getInteractive();

				if (leafletLayer.setInteractive)
					leafletLayer.setInteractive(false);

				if (leafletLayer.dragging) {
					if (leafletLayer.wasDraggable === undefined)
						leafletLayer.wasDraggable = leafletLayer.dragging.enabled();
					leafletLayer.dragging.disable();
				}
			});
		}

		this._layers[layerId].isSelected = true;
		this._selectedLayer = this._layers[layerId];

		if (this._selectedLayer._leafletLayers) {
			this._selectedLayer._leafletLayers.eachLayer((leafletLayer) => {
				if (leafletLayer.setInteractive && leafletLayer.wasInteractive)
					leafletLayer.setInteractive(true);

				if (leafletLayer.wasDraggable && leafletLayer.dragging)
					leafletLayer.dragging.enable();

				delete leafletLayer.wasInteractive;
				delete leafletLayer.wasDraggable;
			});
		}

		this._selectedLayer.onSelect();

		// Do the same for HTML elements
		let children = this._layerContainer.childNodes;
		for (let child of children)
			child.setAttribute("data-is-selected", "0");
		document.getElementById(layerId).setAttribute("data-is-selected", "1");
	},

	/**
	 * Deletes selected layer and LITERALLY everything related to it
	 * @param shouldAskUser {boolean} If set to true, the message asking if user wants to delete selected layer will be displayed. Otherwise, layer will be silently deleted.
	 * @package
	 * @ignore
	 */
	_deleteLayer: function (shouldAskUser = true) {
		if (this._selectedLayer === undefined || (shouldAskUser && !window.confirm(L.ALS.locale.systemConfirmDeletion)))
			return;

		this._selectedLayer.onDelete();

		// Remove layer's widget
		let widget = document.getElementById(this._selectedLayer.id);
		widget.parentNode.removeChild(widget);

		// Remove layer from the map
		this._selectedLayer._leafletLayers.remove();
		this._selectedLayer._removeAllMapEventListeners();

		let layerID = this._selectedLayer.id; // Save it before removing properties
		// Remove every property, so there will be no references and event handlers
		for (let property in this._selectedLayer)
			// noinspection JSUnfilteredForInLoop
			delete this._selectedLayer[property]; // It doesn't miss hasOwnProperty() check. We're destroying the whole object.

		// Delete reference from layers object
		delete this._layers[layerID];

		// Select first added layers or make selected layer undefined. That will remove the last reference to it.
		let firstChild = this._layerContainer.firstElementChild;
		if (!firstChild)
			this._selectedLayer = undefined;
		else
			this._selectLayer(firstChild.id);
	},

	/**
	 * Reorders layers. Will be called upon actual reordering and when it's needed to change Z-indices and bring everything back to normal;
	 * @package
	 * @ignore
	 */
	_reorderLayers: function () {
		this._forEachLayer(function (layer) {
			layer._leafletLayers.bringToBack();
		});
	},

	/**
	 * Loops through each layer in menu position order and calls callback.
	 * @param callback {function(L.ALS.Layer)} Function to call on each layer
	 * @private
	 */
	_forEachLayer: function (callback) {
		let children = this._layerContainer.childNodes;
		for (let i = 0; i <= children.length; i++) {
			let child = children[i];
			if (child === undefined)
				continue;
			callback(this._layers[child.id]);
		}
	},

	// Project-related stuff

	/**
	 * Exports each layer to GeoJSON file, generates zip archive with them and saves it
	 * @private
	 */
	_exportProject: function () {
		let willDoCustomExport = (L.ALS._service.onProjectExport && !L.ALS.Helpers.supportsBlob);
		if (!willDoCustomExport)
			L.ALS.Helpers.notifyIfDataURLIsNotSupported();
		// Gather GeoJSON representation of all layers and either build zip or download as text
		let filenames = {};
		let zip = new JSZip();
		for (let name in this._layers) {
			if (!this._layers.hasOwnProperty(name))
				continue;
			let layer = this._layers[name];

			let postfix = "";
			let layerName = layer.getName();
			if (filenames.hasOwnProperty(layerName)) {
				postfix = " (" + filenames[layerName] + ")";
				filenames[layerName]++;
			} else
				filenames[layerName] = 1;

			let json = JSON.stringify(layer.toGeoJSON());
			let filename = layerName + postfix + ".geojson";

			if (L.ALS.Helpers.supportsDataURL || willDoCustomExport)
				zip.file(filename, json);
			else
				L.ALS.Helpers.saveAsText(json, filename);
		}

		if (willDoCustomExport) {
			L.ALS._service.onProjectExport(zip);
			return;
		}

		if (!L.ALS.Helpers.supportsDataURL)
			return;

		// FileSaver doesn't work correctly with older Chrome versions (around v14). So we have to perform following check:
		let type = L.ALS.Helpers.supportsBlob ? "blob" : "base64";
		zip.generateAsync({type: type}).then((data) => {
			let filename = L.ALS._service.filePrefix + "Project.zip";
			if (L.ALS.Helpers.supportsBlob)
				saveAs(data, filename)
			else
				L.ALS.Helpers.createDataURL(filename, "application/zip", "base64", data);
		}).catch((reason) => {
			console.error(reason);
		});
	},

	/**
	 * Saves the project
	 * @private
	 */
	_saveProject: function () {
		let center = this.map.getCenter();
		let json = {
			layerOrder: [],
			center: [center.lat, center.lng],
			zoom: this.map.getZoom(),
		};

		this._forEachLayer((layer) => {
			json.layerOrder.push(layer.id);
		})

		let seenObjects = {};
		for (let id in this._layers) {
			let layer = this._layers[id];
			json[layer.id] = layer.serialize(seenObjects);
		}
		L.ALS.Serializable.cleanUp(seenObjects);
		let promise = L.ALS.Helpers._saveAsTextWorker(JSON.stringify(json), L.ALS._service.filePrefix + "Project.json", true);

		if (promise) {
			promise.then(() => {
				if (L.ALS.Helpers._chromeHandle)
					this._setTabTitle(L.ALS.Helpers._chromeHandle.name);
			});

			// Show "Project Saved" notification
			this._saveLabel.classList.add("shown");
			setTimeout(() => {
				this._saveLabel.classList.remove("shown");
			}, 1500);
		}
	},

	/**
	 * Loads the project
	 * @param json {string} JSON from read file
	 * @private
	 */
	_loadProject: function () {
		if (!L.ALS.Helpers.isObjectEmpty(this._layers) && !window.confirm(L.ALS.locale.systemProjectAlreadyOpen)) {
			this._loadButton.value = "";
			return;
		}

		if (L.ALS.Helpers.supportsFileNameProperty)
			this._setTabTitle(this._loadButton.files[0].name);

		let cb = (text) => {
			try {
				this._loadProjectWorker(text);
			} catch (e) {
				window.alert(L.ALS.locale.systemNotProject);
				console.error(e);
			}
		}

		if (!L.ALS._service.onProjectLoad)
			L.ALS.Helpers.readTextFile(this._loadButton, L.ALS.locale.systemProjectLoadingNotSupported, cb);
		else
			L.ALS._service.onProjectLoad(this._loadButton, cb);


	},

	/**
	 * Actual project loading mechanism
	 * @param json {string} JSON from read file
	 * @private
	 */
	_loadProjectWorker: function (json) {
		let serializedJson = JSON.parse(json); // Do it here, so layers won't be removed if user have chosen wrong file

		// Remove all current layers
		for (let id in this._layers)
			this._layers[id].deleteLayer();
		this._layers = {};

		// Restore layers
		let selectedLayerID;
		let seenObjects = {};
		for (let id of serializedJson.layerOrder) {
			if (!serializedJson.hasOwnProperty(id))
				continue;

			let serialized = serializedJson[id];
			let constructor = L.ALS.Serializable.getSerializableConstructor(serialized.serializableClassName);
			let layer = constructor.deserialize(serialized, this, constructor.settings.getSettings(), seenObjects);

			if (!layer.isShown)
				L.ALS.Helpers.dispatchEvent(layer._hideButton, "click");

			if (layer.isSelected)
				selectedLayerID = layer.id;
		}
		if (selectedLayerID !== undefined)
			this._selectLayer(selectedLayerID);

		// Restore center position. Condition is needed for compatibility with older ALS versions.
		if (serializedJson.center)
			this.map.setView(serializedJson.center, serializedJson.zoom);

		L.ALS.Serializable.cleanUp(seenObjects);
	},

	onAdd: function () {
		let button = document.createElement("i");
		button.className = "als-button-base icon-button ri ri-menu-line als-menu-button";
		L.ALS.Helpers.makeHideable(button, this._menu);

		let container = document.createElement("div");
		container.className = "leaflet-bar leaflet-control";
		container.appendChild(button);
		return container;
	},

	/**
	 * Sets position of the menu button and menu itself, i.e. if position is "topleft" or "bottomleft", both button and menu will be on the left side of the map.
	 * @param position {"topleft"|"bottomleft"|"topright"|"bottomright"} Position to set
	 * @return {L.ALS.System} this
	 */
	setPosition: function (position) {
		L.Control.prototype.setPosition.call(this, position);
		let name = "menu-left";
		if (position === "topleft" || position === "bottomleft")
			this._menu.classList.add(name);
		else
			this._menu.classList.remove(name);
		return this;
	},

	/**
	 * Gathers all settings and passes it to the added layers
	 * @private
	 */
	_applyNewSettings: function () {
		for (let name in this._layers) {
			let layer = this._layers[name];
			layer.applyNewSettings(
				this._settingsWindow.getItem(layer.constructor.wizard.displayName).getSettings()
			);
		}
	},

	/**
	 * Sets tab title
	 * @param title {string} New title
	 * @private
	 */
	_setTabTitle: function (title) {
		if (this._tabTitle === "title")
			return;
		if (this._tabTitle === "project-and-title")
			title += " - " + L.ALS._service.tabTitle;
		document.title = title;
	},

	statics: {

		/**
		 * Performs important operations. Must be called after all Leaflet and ALS imports.
		 * @param scaleUIForPhoneUsers {boolean} If set to true, UI for phone users will be scaled automatically. Otherwise UI size will stay the same. Scaling is done by increasing root font size to 36pt.
		 * @memberOf L.ALS.System
		 */
		initializeSystem: function (scaleUIForPhoneUsers = true) {

			// If user's device is a phone, make UI a bit bigger
			if (scaleUIForPhoneUsers && L.ALS.Helpers.isMobile)
				document.querySelector(":root").style.fontSize = "16pt";

			// Add class names to all Leaflet and ALS classes for serialization
			let addClassName = function (object, scope) {
				for (let prop in object) {
					let newObject = object[prop];
					let brackets = (!(newObject instanceof Object) || newObject instanceof Array);
					if (!object.hasOwnProperty(prop) || newObject === null || newObject === undefined ||
						(newObject.serializableClassName !== undefined) ||
						brackets
					)
						continue;
					let newScope = scope + "." + prop;

					if (newObject.addInitHook !== undefined) {
						newObject.addInitHook(function () {
							this.serializableClassName = newScope;
						});
					}

					if (newObject.prototype !== undefined)
						newObject.prototype.serializableClassName = newScope;

					addClassName(newObject, newScope);
				}
			}
			addClassName(L, "L");

			// Set preferred locale
			if (L.ALS.Helpers.localStorage.getItem("settingsGeneralSettings|lang"))
				return;

			let locales = navigator.languages ||
				[navigator.language || navigator.browserLanguage || navigator.userLanguage || navigator.systemLanguage || "en-us"];
			let matchingLocale;
			for (let userLocale of locales) {
				let lowercase = userLocale.toLowerCase();
				let userLang = lowercase.substring(0, 2);
				let userRegion = lowercase.substring(3, 5);

				if (!userLang)
					continue;

				let foundLocale = false;
				for (let localeName in L.ALS.Locales) {
					let locale = L.ALS.Locales[localeName];
					if (locale.language !== userLang)
						continue;

					foundLocale = true;
					matchingLocale = localeName;
					if (userRegion && locale.region === userRegion)
						break;
				}
				if (matchingLocale)
					break;
			}

			// Set locale to local storage because SettingsWindow will try to read it from there and reset it back to English
			if (matchingLocale)
				L.ALS.Helpers.localStorage.setItem("settingsGeneralSettings|lang", matchingLocale);
		}
	}

});
