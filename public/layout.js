function toggleFullScreen() {
  var doc = window.document;
  var body = $body[0];

  var requestFullScreen = body.requestFullscreen || body.mozRequestFullScreen || body.webkitRequestFullScreen || body.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(body);
  }
  else {
    cancelFullScreen.call(doc);
  }
}

function makeCardDivs() {
  $display.empty();
  for (var i = 0; i < cards.length; ++i) {
    var $elem = $('<div>').addClass('card');
    registerCardHandlers($elem);
    $elem.appendTo($display);
  }
};

function layoutCardDivs() { // set positions / sizes
  var rows = 3;
  var cols = Math.ceil(cards.length / rows);
  var unit = Math.min($display.width() / (cols * 2 + (cols + 1) * .15), $display.height() / (rows * 1 + (rows + 1) * .15));
  var w = unit * 2, h = unit;

  for(var c = 0; c < cols; ++c) {
    for(var r = 0; r < rows; ++r) {
      var i = r + rows * c;
      if (i >= cards.length) {
        continue;
      }
      var marginw = ($display.width() - (cols * unit * 2)) / (cols + 1), marginh = ($display.height() - (rows * unit)) / (rows + 1);
      var $elem = getCardEl(i);
      $elem.css({position: "absolute", left: marginw * (c + 1) + w * c, top: marginh * (r + 1) + h * r, width: w, height: h});;
    }
  }
}
