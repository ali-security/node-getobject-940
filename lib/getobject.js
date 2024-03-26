/*
 * getobject
 * https://github.com/cowboy/node-getobject
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 */

'use strict';

var getobject = module.exports = {};

// Split strings on dot, but only if dot isn't preceded by a backslash. Since
// JavaScript doesn't support lookbehinds, use a placeholder for "\.", split
// on dot, then replace the placeholder character with a dot.
function getParts(str) {
  return str.replace(/\\\./g, '\uffff').split('.').map(function(s) {
    return s.replace(/\uffff/g, '.');
  });
}

// Get the value of a deeply-nested property exist in an object.
getobject.get = function(obj, parts, create) {
  if (typeof parts === 'string') {
    parts = getParts(parts);
  }

  var part;
  while (typeof obj === 'object' && obj && parts.length) {
    part = parts.shift();
    if (!(part in obj) && create) {
      obj[part] = {};
    }
    obj = obj[part];
  }

  return obj;
};

// Set a deeply-nested property in an object, creating intermediary objects
// as we go.
getobject.set = function(obj, parts, value) {
  parts = getParts(parts);

  // Check if '__proto__' exists in parts
  var found = false;
  for (var i = 0; i < parts.length; i++) {
    if (parts[i] === '__proto__') {
      found = true;
      break;
    }
  }

  if (found) {
    // do not allow setting of __proto__. See CVE-2020-28282.
    return;
  }

  var prop = parts.pop();
  obj = getobject.get(obj, parts, true);
  if (obj && typeof obj === 'object') {
    return (obj[prop] = value);
  }
};

// Does a deeply-nested property exist in an object?
getobject.exists = function(obj, parts) {
  parts = getParts(parts);

  var prop = parts.pop();
  obj = getobject.get(obj, parts);

  return typeof obj === 'object' && obj && prop in obj;
};
