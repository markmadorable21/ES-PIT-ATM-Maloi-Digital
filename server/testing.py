import RPi.GPIO as GPIO
import time
import random
import spidev

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

spi = spidev.SpiDev()
spi.open(0, 0)        # Bus 0, CE0
spi.max_speed_hz = 1350000

POT_CH  = 0   # single potentiometer used by Lab5 & Lab6
HALL_CH = 2   # hall sensor channel
VREF    = 3.3


def read_channel(channel):
    if not (0 <= channel <= 7):
        raise ValueError("Channel must be 0-7")
    adc = spi.xfer2([1, (8+channel)<<4, 0])
    data = ((adc[1] & 3) << 8) | adc[2]
    return data

def read_pot():
    """Return (raw, voltage) from the shared potentiometer on CH0."""
    raw = read_channel(POT_CH)
    voltage = (raw * VREF) / 1023.0
    return raw, voltage

def pot_to_temp_c(voltage):
    """
    Map POT voltage to a 'virtual temperature' for Lab5.
    0.00V -> 10°C, 3.30V -> 40°C (linear). Adjust if you prefer.
    """
    return 10.0 + (voltage / VREF) * (40.0 - 10.0)  # 10–40 °C


DATA2  = 16
CLOCK2 = 21
LATCH2 = 20
GPIO.setup([DATA2, CLOCK2, LATCH2], GPIO.OUT)

DATA3  = 17
CLOCK3 = 22
LATCH3 = 27
GPIO.setup([DATA3, CLOCK3, LATCH3], GPIO.OUT)


LCD_RS = 2
LCD_E  = 3
LCD_D4 = 4
LCD_D5 = 14
LCD_D6 = 15
LCD_D7 = 18
GPIO.setup([LCD_RS, LCD_E, LCD_D4, LCD_D5, LCD_D6, LCD_D7], GPIO.OUT)

