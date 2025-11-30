# printer_utils.py
import serial
import time
from datetime import datetime

# ==============================
#   Maloi Bank Thermal Printer
# ==============================

# Configure the thermal printer
printer = None
try:
    printer = serial.Serial("/dev/ttyUSB0", baudrate=9600, timeout=1)
    print("? Thermal printer connected on /dev/ttyUSB0")
except Exception as e:
    print(f"?? Printer not connected: {e}")

def safe_write(text):
    """Safely write text to printer."""
    try:
        if printer and printer.is_open:
            printer.write(text.encode('utf-8') + b'\n')
            time.sleep(0.05)
        else:
            print("?? Printer not available for writing.")
    except Exception as e:
        print(f"?? Error writing to printer: {e}")

def print_center(text):
    """Print centered text."""
    safe_write(text.center(32))

def print_left_right(left, right, width=32):
    """Print text aligned left and right."""
    space = width - len(left) - len(right)
    if space < 0:
        space = 0
    line = left + (" " * space) + right
    safe_write(line)

def print_balance_receipt(name, balance):
    """?? Print Balance Inquiry Receipt for Maloi Bank."""
    global printer

    # Reconnect printer if it was closed or lost
    if not printer or not printer.is_open:
        try:
            printer = serial.Serial("/dev/ttyUSB0", baudrate=9600, timeout=1)
            print("?? Reconnected to thermal printer.")
        except Exception as e:
            print(f"? Printer unavailable: {e}")
            return

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # ===== Receipt Layout =====
    print_center("================================")
    print_center("        MALOI BANK ATM")
    print_center("================================")
    print_center("      OFFICIAL TRANSACTION SLIP")
    safe_write("--------------------------------")
    print_left_right("DATE:", now)
    safe_write("--------------------------------")
    print_left_right("TRANSACTION:", "BALANCE INQUIRY")
    print_left_right("CUSTOMER:", name)
    print_left_right("BALANCE:", f"{balance:,.2f}")
    safe_write("--------------------------------")
    print_center("Thank you for banking with us!")
    print_center("        Visit again soon.")
    print_center("================================")
    safe_write("\n\n\n")

    try:

        print(f"? Receipt printed successfully for: {name}")
    except Exception as e:
        print(f"?? Could not close printer properly: {e}")
