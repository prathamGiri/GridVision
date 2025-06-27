from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests (important if frontend and backend are on different ports)

# Load your trained model
model = joblib.load('model/solar_generation_model.pkl')
feature_order = ['Operational Capacity(MW)', 'Latitude', 'Longitude', 'Month',
       'Day', 'Temperature', 'Cloud Type', 'Relative Humidity',
       'Aerosol Optical Depth', 'Clearsky DHI', 'Clearsky DNI', 'Clearsky GHI',
       'DHI', 'DNI', 'GHI']

@app.route('/predict', methods=['POST'])
def predict():
    station = request.json['station']
    req_type = request.json['type']
    df = pd.read_csv(f"API data/daily/{station}_daily_api_data.csv")
    df = df[feature_order]
    if req_type == 1:
        data = df.loc[(df['Month'] == 12) & (df["Day"] == 30)]
        hourly_data = pd.read_csv(f"API data/hourly/{station}_hourly_api_data.csv")
        prediction = model.predict(data)  # input must be 2D
        total_ghi = hourly_data['GHI'].sum()
        pred_per_ghi = prediction / total_ghi
        hourly_gen = hourly_data['GHI'] * pred_per_ghi
        return jsonify({'prediction': hourly_gen.tolist()})
    elif req_type == 7:
        data = df
        prediction = model.predict(data)  # input must be 2D
        return jsonify({'prediction': prediction.tolist()})
    else:
        return jsonify({'error': 'Invalid request type'})
    
if __name__ == '__main__':
    app.run(debug=True, port=5000)
