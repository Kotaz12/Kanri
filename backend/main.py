# api/index.py  (punto de entrada FastAPI)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from pymongo import MongoClient

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://kanri-ruby.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = MongoClient(os.environ["MONGODB_URL"])
db = client[os.environ["DB_NAME"]]

@app.get("/api/tramites")
def get_tramites():
    return list(db.tramites.find({}, {"_id": 0}))