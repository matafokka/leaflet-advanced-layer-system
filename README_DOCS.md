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

1. [classList.js](https://github.com/eligrey/classList.js)
1. [keyboardevent-key-polyfill](https://github.com/cvan/keyboardevent-key-polyfill)
1. CoreJS and Babel Runtime Regenerator

Please, test your application before adding any other polyfills (even CoreJS and Babel Runtime Regenerator!) because it might work just fine as it is.

# Project file format

Projects are made by serializing everything on the map to JSON: layers, menus, widgets, etc. It's done this way so people will be able to make their applications as dynamic as they want.

Both bless and curse of this is that changes in application introduces changes in project format. Yes, you won't need to change anything related to the file format, system will do everything for you. But you need to either provide a way to convert old projects to a new format or test everything carefully before the release.

# Docs are wrong / incomplete / hard to read / etc?

Huge apologies for that.

Please, report all issues with the docs to [the ALS repo](https://github.com/matafokka/leaflet-advanced-layer-system).