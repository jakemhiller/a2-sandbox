a2.itemWrapper = function(options, itemInfo)
{
  var defaultTemplate =
  '<li>' +
    '<p><a href="#" data-item-wrapper-sort-handle>#</a> <a href="#" data-item-wrapper-delete>x</a></p>' +
    '<div data-item="1"></div>' +
  '</li>';

  var self = this;

  // It is useful to have a unique identifier for this
  // particular session of the item wrapper in the page. For instance
  // a slideshow slot will need a temporary identifier for its
  // scratch space when uploading files, and will sync to permanent
  // space when the entire area is saved. This is not a permanent
  // database identifier

  self.id = a2.generateId();
  if (!a2.types[itemInfo.type])
  {
    // Sir Type Not Appearing In This Project
    return false;
  }
  self.item = new a2.types[itemInfo.type].constructor(itemInfo);
  self.$el = $(
    a2.template('itemWrapper',
      defaultTemplate, { }));
  self.$el.attr('data-item-wrapper-id', self.id);

  // To enable jQuery UI drag and drop straightforwardly the DOM elements need to
  // carry references to the corresponding itemWrapper objects
  self.$el.data('itemWrapper', self);

  self.$el.find('[data-item-wrapper-delete]').click(function()
  {
    self.remove();
    return false;
  });

  self.remove = function()
  {
    self.$el.remove();
    options.container.itemWrapperRemoved(self);
  }

  // After the remove handler so it doesn't accidentally match any sub-areas that might exist
  self.$el.find('[data-item]').replaceWith(self.item.$el);

  self.serialize = function()
  {
    return {
      type: itemInfo.type,
      data: self.item.serialize()
    };
  }

  self.setContainer = function(container)
  {
    options.container = container;
  }
};

