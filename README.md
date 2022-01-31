<!-- This readme is for library. For readme for the docs, see README_DOCS.md -->

# Advanced Layer System (ALS) for Leaflet

Have you ever needed something more than a simple layer switcher? Probably, custom layer types? Multiple interactive layers? Full-blown projects like in big apps? Just a cool menu? ALS got you covered!

Layer system handles hard stuff like managing layers, hacking Leaflet, struggling with UI and everything else. You're left to focus only on your app's functionality.

Features:

1. A layer system which allows you to create custom layer types and allows users to add those layers to the map. Users can add, delete, move, hide and tweak layers.
1. Project management done by serialization. Projects can be exported as GeoJSON files. Yup, like in GIS.
1. A simple menu which uses single layer type and doesn't feature all the advanced stuff.
1. A widget library. Moreover, you can add widgets to the map!
1. Extras: wizards, settings, localization, Electron integration and more!

Sounds cool? See ["Getting started"](#getting-started) or jump straight to the [docs](https://matafokka.github.io/leaflet-advanced-layer-system/)!

# Demos

[ALS demos](https://matafokka.github.io/als-demos) - demonstrates all important ALS capabilities and provides the source code for all demos.

[SynthFlight](https://matafokka.github.io/SynthFlight) - aerial photography planning software which uses ALS. Well, initially, ALS has been developed for SynthFlight :D

# [Docs](https://matafokka.github.io/leaflet-advanced-layer-system/)


# Getting started

## Adding a dependency

Run `npm i leaflet-advanced-layer-system`.

## Importing ALS

In your `index.html` add following stuff to the `<head>` after Leaflet's scripts and CSS:

```html
<!-- ALS CSS. Must go before scripts. -->
<link rel="stylesheet" href="css/base.css" />

<!-- ALS scripts. Put in exact same order. -->
<script src="node_modules/leaflet-advanced-layer-system/dist/polyfills.js"></script> <!-- Polyfills -->
<script src="node_modules/leaflet-advanced-layer-system/dist/System.js"></script> <!-- ALS entry point. Alternatively, you can import it in your main script -->
```

**Warning**: Polyfills should NEVER be transformed by anything! You still can `require()` them, but it's better to leave them in your HTML and ignore in your build script.

## Setting up a project

Add following code to your entry point:
```JavaScript
require("leaflet-advanced-layer-system"); // Require this plugin or add it to your .html page via "script" tag as has been shown above
require("./MyLayer.js"); // Require your layer types and other stuff

L.ALS.System.initializeSystem(); // Initialize system. This method MUST be called after all Leaflet and ALS imports.
let map = L.map("map", { // Create a map
    preferCanvas: true, // Use it to improve performance
    keyboard: false // Setting this option to false is a MANDATORY! If you don't do that, you'll encounter problems when using L.ALS.LeafletLayers.WidgetLayer!
});
let layerSystem = new L.ALS.System(map, { /* Options */ }); // Create an instance of this class
let baseLayer = L.tileLayer(/* ... */); // Create some base layers
layerSystem.addBaseLayer(baseLayer, "My Base Layer"); // Add your base layers to the system
layerSystem.addLayerType(L.ALS.MyLayer); // Add your layer types
```

Then jump to the [docs](https://matafokka.github.io/leaflet-advanced-layer-system/) and start coding!

# Browser support

ALS supports following browsers:

* Chrome 8 or later.
* Firefox 22 or later.
* Safari 6 or later.
* Internet Explorer 9 or later.
* Any other modern desktop or mobile browser.

Known issues with old browsers (~7 years or older) that can't be fixed due to technical reasons:
* Outdated Chromium-based browsers have a "feature" that prevents `FileReader` from reading local files. To solve it, you should either:
    * Host your app on a web server.
    * Somehow make your users add `--allow-file-access-from-files` flag when running browser.
* Users can't save files, they need to manually copy JSON from the browser to their files.
* Users can save files, but those files won't have a proper name.
* IE 9 only: users needs to manually save multiple files when exporting project.
* IE 9 only: users might be asked to change their settings when they'll try to open a project or import settings. The pop-up window will provide all necessary instructions.
* Users can't save settings.

You can solve these problems either by removing functionality based on the browser or by providing a backend which will receive the data and send it back to the client, so it will "simulate" a download. ALS provides the callbacks where you can make your requests. See `SystemOptions` docs for both options.

# FAQ

## What about learning curve?

Learning curve is a bit steep, but ALS solves much more problems than it adds.

## ALS widgets vs modern frameworks with plugins

1. ALS uses traditional and non-reactive widgets similar to Qt and GTK. Frameworks uses reactive components.
1. ALS is faster since it uses straightforward DOM manipulation when needed instead of heavy stuff like Virtual DOM. ALS also doesn't need to sync components since it's not reactive.
1. ALS provides way better browser support than most modern frameworks.
1. ALS provides a huge set of features that you'll need to implement yourself otherwise.

## Can I use my favourite framework instead of built-in widget system?

Technically, yes, but you'll have to pass `L.ALS.Widgetable`'s containers to your framework which is a bit hacky. There will be some more things to do such as serialization.

If you need to just add more widgets, you can do so by extending `L.ALS.Widgets.BaseWidget`. Otherwise, you're probably better off not using ALS.

## What is project file format?

[See the docs' home page.](https://matafokka.github.io/leaflet-advanced-layer-system/)

## Are any API changes planned?

No, unless they will fix bugs. It also includes some parts returning text instead of locale properties. All such API changes will be documented in release notes.

However, internal (package-scoped and private-scoped) members might be changed in the future, so please, avoid using it. File a bug report or feature request instead.

## How can I contribute to the project?

Oh, there's much to add to the project, you can contribute by:

1. Developing apps using ALS, so they can be added to this ReadMe :D
1. Coding:
    1. Create more widgets.
    1. Improve browser support.
    1. Provide additional layer types which others can use.
    1. Create examples and tutorials for the docs.
    1. Provide unit tests.
    1. Everything else that comes to your mind.
1. Localizing ALS.
1. Improving docs. *Note: docs are being generated from the JSDoc comments. Either edit the comments or create an issue and describe what and where needs to be changed.*
1. Reporting bugs.
1. Requesting features.