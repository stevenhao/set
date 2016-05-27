import requests
import json


def main():
    url = "http://s.org/server"
    headers = {'content-type': 'application/json'}

    # Example echo method
    payload = {
        "method": "echo",
        "params": ["echome!"],
        "jsonrpc": "2.0",
        "id": 0,
    }
    print json.dumps(payload)
    response = requests.post(
        url, data=json.dumps(payload), headers=headers).json()
    print response
    assert response["result"] == "echome!"
    assert response["jsonrpc"]
    assert response["id"] == 0

if __name__ == "__main__":
    main()