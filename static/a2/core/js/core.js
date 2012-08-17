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

  a2.contentArea = function(options)
  {
    var self = this;
    // options.data is equivalent to previous contentArea.serialize() output
    var data = options.data;
    var id = data.id;
    self.$el = $(options.el);
    self.$el.html('');
    self.$el.attr('data-content-area-id', id);
    var contentWrappers = [];
    var contentInfos = data.contentInfos;
    var types = options.types;

    self.add = function(contentInfo)
    {
      var contentWrapper = new a2.contentWrapper({ container: self }, contentInfo);
      // Content type not available in this project
      if (contentWrapper === false)
      {
        return;
      }
      contentWrappers.push(contentWrapper);
      self.$el.append(contentWrapper.$el);
    }

    _.each(contentInfos, function(contentInfo) {
      self.add(contentInfo);
    });

    // We strive to separate data from presentation, but once the user re-sorts the list
    // with jQuery UI Sortable, we do have to look at the content wrapper elements and pull
    // their data-content-wrapper-id attributes in order to reconstruct the new contentWrapper array.

    self.$el.sortable({
      handle: '[data-content-wrapper-sort-handle="1"]',
      connectWith: '[data-content-area-id]',
      // Move within an area
      update: function(event, ui) {
        reflectOrder();
      },
      // Received from another area
      receive: function(event, ui) {
        reflectOrder();
      },
      // Sent to another area
      remove: function(event, ui) {
        reflectOrder();
      }

    });

    // Helper for sortable. Allows the contentWrappers array to reflect
    // the actual order of the elements again after a jquery UI drag and drop operation.
    // Also reflects removal of an item via dragging and addition of a new item
    // via dragging
    function reflectOrder()
    {
      contentWrappers.length = 0;
      self.$el.children().filter('[data-content-wrapper-id]').each(function(index, contentWrapperEl) {
        var contentWrapper = $(contentWrapperEl).data('contentWrapper');
        contentWrapper.setContainer(self);
        contentWrappers.push(contentWrapper);
      });
    }

    self.contentWrapperRemoved = function(contentWrapper)
    {
      contentWrappers = _.without(contentWrappers, contentWrapper);
    }

    self.serialize = function()
    {
      var info = {
        id: id,
        contentInfos: []
      };
      _.each(contentWrappers, function(contentWrapper) {
        info.contentInfos.push(contentWrapper.serialize());
      });
      return info;
    }
  };

  a2.contentWrapper = function(options, contentInfo)
  {
    var self = this;
    
    // It is useful to have a unique identifier for this
    // particular session of the content wrapper in the page. For instance
    // a slideshow slot will need a temporary identifier for its
    // scratch space when uploading files, and will sync to permanent
    // space when the entire area is saved. This is not a permanent
    // database identifier

    self.id = a2.generateId();
    var typeConstructor = a2.types[contentInfo.type];
    if (!typeConstructor)
    {
      // Sir Type Not Appearing In This Project
      return false;
    }
    self.content = new a2.types[contentInfo.type].constructor(contentInfo);
    self.$el = $(
      a2.template('contentWrapper', 
        a2.contentWrapperDefaultTemplate, { }));
    self.$el.attr('data-content-wrapper-id', self.id);

    // To enable jQuery UI drag and drop straightforwardly the DOM elements need to
    // carry references to the corresponding contentWrapper objects
    self.$el.data('contentWrapper', self);

    self.$el.find('[data-content="1"]').replaceWith(self.content.$el);

    self.$el.find('[data-content-wrapper-delete="1"]').click(function()
    {
      self.remove();
      return false;
    });

    self.remove = function()
    {
      self.$el.remove();
      options.container.contentWrapperRemoved(self);
    }

    self.serialize = function()
    {
      return {
        type: contentInfo.type,
        data: self.content.serialize()
      };
    }

    self.setContainer = function(container)
    {
      options.container = container;
    }
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

  a2.log = function(m)
  {
    if (console.log)
    {
      console.log(m);
    }
  }

  a2.contentWrapperDefaultTemplate = 
    '<li>' +
      '<p><a href="#" data-content-wrapper-sort-handle="1">#</a> <a href="#" data-content-wrapper-delete="1">x</a></p>' +
      '<div data-content="1"></div>' +
    '</li>';
})();

