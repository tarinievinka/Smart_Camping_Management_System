import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
import os

# 1. Load the Phase 1 Cleaned Data
input_path = '../data/weather_cleaned_phase1.csv'
output_path = '../data/weather_cleaned_phase2.csv'

if not os.path.exists(input_path):
    print(f"Error: {input_path} not found. Run Phase 1 first!")
else:
    df = pd.read_csv(input_path)
    print("Phase 1 data loaded successfully.")

    # 2. Categorical Encoding (City Names)
    # The model can't read "Kandy", so we turn it into a number
    le = LabelEncoder()
    df['city_code'] = le.fit_transform(df['city'])
    print(f"Encoded {len(le.classes_)} cities.")

    # 3. Create the "Safety Label" (Target Variable)
    # Logic: If rain > 5mm OR wind > 25km/h, it's 'Unsafe' (1), else 'Safe' (0)
    df['is_unsafe'] = ((df['rain_sum'] > 5.0) | (df['windspeed_10m_max'] > 25.0)).astype(int)

    # 4. Feature Scaling (Normalization)
    # We scale the weather values so they are between -1 and 1
    scaler = StandardScaler()
    features_to_scale = [
        'temperature_2m_mean', 
        'shortwave_radiation_sum', 
        'precipitation_hours', 
        'windspeed_10m_max'
    ]
    df[features_to_scale] = scaler.fit_transform(df[features_to_scale])

    # 5. Final Cleanup
    # Drop the original text 'city' and 'time' columns for the ML model
    df_final = df.drop(columns=['city', 'time'])

    # 6. Save the Final File
    df_final.to_csv(output_path, index=False)
    print(f"Phase 2 Complete! Saved as: {output_path}")
    print(f"Final dataset shape: {df_final.shape}")
