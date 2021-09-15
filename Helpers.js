const JSZip = require("jszip");
const saveAs = require("file-saver");

// For some reason, in Chrome 7 this throws: Uncaught ReferenceError: Promise is not defined
// Despite that there's window.Promise, and everything's polyfilled correctly
let chromeFS;
try {
	chromeFS = require("browser-fs-access");
} catch (e) {
	chromeFS = {supported: false};
}

/**
 * Contains helper methods and properties
 * @namespace
 */
L.ALS.Helpers = {

	/**
	 * Dispatches event of given type to given object.
	 * @param object {Object} Object to dispatch event to
	 * @param type {string} Type of event
	 */
	dispatchEvent: function (object, type) {
		// Dispatching click events may not work in modern browsers
		if (type === "click" && object.click) {
			object.click();
			return;
		}

		let event = document.createEvent("Event");
		event.initEvent(type, true, true);
		object.dispatchEvent(event);
	},

	/**
	 * Formats number to more readable format by inserting spaces
	 * @param number {number | string} Number to format
	 * @return {string} Formatted number
	 */
	formatNumber: function (number) {
		let numberString = number.toString();
		let finalString = "", fraction = "", repeats = 0;
		for (let i = numberString.length - 1; i >= 0; i--) {
			let symbol = numberString[i];

			if (symbol === ".") {
				finalString = "." + fraction;
				repeats = 0;
				continue;
			}

			if (repeats === 3) {
				finalString = " " + finalString;
				repeats = 0;
			}

			finalString = symbol + finalString;
			fraction = symbol + fraction;
			repeats++;
		}
		return finalString;
	},

	/**
	 * Generates random and unique ID
	 * @return {string} Generated ID
	 */
	generateID: function () {
		return "_" + Math.random() + "_" + Date.now();
	},

	/**
	 * Checks if given object is empty
	 * @param object {Object} Object to check
	 * @return {boolean} True, if object is empty. False otherwise.
	 */
	isObjectEmpty: function (object) {
		for (let prop in object) {
			if (object.hasOwnProperty(prop))
				return false;
		}
		return true;
	},

	/**
	 * Merges two options into one object without modifying them. It checks if property is present in the `defaultOptions`, `defaultOptions` should contain ALL the needed properties.
	 * @param defaultOptions {Object} Object containing all default options
	 * @param newOptions {Object} Options passed by the user
	 * @return {Object} Object containing merged properties of two given objects
	 */
	mergeOptions: require("./_service/mergeOptions.js"),

	/**
	 * Finds extension of the given filename, i.e. part after last dot.
	 * @param filename {string} Filaname
	 * @return {string} Extension
	 */
	getFileExtension: function (filename) {
		let ext = "", i = filename.length;
		while (i--) {
			let symbol = filename[i];
			if (symbol === ".")
				break;
			ext = symbol + ext;
		}
		return ext;
	},

	/**
	 * Makes button hide or show element on click. Both button and element will have attribute "data-hidden" equal to 0 or 1.
	 * @param button {Element} Button that will control visibility of the element.
	 * @param element {Element} Element that will be controlled
	 * @param onHideCallback {function} Function to call on hiding
	 * @param onShowCallback {function} Function to call on showing
	 * @param clickAfter {boolean} If true, button will be clicked after all the things will be applied. You may want to set it to false if your callbacks affects unfinished stuff.
	 */
	makeHideable: function (button, element = undefined, onHideCallback = undefined, onShowCallback = undefined, clickAfter = true) {
		let dataHidden = "data-hidden";
		let e = !element ? button : element;

		if (!e.hasAttribute(dataHidden))
			e.setAttribute(dataHidden, "1");

		button.addEventListener("click", function () {
			let newValue, callback;
			if (e.getAttribute(dataHidden) === "1") {
				newValue = "0";
				callback = onShowCallback;
			} else {
				newValue = "1";
				callback = onHideCallback;
			}
			e.setAttribute(dataHidden, newValue);

			if (callback !== undefined)
				callback();
		});
		if (clickAfter)
			L.ALS.Helpers.dispatchEvent(button, "click");
	},

	/**
	 * Makes an element collapsible with an animation.
	 * @param button {HTMLElement} Button that will show or collapse an element
	 * @param element {HTMLElement} Element to make collapsible
	 * @param clickAfter {boolean} If true, button will be clicked when everything's applied.
	 */
	makeCollapsible: function (button, element, clickAfter = true) {
		let hideFn, showFn, callMakeHideable = () => {
			L.ALS.Helpers.makeHideable(button, element, hideFn, showFn, clickAfter);
		};

		element.style.overflow = "hidden";
		element.style.transition = "height 0.3s";

		// Old chrome can't deal with animations, in this case we'll just change display property.
		if (!this.supportsFlexbox && this.isChrome) {
			hideFn = () => {
				element.style.display = "none";
			};
			showFn = () => {
				element.style.display = "";
			};
			callMakeHideable();
			return;
		}

		hideFn = () => {
			element.style.height = element.scrollHeight + "px";
			setTimeout(() => {
				if (element.getAttribute("data-hidden") === "1") // Seems like it prevents bugs when user clicks button continuously
					element.style.height = "0";
			}, 10); // Wait for height to apply

			// Hide borders
			setTimeout(() => {
				element.style.border = "none";
			}, 300);
		};

		showFn = () => {
			element.style.border = "";
			element.style.height = element.scrollHeight + "px";
			setTimeout(() => {
				if (element.getAttribute("data-hidden") === "0") // Same as above
					element.style.height = "auto";
			}, 300); // Wait for animation
		}

		callMakeHideable();
	},

	/**
	 * Parses given HTML and appends it to given element as a child
	 * @param html {string} HTML to parse
	 * @param appendTo {Element} Element to append parsed HTML to
	 */
	HTMLToElement: function (html, appendTo = document.body) {
		let parsedDom = document.implementation.createHTMLDocument("title");
		parsedDom.body.innerHTML += html;
		while (parsedDom.body.hasChildNodes()) {
			appendTo.appendChild(parsedDom.body.firstChild.cloneNode(true));
			parsedDom.body.removeChild(parsedDom.body.firstChild);
		}
	},

	/**
	 * Reads file opened on fileInput as text, calls given callback and passes text to it
	 * @param fileInput {HTMLInputElement} File input to read file from
	 * @param notSupportedNotification {string} If user's browser doesn't support reading text files, this notification will be presented.
	 * @param callback {function(string)} Callback to pass text to
	 */
	readTextFile: function (fileInput, notSupportedNotification, callback) {
		if (!window.FileReader && !L.ALS.Helpers.isIElte9 && !L.ALS._service.onJsonLoad) {
			window.alert(notSupportedNotification);
			fileInput.value = "";
			return;
		}

		if (L.ALS._service.onJsonLoad && !window.FileReader) {
			callback(L.ALS._service.onJsonLoad(fileInput));
			fileInput.value = "";
			return;
		}

		if (L.ALS.Helpers.isIElte9) {
			let fso;
			try {
				if (fileInput.value.includes(":\\fakepath")) // This one won't throw error, so we gotta do it ourselves
					// noinspection ExceptionCaughtLocallyJS
					throw new Error();
				fso = new ActiveXObject("Scripting.FileSystemObject"); // This one will throw error
			} catch (e) {
				this._ieProjectErrorWindow.button.callCallback();
				fileInput.value = "";
				return;
			}
			let file = fso.openTextFile(fileInput.value, 1, false, true); // It doesn't follow MS specs but works for some reason. I have no idea how it works, but it doesn't work when used the right way.
			let content = file.readAll();
			file.close();
			callback(content);
			fileInput.value = "";
			return;
		}

		let fileReader = new FileReader();
		fileReader.onloadend = () => {
			callback(fileReader.result);
			fileInput.value = "";
		}
		fileReader.readAsText(fileInput.files[0]);
	},

	/**
	 * Displays notification if Data URL is not supported
	 * @param extension {string} file extension to display in notification
	 */
	notifyIfDataURLIsNotSupported: function (extension = "geojson") {
		if (L.ALS.Helpers.supportsDataURL)
			return;

		let firstLine;
		if (L.ALS.Helpers.isIElte9) {
			firstLine = L.ALS.locale.systemDownloadNotSupportedIE; // Please, download all the files
			if (extension !== "")
				firstLine += ` ${L.ALS.locale.systemDownloadNotSupportedExtensionIE} "${extension}"`; // and manually set their extensions to
		} else {
			firstLine = L.ALS.locale.systemDownloadNotSupported + " "; // Please, manually save text from all tabs that will open
			if (extension === "")
				firstLine += L.ALS.locale.systemDownloadNotSupportedNoExtension; // after you'll close this window
			else
				firstLine += `${L.ALS.locale.systemDownloadNotSupportedExtension1} "${extension}" ${L.ALS.locale.systemDownloadNotSupportedExtension2}.` // to "extension" files
		}
		window.alert(firstLine + "\n" + L.ALS.locale.systemDownloadNotSupportedCommon); // Sorry for the inconvenience, bla-bla-bla
	},

	/**
	 * Makes browser download data by creating data URL.
	 * @param filename {string} Name of the file to save
	 * @param mediatype {string} Data URL media type
	 * @param encoding {string} Data or text encoding
	 * @param data {string} Data itself
	 * @param notifyIfCantKeepExtension {boolean} If user's browser can't keep extension, notify them about it
	 */
	createDataURL: function (filename, mediatype, encoding, data, notifyIfCantKeepExtension = true) {
		let link = document.createElement("a");
		if (!link.download && notifyIfCantKeepExtension) {
			let ext = L.ALS.Helpers.getFileExtension(filename);
			if (ext.length !== 0)
				window.alert(`${L.ALS.locale.systemDownloadNotSupportedChangeExtensionManually} "${ext}".\n${L.ALS.locale.systemDownloadNotSupportedCommon}`);
		}
		link.download = filename;
		link.href = "data:" + mediatype + ";" + encoding + "," + data;
		L.ALS.Helpers.dispatchEvent(link, "click");
	},

	/**
	 * Saves string as text
	 * @param string {string} String to save
	 * @param filename {string} Name of the file to save
	 */
	saveAsText: function (string, filename) {
		this._saveAsTextWorker(string, filename);
	},

	/**
	 * Saves string as text
	 * @param string {string} String to save
	 * @param filename {string} Name of the file to save
	 * @param override {boolean} If true, when called second or later time, will override previously saved file. Utilises FileSystem API in Chrome and fs in Node. Use it only to save projects.
	 * @param doSaveAs {boolean} If true, and Chrome FileSystem API is supported, will perform "Save As" action
	 *
	 * @return {Promise<void>|undefined} Promise which updates {@link L.ALS.Helpers._chromeHandle} when resolved, or undefined, if FileSytem API is not supported
	 * @package
	 * @ignore
	 */
	_saveAsTextWorker: function (string, filename, override = false, doSaveAs = false) {
		if (L.ALS.Helpers.supportsBlob) {
			let blob = new Blob([string], {type: 'text/plain'});

			if (override && this._chromeFSSupported) {
				let ext = (this.isElectron) ? "json" : ".json"; // Electron appends dot automatically
				if (doSaveAs)
					this._chromeHandle = null;

				return (async () => {
					this._chromeHandle = await chromeFS.fileSave(blob, {
						fileName: filename,
						extensions: [ext],
						mimeTypes: ["text/json"],
					}, this._chromeHandle).catch((e) => {
						if (e.name !== "AbortError")
							saveAs(blob, filename);
					});
				})();
			}

			saveAs(blob, filename);
			return;
		}

		if (L.ALS._service.onJsonSave) {
			L.ALS._service.onJsonSave(string, filename);
			return;
		}

		if (L.ALS.Helpers.supportsDataURL) {
			this.createDataURL(filename, "text/plain", "base64",
				// Taken from https://attacomsian.com/blog/javascript-base64-encode-decode
				btoa(encodeURIComponent(string).replace(/%([0-9A-F]{2})/g,
					function (match, p1) {
						return String.fromCharCode("0x" + p1);
					})), false);
			return;
		}

		if (!L.ALS.Helpers.isIElte9)
			this.notifyIfDataURLIsNotSupported(L.ALS.Helpers.getFileExtension(filename));

		// Chrome 7 and IE9. IE9 still saves in UCS-2 LE BOM. Other browsers are fine with it except IE itself which requires hack at readTextFile(). I'm afraid to remove this code tho.
		let fileWindow = window.open("", "_blank");
		fileWindow.document.open("data:text/html;charset=utf-8", "replace");
		fileWindow.document.charset = "utf-8";
		fileWindow.document.write(string);
		if (L.ALS.Helpers.isIElte9) {
			fileWindow.document.execCommand("SaveAs", true, filename + ".txt");
			fileWindow.close();
		}
	},

	_applyButtonsIconsIfMobile: function (container) {
		if (!this.isMobile)
			return;
		container.classList.add("als-icon-button-container");
		let children = container.querySelectorAll("*[data-mobile-class]");
		for (let el of children) {
			el.className += " " + el.getAttribute("data-mobile-class"); // This can contain multiple classes, but classList.add() can't work with that.
			el[L.ALS.Locales._getElementPropertyToSet(el)] = "";
			el.removeAttribute("data-als-locale-property");
		}
	},

	/**
	 * Current FileSystem API handler
	 * @private
	 */
	_chromeHandle: null,

	/**
	 * Indicates whether user's browser supports Blob or not
	 * @type boolean
	 */
	supportsBlob: !!(JSZip.support.blob && (!window.webkitURL || (window.URL && window.URL.createObjectURL))),

	_chromeFSSupported: chromeFS.supported, // So we don't need to write try-catch again

	/**
	 * Contains user's device type. This detection has been performed using only user agent. If you want to implement something that relies on actual device type, consider performing feature detection by yourself. Otherwise, use this property to maintain consistent look and feel.
	 * @type {"desktop"|"phone"|"tablet"}
	 */
	deviceType: "desktop",

	/**
	 * Equals to `deviceType === "phone"`
	 * @type {boolean}
	 */
	isMobile: true,

	/**
	 * Indicates whether user's browser is IE (any version).
	 * @type {boolean}
	 */
	isIE: "ActiveXObject" in window,

	/**
	 * Indicates whether user's browser is IE9 or older.
	 * @type {boolean}
	 */
	isIElte9: window.ActiveXObject && !window.navigator.msSaveOrOpenBlob,

	/**
	 * Indicates whether user's browser is IE11.
	 * @type {boolean}
	 */
	isIE11: !(window.ActiveXObject) && "ActiveXObject" in window,

	/**
	 * Indicates whether user's browser supports flexbox.
	 * @type {boolean}
	 */
	supportsFlexbox: true,

	/**
	 * Indicates whether user's browser is Chrome.
	 * @type {boolean}
	 */
	isChrome: !!window.chrome,

	/**
	 * Indicates whether this library is running inside Electron.
	 *
	 * This is based on user agent: `navigator.userAgent.indexOf('Electron') !== -1`
	 *
	 * If you've modified user agent, feel free to change this field too.
	 */
	isElectron: (navigator.userAgent.indexOf('Electron') !== -1),

	/**
	 * Indicates whether user's browser supports File API and `File.prototype.name` property.
	 * @type {boolean}
	 * @private
	 */
	supportsFileNameProperty: (window.File && "name" in window.File.prototype),

}

