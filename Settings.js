/**
 * Base class for all settings.
 *
 * It works the same way as {@link L.ALS.Wizard}s.
 *
 * Start by adding some widgets using {@link L.ALS.Settings#addWidget} method (note: {@link L.ALS.Settings#addWidgets} doesn't do anything).
 *
 * Settings will be passed to {@link L.ALS.Layer#applyNewSettings} and to {@link L.ALS.Layer#init} methods of your layer the same way as wizard results: you'll receive an object where keys are widgets' IDs and values are widgets' values.
 *
 * @class L.ALS.Settings
 * @extends L.ALS.Widgetable
 */
L.ALS.Settings = L.ALS.Widgetable.extend( /** @lends L.ALS.Settings.prototype */ {

	initialize: function () {
		L.ALS.Widgetable.prototype.initialize.call(this);

		/**
		 * Widgets' IDs to ignore when calling {@link L.ALS.Settings#getSettings}
		 * @type {string[]}
		 */
		this.widgetsIgnoreList = [];
	},

	/**
	 * Adds widget to this widgetable
	 * @param widget {L.ALS.Widgets.BaseWidget} Widget to add
	 * @param defaultValue {*} Value that will be set to the widget when user will press revert button
	 * @return {L.ALS.Settings} This
	 */
	addWidget: function (widget, defaultValue) {
		widget._defaultSettingsValue = defaultValue;
		L.ALS.Widgetable.prototype.addWidget.call(this, widget);
		return this;
	},

	/**
	 * Does nothing, just call {@link L.ALS.Settings#addWidget} multiple times
	 * @return {L.ALS.Settings} This
	 */
	addWidgets: function() {
		return this;
	},

	/**
	 * @return {SettingsObject} Settings as {widgetID: widgetValue} pairs
	 */
	getSettings: function () {
		return this._writeSettings({generalSettings: L.ALS.generalSettings});
	},

	/**
	 * Gathers and writes settings to the specified object
	 * @param object
	 * @protected
	 */
	_writeSettings: function (object) {
		object.skipSerialization = true;
		object.skipDeserialization = true;
		for (let w in this._widgets) {
			if (this._widgets.hasOwnProperty(w) && this.widgetsIgnoreList.indexOf(w) === -1)
				object[w] = this._widgets[w].getValue();
		}
		return object;
	}
});