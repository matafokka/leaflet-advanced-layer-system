require("./meta.js");
const Sortable = require("sortablejs");
const JSZip = require("jszip");
const saveAs = require("file-saver");

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

	/**
	 * Indicates whether system is in the middle of serialization or deserialization, i.e. if {@link L.ALS.System#writeToHistory} should work.
	 * @type {boolean}
	 * @private
	 */
	_canWriteToHistory: true,

	/**
	 * Indicates whether toolbar is enabled
	 * @type {boolean}
	 * @private
	 */
	_toolbarEnabled: false,

	includes: L.ALS.ControlManager.prototype,

	initialize: function (map, options) {
		L.Control.prototype.initialize.call(this);

		/**
		 * ID to keep track of wizard instances
		 * @type {string}
		 * @private
		 */
		this._id = L.ALS.Helpers.generateID();

		/**
		 * Contains current history operations
		 * @type {Set}
		 * @private
		 */
		this._historyOperations = new Set();

		/** @type {SystemOptions} */
		let defaultOptions = {
			aboutHTML: undefined,
			defaultLocale: "English",
			enableDuplicateButton: true,
			enableNewProjectButton: true,
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
			enableHistory: false,
			historySize: 20,
			enableToolbar: false,
			toolbarZoomControl: new L.ALS.ControlZoom({position: "topleft"}),
			makeMapFullscreen: false,
			removeMenuBar: false,
			generalSettings: L.ALS.GeneralSettings,
		}

		let callbacks = ["onJsonSave", "onJsonLoad", "onProjectExport"];
		for (let callback of callbacks)
			defaultOptions[callback] = undefined;

		/** @type {SystemOptions} */
		let newOptions = L.ALS.Helpers.mergeOptions(defaultOptions, options);

		if (!L.ALS._service.generalSettings) {

			/**
			 * General settings instance
			 * @type {L.ALS.GeneralSettings}
			 */
			L.ALS._service.generalSettings = new newOptions.generalSettings(newOptions.defaultLocale);
		}

		for (let callback of callbacks)
			L.ALS._service[callback] = newOptions[callback];

		L.ALS._service.filePrefix = newOptions.filePrefix;

		this._tabTitle = (L.ALS.Helpers._chromeFSSupported) ? newOptions.tabTitle : "title";
		if (!L.ALS._service.tabTitle) // In case multiple ALS instances used
			L.ALS._service.tabTitle = document.title;

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

		/**
		 * Contains history entries in insertion order
		 * @type {Object[]}
		 * @private
		 */
		this._history = [];

		/**
		 * Current history index
		 * @type {number}
		 * @private
		 */
		this._currentHistoryIndex = 0;

		/**
		 * History size
		 * @type {number}
		 * @private
		 */
		this._historySize = (newOptions.historySize > 1) ? newOptions.historySize : 0;

		this._enableHistory = newOptions.enableHistory;

		this._enableDuplicateButton = newOptions.enableDuplicateButton;

		let mapContainer = document.createElement("div");
		mapContainer.className = "als-map-container";

		let mapDiv = this.map.getContainer();
		mapDiv.parentElement.insertBefore(mapContainer, mapDiv);
		mapContainer.appendChild(mapDiv);

		L.ALS.Helpers.HTMLToElement(require("./_service/markup.js"), mapContainer);

		// We'll need it later
		let topPanel = mapContainer.getElementsByClassName("als-top-panel")[0];

		// Wizard-related stuff
		this._wizardButton = mapContainer.getElementsByClassName("als-menu-add")[0];
		this._wizardWindow = new L.ALS._service.WizardWindow(this._wizardButton, () => {
			this._createLayerFromWizard();
		});
		let wizardWindow = this._wizardWindow.window;

		this._wizardMenu = wizardWindow.getElementsByClassName("als-wizard-menu")[0];

		/**
		 * Container for the layers
		 * @type {Element}
		 * @package
		 * @ignore
		 */
		this._layerContainer = mapContainer.getElementsByClassName("als-menu-items")[0];

		// Menu-related stuff
		this._menu = mapContainer.getElementsByClassName("als-menu")[0];
		this._menuCloseButton = mapContainer.getElementsByClassName("als-menu-close")[0];
		L.ALS.Helpers.makeHideable(this._menuCloseButton, this._menu, undefined, undefined, false);

		this._baseLayerMenu = mapContainer.getElementsByClassName("als-menu-maps-select")[0];
		this._baseLayerMenu.addEventListener("change", (event) => {
			this._onBaseLayerChange(event);
		});

		// Browsers that doesn't support flexbox won't display an icon with select no matter how hard you try. Hacks like position absolute inside position relative just doesn't work. Transforms and margins affects layout for some reason.
		// So let's just remove the freaking icon and forget about this nightmare.
		if (!L.ALS.Helpers.supportsFlexbox) {
			let freakingIcon = this._baseLayerMenu.parentElement;
			freakingIcon.className = "als-menu-maps-select-wrapper-legacy";
		}

		this._newButton = mapContainer.getElementsByClassName("als-new-project-button")[0];
		this._newButton.addEventListener("click", () => {
			this.createNewProject();
		});

		this._saveButton = mapContainer.getElementsByClassName("als-save-button")[0];
		this._saveButton.addEventListener("click", () => {
			this.saveProject();
		});

		this._saveAsButton = mapContainer.getElementsByClassName("als-save-as-button")[0];
		this._saveAsButton.addEventListener("click", () => {
			this.saveProject(true);
		});

		/**
		 * Points to input, not to a button in the menu
		 * @type {HTMLInputElement}
		 * @private
		 */
		this._loadButton = document.getElementById("als-load-input");
		this._loadButton.addEventListener("change", () => {
			this.loadProject();
		});

		this._exportButton = mapContainer.getElementsByClassName("als-export-button")[0];
		this._exportButton.addEventListener("click", () => {
			this.exportProject();
		});

		this._undoButton = mapContainer.getElementsByClassName("als-undo-button")[0];
		this._undoButton.addEventListener("click", () => {
			this.undo();
		});

		this._redoButton = mapContainer.getElementsByClassName("als-redo-button")[0];
		this._redoButton.addEventListener("click", () => {
			this.redo();
		});

		this._settingsButton = mapContainer.getElementsByClassName("als-settings-button")[0];

		// Add settings window or bind settings button to open it, if window exists

		if (!L.ALS._service.settingsWindow) {
			L.ALS._service.settingsWindow = new L.ALS._service.SettingsWindow(this._settingsButton, () => {
				L.ALS._service.generalSettings._onApply(); // General settings should be updated first
				this._applyNewSettings();
			}, newOptions.aboutHTML);
			L.ALS._service.settingsWindow.addItem("settingsGeneralSettings", L.ALS._service.generalSettings);
			L.ALS._service.generalSettings._onApply();
		} else {
			L.ALS._service.settingsWindow.bindButton(this._settingsButton);
			L.ALS._service.settingsWindow.onCloseCallbacks.push(() => {this._applyNewSettings()});
		}

		this._zoomInButton = mapContainer.getElementsByClassName("als-zoom-in-button")[0];
		this._zoomInButton.addEventListener("click", () => {
			this.map.zoomIn();
		});

		this._zoomOutButton = mapContainer.getElementsByClassName("als-zoom-out-button")[0];
		this._zoomOutButton.addEventListener("click", () => {
			this.map.zoomOut();
		})

		// IE and old browsers (which are unsupported by ALS) either doesn't implement LocalStorage or doesn't support it when app runs locally
		if (!window.localStorage) {
			this._settingsButton.addEventListener("click", () => {
				window.alert(L.ALS.locale.settingsSavingNotSupported);
			});
		}

		this._topPanelSpacerText = mapContainer.getElementsByClassName("als-top-panel-spacer-text")[0];

		// Make layers sortable. We have to reorder layers when their widgets has been reordered and when map state changes. See _reorderLayers() implementation.
		// noinspection JSUnusedGlobalSymbols
		new Sortable(this._layerContainer, {
			handle: ".als-layer-handle",
			animation: 250,
			onEnd: () => {
				this._reorderLayers();
				this.writeToHistory();
			}
		});

		this.setPosition(newOptions.position);

		// Add new window asking to change settings when user tries to load project if browser is IE
		if (L.ALS.Helpers.isIElte9 && newOptions.enableProjects) {

			/**
			 * Error window to display when user tries to load project in IE <= 9 and error occurs
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

			let isZ = symbol === "Z" || code === 90;

			if ((symbol === "S" || code === 83) && L.ALS.Helpers.supportsBlob) // Without blob, it's a headache to save files
				this.saveProject();
			else if (symbol === "O" || code === 79)
				this.loadProject();
			else if (isZ && !e.shiftKey)
				this.undo();
			else if ((symbol === "Y" || code === 89) || (isZ && e.shiftKey))
				this.redo();
			else
				preventDefault = false;
			if (preventDefault)
				e.preventDefault();
		});

		// Add notification that says "Successfully saved"
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

		// Add class which means that map should be rendered fullscreen
		if (newOptions.makeMapFullscreen)
			document.body.classList.add("als-fullscreen-map");

		// Toolbar

		// Phones can hold only 9 buttons + spacer + close buttons container = 11 children. -2 buttons for zoom buttons.
		let removeZoomButtons = (L.ALS.Helpers.isMobile && topPanel.children.length > 9),
			zoomControl; // Zoom control to add later

		this._toolbarEnabled = newOptions.enableToolbar;
		if (this._toolbarEnabled) {

			// Move panel from the menu to the top of the map's container
			if (newOptions.makeMapFullscreen)
				mapContainer.parentElement.insertBefore(topPanel, mapContainer);
			else
				mapContainer.insertBefore(topPanel, mapContainer.firstElementChild);

			// Change class of the close button
			this._menuCloseButton.classList.remove("ri-close-line");
			this._menuCloseButton.classList.add("ri-menu-line");
			L.ALS.Locales.localizeOrSetValue(this._menuCloseButton, "menuButton", "title");

			// Add toolbar-specific classnames
			let items = [topPanel, this._menu];
			for (let item of items)
				item.classList.add("als-toolbar-enabled");

			zoomControl = newOptions.toolbarZoomControl;

			// Add events to window controls for Electron. They'll be caught at ElectronIntegration.
			let buttonsContainer = topPanel.getElementsByClassName("als-electron-buttons-container")[0];

			buttonsContainer.getElementsByClassName("ri-subtract-line")[0].addEventListener("click", () => {
				L.ALS.Helpers.dispatchEvent(document, "als-electron-hide-window");
			});

			buttonsContainer.getElementsByClassName("ri-checkbox-multiple-blank-line")[0].addEventListener("click", () => {
				L.ALS.Helpers.dispatchEvent(document, "als-electron-expand-window");
			});

			buttonsContainer.getElementsByClassName("ri-close-line")[0].addEventListener("click", () => {
				L.ALS.Helpers.dispatchEvent(document, "als-electron-close-window");
			});

			// Catch events that requests changing menu position
			document.addEventListener("als-set-menu-to-left", () => {
				this.setPosition("topleft");
				topPanel.insertBefore(this._menuCloseButton, topPanel.firstElementChild);
			});

			document.addEventListener("als-set-menu-to-right", () => {
				this.setPosition("topright");
				topPanel.insertBefore(this._menuCloseButton, buttonsContainer);
			});

			// Menu position setting is disabled in ie9, set menu to the left manually
			if (L.ALS.Helpers.isIElte9)
				this._menu.classList.add("menu-left");
		}

		// Everything's important is set up, time to call control manager's constructor
		L.ALS.ControlManager.prototype.initialize.call(this, this);

		if (zoomControl && removeZoomButtons)
			this.addControl(zoomControl, "top", "follow-menu");

		map.invalidateSize();
		this.writeToHistory(); // This will start a logical chain where an action should be written to the history after it's complete

		// Remove unused items from the menu. Doing this after adding all the stuff is way easier and cleaner than writing ifs above :D

		if (!newOptions.enableNewProjectButton || !newOptions.enableProjects)
			topPanel.removeChild(this._newButton);

		if (!newOptions.enableBaseLayerSwitching)
			topPanel.removeChild(this._baseLayerMenu.parentElement);

		if (!newOptions.enableExport)
			topPanel.removeChild(this._exportButton);

		if (!newOptions.enableProjects) {
			topPanel.removeChild(this._saveButton);
			topPanel.removeChild(topPanel.getElementsByClassName("als-load-button")[0]);
		}

		if (!newOptions.enableProjects || !L.ALS.Helpers._chromeFSSupported)
			topPanel.removeChild(this._saveAsButton);

		if (!newOptions.enableSettings)
			topPanel.removeChild(this._settingsButton);

		if (!this._enableHistory) {
			topPanel.removeChild(this._undoButton);
			topPanel.removeChild(this._redoButton);
		}

		if (!newOptions.enableToolbar || removeZoomButtons) {
			topPanel.removeChild(this._zoomInButton);
			topPanel.removeChild(this._zoomOutButton);
		}

		if (newOptions.removeMenuBar)
			topPanel.parentElement.removeChild(topPanel);

		this._setTabTitle(L.ALS.locale.systemNewFileTabTitle);

		if (!newOptions.useOnlyThisLayer)
			return;

		topPanel.removeChild(this._wizardButton);
		this._useOnlyOneLayer = true;
		this.addLayerType(newOptions.useOnlyThisLayer);
		this._createLayer(newOptions.useOnlyThisLayer);
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
	 * @param type - Class of the layer to add
	 */
	addLayerType: function (type) {
		// Compatibility with previous versions where wizards were instances
		let wizard = (typeof type.wizard === "function") ? new type.wizard() : type.wizard;

		if (!type._wizards)
			type._wizards = {}
		type._wizards[this._id] = wizard;

		let name = wizard.displayName;
		this._wizardWindow.addItem(name, wizard);

		if (!L.ALS._service.settingsWindow.getItem(name))
			L.ALS._service.settingsWindow.addItem(name, type.settings);

		this._layerTypes[name] = {
			layerType: type,
			container: wizard.container,
			settings: type.settings,
		};
	},

	// Layers-related stuff

	/**
	 * Creates new layer from wizard, acts as factory. Will be called when user adds layer through the wizard.
	 * @private
	 */
	_createLayerFromWizard: function () {
		this._createLayer(
			this._layerTypes[
				L.ALS.Locales.getLocalePropertyOrValue(this._wizardMenu.options[this._wizardMenu.selectedIndex])
				].layerType
		);
	},

	/**
	 * Actual layer factory
	 * @param type {function(new:L.ALS.Layer)} Layer type to instantiate
	 * @private
	 */
	_createLayer: function (type) {
		// Get arguments from wizard
		let args = {}, wizardInstance = type._wizards[this._id];

		for (let property in wizardInstance._widgets) {
			if (!wizardInstance._widgets.hasOwnProperty(property))
				continue;
			let widget = wizardInstance._widgets[property];
			args[widget.id] = widget.getValue();
		}

		// Create layer
		this._addHistoryOperation("createLayer");
		let layer = new type(this, args, type.settings.getSettings());
		this._removeHistoryOperation("createLayer");

		if (layer.writeToHistoryOnInit)
			this.writeToHistory();
	},

	/**
	 * Selects layer with given ID
	 * @param layerId ID of a layer to select.
	 * @package
	 * @ignore
	 */
	_selectLayer: function (layerId) {
		if (this._selectedLayer) {
			if (this._selectedLayer.id === layerId)
				return;
			this._selectedLayer.isSelected = false;
			this._selectedLayer._onDeselect();
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

		// Do the same for HTML elements
		let children = this._layerContainer.childNodes;
		for (let child of children)
			child.setAttribute("data-is-selected", "0");
		document.getElementById(layerId).setAttribute("data-is-selected", "1");

		this._selectedLayer._onSelect();
	},

	/**
	 * Deletes selected layer and its properties
	 * @param shouldAskUser {boolean} If true, the message asking if user wants to delete selected layer will be displayed. Otherwise, layer will be silently deleted.
	 * @param writeToHistory {boolean} If true, will write deletion to the history
	 * @package
	 * @ignore
	 */
	_deleteLayer: function (shouldAskUser = true, writeToHistory = false) {
		if (this._selectedLayer === undefined || (shouldAskUser && !window.confirm(L.ALS.locale.systemConfirmDeletion)))
			return;

		this._addHistoryOperation("deleteLayer");
		this._selectedLayer._onDelete();

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
		this._selectedLayer = undefined;

		this._removeHistoryOperation("deleteLayer");

		// Select first added layers or make selected layer undefined. That will remove the last reference to it.
		let firstChild = this._layerContainer.firstElementChild;
		if (firstChild)
			this._selectLayer(firstChild.id);

		if (writeToHistory)
			this.writeToHistory();
	},

	/**
	 * Reorders layers. Will be called upon actual reordering and when it's needed to change Z-indices and bring everything back to normal;
	 * @package
	 * @ignore
	 */
	_reorderLayers: function () {
		if (!this._selectedLayer)
			return;

		let parent = this._selectedLayer.paneElement.parentElement, insertBefore = this._selectedLayer.paneElement;

		this._forEachLayer((layer) => {
			parent.insertBefore(layer.paneElement, insertBefore);
			insertBefore = layer.paneElement;
		});
	},

	/**
	 * Loops through each layer in menu position order and calls callback.
	 * @param callback {function(L.ALS.Layer)} Function to call on each layer
	 * @private
	 */
	_forEachLayer: function (callback) {
		let children = this._layerContainer.childNodes;
		for (let i = 0; i < children.length; i++) {
			let child = children[i];
			if (child === undefined)
				continue;
			callback(this._layers[child.id]);
		}
	},

	// Project-related stuff

	/**
	 * Exports each layer to GeoJSON file, generates zip archive with them and saves it
	 */
	exportProject: function () {
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

		// FileSaver doesn't work correctly with older Chrome versions (around v14). We have to perform following check:
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
	 * Duplicates given layer
	 * @param layer {L.ALS.Layer} Layer to duplicate
	 * @package
	 * @ignore
	 */
	_duplicateLayer: function (layer) {
		this._addHistoryOperation("duplicateLayer");
		let seenObjects = {}
		let serialized = layer.serialize(seenObjects);
		L.ALS.Serializable.cleanUp(seenObjects);

		seenObjects = {};
		let constructor = L.ALS.Serializable.getSerializableConstructor(serialized.serializableClassName);
		let newLayer = constructor.deserialize(serialized, this, constructor.settings.getSettings(), seenObjects);
		L.ALS.Serializable.cleanUp(seenObjects);

		this._selectLayer(newLayer.id);
		this._removeHistoryOperation("duplicateLayer");

		if (newLayer.writeToHistoryOnInit)
			this.writeToHistory();
	},

	/**
	 * Serializes current state of the system
	 * @return {Object}
	 * @private
	 */
	_serialize: function () {
		let center = this.map.getCenter();
		let json = {
			layerOrder: [],
			scrollTop: this._layerContainer.scrollTop,
			center: [center.lat, center.lng],
			zoom: this.map.getZoom(),
		};

		this._forEachLayer((layer) => {
			let seenObjects = {};
			json.layerOrder.push(layer.id);
			json[layer.id] = layer.serialize(seenObjects);
			L.ALS.Serializable.cleanUp(seenObjects);
		});

		return json;
	},

	/**
	 * Deserializes state of the system
	 * @param json {Object} JSON to deserialize
	 * @private
	 */
	_deserialize: function (json) {
		// Remove all current layers
		for (let id in this._layers)
			this._layers[id].deleteLayer();
		this._layers = {};

		// Restore layers
		let selectedLayerID;
		for (let id of json.layerOrder) {
			let seenObjects = {};
			let serialized = json[id];
			let constructor = L.ALS.Serializable.getSerializableConstructor(serialized.serializableClassName);
			let layer = constructor.deserialize(serialized, this, constructor.settings.getSettings(), seenObjects);
			L.ALS.Serializable.cleanUp(seenObjects);

			if (!layer.isShown)
				L.ALS.Helpers.dispatchEvent(layer._hideButton, "click");

			if (layer.isSelected)
				selectedLayerID = layer.id;
		}
		if (selectedLayerID !== undefined)
			this._selectLayer(selectedLayerID);

		// Restore center position. Condition is needed for compatibility with older ALS versions.
		if (json.center)
			this.map.setView(json.center, json.zoom);

		// Restore scroll position
		if (json.scrollTop)
			setTimeout(() => {
				this._layerContainer.scrollTop = json.scrollTop;
			}, 300); // Wait for animation
	},

	/**
	 * Saves the project
	 *
	 * @param saveAs {boolean} If true, and Chrome FileSystem API is supported, will perform "Save As" action instead of overriding already opened project.
	 */
	saveProject: function (saveAs = false) {
		let json = this._serialize();
		let promise = L.ALS.Helpers._saveAsTextWorker(JSON.stringify(json), L.ALS._service.filePrefix + "Project.json", true, saveAs);

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
	 */
	loadProject: function () {
		if (!L.ALS.Helpers.isObjectEmpty(this._layers) && !window.confirm(L.ALS.locale.systemProjectAlreadyOpen)) {
			this._loadButton.value = "";
			return;
		}

		if (L.ALS.Helpers.supportsFileNameProperty)
			this._setTabTitle(this._loadButton.files[0].name);

		let cb = (text) => {
			try {
				let json = JSON.parse(text)
				this._deserialize(json);
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

	onAdd: function () {
		let button = document.createElement("i");
		button.className = "als-button-base icon-button ri ri-menu-line als-menu-button";
		L.ALS.Locales.localizeOrSetValue(button, "menuButton", "title");
		L.ALS.Helpers.makeHideable(button, this._menu, undefined, undefined, false);

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
				L.ALS._service.settingsWindow.getItem(layer.constructor._wizards[this._id].displayName).getSettings()
			);
		}
	},

	/**
	 * Writes a record to the history
	 *
	 * This method interferes with serialization and deserialization.
	 *
	 * It won't do anything, if called when serialization or deserialization hasn't finished, for example, when restoring from history.
	 */
	writeToHistory: function () {
		if (!this._enableHistory || !this._canWriteToHistory)
			return;

		this._addHistoryOperation("writeToHistory");

		let i = this._history.length - 1;
		while (i > this._currentHistoryIndex) {
			this._history.pop();
			i--;
		}
		this._history.push(this._serialize());

		if (this._historySize !== 0 && this._history.length > this._historySize)
			this._history.shift();

		this._currentHistoryIndex = this._history.length - 1;

		this._removeHistoryOperation("writeToHistory");
	},

	/**
	 * Undo action
	 */
	undo: function () {
		if (!this._enableHistory || this._currentHistoryIndex === 0)
			return;
		this._currentHistoryIndex--;
		this._historyRestoreCurrentIndex();
	},

	/**
	 * Redo action
	 */
	redo: function () {
		if (!this._enableHistory || this._currentHistoryIndex >= this._history.length - 1) // Greater is for no history
			return;
		this._currentHistoryIndex++;
		this._historyRestoreCurrentIndex();
	},

	/**
	 * Restores state from the history.
	 * @private
	 */
	_historyRestoreCurrentIndex: function () {
		if (!this._enableHistory)
			return;

		this._addHistoryOperation("restoreHistory");
		this._deserialize(this._history[this._currentHistoryIndex]);
		this._history[this._currentHistoryIndex] = this._serialize(); // Deserialization proccess might modify serialized object, so we gotta serialize again
		this._removeHistoryOperation("restoreHistory");
	},

	/**
	 * Adds an entry to the history operation
	 * @param name {string} Operation name
	 * @private
	 */
	_addHistoryOperation: function (name) {
		this._historyOperations.add(name);
		this._canWriteToHistory = false;
	},

	/**
	 * Removes entry from history operations
	 * @param name {string} Operation name
	 * @private
	 */
	_removeHistoryOperation: function (name) {
		this._historyOperations.delete(name);
		this._canWriteToHistory = (this._historyOperations.size === 0);
	},

	/**
	 * Sets tab title
	 * @param title {string} New title
	 * @private
	 */
	_setTabTitle: function (title) {
		if (this._tabTitle === "title")
			title = document.title;
		else if (this._tabTitle === "project-and-title")
			title += " - " + L.ALS._service.tabTitle;
		this._topPanelSpacerText.textContent = title;
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
	},

	// Misc methods bound to the toolbar buttons

	/**
	 * Creates a new project by simply reloading the tab. Asks confirmation before doing so.
	 */
	createNewProject: function () {
		if (window.confirm(L.ALS.locale.systemBeforeNewProject))
			location.reload();
	},

	/**
	 * Opens settings window
	 */
	openSettingsWindow: function () {
		L.ALS.Helpers.dispatchEvent(this._settingsButton, "click");
	},

	/**
	 * Opens wizard window
	 */
	openWizardWindow: function () {
		L.ALS.Helpers.dispatchEvent(this._wizardButton, "click");
	},

	/**
	 * Clicks on menu
	 */
	clickOnMenu: function () {
		L.ALS.Helpers.dispatchEvent(this._menuCloseButton, "click");
	}

});