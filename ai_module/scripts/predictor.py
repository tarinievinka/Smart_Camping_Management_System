import joblib
import numpy as np
import math
import os

BASE   = os.path.dirname(os.path.abspath(__file__))
scaler = joblib.load(os.path.join(BASE, '../models/weather_scaler.pkl'))
model  = joblib.load(os.path.join(BASE, '../models/camping_safety_model_tuned.pkl'))
le     = joblib.load(os.path.join(BASE, '../models/city_label_encoder.pkl'))

# Exact coordinates from the training dataset
DATASET_CITY_COORDS = {
    "Athurugiriya":              (6.900002, 79.899994),
    "Badulla":                   (7.099998, 81.100006),
    "Bentota":                   (6.500000, 80.000000),
    "Colombo":                   (7.000000, 79.899994),
    "Galle":                     (6.099998, 80.200010),
    "Gampaha":                   (7.099998, 80.000000),
    "Hambantota":                (6.200005, 81.200010),
    "Hatton":                    (6.900002, 80.600006),
    "Jaffna":                    (9.700005, 80.000000),
    "Kalmunai":                  (7.400002, 81.800020),
    "Kalutara":                  (6.599998, 80.000000),
    "Kandy":                     (7.300003, 80.600006),
    "Kesbewa":                   (6.800003, 79.899994),
    "Kolonnawa":                 (6.900002, 79.899994),
    "Kurunegala":                (7.500000, 80.399994),
    "Mabole":                    (7.000000, 79.899994),
    "Maharagama":                (6.800003, 79.899994),
    "Mannar":                    (8.900002, 80.000000),
    "Matale":                    (7.599998, 80.600006),
    "Matara":                    (6.000000, 80.399994),
    "Moratuwa":                  (6.800003, 79.899994),
    "Mount Lavinia":             (6.900002, 79.899994),
    "Negombo":                   (7.099998, 79.899994),
    "Oruwala":                   (6.900002, 80.000000),
    "Pothuhera":                 (7.400002, 80.300020),
    "Puttalam":                  (8.000000, 79.800020),
    "Ratnapura":                 (6.800003, 80.300020),
    "Sri Jayewardenepura Kotte": (6.900002, 79.899994),
    "Trincomalee":               (8.599998, 81.200010),
    "Weligama":                  (6.000000, 80.399994),
}

# Extra camping locations with their real coordinates
EXTRA_CITY_COORDS = {
    "Nuwara Eliya":  (6.9497,  80.7891),
    "Ohiya":         (6.8167,  80.8167),
    "Horton Plains": (6.8019,  80.8044),
    "Ambewela":      (6.8833,  80.8000),
    "Ella":          (6.8667,  81.0500),
    "Bandarawela":   (6.8303,  80.9897),
    "Hikkaduwa":     (6.1395,  80.1067),
    "Unawatuna":     (6.0150,  80.2497),
    "Mirissa":       (5.9483,  80.4716),
    "Tangalle":      (6.0167,  80.7833),
    "Dickwella":     (5.9667,  80.6833),
    "Sigiriya":      (7.9570,  80.7603),
    "Dambulla":      (7.8742,  80.6511),
    "Polonnaruwa":   (7.9403,  81.0188),
    "Anuradhapura":  (8.3114,  80.4037),
    "Habarana":      (8.0500,  80.7500),
    "Arugam Bay":    (6.8400,  81.8360),
    "Batticaloa":    (7.7167,  81.7000),
    "Pasikuda":      (7.9167,  81.5667),
    "Nilaveli":      (8.7167,  81.2000),
    "Kalpitiya":     (8.2297,  79.7692),
    "Chilaw":        (7.5758,  79.7953),
    "Mannar Island": (8.9667,  79.9000),
    "Kilinochchi":   (9.3803,  80.3992),
    "Vavuniya":      (8.7514,  80.4972),
    "Pottuvil":      (6.8767,  81.8328),
}


def _nearest_dataset_city(lat: float, lon: float) -> str:
    """Find the nearest dataset city using Euclidean distance on coordinates."""
    min_dist = float('inf')
    nearest  = "Colombo"
    for city, (clat, clon) in DATASET_CITY_COORDS.items():
        dist = math.sqrt((lat - clat) ** 2 + (lon - clon) ** 2)
        if dist < min_dist:
            min_dist = dist
            nearest  = city
    return nearest


def resolve_city(city: str) -> dict:
    """
    Resolve any city name to a valid dataset city.
    Returns { mapped_city, lat, lon }
    """
    # 1. Direct match in dataset
    if city in DATASET_CITY_COORDS:
        lat, lon = DATASET_CITY_COORDS[city]
        return {"mapped_city": city, "lat": lat, "lon": lon}

    # 2. Case-insensitive match
    for c in DATASET_CITY_COORDS:
        if c.lower() == city.lower():
            lat, lon = DATASET_CITY_COORDS[c]
            return {"mapped_city": c, "lat": lat, "lon": lon}

    # 3. Known extra location — find nearest dataset city by coordinates
    if city in EXTRA_CITY_COORDS:
        lat, lon    = EXTRA_CITY_COORDS[city]
        mapped_city = _nearest_dataset_city(lat, lon)
        return {"mapped_city": mapped_city, "lat": lat, "lon": lon}

    # 4. Case-insensitive match in extra locations
    for c in EXTRA_CITY_COORDS:
        if c.lower() == city.lower():
            lat, lon    = EXTRA_CITY_COORDS[c]
            mapped_city = _nearest_dataset_city(lat, lon)
            return {"mapped_city": mapped_city, "lat": lat, "lon": lon}

    return None


def predict_safety(city: str, temperature: float, radiation: float,
                   precip_hours: float, wind_speed: float) -> dict:

    resolved = resolve_city(city)
    if resolved is None:
        return {
            "error":        f"City '{city}' not recognized.",
            "valid_cities": sorted(list(DATASET_CITY_COORDS.keys())) +
                            sorted(list(EXTRA_CITY_COORDS.keys()))
        }

    mapped_city = resolved["mapped_city"]
    city_code   = le.transform([mapped_city])[0]

    weather = np.array([[temperature, radiation, precip_hours, wind_speed]])
    scaled  = scaler.transform(weather)
    final   = np.append(scaled[0], city_code).reshape(1, -1)

    label = model.predict(final)[0]
    proba = model.predict_proba(final)[0]

    return {
        "is_unsafe":          int(label),
        "status":             "UNSAFE" if label == 1 else "SAFE",
        "safe_probability":   round(float(proba[0]), 4),
        "unsafe_probability": round(float(proba[1]), 4),
        "confidence":         round(float(max(proba)) * 100, 1),
        "confidence_label":   "high" if max(proba) > 0.80 else "borderline",
        "mapped_city":        mapped_city,
        "original_city":      city,
    }