/**
 * Custom zoom control which matches ALS aesthetics.
 *
 * By default, it's horizontal. To make it vertical, pass `vertical: true` option like so:
 *
 * ```
 * let zoomControl = new l.ALS.ControlZoom({
 *     // Your other options such as position...
 *     vertical: true, // Make it vertical
 * });
 * ```
 *
 * @class
 * @extends L.Control
 */
L.ALS.ControlZoom = L.Control.extend( /** @lends L.ALS.ControlZoom.prototype */{

	onAdd: function (map) {
		let minusButton = document.createElement("i");
		minusButton.className = "als-button-base icon-button ri ri-zoom-out-line";
		minusButton.addEventListener("click", () => {
			map.zoomOut();
		});

		let plusButton = document.createElement("i");
		plusButton.className = "als-button-base icon-button ri ri-zoom-in-line";
		plusButton.addEventListener("click", () => {
			map.zoomIn();
		});

		let buttonOrder, className;
		if (this.options.vertical) {
			buttonOrder = [plusButton, minusButton];
			className = "als-zoom-vertical";
		} else {
			buttonOrder = [minusButton, plusButton];
			className = "als-zoom-horizontal";
		}

		let container = document.createElement("div");
		container.className = `leaflet-bar leaflet-control als-zoom ${className}`;

		for (let button of buttonOrder)
			container.appendChild(button);

		return container;
	}

});