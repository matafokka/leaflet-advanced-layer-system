/**
 * Wizard window
 *
 * @param button {Element} Button which will activate this window
 *
 * @class
 * @extends L.ALS.SidebarWindow
 * @ignore
 */
L.ALS._service.WizardWindow = L.ALS.SidebarWindow.extend( /** @lends L.ALS._service.WizardWindow.prototype */ {

	initialize: function (button, onAddCallback) {
		L.ALS.SidebarWindow.prototype.initialize.call(this, "wizardSelectTitle", "wizardContentTitle", button);
		this.select.classList.add("als-wizard-menu");

		this.addCloseButton("close", "sidebarWindowCancelButton");
		let addButton = this.addCloseButton("add", "wizardAddButton", "ri-check-line");
		addButton.input.addEventListener("click", onAddCallback);
	}
});