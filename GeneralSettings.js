/**
 * General application settings. Parent constructor should be immediately called in constructor of your custom child class
 *
 * @param defaultLocale {string} Locale to use by default. Just pass it to the parent constructor
 *
 * @class
 * @extends L.ALS.Settings
 */
L.ALS.GeneralSettings = L.ALS.Settings.extend( /** @lends L.ALS._service.GeneralSettings.prototype */ {

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

	/**
	 * Current theme. Updated by general settings, should be passed to all other settings.
	 * @type {"light"|"dark"}
	 * @private
	 */
	_currentTheme: "light",

	/**
	 * Current menu position. Updated by general settings, should be passed to all other settings.
	 */
	_currentMenuPosition: "left",

	initialize: function (defaultLocale = "English") {
		L.ALS.Settings.prototype.initialize.call(this);
		this.widgetsIgnoreList.push("lang", "theme", "menuPosition", "notify");

		// Build language widget
		let languageWidget = new L.ALS.Widgets.DropDownList("lang", "generalSettingsLanguage", this, "_changeLocale");
		for (let locale in L.ALS.Locales) {
			if (L.ALS.Locales.hasOwnProperty(locale) && typeof L.ALS.Locales[locale] !== "function" && L.ALS.Locales._ignoreList.indexOf(locale) === -1)
				languageWidget.addItem(locale);
		}
		this.addWidget(languageWidget, defaultLocale);

		// Build theme widget
		let themeWidget = new L.ALS.Widgets.RadioButtonsGroup("theme", "generalSettingsTheme", this, "_changeTheme").addItems(this._lightTheme, this._darkTheme);

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

			const onThemeChange = () => {
				if (themeWidget.getValue() === this._systemTheme)
					this._changeThemeWorker(this._systemTheme);
			}

			if (this._systemThemeMedia.addEventListener)
				this._systemThemeMedia.addEventListener("change", onThemeChange);
			else
				this._systemThemeMedia.addListener(onThemeChange);

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
	 * @private
	 */
	_changeLocale: function (widget) {
		L.ALS.Locales.changeLocale(widget.getValue());
	},

	/**
	 * Changes application's theme
	 * @param widget {L.ALS.Widgets.RadioButtonsGroup}
	 * @private
	 */
	_changeTheme: function (widget) {
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
		else if (value === this._darkTheme) {
			document.body.classList.add("als-dark");
			this._currentTheme = "dark";
		}
		else {
			document.body.classList.remove("als-dark");
			this._currentTheme = "light";
		}
		L.ALS.generalSettings.theme = this._currentTheme; // Update general settings object
	},

	_setMenuPosition(widget) {
		this._currentMenuPosition = widget.getValue() === "generalSettingsMenuLeft" ? "left" : "right";
		L.ALS.Helpers.dispatchEvent(document, `als-set-menu-to-${this._currentMenuPosition}`);
		L.ALS.generalSettings.menuPosition = this._currentMenuPosition; // Update general settings object
	},

	_changeNotifications: function (widget) {
		L.ALS.generalSettings.notifyWhenLongRunningOperationComplete = widget.getValue();
	},

	_onApply: function () {
		this._writeSettings(L.ALS.generalSettings);
		this.onApply();
	},

	/**
	 * Called when user clicks "Apply" button.
	 */
	onApply: function () {
	},

	getSettings: function () {
		return L.ALS.generalSettings;
	}
})