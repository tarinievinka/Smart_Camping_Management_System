import requests
import pandas as pd
from datetime import date, datetime

CITY_COORDINATES = {
    "Athurugiriya":              (6.8800,  79.9800),
    "Badulla":                   (6.9934,  81.0550),
    "Bentota":                   (6.4200,  80.0000),
    "Colombo":                   (6.9271,  79.8612),
    "Galle":                     (6.0535,  80.2210),
    "Gampaha":                   (7.0873,  80.0144),
    "Hambantota":                (6.1241,  81.1185),
    "Hatton":                    (6.8953,  80.5956),
    "Jaffna":                    (9.6615,  80.0255),
    "Kalmunai":                  (7.4148,  81.8266),
    "Kalutara":                  (6.5854,  79.9607),
    "Kandy":                     (7.2906,  80.6337),
    "Kesbewa":                   (6.7967,  79.9350),
    "Kolonnawa":                 (6.9167,  79.9333),
    "Kurunegala":                (7.4818,  80.3609),
    "Mabole":                    (7.0500,  79.9000),
    "Maharagama":                (6.8478,  79.9264),
    "Mannar":                    (8.9810,  79.9044),
    "Matale":                    (7.4675,  80.6234),
    "Matara":                    (5.9549,  80.5550),
    "Moratuwa":                  (6.7731,  79.8811),
    "Mount Lavinia":             (6.8389,  79.8653),
    "Negombo":                   (7.2094,  79.8358),
    "Oruwala":                   (6.8400,  79.9600),
    "Pothuhera":                 (7.4167,  80.3333),
    "Puttalam":                  (8.0362,  79.8283),
    "Ratnapura":                 (6.7056,  80.3847),
    "Sri Jayewardenepura Kotte": (6.9108,  79.8878),
    "Trincomalee":               (8.5874,  81.2152),
    "Weligama":                  (5.9747,  80.4294),
}
    # add all cities in your dataset


import os

# Use absolute path relative to this script's location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, '..', 'data', 'weather_cleaned_phase1.csv')

def get_weather(city: str, target_date: date) -> dict:
    days_away = (target_date - date.today()).days
    if days_away <= 14:
        return _from_api(city, target_date)
    else:
        return _from_csv(city, target_date)

def _from_api(city, target_date):
    lat, lon = CITY_COORDINATES[city]
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat, "longitude": lon,
        "daily": ["temperature_2m_mean","shortwave_radiation_sum",
                  "precipitation_hours","windspeed_10m_max",
                  "sunrise","sunset","relative_humidity_2m_mean"],
        "timezone": "Asia/Colombo",
        "start_date": str(target_date),
        "end_date":   str(target_date)
    }
    r = requests.get(url, params=params, timeout=10)
    d = r.json()["daily"]
    return {
        "temperature":    d["temperature_2m_mean"][0],
        "radiation":      d["shortwave_radiation_sum"][0],
        "precip_hours":   d["precipitation_hours"][0],
        "wind_speed":     d["windspeed_10m_max"][0],
        "humidity":       d["relative_humidity_2m_mean"][0],
        "sunrise":        d["sunrise"][0],
        "sunset":         d["sunset"][0],
        "source":         "api"
    }

def _from_csv(city, target_date):
    df = pd.read_csv(CSV_PATH)
    df = df[(df['city'] == city) & (pd.to_datetime(df['time']).dt.month == target_date.month)]
    return {
        "temperature":  df['temperature_2m_mean'].mean(),
        "radiation":    df['shortwave_radiation_sum'].mean(),
        "precip_hours": df['precipitation_hours'].mean(),
        "wind_speed":   df['windspeed_10m_max'].mean(),
        "humidity":     df.get('relativehumidity_2m_mean', pd.Series([70])).mean(),
        "sunrise":      "~06:00",   # static estimate for beyond-14d
        "sunset":       "~18:00",
        "source":       "estimate"
    }