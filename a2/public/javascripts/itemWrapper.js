a2.itemWrapper = function(options, itemInfo)
{
  var defaultTemplate =
  '<li>' +
    '<p><a href="#" data-item-wrapper-sort-handle>#</a> <a href="#" data-item-wrapper-delete>x</a></p>' +
    '<div data-item="1"></div>' +
  '</li>';

  var self = this;

  // Will be null for a brand new item
  self.permId = (options.permId === undefined) ? null: options.permId;

  // It is useful to have a unique identifier for this
  // particular session of the item wrapper in the page. For instance
  // a slideshow slot will need a temporary identifier for its
  // scratch space when uploading files, and will sync to permanent
  // space when the entire area is saved. This is not a permanent
  // database identifier

  self.tempId = a2.generateId();

  if (!a2.types[itemInfo.type]) {
    // "Aaaaand Sir Type Not Appearing In This Project." - Monty Python
    return false;
  }

  itemInfo.tempId = self.tempId;
  itemInfo.permId = self.permId;
  self.item = new a2.types[itemInfo.type].constructor(itemInfo);
  self.$el = $(
    a2.template('itemWrapper', defaultTemplate, { })
  );
  self.$el.attr('data-item-wrapper-temp-id', self.tempId);
  self.$el.attr('data-item-wrapper-perm-id', self.permId);

  // To enable jQuery UI drag and drop straightforwardly the DOM elements need to
  // carry references to the corresponding itemWrapper objects
  self.$el.data('itemWrapper', self);

  self.$el.find('[data-item-wrapper-delete]').click(function() {
    self.remove();
    return false;
  });

  self.remove = function(){
    self.$el.remove();
    options.container.itemWrapperRemoved(self);
  };

  // After the remove handler so it doesn't accidentally match any sub-areas that might exist
  self.$el.find('[data-item]').replaceWith(self.item.$el);

  self.serialize = function() {
    return {
      type: itemInfo.type,
      tempId: self.tempId,
      permId: self.permId,
      data: self.item.serialize()
    };
  };

  self.setContainer = function(container) {
    options.container = container;
  };
};

