const browserify = require("browserify");
const babelify = require("babelify");
const fs = require("fs");
const fse = require("fs-extra");
const postcss = require("postcss");
const postcssPresetEnv = require("postcss-preset-env");
const cssnano = require("cssnano");
const postcssCssVariables = require("postcss-css-variables");
const { generateCSSPatch } = require("css-patch");

let debug = false;

for (let arg of process.argv) {
	if (arg === "-h" || arg === "--help") {
		console.log("Run build.js with following arguments to tweak build process:\n" +
		"\t-h or --help - Show help and quit.\n" +
		"\t-d or --debug - Source maps will be generated."
		);
		process.exit(-1);
	}
	else if (arg === "-d" || arg === "--debug")
		debug = true;
}

console.log("\nBuilding leaflet-advanced-layer-system...\n" +
	"Type -h or --help to view help on build arguments.\n");

fse.emptyDirSync("dist");

// Create build directory
let dir = "dist/";
fs.mkdirSync(dir + "css", { recursive: true });

// Build CSS
let plugins = [
	postcssCssVariables(),

	postcssPresetEnv({
		autoprefixer: { flexbox: "no-2009" }
	}),
];
if (!debug)
	plugins.push(cssnano());

let remixIconDir = "node_modules/remixicon/fonts/"; // Path to all RemixIcon stuff

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
				console.log(err);
			else if (filename === cssFilename)
				transformedBaseCss = newCss;
		});
	});
}

// Copy RemixIcon fonts to dist
fs.readdir(remixIconDir, {}, (err, files) => {
	if (err !== null) {
		console.log(err);
		return;
	}

	for (let file of files) {
		if (!file.endsWith("css"))
			fs.writeFile(dir + "css/" + file, fs.readFileSync(remixIconDir + file), (err) => {
				if (err !== null)
					console.log(err);
			});
	}
})

// Build project
let files = ["polyfills", "System"]; // Files to build
for (let file of files) {
	let notPolyfills = file !== "polyfills";
	let generateSourceMaps = debug && notPolyfills;

	let build = browserify([file + ".js"], { debug: generateSourceMaps });
	if (notPolyfills) { // Transform everything except polyfills from CoreJS
		build = build.transform("babelify", {
			presets: ["@babel/preset-env"],
			global: true, // ShpJS is built without polyfills and uses async functions. So we have to build node_modules too. Maybe other libraries are built this way too.
			minified: !debug,
		});
	}

	build.plugin("common-shakeify")
		.transform("uglifyify", {
			global: true,
			ie8: true,
			sourceMap: generateSourceMaps
		})
		.bundle().pipe(fs.createWriteStream(dir + file + ".js"));
}

// TODO: Remove it if layer system won't support IE8
/*let toCopy = [
	//"node_modules/ie8/build/ie8.js",
	//"node_modules/object-defineproperty-ie/src/object-defineproperty-ie.js",
];

for (let stuff of toCopy)
	fse.copy(stuff, dir + stuff);*/