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

function isStandardSet(set) {
  if (set.length == 3) {
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
  if (set.length == 4) {
    for (var j of [1, 2, 3]) {
      for (z of ['count', 'color', 'shading', 'shape']) {
        var a = set[0][z], b = set[j][z];
        var cd = set[1][z] + set[2][z] + set[3][z] - b;
        if ((a + b - cd) % 3 != 0) {
          return false;
        }
      }
      return true;
    }
  }
  return false;
}

function deal(deck, num) {
  var cards = []
  for (var i = 0; i < num; ++i) {
    cards[i] = deck.pop();
  }
  return cards;
}

Variants = {
  set: {
    makeDeck: makeStandardDeck,

    deal: function(deck) {
      return deal(deck, 12);
    },

    isSet: isStandardSet,

    findSet: function(cards) {
      for (var i = 0; i < cards.length; ++i) {
        for (var j = i + 1; j < cards.length; ++j) {
          for (var k = j + 1; k < cards.length; ++k) {
            if (cards[i] != null && cards[j] != null && cards[k] != null) {
              if (isStandardSet([cards[i], cards[j], cards[k]])) {
                return [i, j, k];
              }
            }
          }
        }
      }
      return null;
    }
  },

  powerset: {
    makeDeck: makeStandardDeck,

    deal: function(deck) {
      return deal(deck, 12);
    },

    isSet: isPowerSet,

    findSet: function(cards) {
      for (var i = 0; i < cards.length; ++i) {
        for (var j = i + 1; j < cards.length; ++j) {
          for (var k = j + 1; k < cards.length; ++k) {
            for(var l = k + 1; l < cards.length; ++l) {
              if (cards[i] != null && cards[j] != null && cards[k] != null && cards[l] != null) {
                if (isPowerSet([cards[i], cards[j], cards[k], cards[l]])) {
                  return [i, j, k, l];
                }
              }
            }
          }
        }
      }
      return null;

    }
  },
}