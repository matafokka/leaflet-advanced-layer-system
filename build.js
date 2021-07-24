const fs = require("fs");
const fse = require("fs-extra");
const postcss = require("postcss");
const postcssPresetEnv = require("postcss-preset-env");
const cssnano = require("cssnano");
const postcssCssVariables = require("postcss-css-variables");
const {generateCSSPatch} = require("css-patch");
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
if (!debug)
	plugins.push(cssnano());

let cssFilename = "css/base.css";
// Prepend RemixIcon styles to our styles so we'll end up with only one directory containing our CSS. We'll copy fonts later.
let css = fs.readFileSync(remixIconDir + "remixicon.css").toString() + fs.readFileSync(cssFilename).toString();

// Build dark theme css by appending new variables to the base CSS, processing it and extracting differences
let darkCssFilename = "css/dark.css";
let darkCss = css + fs.readFileSync(darkCssFilename).toString();

let styles = [
	[cssFilename, css],
	[darkCssFilename, darkCss]
];

let transformedBaseCss = undefined;
for (let style of styles) {
	let filename = style[0];
	postcss(plugins).process(style[1], {from: undefined}).then(async (result) => {

		let newCss = result.css;
		if (filename === darkCssFilename) {
			while (!transformedBaseCss)
				await new Promise(resolve => setTimeout(resolve, 0));
			newCss = generateCSSPatch(transformedBaseCss, newCss);
		}

		fs.writeFile(dir + filename, newCss, {}, (err) => {
			if (err)
				console.error(err);
			else if (filename === cssFilename)
				transformedBaseCss = newCss;
		});
	});
}

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