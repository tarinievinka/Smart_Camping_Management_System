from flask import Flask, request, jsonify
from datetime import date
from weather_fetcher import get_weather
from predictor import predict_safety

app = Flask(__name__)

@app.route('/forecast', methods=['GET'])
def forecast():
    city        = request.args.get('city')
    target_date = date.fromisoformat(request.args.get('date'))

    weather    = get_weather(city, target_date)
    prediction = predict_safety(
        city         = city,
        temperature  = weather['temperature'],
        radiation    = weather['radiation'],
        precip_hours = weather['precip_hours'],
        wind_speed   = weather['wind_speed']
    )

    return jsonify({**weather, **prediction})