from pymongo import MongoClient


# 방법 1 - URI
# mongodb_URI = "mongodb://localhost:27017/"
# client = MongoClient(mongodb_URI)

client = MongoClient(host='i11c109.p.ssafy.io', port=27017)

print(client.list_database_names())