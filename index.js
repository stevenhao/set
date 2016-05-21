var $el = $('#display');

function isAnimating() {
  return $('.animating').length > 0;
}

function newGame() {
  if (!isAnimating()) {
    deck = currentVariant.makeDeck();
    cards = currentVariant.deal(deck);
    makeCardDivs();
    layoutCardDivs();
    setLabels();
    render();
    startTime = Date.now();
    saveGame();
  }
}

function setColorScheme(colorScheme) {
  if (colorScheme == 'light') {
    $('body').addClass('light').removeClass('dark');
  } else if (colorScheme == 'dark') {
    $('body').addClass('dark').removeClass('light');
  }
  if (typeof(Storage) !== 'undefined') {
    localStorage.setItem('colorscheme', colorScheme);
  }
}

function loadGame() {
  var gameid = currentVariant.name;
  if (typeof(Storage) !== 'undefined' && localStorage.getItem(gameid) != null) {
    var game = JSON.parse(localStorage.getItem(gameid));
    if (game != null && game.cards != null) {
      cards = game.cards;
      deck = game.deck;
      startTime = game.startTime;
      makeCardDivs();
      layoutCardDivs();
      setLabels();
      render();
      return true;
    }
  }
  return false;
}

function saveGame() {
  var gameid = currentVariant.name;
  if (typeof(Storage) !== 'undefined') {
    localStorage.setItem(gameid, JSON.stringify({cards: cards, deck: deck, startTime: startTime}));
  }
}

restart = newGame;

function start() {
  try {
    if (loadGame()) {
      print('successfully loaded game');
    } else {
      newGame();
    }
  } catch(e) {
    print('failed to load game');
    newGame();
  }
}

function setLabels() {
  if (deck.length > 0) {
    $('#no-set-text').html('No Set');
  } else {
    $('#no-set-text').html('Done!');
  }
}

function lightDark() {
  if ($('body').hasClass('light')) {
    setColorScheme('dark');
  } else {
    setColorScheme('light');
  }
}

function getCardEl(i) {
  return $($el.children()[i]);
}

function toggleCard($card) {
  if (!isAnimating()) {
    $card.toggleClass('selected');
    if (fastMode) {
      checkAndClearSet();
    }
  }
}

function render() { // draws svgs
  for(var i = 0; i < cards.length; ++i) {
    var $parent = $($el.children()[i]);
    $parent.empty();
    if(cards[i] != null) {
      var svgElem = makeCard(cards[i]);
      svgElem.appendTo($parent);
    }
  }
}

function fadeOutShapes(targets, callback, animationTime) {
  animationTime = animationTime || defaultAnimationTime;
  for (var i of targets) {
    $('.shape', getCardEl(i)).fadeOut(animationTime).addClass('animating');
  }

  setTimeout(function() {
    $('.animating').removeClass('animating');
  }, animationTime);
  setTimeout(callback, animationTime);
}

function fadeOutCards(targets, callback, animationTime) {
  animationTime = animationTime || defaultAnimationTime;
  for (var i of targets) {
    getCardEl(i).fadeOut(animationTime).addClass('animating');
  }

  setTimeout(function() {
    $('.animating').removeClass('animating');
  }, animationTime);
  setTimeout(callback, animationTime);
}


function rerender() {
  render();
  setLabels();
}

function help() {
  if (isAnimating()) {
    return;
  }
  var ans;
  if (checkSet()) { // already a set, so move to the next one.
    ans = currentVariant.findNextSet(cards, getSelectedCards());
  } else {
    ans = currentVariant.findSet(cards);
  }

  if (ans != null) {
    $('.selected').removeClass('selected');
    for (var i of ans) {
      getCardEl(i).addClass('selected');
    }
    return 'found';
  }

  if (deck.length > 0) {
    var add = Math.min(currentVariant.tableIncrement, deck.length);
    cards = cards.concat(deck.slice(0, add));
    deck = deck.slice(add);
    makeCardDivs();
    layoutCardDivs();
    render();
    saveGame();
  } else if (cards.length > 0) {
    var all = [];
    for (var i = 0; i < cards.length; i++) {
      all.push(i);
    }
    fadeOutCards(all, function() {
      cards = [];
      saveGame();
    }, 1500);
    // TODO: simultaneously fade-in timer
  }
  return 'not found';
}

