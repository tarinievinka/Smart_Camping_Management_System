# save as test_model.py and run it
import joblib
import numpy as np

# Load both files
scaler = joblib.load('../models/weather_scaler.pkl')
model  = joblib.load('../models/camping_safety_model_tuned.pkl')

# Simulate a real website input (Colombo, sunny day)
test_input = {
    'temperature'  : 32.0,   # °C
    'radiation'    : 180.0,  # shortwave
    'precip_hours' : 2.0,    # hours of rain
    'wind_speed'   : 15.0,   # km/h
    'city_code'    : 0        # encoded city
}

# Scale weather features
weather_features = np.array([[
    test_input['temperature'],
    test_input['radiation'],
    test_input['precip_hours'],
    test_input['wind_speed']
]])
scaled = scaler.transform(weather_features)

# Add city_code and predict
final_input = np.append(scaled[0], test_input['city_code']).reshape(1, -1)
prediction    = model.predict(final_input)
probability   = model.predict_proba(final_input)[0]

print("=" * 40)
print("MODEL INTEGRATION TEST")
print("=" * 40)
print(f"Input        : {test_input}")
print(f"Prediction   : {'🔴 UNSAFE' if prediction[0] == 1 else '🟢 SAFE'}")
print(f"Safe Prob    : {probability[0]:.2%}")
print(f"Unsafe Prob  : {probability[1]:.2%}")
print("=" * 40)
print("✅ Model loads and predicts correctly!" if prediction is not None else "❌ Something went wrong")