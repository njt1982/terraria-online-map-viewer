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
      var el = document.createElement('li');
      el.innerHTML = data;
      document.getElementById('output').insertBefore(span, null);
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

        writeInfoOut('Map Version', f.getShortAt(0, 0));

        var mapNameLength = f.getShortAt(8);
        writeInfoOut('Map Name Length', mapNameLength);
        writeInfoOut('Map Name', f.getStringAt(12, mapNameLength));
      }
    };

    reader.readAsBinaryString(map_file);

  }

  document.getElementById('file').addEventListener('change', handleFileSelect, false);
})();
