import requests
import pandas as pd
import os
from datetime import date, timedelta

BASE     = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE, '../data/weather_cleaned_phase1.csv')

# All city coordinates (dataset + extra camping locations)
ALL_COORDINATES = {
    # Dataset cities
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
    # Extra camping locations
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


def get_weather_range(city: str, start_date: date, end_date: date,
                      lat: float = None, lon: float = None) -> dict:
    """
    Get weather for a booking date range.
    lat/lon can be passed directly (from predictor.resolve_city).
    Within 14 days from today  → Open-Meteo live API
    Beyond 14 days             → CSV historical averages
    """
    num_days  = (end_date - start_date).days + 1
    days_away = (start_date - date.today()).days

    if num_days < 1:
        return {"error": "end_date must be on or after start_date."}
    if num_days > 30:
        return {"error": "Maximum booking range is 30 days."}

    # Resolve coordinates
    if lat is None or lon is None:
        if city not in ALL_COORDINATES:
            return {"error": f"Coordinates not found for '{city}'."}
        lat, lon = ALL_COORDINATES[city]

    try:
        if days_away <= 14:
            daily_list = _api_range(lat, lon, start_date, end_date)
            source     = "api"
        else:
            daily_list = _csv_range(city, start_date, end_date)
            source     = "estimate"
    except Exception as e:
        print(f"[weather_fetcher] API failed ({e}), using CSV fallback.")
        daily_list = _csv_range(city, start_date, end_date)
        source     = "estimate"

    # Summary across the full range
    temps  = [d["temperature"]  for d in daily_list]
    winds  = [d["wind_speed"]   for d in daily_list]
    hums   = [d["humidity"]     for d in daily_list]
    precips= [d["precip_hours"] for d in daily_list]
    rains  = [d["precip_sum"]   for d in daily_list]

    return {
        "city":             city,
        "start_date":       str(start_date),
        "end_date":         str(end_date),
        "num_days":         num_days,
        "source":           source,
        "avg_temperature":  round(sum(temps)   / num_days, 1),
        "max_temperature":  round(max(temps), 1),
        "min_temperature":  round(min(temps), 1),
        "avg_wind_speed":   round(sum(winds)   / num_days, 1),
        "max_wind_speed":   round(max(winds), 1),
        "avg_humidity":     round(sum(hums)    / num_days, 1),
        "avg_precip_hours": round(sum(precips) / num_days, 1),
        "total_rain":       round(sum(rains), 1),
        "daily":            daily_list,
    }


def _api_range(lat: float, lon: float,
               start_date: date, end_date: date) -> list:
    params = {
        "latitude":   lat,
        "longitude":  lon,
        "daily": [
            "temperature_2m_mean",
            "shortwave_radiation_sum",
            "precipitation_hours",
            "precipitation_sum",
            "windspeed_10m_max",
            "sunrise",
            "sunset",
        ],
        "hourly":     "relativehumidity_2m",
        "timezone":   "Asia/Colombo",
        "start_date": str(start_date),
        "end_date":   str(end_date),
    }
    r = requests.get("https://api.open-meteo.com/v1/forecast",
                     params=params, timeout=10)
    r.raise_for_status()
    d     = r.json()
    daily = d["daily"]
    hourly= d["hourly"]["relativehumidity_2m"]

    result = []
    for i in range(len(daily["time"])):
        h_start  = i * 24
        humidity = round(sum(hourly[h_start:h_start + 24]) / 24, 1)
        result.append({
            "date":         daily["time"][i],
            "temperature":  round(daily["temperature_2m_mean"][i]      or 0, 1),
            "radiation":    round(daily["shortwave_radiation_sum"][i]   or 0, 1),
            "precip_hours": round(daily["precipitation_hours"][i]       or 0, 1),
            "precip_sum":   round(daily["precipitation_sum"][i]         or 0, 1),
            "wind_speed":   round(daily["windspeed_10m_max"][i]         or 0, 1),
            "humidity":     humidity,
            "sunrise":      daily["sunrise"][i].split("T")[1],
            "sunset":       daily["sunset"][i].split("T")[1],
            "source":       "api",
        })
    return result


def _csv_range(city: str, start_date: date, end_date: date) -> list:
    from predictor import resolve_city

    resolved  = resolve_city(city)
    csv_city  = resolved["mapped_city"] if resolved else "Colombo"

    df        = pd.read_csv(CSV_PATH)
    df["time"]= pd.to_datetime(df["time"])

    result  = []
    current = start_date

    while current <= end_date:
        month_df = df[
            (df["city"] == csv_city) &
            (df["time"].dt.month == current.month)
        ]
        if month_df.empty:
            month_df = df[df["city"] == csv_city]

        # Use average sunrise/sunset for this month from CSV
        sunrise_times = month_df["sunrise"].dropna()
        sunset_times  = month_df["sunset"].dropna()
        sunrise_str   = sunrise_times.iloc[0].split("T")[1][:5] if not sunrise_times.empty else "06:00"
        sunset_str    = sunset_times.iloc[0].split("T")[1][:5]  if not sunset_times.empty  else "18:00"

        result.append({
            "date":         str(current),
            "temperature":  round(month_df["temperature_2m_mean"].mean(),    1),
            "radiation":    round(month_df["shortwave_radiation_sum"].mean(), 1),
            "precip_hours": round(month_df["precipitation_hours"].mean(),     1),
            "precip_sum":   round(month_df["rain_sum"].mean(),                1),
            "wind_speed":   round(month_df["windspeed_10m_max"].mean(),       1),
            "humidity":     70.0,
            "sunrise":      sunrise_str,
            "sunset":       sunset_str,
            "source":       "estimate",
        })
        current += timedelta(days=1)

    return result