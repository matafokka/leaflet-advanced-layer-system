// This script contains only CoreJS and Babel polyfills.
// These polyfills throws an error in old Chrome and prevents other polyfills from running.
// So other polyfills has been moved to System.js.

require("core-js/stable");
require("regenerator-runtime/runtime");