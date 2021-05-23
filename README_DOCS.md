<!-- This readme is for the docs. For readme for the library, see README.md -->

# Welcome to ALS documentation

And thank you for considering using this library!

Don't know what ALS is? Check out its [GitHub page](https://github.com/matafokka/leaflet-advanced-layer-system) and [this project](https://matafokka.github.io/SynthFlight/) to see what it can do.

# Docs overview

To start off, read this important entries:

1. {@link L.ALS} - What ALS is and how it works.
1. {@link L.ALS.System} - A basic workflow.
1. {@link L.ALS.Layer} - How to create a layer.
1. {@link L.ALS.Widgets} - How to work with widgets.
1. {@link L.ALS.Wizard} - What a wizard is and how to create one.
1. {@link L.ALS.Settings} - How to create settings for your layer.
1. {@link L.ALS.Serializable} - How to serialize your layer, so users will be able to save and load projects.
1. {@link L.ALS.Locales} - How to localize your application.

You may also find these entries useful:

1. {@link L.ALS.Widgetable} - General information about Widgetable classes such as layers, wizards and settings.
1. {@link L.ALS.Helpers} - Useful helper methods and properties.
1. {@link L.ALS.LeafletLayers} - Some cool Leaflet layers.
1. {@link L.ALS.ControlZoom} - Zoom control which matches ALS aesthetics.
1. {@link L.ALS.WidgetableWindow} - A widgetable window.

# Important notes

ALS uses Leaflet class system. Please, read about it at [Leaflet docs](https://leafletjs.com/reference-1.7.1.html#class).

ALS includes [RemixIcon](https://remixicon.com) icon pack which you can use. Some ALS parts even directly support setting [RemixIcon](https://remixicon.com) classes. 

ALS includes following polyfills:

1. [Babel polyfills and runtime](https://babeljs.io/)
1. [CoreJS](https://github.com/zloirock/core-js)
1. [classList.js](https://github.com/eligrey/classList.js)
1. [keyboardevent-key-polyfill](https://github.com/cvan/keyboardevent-key-polyfill)

Please, test your application before adding any other polyfills (even CoreJS and Babel Runtime!) because it might work just fine as it is.

# Project file format

Projects are made by serializing everything on the map to JSON: layers, menus, widgets, etc. It's done this way so people will be able to make their applications as dynamic as they want.

Both bless and curse of this is that changes in application introduces changes in project format. Yes, you won't need to change anything related to the file format, system will do everything for you. But you need to either provide a way to convert old projects to a new format or test everything carefully before the release.

# Coding guidelines

Coding style:

* Use one file per class. Such files should be named exactly the same as classes.
* Other files' names (such as build scripts) should use `camelCaseWithSmallFirstLetter`.
* Namespaces, classes and static fields should use `CamelCase`.
* Instance fields, methods, variables and functions should use `camelCaseWithSmallFirstLetter`.
* Private members' names should start with an underscore (`_`).
* Use of JSDoc is highly encouraged. Look at ALS source code to find out how to use it correctly.
* As for code formatting, you may use any style and linter you want.

In which namespace your modules should be:

* ALS layers, wizards, settings, widgetables and other meta stuff goes directly to {@link L.ALS}.
* Widgets goes to {@link L.ALS.Widgets}.
* Leaflet layers **that uses ALS** goes to both {@link L} and {@link L.ALS.LeafletLayers}. Other Leaflet layers still goes to {@link L}.
* Locales goes to {@link L.ALS.Locales}.

# Testing ALS and custom modules (widgets, layers, etc)

This entry is mainly for ALS contributors.

## Unit tests

ALS uses custom testing "library" which only runs tests and prettily prints results. It runs only scripts inside `tests` directory. There's only serialization test for now. To run tests, run `npm test`.

If you plan to use this testing "library", see [SerializationTest](https://github.com/matafokka/leaflet-advanced-layer-system/blob/master/tests/SerializationTest.js) for the example on how to write tests.

Otherwise, set up your own workflow.

## Testing in application

First, you'll need either to:

* Set up a custom project - if you want to develop a module. In this case, you don't need the rest of the instructions.
* Use [SynthFlight](https://matafokka.github.io/SynthFlight) - if you want to change ALS itself. SynthFlight is a testing polygon for ALS. Complexity of SynthFlight often shows edge cases, demonstrates performance, etc. So it's recommended to use SynthFlight, however, it's not prohibited to use a custom project.

To use SynthFlight:

1. Clone SynthFlight repo or just download source code from GitHub.
1. Put SynthFlight and ALS directories to the same directory. Then rename both directories ash shown below. Final directory structure should be following:
    * Directory with the projects
        * **leaflet-advanced-layer-system** - Contains ALS source code.
            * LeafletLayers
            * node_modules
            * ...
            * System.js
            * package.json
            * ...
        * **SynthFlight** - Contains SynthFlight source code. You may name this one whatever you want.
            * node_modules
            * ...
            * main.js
            * package.json
            * ...
1. `cd` to the `leaflet-advanced-layer-system` directory.
1. Run `npm install`.
1. Run `npm link`.
1. `cd` to the SynthFlight directory.
1. Run `npm install`.

Last five steps should be completed exactly in specified order.

Then write your code and run `npm run-script build` or `node build.js` to build ALS. All your changes will be reflected in SynthFlight because ALS has been `npm link`ed to SynthFlight.

You can run SynthFlight different ways:

1. In Electron using `npm start`. Use it only to quickly test your changes.
1. On HTTP-server using `npm run-script runOnServer`. There're two more scripts to build and run in one command: `buildAndRun` and `buildAndRunDebug`.
1. In a browser. Use `node build.js -b` to build SynthFlight. This script can be configured using flags, run `node build.js -h` to get help on them. After building, open `dist/SynthFlight-browser` directory and open `index.html` in a browser.

# Docs are wrong / incomplete / hard to read / etc?

Huge apologies for that.

Please, report all issues with the docs to [the ALS repo](https://github.com/matafokka/leaflet-advanced-layer-system).