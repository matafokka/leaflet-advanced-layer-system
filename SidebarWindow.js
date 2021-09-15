const debounce = require("debounce");

/**
 * A sidebar window similar to the settings and wizard windows.
 *
 * It's based on items. Each item is {@link L.ALS.Widgetable}. Its name will be displayed in the sidebar (or a drop-down menu, if viewport is too narrow). User can switch between the items.
 *
 * **Note**: All widget-related methods from {@link L.ALS.Widgetable} won't work here.
 *
 * @param sidebarTitle {string} Title of the sidebar. Pass locale property to localize it.
 * @param contentTitle {string} Title of the content. Pass locale property to localize it.
 * @param button {Element|undefined} Button which will activate this window. Don't pass anything if you'll add this functionality later.
 *
 * @class
 * @extends L.ALS.WidgetableWindow
 * @ignore
 */
L.ALS.SidebarWindow = L.ALS.WidgetableWindow.extend( /** @lends L.ALS.SidebarWindow.prototype */ {

	_maxHeight: 0,
	_sidebarWidth: 0,
	_isSidebarHidden: false,

	initialize: function (sidebarTitle, contentTitle, button = undefined) {
		L.ALS.WidgetableWindow.prototype.initialize.call(this, button);
		this.items = {};
		this.window.classList.add("als-sidebar-window");

		L.ALS.Helpers.HTMLToElement(`
<div class="als-sidebar-window-wrapper">
	<div class="hidden" data-id="select-container">
		<div class="als-window-sidebar-title" data-als-locale-property="${sidebarTitle}"></div>
		<select class="als-window-select"></select>
	</div>
	<div class="als-sidebar">
		<div class="als-window-sidebar-title" data-als-locale-property="${sidebarTitle}"></div>
	</div>
	<div class="als-sidebar-window-content-wrapper">
		<div class="als-window-sidebar-title" data-als-locale-property="${contentTitle}"></div>
	</div>
</div>
		`, this.window);

		this.window.appendChild(this.buttonsGroup.container);

		document.body.appendChild(this.windowContainer);

		/**
		 * Sidebar element
		 * @type {HTMLDivElement}
		 * @private
		 */
		this._sidebar = this.window.getElementsByClassName("als-sidebar")[0];

		/**
		 * Select element container
		 * @type {HTMLDivElement}
		 * @private
		 */
		this._selectContainer = this.window.querySelector("div[data-id='select-container']");

		/**
		 * Select element
		 * @type {HTMLSelectElement}
		 */
		this.select = this.window.getElementsByClassName("als-window-select")[0];

		/**
		 * Div that wraps content
		 * @type {HTMLDivElement}
		 * @private
		 */
		this._contentWrapper = this.window.getElementsByClassName("als-sidebar-window-content-wrapper")[0];
		this._contentWrapper.appendChild(this.container);

		/**
		 * Div that wraps entire window
		 * @type {HTMLDivElement}
		 */
		this._windowWrapper = this.window.getElementsByClassName("als-sidebar-window-wrapper")[0];

		this.select.addEventListener("change", (e) => {
			this.displayItem(
				L.ALS.Locales.getLocalePropertyOrValue(e.target.options[e.target.selectedIndex])
			);
		});

		let onResize = () => {
			this._showInBackgroundIfHidden(); // updateWindowHeight() will remove it

			let isTooWide = this.window.offsetWidth / 3 <= this._sidebarWidth;
			if (isTooWide && this._selectContainer.classList.contains("hidden")) {
				this._selectContainer.classList.remove("hidden");
				this._sidebar.classList.add("hidden");
				this._contentWrapper.style.display = "block";
				this._isSidebarHidden = true;
			} else if (!isTooWide && this._isSidebarHidden) {
				this._sidebar.classList.remove("hidden");
				this._selectContainer.classList.add("hidden");
				this._contentWrapper.style.display = "table-cell";
				this._isSidebarHidden = false;
			}
			this.updateWindowHeight();
		}

		window.addEventListener("resize", debounce(onResize, 200));

		/**
		 * Buttons' height
		 * @type {number}
		 * @private
		 */
		this._buttonsHeight = this.buttonsGroup.container.offsetHeight;

		/**
		 * Sidebar width
		 * @type {number}
		 * @private
		 */
		this._sidebarWidth = this._sidebar.offsetWidth;

		onResize();
	},

	/**
	 * Adds item to this window
	 * @param name {string} Name of the item or locale string
	 * @param item {L.ALS.Widgetable} Item to add
	 */
	addItem: function (name, item) {
		let option = document.createElement("option");
		L.ALS.Locales.localizeOrSetValue(option, name, "text");
		this.select.appendChild(option);

		let sidebarItem = document.createElement("div");
		sidebarItem.className = "als-button-base";
		sidebarItem.addEventListener("click", () => {
			this.displayItem(name);
		});
		L.ALS.Locales.localizeOrSetValue(sidebarItem, name);
		this._sidebar.appendChild(sidebarItem);

		let container = item.container;
		this.container.appendChild(container);

		this.items[name] = {
			container: container,
			sidebarItem: sidebarItem,
			selectItem: option,
			widgetable: item
		};

		debounce(() => { this.updateWindowHeight(); }, 200)();
	},

	/**
	 * Removes item from this window
	 * @param name {string} Name of the item to remove
	 */
	removeItem: function (name) {
		let item = this.items[name];
		if (!item)
			return;
		this.select.removeChild(item.selectItem);
		this._sidebar.removeChild(item.sidebarItem);
		this.container.removeChild(item.container);
	},

	/**
	 * Gets item's widgetable by item's name
	 * @param name {string} name of the item
	 * @return {L.ALS.Widgetable|undefined} Item's widgetable or undefined if there's no such item.
	 */
	getItem: function (name) {
		try {
			return this.items[name].widgetable;
		} catch (e) {
			return undefined;
		}
	},

	/**
	 * Displays item with given name
	 * @param name {string} Item to display
	 */
	displayItem: function (name) {
		let item = this.items[name];
		if (!item)
			return;

		item.selectItem.selected = "selected";

		for (let child of this._sidebar.children)
			child.setAttribute("data-is-selected", "0");
		item.sidebarItem.setAttribute("data-is-selected", "1");

		for (let child of this.container.children)
			child.setAttribute("data-hidden", "1");
		item.container.setAttribute("data-hidden", "0");
	},

	/**
	 * Updates window height.
	 *
	 * Call it if you update window contents dynamically.
	 */
	updateWindowHeight: function () {
		// Temporarily show window to resize it, so when it'll be opened for the first time, animation won't be choppy
		this._showInBackgroundIfHidden();

		let previousOption = this.select.options[this.select.selectedIndex];
		this._maxHeight = 0;
		this._setWindowHeight("auto");

		if (!previousOption) // If no items added
			return;

		for (let option of this.select.options) {
			option.selected = "selected";
			L.ALS.Helpers.dispatchEvent(this.select, "change");
			if (this.window.offsetHeight > this._maxHeight)
				this._maxHeight = this.window.offsetHeight;
		}
		this._setWindowHeight(this._maxHeight);
		this.displayItem(L.ALS.Locales.getLocalePropertyOrValue(previousOption));

		if (this.windowContainer.style.zIndex !== "") {
			this.windowContainer.style.zIndex = "";
			this.windowContainer.setAttribute("data-hidden", "1");
		}
	},

	/**
	 * If the window is hidden, displays it in the background to update its height
	 * @private
	 */
	_showInBackgroundIfHidden: function () {
		if (this.isHidden()) {
			this.windowContainer.style.zIndex = "-999";
			this.windowContainer.setAttribute("data-hidden", "0");
		}
	},

	/**
	 * Sets window height
	 * @param height {number|"auto"} Height to set
	 */
	_setWindowHeight: function (height) {
		let contentHeight = height;
		if (typeof height === "number") {
			let vh = window.innerHeight * ((L.ALS.Helpers.isMobile) ?  0.99 : 0.9); // 99vh for mobile and 90vh for desktop
			if (height > vh)
				height = vh;
			contentHeight = height - this._buttonsHeight + "px";
		}

		for (let prop of ["minHeight", "height"]) {
			this._windowWrapper.style[prop] = contentHeight;
			this._sidebar.style[prop] = contentHeight;
		}
	},

	/**
	 * @return {boolean} True, if this window is hidden
	 */
	isHidden: function () {
		return this.windowContainer.getAttribute("data-hidden") === "1";
	},

	/**
	 * Doesn't do anything
	 */
	addWidget: function () {},

	/**
	 * Doesn't do anything
	 */
	addWidgets: function () {},

	/**
	 * Doesn't do anything
	 */
	removeWidget: function () {},

	/**
	 * Doesn't do anything
	 */
	removeAllWidgets: function () {},

	/**
	 * Doesn't do anything
	 */
	getWidgetById: function () {},

});