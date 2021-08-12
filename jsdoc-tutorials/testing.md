
# Testing ALS and custom modules (widgets, layers, etc)

This tutorial is mainly for ALS contributors.

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
1. On HTTP-server using `npm run-script serve`. There're two more scripts to build and run in one command: `build-and-serve` and `build-and-serve-debug`.
1. In a browser. Use `node build.js -b` to build SynthFlight. This script can be configured using flags, run `node build.js -h` to get help on them. After building, open `dist/SynthFlight-browser` directory and open `index.html` in a browser.