function getSelectedCards() {
  var ret = [];
  for (var i = 0; i < cards.length; i++) {
    var $ch = getCardEl(i);
    if ($ch.hasClass('selected')) {
      ret.push(i);
    }
  }
  return ret;
}

function checkSet() {
  function isSet(set) {
    var cardsSet = [];
    for(var i of set) {
      if (cards[i] == null) {
        return false;
      }
      cardsSet.push(cards[i]);
    }
    return currentVariant.isSet(cardsSet);
  }

  function isGood(set) {
    if (isSet(set)) {
      return true;
    } else if (set.length == 2 && fastMode) {
      for (var i = 0; i < cards.length; ++i) {
        var tmp = [set[0], set[1], i];
        if (isSet(tmp)) {
          set.push(i);
          getCardEl(i).addClass('selected'); // do i really need this
          return true;
        }
      }
    }
    return false;
  }
  return isGood(getSelectedCards());
}

function checkAndClearSet() {
  if (checkSet()) {
    var diff = new Date(Date.now() - startTime);
    console.log(''+pad2(diff.getMinutes())+':'+pad2(diff.getSeconds()));
    var selectedCards = getSelectedCards();
    if (cards.length <= currentVariant.tableSize) {
      if (deck.length >= selectedCards.length) {
        fadeOutShapes(selectedCards, function() {
          for (var i of selectedCards) {
            cards[i] = deck.pop();
          }
          rerender();
          saveGame();
        });
      } else {
        fadeOutCards(selectedCards, function() {
          for (var i of selectedCards) {
            if (deck.length > 0) {
              cards[i] = deck.pop();
            } else {
              cards[i] = null;
            }
          }
          makeCardDivs();
          layoutCardDivs(); // TODO: animate the cards into the new layout

          rerender();
          saveGame();
        }, 800);
      }
    } else {
      fadeOutCards(selectedCards, function() {
        selectedCards.sort(function(a, b) { return b - a; })
        for (var i of selectedCards) {
          cards.splice(i, 1);
        }
        while (deck.length > 0 && cards.length < currentVariant.tableSize) { // if addCards != setSizes
          cards.push(deck.pop());
        }
        makeCardDivs();
        layoutCardDivs();
        rerender();
        saveGame();
      });
    }
    $('.selected').removeClass('selected');
  }
  return false;
}

var evtName = ('ontouchstart' in window) ? 'touchstart' : 'click';

function registerCardHandlers($card) {
  $card.mousedown(function(e) {
    e.preventDefault(); // don't remember what this is for
  });

  $card.on(evtName, function(e) {
    toggleCard($(this));
  });
}

$('#light-dark').on(evtName, lightDark);

$(window).on("orientationchange resize", layoutCardDivs);

$('#restart').on(evtName, restart);

$('#check-set').on(evtName, checkAndClearSet);

$('#no-set').on(evtName, help);

$('body').on('keypress', function(evt) {
  var code = evt.originalEvent.code;
  var codes = ['KeyQ','KeyA','KeyZ','KeyW','KeyS','KeyX','KeyE','KeyD','KeyC','KeyR','KeyF','KeyV','KeyT','KeyG','KeyB','KeyY','KeyH','KeyN','KeyU','KeyJ','KeyM'];
  if (code == 'Enter' || code == 'Space') {
    checkAndClearSet();
  } else if (evt.shiftKey && code == 'KeyL') {
    lightDark();
  } else if (evt.shiftKey && code == 'KeyR') {
    restart();
  } else if (evt.shiftKey && code == 'KeyN') {
    help();
  } else if (!evt.shiftKey && !evt.ctrlKey && !evt.altKey && codes.indexOf(code) != -1) {
    var i = codes.indexOf(code);
    if (i < cards.length) {
      toggleCard(getCardEl(i));
    }
  }
});

$('body').on(evtName, function(e) {
  // e.preventDefault();
  return false;
});

if (typeof(Storage) !== 'undefined') {
  var colorscheme = localStorage.getItem('colorscheme');
  if (colorscheme != null) {
    setColorScheme(colorscheme);
  }
}