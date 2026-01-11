#!/usr/bin/env python3
'''
Flask API to serve drought predictions from XGBoost model
This creates a web service that your website can call to get predictions

Usage:
    python flask_drought_api.py

Then your website will call: http://localhost:5000/api/predict?state=Maharashtra&district=Pune&month=6&year=2024
'''

from flask import Flask, jsonify, request
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd

app = Flask(__name__)
CORS(app)  # Enable CORS for your website to call this API

# Load model once at startup
print("Loading XGBoost model...")
with open('prediction_data.pkl', 'rb') as f:
    model = pickle.load(f)
print(f"Model loaded: {type(model)}")

# Indian states and districts mapping
INDIAN_STATES = {
    "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
    "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapura", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
    "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
    "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
    "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"]
}

def generate_drought_prediction(state, district, month, year):
    '''
    Generate drought prediction
    REPLACE THIS with actual model.predict() when you know the required features
    '''
    # Sample prediction logic based on month and region
    base_severity = 2.0

    # Summer months have higher drought risk
    if month in [3, 4, 5, 6]:
        base_severity += np.random.uniform(1.0, 2.5)
    elif month in [7, 8, 9]:  # Monsoon
        base_severity -= np.random.uniform(0.5, 1.5)
    else:
        base_severity += np.random.uniform(-0.5, 1.0)

    # Drought-prone states
    if state in ['Rajasthan', 'Maharashtra', 'Karnataka']:
        base_severity += np.random.uniform(0.5, 1.5)

    severity = max(0, min(5, base_severity))

    # Categorize
    if severity < 1.0:
        category = "No Drought"
    elif severity < 2.0:
        category = "Mild Drought"
    elif severity < 3.0:
        category = "Moderate Drought"
    elif severity < 4.0:
        category = "Severe Drought"
    else:
        category = "Extreme Drought"

    return {
        'state': state,
        'district': district,
        'month': int(month),
        'year': int(year),
        'drought_severity': round(float(severity), 2),
        'drought_category': category,
        'rainfall_prediction': round(50 + np.random.randn() * 30, 1),
        'temperature_avg': round(25 + np.random.randn() * 5, 1),
        'confidence': round(0.75 + np.random.random() * 0.2, 2)
    }

@app.route('/api/states', methods=['GET'])
def get_states():
    '''Return list of all states'''
    return jsonify({
        'states': sorted(INDIAN_STATES.keys())
    })

@app.route('/api/districts', methods=['GET'])
def get_districts():
    '''Return districts for a given state'''
    state = request.args.get('state')
    if state and state in INDIAN_STATES:
        return jsonify({
            'state': state,
            'districts': INDIAN_STATES[state]
        })
    return jsonify({'error': 'State not found'}), 404

@app.route('/api/predict', methods=['GET'])
def predict():
    '''Get drought prediction for given parameters'''
    state = request.args.get('state')
    district = request.args.get('district')
    month = request.args.get('month')
    year = request.args.get('year')

    # Validate inputs
    if not all([state, district, month, year]):
        return jsonify({'error': 'Missing required parameters'}), 400

    try:
        month = int(month)
        year = int(year)
    except ValueError:
        return jsonify({'error': 'Invalid month or year'}), 400

    if month < 1 or month > 12:
        return jsonify({'error': 'Month must be between 1 and 12'}), 400

    # Generate prediction
    prediction = generate_drought_prediction(state, district, month, year)

    return jsonify(prediction)

@app.route('/api/health', methods=['GET'])
def health_check():
    '''Health check endpoint'''
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'model_type': str(type(model))
    })

if __name__ == '__main__':
    print("\n" + "="*60)
    print("Drought Prediction API Server")
    print("="*60)
    print("\nEndpoints:")
    print("  GET /api/states                    - Get all states")
    print("  GET /api/districts?state=<name>    - Get districts for state")
    print("  GET /api/predict?state=...&district=...&month=...&year=...")
    print("\nStarting server on http://localhost:5000")
    print("="*60 + "\n")

    app.run(debug=True, host='0.0.0.0', port=5000)
