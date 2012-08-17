// The sole global object in the window.* namespace. Or else.

window.a2 = {};

(function() {
  var a2 = window.a2;

  a2.types = [];

  a2.registerType = function(options)
  {
    a2.types[options.name] = options;
  };

  a2.contentArea = function(options)
  {
    var self = this;
    // options.data is equivalent to previous contentArea.serialize() output
    var data = options.data;
    var id = data.id;
    self.editId = a2.generateId();
    self.$el = $(options.el);
    self.$el.html('');
    var contentWrappers = [];
    var contentInfos = data.contentInfos;
    var types = options.types;
    _.each(contentInfos, function(contentInfo) {
      var contentWrapper = new a2.contentWrapper(options, contentInfo);
      if (contentWrapper === false)
      {
        return;
      }
      contentWrappers.push(contentWrapper);
      self.$el.append(contentWrapper.$el);
    });

    self.serialize = function()
    {
      var info = {
        id: options.id,
        editId: self.editId,
        contentInfos: []
      };
      _.each(contentWrappers, function(contentWrapper) {
        info.contentInfos.push(contentWrapper.content.serialize());
      });
      return info;
    }
  };

  a2.contentWrapper = function(options, contentInfo)
  {
    var self = this;
    var id = a2.generateId();
    var typeConstructor = a2.types[contentInfo.type];
    if (!typeConstructor)
    {
      // Sir Type Not Appearing In This Project
      return false;
    }

    self.content = new a2.types[contentInfo.type].constructor(contentInfo);
    self.$el = $(
      a2.template('contentWrapper', 
        a2.contentWrapperDefaultTemplate,
        { id: id, editId: options.editId }));
    self.$el.find('[data-content="1"]').replaceWith(self.content.$el);
  };

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

  a2.contentTypeTemplate = function(name, subname, data)
  {
    return a2.template('contentType-' + name + '-' + subname, a2.types[name].defaultTemplate, data);
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

  a2.contentWrapperDefaultTemplate = 
    '<li>' +
      '<p><a href="#">#</a> <a href="#">x</a></p>' +
      '<div data-content="1"></div>' +
    '</li>';
})();

