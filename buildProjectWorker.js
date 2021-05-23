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
	});
	build.require(require.resolve("buffer/"), {expose: "buffer"});

	if (notPolyfills) { // Transform everything except polyfills from CoreJS
		build = build.transform("babelify", {
			presets: ["@babel/preset-env"],
			global: true, // ShpJS is built without polyfills and uses async functions. So we have to build node_modules too. Maybe other libraries are built this way too.
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