window.a2.registerType({
  name: 'text',
  label: 'Text',
  constructor: function(options) {
    var self = this;
    var a2 = window.a2;
    self.$el = $(a2.itemTypeTemplate(options.type, 'edit', options.data));
    self.editor = a2.findAndSelf(self.$el, '[data-text]');
    self.editor.html(options.data.text);
    enableControl('bold');
    enableControl('italic');
    enableControl('createLink', 'URL:');
    enableControl('unlink');
    self.serialize = function() {
      return {
        'text': self.editor.html()
      };
    };
    function enableControl(command, promptForLabel) {
      self.$el
        .off('click', '[data-' + command + ']')
        .on('click', '[data-' + command + ']', function() {

        var arg = null;
        if (promptForLabel) {
          arg = prompt(promptForLabel);
          if (!arg) {
            return false;
          }
        }
        document.execCommand(command, false, arg);
        return false;

      })
        .off('mousedown', '[data-' + command + ']')
        .on('mousedown', '[data-' + command + ']', function(e) {
        // Must prevent default on mousedown or the rich text editor loses the focus
        e.preventDefault();
        return false;
      });
    }
  },
  defaultData: { text: '' },
  defaultTemplate: '<div class="row button-group">' +
      '<a class="button small link" data-bold><i class="icon-bold"></i>Bold</li>' +
      '<a class="button small link" data-italic><i class="icon-italic"></i>Italic</li>' +
      '<a class="button small link" data-createLink>Link</li>' +
      '<a class="button small link" data-unlink>Unlink</li>' +
      "</div>" +
      '<div class="a2-rich-text-editor" contentEditable="true" data-text></div>' +
    '</div>'
});
