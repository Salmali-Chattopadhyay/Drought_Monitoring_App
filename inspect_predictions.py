#!/usr/bin/env python3
'''
Inspect and convert your prediction PKL file to JSON
This will check if it contains predictions data or just the model
'''

import pickle
import json
import pandas as pd
import numpy as np

def inspect_pkl_file(pkl_path):
    '''Inspect what's in the pkl file'''
    print(f"Loading: {pkl_path}\n")

    with open(pkl_path, 'rb') as f:
        data = pickle.load(f)
        

    print(f"Type: {type(data)}")
    print(f"=" * 60)

    # Check if it's a DataFrame
    if isinstance(data, pd.DataFrame):
        print("\n✓ Found DataFrame with predictions!")
        print(f"Shape: {data.shape} (rows × columns)")
        print(f"\nColumns: {list(data.columns)}")
        print(f"\nFirst few rows:")
        print(data.head())
        print(f"\nData types:")
        print(data.dtypes)
        return data

    # Check if it's a dict
    elif isinstance(data, dict):
        print("\n✓ Found dictionary!")
        print(f"Keys: {list(data.keys())}")

        # Check if it contains predictions
        if 'predictions' in data:
            print("\nFound 'predictions' key!")
            predictions = data['predictions']
            print(f"Type of predictions: {type(predictions)}")
            if isinstance(predictions, pd.DataFrame):
                print(f"Shape: {predictions.shape}")
                print(f"Columns: {list(predictions.columns)}")
            return predictions
        else:
            # Show first few keys and values
            for key, value in list(data.items())[:5]:
                print(f"\n{key}: {type(value)}")
                if isinstance(value, (list, pd.DataFrame)):
                    print(f"  Length/Shape: {len(value) if isinstance(value, list) else value.shape}")
        return data

    # Check if it's a list
    elif isinstance(data, list):
        print(f"\n✓ Found list with {len(data)} items")
        if len(data) > 0:
            print(f"\nFirst item type: {type(data[0])}")
            print(f"First item: {data[0]}")
        return data

    # It's something else (like a model)
    else:
        print(f"\n⚠️  This appears to be a model object, not prediction data")
        print(f"\nObject attributes:")
        attrs = [attr for attr in dir(data) if not attr.startswith('_')]
        for attr in attrs[:10]:
            print(f"  - {attr}")
        return None

def convert_to_json(data, output_path):
    '''Convert data to JSON'''

    if data is None:
        print("\n✗ No prediction data found to convert")
        return False

    print(f"\n{'='*60}")
    print("Converting to JSON...")
    print(f"{'='*60}")

    # Convert DataFrame to records
    if isinstance(data, pd.DataFrame):
        json_data = data.to_dict('records')
    elif isinstance(data, dict):
        json_data = data
    elif isinstance(data, list):
        json_data = data
    else:
        print("Cannot convert this type to JSON")
        return False

    # Handle numpy types
    json_data = convert_numpy_types(json_data)

    # Save to JSON
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)

    file_size = len(json.dumps(json_data)) / 1024
    print(f"\n✓ Saved to: {output_path}")
    print(f"  File size: {file_size:.1f} KB")
    print(f"  Records: {len(json_data) if isinstance(json_data, list) else 'N/A'}")

    # Show sample
    if isinstance(json_data, list) and len(json_data) > 0:
        print(f"\nSample record:")
        print(json.dumps(json_data[0], indent=2))

    return True

def convert_numpy_types(obj):
    '''Convert numpy types to Python native types'''
    if isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return convert_numpy_types(obj.tolist())
    elif pd.isna(obj):
        return None
    else:
        return obj

def main():
    PKL_FILE = "prediction_data.pkl"
    JSON_FILE = "prediction_data.json"

    print("="*60)
    print("PKL File Inspector and Converter")
    print("="*60)
    print()

    try:
        # Inspect the file
        data = inspect_pkl_file(PKL_FILE)

        # Try to convert
        if data is not None:
            success = convert_to_json(data, JSON_FILE)

            if success:
                print(f"\n{'='*60}")
                print("✓ SUCCESS!")
                print(f"{'='*60}")
                print(f"\nYour predictions are now in '{JSON_FILE}'")
                print(f"Copy this file to your website folder and you're done!")
        else:
            print(f"\n{'='*60}")
            print("⚠️  This file contains a MODEL, not predictions")
            print(f"{'='*60}")
            print(f"\nOptions:")
            print(f"1. Do you have a separate file with the predictions?")
            print(f"2. Or do you need to generate predictions from the model?")
            print(f"\nIf you have predictions elsewhere, try again with that file.")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
