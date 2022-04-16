<!-- This readme is for the docs. For readme for the library, see README.md -->

# Welcome to ALS documentation

And thank you for considering using this library!

Don't know what ALS is? Check out its [GitHub page](https://github.com/matafokka/leaflet-advanced-layer-system), [demos](https://matafokka.github.io/als-demos/) and [this project](https://matafokka.github.io/SynthFlight/) to see what it can do.

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

ALS applies following patches to the Leaflet classes:

1. Adds `L.Layer#setInteractive`, `L.Layer#getInteractive` and `L.Layer#isInteractive` methods. Originally made by [Piero "Jadaw1n" Steinger](https://github.com/Jadaw1n).
1. Patches `L.FeatureGroup#addLayer` to recursively assign `L.FeatureGroup#options.pane` to added layers and groups.
1. Changes markers' Z index in custom panes, so markers will be placed on top of the layers.

Please, test your application before adding any other polyfills (even CoreJS and Babel Runtime!) because it might work just fine as it is.

Do **NOT** mangle object properties unless it uses hashing! It'll break everything that depends on serialization: projects, settings and undo/redo.

# Project file format

Projects are made by serializing everything to JSON: layers, menus, widgets, etc. It's done this way so people will be able to make their applications as dynamic as they want.

Both bless and curse of this is that changes in application introduces changes in project format. Yes, you won't need to change anything related to the file format, system will do everything for you. But you need to either provide a way to convert old projects to a new format or test everything carefully before the release.

# Coding guidelines

These guidelines are used in ALS, required for ALS modules (if you want to create one) and recommended for applications using ALS:

* Use one file per class. Such files should be named exactly the same as classes.
* Other files' names (such as build scripts) should use `camelCaseWithSmallFirstLetter`.
* Namespaces, classes and static fields should use `CamelCase`.
* Instance fields, methods, variables and functions should use `camelCaseWithSmallFirstLetter`.
* Private and package-only members should start with an underscore (`_`).
* Use of JSDoc is highly encouraged. Look at ALS source code to find out how to use it correctly.
* As for code formatting, you may use any style and linter you want.

In which namespace your modules should be:

* ALS layers, wizards, settings, widgetables and other meta stuff goes directly to {@link L.ALS}.
* Widgets goes to {@link L.ALS.Widgets}.
* Leaflet layers **that uses ALS** goes to both {@link L} and {@link L.ALS.LeafletLayers}. Other Leaflet layers still goes to {@link L}.
* Locales goes to {@link L.ALS.Locales}.

# Where to report issues with the docs?

[To the ALS repo](https://github.com/matafokka/leaflet-advanced-layer-system).