/*
 * text
 *
 * Copyright (c) 2012 P'unk Avenue LLC
 * Licensed under the MIT license.
 */

var check = require('validator').check;
var sanitize = require('validator').sanitize;

// So the public folder's location can be determined
exports.dirname = __dirname + '/..';

// Called when editing of a previously stored item
// begins, this method should sync any external assets
// from permanent to temporary storage. Refer to
// itemInfo.tempId and itemInfo.permId. If your type
// requires no storage outside the JSON-friendly itemInfo
// object, you need only invoke the callback immediately.

exports.open = function(itemInfo, callback) {
  callback(null, itemInfo);
};

// Takes a callback, so time-consuming asynchronous validation and
// syncing operations are permissible but not mandatory. In addition to
// cleanup and validation this method is responsible for storing anything
// that needs to be stored outside the actual JSON-friendly itemInfo
// object. If you need such permanent external storage, refer to
// itemInfo.permId, which is guaranteed to be a highly random
// 32-digit hex string unique to this item. If you need to sync from a
// temporary to a permanent space, refer to itemInfo.tempId as well.

exports.validate = function(itemInfo, options, callback) {
  var e;
  try {
    var text = itemInfo.data.text;
    if (typeof(text) !== 'string')
    {
      throw "text property is absent or not a string";
    }
    // Later we need to eliminate unwanted tags attributes and styles
    // as we do in A1. This is proof of concept for the validation system
    text = sanitize(text).xss();
    itemInfo.data = { text: text };
    callback(null, itemInfo);
  } catch (event) {
    console.log(event);
    console.log(event.stack);
    callback(e, null);
  }
};
