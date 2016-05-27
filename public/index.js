var $body = $(document.body);
var $display = $('#display');
var $clock = $('#clock');
var $restartBig = $('#restartBig')
var $restart = $('#restart')
var $noSet = $('#no-set');
var $checkSet = $('#check-set');
var gameOver = false;

function getClockTime() {
  var diff = new Date(Date.now() - startTime);
  return ''+pad2(diff.getMinutes())+':'+pad2(diff.getSeconds())
}

function showClock(animationTime) {
  $clock.html(getClockTime());
  $clock.addClass('animating');
  $clock.fadeIn(animationTime);
  setTimeout(function() {
    $clock.removeClass('animating');
  }, animationTime);
}

function showRestartBig(animationTime) {
  $restartBig.addClass('animating');
  $restartBig.fadeIn(animationTime);
  setTimeout(function() {
    $restartBig.removeClass('animating');
  }, animationTime);
}

function endGame() {
  gameOver = true;

  var all = [];
  for (var i = 0; i < cards.length; i++) {
    all.push(i);
  }
  $noSet.fadeOut(1500);
  $checkSet.fadeOut(1500);
  fadeOutCards(all, 1500);
  setTimeout(function() {
    cards = [];
    saveGame(); 
    showClock(2000);
    showRestartBig(3000);
  }, 500);
}

function setLabels() {
  if (deck.length > 0) {
    $('#no-set-text').html('No Set');
  } else {
    $('#no-set-text').html('Done!');
  }
}

function render() { // draws svgs
  for(var i = 0; i < cards.length; ++i) {
    var $parent = $($display.children()[i]);
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

function rewindClock(animationTime) {
  var s = $clock.html();
  var time = 0;
  var step = animationTime / 40;
  function fiddle(str) {
    var ret = '';
    for (var i = 0; i < str.length; ++i) {
      if (str[i] == ':') {
        ret += ':';
      } else {
        var ch = str.charCodeAt(i) - '0'.charCodeAt(0);
        ch = (ch + rand(3) + 9) % 10 + '0'.charCodeAt(0);
        ret += String.fromCharCode(ch);
      }
    }
    return ret;
  }
  for (var i = 0; i < 30; ++i) {
    setTimeout(function() {
      s = fiddle(s);
      $clock.html(s);
    }.bind(i), time);
    time += step;
  }
  for(var i = 9; i >= 1; --i) {
    setTimeout(function() {
      var pattern = new RegExp('' + this, "g");
      s = s.replace(pattern, this - 1);
      $clock.html(s);
    }.bind(i), time);
    time += step;
  }
}

function newGame() {
  if (!isAnimating()) {
    function go() {
      deck = currentVariant.makeDeck();
      cards = currentVariant.deal(deck);
      makeCardDivs();
      layoutCardDivs();
      setLabels();
      render();
      $noSet.fadeIn();
      $checkSet.fadeIn();

      startTime = Date.now();
      saveGame();
      print('started new game')
      gameOver = false;
    }

    if (gameOver) {
      rewindClock(700);
      $clock.fadeOut(1100);
      $(restartBig).fadeOut(400);
      setTimeout(go, 1000)
    } else {
      go();
    }
  }
}

function setColorScheme(colorScheme) {
  if (colorScheme == 'light') {
    $body.addClass('light').removeClass('dark');
  } else if (colorScheme == 'dark') {
    $body.addClass('dark').removeClass('light');
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
      print('successfully loaded game from memory');
    } else {
      newGame();
    }
  } catch(e) {
    print('failed to load game from memory');
    newGame();
  }
}

function lightDark() {
  if ($body.hasClass('light')) {
    setColorScheme('dark');
  } else {
    setColorScheme('light');
  }
}

function getCardEl(i) {
  return $($display.children()[i]);
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

function fadeOutShapes(targets, animationTime) {
  for (var i of targets) {
    $('.shape', getCardEl(i)).fadeOut(animationTime).addClass('animating');
  }

  setTimeout(function() {
    $('.animating').removeClass('animating');
  }, animationTime);
}

function fadeOutCards(targets, animationTime) {
  for (var i of targets) {
    getCardEl(i).fadeOut(animationTime).addClass('animating');
  }

  setTimeout(function() {
    $('.animating').removeClass('animating');
  }, animationTime);
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
    console.log(getClockTime());
    var selectedCards = getSelectedCards();
    if (cards.length <= currentVariant.tableSize) {
      if (deck.length >= selectedCards.length) {
        fadeOutShapes(selectedCards, defaultAnimationTime);
        setTimeout(function() {
          for (var i of selectedCards) {
            cards[i] = deck.pop();
          }
          rerender();
          saveGame();
        }, defaultAnimationTime);
      } else {
        fadeOutCards(selectedCards, defaultAnimationTime);
        setTimeout(function() {
          for (var i of selectedCards) {
            if (deck.length > 0) {
              cards[i] = deck.pop();
            } else {
              cards[i] = null;
            }
          }
          makeCardDivs();
          layoutCardDivs();
          rerender();
          saveGame();

          var done = true;
          for (var card of cards) {
            if (card != null) {
              done = false;
            }
          }
          if (done) {
            endGame();
          }
        }, defaultAnimationTime);
      }
    } else {
      fadeOutCards(selectedCards, defaultAnimationTime);
      setTimeout(function() {
        selectedCards.sort(function(a, b) { return b - a; })
        for (var i of selectedCards) {
          cards.splice(i, 1);
        }
        while (deck.length > 0 && cards.length < currentVariant.tableSize) { // if addCards != setSizes
          cards.push(deck.pop());
        }
        makeCardDivs();
        layoutCardDivs();// TODO: animate the cards into the new layout
        rerender();
        saveGame();
      }, defaultAnimationTime);
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
      if (!gameOver) {
        endGame();
      }
    }
    return 'not found';
  }
}

function assistSet() {
  var set = getSelectedCards();
  var tmp = set.slice();
  for (var i = 0; i < cards.length; ++i) {
    tmp.push(i);
    if (isSet(tmp)) {
      set.push(i); // do i really need this
      getCardEl(i).addClass('selected'); 
      return true;
    }
    tmp.pop();
  }
  return;
}

// fast mode
var holdCount = 0;
var defaultHoldTime = 10000;
var holdUntil = 0;
var holdState = false; // true if deselecting

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
  holdCount += 1;
  holdUntil = Math.max(holdUntil, Date.now() + holdTime);
  setTimeout(clearHolds, holdTime + 10);
}

