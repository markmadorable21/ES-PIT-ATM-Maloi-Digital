from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, get_connection

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this later if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB
init_db()

# ---------- Simulated card state ----------
inserted_card = None  # None = no card inserted

# ---------- Root ----------
@app.get("/")
def root():
    return {"message": "Mini ATM backend is running"}

# ---------- RFID latest ----------
@app.get("/rfid/latest")
def rfid_latest():
    return {"rfid_tag": inserted_card}

# ---------- Simulate card insert/remove ----------
@app.post("/rfid/insert/{tag_id}")
def insert_card(tag_id: str):
    global inserted_card
    inserted_card = tag_id
    print(f"💳 Card detected: {tag_id}")
    return {"status": "card inserted", "rfid_tag": tag_id}

@app.post("/rfid/remove")
def remove_card():
    global inserted_card
    print("❌ Card removed.")
    inserted_card = None
    return {"status": "card removed"}

# ---------- Authenticate RFID ----------
@app.get("/rfid/{tag_id}")
@app.post("/rfid/{tag_id}")
def rfid_tap(tag_id: str):
    """
    Authenticate RFID card.
    Only cards in the database are accepted.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, balance FROM users WHERE rfid_tag = ?", (tag_id,))
    user = cursor.fetchone()
    conn.close()

    if user:
        user_id, name, balance = user
        print(f"✅ RFID recognized: {tag_id} ({name})")
        return {
            "status": "success",
            "rfid_tag": tag_id,
            "name": name,
            "balance": balance
        }
    else:
        print(f"🚫 Unknown RFID: {tag_id}")
        raise HTTPException(status_code=404, detail="RFID not recognized. Access denied.")

# ---------- PIN verification ----------
@app.post("/verify-pin/{tag_id}/{pin}")
def verify_pin(tag_id: str, pin: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT pin FROM users WHERE rfid_tag = ?", (tag_id,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        print(f"🚫 RFID not recognized for PIN check: {tag_id}")
        raise HTTPException(status_code=404, detail="RFID not recognized")

    stored_pin = user[0]
    if stored_pin == pin:
        print(f"🔐 PIN verified for {tag_id}")
        return {"status": "success", "message": "PIN verified"}
    else:
        print(f"❌ Invalid PIN for {tag_id}")
        raise HTTPException(status_code=401, detail="Invalid PIN")

# ---------- Withdraw ----------
@app.post("/withdraw/{tag_id}/{amount}")
def withdraw(tag_id: str, amount: float):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, balance FROM users WHERE rfid_tag = ?", (tag_id,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    user_id, balance = user
    if balance < amount:
        conn.close()
        raise HTTPException(status_code=400, detail="Insufficient balance")

    new_balance = balance - amount
    cursor.execute("UPDATE users SET balance = ? WHERE id = ?", (new_balance, user_id))
    cursor.execute(
        "INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)",
        (user_id, "withdraw", amount)
    )

    conn.commit()
    conn.close()

    print(f"💸 Withdrawn {amount} from {tag_id}. New balance: {new_balance}")
    return {"rfid_tag": tag_id, "new_balance": new_balance, "status": "Withdrawal successful"}

# ---------- Deposit ----------
@app.post("/deposit/{tag_id}/{amount}")
def deposit(tag_id: str, amount: float):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, balance FROM users WHERE rfid_tag = ?", (tag_id,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    user_id, balance = user
    new_balance = balance + amount

    cursor.execute("UPDATE users SET balance = ? WHERE id = ?", (new_balance, user_id))
    cursor.execute(
        "INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)",
        (user_id, "deposit", amount)
    )

    conn.commit()
    conn.close()

    print(f"💰 Deposited {amount} to {tag_id}. New balance: {new_balance}")
    return {"rfid_tag": tag_id, "new_balance": new_balance, "status": "Deposit successful"}

# ---------- Optional: View all users (for debugging only) ----------
@app.get("/users")
def get_users():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, rfid_tag, balance, pin FROM users")
    users = cursor.fetchall()
    conn.close()
    return {"users": users}

# ---------- Thermal Printer Endpoint ----------
@app.post("/print/receipt")
def print_receipt(data: dict):
    """
    Print receipt via T58W or other thermal printer connected to Raspberry Pi.
    Example data: {"name": "John", "rfid_tag": "12345", "balance": 500.0}
    """
    try:
        # Open serial connection to printer
        printer = serial.Serial("/dev/ttyUSB0", baudrate=9600, timeout=1)

        message = f"""
        ------------------------------
              ATM BALANCE RECEIPT
        ------------------------------
        Name: {data.get("name", "Unknown")}
        Account: {data.get("rfid_tag", "N/A")}
        Current Balance: ?{float(data.get("balance", 0)):.2f}
        ------------------------------
        Thank you for banking with us!
        Please get your card.
        ------------------------------

        """

        # Print message
        printer.write(message.encode("utf-8"))
        printer.write(b"\n\n\n")  # Feed paper
        printer.close()

        print("??? Receipt printed successfully.")
        return {"status": "success", "message": "Receipt printed"}

    except Exception as e:
        print(f"?? Printer error: {e}")
        raise HTTPException(status_code=500, detail=f"Printer error: {str(e)}")