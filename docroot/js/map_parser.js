(function() {
  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // Should only be one file.
    map_file = evt.target.files[0];

    if (!map_file.name.match('.*.world')) {
      alert('Not a world file.');
      return FALSE;
    }

    var writeOut = function(data) {
      var span = document.createElement('span');
      span.innerHTML = data;
      document.getElementById('output').insertBefore(span, null);
    };
    var writeInfoOut = function(label, data) {
      writeOut([
        '<strong>' + label + '</strong> :',
        '<span>' + data + '</strong>'
      ].join(''));
    };

    // var reader = new FileReader();
    // reader.onloadend = function(e) {
    //   console.log(e);
    //   if (e.target.readyState == FileReader.DONE) {
    //     writeInfoOut('Map Version', e.target.result);
    //   }
    // };

    // var blob = map_file.slice(0, 4);
    // reader.readAsBinaryString(blob);

    // var reader = new FileReader();
    // reader.onloadend = function(e) {
    //   if (e.target.readyState == FileReader.DONE) {
    //     console.log(e);
    //     var r = new Int32Array(e.target.result, 0, 1);
    //     console.log(r);
    //   }
    // };
    // reader.readAsArrayBuffer(map_file);


    var reader = new FileReader();
    reader.onloadend = function(e) {
      if (e.target.readyState == FileReader.DONE) {
        console.log(e);
        var header = bitratchet.record({
          version: bitratchet.number({ length : 16 }),
          world_name_length: bitratchet.number({ length : 8 }),
          world_name: bitratchet.string({ length: 11 * 8 })
        });
        console.log(
          header.parse(e.target.result).data
        );
      }
    };
    reader.readAsArrayBuffer(map_file);


  }

  document.getElementById('file').addEventListener('change', handleFileSelect, false);
})();
