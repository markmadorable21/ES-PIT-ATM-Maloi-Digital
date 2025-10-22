# printer_utils.py
import serial
import time
from datetime import datetime

# Configure the thermal printer
try:
    printer = serial.Serial("/dev/ttyUSB0", baudrate=9600, timeout=1)
except Exception as e:
    printer = None
    print(f"?? Printer not connected: {e}")

def safe_write(text):
    """Write text to printer safely"""
    if printer:
        printer.write(text.encode('utf-8') + b'\n')
        time.sleep(0.05)

def print_center(text):
    if printer:
        safe_write(text.center(32))

def print_left_right(left, right, width=32):
    if printer:
        space = width - len(left) - len(right)
        if space < 0: space = 0
        line = left + (" " * space) + right
        safe_write(line)

def print_receipt(transaction_type, name, amount, balance):
    """Print ATM receipt"""
    if not printer:
        print("?? Printer not available, skipping receipt.")
        return

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    print_center("?? MINI ATM RECEIPT ??")
    print_center("Raspberry Pi Branch")
    print_center("Tel: (02) 123-4567")
    safe_write("--------------------------------")
    print_left_right("DATE:", now)
    safe_write("--------------------------------")
    print_left_right("TRANSACTION:", transaction_type.upper())
    print_left_right("NAME:", name)
    print_left_right("AMOUNT:", f"?{amount:,.2f}")
    print_left_right("BALANCE:", f"?{balance:,.2f}")
    safe_write("--------------------------------")
    print_center("Thank you for using MINI ATM!")
    print_center("Visit again soon.")
    safe_write("\n\n\n")

    printer.close()
    print("? Receipt printed successfully!")
