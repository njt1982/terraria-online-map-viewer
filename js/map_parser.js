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

    var map = document.getElementById('map');
    map.innerHTML = '';

    var writeOut = function(data) {
      var el = document.createElement('li');
      el.innerHTML = data;
      document.getElementById('output').insertBefore(el, null);
    };
    var writeInfoOut = function(label, data) {
      if (data instanceof Array) {
        data = data.join(', ');
      }

      writeOut([
        '<strong>' + label + '</strong> : ',
        '<span>' + data + '</strong>'
      ].join(''));
    };

    var reader = new FileReader();
    var w = new World();
    w.setMapElement(document.getElementById('map'));
    w.setDebugElement(document.getElementById('debug'));

    reader.onloadend = function(e) {
      if (e.target.readyState == FileReader.DONE) {

        vkthread.exec(
          function(data) {
            return new World().loadWithData(data).serialize();
          },
          [ e.target.result ],
          function (s) {
            w.properties = s.properties;
            w.tiles = s.tiles;
            w.tileStats = s.tileStats;
            w.chests = s.chests;
            w.signs = s.signs;
            w.npcs = s.npcs;


            for (var key in w.properties) { writeInfoOut(key, w.get(key)); }

            w.renderMap();
          },
          ['/js/World.js', '/js/BinaryFile.js', '/js/classes.binary-parser/binary-parser.js']
        );
      }
    };

    reader.readAsBinaryString(map_file);

  }

  document.getElementById('file').addEventListener('change', handleFileSelect, false);
})();
