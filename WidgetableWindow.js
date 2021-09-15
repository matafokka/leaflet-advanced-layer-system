/**
 * Customizable widgetable window. Creation of the window is a very slow process, so please, reuse existing windows as much as possible.
 *
 * Some important properties:
 *
 * 1. {@link L.ALS.WidgetableWindow#windowContainer} - container for the window which should be added to the page
 * 1. {@link L.ALS.WidgetableWindow#window} - actual window. It contains only one child: {@link L.ALS.Widgetable}'s container ({@link L.ALS.Widgetable#container} property). You can add custom elements to the window at {@link L.ALS.WidgetableWindow#initialize}.
 * 1. {@link L.ALS.WidgetableWindow#container} - Widgetable's container.
 *
 * @param button {Element|undefined} Button which will activate this window. Don't pass anything if you'll add this functionality later.
 *
 * @class
 * @extends L.ALS.Widgetable
 */
L.ALS.WidgetableWindow = L.ALS.Widgetable.extend( /** @lends L.ALS.WidgetableWindow.prototype */ {

	initialize: function (button = undefined) {
		L.ALS.Widgetable.prototype.initialize.call(this, "als-window-content");
		this.setConstructorArguments(arguments);

		/**
		 * Container for the window which should be added to the page
		 * @type {HTMLDivElement}
		 */
		this.windowContainer = document.createElement("div");
		this.windowContainer.className = "als-window-background";

		/**
		 * Window which contains Widgetable's container
		 * @type {HTMLDivElement}
		 */
		this.window = document.createElement("div");
		this.window.className = "als-window-window";

		this.window.appendChild(this.container);
		this.windowContainer.appendChild(this.window);

		/**
		 * Button group for this window
		 * @protected
		 */
		this.buttonsGroup = new L.ALS.Widgets.ButtonsGroup("i");
		this.buttonsGroup.container.classList.add("als-window-button-container", "als-items-row");
		this.buttonsGroup.container.classList.remove("als-widget-row");
		this.window.appendChild(this.buttonsGroup.container);

		if (button)
			this.bindButton(button)
	},

	/**
	 * @return {L.ALS.Widgets.ButtonsGroup} Buttons group to which you can add your own buttons
	 */
	getButtonsGroup: function () {
		return this.buttonsGroup;
	},

	/**
	 * Adds close button to this window. You should add this button after you've added all your own buttons.
	 * @param id {string} Button ID
	 * @param text {string} Button label
	 * @param icon {string} Button icon - a RemixIcon class.
	 * @param callbackObject {Object|L.ALS.Serializable} Just pass "this". If you plan to use serialization, this object MUST be instance of L.ALS.Serializable.
	 * @param callback {string} Name of a method of callbackObject that will be called when button will be pressed.
	 * @return {L.ALS.Widgets.Button} Added button
	 */
	addCloseButton: function (id, text, icon = "ri-close-line", callbackObject, callback) {
		let button = new L.ALS.Widgets.Button(id, text, callbackObject, callback).setMobileIcon(icon);
		this.bindButton(button.input);
		this.buttonsGroup.addButton(button);
		return button;
	},

	/**
	 * Binds a button that will open and close this window
	 * @param button {HTMLElement} Button to bind
	 */
	bindButton: function (button) {
		L.ALS.Helpers.makeHideable(button, this.windowContainer, () => {
			document.body.classList.remove("als-no-scroll");
		}, () => {
			document.body.classList.add("als-no-scroll");
		}, false);
	}
});