/**
 * Simple label that displays text
 *
 * @param id {string} ID of this label
 * @param value {string} Initial text for this label
 * @param textAlign {"left"|"right"|"center"|"justify"} Initial text align
 * @param style {"nostyle"|"message"|"success"|"warning"|"error"} Style of this label
 *
 * @class
 * @extends L.ALS.Widgets.BaseWidget
 */
L.ALS.Widgets.SimpleLabel = L.ALS.Widgets.BaseWidget.extend( /** @lends L.ALS.Widgets.SimpleLabel.prototype */ {

	undoable: false,

	customWrapperClassName: "als-simple-label-wrapper",

	initialize: function (id, value ="", textAlign= "left", style="nostyle") {
		L.ALS.Widgets.BaseWidget.prototype.initialize.call(this, "", id, "");
		this.setConstructorArguments(arguments);
		this.setValue(value);
		this.setTextAlign(textAlign);
		this.setStyle(style);
	},

	toHtmlElement: function () {
		let container = this.createContainer();
		container.appendChild(this.createInput());
		return container;
	},

	createInputElement: function () {
		let element = document.createElement("div");
		element.className = "als-simple-label";
		return element;
	},

	/**
	 * Sets value of this label.
	 * @param value {string} Value to set. Pass locale property to localize the label. Pass an empty string to hide the label.
	 * @return {L.ALS.Widgets.SimpleLabel}
	 */
	setValue: function (value) {
		L.ALS.Locales.localizeOrSetValue(this.input, value);

		if (!this.container)
			return this;

		let display = "";
		if (value === "")
			display = "none";
		this.container.style.display = display;

		return this;
	},

	/**
	 * @return {string} Text of this label or locale property (if set)
	 */
	getValue: function () {
		return L.ALS.Locales.getLocalePropertyOrValue(this.input);
	},

	/**
	 * @param textAlign {"left"|"right"|"center"|"justify"} Text align
	 * @return {L.ALS.Widgets.SimpleLabel} This
	 */
	setTextAlign: function (textAlign) {
		this.input.style.textAlign = textAlign;
		return this;
	},

	/**
	 * @return {"left"|"right"|"center"|"justify"} This label's current text align
	 */
	getTextAlign: function () {
		return this.input.style.textAlign;
	},

	/**
	 * Sets style of this label
	 * @param style {"nostyle"|"message"|"success"|"warning"|"error"} Style to set
	 * @return {L.ALS.Widgets.SimpleLabel} This
	 */
	setStyle: function (style) {
		this._style = style;
		for (let s of ["message", "success", "warning", "error"])
			this.input.classList.remove(s);
		if (style === "nostyle")
			return this;
		this.input.classList.add(style);
		return this;
	},

	/**
	 * @return {"nostyle"|"message"|"success"|"warning"|"error"} This label's current style.
	 */
	getStyle: function () {
		return this._style;
	}

})