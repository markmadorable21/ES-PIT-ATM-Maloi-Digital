import subprocess
import time
import os


# ?? Correct project directory for your Raspberry Pi
PROJECT_DIR = "/home/group2embeddedcpe4a/PIT/ES-PIT-ATM-Maloi-Digital/server"
VENV_PYTHON = os.path.join(PROJECT_DIR, "venv", "bin", "python")

def get_connection():
    db_path = os.path.join(os.path.dirname(__file__), "database.db")
    print(f"?? Using DB at: {db_path}")
    return sqlite3.connect(db_path)

# Step 1: Start FastAPI server
print("?? Starting FastAPI server...")
fastapi_process = subprocess.Popen([
    VENV_PYTHON, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"
], cwd=PROJECT_DIR)

# Wait a few seconds for the server to be ready
time.sleep(5)

# Step 2: Initialize database with sample cards
print("??? Initializing database with sample cards...")
subprocess.run([VENV_PYTHON, os.path.join(PROJECT_DIR, "add_card.py")], cwd=PROJECT_DIR)

# Step 3: Start RFID listener
print("?? Starting RFID listener...")
rfid_process = subprocess.Popen([VENV_PYTHON, os.path.join(PROJECT_DIR, "rfid_listener.py")], cwd=PROJECT_DIR)

print("? All systems running! (Press CTRL+C to stop everything)")

try:
    fastapi_process.wait()
    rfid_process.wait()
except KeyboardInterrupt:
    print("\n?? Shutting down...")
    fastapi_process.terminate()
    rfid_process.terminate()
