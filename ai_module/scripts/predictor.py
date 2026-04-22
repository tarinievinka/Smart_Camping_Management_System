import os
import joblib
import numpy as np

# Use absolute path relative to this script's location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, '..', 'models')

scaler = joblib.load(os.path.join(MODELS_DIR, 'weather_scaler.pkl'))
model  = joblib.load(os.path.join(MODELS_DIR, 'camping_safety_model_tuned.pkl'))
le     = joblib.load(os.path.join(MODELS_DIR, 'city_label_encoder.pkl'))

def predict_safety(city: str, temperature: float, radiation: float,
                   precip_hours: float, wind_speed: float) -> dict:
    city_code = le.transform([city])[0]
    weather   = np.array([[temperature, radiation, precip_hours, wind_speed]])
    scaled    = scaler.transform(weather)
    final     = np.append(scaled[0], city_code).reshape(1, -1)
    label     = model.predict(final)[0]
    proba     = model.predict_proba(final)[0]
    return {
        "is_unsafe": int(label),
        "safe_probability":   round(float(proba[0]), 4),
        "unsafe_probability": round(float(proba[1]), 4),
        "confidence_label": "high" if max(proba) > 0.80 else "borderline"
    }