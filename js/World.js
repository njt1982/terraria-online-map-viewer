var World = function() {
  // var version, nameLength, name, worldID,
  //     left, right, top, bottom,
  //     width, height;

  this.worldProperties = {};


  // this.getVersion = function() { return this.version; };
  // this.getNameLength = function() { return this.nameLength; };
  // this.getName = function() { return this.name; };
  // this.getWorldID = function() { return this.worldID; };


  this.get = function(key) { return (this.worldProperties[key] === undefined) ? null : this.worldProperties[key]; };
  this.set = function(key, value) { this.worldProperties[key] = value; };

  this.getMultiple = function(keys) {
    ret = [];
    var w = this;
    keys.forEach(function(v) { ret.push(w.get(v)); });
    return ret;
  };

  this.getBounds     = function() { return this.getMultiple(['left', 'right', 'top', 'bottom']).join(', '); };
  this.getDimensions = function() { return this.getMultiple(['width', 'height']).join(' x '); };


  var bFile, pointer;
  this.movePointer = function(offset) {
    this.pointer += offset;
  };


  this.getInt32 = function() {
    var p = this.pointer;
    this.movePointer(4);
    return this.bFile.getLongAt(p);
  };
  this.getByte = function() {
    var p = this.pointer;
    this.movePointer(1);
    return this.bFile.getByteAt(p);
  };
  this.getString = function(length) {
    var p = this.pointer;
    this.movePointer(length);
    return this.bFile.getStringAt(p, length);
  };



  this.loadWithData = function(data) {
    this.bFile = new BinaryFile(data);
    this.pointer = 0;

    this.set('version', this.getInt32());

    // This seems wrong?!
    // For some reason, iOS Terraria has a 4 byte gap here?!
    if (this.get('version') === 49) {
      this.movePointer(4);
      this.set('nameLength', this.getByte());
      this.movePointer(3);
    }
    else {
      this.set('nameLength', this.getByte());
    }
    this.set('name', this.getString(this.get('nameLength')));

    this.set('worldID', this.getInt32());

    this.set('left',   this.getInt32());
    this.set('right',  this.getInt32());
    this.set('top',    this.getInt32());
    this.set('bottom', this.getInt32());

    this.set('height', this.getInt32());
    this.set('width',  this.getInt32());

    return this;
  };
};
