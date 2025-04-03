from flask import Flask, render_template, request, jsonify
import sqlite3
import os

app = Flask(__name__)

# Визначення абсолютного шляху до бази даних
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, 'rockets.db')

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

# Перевірка та ініціалізація бази даних під час запуску
def init_db():
    if not os.path.exists(DATABASE_PATH):
        try:
            conn = sqlite3.connect(DATABASE_PATH)
            c = conn.cursor()
            
            # Створення таблиці ракет
            c.execute('''
                CREATE TABLE IF NOT EXISTS rockets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    speed REAL NOT NULL,
                    explosion_power REAL NOT NULL,
                    range REAL NOT NULL
                )
            ''')
            
            # Додавання тестових ракет
            rockets = [
                ('Точка-У', 1000, 300, 120000),
                ('Іскандер', 2100, 500, 500000),
                ('Калібр', 2500, 700, 1500000)
            ]
            
            c.executemany('INSERT OR IGNORE INTO rockets (name, speed, explosion_power, range) VALUES (?, ?, ?, ?)', rockets)
            conn.commit()
            conn.close()
            print("База даних успішно ініціалізована!")
        except sqlite3.Error as e:
            print(f"Помилка при ініціалізації бази даних: {e}")

# Отримання списку ракет
@app.route('/get_rockets')
def get_rockets():
    rockets = query_db('SELECT id, name FROM rockets')
    return jsonify(rockets)

# Отримання характеристик конкретної ракети
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

    red_radius = explosion_power * 0.2
    yellow_radius = explosion_power * 0.5
    green_radius = explosion_power * 0.9

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

# Ініціалізація бази даних при запуску додатка
init_db()

if __name__ == '__main__':
    app.run(debug=True)

# http://127.0.0.1:5000/
