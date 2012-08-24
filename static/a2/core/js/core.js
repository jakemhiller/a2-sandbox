// The sole global object in the window.* namespace. Or else.

window.a2 = {};

(function() {
  var a2 = window.a2;

  a2.types = {};
  a2.typeNames = [];

  a2.registerType = function(options)
  {
    a2.types[options.name] = options;
    a2.typeNames.push(options.name);
  };

  a2.itemTypeTemplate = function(name, subname, data)
  {
    return a2.template('itemType-' + name + '-' + subname, a2.types[name].defaultTemplate, data);
  };

  a2.generateId = function()
  {
    return String(Math.floor((Math.random() * 2000000000))) + String(Math.floor((Math.random() * 2000000000)));
  };

  // Like $.find(), but matches elements contained by e *and* e itself if e also matches
  // the selector
  a2.findAndSelf = function(e, selector)
  {
    return e.find(selector).add(e.filter(selector));
  };

  a2.log = function(m)
  {
    if (console.log)
    {
      console.log(m);
    }
  }

  a2.templates = {};

  a2.template = function(name, defaultTemplate, data)
  {
    if (!_.has(a2.templates, name))
    {
      var id = '#a2-template-' + name;
      var $template = $(id);
      var templateSource;
      if (!$template.length)
      {
        templateSource = defaultTemplate;
      }
      else
      {
        templateSource = $template.html();
      }
      a2.templates[name] = _.template(templateSource);
    }
    if (data)
    {
      return a2.templates[name](data);
    }
  };
})();

