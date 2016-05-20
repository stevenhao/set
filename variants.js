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

function deal(deck, num) {
  var cards = []
  for (var i = 0; i < num; ++i) {
    cards[i] = deck.pop();
  }
  return cards;
}

function listGT(a, b) { // a.length == b.length
  for (var i = 0; i < a.length; ++i) {
    if (a[i] > b[i]) {
      return true;
    } else if (a[i] < b[i]) {
      return false;
    }
  }
  return false;
}

Variants = {
  set: {
    makeDeck: makeStandardDeck,

    deal: function(deck) {
      return deal(deck, this.tableSize);
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
    },

    findNextSet: function(cards, prvSet) { // prvSet is sorted indices, cannot be null
      for (var i = 0; i < cards.length; ++i) {
        for (var j = i + 1; j < cards.length; ++j) {
          for (var k = j + 1; k < cards.length; ++k) {
            if (cards[i] != null && cards[j] != null && cards[k] != null) {
              if (listGT([i, j, k], prvSet) && isStandardSet([cards[i], cards[j], cards[k]])) {
                return [i, j, k];
              }
            }
          }
        }
      }
      return this.findSet(cards);
    },

    tableSize: 12,
    tableIncrement: 3,
  },

  powerset: {
    makeDeck: makeStandardDeck,

    deal: function(deck) {
      return deal(deck, this.tableSize);
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
    },

    findNextSet: function(cards, prvSet) { // prvSet is sorted indices, cannot be null
      for (var i = 0; i < cards.length; ++i) {
        for (var j = i + 1; j < cards.length; ++j) {
          for (var k = j + 1; k < cards.length; ++k) {
            for(var l = k + 1; l < cards.length; ++l) {
              if (cards[i] != null && cards[j] != null && cards[k] != null && cards[l] != null) {
                if (listGT([i, j, k, l], prvSet) && isPowerSet([cards[i], cards[j], cards[k], cards[l]])) {
                  return [i, j, k, l];
                }
              }
            }
          }
        }
      }
      return this.findSet(cards);
    },


    tableSize: 9,
    tableIncrement: 4,
  },
}