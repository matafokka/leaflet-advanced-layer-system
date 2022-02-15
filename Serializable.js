/**
 *
 * # Introduction
 *
 * Provides serialization capabilities, used to serialize different kinds of objects to JSON and deserialize them back.
 *
 * Deals with cyclic references.
 *
 * Serializes following types: Array, RegExp, BigInt, Symbol. Serializes custom properties in all of those types.
 *
 * Tries to deal with any types of objects, but you may want to provide your own serialization and deserialization mechanisms. To do so, override serialize() and static deserialize() methods.
 *
 * **Caveats**:
 * 1. Objects' ownership (where object has been created) changes after deserialization. The way it changes depends on how user's browser handles `for ... in` loop. The first place object will appear at would be the owner of that object after deserialization.
 * 1. If user's browser doesn't support BigInt or Symbol, those types will be deserialized as number and string respectively.
 *
 * # How to implement custom mechanisms
 *
 * You'll have to override {@link L.ALS.Serializable#serialize} and {@link L.ALS.Serializable.deserialize} methods.
 *
 * {@link L.ALS.Serializable#serialize} should return an object that can be serialized by `JSON.stringify()`. You may want to create plain objects containing your data or use static {@link L.ALS.Serializable.serializeAnyObject} method to serialize complex objects. Though it won't work with custom classes, it may be still useful.
 *
 * Static {@link L.ALS.Serializable.deserialize} method accepts your serialized object as an argument and must return a deserialized instance of your class. You can use static {@link L.ALS.Serializable.getObjectFromSerialized} method to do so and perform your deserialization on returned object. You may also find default deserialization mechanism useful for deserializing complex objects such as described above.
 *
 * There are also plenty of helpers methods to accomplish your goal. {@link L.ALS.Layer} has additional methods to help you.
 *
 * # Hints
 *
 * Every {@link L.ALS.Serializable} instance has public {@link L.ALS.Serializable#serializationIgnoreList} property which contains properties' names to ignore while serializing. You may want to use it if you want to stick to default serialization mechanisms. Just append your properties' and methods' names to `serializationIgnoreList`.
 *
 * Both {@link L.ALS.Serializable#serialize} and {@link L.ALS.Serializable.deserialize} methods accepts two additional arguments: `seenObjects` and `seenObjectsForCleanUp`. Those are used internally by serialization mechanism. If you're making layer, just don't pass anything to the default mechanism. If your class serializes some other {@link L.ALS.Serializable} that uses default mechanism, please, pass those parameters to its `serialize()` and `deserialize()` methods.
 *
 * You can prevent constructor arguments from being serialized or deserialized by creating custom `skipSerialization` and `skipDeserialization` properties respectively and setting them to `true`. If you choose to prevent serialization, you'll need to set skipped arguments at deserialization yourself. For this, see the next tip.
 *
 * You can put custom objects as arguments to the constructor while deserializing using default mechanisms. To do so:
 * 1. Assign `serialized.constructorArguments` to the array.
 * 1. For each custom object argument: create `skipDeserialization` property and set it to `true`.
 * 1. Put your custom arguments to `serialized.constructorArguments` in such order that constructor requires.
 * 1. Pass your `serialized` object to the default mechanism: `L.ALS.Serializable.deserialize(serialized);`
 *
 * @class
 * @extends L.Class
 */
