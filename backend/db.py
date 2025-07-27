from pymongo import MongoClient

uri = "mongodb+srv://vignesh:esbPBHaVGRd6l0hL@visualization-dashboard.uthag5b.mongodb.net/?retryWrites=true&w=majority&appName=visualization-dashboard"
client = MongoClient(uri)

db = client["visualization-dashboard"]
test_coll = db["coll"]

test_doc = {
    "Message":"Connection Established Successfully",
    "Author":"Vignesh"
}

db["coll"].drop()

