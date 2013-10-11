
function extend(Child, Parent) {
  Child.prototype = Object.create(Parent.prototype);
  Child.prototype.constructor = Child;
  Child.parent = Parent.prototype;
}


var clone = (function(){
  return function (obj) { Clone.prototype=obj; return new Clone(); };
  function Clone(){}
}());


function TerrariaItem(p) {
  this.properties = p || {};
}
TerrariaItem.prototype = {
  getProperties: function() { return this.properties; },
  get: function(key) { return (this.properties[key] === undefined) ? null : this.properties[key]; },
  set: function(key, value) { this.properties[key] = value; },
  getMultiple: function(keys) {
    ret = [];
    var w = this;
    keys.forEach(function(v) { ret.push(w.get(v)); });
    return ret;
  }
};









function World(p) {
  this.properties = p || {};
  this.tiles = [];
  this.tileStats = {};

  this.framedTiles = [3,4,5,10,11,12,13,14,15,16,17,18,19,20,21,24,26,27,28,29,31,33,34,35,36,42,50,55,61,71,72,73,74,77,78,79,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,110,113,114,125,126,128,129,132,133,134,135,136,137,138,139,141,142,143,144,149,165,170,171,172,173,174,178,184,185,186,187,201,207,209,210,212,215,216,217,218,219,220,227,228,231,233,235,236,237,238,239,240,241,242,243,244,245,246,247];
  var bFile, pointer;
}
extend(World, TerrariaItem);

World.prototype.setMapElement = function(el) {
  this.mapElement = el;
};

World.prototype.setDebugElement = function(el) {
  this.debugElement = el;
};
World.prototype.debug = function(str) {
  if (this.debugElement === undefined) return;

  this.debugElement.innerHTML = str;
};

World.prototype.movePointer = function(offset) { this.pointer += offset; };

World.prototype.readBoolean = function() {
  var p = this.pointer;
  this.movePointer(1);
  // return this.bFile.getByteAt(p) ? true : false;
  return this.bFile.getByteAt(p);
};

World.prototype.readInt16 = function() {
  var p = this.pointer;
  this.movePointer(2);
  return this.bFile.getShortAt(p);
};

World.prototype.readInt32 = function() {
  var p = this.pointer;
  this.movePointer(4);
  return this.bFile.getLongAt(p);
};

World.prototype.readSingle = function() {
  var p = this.pointer;
  this.movePointer(4);
  return new BinaryParser(0,0).toFloat(this.bFile.getBytesAt(p, 4));
};

World.prototype.readDouble = function() {
  var p = this.pointer;
  this.movePointer(8);
  return new BinaryParser(0,0).toDouble(this.bFile.getBytesAt(p, 8));
};

World.prototype.readByte = function() {
  var p = this.pointer;
  this.movePointer(1);
  return this.bFile.getByteAt(p);
};

World.prototype.readString = function(length) {
  var p = this.pointer;
  this.movePointer(length);
  return this.bFile.getStringAt(p, length);
};




World.prototype.versionMin = function(v) {
  return this.get('Version') >= v;
};