button_up = 23
button_down = 12
GPIO.setup(button_up, GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.setup(button_down, GPIO.IN, pull_up_down=GPIO.PUD_UP)

def shift_out_74hc595(data_pin, clock_pin, latch_pin, value):
    GPIO.output(latch_pin, GPIO.LOW)
    for i in range(8):
        bit = (value >> (7 - i)) & 1
        GPIO.output(data_pin, bit)
        GPIO.output(clock_pin, GPIO.HIGH)
        GPIO.output(clock_pin, GPIO.LOW)
    GPIO.output(latch_pin, GPIO.HIGH)
    time.sleep(0.001)
    GPIO.output(latch_pin, GPIO.LOW)

def all_off_74hc595(data_pin, clock_pin, latch_pin):
    shift_out_74hc595(data_pin, clock_pin, latch_pin, 0)

def lab2_pattern1(delay=0.5):
    seq_forward = [1 << i for i in range(8)]
    seq_reverse = [1 << (7 - i) for i in range(8)]
    for v in seq_forward + seq_reverse:
        shift_out_74hc595(DATA2, CLOCK2, LATCH2, v)
        time.sleep(delay)
    all_off_74hc595(DATA2, CLOCK2, LATCH2)

def lab2_pattern2(delay=0.5):
    for v in (0b01010101, 0b10101010):
        shift_out_74hc595(DATA2, CLOCK2, LATCH2, v)
        time.sleep(delay)
    all_off_74hc595(DATA2, CLOCK2, LATCH2)

def lab2_pattern3(delay=0.5):
    seq = [0b10000001, 0b01000010, 0b00100100, 0b00011000]
    for v in seq:
        shift_out_74hc595(DATA2, CLOCK2, LATCH2, v)
        time.sleep(delay)
    all_off_74hc595(DATA2, CLOCK2, LATCH2)

def run_lab2():
    print("Running Lab2 (LED patterns)... Press Ctrl+C to stop.")
    while True:
        lab2_pattern1(0.2)
        lab2_pattern2(0.3)
        lab2_pattern3(0.4)


COMMON_CATHODE = False
seg_pins = {'a': 5, 'b': 6, 'c': 13, 'd': 19, 'e': 26, 'f': 25, 'g': 24}
for pin in seg_pins.values():
    GPIO.setup(pin, GPIO.OUT)
    GPIO.output(pin, 0 if COMMON_CATHODE else 1)

led_map = {"A_R":0,"A_Y":1,"A_G":2,"B_R":3,"B_Y":4,"B_G":5}
digits = {
    0:['a','b','c','d','e','f'], 1:['b','c'], 2:['a','b','d','e','g'], 3:['a','b','c','d','g'],
    4:['f','g','b','c'], 5:['a','f','g','c','d'], 6:['a','f','e','d','c','g'], 7:['a','b','c'],
    8:['a','b','c','d','e','f','g'], 9:['a','b','c','d','f','g']
}

def show_digit(n):
    on_segments = digits.get(n, [])
    for seg, pin in seg_pins.items():
        GPIO.output(pin, 1 if (seg in on_segments and COMMON_CATHODE) or (seg not in on_segments and not COMMON_CATHODE) else 0)

def clear_segments():
    for pin in seg_pins.values():
        GPIO.output(pin, 0 if COMMON_CATHODE else 1)

def shift_out_lab3(value):
    for i in range(7,-1,-1):
        GPIO.output(CLOCK3,0)
        GPIO.output(DATA3,(value>>i)&1)
        GPIO.output(CLOCK3,1)
    GPIO.output(LATCH3,1)
    GPIO.output(LATCH3,0)

def set_lights(a_r=0,a_y=0,a_g=0,b_r=0,b_y=0,b_g=0):
    value=0
    value|=(a_r<<led_map["A_R"])
    value|=(a_y<<led_map["A_Y"])
    value|=(a_g<<led_map["A_G"])
    value|=(b_r<<led_map["B_R"])
    value|=(b_y<<led_map["B_Y"])
    value|=(b_g<<led_map["B_G"])
    shift_out_lab3(value)

def countdown(seconds):
    for t in range(seconds,0,-1):
        show_digit(t if t<10 else 9)
        time.sleep(1)
    clear_segments()

def run_lab3():
    print("Running Lab3 (Traffic lights)... Press Ctrl+C to stop.")
    while True:
        set_lights(a_g=1,b_r=1); countdown(7)
        set_lights(a_y=1,b_r=1); countdown(2)
        set_lights(a_r=1,b_r=1); countdown(2)
        set_lights(a_r=1,b_g=1); countdown(7)
        set_lights(a_r=1,b_y=1); countdown(2)
        set_lights(a_r=1,b_r=1); countdown(2)


LCD_WIDTH = 16
LCD_CHR = True
LCD_CMD = False
LCD_LINE_1 = 0x80
LCD_LINE_2 = 0xC0
E_PULSE = 0.0005
E_DELAY = 0.0005
PLAYER_CHAR = ">"
BLOCK_CHAR = "#"

def lcd_init():
    for cmd in [0x33,0x32,0x28,0x0C,0x06,0x01]:
        lcd_byte(cmd, LCD_CMD)
        time.sleep(E_DELAY)

def lcd_byte(bits, mode):
    GPIO.output(LCD_RS, mode)
    # High bits
    GPIO.output(LCD_D4, bool(bits & 0x10))
    GPIO.output(LCD_D5, bool(bits & 0x20))
    GPIO.output(LCD_D6, bool(bits & 0x40))
    GPIO.output(LCD_D7, bool(bits & 0x80))
    lcd_toggle_enable()
    # Low bits
    GPIO.output(LCD_D4, bool(bits & 0x01))
    GPIO.output(LCD_D5, bool(bits & 0x02))
    GPIO.output(LCD_D6, bool(bits & 0x04))
    GPIO.output(LCD_D7, bool(bits & 0x08))
    lcd_toggle_enable()

def lcd_toggle_enable():
    time.sleep(E_DELAY)
    GPIO.output(LCD_E, True)
    time.sleep(E_PULSE)
    GPIO.output(LCD_E, False)
    time.sleep(E_DELAY)

def lcd_string(message, line):
    message = message.ljust(LCD_WIDTH)
    lcd_byte(line, LCD_CMD)
    for ch in message:
        lcd_byte(ord(ch), LCD_CHR)

def lcd_clear():
    lcd_byte(0x01, LCD_CMD)
    time.sleep(E_DELAY)

def lcd_put_char(row, col, char):
    addr = col + (0x80 if row==0 else 0xC0)
    lcd_byte(addr, LCD_CMD)
    lcd_byte(ord(char), LCD_CHR)

def play_game():
    player_row = 1
    block_col = 15
    block_row = random.randint(0,1)
    score = 0
    speed_ms = 220
    prev_player_pos = None
    prev_block_pos = None

    while True:
        # Buttons
        if GPIO.input(button_up)==0: player_row=0
        elif GPIO.input(button_down)==0: player_row=1

        # Erase previous
        if prev_player_pos: lcd_put_char(prev_player_pos[0], prev_player_pos[1], " ")
        if prev_block_pos: lcd_put_char(prev_block_pos[0], prev_block_pos[1], " ")

        # Draw player & block
        lcd_put_char(player_row, 0, PLAYER_CHAR)
        prev_player_pos = (player_row, 0)
        lcd_put_char(block_row, block_col, BLOCK_CHAR)
        prev_block_pos = (block_row, block_col)

        # Collision
        if block_col==0 and player_row==block_row:
            lcd_clear()
            lcd_string(" GAME OVER!", LCD_LINE_1)
            lcd_string(f"Score: {score}", LCD_LINE_2)
            time.sleep(5)
            return

        # Move block
        block_col -= 1
        if block_col < 0:
            block_col=15
            block_row=random.randint(0,1)
            score +=1
            if speed_ms>20: speed_ms-=20

        time.sleep(speed_ms/1000)

def run_lab4():
    lcd_init()
    try:
        first_time = True
        while True:
            if first_time:
                lcd_clear()
                lcd_string(" Dodge the Blocks!", LCD_LINE_1)
                lcd_string("Press a button", LCD_LINE_2)
                while GPIO.input(button_up)==1 and GPIO.input(button_down)==1: pass
                time.sleep(0.25)
                lcd_clear()
                first_time=False

            play_game()

            lcd_clear()
            lcd_string("Press any button", LCD_LINE_1)
            lcd_string("to try again", LCD_LINE_2)
            while GPIO.input(button_up)==1 and GPIO.input(button_down)==1: pass
            time.sleep(0.25)
            lcd_clear()
    except KeyboardInterrupt:
        lcd_clear()
        lcd_string("Game stopped", LCD_LINE_1)
        time.sleep(1)

# =========================================================
# Lab5 Temperature LEDs (reuse Lab2’s 74HC595 LEDs)
# =========================================================

def lab5_show_temp(temp_c, t_cool=20.0, t_hot=30.0):
    """
    Cumulative LED bar on 74HC595 (DATA2/CLOCK2/LATCH2):
      COOL  (< t_cool)      -> Q0
      WARM  [t_cool..t_hot) -> Q0 + Q1
      HOT   (>= t_hot)      -> Q0 + Q1 + Q2
    Returns status string for LCD.
    """
    if temp_c < t_cool:
        mask = 0b00000001; status = "COOL"
    elif temp_c < t_hot:
        mask = 0b00000011; status = "WARM"
    else:
        mask = 0b00000111; status = "HOT"

    shift_out_74hc595(DATA2, CLOCK2, LATCH2, mask)
    return status  # ← critical so LCD won't show "None"

def run_lab5():
    print("Running Lab5 (Temp LEDs + LCD)… Press Ctrl+C to stop.")
    lcd_init()
    lcd_clear()
    lcd_string("Lab5: Temp Monitor", LCD_LINE_1)
    time.sleep(0.6)

    try:
        last_line1 = last_line2 = None
        while True:
            # Read shared POT on CH0
            pot_value, voltage = read_pot()   # pot_value: 0–1023, voltage: 0.00–3.30 V

            # TEMPERATURE SOURCE:
            # If an LM35 is wired to CH0, use its transfer (10 mV/°C):
            temp_c = voltage * 100.0
            # If you're NOT using an LM35 and only have a pot, use your virtual map instead:
            # temp_c = pot_to_temp_c(voltage)

            # Update LED bar and get status text
            status = lab5_show_temp(temp_c) or "—"   # COOL/WARM/HOT

            # ---- LCD OUTPUT ----
            # Line 1: Voltage + POT raw
            line1 = f"V:{voltage:1.2f} P:{pot_value:4d}"
            # Line 2: Temperature + Status
            line2 = f"T:{temp_c:4.1f}C {status}"

            # Keep within 16 chars and reduce flicker
            line1 = line1.ljust(16)[:16]
            line2 = line2.ljust(16)[:16]

            if line1 != last_line1:
                lcd_string(line1, LCD_LINE_1)
                last_line1 = line1
            if line2 != last_line2:
                lcd_string(line2, LCD_LINE_2)
                last_line2 = line2

            time.sleep(0.5)

    except KeyboardInterrupt:
        print("\nLab5 stopped.")
    finally:
        all_off_74hc595(DATA2, CLOCK2, LATCH2)
        lcd_clear()



def run_lab6():
    print("Running Lab6 (Pot + Hall on LCD)… Press Ctrl+C to stop.")
    lcd_init()
    lcd_clear()
    lcd_string("Lab6: ADC Monitor", LCD_LINE_1)
    time.sleep(0.6)

    try:
        last_line1 = last_line2 = None
        while True:
            pot_value, voltage = read_pot()              # shared POT on CH0
            hall_value = read_channel(HALL_CH)           # hall on CH2

            print(f"Pot:{pot_value:4d}  V:{voltage:1.2f}V  Hall:{hall_value:4d}")

            line1 = f"V:{voltage:1.2f} P:{pot_value:4d}"
            line2 = f"Hall:{hall_value:4d}".ljust(16)

            if line1 != last_line1:
                lcd_string(line1.ljust(16)[:16], LCD_LINE_1); last_line1 = line1
            if line2 != last_line2:
                lcd_string(line2[:16], LCD_LINE_2); last_line2 = line2

            time.sleep(0.5)

    except KeyboardInterrupt:
        pass
    finally:
        lcd_clear()


def initialize_all_off():
    """Turn OFF all LEDs, 7-segment, and LCD."""
    try:
        # --- 74HC595 LEDs (both chips) ---
        all_off_74hc595(DATA2, CLOCK2, LATCH2)
        all_off_74hc595(DATA3, CLOCK3, LATCH3)

        # --- 7-segment display ---
        clear_segments()

        # --- LCD (clear any leftover text) ---
        lcd_init()
        lcd_clear()

        print("✅ All LEDs, 7-segment, and LCD cleared.")
    except Exception as e:
        print(f"⚠️ Initialization warning: {e}")


if __name__=="__main__":
    try:
        choice=input("Enter 2,3,4,5,6 for Lab2–6: ").strip()

        initialize_all_off()
        
        if choice=="2":
            run_lab2()
        elif choice=="3":
            run_lab3()
        elif choice=="4":
            run_lab4()
        elif choice=="5":
            run_lab5()
        elif choice=="6":
            run_lab6()
        else:
            print("Invalid choice.")
    except KeyboardInterrupt:
        print("\nExiting...")
    finally:
        try:
            if hasattr(spi, "close"):
                spi.close()   # only if you ran Lab6
        except Exception:
            pass
        GPIO.cleanup()


