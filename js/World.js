
function extend(Child, Parent) {
  Child.prototype = Object.create(Parent.prototype);
  Child.prototype.constructor = Child;
  Child.parent = Parent.prototype;
}




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







// function Tile(p) {
//   this.properties = p || {};
// }
// extend(Tile, TerrariaItem);







function World(p) {
  this.properties = p || {};
  this.tiles = [];
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
  return this.bFile.getByteAt(p) ? true : false;
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

  // TODO - set default moon type to random v<63
  this.set('MoonType', this.versionMin(63) ? this.readByte() : null);

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
    if (this.versionMin(61)) {
      this.set('JungleBackStyle', this.readInt32());
      this.set('HellBackStyle', this.readInt32());
    }
  }
  else {
    this.set('CaveBackX', [
      this.get('TilesWide') / 2,
      this.get('TilesWide'),
      this.get('TilesWide')
    ]);
    this.set('CaveBackStyle', [0,1,2,3]);
    this.set('IceBackStyle', 0);
    this.set('JungleBackStyle', 0);
    this.set('HellBackStyle', 0);
  }

  this.set('SpawnX', this.readInt32());
  this.set('SpawnY', this.readInt32());

  this.set('GroundLevel', this.readDouble());
  this.set('RockLevel', this.readDouble());

  this.set('Time', this.readDouble());
  this.set('DayTime', this.readBoolean());
  this.set('MoonPhase', this.readInt32());
  this.set('DayTime', this.readBoolean());

  this.set('DungeonX', this.readInt32());
  this.set('DungeonY', this.readInt32());


  this.set('IsCrimson', this.versionMin(56) ? this.readBoolean() : false);

  this.set('DownedBoss', [
    this.readBoolean(),
    this.readBoolean(),
    this.readBoolean()
  ]);

  this.set('DownedQueenBee', this.versionMin(66) ? this.readBoolean() : null);

  if (this.versionMin(44)) {
    this.set('DownedMechBoss', [
      this.readBoolean(),
      this.readBoolean(),
      this.readBoolean()
    ]);
    this.set('DownedMechBossAny', this.readBoolean());
  }

  if (this.versionMin(64)) {
    this.set('DownedPlantBoss', this.readBoolean());
    this.set('DownedGolemBoss', this.readBoolean());
  }

  if (this.versionMin(29)) {
    this.set('SavedGoblin', this.readBoolean());
    this.set('SavedWizard', this.readBoolean());
    if (this.versionMin(34)) {
      this.set('SavedMech', this.readBoolean());
    }
    this.set('DownedGoblins', this.readBoolean());
  }

  this.set('DownedClown', this.versionMin(32) ? this.readBoolean() : null);
  this.set('DownedFrost', this.versionMin(37) ? this.readBoolean() : null);
  this.set('DownedPirates', this.versionMin(56) ? this.readBoolean() : null);

  this.set('ShadowOrbSmashed', this.readBoolean());
  this.set('SpawnMeteor', this.readBoolean());
  this.set('ShadowOrbCount', this.readByte());

  if (this.versionMin(23)) {
    this.set('AltarCount', this.readInt32());
    this.set('HardMode', this.readBoolean());
  }

  this.set('InvasionDelay', this.readInt32());
  this.set('InvasionSize', this.readInt32());
  this.set('InvasionType', this.readInt32());
  this.set('InvasionX', this.readDouble());

  if (this.versionMin(53)) {
    this.set('TempRaining', this.readBoolean());
    this.set('TempRainTime', this.readInt32());
    this.set('TempMaxRain', this.readSingle());
  }

  if (this.versionMin(54)) {
    this.set('OreTier1', this.readInt32());
    this.set('OreTier2', this.readInt32());
    this.set('OreTier3', this.readInt32());
  }
  else if (this.get('Version') < 23 || this.get('AlterCount') !== 0) {
    this.set('OreTier1', 107);
    this.set('OreTier2', 108);
    this.set('OreTier3', 111);
  }
  else {
    this.set('OreTier1', -1);
    this.set('OreTier2', -1);
    this.set('OreTier3', -1);
  }

  if (this.versionMin(55)) {
    this.set('BgTree', this.readByte());
    this.set('BgCorruption', this.readByte());
    this.set('BgJungle', this.readByte());
  }

  if (this.versionMin(60)) {
    this.set('BgSnow', this.readByte());
    this.set('BgHallow', this.readByte());
    this.set('BgCorruption', this.readByte());
    this.set('BgDesert', this.readByte());
    this.set('BgOcean', this.readByte());
  }

  // TODO random default
  this.set('CloudBgActive', this.versionMin(60) ? this.readInt32() : null);
  if (this.versionMin(62)) {
    this.set('NumClouds', this.readInt16());
    this.set('WindSpeedSet', this.readSingle());
  }

  this.debug('Loading properties complete, initializing tiles.');

  // Initialize Tiles
  // var x,y;
  // for (x = 0; x < this.get('TilesWide'); x++) {
  //   this.debug('Initialising column: ' + x);

  //   this.tiles[x] = [];
  //   for (y = 0; y < this.get('TilesHigh'); y++) {
  //     this.tiles[x][y] = new Tile();
  //   }
  // }

  // Read tiles!
  var w = this.get('TilesWide'),
      h = this.get('TilesHigh'),
      x = 0,
      y = 0;

  var buffer = document.createElement('canvas');
  buffer.width = w;
  buffer.height = h;
  var ctx = buffer.getContext('2d');
  ctx.fillStyle = '#FFF';
  ctx.fillRect(0, 0, w, h);

  var div = document.createElement('div');
  div.insertBefore(buffer, null);


  var stats = {};

  for (x = 0; x < w; x++) {
    for (y = 0; y < h; y++) {
      var tile = {
        active: this.readBoolean(),
      };

      if (tile.active) {
        tile.type = this.readByte();
        if (isNaN(stats[tile.type])) stats[tile.type] = 0;
        stats[tile.type]++;

        if (tile.type == 127) {
          tile.active = false;
        }

        if (this.framedTiles.indexOf(tile.type) >= 0) {
          if (tile.type == 4 && this.get('version') < 28) {
            tile.uv = [0,0];
          }
          else if (tile.type == 19 && this.get('version') < 40) {
            tile.uv = [0,0];
          }
          else {
            tile.uv = [this.readInt16(), this.readInt16()];
            if (tile.type == 144) { tile.uv[1] = 0; }
          }
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

      if (this.readBoolean()) {
        tile.Wall = this.readByte();
        if (this.versionMin(48) && this.readBoolean()) {
          tile.WallColor = this.readByte;
        }
      }

      if (this.readBoolean()) {
        tile.liquid = this.readByte();
        tile.isLava = this.readBoolean();
        if (this.versionMin(51)) {
          tile.isHoney = this.readBoolean();
        }
      }

      if (this.versionMin(33)) {
        tile.hasWire = this.readBoolean();
      }

      if (this.versionMin(43)) {
        tile.hasWire2 = this.readBoolean();
        tile.hasWire3 = this.readBoolean();
      }

      if (this.versionMin(41)) {
        tile.HalfBrick = this.readBoolean();
        if (this.versionMin(49)) {
          tile.slope = this.readByte();
        }
      }

      if (this.versionMin(42)) {
        tile.actuator = this.readBoolean();
        tile.inactive = this.readBoolean();
      }

      // Draw this to the canvas!
      switch (tile.type) {
        case 0 : ctx.fillStyle = '#916A4F'; break; // Dirt
        case 1 : ctx.fillStyle = '#808080'; break; // Stone
        default : ctx.fillStyle = '#FFF';
      }

      ctx.fillRect(x, y, 1, 1);

      if (this.versionMin(25)) {
        tile.rle = this.readInt16();
        if (tile.rle < 0) { console.log('BAD RLE @ XY: ' + x + ', ' + y); }
        if (tile.rle > 0) {
          for (var k = y + 1; k < y + tile.rle + 1;  k++) {
            ctx.fillRect(x, k, 1, 1);
          }
          y += tile.rle;
        }
      }
    }
  }
  this.mapElement.insertBefore(div, null);

  console.log(stats);
};
