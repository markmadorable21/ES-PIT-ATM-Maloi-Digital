import subprocess
import time
import os

# Activate virtual environment
VENV_PYTHON = os.path.join("venv", "bin", "python")  # for Linux (Raspberry Pi)
# For Windows, use: VENV_PYTHON = os.path.join("venv", "Scripts", "python.exe")

# Step 1: Start FastAPI server
print("?? Starting FastAPI server...")
fastapi_process = subprocess.Popen([
    VENV_PYTHON, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"
])

# Wait a few seconds for the server to be ready
time.sleep(5)

# Step 2: Add cards (only if needed)
print("?? Initializing database with sample cards...")
subprocess.run([VENV_PYTHON, "add_card.py"])

# Step 3: Start RFID listener
print("?? Starting RFID listener...")
rfid_process = subprocess.Popen([VENV_PYTHON, "rfid_listener.py"])

print("? All systems running! (Press CTRL+C to stop everything)")

try:
    fastapi_process.wait()
    rfid_process.wait()
except KeyboardInterrupt:
    print("\n?? Shutting down...")
    fastapi_process.terminate()
    rfid_process.terminate()
