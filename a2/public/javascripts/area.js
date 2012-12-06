a2.area = function(options) {
  var self = this;
  // options.data is equivalent to previous area.serialize() output
  var data = options.data;
  var id = data.id;
  self.$el = $(options.el);
  self.$el.html('');
  self.$el.attr('data-item-area-id', id);

  var itemWrappers = [];
  var itemInfos = data.itemInfos;
  var types = options.types;

  self.add = function(itemInfo) {
    var itemWrapper = new a2.itemWrapper({ container: self }, itemInfo);
    // item type not available in this project
    if (itemWrapper === false) {
      return;
    }
    itemWrappers.push(itemWrapper);
    self.$el.append(itemWrapper.$el);
  };

  _.each(itemInfos, function(itemInfo) {
    self.add(itemInfo);
  });

  // We strive to separate data from presentation, but once the user re-sorts the list
  // with jQuery UI Sortable, we do have to look at the item wrapper elements and pull
  // their data-item-wrapper-id attributes in order to reconstruct the new itemWrapper array.

  self.$el.sortable({
    handle: '[data-item-wrapper-sort-handle]',
    connectWith: '[data-item-area-id]',
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

  // Helper for sortable. Allows the itemWrappers array to reflect
  // the actual order of the elements again after a jquery UI drag and drop operation.
  // Also reflects removal of an item via dragging and addition of a new item
  // via dragging
  function reflectOrder() {
    itemWrappers.length = 0;
    self.$el.children().filter('[data-item-wrapper-id]').each(function(index, itemWrapperEl) {
      var itemWrapper = $(itemWrapperEl).data('itemWrapper');
      itemWrapper.setContainer(self);
      itemWrappers.push(itemWrapper);
    });
  }

  self.itemWrapperRemoved = function(itemWrapper) {
    itemWrappers = _.without(itemWrappers, itemWrapper);
  };

  self.serialize = function() {
    var info = {
      id: id,
      itemInfos: []
    };
    _.each(itemWrappers, function(itemWrapper) {
      info.itemInfos.push(itemWrapper.serialize());
    });
    return info;
  };
};
