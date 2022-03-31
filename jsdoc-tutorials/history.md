# Introduction

History allows your users to perform undo and redo operations.

In ALS, history is based on serialization and deserialization of the whole project, so before using it, you **must** implement serialization and deserialization of your layer.

Since deserialization causes page redrawing, it can be quite slow, so you might want to ignore some operations.

ALS already manages its own operations such as adding a layer, renaming, deleting, etc. You need to write history records only for your layers.

# Setting up history

You must explicitly enable history by setting {@link SystemOptions.enableHistory} option to `true` when creating {@link L.ALS.System} instance. This will also add undo and redo buttons.

You might want to modify {@link SystemOptions.historySize} option which defines how many history records can be stored (`20` by default, `0` means unlimited). The optimal value depends on complexity of your layers. See the "Memory" tab in your browser, do some actions, watch how memory consumption grows and decide the history size based on this factor.

All together now:

```
let layerSystem = new L.ALS.System(map, {
	// Your other options...
	enableHistory: true, // Enable history and undo/redo buttons and their keyboard shortcuts
	historySize: 25, // Change history size from 20 to 25
});
```

# Using history

History is managed by calling {@link L.ALS.Layer.writeToHistory) method. It should be called at the end of each operation caused by user interaction, for example:

```
L.ALS.MyLayer = L.ALS.Layer.extend({

	someOperation: function() {
		// Operation code...
		this.writeToHistory(); // Write to history at the end of this operation
	}

});
```

You should always wait until all the code for the operation is executed. If you're using `async` functions, you should `await` all of them.

If you have asynchronous operations at {@link L.ALS.Layer#init}, set {@link L.ALS.Layer#writeToHistoryOnInit} to `false` and write to history manually by calling {@link L.ALS.Layer#writeToHistory}.

There are no other methods for managing history, and you don't need them, ALS does everything for you.
