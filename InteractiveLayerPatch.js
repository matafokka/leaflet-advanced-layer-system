/**
 * Sets this layer to be interactive or not.
 * @param interactive {boolean} If true, this layer will be interactive. Otherwise layer will be static.
 * @author Piero "Jadaw1n" Steinger. Home page: https://github.com/Jadaw1n
 * @instance
 * @memberOf L.Layer
 */
L.Layer.prototype.setInteractive = function (interactive) {
	if (this.eachLayer) {
		this.eachLayer((layer) => layer.setInteractive(interactive));
		return;
	}

	if (!this._path)
		return;

	this.options.interactive = interactive;
	L.DomUtil[interactive ? "addClass" : "removeClass"](this._path, "leaflet-interactive");
};

/**
 * @return {boolean} True, if this layer is interactive. False otherwise.
 * @instance
 * @memberOf L.Layer
 */
L.Layer.prototype.getInteractive = function () {
	return this.options.interactive;
}

/**
 * Alias for @{link L.Layer.getInteractive}
 * @return {boolean} True, if this layer is interactive. False otherwise.
 * @instance
 * @memberOf L.Layer
 */
L.Layer.prototype.isInteractive = function () {
	return this.getInteractive();
}