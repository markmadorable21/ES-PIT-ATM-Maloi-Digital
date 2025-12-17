from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, get_connection
from printer_utils import print_balance_receipt
from keypad_driver import Keypad  # Ensure keypad_driver.py is in the same folder
import threading
import asyncio

app = FastAPI()

# -------------------- CORS CONFIG --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- INITIALIZE DB --------------------
init_db()

# -------------------- GLOBAL STATE --------------------
inserted_card = None  # None = no card inserted

class KeypadManager:
    def __init__(self):
        self.kp = Keypad()
        self.active_connections: list[WebSocket] = []
        self.running = False
        self.loop = None  # Will hold the main event loop

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print("Client connected to Keypad WebSocket")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print("Client disconnected from Keypad WebSocket")

    async def broadcast_key(self, key: str):
        # Send the key to all connected frontends
        # We iterate over a copy to avoid modification issues during iteration
        for connection in self.active_connections[:]:
            try:
                await connection.send_text(key)
            except Exception as e:
                print(f"Error sending to socket: {e}")
                self.disconnect(connection)

    def start_scanning(self, loop):
        """Runs in a background thread to continuously check hardware"""
        self.running = True
        print("--- Keypad Scanning Started ---")
        while self.running:
            # This blocks until a key is pressed or returns None
            key = self.kp.read_key()
            if key:
                print(f"Physical Key Pressed: {key}")
                # Schedule the async broadcast on the main event loop
                if loop and loop.is_running():
                    asyncio.run_coroutine_threadsafe(self.broadcast_key(key), loop)
            # Small sleep is handled inside read_key usually, but adding one here is safe
            # time.sleep(0.01) 

keypad_manager = KeypadManager()

@app.on_event("startup")
def startup_event():
    # Get the main loop so the thread can talk back to it
    loop = asyncio.get_event_loop()
    keypad_manager.loop = loop
    
    # Start the keypad scanner in a separate thread
    threading.Thread(target=keypad_manager.start_scanning, args=(loop,), daemon=True).start()

@app.on_event("shutdown")
def shutdown_event():
    keypad_manager.running = False
    keypad_manager.kp.cleanup()
    
# -------------------- WEBSOCKET ENDPOINT --------------------
@app.websocket("/ws/keypad")
async def websocket_endpoint(websocket: WebSocket):
    await keypad_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except Exception:
        keypad_manager.disconnect(websocket)

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
    fee = 18.0  # ⬅️ Define the fee
    total_deduction = amount + fee  # ⬅️ Calculate total to deduct
    
    if balance < total_deduction:  # ⬅️ Check if balance covers amount + fee
        conn.close()
        raise HTTPException(status_code=400, detail="Insufficient balance (including fee)")

    new_balance = balance - total_deduction  # ⬅️ Subtract amount + fee
    cursor.execute("UPDATE users SET balance = ? WHERE id = ?", (new_balance, user_id))
    
    # Record both withdrawal and fee in transactions (optional but good for tracking)
    cursor.execute(
        "INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)",
        (user_id, "withdraw", amount)
    )
    cursor.execute(
        "INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)",
        (user_id, "fee", fee)  # ⬅️ Record fee separately
    )

    conn.commit()
    conn.close()

    print(f"💸 Withdrawn {amount} + fee {fee} from {tag_id}. New balance: {new_balance}")
    return {
        "rfid_tag": tag_id, 
        "new_balance": new_balance, 
        "status": "Withdrawal successful",
        "fee": fee,  # ⬅️ Return fee in response
        "amount_withdrawn": amount
    }

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

# -------------------- TRANSACTION HISTORY --------------------
@app.get("/transactions/{tag_id}")
def get_transactions(tag_id: str):
    """Fetch transaction history for a specific user."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Get the user_id from the RFID tag
    cursor.execute("SELECT id FROM users WHERE rfid_tag = ?", (tag_id,))
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user[0]

    # 2. Fetch the last 10 transactions for this user
    # We order by timestamp DESC so the newest ones show up first
    cursor.execute("""
        SELECT type, amount, timestamp 
        FROM transactions 
        WHERE user_id = ? 
        ORDER BY timestamp DESC 
        LIMIT 10
    """, (user_id,))
    
    rows = cursor.fetchall()
    conn.close()

    # 3. Format the data into a list of dictionaries (JSON)
    history = []
    for row in rows:
        history.append({
            "type": row[0],
            "amount": row[1],
            "timestamp": row[2]
        })
        
    print(f"?? Sending history for {tag_id}: {len(history)} records")
    return history

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


