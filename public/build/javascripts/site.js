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
    var areaSelector = '[data-a-area-'+id+']';
    var areaEl = $(areaSelector);

    recreateArea();

    var typeButtons = $('<div class="btn-group"></div>');
    _.each(a2.typeNames, function(typeName) {
      var type = a2.types[typeName];
      var button = $('<a class="button" href="#">');
      button.text('+ ' + type.label);
      button.click(function() {
        area.add({ type: type.name, data: type.defaultData });
      });
      typeButtons.append(button);
    });

    var actionButtons = $('<div class="button-group"><a href="#" data-a-save class="button">Save</a> <a href="#" data-a-revert class="button">Revert</a></div>');

    actionButtons.on('click', '[data-a-save]', function() {
      $.ajax('/admin/area/' + options.id, { type: 'PUT', data: area.serialize() }, function(response) {
        data = response;
      }, 'json');
      return false;
    });

    actionButtons.on('click', '[data-a-revert]', function() {
      recreateArea();
      return false;
    });

    areaEl.prepend(typeButtons);
    areaEl.append(actionButtons);

    function recreateArea()
    {
      console.log('recreateArea data is:');
      console.log(data);
      area = new a2.area({
        id: id,
        el: areaSelector + ' .wrapper',
        data: data
      });
    }
  }
}
