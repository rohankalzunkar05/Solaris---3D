"""Send an authoring or inspection script to the installed Blender Lab MCP bridge."""
import argparse
import json
import socket
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("script", type=Path)
args = parser.parse_args()
request = {"type": "execute", "strict_json": True, "code": args.script.read_text(encoding="utf-8")}
with socket.create_connection(("127.0.0.1", 9876), timeout=8) as connection:
    connection.settimeout(180)
    connection.sendall(json.dumps(request).encode() + b"\0")
    payload = bytearray()
    while b"\0" not in payload:
        chunk = connection.recv(65536)
        if not chunk:
            raise RuntimeError("Blender closed the connection without a response")
        payload.extend(chunk)
response = json.loads(payload.split(b"\0", 1)[0])
print(json.dumps(response.get("result", {}), indent=2))
if response["status"] != "ok":
    raise RuntimeError(response.get("message", response))

