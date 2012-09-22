// The following code is not canonical A2, not yet anyway. It's here to demonstrate that the
// serialization and validation features work as they are supposed to.

loadArea({ id: 'body' });
loadArea({ id: 'sidebar' });

function loadArea(options)
{
  $.getJSON('/admin/area/' + options.id, function(data) {
    console.log("getJSON received:");
    console.log(data);
    areaUi({ id: options.id, data: data });
  });
}

function areaUi(options)
{
  var id = options.id;
  var data = options.data;
  data.id = id;
  console.log('starting areaUi data is:');
  console.log(data);

  editView();

  function editView()
  {
    var area;
    recreateArea();

    var typeButtons = $('<div class="btn-group"></div>');
    _.each(a2.typeNames, function(typeName) {
      var type = a2.types[typeName];
      var button = $('<a class="btn" href="#">');
      button.text('+ ' + type.label);
      button.click(function() {
        area.add({ type: type.name, data: type.defaultData });
      });
      typeButtons.append(button);
    });

    var actionButtons = $('<div class="btn-group"><a href="#" class="save btn">Save</a> <a href="#" class="revert btn">Revert</a></div>');
    actionButtons.find('.save').click(function() {
      $.ajax('/admin/area/' + options.id, { type: 'PUT', data: area.serialize() }, function(response) {
        data = response;
      }, 'json');
      return false;
    });
    actionButtons.find('.revert').click(function() {
      recreateArea();
      return false;
    });
    $('.' + options.id).prepend(typeButtons);
    $('.' + options.id).append(actionButtons);
    function recreateArea()
    {
      console.log('recreateArea data is:');
      console.log(data);
      area = new a2.area({
        id: id,
        el: '.' + id + ' .wrapper',
        data: data
      });
    }
  }
}
