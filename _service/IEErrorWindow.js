/**
 * Error window to display when user tries to load prokect in IE <= 9 and error occurs
 *
 * @class
 * @extends L.ALS.WidgetableWindow
 */
L.ALS._service.IEErrorWindow = L.ALS.WidgetableWindow.extend(/** @lends L.ALS._service.IEErrorWindow.prototype */{

	initialize: function () {
		L.ALS.WidgetableWindow.prototype.initialize.call(this);

		/**
		 * Close button
		 * @type {L.ALS.Widgets.Button}
		 */
		this.button = this.addCloseButton("close", "systemIEAdjustSettingsOkButton");
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
</div>`,
			this.container);
		this.button.callCallback();
	},

});