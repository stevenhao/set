function makeStandardDeck() {
  var deck = []
  for(var i = 0; i < 81; ++i) {
    var cur = i;
    var a = cur % 3; cur = (cur - a) / 3;
    var b = cur % 3; cur = (cur - b) / 3;
    var c = cur % 3; cur = (cur - c) / 3;
    var z = cur;
    deck.push({count: a, color: b, shading: c, shape: z});
  }
  return shuffle(deck);
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

function isPowerSet(set) {
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
    print('finding set in ', cards);
    print('previous = ', previous);
    function recurse(partial, lastIndex) {
      if (partial.length >= setSize) {
        if (previous == null || listGT(partial, previous)) {
          var set = partial.map(function(i) { return cards[i]; });
          if (isSet(set)) {
            return partial;
          }
        }
        return null;
      } else if (previous != null && listGT(previous, partial)) {
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

    var ret = recurse([], [], 0);
    if (ret == null && previous != null) {
      previous = null;
      ret = recurse([], [], 0);
    }
    print('returning', ret);
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

powerset = {
  name: 'Power Set',
  makeDeck: makeStandardDeck,
  deal: deal,
  isSet: isPowerSet,

  findSet: naiveSetFinder(4, isPowerSet),
  findNextSet: naiveSetFinder(4, isPowerSet),
  tableSize: 9,
  tableIncrement: 2,
}

setLastCardHidden = {
  name: 'Set',
  makeDeck: function() {
    var ret = makeStandardDeck();
    // ret[ret.length - 1].hidden = true;
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

Variants = {
  set: set,
  powerset: powerset,
  hidelast: setLastCardHidden
}