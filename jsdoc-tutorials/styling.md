# Styling map containers

ALS wraps Leaflet maps into the div with `als-map-container` class. Style it the way you style Leaflet maps.

To make a map fullscreen, set {@link SystemOptions.makeMapFullscreen} property to `true`. Don't style the container yourself, use that option!

# ALS classes

ALS sets following classes to the `body` if:

1. `als-dark` - dark theme is selected.
1. `mobile` - user's device is a phone, i.e. when {@link L.ALS.Helpers.isMobile} is `true`.
1. `not-mobile` - user's device is a desktop, i.e. when {@link L.ALS.Helpers.isMobile} is `false`.
1. `ie-lte-9` - user's browser is IE9 or less, i.e. when {@link L.ALS.Helpers.isIElte9} is `true`.
1. `als-fullscreen-map` - {@link SystemOptions.makeMapFullscreen} is `true`.
1. `als-electron-toolbar-as-frame` - {@link SystemOptions.makeMapFullscreen} and {@link ElectronIntegration.useToolbarAsFrame} are true.
1. `als-no-scroll` - {@link L.ALS.WidgetableWindow} is open.

# Global styles

ALS sets following global styles to match aesthetics and normalize elements' behavior:

```
body {
	padding: 0;
	margin: 0;
	font-family: arial, sans-serif;
	background: var(--background);
	color: var(--text-color);
}

* {
	outline: none;
}

input, select {
	font-size: 1rem;
	padding: 0;
	background: var(--background);
	color: var(--text-color);
	border: var(--border);
}

input, select {
	font-size: 1rem;
	padding: 0;
	background: var(--background);
	color: var(--text-color);
	border: var(--border);
}

input:invalid {
	box-shadow: none;
}

input:disabled {
	background: var(--fixed-element-bg);
}

input[type="color"] {
	padding: 0;
	height: 1.3rem;
}

select {
	height: 1.5rem;
}

select > * {
	background: var(--background);
}
```

ALS will set `:root {font-size: 16pt;}` for mobile devices. To prevent it, pass `false` as the {@link L.ALS.System.initializeSystem} argument.