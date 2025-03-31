import sqlite3

conn = sqlite3.connect('rockets.db')
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

c.executemany('INSERT INTO rockets (name, speed, explosion_power, range) VALUES (?, ?, ?, ?)', rockets)

conn.commit()
conn.close()

print("База даних успішно ініціалізована!")
