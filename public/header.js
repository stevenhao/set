print = console.log.bind(console);

function nop() {}

function range(x) {
  var ret = [];
  for(var i = 0; i < x; ++i) {
    ret.push(i);
  }
  return ret;
}

function rrange(x) {
  var ret = [];
  for(var i = 0; i < x; ++i) {
    ret.push(x-1-i);
  }
  return ret;
}

Array.prototype.delete = function(x) {
  if (this.indexOf(x) != -1) {
    this.splice(this.indexOf(x), 1);
  }
}

function pad2(x) {
  x = "" + x;
  while (x.length < 2) {
    x = "0" + x;
  }
  return x;
}

function rep(val, n) {
  var ret = [];
  for(var i = 0; i < n; ++i) {
    ret.push(val);
  }
  return ret;
}

function rand(x) {
  return Math.floor(Math.random() * x);
}

function shuffle(lst, seed=null) {
  var randf = seed == null? rand: seeded_prng(seed);
  for (var i = 0; i < lst.length; ++i) {
    var tmp = lst[i]
    var j = randf(i);
    lst[i] = lst[j];
    lst[j] = tmp;
  }
  return lst;
}

var xmlns = "http://www.w3.org/2000/svg";
window.$$ = function(tag) {
  var el = document.createElementNS(xmlns, tag);
  return $(el);
}
$.attrHooks['viewbox'] = {
  set: function(elem, value, name) {
    elem.setAttributeNS(null, 'viewBox', value + '');
    return value;
  }
};
$.attrHooks['class'] = {
  set: function(elem, value, name) {
    elem.setAttributeNS(null, 'class', value + '');
    return value;
  }
};


// blatantly stolen from https://stackoverflow.com/a/47593316
function xmur3(str) {
  for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
      h = h << 13 | h >>> 19;
  return function() {
      h = Math.imul(h ^ h >>> 16, 2246822507);
      h = Math.imul(h ^ h >>> 13, 3266489909);
      return (h ^= h >>> 16) >>> 0;
  }
}

function sfc32(a, b, c, d) {
  return function(x) {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
    var t = (a + b) | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    var temp = (t >>> 0) / 4294967296;
    return Math.floor(temp * x);
  }
}

function seeded_prng(seed) {
  var seeder = xmur3(seed);
  return sfc32(seeder(), seeder(), seeder(), seeder());
}
