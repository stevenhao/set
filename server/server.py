# from https://pypi.python.org/pypi/json-rpc
from werkzeug.wrappers import Request, Response
from werkzeug.serving import run_simple
from jsonrpc import JSONRPCResponseManager, dispatcher
from collections import defaultdict
import json

highScores = defaultdict(list)

@dispatcher.add_method
def reportScore(score, variant, name):
  highScores[variant] = sorted(highScores[variant] + [(score, name)])[-10:]
  return "OK" # TODO: database stuff

@dispatcher.add_method
def getScores(variant):
  data = highScores[variant]
  result = json.dumps(data)
  return result

@Request.application
def application(request):
  response = JSONRPCResponseManager.handle(
      request.data, dispatcher)
  return Response(response.json, mimetype='application/json')


if __name__ == '__main__':
  run_simple('localhost', 4000, application)