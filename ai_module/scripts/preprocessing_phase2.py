import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib
import os

input_path  = '../data/weather_cleaned_phase1.csv'
output_path = '../data/weather_cleaned_phase2.csv'

if not os.path.exists(input_path):
    print(f"Error: {input_path} not found. Run Phase 1 first!")
else:
    df = pd.read_csv(input_path)
    print(f"Phase 1 data loaded. Total rows: {len(df)}")

    # 1. Encode city names
    le = LabelEncoder()
    df['city_code'] = le.fit_transform(df['city'])
    print(f"Encoded {len(le.classes_)} cities: {list(le.classes_)}")

    # 2. Save encoder immediately
    os.makedirs('../models', exist_ok=True)
    joblib.dump(le, '../models/city_label_encoder.pkl')
    print("Saved: city_label_encoder.pkl")

    # 3. Balanced safety label
    # rain_sum > 10mm OR windspeed > 30 km/h = Unsafe
    # Gives ~21% Unsafe / 79% Safe — balanced for reliable predictions
    df['is_unsafe'] = ((df['rain_sum'] > 10.0) | (df['windspeed_10m_max'] > 30.0)).astype(int)
    unsafe_pct = df['is_unsafe'].mean() * 100
    print(f"Safety distribution: {100 - unsafe_pct:.1f}% Safe | {unsafe_pct:.1f}% Unsafe")

    # 4. Feature scaling
    scaler = StandardScaler()
    features_to_scale = [
        'temperature_2m_mean',
        'shortwave_radiation_sum',
        'precipitation_hours',
        'windspeed_10m_max'
    ]
    df[features_to_scale] = scaler.fit_transform(df[features_to_scale])

    # 5. Drop columns not needed for ML
    df_final = df.drop(columns=['city', 'time'])

    # 6. Save
    df_final.to_csv(output_path, index=False)
    print(f"Phase 2 complete. Saved: {output_path}")
    print(f"Final shape: {df_final.shape}")