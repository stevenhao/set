var $el = $("#display");

function restart() {
  deck = makeDeck();
  cards = deal12(deck);
  makeCardDivs();
  layoutCardDivs();

  startTime = Date.now();
  render();
}

restart();

function lightDark() {
  $('body').toggleClass('light').toggleClass('dark');
  if ($('body').hasClass('light')) {
    $('#lightspan').html('off');
  } else {
    $('#lightspan').html('on');
  }
}

function toggleCard($card) {
  if ($('.animating').length == 0) {
    $card.toggleClass('selected');
    checkSet();
  }
}

var rows, cols;
function makeCardDivs() {
  rows = 3;
  cols = cards.length / rows;
  print ({rows,cols});

  $el.empty();
  for (var i = 0; i < cards.length; ++i) {
    var $elem = $('<div>').addClass('card');
    $elem.appendTo($el);
  }
  $('.card').mousedown(function(e) {
    e.preventDefault(); // don't remember what this is for
  });

  evtName = ('ontouchstart' in window) ? 'touchend' : 'click';

  $('.card').on(evtName, function(e) {
    toggleCard($(this));
    return false;
  })
};

function getCardEl(i) {
  return $($el.children()[i]);
}

function layoutCardDivs() { // set positions / sizes
  numCards = $('.card').length;
  var unit = Math.min($el.width() / (cols * 2 + 1), $el.height() / (rows + 1));
  var w = unit * 2, h = unit;

  for(var c = 0; c < cols; ++c) {
    for(var r = 0; r < rows; ++r) {
      var i = r + rows * c;
      var marginw = ($el.width() - (cols * unit * 2)) / (cols + 1), marginh = ($el.height() - (rows * unit)) / (rows + 1);
      var $elem = getCardEl(i);
      $elem.css({position: "absolute", left: marginw * (c + 1) + w * c, top: marginh * (r + 1) + h * r, width: w, height: h});;
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


function startAnimation(set, callback) {
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
      print(cards.length);
      print(cards);

      makeCardDivs(cards.length);
      layoutCardDivs();
      render();
    } else {
      // game over, do nothing (for now)
    }
    render();
  } else {
    // TODO: highlight reset button?
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
  console.log(""+pad2(diff.getMinutes())+":"+pad2(diff.getSeconds()));

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
    console.log("yay");
    startAnimation(selectedCards, function() {
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
      rerender();
    });
  } else {
    console.log("boo hoo");
  }
  return false;
}

$('#light-dark').click(lightDark);

$(window).resize(layoutCardDivs);

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
