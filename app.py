from flask import Flask, render_template, request, jsonify
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId
import math
import certifi
app = Flask(__name__)

# MongoDB connection URI
uri = "mongodb+srv://hayevska:2hyrfNt7jQVd3hf@cluster0.qjtidh4.mongodb.net/?appName=Cluster0"

# Функція для підключення до MongoDB і отримання колекції ракет
def get_rockets_collection():
    client = MongoClient(
        uri,
        server_api=ServerApi('1'),
        tls=True,
        tlsCAFile=certifi.where()
    )
    try:
        client.admin.command('ping')
        print("✅ Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(f"❌ MongoDB connection error: {e}")
        return None

    db = client["Funiania_Ballistics"]
    collection = db["Rockets"]
    return collection

# Отримати всі ракети
def get_all_rockets():
    collection = get_rockets_collection()
    if collection is not None:
        rockets = list(collection.find())
        return rockets
    return []

# Отримати одну ракету за ID
def get_rocket_by_id(rocket_id):
    collection = get_rockets_collection()
    if collection is not None:
        try:
            rocket = collection.find_one({"_id": ObjectId(rocket_id)})
            return rocket
        except Exception as e:
            print(f"Error retrieving rocket: {e}")
            return None
    return None

# Отримання списку ракет
@app.route('/get_rockets')
def get_rockets():
    # Отримуємо дані з MongoDB
    rockets = get_all_rockets()
    # Змінюємо формат для відповіді, щоб відповідати очікуванням JavaScript
    result = []
    for rocket in rockets:
        # Перевіряємо наявність ключів
        if '_id' in rocket and 'Назва' in rocket:
            # Перетворюємо в масив [id, name] замість об'єкта {id, name}
            result.append([str(rocket['_id']), rocket['Назва']])
    return jsonify(result)

# Отримання характеристик конкретної ракети
@app.route('/get_rocket/<rocket_id>')
def get_rocket(rocket_id):
    # Отримуємо дані з MongoDB
    rocket = get_rocket_by_id(rocket_id)
    if rocket:
        # Перетворюємо в масив [id, name, speed, explosion_power, range]
        # для відповідності очікуванням JavaScript
        result = [
            str(rocket['_id']),
            rocket.get('Назва', ''),
            rocket.get('Швидкість м/с', 0),
            rocket.get('Вибухова сила кт', 0),
            rocket.get('Операційна дальність', 0)
        ]
        return jsonify(result)
    return jsonify(None)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate_safety', methods=['POST'])
def calculate_safety():
    data = request.json
    explosion_power = data['explosion_power']

    # Радіуси небезпеки (змінюється залежно від вибухової сили)
    red_radius = math.cbrt(explosion_power) * 15
    yellow_radius = math.cbrt(explosion_power) * 35
    green_radius = math.cbrt(explosion_power) * 70

    zones = [
        {"color": "red", "outer_radius": red_radius},
        {"color": "yellow", "outer_radius": yellow_radius},
        {"color": "green", "outer_radius": green_radius}
    ]

    return jsonify({"zones": zones})

@app.route('/calculator')
def calculator():
    return render_template('calculator.html')

@app.route('/wiki')
def wiki():
    return render_template('wiki.html')

@app.route('/instruction')
def instruction():
    return render_template('instruction.html')

@app.route('/contacts')
def contacts():
    return render_template('contacts.html')

if __name__ == '__main__':
    app.run(debug=True)

# http://127.0.0.1:5000/
