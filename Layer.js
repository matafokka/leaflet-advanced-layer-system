/**
 * Base class for all layers for the Layer System.
 *
 * Basically, it's a wrapper around {@link L.FeatureGroup}. It doesn't provide all of it's methods because they're used internally in the layer system, and their usage will break it. So do NOT touch the actual FeatureGroup object.
 *
 * Every layer has its own menu which you can modify by using methods inherited from {@link L.ALS.Widgetable}.
 *
 * Usage:
 *
 * 1. Set {@link L.ALS.Layer#defaultName} property to the default name of your layer.
 * 1. Create wizard by extending {@link L.ALS.Wizard}.
 * 1. Set {@link L.ALS.Layer.wizard} to an instance of your wizard.
 * 1. If you need to implement settings for your layer, extend {@link L.ALS.Settings} and set {@link L.ALS.Layer.settings} to an instance of your settings.
 * 1. Implement {@link L.ALS.Layer#init} method. It's used as a constructor.
 * 1. Modify layer menu by using methods inherited from {@link L.ALS.Widgetable}.
 * 1. Implement your own methods or extend current ones. Basically, make it work :D
 *
 * Please, read the docs for each public method, you might need to (if not should) override most of them.
 *
 * Important notes:
 *
 * 1. NEVER use {@link L.LayerGroup} because it breaks layer system!
 * 1. Use {@link L.ALS.Layer#addLayers} and {@link L.ALS.Layer#removeLayers} to add and remove Leaflet layers.
 * 1. To hide layer from the map, use `this.map.remove()` and `this.map.add()`.
 * 1. Use {@link L.ALS.Layer#addEventListenerTo} and {@link L.ALS.Layer#removeEventListenerFrom} to add and remove event listeners from objects and map.
 * 1. Unless your layer is super simple, you'll most likely need to implement custom serialization and deserialization mechanisms. Please, refer to the {@link L.ALS.Serializable} docs and [example project](https://github.com/matafokka/SynthFlight) for this.
 *
 * @param wizardResults {Object} Results compiled from the wizard. It is an object who's keys are IDs of your controls and values are values of your controls.
 * @param settings {SettingsObject} Current layer settings.
 *
 * @class
 * @extends L.ALS.Widgetable
 *
 */
