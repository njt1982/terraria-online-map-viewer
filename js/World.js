var World = function() {
  // var version, nameLength, name, worldID,
  //     left, right, top, bottom,
  //     width, height;

  this.worldProperties = {};

  this.getRawWorldProperties = function() { return this.worldProperties; };

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

  this.bytesToHex = function(s) {
    for(var k, i = s.length, r = ""; i; r = ((k = s[--i].toString(16)).length - 1 ? k : "0" + k) + r);
    return r;
  };
  this.bytesToChars = function(b) {
    for(var k, i = b.length, r = ""; i; r = String.fromCharCode(b[i--]) + r);
    return r;
  };

  this.readBoolean = function() {
    var p = this.pointer;
    this.movePointer(1);
    return this.bFile.getByteAt(p) ? true : false;
  };

  this.readInt32 = function() {
    var p = this.pointer;
    this.movePointer(4);
    return this.bFile.getLongAt(p);
  };

  this.readSingle = function() {
    var p = this.pointer;
    this.movePointer(4);
    return new BinaryParser(0,0).toFloat(this.bFile.getBytesAt(p, 4));
  };

  this.readDouble = function() {
    var p = this.pointer;
    this.movePointer(8);
    return new BinaryParser(0,0).toDouble(this.bFile.getBytesAt(p, 8));
  };

  this.readByte = function() {
    var p = this.pointer;
    this.movePointer(1);
    return this.bFile.getByteAt(p);
  };

  this.readString = function(length) {
    var p = this.pointer;
    this.movePointer(length);
    return this.bFile.getStringAt(p, length);
  };


  this.versionMin = function(v) { return this.get('version') >= v; };

  this.loadWithData = function(data) {
    this.bFile = new BinaryFile(data);
    this.pointer = 0;

    this.set('version', this.readInt32());

    // This seems wrong?!
    // For some reason, iOS Terraria has a 4 byte gap here?!
    if (this.get('version') === 49) {
      this.movePointer(4);
      this.set('nameLength', this.readByte());
      this.movePointer(3);
    }
    else {
      this.set('nameLength', this.readByte());
    }

    this.set('name', this.readString(this.get('nameLength')));

    this.set('worldID', this.readInt32());

    this.set('left',   this.readInt32());
    this.set('right',  this.readInt32());
    this.set('top',    this.readInt32());
    this.set('bottom', this.readInt32());

    this.set('tilesHigh', this.readInt32());
    this.set('tilesWide',  this.readInt32());

    // TODO - set default moon type to random v<63
    this.set('moonType', this.versionMin(63) ? this.readByte() : null);

    if (this.versionMin(44)) {
      this.set('treeX', [
        this.readInt32(),
        this.readInt32(),
        this.readInt32()
      ]);
      this.set('treeStyle', [
        this.readInt32(),
        this.readInt32(),
        this.readInt32(),
        this.readInt32()
      ]);
    }

    if (this.versionMin(60)) {
      this.set('caveBackX', [
        this.readInt32(),
        this.readInt32(),
        this.readInt32()
      ]);
      this.set('caveBackStyle', [
        this.readInt32(),
        this.readInt32(),
        this.readInt32(),
        this.readInt32()
      ]);
      this.set('iceBackStyle', this.readInt32());
      if (this.versionMin(61)) {
        this.set('jungleBackStyle', this.readInt32());
        this.set('hellBackStyle', this.readInt32());
      }
    }
    else {
      this.set('caveBackX', [
        this.get('tilesWide') / 2,
        this.get('tilesWide'),
        this.get('tilesWide')
      ]);
      this.set('caveBackStyle', [0,1,2,3]);
      this.set('iceBackStyle', 0);
      this.set('jungleBackStyle', 0);
      this.set('hellBackStyle', 0);
    }

    this.set('spawnX', this.readInt32());
    this.set('spawnY', this.readInt32());

    this.set('groundLevel', this.readDouble());
    this.set('rockLevel', this.readDouble());

    this.set('Time', this.readDouble());
    this.set('DayTime', this.readBoolean());
    this.set('MoonPhase', this.readInt32());
    this.set('DayTime', this.readBoolean());

    this.set('DungeonX', this.readInt32());
    this.set('DungeonY', this.readInt32());


    this.set('isCrimson', this.versionMin(56) ? this.readBoolean() : false);

    this.set('downedBoss', [
      this.readBoolean(),
      this.readBoolean(),
      this.readBoolean()
    ]);

    this.set('downedQueenBee', this.versionMin(66) ? this.readBoolean() : null);

    if (this.versionMin(44)) {
      this.set('downedMechBoss', [
        this.readBoolean(),
        this.readBoolean(),
        this.readBoolean()
      ]);
      this.set('downedMechBossAny', this.readBoolean());
    }

    if (this.versionMin(64)) {
      this.set('downedPlantBoss', this.readBoolean());
      this.set('downedGolemBoss', this.readBoolean());
    }

    if (this.versionMin(29)) {
      this.set('savedGoblin', this.readBoolean());
      this.set('savedWizard', this.readBoolean());
      if (this.versionMin(34)) {
        this.set('savedMech', this.readBoolean());
      }
      this.set('downedGoblins', this.readBoolean());
    }

    this.set('downedClown', this.versionMin(32) ? this.readBoolean() : null);
    this.set('downedFrost', this.versionMin(37) ? this.readBoolean() : null);
    this.set('downedPirates', this.versionMin(56) ? this.readBoolean() : null);

    this.set('shadowOrbSmashed',this.readBoolean());
    this.set('spawnMeteor',this.readBoolean());
    this.set('shadowOrbCount',this.readByte());

    if (this.versionMin(23)) {
      this.set('altarCount', this.readInt32());
      this.set('hardMode', this.readBoolean());
    }

    this.set('invasionDelay', this.readInt32());
    this.set('invasionSize', this.readInt32());
    this.set('invasionType', this.readInt32());
    this.set('invasionX', this.readDouble());

    if (this.versionMin(53)) {
      this.set('tempRaining', this.readBoolean());
      this.set('tempRainTime', this.readInt32());
      this.set('tempMaxRain', this.readSingle());
    }

    if (this.versionMin(54)) {
      this.set('oreTier1', this.readInt32());
      this.set('oreTier2', this.readInt32());
      this.set('oreTier3', this.readInt32());
    }
    else if (w.get('version') < 23 || w.get('alterCount') !== 0) {
      this.set('oreTier1', 107);
      this.set('oreTier2', 108);
      this.set('oreTier3', 111);
    }
    else {
      this.set('oreTier1', -1);
      this.set('oreTier2', -1);
      this.set('oreTier3', -1);
    }

    return this;
  };
};
