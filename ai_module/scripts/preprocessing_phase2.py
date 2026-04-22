import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib
import os

input_path  = '../data/weather_cleaned_phase1.csv'
output_path = '../data/weather_cleaned_phase2.csv'
if not os.path.exists(input_path):
    print(f"Error: {input_path} not found. Run Phase 1 first!")
    exit()

df = pd.read_csv(input_path)
print(f"Phase 1 data loaded. Total rows: {len(df)}")

# 1. Encode city names
le = LabelEncoder()
df['city_code'] = le.fit_transform(df['city'])
print(f"Encoded {len(le.classes_)} cities: {list(le.classes_)}")

# 2. Save encoder
os.makedirs('../models', exist_ok=True)
joblib.dump(le, '../models/city_label_encoder.pkl')
print("Saved: city_label_encoder.pkl")

# 3. Fuzzy Safety Logic — Introducing Nuance & Divergence
# Instead of hard True/False, we use probabilistic labeling for borderline cases.
# This forces the AI to learn "Uncertainty", resulting in nuanced safety scores.
import numpy as np

def calculate_unsafe_prob(row):
    # a) Temperature Risk
    t_mean = row['temperature_2m_mean']
    t_risk = 0
    if t_mean > 30.8: t_risk = 1.0     # Critical Heat
    elif t_mean > 29.5: t_risk = 0.6   # Borderline Heat
    elif t_mean < 17.0: t_risk = 1.0   # Critical Cold
    elif t_mean < 18.5: t_risk = 0.5   # Borderline Cold
    
    # b) Rain Risk (rain_sum in mm)
    r_sum = row['rain_sum']
    r_risk = 0
    if r_sum > 25.0: r_risk = 1.0      # Extreme Rain
    elif r_sum > 15.0: r_risk = 0.7    # Heavy Rain
    elif r_sum > 8.0:  r_risk = 0.3    # Moderate Rain
    
    # c) Wind Risk (km/h)
    w_max = row['windspeed_10m_max']
    w_risk = 0
    if w_max > 40.0: w_risk = 1.0      # Dangerous Wind
    elif w_max > 30.0: w_risk = 0.6    # Strong Wind
    elif w_max > 22.0: w_risk = 0.2    # Moderate Breeze
    
    # Combine risks (cumulative but capped at 1.0)
    total_prob = min(1.0, t_risk + r_risk + w_risk)
    return total_prob

# Apply the fuzzy probability and sample the final label
np.random.seed(42) # For reproducibility during retraining
probs = df.apply(calculate_unsafe_prob, axis=1)
df['is_unsafe'] = (np.random.rand(len(df)) < probs).astype(int)



unsafe_pct = df['is_unsafe'].mean() * 100
print(f"Safety distribution: {100 - unsafe_pct:.1f}% Safe | {unsafe_pct:.1f}% Unsafe")
print(f"  Days with rain_sum > 20mm : {(df['rain_sum'] > 20.0).sum()}")
print(f"  Days with wind > 35 km/h  : {(df['windspeed_10m_max'] > 35.0).sum()}")
print(f"  Total unsafe days          : {df['is_unsafe'].sum()}")

<<<<<<< HEAD
# 4. Feature scaling (DEPRECATED: Scaling now handled in training/inference scripts)
# Keep data raw in the CSV for better flexibility
=======
    joblib.dump(scaler, '../models/weather_scaler.pkl')
    print("   weather_scaler.pkl saved.")

    # 5. Final Cleanup
    # Drop the original text 'city' and 'time' columns for the ML model
    df_final = df.drop(columns=['city', 'time'])
>>>>>>> c9024bdec91196298ab2a8864d91f12db503d7b3


# 5. Drop columns not needed for ML
df_final = df.drop(columns=['city', 'time'])

# 6. Save
df_final.to_csv(output_path, index=False)
print(f"\nPhase 2 complete. Saved: {output_path}")
print(f"Final shape: {df_final.shape}")