L.ALS.Layer = L.ALS.Widgetable.extend( /** @lends L.ALS.Layer.prototype */ {

	/**
	 * Name to be assigned to this layer by default. Set it to locale property to localize it.
	 * @type {string}
	 * @readonly
	 */
	defaultName: "layerDefaultName",

	/**
	 * Indicates whether this layer is shown or not. Do NOT modify!
	 * @type {boolean}
	 * @readonly
	 */
	isShown: true,

	/**
	 * Indicates whether this layer is selected or not. Should not be modified!
	 * @type {boolean}
	 * @readonly
	 */
	isSelected: false,

	/**
	 * Indicates whether controls of this layer are shown
	 * @type {boolean}
	 * @private
	 */
	_controlsShown: false,

	/**
	 * Layer's constructor. Do NOT override it! Use {@link L.ALS.Layer#init} method instead!
	 * @param layerSystem {L.ALS.System} Layer system that creates this layer
	 * @param args {Array} Arguments to pass to {@link L.ALS.Layer#init}
	 * @param settings {SettingsObject} Settings to pass to {@link L.ALS.Layer#init}
	 * @private
	 */
	initialize: function (layerSystem, args, settings) {
		L.ALS.Widgetable.prototype.initialize.call(this, "als-layer-menu");
		this.setConstructorArguments([args]);
		this.serializationIgnoreList.push("_layerSystem", "_nameLabel", "_leafletLayers", "_mapEvents", "getBounds", "isSelected", "_controls");

		/**
		 * Contains event listeners bound to various objects. Looks like this:
		 * ```
		 * {
		 *     "object_id_1": {
		 *         "event_type_1": ["handler1", "handler2", ...],
		 *         "event_type_2": [...],
		 *         ...
		 *     },
		 *     "object_id_2": { ... },
		 *     ...
		 * }
		 * ```
		 * @private
		 */
		this._eventsForObjects = {};

		/**
		 * @typedef {Object} MapEvent
		 * @property {string} type Event type
		 * @property {Object} handler Handler object
		 * @property {Function} handlerFunction Function to call on given event
		 * @private
		 */

		/**
		 * Contains map events bound to this layer
		 * @type {MapEvent[]}
		 * @private
		 */
		this._mapEvents = [];

		/**
		 * Contains controls added to this layer
		 * @type {Object}
		 * @private
		 */
		this._controls = {};

		/**
		 * Layer system managing this layer
		 * @type {L.ALS.System}
		 * @private
		 */
		this._layerSystem = layerSystem;

		/**
		 * Map on which this layer is being added
		 * @type {L.Map}
		 * @protected
		 */
		this.map = this._layerSystem.map;

		/**
		 * Unique ID of this layer
		 * @type {string}
		 * @readonly
		 */
		this.id = "ALSLayer" + L.ALS.Helpers.generateID();

		/**
		 * Contains added Leaflet layers
		 * @type {L.FeatureGroup}
		 * @package
		 * @ignore
		 */
		this._leafletLayers = L.featureGroup();

		/**
		 * Current name of this layer
		 * @type {string}
		 * @private
		 */
		this._name = this.defaultName;

		// Build menu
		// Handle
		let handle = document.createElement("i");
		handle.className = "als-layer-handle ri ri-drag-move-2-line";

		// Editable label containing layer's name
		let label = document.createElement("p");
		label.className = "als-layer-label";
		label.innerHTML = this.defaultName;

		// Make it editable on double click
		label.addEventListener("dblclick", function () {
			this.contentEditable = "true";
			// noinspection JSValidateTypes
			this.focus();
		});

		// Make it not editable when user leaves
		label.addEventListener("blur", (event) => {
			let target = event.target;
			target.contentEditable = "false";
			this.setName(target.innerHTML);
			this.writeToHistory();
		});

		// Make it end editing when user presses Enter
		label.addEventListener("keydown", function (event) {
			if (event.key === "Enter") {
				event.preventDefault();
				// noinspection JSValidateTypes
				this.blur();
			}
		});

		// Delete button
		let deleteButton = document.createElement("i");
		deleteButton.className = "ri ri-delete-bin-line als-menu-delete";
		deleteButton.addEventListener("click", () => {
			this.deleteLayer(true, true);
		});

		// Duplicate button
		let duplicateButton;
		if (this._layerSystem._enableDuplicateButton) {
			duplicateButton = document.createElement("i");
			duplicateButton.className = "ri ri-file-copy-line";
			duplicateButton.addEventListener("click", () => {
				this._layerSystem._duplicateLayer(this);
			});
		}

		// Drop-down menu button
		let menuButton = document.createElement("i");
		menuButton.className = "ri ri-settings-3-line";

		// Menu itself
		L.ALS.Helpers.makeCollapsible(menuButton, this.container);

		this._hideButton = document.createElement("i");
		this._hideButton.className = "ri ri-eye-line";
		L.ALS.Helpers.makeHideable(this._hideButton, undefined, () => {
			this._hideButton.className = "ri ri-eye-off-line";
			this._onHide();
			this.onHide();
		}, () => {
			this._hideButton.className = "ri ri-eye-line";
			this._onShow();
			this.onShow();
		}, false);
		this._hideButton.setAttribute("data-hidden", "0");

		let layerWidget = document.createElement("div");
		layerWidget.className = "als-layer-container";
		layerWidget.id = this.id;

		let controlsContainer = document.createElement("div");
		controlsContainer.className = "als-items-row";

		let elements = [handle, label, deleteButton, duplicateButton, menuButton, this._hideButton];
		for (let e of elements) {
			if (e)
				controlsContainer.appendChild(e);
		}

		if (!this._layerSystem._useOnlyOneLayer)
			layerWidget.appendChild(controlsContainer);
		else
			this.container.classList.add("als-only-one-layer");

		layerWidget.appendChild(this.container);
		layerWidget.addEventListener("click", () => {
			if (this._layerSystem) // It's still called when delete button has been clicked. Tis condition fixes this issue.
				this._layerSystem._selectLayer(this.id);
		});

		this._layerSystem._layerContainer.appendChild(layerWidget);
		this._layerSystem._layers[this.id] = this;
		this._nameLabel = label;

		// Select new layer, so system can work. But onSelect() might fail, so we gotta catch that.
		try {
			this._layerSystem._selectLayer(this.id);
		} catch (e) {}

		for (let pos of ["left", "right"])
			document.addEventListener(`als-set-menu-to-${pos}`, () => {this._updateControlsPosition(pos)});

		this.init(args, settings); // Initialize layer and pass all the properties
		this._onSelect();
	},

	/**
	 * Adds event listener (handler) to the object. Use it instead of `object.on()`.
	 *
	 * Note: we use object's methods as handlers to be able to save and restore them when user saves the project.
	 *
	 * @param object {Object} Object to add listener to
	 * @param type {string} Event type, string in format used by Leaflet
	 * @param handler {string} Your object's method that will handle this event
	 */
	addEventListenerTo: function (object, type, handler) {
		// Write added event listener to the _eventsForObjects
		if (object._advSysID === undefined)
			object._advSysID = "advLayerSys" + L.ALS.Helpers.generateID();
		if (this._eventsForObjects[object._advSysID] === undefined)
			this._eventsForObjects[object._advSysID] = {};
		if (this._eventsForObjects[object._advSysID][type] === undefined)
			this._eventsForObjects[object._advSysID][type] = [];

		let handlerFunction = (event) => {
			let callHandler = (event) => {
				this[handler](event);
				this._layerSystem._reorderLayers();
			}

			// Always fire map events
			if (object === this.map) {
				callHandler(event);
				return;
			}

			if (!this.isShown) // Events won't be fired if this layer is hidden
				return;

			if (this.isSelected) { // Events will only be fired when this layer is selected
				callHandler(event);
				return;
			}

			// Forward event to the underlying layer
			this._layerSystem._selectedLayer._leafletLayers.bringToFront(); // Bring selected layer to the front
			let oldEvent = event.originalEvent;
			if (!oldEvent || oldEvent.dispatchedByALS) // Uncaught events will lead to infinite recursion. Also, there might be no originalEvent property. Yup, that's strange, but it happens in Leaflet.Draw, for example.
				return;

			let newEvent = new oldEvent.constructor(oldEvent.type, oldEvent); // Clone old event
			newEvent.dispatchedByALS = true; // If event won't be caught, it will call the handler again and again. So let's mark it, so we can just don't fire it again.
			oldEvent.target.dispatchEvent(newEvent); // The target will be a canvas, not a Leaflet object. So let's dispatch cloned event to it
			this._layerSystem._reorderLayers(); // Bring selected layer back to its place simply by reordering layers
		}

		let handlerObject = {
			type: type,
			handler: handler,
			handlerFunction: handlerFunction
		}

		this._eventsForObjects[object._advSysID][type].push(handlerObject);
		object.on(type, handlerFunction);

		if (object === this.map)
			this._mapEvents.push(handlerObject);
	},

	/**
	 * Removes event listener (handler) to the specified event type from the object. Use it instead object.off().
	 *
	 * @see Layer.addEventListenerTo For more information
	 *
	 * @param object {object} - Object to remove event listener from
	 * @param type {string} - Event type
	 * @param handler {string} - Event listener (handler) to remove
	 */
	removeEventListenerFrom: function (object, type, handler) {
		if (object._advSysID === undefined)
			return;
		let handlers = this._eventsForObjects[object._advSysID][type];
		if (handlers === undefined)
			return;

		let index = -1;
		for (let i = 0; i < handlers.length; i++) {
			if (handlers[i].handler === handler) {
				index = i;
				break;
			}
		}
		if (index === -1)
			return;

		let handlerObject = handlers[index];

		if (object === this.map)
			this._mapEvents.splice(this._mapEvents.indexOf(handlerObject), 1);

		object.off(type, handlerObject.handlerFunction);
		this._eventsForObjects[object._advSysID][type].splice(index, 1);
	},

	/**
	 * Removes all event listeners bounded to the map by this layer. This method is intended ONLY for internal use. Do NOT call it!
	 * @package
	 * @ignore
	 */
	_removeAllMapEventListeners: function () {
		for (let handlerObject of this._mapEvents)
			this.map.off(handlerObject.type, handlerObject.handlerFunction);
	},

	/**
	 * Adds control to this layer. This control will be managed automatically.
	 * @param control {Control} Control to add
	 * @param automanagePosition {"top"|"bottom"|undefined} When toolbar is enabled, users can move menu to left or right. It's always good to make controls always visible by moving it to the different side. ALS can do it for you, just set this argument to "top" or "bottom" to display control at the top or bottom side respectively. Or leave it as undefined, and ALS will not override control's position. This argument doesn't take effect when toolbar is disabled or user's device is a phone.
	 * @param positionOnMobile {"topleft"|"topright"|"bottomleft"|"bottomright"|undefined} Sets control position on mobile devices, if previous argument is used. Leave it as undefined, and ALS will not override control's position on mobile devices. This argument doesn't take effect when toolbar is disabled or user's device is a desktop. This is just convenience argument.
	 */
	addControl: function (control, automanagePosition = undefined, positionOnMobile = undefined) {
		if (!control._alsId)
			control._alsId = L.ALS.Helpers.generateID();
		this._controls[control._alsId] = control;

		if (automanagePosition) {
			if (this._layerSystem._toolbarEnabled && !L.ALS.Helpers.isMobile) {
				control._alsPos = automanagePosition;
				this._setControlPosition(control, this._getControlPosition(L.ALS.generalSettings.menuPosition));
			} else if (L.ALS.Helpers.isMobile && positionOnMobile)
				control.setPosition(positionOnMobile);
		}

		if (this._controlsShown)
			control.addTo(this.map);
	},

	/**
	 * Removes control from this layer
	 * @param control {Control} Control to remove
	 */
	removeControl: function (control) {
		if (!this._controls[control._alsId])
			return;

		delete this._controls[control._alsId];

		if (this._controlsShown)
			control.remove();
	},

	/**
	 * Shows or hides controls of this layer
	 * @private
	 */
	_toggleControls: function () {
		let show = this.isShown && this.isSelected;

		if ((show && this._controlsShown) || (!show && !this._controlsShown))
			return;

		this._controlsShown = show;
		let fn = show ? "addTo" : "remove";

		for (let id in this._controls)
			this._controls[id][fn](this.map);
	},

	/**
	 * Updates controls positions
	 * @param pos {"left"|"right"} New position
	 * @private
	 */
	_updateControlsPosition: function (pos) {
		pos = this._getControlPosition(pos);
		for (let id in this._controls)
			this._setControlPosition(this._controls[id], pos);
	},

	/**
	 * Reverses menu position and returns position for controls
	 * @param menuPos {string} Menu position
	 * @return {string} Position for controls
	 * @private
	 */
	_getControlPosition: function (menuPos) {
		return menuPos === "left" ? "right" : "left";
	},

	/**
	 * Sets control position if it's automanaged
	 * @param control {Control} Control
	 * @param pos {string} position to set
	 * @private
	 */
	_setControlPosition: function (control, pos) {
		if (control._alsPos)
			control.setPosition(control._alsPos + pos);
	},

	/**
	 * Called whenever layer is being showed or and object is being added.
	 *
	 * This method is for internal use only. To add behavior upon showing, override {@link L.ALS.Layer#onShow} method.
	 * @private
	 */
	_onShow: function () {
		this._leafletLayers.addTo(this.map);
		this.isShown = true;
		this._toggleControls();
	},

	/**
	 * Called whenever layer is being hidden.
	 *
	 * This method is for internal use only. To add behavior upon hiding, override {@link L.ALS.Layer#onHide} method.
	 * @private
	 */
	_onHide: function () {
		this._leafletLayers.remove();
		this.isShown = false;
		this._toggleControls();
	},


	/**
	 * Called whenever user selects this layer.
	 */
	_onSelect: function () {
		this._toggleControls();
		this.onSelect();
	},

	/**
	 * Called whenever user deselects this layer.
	 */
	_onDeselect: function () {
		this._toggleControls();
		this.onDeselect();
	},

	/**
	 * Called whenever layer is being shown
	 */
	onShow() {
	},

	/**
	 * Called whenever layer is being hidden
	 */
	onHide() {
	},

	/**
	 * Called whenever user selects this layer.
	 *
	 * If you have additional controls to display, do it here.
	 */
	onSelect: function () {
	},

	/**
	 * Called whenever user deselects this layer.
	 *
	 * If you've added additional controls, remove them here.
	 */
	onDeselect: function () {
	},

	/**
	 * Called whenever user changes this layer's name
	 */
	onNameChange: function () {
	},

	/**
	 * Adds Leaflet layers to this layer.
	 *
	 * Do NOT override!
	 *
	 * @param layers {L.Layer} Layers to add
	 */
	addLayers: function (...layers) {
		for (let layer of layers)
			this._leafletLayers.addLayer(layer);

		if (this.isShown)
			this._onShow();

		this._layerSystem._reorderLayers(); // We gotta reorder layers because Leaflet will bring lastly added layer on top.
	},

	/**
	 * Removes added Leaflet layers with its event handlers.
	 * @param layers {L.Layer} Layers to remove. If layer extends LayerGroup, will also remove Leaflet layers contained in it.
	 */
	removeLayers: function (...layers) {
		for (let layer of layers) {
			// Remove layers from the layer group
			if (layer.getLayers !== undefined) {
				let groupLayers = layer.getLayers();
				for (let l of groupLayers)
					this.removeLayers(l);
			}

			// Remove attached event listeners
			if (layer._advSysID !== undefined) {
				delete this._eventsForObjects[layer._advSysID];
				layer.clearAllEventListeners();
			}

			// Remove layer from both group and map
			this._leafletLayers.removeLayer(layer);
			layer.remove();
		}
	},

	/**
	 * Use this method instead of {@link L.ALS.Layer#initialize}
	 * @param wizardResults {Object} Results compiled from the wizard. It is an object who's keys are IDs of your controls and values are values of your controls.
	 * @param settings {SettingsObject} Current layer settings and both default and custom general settings.
	 */
	init: function (wizardResults, settings) {
	},

	/**
	 * Deletes this layer
	 * @param shouldAskUser {boolean} If set to true, the message asking if user wants to delete selected layer will be displayed. Otherwise, layer will be silently deleted.
	 * @param writeToHistory {boolean} If true, will write deletion to the history
	 */
	deleteLayer: function (shouldAskUser = false, writeToHistory = false) {
		this._layerSystem._selectLayer(this.id);
		this._layerSystem._deleteLayer(shouldAskUser, writeToHistory);
	},

	_onDelete: function () {
		for (let id in this._controls)
			this.removeControl(this._controls[id]);
		this.onDelete();
	},

	/**
	 * Called upon deletion. Here you can clean up everything you've done which can't be undone by the system (i.e., layers added directly to the map or created elements on the page)
	 */
	onDelete: function () {
	},

	// Wrappers

	/**
	 * @see FeatureGroup.setStyle
	 * @return {L.ALS.Layer} this
	 */
	setStyle: function (style) {
		this._leafletLayers.setStyle(style);
		return this;
	},

	/**
	 * @see FeatureGroup.getBounds
	 */
	getBounds: function () {
		return this._leafletLayers.getBounds();
	},

	/**
	 * @see FeatureGroup.eachLayer
	 * @return {L.ALS.Layer} this
	 */
	eachLayer: function (fn, context) {
		this._leafletLayers.eachLayer(fn, context);
		return this;
	},

	/**
	 * Sets name of this layer
	 * @param name {string} Name to set
	 */
	setName: function (name) {
		this._name = name;
		this._nameLabel.innerHTML = this._name;
		this.onNameChange();
	},

	/**
	 * @return {string} Name of this layer
	 */
	getName: function () {
		return this._name;
	},

	/**
	 * Called when layer is being exported. If you want to export more than only geometry, override this method.
	 *
	 * Default implementation is:
	 * ```JS
	 * return this._leafletLayers.toGeoJSON();
	 * ```
	 *
	 * @see L.FeatureGroup.toGeoJSON
	 */
	toGeoJSON: function () {
		return this._leafletLayers.toGeoJSON();
	},

	/**
	 * Copies settings to this layer as properties
	 * @param settings {SettingsObject} `settings` argument passed to {@link L.ALS.Layer#init}
	 * @protected
	 */
	copySettingsToThis: function (settings) {
		for (let s in settings) {
			if (s !== "skipSerialization" && s !== "skipDeserialization")
				this[s] = settings[s];
		}
	},

	/**
	 * Called whenever user updates the settings. Use it to update your layer depending on changed settings.
	 * @param settings {SettingsObject} Same as settings passed to {@link L.ALS.Layer#init}
	 */
	applyNewSettings: function (settings) {
	},

	/**
	 * Serializes some important properties. Must be called at {@link L.ALS.Layer#serialize} in any layer!
	 *
	 * Deprecated in favor of {@link L.ALS.Serializable.getObjectFromSerialized} which uses this function under-the-hood.
	 *
	 * @param serialized {Object} Your serialized object
	 *
	 * @deprecated
	 */
	serializeImportantProperties: function (serialized) {
		let props = ["_name", "isShown", "isSelected"];
		for (let prop of props)
			serialized[prop] = this[prop];
		serialized._isCollapsed = this.container.getAttribute("data-hidden") === "1";
	},


	/**
	 * Writes a record to the history. Call it at the end of each action.
	 *
	 * This method interferes with serialization and deserialization.
	 *
	 * It won't do anything, if called when serialization or deserialization hasn't finished, for example, when restoring from history.
	 */
	writeToHistory: function () {
		this._layerSystem.writeToHistory();
	},

	getObjectToSerializeTo: function (seenObjects) {
		let serialized = L.ALS.Serializable.prototype.getObjectToSerializeTo.call(this, seenObjects);
		serialized._widgets = this.serializeWidgets(seenObjects);
		this.serializeImportantProperties(serialized);
		return serialized;
	},

	/**
	 * Serializes this layer.
	 *
	 * Default implementation is:
	 * ```JS
	 * let serialized = L.ALS.Widgetable.prototype.serialize.call(this, seenObjects);
	 * this.serializeImportantProperties(serialized);
	 * return serialized;
	 * ```
	 *
	 * @param seenObjects {Object} Already seen objects
	 * @return {Object}
	 */
	serialize: function (seenObjects) {
		let serialized = L.ALS.Widgetable.prototype.serialize.call(this, seenObjects);
		this.serializeImportantProperties(serialized);
		return serialized;
	},

	statics: {

		/**
		 * Wizard class which gives a layer its initial properties
		 * @type {function(new:L.ALS.Wizard)}
		 * @memberOf L.ALS.Layer
		 */
		wizard: L.ALS.Wizard,

		/**
		 * Settings instance
		 * @type {L.ALS.Settings}
		 * @memberOf L.ALS.Layer
		 */
		settings: new L.ALS.Settings(),

		/**
		 * Deserializes some important properties. Must be called at `deserialize` in any layer!
		 * @param serialized {Object} Serialized object
		 * @param instance {L.ALS.Layer|Object} New instance of your layer
		 * @memberOf L.ALS.Layer
		 */
		deserializeImportantProperties: function (serialized, instance) {
			instance.setName(serialized._name);
			let props = ["isShown", "isSelected"];
			for (let prop of props)
				instance[prop] = serialized[prop];
			if (serialized._isCollapsed)
				instance.container.setAttribute("data-hidden", "1");
		},

		/**
		 * @see L.ALS.Serializable.deserialize
		 * @override
		 * @inheritDoc
		 * @memberOf L.ALS.Layer
		 */
		deserialize: function (serialized, layerSystem, settings, seenObjects) {
			serialized.constructorArguments = [layerSystem, serialized.constructorArguments[0], settings];
			let instance = L.ALS.Widgetable.deserialize(serialized, seenObjects);
			L.ALS.Layer.deserializeImportantProperties(serialized, instance);
			return instance;
		}
	},

});