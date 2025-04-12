from pymongo import MongoClient
from pymongo.server_api import ServerApi

uri = "mongodb+srv://hayevska:2hyrfNt7jQVd3hf@cluster0.qjtidh4.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(uri, server_api=ServerApi('1'))

try:
    client.admin.command('ping')
    print("✅ Підключення до MongoDB успішне!")
except Exception as e:
    print("❌ Помилка:", e)
