# app.py
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

@app.route('/')
def home():
    return jsonify(message="Hello from the backend!")

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5500)

