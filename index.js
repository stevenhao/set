var $el = $('#display');

function setLabels() {
  if (deck.length > 0) {
    $('#no-set-text').html('No Set');
  } else {
    $('#no-set-text').html('Done!');
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

function rerender() {
  render();
  setLabels();
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

function isAnimating() {
  return $('.animating').length > 0;
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

function toggleCard($card) {
  if (!isAnimating()) {
    $card.toggleClass('selected');
    if ($card.hasClass('selected') && fastMode) { 
      assistSet(); // only assist when fastmode
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

function checkSet() {
  var set = getSelectedCards();
  return isSet(set);
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
    resetHolds();
  }
  return false;
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
  } else {
    if (deck.length > 0) {
      var add = Math.min(currentVariant.tableIncrement, deck.length);
      cards = cards.concat(deck.slice(deck.length - add));
      deck = deck.slice(0, deck.length - add);
      makeCardDivs();
      layoutCardDivs();
      rerender();
      saveGame();
    } else { // game over
      if (cards.length > 0) { // game over animation
        var all = [];
        for (var i = 0; i < cards.length; i++) {
          all.push(i);
        }
        fadeOutCards(all, function() {
          cards = [];
          saveGame(); // TODO: add end of game buttons
        }, 1500);
      }
    }
    return 'not found';
  }
}

function assistSet() {
  var set = getSelectedCards();
  if (set.length == 2 && fastMode) {
    for (var i = 0; i < cards.length; ++i) {
      var tmp = [set[0], set[1], i];
      if (isSet(tmp)) {
        set.push(i);
        getCardEl(i).addClass('selected'); // do i really need this
        return true;
      }
    }
  }
  return;
}

// fast mode
var holdCount = 0;
var defaultHoldTime = 10000;
var holdUntil = 0;

function resetHolds() {
  holdUntil = 0;
  holdCount = 0;
}

function clearHolds() {
  if (Date.now() >= holdUntil) {
    holdCount = 0;
  }
}

function hold(holdTime) {
  holdTime = holdTime || defaultHoldTime;
  print('holding');
  holdCount += 1;
  holdUntil = Math.max(holdUntil, Date.now() + holdTime);
  setTimeout(clearHolds, holdTime + 10);
}

function release() {
  print('releasing');
  if (holdCount > 0) {
    holdCount -= 1;
  }

  if (holdCount == 0 && holdState == false && fastMode) {
    checkAndClearSet();
  }
}

var clickStart = ('ontouchstart' in window) ? 'touchstart' : 'mousedown';
var clickEnd = ('ontouchstart' in window) ? 'touchend' : 'mouseup';
var dragLeave = 'dragleave';

function registerCardHandlers($card) {
  $card.on(clickStart, function(e) {
    e.preventDefault();
    toggleCard($(this));
    hold();
    return false;
  });

  $card.on(clickEnd, function(e) {
    release();
    return false;
  });
}

$('#light-dark').on(clickStart, lightDark);

$(window).on("orientationchange resize", layoutCardDivs);

$('#restart').on(clickStart, restart);

$('#check-set').on(clickStart, checkAndClearSet);

$('#no-set').on(clickStart, help);

$('body').on('keydown', function(evt) {
  if (evt.originalEvent.repeat) {
    return;
  }

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
  } else if (codes.indexOf(code) != -1) {
    if (!evt.shiftKey && !evt.ctrlKey && !evt.altKey) {
      var i = codes.indexOf(code);
      if (i < cards.length) {
        toggleCard(getCardEl(i));
        hold();
      }
    }
  }
});

$('body').on('keyup ', function(evt) {
  var code = evt.originalEvent.code;
  var codes = ['KeyQ','KeyA','KeyZ','KeyW','KeyS','KeyX','KeyE','KeyD','KeyC','KeyR','KeyF','KeyV','KeyT','KeyG','KeyB','KeyY','KeyH','KeyN','KeyU','KeyJ','KeyM'];
  if (codes.indexOf(code) != -1) {
    if (!evt.shiftKey && !evt.ctrlKey && !evt.altKey) {
      var i = codes.indexOf(code);
      if (i < cards.length) {
        release();
      }
    }
  }
});

$('body').on(clickStart, function(e) {
  return false;
});


if (typeof(Storage) !== 'undefined') {
  var colorscheme = localStorage.getItem('colorscheme');
  if (colorscheme != null) {
    setColorScheme(colorscheme);
  }
}