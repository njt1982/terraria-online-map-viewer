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
    var writeStatus = function(status) {
      document.getElementById('debug').innerHTML = status;
      console.log(status);
    };



    writeStatus('Loading File');

    var w;

    var reader = new FileReader();
    reader.onloadend = function(e) {
      if (e.target.readyState == FileReader.DONE) {

        var worker = new Worker('js/map_parser_worker.js');
        worker.onmessage = function (e) {
          response = e.data;
          switch (response.op) {
            case 'debug' : writeStatus(response.data); break;

            case 'world_data' :
              writeStatus('World data complete');
              w = new World(
                  response.data.properties,
                  response.data.tiles,
                  response.data.tileStats,
                  response.data.chests,
                  response.data.signs,
                  response.data.npcs
                );
              writeStatus('Writing properties');

              for (var key in w.properties) { writeInfoOut(key, w.get(key)); }

              writeStatus('Generating map');

              worker.postMessage({
                op: 'renderMap',
                tiles: w.tiles,
              });
              break;

            case 'mapPixels' :
              writeStatus('Rendering canvas from pixels');
              var buffer = document.createElement('canvas');
              buffer.width = w.get('TilesWide');
              buffer.height = w.get('TilesHigh');

              var div = document.createElement('div');
              div.insertBefore(buffer, null);

              var ctx = buffer.getContext('2d');
              ctx.fillStyle = '#FFF';
              ctx.fillRect(0, 0, buffer.width, buffer.height);

              var imagedata = ctx.getImageData(0, 0, buffer.width, buffer.height);
              var pixels = new Uint8Array(response.data);
              imagedata.data.set(pixels);
              ctx.putImageData(imagedata, 0, 0);

              map.insertBefore(div, null);
              writeStatus('Rendering map complete');

              break;

            default :
              console.log(response);
              break;
          }
        };

        writeStatus('Beginning Parsing');
        worker.postMessage({
          op: 'parse',
          data: e.target.result
        });
      }
    };

    reader.readAsBinaryString(map_file);

  }

  document.getElementById('file').addEventListener('change', handleFileSelect, false);
})();
