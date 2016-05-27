function RPC(method, params, callback) {
  var url = '/server'
  var data = JSON.stringify({
    'method': method,
    'params': params,
    'id': 0,
    'jsonrpc': '2.0'
  });

  var cbk = function(x) {
    console.log(x);
    if (callback) {
      callback(x);
    }
  }

  $.ajax({
    url:url,
    type:"POST",
    data:data,
    contentType:"application/json; charset=utf-8",
    dataType:"json",
    success: cbk
  });
}

/*
usage:
RPC('reportScore', [10, 'powerset', 'steven1']);
RPC('reportScore', [5, 'powerset', 'steven2']);
RPC('getScores', ['powerset']);
 */