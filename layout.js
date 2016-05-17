function toggleFullScreen() {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  }
  else {
    cancelFullScreen.call(doc);
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
  evtName = ('ontouchstart' in window) ? 'touchstart' : 'click';

  $('.card').on(evtName, function(e) {
    e.preventDefault();
    toggleCard($(this));
    return false;
  })
};

function layoutCardDivs() { // set positions / sizes
  numCards = $('.card').length;
  var unit = Math.min($el.width() / (cols * 2 + (cols + 1) * .15), $el.height() / (rows * 1 + (rows + 1) * .15));
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
