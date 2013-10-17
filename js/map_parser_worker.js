

function debug(message) {
  postMessage(JSON.stringify({
    op: 'debug',
    data: message
  }));
}

function op_Parse(data) {
  importScripts('World.js', 'BinaryFile.js', 'classes.binary-parser/binary-parser.js');
  return new World().loadWithData(data).serialize();
}


onmessage = function(e) {
  var message = JSON.parse(e.data);
  switch (message.op) {
    case 'parse': postMessage(op_Parse(message.data));
  }
};
