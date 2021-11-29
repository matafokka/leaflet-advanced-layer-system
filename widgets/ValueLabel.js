/**
 * Label that displays value description, value itself and measurement units.
 *
 * For example, when given "Wall width" as description, "10" as value and "m" as measurement units, it will output text like:
 *
 * `Wall width: 10 m` - when unitsPosition set to "value"
 *
 * or
 *
 * `Wall width (m): 10` - When unitsPosition set to "description"
 *
 * This widget is useful for displaying formatted values, but working with actual values, i.e. {@link L.ALS.Widgets.ValueLabel#getValue} will return an actual number that you've set.
 *
 * @param id {string} ID of this label
 * @param description {string} Value description. Pass locale property to localize it.
 * @param units {string} Units for this label. If set to empty string, unitsPosition won't take an effect.
 * @param unitsPosition {"description"|"value"} Units position. If set to "description", units will be displayed after description. Otherwise, units will be displayed after the value.
 * @param formatNumbers {boolean} If set to true, value will be formatted using {@link L.ALS.Helpers.formatNumber}
 * @param style {"nostyle"|"message"|"success"|"warning"|"error"} Style of this label
 * @param initialValue {string} Initial value of this label
 *
 * @class
 * @extends L.ALS.Widgets.SimpleLabel
 */
L.ALS.Widgets.ValueLabel = L.ALS.Widgets.SimpleLabel.extend( /** @lends L.ALS.Widgets.ValueLabel.prototype */ {

	undoable: false,

	initialize: function (id, description, units = "", unitsPosition = "description", formatNumbers = false, style="nostyle", initialValue = "") {
		L.ALS.Widgets.SimpleLabel.prototype.initialize.call(this, id, "");
		this.setConstructorArguments(arguments);
		this.setDescription(description)
			.setFormatNumbers(formatNumbers)
			.setUnits(units)
			.setUnitsPosition(unitsPosition)
			.setStyle(style)
			.setValue(initialValue)
	},

	/**
	 * Sets description of this label
	 * @param description {string} Value description. Pass locale property to localize it.
	 * @return {L.ALS.Widgets.ValueLabel} This
	 */
	setDescription: function (description) {
		/**
		 * Description of this label
		 * @type {string}
		 * @private
		 */
		this._description = description;
		this._updateValue();
		return this;
	},

	/**
	 * @return {string} Description of this label
	 */
	getDescription: function () {
		return this._description;
	},

	/**
	 * Sets whether this label will automatically format numbers using {@link L.ALS.Helpers.formatNumber}
	 * @param formatNumbers {boolean} If true, this label will automatically format numbers.
	 * @return {L.ALS.Widgets.ValueLabel} This
	 */
	setFormatNumbers: function (formatNumbers) {
		/**
		 * Defines whether this label should format numbers
		 * @type {boolean}
		 * @private
		 */
		this._formatNumbers = formatNumbers;
		this._updateValue();
		return this;
	},

	/**
	 * @return {boolean} If true, this label automatically formats numbers.
	 */
	getFormatNumbers: function () {
		return this._formatNumbers;
	},

	/**
	 * Sets number of digits after floating point to display. Doesn't depend on {@link L.ALS.Widgets.ValueLabel#setFormatNumbers}.
	 *
	 * @param number {number|undefined} Number of digits. Pass undefined to output all numbers.
	 * @return {L.ALS.Widgets.ValueLabel} This
	 */
	setNumberOfDigitsAfterPoint: function (number) {
		this._numberOfDigitsAfterPoint = number;
		this._updateValue();
		return this;
	},

	/**
	 * @return {number|undefined} Number of digits after floating point to display or undefined, if not set
	 */
	getNumberOfDigitsAfterPoint: function () {
		return this._numberOfDigitsAfterPoint;
	},

	/**
	 * Sets value of this label. It's not an alias for {@link L.ALS.Widgets.SimpleLabel#setValue}! There's no alias for this method.
	 * @param value {string|number} Value to set. If value is a string, this widget will try to format it as a number and, if fails, will set it as is.
	 * @return {L.ALS.Widgets.ValueLabel} This
	 */
	setValue: function (value) {
		this._labelValue = value;
		this._updateValue();
		return this;
	},

	/**
	 * @return {string|number} Value of this label. It doesn't return the whole text! To get whole text, use {@link L.ALS.Widgets.ValueLabel#getActualValue}.
	 */
	getValue: function () {
		return this._labelValue;
	},

	/**
	 * Sets units for this label
	 * @param units {string} Units to set
	 * @return {L.ALS.Widgets.ValueLabel} This
	 */
	setUnits: function (units) {
		/**
		 * Units set to this label
		 * @type {string}
		 * @private
		 */
		this._units = units;
		this._updateValue();
		return this;
	},

	/**
	 * @return {string} Units set to this label
	 */
	getUnits: function () {
		return this._units;
	},

	/**
	 * Sets units position.
	 * @param position  {"description"|"value"} Units position. If set to "description", units will be displayed after description. Otherwise, units will be displayed after the value.
	 * @return {L.ALS.Widgets.ValueLabel} This
	 */
	setUnitsPosition: function (position) {
		/**
		 * Units' position set to this lable
		 * @type {"description"|"value"}
		 * @private
		 */
		this._unitsPosition = position;
		this._updateValue();
		return this;
	},

	/**
	 * @return {"description"|"value"} Units position of this label
	 */
	getUnitsPosition: function () {
		return this._unitsPosition;
	},

	/**
	 * Updates actual value of this label
	 * @private
	 */
	_updateValue: function () {
		let hasUnits = this._units !== "",
			isDescription = this._unitsPosition === "description",
			localizedValue = L.ALS.locale[this._description],
			value = (localizedValue) ? localizedValue : this._description;

		if (isDescription && hasUnits)
			value += " (" + this._units + ")";

		let parsedValue = parseFloat(this._labelValue), fValue = this._labelValue === undefined ? 0 : this._labelValue;
		if (parsedValue.toString() === fValue.toString()) {
			fValue = this._numberOfDigitsAfterPoint !== undefined ? parsedValue.toFixed(this._numberOfDigitsAfterPoint) : parsedValue;
			if (this._formatNumbers)
				fValue = L.ALS.Helpers.formatNumber(fValue);
		}

		value += ": " + fValue;

		if (!isDescription && hasUnits)
			value += " " + this._units;

		L.ALS.Widgets.SimpleLabel.prototype.setValue.call(this, value);
	},

	/**
	 * @return {string} Whole text of this label, i.e. result of {@link L.ALS.Widgets.SimpleLabel#getValue}
	 */
	getActualValue: function () {
		return L.ALS.Widgets.SimpleLabel.prototype.getValue.call(this);
	}

});