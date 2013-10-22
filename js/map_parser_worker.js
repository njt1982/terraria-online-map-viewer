

function debug(message) {
  postMessage({
    op: 'debug',
    data: message
  });
}

function op_Parse(data) {
  importScripts('World.js', 'BinaryFile.js');
  return new World().loadWithData(data).serialize();
}


onmessage = function(e) {
  var message = JSON.parse(e.data);
  switch (message.op) {
    case 'parse': postMessage({op: 'world_data', data: op_Parse(message.data)});
  }
};
