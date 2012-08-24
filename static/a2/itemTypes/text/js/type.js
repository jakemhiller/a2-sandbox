window.a2.registerType({
  name: 'text',
  label: 'Text',
  constructor: function(options)
  {
    var self = this;
    var a2 = window.a2;
    self.$el = $(a2.itemTypeTemplate(options.type, 'edit', options.data));
    self.serialize = function()
    {
      return {
        'text': a2.findAndSelf(self.$el, '[data-text]').val()
      };
    };
  },
  defaultData: { text: '' },
  defaultTemplate: '<textarea data-text><%= text %></textarea>'
});
