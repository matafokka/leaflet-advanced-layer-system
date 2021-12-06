# Using ALS with Leaflet.Draw

This tutorial will help you to set up ALS with Leaflet.Draw.

# Make appearance match ALS aesthetics

In your HTML, first import Leaflet.Draw stylesheet, then - ALS stylesheet:

```html
<!-- Leaflet.Draw -->
<link rel="stylesheet" href="node_modules/leaflet-draw/dist/leaflet.draw.css" />

<!-- ALS stylesheet -->
<link rel="stylesheet" href="node_modules/leaflet-advanced-layer-system/dist/css/base.css" />
```

# Fix objects not drawing

L.Draw seems to be abandoned and has a nasty bug: if project is built using strict syntax, drawing will fail with an error. It's because devs forgot to initialize a variable. More about this issue [here](https://github.com/Leaflet/Leaflet.draw/issues/1026).

To fix it, just import Leaflet.Draw before ALS like so:

```
require("leaflet-draw");
require("leaflet-advanced-layer-system");
```

# Display controls only for certain layers

Use {@link L.ALS.Layer#addControl} to do this.