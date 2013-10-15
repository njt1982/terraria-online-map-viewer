
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









function World(p, t, ts, c, s, n) {
  this.properties = p || {};
  this.tiles = t || [];
  this.tileStats = ts || {};
  this.chests = c || [];
  this.signs = s || [];
  this.npcs = n || [];

  this.framedTiles = [3,4,5,10,11,12,13,14,15,16,17,18,19,20,21,24,26,27,28,29,31,33,34,35,36,42,50,55,61,71,72,73,74,77,78,79,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,110,113,114,125,126,128,129,132,133,134,135,136,137,138,139,141,142,143,144,149,165,170,171,172,173,174,178,184,185,186,187,201,207,209,210,212,215,216,217,218,219,220,227,228,231,233,235,236,237,238,239,240,241,242,243,244,245,246,247];
  this.solidTiles = [0,1,2,6,7,8,9,10,11,19,22,23,25,30,37,38,39,40,41,43,44,45,46,47,48,53,54,56,57,58,59,60,63,64,65,66,67,68,70,75,76,107,108,109,111,112,116,117,118,119,120,121,122,123,130,137,138,140,145,146,147,148,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,166,167,168,169,175,176,177,179,180,181,182,183,188,189,190,191,192,193,194,195,196,197,198,199,200,202,203,204,206,208,211,221,222,223,224,225,226,229,230,232,234,235,239,248,249,250];
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
  // console.log(str);
  //
  if (this.debugElement === undefined) return;
  this.debugElement.innerHTML = str;
};

World.prototype.movePointer = function(offset) { this.pointer += offset; };

World.prototype.read = function(type, size, length) {
  var p = this.pointer;
  this.pointer += size;
  return this.bFile["get" + type + "At"](p, length ? size : null);
};

World.prototype.readInt16 = function() {
  return this.read('SShort', 2);
};

World.prototype.readInt32 = function() {
  return this.read('SLong', 4);
};

World.prototype.readByte = function() {
  return this.read('Byte', 1);
};

World.prototype.readString = function() {
  var size = this.readByte();
  return this.read('String', size, true);
};

World.prototype.readBoolean = function() {
  return this.readByte() ? true : false;
};

World.prototype.readSingle = function() {
  return new BinaryParser(0,0).toFloat(this.bFile.getBytesAt(this.pointer += 4, 4));
};

World.prototype.readDouble = function() {
  return new BinaryParser(0,0).toDouble(this.bFile.getBytesAt(this.pointer += 8, 8));
};


World.prototype.serialize = function() {
  return {
    properties: this.properties,
    tiles: this.tiles,
    tileStats: this.tileStats,
    chests: this.chests,
    signs: this.signs,
    npcs: this.npcs
  };
};




World.prototype.versionMin = function(v) {
  return this.get('Version') >= v;
};




