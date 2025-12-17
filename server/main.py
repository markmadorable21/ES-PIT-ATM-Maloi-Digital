from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, get_connection
from printer_utils import print_balance_receipt


app = FastAPI()

# -------------------- CORS CONFIG --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local testing; restrict later for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- INITIALIZE DB --------------------
init_db()

# -------------------- GLOBAL STATE --------------------
inserted_card = None  # None = no card inserted


# -------------------- ROOT --------------------
@app.get("/")
def root():
    return {"message": "Mini ATM backend is running"}


# -------------------- RFID LATEST --------------------
@app.get("/rfid/latest")
def rfid_latest():
    """Return the last inserted RFID card (if any)."""
    return {"rfid_tag": inserted_card}


# -------------------- SIMULATE CARD INSERT/REMOVE --------------------
@app.post("/rfid/insert/{tag_id}")
def insert_card(tag_id: str):
    """Simulate RFID card insertion."""
    global inserted_card
    inserted_card = tag_id
    print(f"💳 Card detected: {tag_id}")
    return {"status": "card inserted", "rfid_tag": tag_id}


@app.post("/rfid/remove")
def remove_card():
    """Simulate RFID card removal."""
    global inserted_card
    print("❌ Card removed.")
    inserted_card = None
    return {"status": "card removed"}


# -------------------- RFID AUTHENTICATION --------------------
@app.get("/rfid/{tag_id}")
@app.post("/rfid/{tag_id}")
def rfid_tap(tag_id: str):
    """Authenticate RFID card (check if it exists in the database)."""
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


# -------------------- PIN VERIFICATION --------------------
@app.post("/verify-pin/{tag_id}/{pin}")
def verify_pin(tag_id: str, pin: str):
    """Verify PIN associated with the RFID tag."""
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


# -------------------- WITHDRAW --------------------
@app.post("/withdraw/{tag_id}/{amount}")
def withdraw(tag_id: str, amount: float):
    """Withdraw funds from user's balance."""
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

    new_balance = balance - amount - 18.0
    cursor.execute("UPDATE users SET balance = ? WHERE id = ?", (new_balance, user_id))
    cursor.execute(
        "INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)",
        (user_id, "withdraw", amount)
    )

    conn.commit()
    conn.close()

    print(f"💸 Withdrawn {amount} from {tag_id}. New balance: {new_balance}")
    return {"rfid_tag": tag_id, "new_balance": new_balance, "status": "Withdrawal successful"}


# -------------------- DEPOSIT --------------------
@app.post("/deposit/{tag_id}/{amount}")
def deposit(tag_id: str, amount: float):
    """Deposit funds to user's balance."""
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


# -------------------- BALANCE CHECK --------------------
@app.get("/balance/{tag_id}")
def get_balance(tag_id: str):
    """Return balance for a given RFID tag."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT balance FROM users WHERE rfid_tag = ?", (tag_id,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    balance = user[0]
    print(f"📊 Balance check for {tag_id}: {balance}")
    return {"rfid_tag": tag_id, "balance": balance}


# -------------------- DEBUG: VIEW ALL USERS --------------------
@app.get("/users")
def get_users():
    """List all users (for debugging)."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, rfid_tag, balance, pin FROM users")
    users = cursor.fetchall()
    conn.close()
    return {"users": users}

@app.post("/print/receipt")
def print_receipt_endpoint(data: dict):
    """
    Print a Balance Inquiry receipt for a given RFID tag.
    """
    try:
        rfid_tag = data.get("rfid_tag")
        if not rfid_tag:
            raise HTTPException(status_code=400, detail="RFID tag is required")

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT name, balance FROM users WHERE rfid_tag = ?", (rfid_tag,))
        user = cursor.fetchone()
        conn.close()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        name, balance = user
        print(f"?? Printing balance receipt for {name} ({rfid_tag})")

        # --- Print the receipt ---
        print_balance_receipt(name, balance)

        print(f"? Receipt printed successfully for {name}")
        return {"status": "success", "message": f"Receipt printed successfully for {name}"}

    except Exception as e:
        # Log the error but do NOT throw a 500 if the print actually succeeded
        print(f"?? Printer warning: {e}")
        return {"status": "warning", "message": f"Printer warning: {str(e)}"}


