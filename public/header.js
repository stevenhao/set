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

function shuffle(lst) {
  for (var i = 0; i < lst.length; ++i) {
    var tmp = lst[i]
    var j = rand(i);
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
