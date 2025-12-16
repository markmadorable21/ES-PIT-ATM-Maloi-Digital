import RPi.GPIO as GPIO
import time

class Keypad:
    def __init__(self):
        # --- Pin Configuration (BCM Numbering) ---
        # R1, R2, R3, R4
        self.ROW_PINS = [5, 6, 13, 19]
        # C1, C2, C3, C4
        self.COL_PINS = [12, 16, 20, 21]

        # --- Keypad Map ---
        self.KEY_MAP = [
            ['1', '2', '3', 'A'],
            ['4', '5', '6', 'B'],
            ['7', '8', '9', 'C'],
            ['*', '0', '#', 'D']
        ]

        # Initialize GPIO
        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)

        # Set Rows as Outputs
        for pin in self.ROW_PINS:
            GPIO.setup(pin, GPIO.OUT)
            GPIO.output(pin, GPIO.LOW)  # Initialize Low

        # Set Columns as Inputs with Pull-Down resistors
        # (Default is Low, reads High when connected to an active Row)
        for pin in self.COL_PINS:
            GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

    def read_key(self):
        """
        Scans the keypad and returns the single character pressed.
        Returns None if no key is pressed.
        """
        key_pressed = None

        # Scan each row
        for row_num, row_pin in enumerate(self.ROW_PINS):
            # Set current row High
            GPIO.output(row_pin, GPIO.HIGH)

            # Check columns for a connection
            for col_num, col_pin in enumerate(self.COL_PINS):
                if GPIO.input(col_pin) == GPIO.HIGH:
                    # Key detected
                    key_pressed = self.KEY_MAP[row_num][col_num]
                    
                    # Basic Debounce: Wait for key release
                    while GPIO.input(col_pin) == GPIO.HIGH:
                        time.sleep(0.01)
                    
                    # Return immediately after finding the key
                    GPIO.output(row_pin, GPIO.LOW)
                    return key_pressed

            # Set row back to Low before moving to next row
            GPIO.output(row_pin, GPIO.LOW)

        return None

    def cleanup(self):
        """Resets GPIO settings."""
        GPIO.cleanup()

# --- FOR TESTING PURPOSES ONLY ---
# You can run this file directly (python keypad_driver.py) to test the hardware.
if __name__ == "__main__":
    print("--- 4x4 Keypad Test ---")
    print("Press any key (Press Ctrl+C to exit)...")
    
    kp = Keypad()
    
    try:
        while True:
            key = kp.read_key()
            if key:
                print(f"Detected Key: {key}")
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("\nExiting...")
    finally:
        kp.cleanup()