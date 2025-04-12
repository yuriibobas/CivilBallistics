from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from pprint import pprint
uri = 'mongodb+srv://hayevska:2hyrfNt7jQVd3hf@cluster0.qjtidh4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
# uri = "mongodb+srv://hayevska:2hyrfNt7jQVd3hf@cluster0.qjtidh4.mongodb.net/?appName=Cluster0"
# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))
# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

db = client["Funiania_Ballistics"]
collection = db["Rockets"]
rockets = collection.find()
# Database of dictionaries with info about each rocket

for rocket in rockets:
    pprint(rocket)

rocket_name = "Х-32"
rocket_info = collection.find_one({"Назва": rocket_name})
# For finding a certain rocket by key and value

# Display the result
if rocket_info:
    for key, value in rocket_info.items():
        print(f"{key}: {value}")
else:
    print("Rocket not found.")