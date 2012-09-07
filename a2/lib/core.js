/*
 * a2-core
 *
 * Copyright (c) 2012 P'unk Avenue LLC
 * Licensed under the MIT license.
 */
// Require Modules
var _ = require('underscore');
var crypto = require('crypto');
var express = require('express');
var fs = require('fs');

var options;
var app;
var itemTypes = {};

// Asset configuration
var assets = {
  scripts: {
    edit: [ '/a2/core/js/core.js', '/a2/core/js/area.js', '/a2/core/js/itemWrapper.js' ]
  }
};

// Private Functions

function registerItemType(itemTypeName, itemType) {
  itemTypes[itemTypeName] = itemType;
  // Cheap way to add item type assets to global assets
  assets.scripts.edit.push('/a2/itemTypes/' + itemTypeName + '/js/type.js');
}

function registerStaticRoutes(app) {
  // Each type has a public folder
  _.each(options.itemTypeNames, function(name) {
    var path = '/a2/itemTypes/' + name;
    var folder = itemTypes[name].dirname + '/public';
    app.use(path, express.static(folder));
  });
  // One level up and over from the lib folder of the core to the public folder of the core
  var folder = __dirname + '/../public';
  app.use('/a2/core', express.static(folder));

  return app;
}

// "Private methods" for this closure, implementing any details of
// the above that we'd rather not expose (perhaps more of these should
// be overrideable)

// Register the item types that the project requested. Locate them in
// one of the extensions folders that the project declared. These may be
// in modules like a2-core and a2-blog (eventually) or in the project.

function registerItemTypes() {
  _.each(options.extensions, function(folder) {
    var itemTypeNames = fs.readdirSync(folder + '/items');
    _.each(itemTypeNames, function(itemTypeName) {
      var folderPath = folder + '/items/' + itemTypeName;
      var stats = fs.statSync(folderPath);
      if (stats.isDirectory()) {
        if (_.include(options.itemTypeNames, itemTypeName)) {
          if (!_.has(itemTypes, itemTypeName)) {
            registerItemType(itemTypeName, require(folderPath + '/lib/core'));
          }
          else {
            throw "The type " + itemTypeName + " was already registered.";
          }
        }
      }
    });
  });
}

// Ensure the id looks like a 32 digit hex string. 

function validateId(id) {
  if (typeof(id) !== 'string') {
    return false;
  }
  
  if (!id.match(/^[0-9a-f]{32}$/)) {
    return false;
  }
  
  return true;
}

// Generate 32 digit hex id from the strongest crypto source known

function generateId() {
  var buf = crypto.randomBytes(16);
  return buf.toString('hex');
}


//                      Public Methods
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

exports.bootstrap = function(appArg, optionsArg) {

  // Create our context in the app, and a convenient reference to that
  // A public property to access options is convenient for the caller

  app = appArg;

  options = optionsArg;

  assets = assets;

  registerItemTypes();

  app = registerStaticRoutes(app);

  app.locals.a2 = {};
  app.locals.a2.scripts = require('./scripts')(assets);
};

// Render the normal view of an area. 
exports.renderArea = function(data, options) {

};

// Prepare an existing content area to be edited by generating a
// tempId for each item and giving each item's open() method a chance
// to asynchronously sync any externally stored materials to a
// temporary working space

// TODO: take default options from the global options object,
// then merge with these

exports.openArea = function(data, options, callback) {
  if (!options)
  {
    options = {};
  }

  _.defaults(options, { typeOptions: { }});

  var unopened = data.itemInfos.length;
  var complete = false;
  _.each(data.itemInfos, function(itemInfo) {
    if (!options.typeOptions[itemInfo.type])
    {
      options.typeOptions[itemInfo.type] = {};
    }

    itemInfo.tempId = generateId();
    if (!_.has(itemTypes, itemInfo.type)) {
      // No such item type or not in this project anymore
      unopened--;
      return;
    }
    itemTypes[itemInfo.type].open(itemInfo, function(err, itemInfo) {
      unopened--;
      if (!unopened)
      {
        callback(null, data);
        complete = true;
      }
    });
  });
  if ((!unopened) && (!complete))
  {
    callback(null, data);
  }
};

// Validate the submitted data structure and invoke the callback
// with any error (in the case of serious failures only), or with null
// and a cleaned-up version of the data structure in which each item
// has been successfully cleaned by the validate method of its own type.
// Individual items that fail validation entirely are discarded.
//
// Any types that require external storage do so as part of their
// own validate methods. Such storage may be asynchronous. The
// callback function of validateArea is not invoked until all items
// have completed validation.
//
// validateArea also establishes a permId for each item that does not
// yet have one. Type-specific validators use the permId to associate
// content in external storage, like files, with this item.
//
// Type-specific options may be passed like this and will be passed
// through as the options argument of the individual type's validator:
//
// { typeOptions: { myTypeName: { myOption: value }}}

exports.validateArea = function(data, options, callback) {
  // Catch really heinous things like data not being
  // an object or data.itemInfos not being an array
  // via an exception handler. Otherwise, clean up
  // what was sent to us (in preference to refusing to
  // validate it), and invoke the callback with a cleaned
  // up, storage-ready data structure

  // We NEVER use the exception handler to catch asynchronous errors.
  // Just the stuff that happens at this level.

  if (!options)
  {
    options = {};
  }

  _.defaults(options, { typeOptions: { }});
  var e;
  try {
    var validData = {};
    _.defaults(data, { itemInfos: [] });
    _.defaults(validData, { itemInfos: [] });
    // Validation is asynchronous. This allows time for
    // time-consuming operations to complete in parallel.
    // Keep a count of items that are still validating.
    var validating = data.itemInfos.length;
    var complete = false;
    _.each(data.itemInfos, function(itemInfo) {
      try {
        // Validate the wrapper level
        if (!_.has(itemTypes, itemInfo.type)) {
          // No such item type or not in this project anymore
          throw "No such itemType";
        }
        var validItemInfo = { type: itemInfo.type };
        if (!validateId(itemInfo.tempId)) {
          throw "Invalid tempId";
        }
        validItemInfo.tempId = itemInfo.tempId;
        if (!validateId(itemInfo.permId)) {
          validItemInfo.permId = generateId();
        }
        else
        {
          validItemInfo.permId = itemInfo.permId;
        }
      } catch (e) {
        console.log("Exception:");
        console.log(e);
        console.log(e.stack);
        // Make sure we still decrement 'validating' when flunking something
        validating--;
        return;
      }
      // Validate at the type level. This is the asynchronous part

      if (!options.typeOptions[itemInfo.type])
      {
        options.typeOptions[itemInfo.type] = {};
      }
      validItemInfo.data = itemInfo.data;
      itemTypes[itemInfo.type].validate(validItemInfo, options.typeOptions[itemInfo.type], function(err, itemInfo) {
        validating--;
        if (!err) {
          validItemInfo = itemInfo;
          validData.itemInfos.push(validItemInfo);
        }
        if (!validating) {
          complete = true;
          callback(null, validData);
        }
      });
    });
    // If the last item is invalid at the wrapper level we can
    // reach this point without noticing that 'validating' is 0,
    // so repeat that check here after making sure we haven't
    // already invoked the callback
    if ((!validating) && (!complete)) {
      complete = true;
      callback(null, validData);
    }
  } catch (e) {
    callback(e, null);
  }
};

// Not limited to depth 3 like regular console.log
// https://groups.google.com/forum/?fromgroups=#!topic/nodejs-dev/NmQVT3R_4cI
exports.log = function(obj) {
  console.log(require('util').inspect(obj, true, 50));
};
