from mfrc522 import SimpleMFRC522
import requests
import time
import RPi.GPIO as GPIO

# === Configuration ===
API_BASE = "http://127.0.0.1:8000"  # change to your Pi's IP if frontend runs remotely
READER_DELAY = 2  # seconds to wait before next read

reader = SimpleMFRC522()

try:
    while True:
        print("Place your card...")
        id, text = reader.read()
        print(f"Detected RFID: {id}")

        try:
            # Step 1: Notify backend that a card was inserted
            insert_res = requests.post(f"{API_BASE}/rfid/insert/{id}")
            print("Inserted:", insert_res.json())

            # Step 2: Get user info for this RFID
            response = requests.get(f"{API_BASE}/rfid/{id}")
            print("Response:", response.json())

            # Wait a few seconds before simulating card removal
            time.sleep(3)

            # Step 3: Notify backend that card was removed
            remove_res = requests.post(f"{API_BASE}/rfid/remove")
            print("Removed:", remove_res.json())

        except requests.exceptions.RequestException as e:
            print("Error connecting to server:", e)

        # small delay before next scan
        time.sleep(READER_DELAY)

finally:
    GPIO.cleanup()
