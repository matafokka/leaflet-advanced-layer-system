const persistify = require("persistify");
const babelify = require("babelify");
const {workerData} = require("worker_threads");
const fs = require("fs");

let files = ["polyfills", "System"]; // Files to build
for (let file of files) {
	let notPolyfills = file !== "polyfills";
	let generateSourceMaps = workerData.debug && notPolyfills;

	let build = persistify({
		entries: [file + ".js"],
		debug: generateSourceMaps
	}).require(require.resolve("buffer/"), {expose: "buffer"});

	if (notPolyfills) { // Transform everything except polyfills from CoreJS
		build = build.transform("babelify", {
			presets: ["@babel/preset-env"],
			global: true, // Some dependencies might not support everything we aim to support
			minified: !workerData.debug,
		});
	}

	build.plugin("common-shakeify")
		.transform("uglifyify", {
			global: true,
			ie8: true,
			sourceMap: generateSourceMaps
		})
		.bundle().pipe(fs.createWriteStream(workerData.dir + file + ".js"));
}