from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import date
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from weather_fetcher import get_weather_range
from predictor import predict_safety, resolve_city

app = Flask(__name__)
CORS(app)


# ─────────────────────────────────────────────
# MAIN ENDPOINT: Booking date range forecast
# Used by: campsite booking page
#
# GET /forecast/range
# Params:
#   city       = "Ella"          (any city or extra location)
#   start_date = "2026-05-01"    (YYYY-MM-DD)
#   end_date   = "2026-05-04"    (YYYY-MM-DD)
#
# Response includes:
#   - Per-day weather + safe/unsafe prediction
#   - Overall range summary
#   - Overall booking safety verdict
# ─────────────────────────────────────────────
@app.route('/forecast/range', methods=['GET'])
def forecast_range():
    city       = request.args.get('city')
    start_str  = request.args.get('start_date')
    end_str    = request.args.get('end_date')

    if not city or not start_str or not end_str:
        return jsonify({
            "error": "Required: city, start_date, end_date"
        }), 400

    try:
        start_date = date.fromisoformat(start_str)
        end_date   = date.fromisoformat(end_str)
    except ValueError:
        return jsonify({"error": "Dates must be YYYY-MM-DD format."}), 400

    # Resolve city → get coordinates + mapped dataset city
    resolved = resolve_city(city)
    if resolved is None:
        return jsonify({
            "error": f"City '{city}' not found.",
            "hint":  "Call /cities to see all supported locations."
        }), 404

    # Get weather for full date range
    weather = get_weather_range(
        city       = city,
        start_date = start_date,
        end_date   = end_date,
        lat        = resolved["lat"],
        lon        = resolved["lon"]
    )
    if "error" in weather:
        return jsonify(weather), 400

    # Predict safety for each day
    daily_results = []
    unsafe_days   = 0

    for day in weather["daily"]:
        pred = predict_safety(
            city         = city,
            temperature  = day["temperature"],
            radiation    = day["radiation"],
            precip_hours = day["precip_hours"],
            wind_speed   = day["wind_speed"]
        )
        if "error" in pred:
            return jsonify(pred), 422

        if pred["is_unsafe"] == 1:
            unsafe_days += 1

        daily_results.append({
            "date":             day["date"],
            "temperature":      day["temperature"],
            "wind_speed":       day["wind_speed"],
            "humidity":         day["humidity"],
            "precip_hours":     day["precip_hours"],
            "precip_sum":       day["precip_sum"],
            "sunrise":          day["sunrise"],
            "sunset":           day["sunset"],
            "source":           day["source"],
            "is_unsafe":        pred["is_unsafe"],
            "status":           pred["status"],
            "confidence":       pred["confidence"],
            "confidence_label": pred["confidence_label"],
            "safe_probability": pred["safe_probability"],
            "unsafe_probability": pred["unsafe_probability"],
        })

    # Overall booking verdict
    num_days       = weather["num_days"]
    unsafe_ratio   = unsafe_days / num_days

    if unsafe_ratio == 0:
        overall_status = "SAFE"
        overall_msg    = "All days look great for camping!"
    elif unsafe_ratio <= 0.25:
        overall_status = "MOSTLY_SAFE"
        overall_msg    = f"{unsafe_days} of {num_days} days may be risky. Plan carefully."
    elif unsafe_ratio <= 0.5:
        overall_status = "CAUTION"
        overall_msg    = f"{unsafe_days} of {num_days} days are unsafe. Consider rescheduling."
    else:
        overall_status = "UNSAFE"
        overall_msg    = f"{unsafe_days} of {num_days} days are unsafe. Not recommended."

    return jsonify({
        "city":              city,
        "mapped_city":       resolved["mapped_city"],
        "start_date":        start_str,
        "end_date":          end_str,
        "num_days":          num_days,
        "data_source":       weather["source"],
        # Overall weather summary
        "avg_temperature":   weather["avg_temperature"],
        "max_temperature":   weather["max_temperature"],
        "min_temperature":   weather["min_temperature"],
        "avg_wind_speed":    weather["avg_wind_speed"],
        "max_wind_speed":    weather["max_wind_speed"],
        "avg_humidity":      weather["avg_humidity"],
        "avg_precip_hours":  weather["avg_precip_hours"],
        "total_rain":        weather["total_rain"],
        # Overall safety verdict
        "unsafe_days":       unsafe_days,
        "safe_days":         num_days - unsafe_days,
        "overall_status":    overall_status,
        "overall_message":   overall_msg,
        # Per-day breakdown
        "daily":             daily_results,
    })


# ─────────────────────────────────────────────
# SINGLE DAY (kept for compatibility)
# GET /forecast?city=Colombo&date=2026-04-27
# ─────────────────────────────────────────────
@app.route('/forecast', methods=['GET'])
def forecast_single():
    city     = request.args.get('city')
    date_str = request.args.get('date')

    if not city or not date_str:
        return jsonify({"error": "Required: city, date"}), 400

    try:
        target = date.fromisoformat(date_str)
    except ValueError:
        return jsonify({"error": "Date must be YYYY-MM-DD format."}), 400

    result = forecast_range.__wrapped__ if hasattr(forecast_range, '__wrapped__') else None

    # Reuse range endpoint logic for single day
    from flask import Request
    with app.test_request_context(
        f'/forecast/range?city={city}&start_date={date_str}&end_date={date_str}'
    ):
        resp = forecast_range()
        data = resp.get_json()

    if data and "daily" in data and len(data["daily"]) > 0:
        day = data["daily"][0]
        return jsonify({
            "city":             city,
            "date":             date_str,
            "mapped_city":      data.get("mapped_city"),
            "data_source":      data.get("data_source"),
            "temperature":      day["temperature"],
            "wind_speed":       day["wind_speed"],
            "humidity":         day["humidity"],
            "precip_hours":     day["precip_hours"],
            "precip_sum":       day["precip_sum"],
            "sunrise":          day["sunrise"],
            "sunset":           day["sunset"],
            "is_unsafe":        day["is_unsafe"],
            "status":           day["status"],
            "confidence":       day["confidence"],
            "confidence_label": day["confidence_label"],
            "safe_probability": day["safe_probability"],
            "unsafe_probability": day["unsafe_probability"],
        })
    return jsonify({"error": "Could not get forecast."}), 500


# ─────────────────────────────────────────────
# All supported cities
# GET /cities
# ─────────────────────────────────────────────
@app.route('/cities', methods=['GET'])
def cities():
    from predictor import DATASET_CITY_COORDS, EXTRA_CITY_COORDS
    return jsonify({
        "dataset_cities": sorted(list(DATASET_CITY_COORDS.keys())),
        "extra_locations": sorted(list(EXTRA_CITY_COORDS.keys())),
    })


# ─────────────────────────────────────────────
# Health check
# GET /health
# ─────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "message": "Camping Safety AI is running."})


if __name__ == '__main__':
    app.run(debug=True, port=5000)