from flask import Flask, request, jsonify
from flask_cors import CORS
from model import PersonaNextSentencePredictor
import logging

# Initialize Flask App
app = Flask(__name__)

# --- Final, Explicit CORS Configuration ---
# This is the definitive fix. It explicitly tells the server to allow requests
# from any origin, and to accept the 'Content-Type' header which is sent
# by the React app's JSON requests.
CORS(
    app, 
    resources={r"/api/*": {"origins": "*"}}, 
    methods=["GET", "POST", "OPTIONS"], 
    allow_headers=["Content-Type"]
)

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load The Model
try:
    logging.info("Server is starting... loading the AI model.")
    predictor = PersonaNextSentencePredictor()
    logging.info("Model loaded successfully. API is ready.")
except Exception as e:
    logging.error(f"FATAL: Could not initialize the model. Error: {e}")
    predictor = None

# API Health Check Endpoint
@app.route('/api/', methods=['GET'])
def health_check():
    return jsonify({"status": "API is running"}), 200

# Sentence Generation Endpoint
@app.route('/api/generate', methods=['POST'])
def generate():
    if not predictor:
        return jsonify({"error": "Model is not available."}), 500
    try:
        data = request.get_json()
        prompt = data.get('prompt')
        persona = data.get('persona')
        num_results = data.get('num_results', 3)
        if not prompt or not persona:
            return jsonify({"error": "Missing 'prompt' or 'persona'."}), 400
        
        generated_sentences = predictor.generate_next_sentence(
            prompt=prompt,
            persona=persona,
            num_results=int(num_results)
        )
        return jsonify({"generated_sentences": generated_sentences}), 200
    except Exception as e:
        logging.error(f"An error occurred in /generate: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

# Coherence Checking Endpoint
@app.route('/api/check-coherence', methods=['POST'])
def check_coherence():
    if not predictor:
        return jsonify({"error": "Model is not available."}), 500
    try:
        data = request.get_json()
        sentence_a = data.get('sentence_a')
        sentence_b = data.get('sentence_b')
        if not sentence_a or not sentence_b:
            return jsonify({"error": "Missing 'sentence_a' or 'sentence_b'."}), 400

        result = predictor.check_coherence(sentence_a, sentence_b)
        return jsonify(result), 200
    except Exception as e:
        logging.error(f"An error occurred in /check-coherence: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

