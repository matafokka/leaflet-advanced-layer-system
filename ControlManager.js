/**
 * Class with abilities of automatic control management.
 *
 * {@link L.ALS.Layer} and {@link L.ALS.System} extends this class. Both support automatic position,
 * but {@link L.ALS.Layer} also implements automatic control showing and hiding when the layer is selected or deselected.
 *
 * It's generally a good thing to manage all controls through this class to maintain a uniform look.
 *
 * @class
 * @extends L.Class
 */
L.ALS.ControlManager = L.Class.extend(/** @lends L.ALS.ControlManager.prototype */{

	/**
	 * Indicates whether controls of this layer are shown
	 * @type {boolean}
	 * @protected
	 */
	_controlsShown: true,

	initialize: function (layerSystem) {
		if (this.serializationIgnoreList)
			this.serializationIgnoreList.push("_controls", "layerSystem");

		this.layerSystem = layerSystem;
		this.map = this.layerSystem.map;

		/**
		 * Contains controls added to this layer
		 * @type {Object}
		 * @private
		 */
		this._controls = {};

		for (let pos of ["left", "right"])
			document.addEventListener(`als-set-menu-to-${pos}`, () => this._updateControlsPosition(pos));
	},

	/**
	 * Adds control to this object. This control will be managed automatically.
	 * @param control {Control} Control to add
	 * @param automanagePosition {"top"|"bottom"|undefined} When toolbar is enabled, users can move menu to left or right. It's always good to make controls always visible by moving it to the different side. ALS can do it for you, just set this argument to "top" or "bottom" to display control at the top or bottom side respectively. Or leave it as undefined, and ALS will not override control's position. This argument doesn't take effect when toolbar is disabled or user's device is a phone.
	 * @param positionOnMobile {"topleft"|"topright"|"bottomleft"|"bottomright"|"follow-menu"|undefined} Sets control position on mobile devices, if previous argument is used. Leave it as undefined, and ALS will not override control's position on mobile devices. If `"follow-menu"` is used *(which is recommended since both menu and controls will be at the comfortable position)*, control will have `automanagePosition` and follow the menu side. This argument doesn't take effect when toolbar is disabled or user's device is a desktop.
	 */
	addControl: function (control, automanagePosition = undefined, positionOnMobile = undefined) {
		if (!control._alsId)
			control._alsId = L.ALS.Helpers.generateID();
		this._controls[control._alsId] = control;

		if (this.layerSystem._toolbarEnabled && automanagePosition) {
			let setInitialPosition = () => {
				control._alsPos = automanagePosition;
				this._setControlPosition(control);
			}

			if (!L.ALS.Helpers.isMobile)
				setInitialPosition();
			else if (positionOnMobile) {
				if (positionOnMobile === "follow-menu") {
					control._alsFollowMenu = true;
					setInitialPosition();
				} else
					control.setPosition(positionOnMobile);
			}
		}

		if (this._controlsShown)
			control.addTo(this.map);
	},

	/**
	 * Removes control from this object
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
	 * Updates controls positions
	 * @param pos {"left"|"right"} New position
	 * @private
	 */
	_updateControlsPosition: function (pos) {
		for (let id in this._controls)
			this._setControlPosition(this._controls[id], pos);
	},

	/**
	 * Sets control position if it's automanaged
	 * @param control {Control} Control
	 * @param pos {string|undefined} Current menu position. If not set, L.ALS.generalSettings.menuPosition will be used.
	 * @private
	 */
	_setControlPosition: function (control, pos = undefined) {
		if (L.ALS.Helpers.isIElte9 && control._alsPos) {
			control.setPosition(control._alsPos + "right");
			return;
		}

		pos = pos || L.ALS.generalSettings.menuPosition;

		if (!control._alsFollowMenu)
			pos = pos === "left" ? "right" : "left";

		if (control._alsPos)
			control.setPosition(control._alsPos + pos);
	},

})