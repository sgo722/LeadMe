from pymongo import MongoClient


# 방법 1 - URI
# mongodb_URI = "mongodb://localhost:27017/"
# client = MongoClient(mongodb_URI)

client = MongoClient(
    host='localhost',
    port=27070,
    username='leadme',
    password='leadmessafy11',
    authSource='admin'  # 인증할 데이터베이스를 지정합니다. 기본적으로 'admin'을 사용합니다.
)
print(client.list_database_names())