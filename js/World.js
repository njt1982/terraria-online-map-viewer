var World = function() {
  var version, nameLength, name, worldID,
      left, right, top, bottom,
      width, height;

  this.getVersion = function() { return this.version; };
  this.getNameLength = function() { return this.nameLength; };
  this.getName = function() { return this.name; };
  this.getWorldID = function() { return this.worldID; };
  this.getRect = function() { return [this.left, this.right, this.top, this.bottom].join(', '); };
  this.getDimensions = function() { return [this.width, this.height].join(' x '); };



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

    this.version = this.getInt32();

    // This seems wrong?!
    // For some reason, iOS Terraria has a 4 byte gap here?!
    if (this.version === 49) {
      this.movePointer(4);
      this.nameLength = this.getByte();
      this.movePointer(3);
    }
    else {
      this.nameLength = this.getByte();
    }
    this.name = this.getString(this.nameLength);

    this.worldID = this.getInt32();

    this.left   = this.getInt32();
    this.right  = this.getInt32();
    this.top    = this.getInt32();
    this.bottom = this.getInt32();

    this.height = this.getInt32();
    this.width  = this.getInt32();

    return this;
  };
};