L.ALS.Serializable = L.Class.extend( /** @lends L.ALS.Serializable.prototype */ {

	initialize: function () {

		/**
		 * Contains properties that won't be serialized. Append your properties at the constructor.
		 * @type {string[]}
		 * @protected
		 */
		this.serializationIgnoreList = ["serializationIgnoreList", "__proto__", "prototype", "_initHooks", "_initHooksCalled", "setConstructorArguments", "constructorArguments", "includes", "_leaflet_id", "_events", "_eventParents", "getPane"];

	},

	/**
	 * Sets constructor arguments for serialization
	 * @param args Arguments to set
	 */
	setConstructorArguments: function (args) {
		if (!args)
			args = [];

		/**
		 * Contains arguments passed to this constructor
		 * @type {any[]}
		 * @protected
		 */
		this.constructorArguments = Array.prototype.slice.call(args);
	},

	/**
	 * Serializes this object to JSON. If overridden, you MUST perform following operations before returning JSON:
	 *
	 * ```
	 * let json = {} // Your JSON
	 * ... // Perform serialization
	 * json.constructorArguments = this.serializeConstrutorArguments(); // Serialize constructor arguments
	 * json.serializableClassName = this.serializableClassName; // Add class name to JSON
	 * return json; // Finally return JSON
	 * ```
	 *
	 * @param seenObjects {Object} Already seen objects
	 * @return {Object} This serialized object
	 */
	serialize: function (seenObjects) {
		let serialized = L.ALS.Serializable.serializeAnyObject(this, seenObjects);
		serialized.constructorArguments = this.serializeConstructorArguments(seenObjects);
		return serialized;
	},

	/**
	 * Serializes constructor arguments. If your constructor is not empty, result of this method MUST be added to json at {@link L.ALS.Serializable#serialize} as "_construtorArgs" property.
	 *
	 * Deprecated in favor of {@link L.ALS.Serializable#getObjectFromSerialized} which uses this function under-the-hood.
	 *
	 * @return {Array} Serialized constructor arguments
	 * @deprecated
	 */
	serializeConstructorArguments: function (seenObjects) {
		let constructorArgs = [];
		if (this.constructorArguments) {
			for (let arg of this.constructorArguments) {
				if (!arg.skipSerialization)
					constructorArgs.push(L.ALS.Serializable.serializeAnyObject(arg, seenObjects));
			}
		}
		return constructorArgs;
	},

	/**
	 * Registers this object for serialization and deserialization. Returns an object to serialize custom properties to.
	 *
	 * Call it first, if you implement your own algrorithm, and serialize to the returned object!
	 *
	 * @param newObject {Object} Object to where you'll serialize
	 * @param seenObjects {Object} Already seen objects
	 *
	 * @return {Object} Object to serialize to.
	 */
	getObjectToSerializeTo: function ( seenObjects) {
		L.ALS.Serializable._registerObject(this, seenObjects);
		return {
			serializationID: this.serializationID,
			serializableClassName: this.serializableClassName,
			constructorArguments: this.serializeConstructorArguments(seenObjects)
		}
	},

	statics: {

		/**
		 * Prefix added when serializing unsupported types such as NaN or Infinity
		 * @memberOf L.ALS.Serializable
		 * @private
		 */
		_unsupportedTypesPrefix: "alsSerializable__",

		/**
		 * Prefix added to BigInts when serializing
		 * @memberOf L.ALS.Serializable
		 * @private
		 */
		_bigIntPrefix: "BigInt__",

		/**
		 * Prefix added to Symbols when serializing
		 * @memberOf L.ALS.Serializable
		 * @private
		 */
		_symbolPrefix: "Sym__",

		/**
		 * List of custom properties to ignore when deserializing arrays
		 * @memberOf L.ALS.Serializable
		 * @private
		 */
		_arrayIgnoreList: ["alsSerializableArray", "serializationID"],

		/**
		 * Checks if property should be ignored when serializing or deserializing.
		 *
		 * If you're deserializing, call it for both serialized object and new instance like this:
		 *
		 * ```
		 * if (this.shouldIgnoreProperty(property, serialized) || this.shouldIgnoreProperty(property, newObject, false, true))
		 *     // Ignore this property
		 * ```
		 *
		 * @param property {string} Name of the property
		 * @param object {L.ALS.Serializable|Object} Object containing ignore lists
		 * @param isGetter {boolean} Indicates whether given property is getter or not
		 * @param checkOnlyIgnoreList {boolean} If true, will only check if property is in the ignore lists
		 * @return {boolean} True, if property is in ignore lists. False otherwise.
		 * @memberOf L.ALS.Serializable
		 */
		shouldIgnoreProperty: function (property, object, isGetter = false, checkOnlyIgnoreList = false) {
			let obj = object[property];

			if (!checkOnlyIgnoreList && (
				obj === undefined || obj === null || obj instanceof Element || obj instanceof L.Map
				|| obj instanceof L.Layer || (typeof obj === "function" && !isGetter)
			))
				return true;

			if (object.serializationIgnoreList)
				return object.serializationIgnoreList.indexOf(property) !== -1;
			return false;
		},

		/**
		 * Cleans up seen objects. Must be called after first call of `serialize()`, `serializeAnyObjects()` or `deserialize()`. Should not be called in the middle of serialization or deserialization, for example, at `serialize()`.
		 * @param seenObjects {Object} `seenObjects` argument that you've passed to serialization and deserialization methods
		 * @memberOf L.ALS.Serializable
		 */
		cleanUp: function (seenObjects) {
			for (let prop in seenObjects) {
				let object = seenObjects[prop];
				delete object.propertiesOrder;
				delete object.serializationID;
			}
		},

		/**
		 * Registers object for serialization and deserialization
		 * @param object {Object} object to register
		 * @param seenObjects {Object}
		 * @private
		 */
		_registerObject: function (object, seenObjects) {
			if (!object.serializationID)
				object.serializationID = L.ALS.Helpers.generateID();
			seenObjects[object.serializationID] = object;
		},

		/**
		 * Serializes primitives including types unsupported by JSON
		 * @param primitive Primitive to serialize
		 * @return Serialized primitive
		 * @memberOf L.ALS.Serializable
		 */
		serializePrimitive: function (primitive) {
			let part = "";
			if (typeof primitive === "bigint")
				part = this._bigIntPrefix + primitive.toString();
			else if (typeof primitive === "symbol") {
				let s = primitive.toString();
				part = this._symbolPrefix + [s.slice(7, s.length - 1)] // Symbol.toString() returns "Symbol(your_string)". So we slice it to get "your_string"
			} else if (typeof primitive !== "number")
				return primitive;
			else if (isNaN(primitive))
				part = "NaN";
			else if (primitive === Infinity)
				part = "INF";
			else if (primitive === -Infinity)
				part = "-INF";
			else
				return primitive;
			return this._unsupportedTypesPrefix + part;
		},

		/**
		 * Deserializes primitives including types unsupported by JSON
		 * @param primitive Primitive to deserialize
		 * @return {bigint|number|*} Deserialized primitive
		 * @memberOf L.ALS.Serializable
		 */
		deserializePrimitive: function (primitive) {
			if (typeof primitive !== "string" || !primitive.startsWith(this._unsupportedTypesPrefix))
				return primitive;

			let val = primitive.slice(this._unsupportedTypesPrefix.length, primitive.length);

			let types = [
				{prefix: this._bigIntPrefix, type: (window.BigInt) ? BigInt : "number"},
				{prefix: this._symbolPrefix, type: (window.Symbol) ? Symbol : "symbol"}
			];
			for (let type of types) {
				if (!val.startsWith(type.prefix))
					continue
				let value = val.slice(type.prefix.length, val.length);
				if (typeof type.type !== "string")
					return type.type(value);
				if (type.type === "number")
					return parseInt(value);
				return value;
			}

			switch (val) {
				case "NaN": {
					return NaN;
				}
				case "INF": {
					return Infinity;
				}
				case "-INF": {
					return -Infinity;
				}
			}
		},

		/**
		 * Finds a constructor by given class name
		 * @param className {string} Full class name. Just pass serialized.serializableClassName.
		 * @return {function(new:L.ALS.Serializable)|undefined} Found constructor or undefined
		 * @memberOf L.ALS.Serializable
		 */
		getSerializableConstructor: function (className) {
			className += ".";
			let namespace = window;
			let currentPart = "";
			for (let symbol of className) {
				if (symbol === ".") {
					namespace = namespace[currentPart];
					currentPart = "";
				} else
					currentPart += symbol;
			}
			return namespace;
		},

		/**
		 * Constructs new instance of Serializable and passes serialized arguments to the constructor. Assigns `serializationID` to the object and adds it to `seenObjects`.
		 *
		 * @param serialized {Object} Serialized Serializable object
		 * @param seenObjects Already seen objects' ids. Intended only for internal use.
		 * @return {L.ALS.Serializable|Object} Instance of given object or `serialized` argument if constructor hasn't been found
		 * @memberOf L.ALS.Serializable
		 */
		getObjectFromSerialized: function (serialized, seenObjects) {
			let constructor = this.getSerializableConstructor(serialized.serializableClassName);

			if (!serialized.serializationID)
				serialized.serializationID = L.ALS.Helpers.generateID();

			if (!constructor) {
				this._registerObject(serialized, seenObjects);
				return serialized;
			}

			if (!(serialized.constructorArguments instanceof Array) || serialized.constructorArguments.length === 0)
				serialized.constructorArguments = [];

			let constructorArgs = [];
			for (let arg of serialized.constructorArguments) {
				if (arg && arg.skipDeserialization)
					constructorArgs.push(arg);
				else
					constructorArgs.push(this.deserialize(arg, seenObjects));
			}

			let object = new constructor(...constructorArgs);
			object.serializationID = serialized.serializationID;
			this._registerObject(object, seenObjects);
			return object;
		},

		/**
		 * Finds getter or setter name for given property in a given object
		 * @param isGetter {boolean} If set to true, will find getter. Otherwise will find setter
		 * @param property {string} Property name
		 * @param object {Object} Object to find getter or setter in
		 * @return {string|undefined} Either getter or setter name or undefined if nothing has been found
		 * @memberOf L.ALS.Serializable
		 * @private
		 */
		_findGetterOrSetter: function (isGetter, property, object) {
			let index = (property[0] === "_") ? 1 : 0;
			let func1 = (isGetter ? "get" : "set") + property[index].toUpperCase() + property.slice(index + 1);
			let func2 = "_" + func1;
			let funcs = [func1, func2];
			for (let func of funcs) {
				if (object[func] && typeof object[func] === "function")
					return func;
			}
			return undefined;
		},

		/**
		 * Finds getter name for given property in a given object
		 * @param property {string} Property name
		 * @param object {Object} Object to find getter in
		 * @return {string|undefined} Either getter name or undefined if nothing has been found
		 * @memberOf L.ALS.Serializable
		 */
		findGetter: function (property, object) {
			return this._findGetterOrSetter(true, property, object);
		},

		/**
		 * Finds setter name for given property in a given object
		 * @param property {string} Property name
		 * @param object {Object} Object to find setter in
		 * @return {string|undefined} Either setter name or undefined if nothing has been found
		 * @memberOf L.ALS.Serializable
		 */
		findSetter: function (property, object) {
			return this._findGetterOrSetter(false, property, object);
		},

		/**
		 * Generic serialization mechanism. Tries to serialize everything possible
		 * @param object Any object or primitive to serialize
		 * @param seenObjects {Object} Already seen objects' ids. Intended only for internal use.
		 * @return {Object} Serialized object or primitive
		 * @memberOf L.ALS.Serializable
		 */
		serializeAnyObject: function (object, seenObjects) {

			if (object instanceof Element) // Skip HTML elements
				return undefined;

			if (!(object instanceof Object)) // Serialize primitives
				return this.serializePrimitive(object);

			if (object.skipSerialization)
				return undefined;

			if (object.serializationID && seenObjects[object.serializationID]) // Replace seen objects with references
				return {serializationReference: object.serializationID};

			// Deeply serialize everything else

			this._registerObject(object, seenObjects);

			// Serialize arrays by copying all its items to an object and serializing that object instead.
			// This is also needed because JSON.stringify() removes custom array properties.
			let newObject;
			if (object instanceof Array) {
				newObject = {
					alsSerializableArray: true,
					serializationID: object.serializationID,
				};
				for (let i in object)
					newObject[i] = object[i];
			} else
				newObject = object;

			let json = {propertiesOrder: []}; // Gotta keep properties' order
			let seenProps = [];
			for (let prop in newObject) {
				// Check if property is getter
				let isGetter = (typeof newObject[prop] === "function" && prop.startsWith("get") && prop[3] === prop[3].toUpperCase());

				if (seenProps.includes(prop) || (!newObject.hasOwnProperty(prop) && !isGetter) || this.shouldIgnoreProperty(prop, newObject, isGetter))
					continue;

				let propName = prop; // Property name to write into JSON
				if (isGetter && newObject[prop].length === 0) {
					let name1 = prop[3].toLowerCase() + prop.slice(4, prop.length);
					let name2 = "_" + name1;
					for (let name of [prop, name1, name2]) {
						if (newObject[name])
							propName = name;
					}

					if (propName === prop) // If name is equal to getter, replace it with one of the names so we can deserialize it later
						propName = name1;

					seenProps.push(prop, name1, name2);
				} else if (!isGetter)
					seenProps.push(propName);
				else
					continue;

				json.propertiesOrder.push(propName);
				let getter = isGetter ? prop : this.findGetter(prop, newObject);
				let property = (getter === undefined) ? newObject[prop] : newObject[getter]();

				json[propName] = (property && property.serialize && !(property.serializationID && seenObjects[property.serializationID])) ? property.serialize(seenObjects) : this.serializeAnyObject(property, seenObjects);
			}
			return json;
		},

		/**
		 * Generic deserialization method, can be used to deserialize any object or primitive anywhere by calling {@link L.ALS.Serializable.deserialize}.
		 * @param serialized {Object} Serialized object or primitive
		 * @param seenObjects {Object} Already seen objects' ids. Intended only for internal use.
		 * @return Deserialized object or primitive
		 * @memberOf L.ALS.Serializable
		 */
		deserialize: function (serialized, seenObjects) {
			if (serialized === undefined || serialized === null)
				return serialized;

			if (!(serialized instanceof Object))
				return this.deserializePrimitive(serialized);

			if (serialized.skipDeserialization)
				return undefined;

			if (serialized.serializationReference && seenObjects[serialized.serializationReference])
				return seenObjects[serialized.serializationReference];

			if (serialized.alsSerializableArray) {
				let newObject = [];
				newObject.serializationID = serialized.serializationID;
				this._registerObject(newObject, seenObjects);

				let props = (serialized.propertiesOrder) ? serialized.propertiesOrder : Object.keys(serialized)
				for (let i of props) {
					if (!this._arrayIgnoreList.includes(i))
						newObject[i] = this.deserialize(serialized[i], seenObjects); // Keeps both items and custom properties while preserving array type
				}
				return newObject;
			}

			let object = this.getObjectFromSerialized(serialized, seenObjects);

			let props = (serialized.propertiesOrder) ? serialized.propertiesOrder : Object.keys(object);
			for (let prop of props) {
				if (this.shouldIgnoreProperty(prop, serialized) || this.shouldIgnoreProperty(prop, object, false, true))
					continue;

				let property = (prop in serialized) ? serialized[prop] : object[prop];
				let newProperty;

				if (property.serializableClassName) {
					if (property.skipDeserialization)
						continue;

					let constructor = this.getSerializableConstructor(property.serializableClassName);
					if (constructor.deserialize)
						newProperty = constructor.deserialize(property, seenObjects);
				}

				if (!newProperty)
					newProperty = this.deserialize(property, seenObjects);

				if (newProperty instanceof Object)
					this._registerObject(newProperty, seenObjects);

				let setter = this.findSetter(prop, object);
				if (setter)
					object[setter](newProperty);
				else
					object[prop] = newProperty;
			}
			return object;
		},
	}
});

