/*
*       Scripts Middleware Helper
* Loops through assets to build the script tags.
* 
* For now, it assumes only an edit mode. 
* 
* Can easily be built out to run build tasks on production 
* to cat/minify scripts and only supply a single script tag
*/

var _ = require('underscore');

module.exports = function scripts(assets, options){
  options = options || {};

  if (assets) {
    return _.reduce(assets.scripts.edit, function(memo, script) {
      return memo + '<script src="' + script + '"></script>' + "\n";
    }, '');
  } else {
    return null;
  }
};