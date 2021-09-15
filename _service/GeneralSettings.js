/**
 * General application settings
 *
 * @param defaultLocale {string} Locale to use by default
 *
 * @class
 * @extends L.ALS.Settings
 * @ignore
 */
L.ALS._service.GeneralSettings = L.ALS.Settings.extend( /** @lends L.ALS._service.GeneralSettings.prototype */ {

	/**
	 * Light theme radio button ID
	 * @type {string}
	 * @private
	 */
	_lightTheme: "generalSettingsLightTheme",

	/**
	 * Dark theme radio button ID
	 * @type {string}
	 * @private
	 */
	_darkTheme: "generalSettingsDarkTheme",

	/**
	 * System theme radio button ID
	 * @type {string}
	 * @private
	 */
	_systemTheme: "generalSettingsSystemTheme",

	initialize: function (defaultLocale = "English") {
		L.ALS.Settings.prototype.initialize.call(this);

		// Build language widget
		let languageWidget = new L.ALS.Widgets.DropDownList("lang", "generalSettingsLanguage", this, "changeLocale");
		for (let locale in L.ALS.Locales) {
			if (L.ALS.Locales.hasOwnProperty(locale) && typeof L.ALS.Locales[locale] !== "function" && L.ALS.Locales._ignoreList.indexOf(locale) === -1)
				languageWidget.addItem(locale);
		}
		this.addWidget(languageWidget, defaultLocale);

		// Build theme widget
		let themeWidget = new L.ALS.Widgets.RadioButtonsGroup("theme", "generalSettingsTheme", this, "changeTheme").addItems(this._lightTheme, this._darkTheme);

		// Check if prefers-color-scheme supported and add system theme to the themes list
		let defaultValue = this._lightTheme;
		let mediaQuery = "(prefers-color-scheme: dark)";
		if (window.matchMedia && window.matchMedia(mediaQuery).media === mediaQuery) {
			themeWidget.addItem(this._systemTheme);

			/**
			 * Media query to detect browser's theme
			 * @type {MediaQueryList|undefined}
			 * @private
			 */
			this._systemThemeMedia = window.matchMedia(mediaQuery);
			this._systemThemeMedia.addEventListener("change", () => {
				if (themeWidget.getValue() === this._systemTheme)
					this._changeThemeWorker(this._systemTheme);
			});
			defaultValue = this._systemTheme;
		}
		this.addWidget(themeWidget, defaultValue);

		// IE9 doesn't work well with table layout. Too lazy to implement IE9-specific hack.
		if (!L.ALS.Helpers.isIElte9) {
			this.addWidget(
				new L.ALS.Widgets.RadioButtonsGroup("menuPosition", "generalSettingsMenuPosition", this, "_setMenuPosition")
					.addItems("generalSettingsMenuLeft", "generalSettingsMenuRight"),
				"generalSettingsMenuLeft"
			);
		}

		this.addWidget(new L.ALS.Widgets.Checkbox("notify", "generalSettingsNotify", this, "_changeNotifications"), true);
	},

	/**
	 * Changes application's locale
	 * @param widget {L.ALS.Widgets.DropDownList}
	 */
	changeLocale: function (widget) {
		L.ALS.Locales.changeLocale(widget.getValue());
	},

	/**
	 * Changes application's theme
	 * @param widget {L.ALS.Widgets.RadioButtonsGroup}
	 */
	changeTheme: function (widget) {
		this._changeThemeWorker(widget.getValue());
	},

	/**
	 * Actually changes theme
	 * @param value {string} Theme name to set
	 * @private
	 */
	_changeThemeWorker: function (value) {
		if (value === this._systemTheme)
			this._changeThemeWorker(this._systemThemeMedia.matches ? this._darkTheme : this._lightTheme);
		else if (value === this._darkTheme)
			document.body.classList.add("als-dark");
		else
			document.body.classList.remove("als-dark");
	},

	_setMenuPosition(widget) {
		L.ALS.Helpers.dispatchEvent(document, `als-set-menu-to-${
			widget.getValue() === "generalSettingsMenuLeft" ? "left" : "right"
		}`);
	},

	_changeNotifications: function (widget) {
		L.ALS._notifyWhenLongRunningOperationComplete = widget.getValue();
	}
})