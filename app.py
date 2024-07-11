from flask import Flask, request, jsonify
import requests
from collections import deque
import time

app = Flask(__name__)

# Configuration
WINDOW_SIZE = 10

# State
windows = {
    'p': deque(maxlen=WINDOW_SIZE),
    'f': deque(maxlen=WINDOW_SIZE),
    'e': deque(maxlen=WINDOW_SIZE),
    'r': deque(maxlen=WINDOW_SIZE)
}

# Function to fetch numbers (Mock implementation)
def fetch_number(numberid):
    # Placeholder URL for the test server
    url = f"http://test-server.com/numbers/{numberid}"
    
    try:
        response = requests.get(url, timeout=0.5)
        response.raise_for_status()
        return response.json().get('number')
    except (requests.RequestException, ValueError) as e:
        print(f"Error fetching number: {e}")
        return None

# Function to calculate average
def calculate_average(window):
    if not window:
        return 0
    return sum(window) / len(window)

@app.route('/average/<numberid>', methods=['GET'])
def get_average(numberid):
    if numberid not in windows:
        return jsonify({"error": "Invalid number type"}), 400

    # Fetch number from the test server
    new_number = fetch_number(numberid)
    
    prev_window = list(windows[numberid])
    
    if new_number is not None:
        windows[numberid].append(new_number)
    
    curr_window = list(windows[numberid])
    avg = calculate_average(curr_window)
    
    response = {
        "numbers": curr_window,
        "windowPrevState": prev_window,
        "windowCurrState": curr_window,
        "avg": avg
    }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
