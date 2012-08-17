window.a2.registerType({
  name: 'text',
  label: 'Text',
  constructor: function(options)
  {
    var self = this;
    var a2 = window.a2;
    self.$el = $(a2.contentTypeTemplate(options.type, 'edit', options.data));
    self.serialize = function()
    {
      return {
        'text': a2.findAndSelf(self.$el, '[data-text="1"]').val()
      };
    };
  },
  defaultData: { text: '' },
  defaultTemplate: '<textarea data-text="1"><%= text %></textarea>'
});