World.prototype.loadWithData = function(data) {
  this.bFile = new BinaryFile(data);
  this.pointer = 0;
  this.tiles = [];
  this.tileStats = {};

  this.debug('Loading properties');

  this.set('Version', this.readInt32());

  // This seems wrong?!
  // For some reason, iOS Terraria has a 4 byte gap here?!
  if (this.get('Version') === 49) {
    this.movePointer(4);
    this.set('NameLength', this.readByte());
    this.movePointer(3);
  }
  else {
    this.set('NameLength', this.readByte());
  }

  this.set('Name', this.readString(this.get('NameLength')));

  this.set('WorldID', this.readInt32());

  this.set('Left',   this.readInt32());
  this.set('Right',  this.readInt32());
  this.set('Top',    this.readInt32());
  this.set('Bottom', this.readInt32());

  this.set('TilesHigh', this.readInt32());
  this.set('TilesWide',  this.readInt32());

  if (this.versionMin(63)) {
    this.set('MoonType', this.readByte());
  }

  if (this.versionMin(44)) {
    this.set('TreeX', [
      this.readInt32(),
      this.readInt32(),
      this.readInt32()
    ]);
    this.set('TreeStyle', [
      this.readInt32(),
      this.readInt32(),
      this.readInt32(),
      this.readInt32()
    ]);
  }

  if (this.versionMin(60)) {
    this.set('CaveBackX', [
      this.readInt32(),
      this.readInt32(),
      this.readInt32()
    ]);
    this.set('CaveBackStyle', [
      this.readInt32(),
      this.readInt32(),
      this.readInt32(),
      this.readInt32()
    ]);
    this.set('IceBackStyle', this.readInt32());
  }
  if (this.versionMin(61)) {
    this.set('JungleBackStyle', this.readInt32());
    this.set('HellBackStyle', this.readInt32());
  }


  this.set('SpawnX', this.readInt32());
  this.set('SpawnY', this.readInt32());

  this.set('GroundLevel', this.readDouble());
  this.set('RockLevel', this.readDouble());

  this.set('Time', this.readDouble());
  this.set('DayTime', this.readBoolean());
  this.set('MoonPhase', this.readInt32());
  this.set('BloodMoon', this.readBoolean());

  this.set('DungeonX', this.readInt32());
  this.set('DungeonY', this.readInt32());


  this.set('IsCrimson', this.versionMin(56) ? this.readBoolean() : false);

  this.set('KilledEyeOfCthulu', this.readBoolean());
  this.set('KilledEaterOfWorlds', this.readBoolean());
  this.set('KilledSkeleton', this.readBoolean());

  this.set('KilledQueenBee', this.versionMin(66) ? this.readBoolean() : null);

  if (this.versionMin(44)) {
    this.set('KilledTheDestroyer', this.readBoolean());
    this.set('KilledTheTwins', this.readBoolean());
    this.set('KilledSkeletronPrime', this.readBoolean());
    this.set('KilledAnyHardmodeBoss', this.readBoolean());
  }

  if (this.versionMin(64)) {
    this.set('KilledPlantera', this.readBoolean());
    this.set('KilledGolem', this.readBoolean());
  }

  if (this.versionMin(29)) {
    this.set('SavedGoblin', this.readBoolean());
    this.set('SavedWizard', this.readBoolean());
    if (this.versionMin(34)) {
      this.set('SavedMechanic', this.readBoolean());
    }
    this.set('DefeatedGoblinInvasion', this.readBoolean());
  }

  this.set('KilledClown', this.versionMin(32) ? this.readBoolean() : null);
  this.set('DefeatedFrostLegion', this.versionMin(37) ? this.readBoolean() : null);
  this.set('DefeatedPirates', this.versionMin(56) ? this.readBoolean() : null);

  this.set('BrokeShadowOrb', this.readBoolean());
  this.set('SpawnMeteor', this.readBoolean());
  this.set('ShadowOrbBrokenMod3', this.readByte());

  if (this.versionMin(23)) {
    this.set('AltarsSmashed', this.readInt32());
    this.set('HardMode', this.readBoolean());
  }

  this.set('GoblinInvasionDelay', this.readInt32());
  this.set('GoblinInvasionSize', this.readInt32());
  this.set('GoblinInvasionType', this.readInt32());
  this.set('GoblinInvasionX', this.readDouble());

  if (this.versionMin(53)) {
    this.set('isRaining', this.readBoolean());
    this.set('RainTime', this.readInt32());
    this.set('MaxRain', this.readSingle());
  }

  if (this.versionMin(54)) {
    this.set('OreTier1', this.readInt32());
    this.set('OreTier2', this.readInt32());
    this.set('OreTier3', this.readInt32());
  }

  if (this.versionMin(55)) {
    this.set('BgTree', this.readByte());
    this.set('BgCorruption', this.readByte());
    this.set('BgJungle', this.readByte());
  }

  if (this.versionMin(60)) {
    this.set('BgSnow', this.readByte());
    this.set('BgHallow', this.readByte());
    this.set('BgCrimson', this.readByte());
    this.set('BgDesert', this.readByte());
    this.set('BgOcean', this.readByte());
    this.set('CloudBackground', this.readInt32());
  }

  if (this.versionMin(62)) {
    this.set('NumClouds', this.readInt16());
    this.set('WindSpeedSet', this.readSingle());
  }

  this.debug('Loading properties complete, initializing tiles.');

  // Read tiles!
  var w = this.get('TilesWide'),
      h = this.get('TilesHigh');


  for (var i = 0; i < (w * h); i++) {
    var tile = {};
    tile.active = this.readBoolean();

    if (tile.active) {
      tile.type = this.readByte();

      // Stats
      if (isNaN(this.tileStats[tile.type])) this.tileStats[tile.type] = 0;
      this.tileStats[tile.type]++;

      // if (tile.type == 127) {
      //   tile.active = false;
      // }

      if (this.framedTiles.indexOf(tile.type) >= 0) {
        // if (tile.type == 4 && this.get('version') < 28) {
        //   tile.uv = [0,0];
        // }
        // else if (tile.type == 19 && this.get('version') < 40) {
        //   tile.uv = [0,0];
        // }
        // else {
          tile.uv = [this.readInt16(), this.readInt16()];
        //   if (tile.type == 144) { tile.uv[1] = 0; }
        // }
      }
      else {
        tile.uv = [-1, -1];
      }

      if (this.versionMin(48) && this.readBoolean()) {
        tile.color = this.readByte();
      }
    }

    // Obsolete hasLight
    if (this.get('version') <= 25) {
      this.readBoolean();
    }

    // Wall Colour
    if (this.readBoolean()) {
      tile.Wall = this.readByte();
      if (this.versionMin(48) && this.readBoolean()) {
        tile.WallColor = this.readByte;
      }
    }

    // Liquid
    if (this.readBoolean()) {
      tile.liquid = this.readByte();
      tile.isLava = this.readBoolean();
      if (this.versionMin(51)) {
        tile.isHoney = this.readBoolean();
      }
    }

    // Wires
    if (this.versionMin(33)) {
      tile.redWirePresent = this.readBoolean();
      if (this.versionMin(43)) {
        tile.greenWirePresent = this.readBoolean();
        tile.blueWirePresent = this.readBoolean();
      }
    }

    // Brick info
    if (this.versionMin(41)) {
      tile.halfBrick = this.readBoolean();
      if (this.versionMin(49)) {
        tile.slope = this.readByte();
      }
    }

    // Actuator and In Active
    if (this.versionMin(42)) {
      tile.actuator = this.readBoolean();
      tile.inactive = this.readBoolean();
    }

    this.tiles.push(tile);

    if (this.versionMin(25)) {
      tile.rle = this.readInt16();

      if (tile.rle < 0) { console.log('BAD RLE @ XY: ' + x + ', ' + y); }

      if (tile.rle > 0) {
        for (var k = 0; k < tile.rle; k++, i++, this.tiles.push(tile));
      }
    }
  }
};


World.prototype.renderMap = function(data) {
  this.debug('Rendering map');
  var buffer = document.createElement('canvas');
  buffer.width = this.get('TilesWide');
  buffer.height = this.get('TilesHigh');

  var ctx = buffer.getContext('2d');
  ctx.fillStyle = '#FFF';
  ctx.fillRect(0, 0, buffer.width, buffer.height);

  var div = document.createElement('div');
  div.insertBefore(buffer, null);

  for (var x = 0; x < buffer.width; x++) {
    for (var y = 0; y < buffer.height; y++) {
      i = (x * buffer.height) + y;

      if (this.tiles[i].active) {
        switch (this.tiles[i].type) {
          case 0 : ctx.fillStyle = '#916A4F'; break; // Dirt
          case 1 : ctx.fillStyle = '#808080'; break; // Stone
          default : ctx.fillStyle = '#eee';
        }

        // Render this tile
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  this.mapElement.insertBefore(div, null);
  this.debug('Rendering map complete');
};
