(function() {
  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // Should only be one file.
    map_file = evt.target.files[0];

    if (!map_file.name.match('.*.wo?r?ld')) {
      alert('Not a world file.');
      return FALSE;
    }
    document.getElementById('output').innerHTML = '';

    var writeOut = function(data) {
      var el = document.createElement('li');
      el.innerHTML = data;
      document.getElementById('output').insertBefore(el, null);
    };
    var writeInfoOut = function(label, data) {
      writeOut([
        '<strong>' + label + '</strong> : ',
        '<span>' + data + '</strong>'
      ].join(''));
    };

    var reader = new FileReader();
    reader.onloadend = function(e) {
      if (e.target.readyState == FileReader.DONE) {
        var w = new World().loadWithData(e.target.result);

        console.log(w);
        writeInfoOut('Map Version', w.get('version'));
        writeInfoOut('Map Name Length', w.get('nameLength'));
        writeInfoOut('Map Name', w.get('name'));
        writeInfoOut('Map Bounds (LRTB)', w.getBounds());
        writeInfoOut('Map Size (W x H)', w.getDimensions());

      }
    };

    reader.readAsBinaryString(map_file);

  }

  document.getElementById('file').addEventListener('change', handleFileSelect, false);
})();
