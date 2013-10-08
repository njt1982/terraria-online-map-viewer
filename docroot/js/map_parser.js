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
      console.log(e);
      if (e.target.readyState == FileReader.DONE) {
        var f = new BinaryFile(e.target.result);
        var p = 0;

        var mapVersion = f.getLongAt(p);
        writeInfoOut('Map Version', mapVersion);
        p += 4;

        // This seems wrong?!
        // For some reason, iOS Terraria has a 4 byte gap here?!
        var mapNameLength;
        if (mapVersion === 49) {
          p += 4;
          mapNameLength = f.getByteAt(p);
          p += 4;
        }
        else {
          mapNameLength = f.getByteAt(p);
          p += 1;
        }

        writeInfoOut('Map Name Length', mapNameLength);

        writeInfoOut('Map Name', f.getStringAt(p, mapNameLength));
        p += mapNameLength;

        // World ID
        var worldID = f.getLongAt(p); p += 4;

        // World Bound - rect
        var left   = f.getLongAt(p); p += 4;
        var right  = f.getLongAt(p); p += 4;
        var top    = f.getLongAt(p); p += 4;
        var bottom = f.getLongAt(p); p += 4;

        writeInfoOut('Map Bounds (LRTB)', [left, right, top, bottom].join(', '));

        var height = f.getLongAt(p); p += 4;
        var width  = f.getLongAt(p); p += 4;
        writeInfoOut('Map Size (W x H)', [width, height].join(' x '));

      }
    };

    reader.readAsBinaryString(map_file);

  }

  document.getElementById('file').addEventListener('change', handleFileSelect, false);
})();
