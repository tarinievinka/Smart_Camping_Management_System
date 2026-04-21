import joblib
import numpy as np

scaler = joblib.load('../models/weather_scaler.pkl')
model  = joblib.load('../models/camping_safety_model_tuned.pkl')
le     = joblib.load('../models/city_label_encoder.pkl')

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