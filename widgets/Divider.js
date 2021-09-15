/**
 * A vertical divider
 *
 * @param id {string} ID of this widget
 *
 * @class
 * @extends L.ALS.Widgets.BaseWidget
 */
L.ALS.Widgets.Divider = L.ALS.Widgets.BaseWidget.extend( /** @lends L.ALS.Widgets.Divider.prototype */ {

	undoable: false,

	customContainerClassName: "als-divider",

	initialize: function (id) {
		L.ALS.Widgets.BaseWidget.prototype.initialize.call(this, "", id, "");
		this.setConstructorArguments(id);
	},

	toHtmlElement: function () {
		let container = this.createContainer();
		return container;
	}
});