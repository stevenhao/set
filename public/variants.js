function makeStandardDeck(seed) {
  var deck = []
  for(var i = 0; i < 81; ++i) {
    var cur = i;
    var a = cur % 3; cur = (cur - a) / 3;
    var b = cur % 3; cur = (cur - b) / 3;
    var c = cur % 3; cur = (cur - c) / 3;
    var z = cur;
    deck.push({type: '3^4', count: a, color: b, shading: c, shape: z});
  }
  return shuffle(deck, seed);
}

function isNotNull(set) {
  for (var i of set) {
    if (i == null) return false;
  }
  return true;
}

function isStandardSet(set) {
  if (isNotNull(set) && set.length == 3) {
    for (z of ['count', 'color', 'shading', 'shape']) {
      var a = set[0][z], b = set[1][z], c = set[2][z];
      if ((a + b + c) % 3 != 0) {
        return false;
      }
    }
    return true;
  }
  return false;
}

function isSuperSet(set) {
  if (isNotNull(set) && set.length == 4) {
    for (var j of [1, 2, 3]) {
      var cnt = 0;
      for (z of ['count', 'color', 'shading', 'shape']) {
        var a = set[0][z], b = set[j][z];
        var cd = set[1][z] + set[2][z] + set[3][z] - b;
        if ((a + b - cd) % 3 != 0) {
          continue;
        } else {
          ++cnt;
        }
      }
      if (cnt == 4) {
        return true;
      }
    }
  }
  return false;
}

function deal(deck) {
  var cards = [];
  for (var i = 0; i < this.tableSize; ++i) {
    cards[i] = deck.pop();
  }
  return cards;
}

function listGT(a, b) {
  if (a.length != b.length) {
    return a.length > b.length;
  }
  for (var i = 0; i < a.length && i < b.length; ++i) {
    if (a[i] > b[i]) {
      return true;
    } else if (a[i] < b[i]) {
      return false;
    }
  }
  return false;
}

function naiveSetFinder(setSize, isSet) {
  function findSet(cards, previous) {
    function recurse(partial, lastIndex) {
      if (partial.length >= setSize) {
        if (previous == null || listGT(partial, previous)) {
          var set = partial.map(function(i) { return cards[i]; });
          if (isSet(set)) {
            return partial;
          }
        }
        return null;
      } else {
        for (var i = lastIndex + 1; i < cards.length; ++i) {
          var nxt = partial.slice();
          nxt.push(i);
          var ret = recurse(nxt, i);
          if (ret != null) {
            return ret;
          }
        }
      }
      return null;
    }

    var ret = recurse([], -1);
    if (ret == null && previous != null) {
      previous = null;
      ret = recurse([], -1);
    }
    return ret;
  }
  return findSet;
}

set = {
  name: 'Set',
  makeDeck: makeStandardDeck,
  deal: deal,
  isSet: isStandardSet,
  findSet: naiveSetFinder(3, isStandardSet),
  findNextSet: naiveSetFinder(3, isStandardSet),
  tableSize: 12,
  tableIncrement: 3,
}

superset = {
  name: 'Super Set',
  makeDeck: makeStandardDeck,
  deal: deal,
  isSet: isSuperSet,

  findSet: naiveSetFinder(4, isSuperSet),
  findNextSet: naiveSetFinder(4, isSuperSet),
  tableSize: 9,
  tableIncrement: 2,
}

hiddenset = {
  name: 'Set',
  makeDeck: function(seed) {
    var ret = makeStandardDeck(seed);
    ret[0].hidden = true;
    return ret;
  },
  deal: deal,
  isSet: isStandardSet,
  findSet: naiveSetFinder(3, isStandardSet),
  findNextSet: naiveSetFinder(3, isStandardSet),
  tableSize: 12,
  tableIncrement: 3,
}

function isPowerSet(set) {
  if (isNotNull(set)) {
    if (set.length > 0) {
      var tot = 0;
      for (var i of set) {
        tot ^= i.value;
      }
      if (tot == 0) {
        return true;
      }
    }
  }
  return false;
}

function findPowerSet(cards, previous) {
  var n = cards.length;
  var best = null;
  var first = null;
  for (var i = 1; i < (1 << n); ++i) {
    var set = [], setCards = [];
    for(var j = 0; j < n; ++j) {
      if (i & (1 << j)) {
        set.push(j);
        setCards.push(cards[j]);
      }
    }
    if (isPowerSet(setCards)) {
      print ('found ', i);
      if (previous == null || listGT(set, previous)) {
        if (best == null || listGT(best, set)) {
          best = set;
        }
      }
    }
  }
  if (best == null && previous != null) {
    best = findPowerSet(cards, null);
  }
  return best;
}

function powersetWithDimension(dim) {
  return {
    name: 'Power Set ' + dim,
    makeDeck: function(seed) {
      var deck = [];
      for (var i = 1; i < (1 << dim); ++i) {
        deck.push({type: '2^' + dim, value: i});
      }
      return shuffle(deck, seed);
    },
    deal: deal,
    isSet: isPowerSet,
    findSet: findPowerSet,
    findNextSet: findPowerSet,
    tableSize: dim + 1,
    tableIncrement: 1, // mathematically impossible to have no-set
  }
}

Variants = {
  set: set,
  superset: superset,
  hiddenset: hiddenset,
  powerset: powersetWithDimension(6),
  powersetWithDimension: powersetWithDimension,
}