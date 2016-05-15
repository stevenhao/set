print = console.log.bind(console);
pad2 = function(x) {
  x = "" + x;
  while (x.length < 2) {
    x = "0" + x;
  }
  return x;
}