function release() {
  if (holdCount > 0) {
    holdCount -= 1;
  }

  if (holdCount == 0 && fastMode) {
    holdState = null;
    checkAndClearSet();
  }
}

function toggleCard($card) {
  if (!isAnimating()) {
    var state = $card.hasClass('selected');
    if (holdState == null) {
      holdState = state;
    }
    if (holdCount > 0 && holdState != state) {
      return;
    }

    $card.toggleClass('selected');
    if ($card.hasClass('selected') && autoComplete) {
      assistSet(); // only assist when autoComplete & selecting new
    }
  }
}

var clickStart = ('ontouchstart' in window) ? 'touchstart' : 'mousedown';
var clickEnd = ('ontouchstart' in window) ? 'touchend' : 'mouseup';

function registerCardHandlers($card) {
  $card.on(clickStart, function(e) {
    e.preventDefault();
    toggleCard($(this));
  });

}

$('#light-dark').on(clickStart, lightDark);

$(window).on("orientationchange resize", function() {layoutCardDivs(); rerender();});

$restart.on(clickStart, restart);
$restartBig.on(clickStart, restart);

$checkSet.on(clickStart, checkAndClearSet);

$noSet.on(clickStart, help);

$body.on('keydown', function(evt) {
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
  } else if (evt.shiftKey && code == 'KeyF') {
    toggleFullScreen();
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

$body.on('keyup ', function(evt) {
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

$body.on(clickEnd, function(e) {
  print('release');
  release();
  return false;
});
$body.on(clickStart, function(e) {
  print('hold');
  hold();
  return false;
});
$body.on('touchmove', function(e) {
  var x = e.originalEvent.targetTouches[0].pageX, y = e.originalEvent.targetTouches[0].pageY;
  for (var i = 0; i < cards.length; ++i) {
    var $el = getCardEl(i);
    var w = $el.width(), h = $el.height();
    var rect = $el[0].getBoundingClientRect();
    var cy = (rect.top + rect.bottom) / 2, cx = (rect.left + rect.right) / 2;
    function sq(x) { return x * x;}
    var dst = Math.sqrt(sq(x - cx) + sq(y - cy));
    if (dst < Math.min(w, h) * .8) {
      toggleCard($el);
    }
  }
  if (holdUntil < Date.now() + 1000) {
    holdUntil = Math.max(holdUntil, Date.now() + defaultHoldTime);
    setTimeout(clearHolds, holdUntil - Date.now() + 10);
  }
})


if (typeof(Storage) !== 'undefined') {
  var colorscheme = localStorage.getItem('colorscheme');
  if (colorscheme != null) {
    setColorScheme(colorscheme);
  }
}