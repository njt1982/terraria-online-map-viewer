(function() {
  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // Should only be one file.
    map_file = evt.target.files[0];

    if (!map_file.name.match('.*\.world')) {
      alert('Not a world file.');
      return FALSE;
    }

    var reader = new FileReader();
    reader.onload = (function(theFile) {
      console.log(theFile);
      return function(e) {
        console.log(e);
        var span = document.createElement('span');
        span.innerHTML = [e.target.result].join('');

        document.getElementById('output').insertBefore(span, null);
      };
    })(map_file);

    reader.readAsBinaryString(map_file);

    //document.getElementById('output').innerHTML = '<ul>' + output.join('') + '</ul>';
  }

  document.getElementById('file').addEventListener('change', handleFileSelect, false);
})();
