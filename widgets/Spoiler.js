/**
 * A spoiler - group of widgets that can be collapsed or expanded
 *
 * @param id {string} ID of this input. You can select this object using this ID.
 * @param label {string} Label for this input. Pass locale property to localize the label.
 *
 * @class
 * @extends L.ALS.Widgets.BaseWidget
 * @mixes L.ALS.Widgetable
 */
L.ALS.Widgets.Spoiler = L.ALS.Widgets.BaseWidget.extend( /** @lends L.ALS.Widgets.Spoiler.prototype */ {

	includes: L.ALS.Widgetable.prototype,

	customContainerClassName: "als-spoiler-container",

	initialize: function (id, label) {
		L.ALS.Widgetable.prototype.initialize.call(this);
		L.ALS.Widgets.BaseWidget.prototype.initialize.call(this, "", id, label);
		this.setConstructorArguments(arguments);

		this.wrapper = document.createElement("div");
		this.wrapper.className = "als-spoiler-wrapper";
		this.wrapper.setAttribute("data-hidden", "0")
		this.container.appendChild(this.wrapper);
		L.ALS.Helpers.makeCollapsible(this.buttonElement, this.wrapper);
	},

	toHtmlElement: function () {
		let container = this.createContainer();

		this.buttonElement = document.createElement("div");
		this.buttonElement.className = "als-button-base als-spoiler-button";

		this.buttonElement.appendChild(this.createLabel());

		let showHide = document.createElement("div");
		showHide.textContent = "⇕";
		this.buttonElement.appendChild(showHide);

		container.appendChild(this.buttonElement);

		return container;
	},

	/**
	 * Adds widget to this spoiler
	 * @param widget {L.ALS.Widgets.BaseWidget} Widget to add
	 * @return {L.ALS.Widgets.Spoiler} This
	 */
	addWidget: function (widget) {
		L.ALS.Widgetable.prototype.addWidget.call(this, widget);
		this.wrapper.appendChild(widget.container);
		return this;
	},

	/**
	 * Adds widgets to this spoiler
	 *
	 * @param {L.ALS.Widgets.BaseWidget} widgets Widgets to add
	 * @return {L.ALS.Widgets.Spoiler} This
	 */
	addWidgets: function (...widgets) {
		for (let widget of widgets)
			this.addWidget(widget);
		return this;
	},

	serialize: function (seenObjects) {
		return L.ALS.Widgetable.prototype.serialize.call(this, seenObjects);
	},

	/**
	 * Re-adds all widgets after deserialization
	 * @private
	 */
	_readdWidgets: function () {
		for (let id in this._widgets) {
			let widget = this._widgets[id];
			if (widget instanceof L.ALS.Widgets.BaseWidget)
				this.addWidget(widget);
		}
	},

	statics: {
		deserialize: function (serialized, seenObjects) {
			let deserialized = L.ALS.Widgets.BaseWidget.deserialize(serialized, seenObjects);
			deserialized._readdWidgets();
			return deserialized;
		}
	}

});