/**
 * Application settings window
 *
 * @class
 * @extends L.ALS.SidebarWindow
 * @ignore
 */
L.ALS._service.SettingsWindow = L.ALS.SidebarWindow.extend( /** @lends L.ALS._service.SettingsWindow.prototype */ {

	initialize: function (button, onCloseCallback, aboutHTML = undefined) {
		L.ALS.SidebarWindow.prototype.initialize.call(this, "settingsSelectTitle", "settingsContentTitle", button);

		/**
		 * Contains callbacks that will be called when settings are applied
		 * @type {Function[]}
		 */
		this.onCloseCallbacks = [];

		this.onCloseCallbacks.push(onCloseCallback);

		// Create "About" section
		if (!aboutHTML)
			aboutHTML = require("./aboutMarkup.js");

		this.aboutWidgetable = new L.ALS.Widgetable("als-about-container");
		let wrapper = document.createElement("div");
		wrapper.className = "als-about-wrapper";
		this.aboutWidgetable.container.appendChild(wrapper);

		L.ALS.Helpers.HTMLToElement(aboutHTML, wrapper);

		this.buttonsGroup.addButtons(
			new L.ALS.Widgets.Button("export", "settingsExportButton", this, "exportSettings").setMobileIcon("ri-download-2-line"),
			new L.ALS.Widgets.Button("import", "settingsImportButton", this, "importSettings").setMobileIcon("ri-folder-open-line"),
		);
		this.addCloseButton("close", "settingsApplyButton", "ri-save-3-line", this, "saveSettings");

		this._importSettingsButton = document.getElementById("als-load-settings-input");
		this._importSettingsButton.addEventListener("change", () => {
			L.ALS.Helpers.readTextFile(this._importSettingsButton, L.ALS.locale.settingsLoadingNotSupported, (text) => {

				let json;
				try { json = JSON.parse(text); }
				catch (e) {
					window.alert(L.ALS.locale.settingsImportError);
					return;
				}

				this.forEachWidget((item, widget, key) => {
					if (json[key])
						this.setWidgetValue(item, widget, json[key])
				});
			});
			this.updateWindowHeight();
		});
	},

	addItem: function (name, item) {
		L.ALS.SidebarWindow.prototype.addItem.call(this, name, item);
		if (name === "settingsAboutItem")
			return;

		for (let i in item._widgets) {
			if (!item._widgets.hasOwnProperty(i))
				continue;

			let widget = item._widgets[i];
			if (!widget.undoable)
				continue;

			let button = document.createElement("i");
			button.className = "ri ri-arrow-go-back-line als-revert-button";
			L.ALS.Locales.localizeElement(button, "settingsRevertButton", "title");
			widget._getContainerForRevertButton().appendChild(button);

			button.addEventListener("click", () => {
				widget.setValue(widget._defaultSettingsValue);
				widget.callCallback();
			});

			L.ALS.Helpers.dispatchEvent(button, "click");
		}
		this.removeItem("settingsAboutItem");
		this.addItem("settingsAboutItem", this.aboutWidgetable);
		this.restoreSettingsFromStorage();
	},

	/**
	 * Saves settings
	 */
	saveSettings: function () {
		this.forEachWidget((item, widget, key, value) => {
			L.ALS.Helpers.localStorage.setItem(key, value);
		});
		for (let cb of this.onCloseCallbacks)
			cb();
	},

	/**
	 * Saves settings as a text file. Being called when user presses the button.
	 */
	exportSettings: function () {
		let json = {};
		this.forEachWidget((item, widget, key, value) => {
			json[key] = value;
		});
		L.ALS.Helpers.saveAsText(JSON.stringify(json), L.ALS._service.filePrefix + "Settings.json");
	},

	/**
	 * Imports settings from a text file. Being called when user presses the button.
	 */
	importSettings: function () {
		L.ALS.Helpers.dispatchEvent(this._importSettingsButton, "click");
	},

	/**
	 * Loops through each widget and calls given callback
	 * @param callback {function(string, string, string, *)} Callback to call
	 */
	forEachWidget: function (callback) {
		for (let name in this.items) {
			if (name === "settingsAboutItem")
				continue;

			let item = this.items[name].widgetable;
			let sectionPart = name + "|";
			for (let w in item._widgets) {
				if (item._widgets.hasOwnProperty(w))
					callback(name, w, sectionPart + w, item._widgets[w].getValue());
			}
		}
	},

	/**
	 * Restores settings from local storage when app's being loaded
	 */
	restoreSettingsFromStorage: function () {
		this.forEachWidget((item, widget, key) => {
			let newValue = L.ALS.Helpers.localStorage.getItem(key);
			if (newValue)
				this.setWidgetValue(item, widget, newValue)
		});
		this.updateWindowHeight();
	},

	/**
	 * Sets widget's value
	 * @param item {string} Name of the item (widgetable)
	 * @param widget {string} Name of the widget in the item
	 * @param value {*} Value to set
	 */
	setWidgetValue: function (item, widget, value) {
		let w;
		try {
			w = this.getItem(item).getWidgetById(widget);
		} catch (e) {
			return;
		}

		w.setValue(value);
		w.callCallback();
	}

});