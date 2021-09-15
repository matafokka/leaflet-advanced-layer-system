const fs = require("fs");
const fse = require("fs-extra");
const postcss = require("postcss");
const postcssPresetEnv = require("postcss-preset-env");
const postcssCssVariables = require("postcss-css-variables");
const prefixSelector = require("postcss-prefix-selector");
const csso = require("csso");
const {Worker} = require('worker_threads');

let oldStamp = Date.now();
process.on("exit", () => {
	console.log("Finished in: " + ((Date.now() - oldStamp) * 0.001).toFixed(3) + "s");
});

let debug = false;

for (let arg of process.argv) {
	if (arg === "-h" || arg === "--help") {
		console.log("Run build.js with following arguments to tweak build process:\n" +
			"\t-h or --help - Show help and quit.\n" +
			"\t-d or --debug - Source maps will be generated."
		);
		process.exit(-1);
	} else if (arg === "-d" || arg === "--debug")
		debug = true;
}

console.log(`\n${new Date().toTimeString()} - Building leaflet-advanced-layer-system...\n` +
	"Type -h or --help to view help on build arguments.\n");

fse.emptyDirSync("dist");

// Create build directory
let dir = "dist/";
fs.mkdirSync(dir + "css", {recursive: true});

// Create worker
new Worker("./buildProjectWorker.js", {
	workerData: {
		debug: debug, dir: dir,
	}
});

// Build CSS
let remixIconDir = "node_modules/remixicon/fonts/"; // Path to all RemixIcon stuff
let plugins = [
	postcssCssVariables(),
	postcssPresetEnv({
		autoprefixer: {flexbox: "no-2009"}
	}),
];

let cssFilename = "css/base.css";
let css = fs.readFileSync(cssFilename).toString();
let darkCss = css + fs.readFileSync("css/dark.css").toString();

(async function() {
	let options = {from: undefined};
	let transformedBaseCss = (await postcss(plugins).process(css, options)).css;
	let transformedDarkCss = (await postcss(plugins).process(darkCss, options)).css;

	let combineSelectors = [".mobile", ".not-mobile", ".als-fullscreen-map", ".als-electron-toolbar-as-frame", ".ie-lte-9", ".als-no-scroll"];

	transformedBaseCss += (await postcss([prefixSelector({
		prefix: ".als-dark",
		exclude: [/.als-dark/, /:root/],
		transform: (prefix, selector, prefixedSelector) => {
			if (selector === "body")
				return selector + prefix;

			for (let s of combineSelectors) {
				if (selector.startsWith(s))
					return prefix + selector;
			}
			return prefixedSelector;
		}
	})]).process(transformedDarkCss, options)).css;

	let finalCSS = fs.readFileSync(remixIconDir + "remixicon.css").toString() + transformedBaseCss;
	if (!debug)
		finalCSS = csso.minify(finalCSS, {restructure: false}).css;

	fs.writeFileSync(dir + cssFilename, finalCSS);
})();

// Copy RemixIcon fonts to dist
fs.readdir(remixIconDir, {}, (err, files) => {
	if (err !== null) {
		console.error(err);
		return;
	}

	for (let file of files) {
		if (!file.endsWith("css"))
			fs.writeFile(dir + "css/" + file, fs.readFileSync(remixIconDir + file), (err) => {
				if (err !== null)
					console.error(err);
			});
	}
});