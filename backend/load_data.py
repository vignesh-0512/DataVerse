#performing insert operation to store data in db

import json
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

if not all([MONGO_URI, DB_NAME, COLLECTION_NAME]):
    raise ValueError("Missing environment variable(s): check your .env file")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]  

json_file = 'jsondata.json'
try:
    with open(json_file, 'r', encoding='utf-8') as file:
        data = json.load(file)

    if isinstance(data, list):
        result = collection.insert_many(data)
        print(f" {len(result.inserted_ids)} documents inserted into '{COLLECTION_NAME}' collection.")
    else:
        print("JSON must contain a list of documents (e.g. [ {...}, {...} ])")

except FileNotFoundError:
    print(f"File '{json_file}' not found.")
except json.JSONDecodeError:
    print(f"Failed to parse JSON in '{json_file}'.")
except Exception as e:
    print(f"Unexpected error: {e}")
