/**
 * A group of buttons that will be nicely wrapped if user's browser supports flexboxes or will be displayed as a single column in other browsers.
 *
 * @param id {string} ID of this widget
 *
 * @class
 */
L.ALS.Widgets.ButtonsGroup = L.ALS.Widgets.BaseWidget.extend( /** @lends L.ALS.Widgets.ButtonsGroup.prototype */ {

	customContainerClassName: "als-buttons-group-wrapper",

	initialize: function (id) {
		L.ALS.Widgets.BaseWidget.prototype.initialize.call(this, "", id, "");

		/**
		 * Maps buttons' IDs to buttons themselves
		 * @type {Object<string, L.ALS.Widgets.Button>}
		 * @private
		 */
		this._items = {};
	},

	toHtmlElement: function () {
		let container = this.createContainer();
		return container;
	},

	/**
	 * Adds a button to this group.
	 * @param button {L.ALS.Widgets.Button} Button to add
	 * @return {L.ALS.Widgets.ButtonsGroup} This
	 */
	addButton: function (button) {
		this.container.appendChild(button.container);
		this._items[button.id] = button;
		button._isAdded = true;
		return this;
	},

	/**
	 * Adds buttons to this group
	 * @param buttons {L.ALS.Widgets.Button} Buttons to add
	 * @return this;
	 */
	addButtons: function (...buttons) {
		for (let button of buttons)
			this.addButton(button);
		return this;
	},

	/**
	 * Finds and returns button in this group
	 * @param buttonId {string} Button's ID
	 * @return {L.ALS.Widgets.Button} Found button or undefined if there's no specified button
	 */
	getButton: function (buttonId) {
		return this._items[buttonId];
	},

	/**
	 * Removes given button
	 * @param buttonId {string} Button's ID to remove
	 * @return {L.ALS.Widgets.ButtonsGroup} This
	 */
	removeButton: function (buttonId) {
		this.container.removeChild(this._items[buttonId]);
		delete this._items[buttonId];
		return this;
	},

});