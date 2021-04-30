/**
 * Base class for all wizards. Wizards are being used to allow users to set initial layer's parameters.
 *
 * When {@link L.ALS.Layer} is being created, wizard's widgets' values are being gathered to and object where keys are widgets' IDs and values are widget values. Then the said object is being passed to {@link L.ALS.Layer#init}.
 *
 * Steps to create a wizard:
 *
 * 1. Extend this class.
 * 1. Set {@link L.ALS.Wizard#displayName} property to whatever string you want to present to the user.
 * 1. Override {@link L.ALS.Wizard#initialize}
 * 1. Add some widgets using {@link L.ALS.Wizard#addWidget} and {@link L.ALS.Wizard#addWidgets} methods.
 * 1. Set {@link L.ALS.Layer.wizard} property of your layer to an instance of your wizard.
 *
 * @class
 * @extends L.ALS.Widgetable
 */
L.ALS.Wizard = L.ALS.Widgetable.extend( /** @lends L.ALS.Wizard.prototype */ {

	/**
	 * Name of the layer type that will be displayed in the wizard window. You can use locale property to localize it.
	 * @type {string}
	 * @readonly
	 */
	displayName: "layerWizardName",

	initialize: function () {
		L.ALS.Widgetable.prototype.initialize.call(this);
	}
});