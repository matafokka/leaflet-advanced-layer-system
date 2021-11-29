/**
 * Wizard with only label that says that current layer has no starting parameters.
 *
 * Just extend this wizard and change {@link L.ALS.Wizard#displayName} like so:
 * ```
 * L.ALS.MyWizard = L.ALS.EmptyWizard.extend({
 *     displayName: "My Wizard Name",
 * });
 * ```
 * @class
 * @extends L.ALS.Wizard
 */
L.ALS.EmptyWizard = L.ALS.Wizard.extend( /** @lends L.ALS.EmptyWizard.prototype */ {
	initialize: function () {
		L.ALS.Wizard.prototype.initialize.call(this);
		this.addWidget(new L.ALS.Widgets.SimpleLabel("lbl", "wizardEmptyLabel", "center", "message"));
	}
})