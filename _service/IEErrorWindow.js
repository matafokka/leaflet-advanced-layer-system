/**
 * Error window to display when user tries to load prokect in IE <= 9 and error occurs
 *
 * @class
 * @extends L.ALS.WidgetableWindow
 */
L.ALS._service.IEErrorWindow = L.ALS.WidgetableWindow.extend(/** @lends L.ALS._service.IEErrorWindow.prototype */{

	initialize: function () {
		this._button = document.createElement("div");
		this._button.className = "als-button-base";
		this._button.setAttribute("data-als-locale-property", "systemIEAdjustSettingsOkButton");

		L.ALS.WidgetableWindow.prototype.initialize.call(this, this._button);
		L.ALS.Helpers.HTMLToElement(`

<div class="als-ie-project-error">
	<p data-als-locale-property="systemIEAdjustSettings1"></p>
	<ol>
		<li data-als-locale-property="systemIEAdjustSettings2"></li>
		<li data-als-locale-property="systemIEAdjustSettings3"></li>
		<li data-als-locale-property="systemIEAdjustSettings4"></li>
		<li data-als-locale-property="systemIEAdjustSettings5"></li>
		<ol>
			<li data-als-locale-property="systemIEAdjustSettings6"></li>
			<li data-als-locale-property="systemIEAdjustSettings7"></li>
		</ol>
		<li data-als-locale-property="systemIEAdjustSettings8"></li>
	</ol>
</div>

<div class="als-items-row als-sidebar-window-button-container" data-id="button-container">
</div>

		`, this.container);

		this.container.querySelector("div[data-id='button-container']").appendChild(this._button);
	},

	clickButton: function () {
		L.ALS.Helpers.dispatchEvent(this._button, "click");
	}

});