World.prototype.loadWithData = function(data) {
  this.bFile = new BinaryFile(data);
  this.pointer = 0;
  this.tiles = [];
  this.tileStats = {};
  this.chests = [];
  this.signs = [];
  this.npcs = [];

  this.debug('Loading properties');

  this.set('Version', this.readInt32());

  // this.set('NameLength', this.readByte());
  // this.set('Name', this.readString(this.get('NameLength')));
  this.set('Name', this.readString());

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

  if (this.versionMin(70)) {
    this.set('Eclipse', this.readBoolean());
  }

  this.set('DungeonX', this.readInt32());
  this.set('DungeonY', this.readInt32());


  this.set('Crimson', this.versionMin(56) ? this.readBoolean() : false);

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

    this.set('KilledClown', this.versionMin(32) ? this.readBoolean() : null);
    this.set('DefeatedFrostLegion', this.versionMin(37) ? this.readBoolean() : null);
    this.set('DefeatedPirates', this.versionMin(56) ? this.readBoolean() : null);
  }


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

    if (this.versionMin(54)) {
      this.set('OreTier1', this.readInt32());
      this.set('OreTier2', this.readInt32());
      this.set('OreTier3', this.readInt32());
    }
  }


  if (this.versionMin(55)) {
    this.set('BgTree', this.readByte());
    this.set('BgCorruption', this.readByte());
    this.set('BgJungle', this.readByte());
    if (this.versionMin(60)) {
      this.set('BgSnow', this.readByte());
      this.set('BgHallow', this.readByte());
      this.set('BgCrimson', this.readByte());
      this.set('BgDesert', this.readByte());
      this.set('BgOcean', this.readByte());
      this.set('CloudBackground', this.readInt32());
      if (this.versionMin(62)) {
        this.set('NumClouds', this.readInt16());
        this.set('WindSpeedSet', this.readSingle());
      }
    }
  }

  this.debug('Loading tiles.');

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
    tile.liquid = 0;
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

      // Brick info
      if (this.versionMin(41)) {
        tile.halfBrick = this.readBoolean();
        if (this.versionMin(49)) {
          tile.slope = this.readByte();
        }

        // Actuator and In Active - need an isSolid check!
        if (this.versionMin(42) && (this.solidTiles.indexOf(tile.type) >= 0)) {
          tile.actuator = this.readBoolean();
          tile.inactive = this.readBoolean();
        }
      }
    }

    // TODO - this makes the tile work for some reason?!
    tile = {type:tile.type,active:tile.active};
    this.tiles.push(tile);

    if (this.versionMin(25)) {
      tile.rle = this.readInt16();

      if (tile.rle < 0) { this.debug('BAD RLE @ i: ' + i); }

      if (tile.rle > 0) {
        for (var k = 0; k < tile.rle; k++, i++, this.tiles.push(tile));
      }
    }
  }

  // Chests
  this.debug('Loading chests.');
  var itemsPerChest = this.versionMin(58) ? 40 : 20;
  for (var ci = 0; ci < 1000; ci++) {
    if (this.readBoolean()) {
      var chest = {};
      chest.items = [];
      chest.x = this.readInt32();
      chest.y = this.readInt32();
      for (var j = 0; j < itemsPerChest; j++) {
        var chestItem = {};
        if (this.versionMin(59)) {
          chestItem.stack = this.readInt16();
        }
        else {
          chestItem.stack = this.readByte();
        }

        if (chestItem.stack > 0) {
          var name = '';
          if (this.versionMin(38)) {
            var itemId = this.readInt32();
            if (itemId < 0) {
              itemId = -itemId;
              // TODO - make item lookup array
            }
            name = itemId;
          }
          else {
            name = this.readString();
          }
          var prefix = '';
          if (this.versionMin(36)) {
            var itemPfx = this.readByte();
            // TODO make prefix lookup array
            prefix = itemPfx;
          }
          chest.name = name;
          chest.prefix = prefix;
        }
      }
      this.chests.push(chest);
    }
  }

  // Signs
  this.debug('Loading signs.');
  for (var si = 0; si < 1000; si++) {
    if (this.readBoolean()) {
      var sign = {
        text: this.readString(),
        x: this.readInt32(),
        y: this.readInt32(),
      };

      this.signs.push(sign);
    }
  }


  // NPCs
  this.debug('Loading npcs.');
  while (this.readBoolean()) {
    var NPC = {
      title: this.readString(),
      name: '',
      x: this.readSingle(),
      y: this.readSingle(),
      isHomeless: this.readBoolean(),
      homeX: this.readInt32(),
      homeY: this.readInt32()
    };
    this.npcs.push(NPC);
  }

  // Read names
  this.debug('Loading names.');
  if (this.versionMin(31)) {
    var numNames = 9;
    if (this.versionMin(34)) {
      numNames++;
    }
    if (this.versionMin(65)) {
      numNames += 8;
    }

    for (var ni = 0; ni < numNames; ni++) {
      var npcName = this.readString();
      // TODO - assign this name to the right NPC...
    }
  }


  // Verify!
  this.debug('verifying');
  this.verify = {
    success: this.readBoolean(),
    worldName: this.readString(),
    worldId: this.readInt32
  };

  return this;
};


