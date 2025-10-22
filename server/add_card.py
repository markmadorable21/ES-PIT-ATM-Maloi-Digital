import sqlite3

conn = sqlite3.connect("database.db")
cursor = conn.cursor()

# Add example users with PINs
cards = [
    ("Jomar", "49375347824", 500.0, "1234"),
    ("User2", "983933453559", 300.0, "5678")
]

for name, tag, balance, pin in cards:
    cursor.execute(
        "INSERT OR IGNORE INTO users (name, rfid_tag, balance, pin) VALUES (?, ?, ?, ?)",
        (name, tag, balance, pin)
    )

conn.commit()
conn.close()

print("? RFID cards with PINs added successfully!")
