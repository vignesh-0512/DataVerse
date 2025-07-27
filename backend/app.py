from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

limiter = Limiter(get_remote_address, app=app, default_limits=["100 per minute"])

mongo_uri = os.getenv("MONGO_URI")
db_name = os.getenv("DB_NAME", "dashboard")
collection_name = os.getenv("COLLECTION_NAME", "insights")

client = MongoClient(mongo_uri)
db = client[db_name]
collection = db[collection_name]

FILTER_FIELDS = ['end_year', 'topic', 'sector', 'region', 'pestle', 'source', 'swot', 'country', 'city']

@app.route("/api/data", methods=["GET"])
@limiter.limit("30/minute")
def get_all_data():
    try:
        data = list(collection.find({}, {'_id': 0}))
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/filter", methods=["GET"])
@limiter.limit("30/minute")
def filter_data():
    query = {field: request.args.get(field) for field in FILTER_FIELDS if request.args.get(field)}
    try:
        result = list(collection.find(query, {'_id': 0}))
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/graph/bar", methods=["GET"])
def get_bar_data():
    try:
        pipeline = [
            {"$group": {"_id": "$region", "total_intensity": {"$sum": "$intensity"}}},
            {"$sort": {"total_intensity": -1}}
        ]
        data = list(collection.aggregate(pipeline))
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/graph/line", methods=["GET"])
def get_line_data():
    try:
        pipeline = [
            {"$group": {"_id": "$end_year", "avg_likelihood": {"$avg": "$likelihood"}}},
            {"$sort": {"_id": 1}}
        ]
        data = list(collection.aggregate(pipeline))
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/graph/pie", methods=["GET"])
def get_pie_data():
    try:
        pipeline = [
            {"$group": {"_id": "$pestle", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        data = list(collection.aggregate(pipeline))
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=False)