World.prototype.renderMap = function() {
  this.tileColours = { 0: "#976B4B", 1: "#808080", 2: "#1CD85E", 3: "#1E9648", 4: "#FDDD03", 5: "#976B4B", 6: "#B5A495", 7: "#964316", 8: "#B9A417", 9: "#D9DFDF", 10: "#BF8F6F", 11: "#946B50", 12: "#B61239", 13: "#4EC5FC", 14: "#7F5C45", 15: "#A2785C", 16: "#505050", 17: "#636363", 18: "#7F5C45", 19: "#B18567", 20: "#1E9648", 21: "#946B50", 22: "#625FA7", 23: "#8D89DF", 24: "#6D6AAE", 25: "#7D7991", 26: "#5E5561", 27: "#E3B903", 28: "#796E61", 29: "#9C546C", 30: "#A97D5D", 31: "#674D62", 32: "#7A618F", 33: "#FDDD03", 34: "#B75819", 35: "#C1CACB", 36: "#B9A417", 37: "#685654", 38: "#8C8C8C", 39: "#C37057", 40: "#925144", 41: "#454E63", 42: "#F99851", 43: "#526556", 44: "#8A4469", 45: "#947E18", 46: "#AEC1C2", 47: "#D5651A", 48: "#AFAFAF", 49: "#0B2EFF", 50: "#3095AA", 51: "#9EADAE", 52: "#1E9648", 53: "#D3C66F", 54: "#C8F6FE", 55: "#7F5C45", 56: "#41414D", 57: "#44444C", 58: "#8E4242", 59: "#5C4449", 60: "#8FD71D", 61: "#63971F", 62: "#28650D", 63: "#2A82FA", 64: "#FA2A51", 65: "#05C95D", 66: "#C78B09", 67: "#A30BD5", 68: "#19D1E7", 69: "#855141", 70: "#5D7FFF", 71: "#B1AE83", 72: "#968F6E", 73: "#0D6524", 74: "#28650D", 75: "#0B0B0B", 76: "#8E4242", 77: "#EE6646", 78: "#796E61", 79: "#5C6298", 80: "#497811", 81: "#e5533f", 82: "#fe5402", 83: "#fe5402", 84: "#fe5402", 85: "#c0c0c0", 86: "#7F5C45", 87: "#584430", 88: "#906850", 89: "#B18567", 90: "#606060", 91: "#188008", 92: "#323232", 93: "#503B2F", 94: "#A87858", 95: "#F87800", 96: "#606060", 97: "#808080", 98: "#B2B28A", 99: "#808080", 100: "#CCB548", 101: "#B08460", 102: "#780C08", 103: "#8D624D", 104: "#946B50", 105: "#282828", 106: "#563E2C", 107: "#0B508F", 108: "#5BA9A9", 109: "#4EC1E3", 110: "#1E9648", 111: "#801A34", 112: "#67627A", 113: "#1E9648", 114: "#7F5C45", 115: "#327FA1", 116: "#D5C4C5", 117: "#B5ACBE", 118: "#D5C4C5", 119: "#3F3F49", 120: "#967A7D", 121: "#2576AB", 122: "#91BF75", 123: "#595353", 124: "#5C4436", 125: "#81A5FF", 126: "#DBDBDB", 127: "#68B3C8", 128: "#906850", 129: "#004979", 130: "#A5A5A5", 131: "#1A1A1A", 132: "#C90303", 133: "#891012", 134: "#96AE87", 135: "#FD7272", 136: "#CCC0C0", 137: "#8C8C8C", 138: "#636363", 139: "#996343", 140: "#7875B3", 141: "#AD2323", 142: "#C90303", 143: "#C90303", 144: "#C90303", 145: "#C01E1E", 146: "#2BC01E", 147: "#C7DCDF", 148: "#D3ECF1", 149: "#ffffff", 150: "#731736", 151: "#baa854", 152: "#5f5f95", 153: "#ef8d7e", 154: "#dfdb93", 155: "#83a2a1", 156: "#bcbcb1", 157: "#9989a5", 158: "#915155", 159: "#57503f", 160: "#d4d4d4", 161: "#90c3e8", 162: "#92aebf", 163: "#9188cb", 164: "#d197bc", 165: "#5c8faf", 166: "#817d5d", 167: "#2f3e57", 168: "#5a7d53", 169: "#8097b8", 170: "#817d5d", 171: "#7a907e", 172: "#8097b8", 173: "#8097b8", 174: "#fe7902", 175: "#bba57c", 176: "#9cc09d", 177: "#b5c2d9", 178: "#892880", 179: "#318672", 180: "#7e8631", 181: "#863b31", 182: "#2b568c", 183: "#793186", 184: "#208376", 185: "#808080", 186: "#999979", 187: "#63971f", 188: "#497811", 189: "#ffffff", 190: "#b6af82", 191: "#9e7354", 192: "#0d6524", 193: "#3879ff", 194: "#b2b28a", 195: "#b74d70", 196: "#9390b2", 197: "#61c8e1", 198: "#202122", 199: "#9f3a3a", 200: "#e6bab7", 201: "#a63f3f", 202: "#171594", 203: "#c34343", 204: "#85212e", 205: "#b74544", 206: "7cafc9", 207: "#838383", 208: "#687986", 209: "#676767", 210: "#ed1c24", 211: "#4fbf2d", 212: "#f5f5f5", 213: "#897843", 214: "#676767", 215: "#fd3e03", 216: "#be303e", 217: "#676767", 218: "#4d4d4d", 219: "#676767", 220: "#563a01", 221: "#f35e36", 222: "#841380", 223: "#a7d29f", 224: "#7e989d", 225: "#c86c10", 226: "#8d3800", 227: "#46bb93", 228: "#a87858", 229: "#ff9c0c", 230: "#5e3e24", 231: "#c8964a", 232: "#734144", 233: "#6bb600", 234: "#4d4c42", 235: "#b3bb44", 236: "#cd733d", 237: "#fff133", 238: "#e180ce", 239: "#cd8647", 240: "#634732", 241: "#4d4a48", 242: "#454b45", 243: "#c6c4aa", 244: "#c8f5fd", 245: "#554545", 246: "#6d5332", 247: "#696969", 248: "#e1623f", 249: "#df23dc", 250: "#636169" };

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
        if (this.tiles[i].type in this.tileColours) {
          ctx.fillStyle = this.tileColours[this.tiles[i].type];
        }
        else {
          ctx.fillStyle = '#000';
        }

        // Render this tile
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  this.mapElement.insertBefore(div, null);
  this.debug('Rendering map complete');
};
