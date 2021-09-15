module.exports = function (defaultOptions, newOptions) {
	let resultingOptions = {};
	for (let obj of [defaultOptions, newOptions]) {
		for (let prop in obj) {
			if (obj.hasOwnProperty(prop) && defaultOptions.hasOwnProperty(prop))
				resultingOptions[prop] = obj[prop];
		}
	}
	return resultingOptions;
}