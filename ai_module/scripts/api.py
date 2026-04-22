from flask import Flask, request, jsonify
<<<<<<< HEAD
from flask_cors import CORS
from datetime import date
import traceback
=======
from datetime import date
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
from weather_fetcher import get_weather
from predictor import predict_safety

app = Flask(__name__)
<<<<<<< HEAD
CORS(app) # Enable CORS for all routes

@app.route('/forecast', methods=['GET'])
def forecast():
    try:
        city_param = request.args.get('city')
        date_param = request.args.get('date')
        
        if not city_param or not date_param:
            return jsonify({"error": "Missing city or date parameter"}), 400
            
        target_date = date.fromisoformat(date_param)

        weather    = get_weather(city_param, target_date)
        prediction = predict_safety(
            city         = city_param,
            temperature  = weather['temperature'],
            radiation    = weather['radiation'],
            precip_hours = weather['precip_hours'],
            wind_speed   = weather['wind_speed']
        )

        return jsonify({**weather, **prediction})
    except Exception as e:
        print(f"Error in forecast: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
=======

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
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
