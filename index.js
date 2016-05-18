var $el = $('#display');


function restart() {
  deck = makeDeck();
  cards = deal12(deck);
  makeCardDivs();
  layoutCardDivs();

  $('#no-set-text').html('No Set');

  startTime = Date.now();
  render();
}

restart();

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
  if ($('.animating').length == 0) {
    $card.toggleClass('selected');
    checkSet();
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

function startAnimation(callback) {
  animationTime = 400;
  $('.selected .card-svg .shape').fadeOut(animationTime).addClass('animating');
  var selected = $('.selected')
  selected.removeClass('selected');

  setTimeout(callback, animationTime);
}

startTime = Date.now();

function rerender() {
  render();
}

function help() {
  if ($('.animating').length != 0) { return; }
  for (var i = 0; i < cards.length; ++i) {
    for (var j = i + 1; j < cards.length; ++j) {
      for (var k = j + 1; k < cards.length; ++k) {
        if (isSet3([i, j, k])) {
          $('.selected').removeClass('selected');
          getCardEl(i).addClass('selected');
          getCardEl(j).addClass('selected');
          getCardEl(k).addClass('selected');
          return 'found';
        }
      }
    }
  }

  if (deck.length > 0) {
    // deck = shuffle(deck.concat(cards));
    // cards = deal12(deck);
    if (deck.length >= 3) {
      cards = cards.concat(deck.slice(0, 3));
      deck = deck.slice(3);
      makeCardDivs(cards.length);
      layoutCardDivs();
      render();
    } else {
      // game over, do nothing (for now)
    }
    render();
  } else {
    for (var i = 0; i < cards.length; i++) {
      if (cards[i] != null) {
        getCardEl(i).addClass('selected');
      }
    }
    startAnimation(function() {
      cards = [];
      makeCardDivs();
      layoutCardDivs();
      rerender();
    });
  }
  return 'not found';
}

function checkSet() {
  var selectedCards = [];
  for (var i = 0; i < cards.length; i++) {
    var $ch = getCardEl(i);
    if ($ch.hasClass('selected')) {
      selectedCards.push(i);
    }
  }
  var diff = new Date(Date.now() - startTime);
  console.log(''+pad2(diff.getMinutes())+':'+pad2(diff.getSeconds()));

  function isGood(set) {
    if (set.length == 3) {
      return isSet3(set);
    } else if (set.length == 2) {
      for (var i = 0; i < cards.length; ++i) {
        var tmp = [set[0], set[1], i];
        if (isSet3(tmp)) {
          set.push(i);
          getCardEl(i).addClass('selected'); // do i really need this
          return true;
        }
      }
    } else {
      return false;
    }
  }

  if (isGood(selectedCards)) {
    console.log('yay');
    startAnimation(function() {
      if (cards.length <= 12) {
        for (var i of selectedCards) {
          cards[i] = deck.pop();
        }
      } else {
        selectedCards.sort(function(a, b) { return b - a; })
        for (var i of selectedCards) {
          cards.splice(i, 1);
        }
        makeCardDivs();
        layoutCardDivs();
      }
      if (deck.length == 0) {
        $('#no-set-text').html('Done');
      }
      rerender();
    });
  } else {
    console.log('boo hoo');
  }
  return false;
}

$('#light-dark').click(lightDark);

$(window).on("orientationchange resize", layoutCardDivs);

$('#restart').click(restart);

$('#check-set').click(checkSet);

$('#no-set').click(help);

$('body').on('keypress', function(evt) {
  var code = evt.originalEvent.code;
  var codes = ['KeyQ','KeyA','KeyZ','KeyW','KeyS','KeyX','KeyE','KeyD','KeyC','KeyR','KeyF','KeyV','KeyT','KeyG','KeyB','KeyY','KeyH','KeyN','KeyU','KeyJ','KeyM'];
  if (code == 'Enter' || code == 'Space') {
    checkSet();
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

if (typeof(Storage) !== 'undefined') {
  var colorscheme = localStorage.getItem('colorscheme');
  if (colorscheme != null) {
    setColorScheme(colorscheme);
  }
}