/**
 * If user's browser doesn't support Data URLs (URLs in form: `data:[<mediatype>][;base64],<data>`), this will true. Otherwise will be false.
 * @type {boolean}
 */
L.ALS.Helpers.supportsDataURL = !!(!L.ALS.Helpers.isIElte9 && ((window.URL && window.URL.createObjectURL) || (window.webkitURL && window.webkitURL.createObjectURL)));

// Detect user browser
let ua = window.navigator.userAgent.toLowerCase();
let mobiles = ["android", "iphone", "ipod", "opera mini", "windows phone", "bb", "blackberry"];
let tablets = ["tablet", "ipad", "playbook", "silk"];
let devices = [mobiles, tablets];
let isTablet = false;
for (let device of devices) {
	for (let string of device) {
		if (ua.indexOf(string) !== -1) {
			L.ALS.Helpers.deviceType = isTablet ? "tablet" : "phone";
			break;
		}
	}
	isTablet = true;
}
L.ALS.Helpers.isMobile = (L.ALS.Helpers.deviceType === "phone");
document.body.classList.add((L.ALS.Helpers.isMobile) ? "mobile" : "not-mobile");

// Detect flexbox support
let p = document.createElement("p");
p.style.display = "flex";
if (p.style.display !== "flex")
	L.ALS.Helpers.supportsFlexbox = false;

// Fix font size on mobile devices
let meta = document.createElement("meta");
meta.name = "viewport";
meta.content = "width=device-width, initial-scale=1.0";
document.head.appendChild(meta);

// Add IE9 class to the body
if (L.ALS.Helpers.isIElte9)
	document.body.classList.add("ie-lte-9");

/**
 * By default, points to window.localStorage. If user's browser doesn't support LocalStorage, will use temporary "polyfill" which acts like LocalStorage but doesn't actually save anything.
 * @memberOf L.ALS.Helpers
 * @type {WindowLocalStorage}
 */
L.ALS.Helpers.localStorage = (!!window.localStorage) ? window.localStorage : {

	_storage: {},

	getItem: function (key) {
		return this._storage[key];
	},

	setItem: function (key, value) {
		this._storage[key] = value;
	},

	removeItem: function (key) {
		delete this._storage[key];
	},

	clear: function () {
		this._storage = {};
	}
}