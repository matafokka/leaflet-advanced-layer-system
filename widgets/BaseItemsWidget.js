/**
 * Defines methods for implementing widgets that can have multiple items, for example, drop-down lists and sets of radio buttons.
 * @class
 * @extends L.ALS.Widgets.BaseWidget
 */
L.ALS.Widgets.BaseItemsWidget = L.ALS.Widgets.BaseWidget.extend( /** @lends L.ALS.Widgets.BaseItemsWidget.prototype */ {

	initialize: function (id, label, callbackObject = undefined, callback = "", events) {
		L.ALS.Widgets.BaseWidget.prototype.initialize.call(this, "", id, label, callbackObject, callback, events);

		/**
		 * Currently added items
		 * @type {Set<string>}
		 * @private
		 */
		this._alsItems = new Set();
		this.serializationIgnoreList.push("_alsItems");
		this.setConstructorArguments(arguments);
	},

	/**
	 * Adds item to this widget. Parent method must be called to update internal structure and make serialization work.
	 * @param item {string} Text content of the item. Pass locale property to localize it. Use this string to access added item later.
	 * @return {L.ALS.Widgets.BaseItemsWidget} This
	 * @abstract
	 */
	addItem: function (item) {
		this._alsItems.add(item);
		return this;
	},

	/**
	 * Adds all given items to this widget.
	 * @param items {string} Items to add
	 * @return {L.ALS.Widgets.BaseItemsWidget} This
	 */
	addItems: function (...items) {
		for (let item of items)
			this.addItem(item);
		return this;
	},

	/**
	 * Removes item from this widget if it exists. Parent method must be called to update internal structure and make serialization work.
	 * @param item {string} Item to remove
	 * @return {L.ALS.Widgets.BaseItemsWidget} This
	 * @abstract
	 */
	removeItem: function (item) {
		this._alsItems.delete(item);
		return this;
	},

	/**
	 * Selects item if it exists.
	 * @param item {string} Item to select
	 * @return {L.ALS.Widgets.BaseItemsWidget} This
	 * @abstract
	 */
	selectItem: function (item) {
		return this;
	},

	/**
	 * Alias for {@link L.ALS.Widgets.BaseItemsWidget#selectItem}
	 * @param value {string} Value to set
	 * @return {L.ALS.Widgets.BaseItemsWidget} This
	 */
	setValue: function (value) {
		this.selectItem(value);
		return this;
	},

	/**
	 * @return {string} Currently selected item's name
	 * @abstract
	 */
	getValue: function () {
		return "";
	},

	serialize: function (seenObjects) {
		this._serializedItems = Array.from(this._alsItems);
		let serialized = L.ALS.Widgets.BaseWidget.prototype.serialize.call(this, seenObjects);
		serialized.selectedItem = this.getValue();
		delete this._serializedItems;
		return serialized;
	},

	statics: {
		deserialize: function (serialized, seenObjects) {
			let deserialized = L.ALS.Widgets.BaseWidget.deserialize(serialized, seenObjects);
			deserialized.addItems(...deserialized._serializedItems);
			deserialized.selectItem(serialized.selectedItem);
			delete deserialized._serializedItems;
			return deserialized;
		}
	}

});