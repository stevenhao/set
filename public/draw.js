function makeHiddenCard(svgElem) {
  var wdth = 5;
  for(var i = 40; i >= 0; i -= 15) {
    var circ = $$('circle');
    circ.attr('stroke', 'gray').attr('stroke-width', wdth).attr('fill', 'none');
    circ.attr('cx', 100).attr('cy', 50).attr('r', i).appendTo(svgElem);
    wdth += 1;
  }
}

var paths = {
  "diamond": "l15,30 l15,-30 l-15,-30 Z",
  "oval": "l0,20 c0,15 30,15 30,0 l0,-40 c0,-15 -30,-15 -30,0 Z",
  "squiggle": "c-2.1570791838747962,6.544283122053847 -4.314158367749604,13.088566244107705 -2.4489795918367347,19.183673469387756 c1.8651787759128697,6.09510722528005 7.752615511613418,11.741038553786302 15.10204081632653,13.061224489795919 c7.3494253047131135,1.3201859360096166 16.16083917843869,-1.6853735204773788 17.142857142857142,-6.530612244897959 c0.9820179644184557,-4.84523872442058 -5.865359980470161,-11.530156716774757 -6.530612244897959,-18.775510204081634 c-0.6652522644277984,-7.24535348730687 4.851621151605291,-15.05114246956644 4.489795918367347,-22.857142857142858 c-0.36182523323794397,-7.806000387576418 -6.602349115746922,-15.612212180469674 -13.877551020408163,-18.367346938775512 c-7.275201904661242,-2.755134758305836 -15.585081831474726,-0.45919248202425283 -17.142857142857142,3.673469387755102 c-1.5577753113824173,4.132661869779355 3.6365539926662547,10.10204333305649 5.3061224489795915,15.510204081632653 c1.669568456313337,5.408160748576165 -0.18562393510863756,10.255100782451347 -2.0408163265306123,15.10204081632653 Z",
}
var placements = {1: "85,50", 2: "60,50", 3: "35,50"};
var colors = ["red", "purple", "green", "blue", "orange", "yellow"], shadings = ["open", "striped", "solid"], shapes = ["oval", "diamond", "squiggle"], counts = [1, 2, 3];

function makeStandardCard(card) {
  var count = counts[card.count], color = colors[card.color], shading = shadings[card.shading], shape = shapes[card.shape];
  var pth = "M" + placements[count] + " " + rep(paths[shape], count).join('m50,0 ');

  var svgElem = $$('svg');
  svgElem.addClass("card-svg").attr("viewbox", "0 0 200 100");

  var rect = $$('path');
  rect.attr("d", 'M0,0 l200,0 l0, 100 l-200,0 Z').addClass("card-back").appendTo(svgElem);

  if (card.hidden) {
    makeHiddenCard(svgElem);
  } else {
    var path = $$('path');
    path.addClass('shape').addClass(color).addClass(shading).attr("d", pth).appendTo(svgElem);
  }
  return svgElem;
}

function makeProsetCard(card) {
  var svgElem = $$('svg');
  svgElem.addClass("card-svg").attr("viewbox", "0 0 200 100");

  var rect = $$('path');
  rect.attr("d", 'M0,0 l200,0 l0, 100 l-200,0 Z').addClass("card-back").appendTo(svgElem);

  if (card.hidden) {    
    makeHiddenCard(svgElem);
  } else {
    for (var i = 0; i < 6; ++i) {
      if (card.value & (1 << i)) {
        var cx = 50 * (1 + (i % 3));
        var cy = 33 * (Math.floor(i / 3) + 1);
        var circ = $$('circle').attr('cx', cx).attr('cy', cy).addClass(colors[i]).addClass('shape').addClass('circle');
        circ.appendTo(svgElem);
      }
    }
  }
  return svgElem;
}

function makeSVG(card) {
  if (card.type == '3^4') {
    return makeStandardCard(card);
  } else if (card.type == '2^6') {
    return makeProsetCard(card);
  }
}