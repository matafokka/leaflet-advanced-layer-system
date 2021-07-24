/**
 * A loading window for long-running operations. Use {@link L.ALS.OperationsWindow#addOperation} and {@link L.ALS.OperationsWindow#removeOperation} to add and remove operation descriptions.
 *
 * This window will be shown when the first item is added and closed when last item is removed.
 *
 * This window doesn't provide any label like "List of running operations:", so make your descriptions verbose.
 *
 * Don't use this class directly, use its instance at {@link L.ALS.operationsWindow}!
 *
 * @class
 * @extends L.ALS.WidgetableWindow
 */
L.ALS.OperationsWindow = L.ALS.WidgetableWindow.extend( /** @lends L.ALS.OperationsWindow.prototype */ {

	initialize: function () {
		L.ALS.WidgetableWindow.prototype.initialize.call(this);
		let loadingContainer = document.createElement("div");
		loadingContainer.className = "als-loading-container";
		let loading = document.createElement("div");
		loading.className = "als-loading";
		loadingContainer.appendChild(loading);
		this.window.appendChild(loadingContainer);
		this.windowContainer.setAttribute("data-hidden", "1");
	},

	/**
	 * Adds a new operation to this window
	 * @param id {string} ID of an operation. Pass it to {@link L.ALS.OperationsWindow#removeOperation} to remove this operation when it's complete.
	 * @param text {string} An operation description. Pass locale property to localize it.
	 */
	addOperation: function (id, text) {
		this.addWidget(new L.ALS.Widgets.SimpleLabel(id, text, "center"));
		this.windowContainer.setAttribute("data-hidden", "0");
	},

	/**
	 * Removes an operation with given ID.
	 * @param id {string} ID of an operation to remove
	 */
	removeOperation: function (id) {
		this.removeWidget(id);
		if (this.container.children.length === 0) {
			this.windowContainer.setAttribute("data-hidden", "1");
			if (L.ALS._notifyWhenLongRunningOperationComplete)
				window.alert(L.ALS.locale.systemOperationsComplete);
		}
	},

});