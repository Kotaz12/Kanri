# api/tramites.py
from http.server import BaseHTTPRequestHandler
import json
import os
from pymongo import MongoClient

client = MongoClient(os.environ["MONGODB_URL"])
db = client[os.environ["DB_NAME"]]

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        tramites = list(db.tramites.find({}, {"_id": 0}))
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(tramites).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()