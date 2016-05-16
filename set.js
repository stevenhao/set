function rep(val, n) {
  var ret = [];
  for(var i = 0; i < n; ++i) {
    ret.push(val);
  }
  return ret;
}

shuffle = function(deck) {
  for (var i = 0; i < deck.length; ++i) {
    var tmp = deck[i]
    var j = Math.floor(Math.random() * i);
    deck[i] = deck[j];
    deck[j] = tmp;
  }
  return deck;
}

makeDeck = function() {
  var deck = []
  for(var i = 0; i < 81; ++i) {
    var cur = i;
    var a = cur % 3; cur = (cur - a) / 3;
    var b = cur % 3; cur = (cur - b) / 3;
    var c = cur % 3; cur = (cur - c) / 3;
    var d = cur;
    deck.push({count: a, color: b, shading: c, shape: d});
  }
  return shuffle(deck);
}

deal12 = function(deck) {
  var cards = []
  for (var i = 0; i < 12; ++i) {
    cards[i] = deck.pop();
  }
  return cards
}

isSet3 = function(arr) {
  if (arr.length != 3) {
    return false;
  }
  var isOkay = function(a, b, c) {
    return (a + b + c) % 3 == 0
  }
  var dimen = ['count', 'color', 'shading', 'shape'];
  for (i of arr) {
    if (cards[i] == null) return false;
  }
  for (d of dimen) {
    var x = cards[arr[0]][d], y = cards[arr[1]][d], z = cards[arr[2]][d];
    if (!isOkay(x, y, z)) {
      return false;
    }
  }
  return true;
}