// Monkey-patch certain types to be serializable

/**
 * Serializes this RegExp
 * @param seenObjects {Object} Already seen objects' ids. Intended only for internal use.
 * @return {Object} Serialized RegExp
 * @instance
 * @memberOf RegExp
 */
RegExp.prototype.serialize = function (seenObjects) {
	let json = L.ALS.Serializable.serializeAnyObject(this, seenObjects);
	json.serializableClassName = "RegExp";
	json.constructorArguments = [this.toString()];
	return json;
}

/**
 * Deserializes this RegExp
 * @param serialized {Object} Serialized RegExp
 * @param seenObjects {Object} Already seen objects' ids. Intended only for internal use.
 * @return {RegExp} Deserialized RegExp
 * @memberOf RegExp
 */
RegExp.prototype.deserialize = function (serialized, seenObjects) {
	return L.ALS.Serializable.deserialize(serialized, seenObjects);
}

/**
 * Serializes this LatLng
 * @param seenObjects {Object} Already seen objects' ids. Intended only for internal use.
 * @return {Object} Serialized LatLng
 * @instance
 * @memberOf L.LatLng
 */
L.LatLng.prototype.serialize = function (seenObjects) {
	let {lat, lng, alt} = this, serialized = {
		serializableClassName: "L.LatLng",
		// L.LatLng.deserialize doesn't seem to be called for some reason, so we have to rely on default mechanism
		constructorArguments: [lat, lng, alt],
	};

	for (let prop in this) {
		if (this.hasOwnProperty(prop))
			serialized[prop] = L.ALS.Serializable.serializeAnyObject(this[prop], seenObjects);
	}
	return serialized;
}

/**
 * Deserializes this LatLng
 * @param serialized {Object} Serialized LatLng
 * @param seenObjects {Object} Already seen objects' ids. Intended only for internal use.
 * @return {L.LatLng} Deserialized LatLng
 * @memberOf L.LatLng
 */
L.LatLng.deserialize = function (serialized, seenObjects) {
	let latLng = L.latLng(serialized.lat, serialized.lng, serialized.alt);
	for (let prop in serialized)
		latLng[prop] = L.ALS.Serializable.deserialize(serialized[prop], seenObjects);
	return latLng;
}