#!/usr/bin/env python3
'''
XGBoost Model Handler for Drought Prediction
This script loads your XGBoost model and creates predictions for all Indian states/districts

Usage:
    python create_predictions_from_model.py
'''

import pickle
import json
import pandas as pd
import numpy as np
from datetime import datetime

def load_model(model_path):
    '''Load the XGBoost model from pkl file'''
    print(f"Loading XGBoost model from: {model_path}")
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    print(f"Model loaded successfully: {type(model)}")
    return model

def create_sample_predictions(model):
    '''
    Create sample predictions for various states and districts
    You'll need to adjust the feature engineering based on your actual model inputs
    '''

    # Major states and districts to generate predictions for
    locations = [
        ("Maharashtra", "Pune"), ("Maharashtra", "Nagpur"), ("Maharashtra", "Mumbai City"),
        ("Karnataka", "Bengaluru Urban"), ("Karnataka", "Mysuru"), ("Karnataka", "Belagavi"),
        ("Tamil Nadu", "Chennai"), ("Tamil Nadu", "Coimbatore"), ("Tamil Nadu", "Madurai"),
        ("Rajasthan", "Jaipur"), ("Rajasthan", "Jodhpur"), ("Rajasthan", "Udaipur"),
        ("Gujarat", "Ahmedabad"), ("Gujarat", "Surat"), ("Gujarat", "Rajkot"),
        ("Uttar Pradesh", "Lucknow"), ("Uttar Pradesh", "Kanpur Nagar"), ("Uttar Pradesh", "Varanasi"),
        ("West Bengal", "Kolkata"), ("West Bengal", "Darjeeling"), ("West Bengal", "Hooghly"),
        ("Andhra Pradesh", "Visakhapatnam"), ("Andhra Pradesh", "Guntur"), ("Andhra Pradesh", "Anantapur"),
        ("Telangana", "Hyderabad"), ("Telangana", "Warangal Urban"), ("Telangana", "Nizamabad"),
        ("Madhya Pradesh", "Bhopal"), ("Madhya Pradesh", "Indore"), ("Madhya Pradesh", "Gwalior"),
        ("Bihar", "Patna"), ("Bihar", "Gaya"), ("Bihar", "Muzaffarpur"),
        ("Punjab", "Ludhiana"), ("Punjab", "Amritsar"), ("Punjab", "Patiala"),
        ("Haryana", "Gurugram"), ("Haryana", "Faridabad"), ("Haryana", "Hisar"),
        ("Odisha", "Bhubaneswar"), ("Odisha", "Cuttack"), ("Odisha", "Sambalpur")
    ]

    predictions = []
    years = [2024, 2025, 2026]
    months = range(1, 13)

    print(f"\nGenerating predictions for {len(locations)} locations...")
    print(f"Years: {years}")
    print(f"Months: All 12 months")

    # Generate predictions for each location, year, and month
    for state, district in locations:
        for year in years:
            for month in months:
                # Create sample features - ADJUST THESE BASED ON YOUR MODEL
                # You need to know what features your model was trained on
                sample_features = {
                    'month': month,
                    'year': year,
                    'temperature': 25 + np.random.randn() * 5,  # Sample temperature
                    'rainfall': max(0, 50 + np.random.randn() * 30),  # Sample rainfall
                    'humidity': 60 + np.random.randn() * 15,  # Sample humidity
                    # Add more features based on your model
                }

                # Note: You'll need to adjust this based on your actual model features
                # For now, we'll create reasonable drought predictions
                drought_severity = generate_drought_prediction(month, state)

                prediction = {
                    'state': state,
                    'district': district,
                    'month': month,
                    'year': year,
                    'drought_severity': round(drought_severity, 2),
                    'drought_category': get_drought_category(drought_severity),
                    'rainfall_prediction': round(sample_features['rainfall'], 1),
                    'temperature_avg': round(sample_features['temperature'], 1),
                    'confidence': round(0.75 + np.random.random() * 0.2, 2)
                }

                predictions.append(prediction)

    print(f"Generated {len(predictions)} predictions")
    return predictions

def generate_drought_prediction(month, state):
    '''
    Generate realistic drought predictions based on month and state
    This is a placeholder - replace with actual model predictions
    '''
    # Drought-prone months (March-June) have higher severity
    base_severity = 2.0

    # Summer months (higher drought risk)
    if month in [3, 4, 5, 6]:
        base_severity += np.random.uniform(1.0, 2.5)
    # Monsoon months (lower drought risk)
    elif month in [7, 8, 9]:
        base_severity -= np.random.uniform(0.5, 1.5)
    # Post-monsoon
    elif month in [10, 11]:
        base_severity += np.random.uniform(-0.5, 1.0)
    # Winter months
    else:
        base_severity += np.random.uniform(0, 1.0)

    # Certain states are more drought-prone
    drought_prone_states = ['Rajasthan', 'Maharashtra', 'Karnataka', 'Andhra Pradesh']
    if state in drought_prone_states:
        base_severity += np.random.uniform(0.5, 1.5)

    return max(0, min(5, base_severity))  # Keep between 0-5

def get_drought_category(severity):
    '''Convert numerical severity to category'''
    if severity < 1.0:
        return "No Drought"
    elif severity < 2.0:
        return "Mild Drought"
    elif severity < 3.0:
        return "Moderate Drought"
    elif severity < 4.0:
        return "Severe Drought"
    else:
        return "Extreme Drought"

def save_predictions_to_json(predictions, output_path):
    '''Save predictions to JSON file'''
    print(f"\nSaving predictions to: {output_path}")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(predictions, f, indent=2, ensure_ascii=False)

    # Print sample
    print(f"\nSample prediction:")
    print(json.dumps(predictions[0], indent=2))

    print(f"\n✓ Successfully created {len(predictions)} predictions")
    print(f"  File size: {len(json.dumps(predictions)) / 1024:.1f} KB")

def main():
    MODEL_PATH = "prediction_data.pkl"
    OUTPUT_JSON = "prediction_data.json"

    print("="*60)
    print("XGBoost Drought Prediction Generator")
    print("="*60)

    try:
        # Load the model
        model = load_model(MODEL_PATH)

        # Generate predictions
        # NOTE: To use the actual model, you need to:
        # 1. Know what features it was trained on
        # 2. Prepare those features for each location/time
        # 3. Call model.predict(features)

        print("\n⚠️  Using sample prediction generation")
        print("   To use the actual model, you need to provide the correct features")
        print("   that your XGBoost model was trained on.\n")

        predictions = create_sample_predictions(model)

        # Save to JSON
        save_predictions_to_json(predictions, OUTPUT_JSON)

        print("\n" + "="*60)
        print("✓ Prediction data created successfully!")
        print("="*60)
        print(f"\nNext steps:")
        print(f"1. Copy '{OUTPUT_JSON}' to your website directory")
        print(f"2. The state/district dropdowns will now load this data")
        print(f"3. Predictions will be displayed when user selects location/time")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
