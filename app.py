from flask import Flask, render_template, request, jsonify
import sqlite3
import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import math

app = Flask(__name__)

# Визначення абсолютного шляху до бази даних
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, 'rockets.db')

# Підключення до MongoDB
uri = "mongodb+srv://hayevska:2hyrfNt7jQVd3hf@cluster0.qjtidh4.mongodb.net/?appName=Cluster0"
mongo_client = MongoClient(uri, server_api=ServerApi('1'))
mongo_db = mongo_client["Funiania_Ballistics"]
rockets_collection = mongo_db["Rockets"]

# Функція для отримання даних із БД
def query_db(query, args=(), one=False):
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        c = conn.cursor()
        c.execute(query, args)
        result = c.fetchall()
        conn.close()
        return (result[0] if result else None) if one else result
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return None if one else []

# Отримання списку ракет з MongoDB
@app.route('/get_mongo_rockets')
def get_mongo_rockets():
    try:
        rockets = list(rockets_collection.find({}, {"Назва": 1, "Швидкість": 1, "Вибухова_сила": 1, "Дальність": 1}))
        # Перетворюємо ObjectId на рядок для серіалізації JSON
        for rocket in rockets:
            rocket["_id"] = str(rocket["_id"])
        return jsonify(rockets)
    except Exception as e:
        print(f"Помилка при отриманні даних з MongoDB: {e}")
        return jsonify([])

# Отримання характеристик конкретної ракети з MongoDB за ID
@app.route('/get_mongo_rocket/<rocket_id>')
def get_mongo_rocket(rocket_id):
    try:
        from bson.objectid import ObjectId
        rocket = rockets_collection.find_one({"_id": ObjectId(rocket_id)})
        if rocket:
            rocket["_id"] = str(rocket["_id"])
            return jsonify(rocket)
        return jsonify({"error": "Ракету не знайдено"})
    except Exception as e:
        print(f"Помилка при отриманні даних з MongoDB: {e}")
        return jsonify({"error": str(e)})

# Отримання списку ракет зі SQLite
@app.route('/get_rockets')
def get_rockets():
    rockets = query_db('SELECT id, name FROM rockets')
    return jsonify(rockets)

# Отримання характеристик конкретної ракети зі SQLite
@app.route('/get_rocket/<int:rocket_id>')
def get_rocket(rocket_id):
    rocket = query_db('SELECT * FROM rockets WHERE id = ?', (rocket_id,), one=True)
    return jsonify(rocket)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate_safety', methods=['POST'])
def calculate_safety():
    data = request.json
    explosion_power = data['explosion_power']

    # Радіуси небезпеки (змінюється залежно від вибухової сили)
    red_radius = math.cbrt(explosion_power) * 15
    yellow_radius = math.cbrt(explosion_power) * 40
    green_radius = math.cbrt(explosion_power) * 100

    zones = [
        {"color": "red", "outer_radius": red_radius},
        {"color": "yellow", "outer_radius": yellow_radius},
        {"color": "green", "outer_radius": green_radius}
    ]

    return jsonify({"zones": zones})

@app.route('/api/rocket-info')
def get_rocket_info():
    rocket_name = request.args.get('name')
    
    # Шукаємо ракету за назвою в MongoDB колекції
    rocket = rockets_collection.find_one({"Назва": rocket_name})
    
    if rocket:
        return jsonify({
            'name': rocket.get('Назва', ''),
            'photo': rocket.get('Фото', ''),
            'type': rocket.get('Тип', ''),
            'origin': rocket.get('Походження', ''),
            'service': rocket.get('На озброєнні (з - до)', '').split(' - ')[0] if rocket.get('На озброєнні (з - до)') else '',
            'manufacturer': rocket.get('Виробник', '')
        })
    else:
        return jsonify({
            'name': rocket_name,
            'photo': '',
            'type': 'Немає даних',
            'origin': 'Немає даних',
            'service': 'Немає даних',
            'manufacturer': 'Немає даних'
        })

@app.route('/calculator')
def calculator():
    return render_template('calculator.html')

@app.route('/wiki')
def wiki():
    # Отримання всіх ракет з MongoDB колекції
    rockets = list(rockets_collection.find())
    return render_template('wiki.html', rockets=rockets)

@app.route('/instruction')
def instruction():
    return render_template('instruction.html')

@app.route('/contacts')
def contacts():
    return render_template('contacts.html')

if __name__ == '__main__':
    app.run(debug=True)

# http://127.0.0.1:5000/
