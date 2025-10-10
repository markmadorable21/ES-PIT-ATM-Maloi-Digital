from fastapi import FastAPI
from database import init_db, get_connection

# Initialize FastAPI app
app = FastAPI()

# Initialize DB tables
init_db()

@app.get("/")
def root():
    return {"message": "Mini ATM backend is running"}

# ---------------------------
# RFID endpoint (POST + GET)
# ---------------------------
@app.post("/rfid/{tag_id}")
@app.get("/rfid/{tag_id}")
def rfid_tap(tag_id: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, balance FROM users WHERE rfid_tag = ?", (tag_id,))
    user = cursor.fetchone()

    if user:
        user_id, balance = user
        conn.close()
        return {"rfid_tag": tag_id, "balance": balance}
    else:
        cursor.execute("INSERT INTO users (rfid_tag, balance) VALUES (?, ?)", (tag_id, 100))
        conn.commit()
        conn.close()
        return {"rfid_tag": tag_id, "balance": 100, "note": "New user created with default balance"}

# ---------------------------
# Withdraw endpoint (POST)
# ---------------------------
@app.post("/withdraw/{tag_id}/{amount}")
def withdraw(tag_id: str, amount: float):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, balance FROM users WHERE rfid_tag = ?", (tag_id,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return {"error": "User not found"}

    user_id, balance = user

    if balance < amount:
        conn.close()
        return {"error": "Insufficient balance"}

    new_balance = balance - amount
    cursor.execute("UPDATE users SET balance = ? WHERE id = ?", (new_balance, user_id))
    cursor.execute("INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)",
                   (user_id, "withdraw", amount))

    conn.commit()
    conn.close()

    return {"rfid_tag": tag_id, "new_balance": new_balance, "status": "Withdrawal successful"}

# ---------------------------
# Deposit endpoint (POST)
# ---------------------------
@app.post("/deposit/{tag_id}/{amount}")
def deposit(tag_id: str, amount: float):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, balance FROM users WHERE rfid_tag = ?", (tag_id,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return {"error": "User not found"}

    user_id, balance = user

    new_balance = balance + amount
    cursor.execute("UPDATE users SET balance = ? WHERE id = ?", (new_balance, user_id))
    cursor.execute("INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)",
                   (user_id, "deposit", amount))

    conn.commit()
    conn.close()

    return {"rfid_tag": tag_id, "new_balance": new_balance, "status": "Deposit successful"}
