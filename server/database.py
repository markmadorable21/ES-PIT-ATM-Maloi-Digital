import sqlite3

DB_NAME = "database.db"

def get_connection():
    """Create a new database connection"""
    return sqlite3.connect(DB_NAME)

def init_db():
    """Initialize database and create tables if not exist"""
    conn = get_connection()
    cursor = conn.cursor()

    # Users table: RFID + balance
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rfid_tag TEXT UNIQUE,
        balance REAL DEFAULT 0
    )
    """)

    # Transactions table: for deposits/withdrawals
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT, -- deposit / withdraw
        amount REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    """)

    conn.commit()
    conn.close()
