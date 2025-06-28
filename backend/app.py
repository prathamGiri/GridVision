from flask import Flask, request, jsonify, json
from flask_cors import CORS
import joblib
import pickle
import pandas as pd
from datetime import timedelta
import warnings
import pandapower as pp
import pandapower.timeseries as ts
import pandas as pd
import numpy as np
from pandapower.control import ConstControl
from pandapower.timeseries import OutputWriter
from pandapower.timeseries import run_timeseries
warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Load the solar generation model
try:
    solar_model = joblib.load('model/solar_generation_model.pkl')
    print("Successfully loaded solar model")
except Exception as e:
    print(f"Error loading solar model: {str(e)}")
    solar_model = None

feature_order = ['Operational Capacity(MW)', 'Latitude', 'Longitude', 'Month',
                'Day', 'Temperature', 'Cloud Type', 'Relative Humidity',
                'Aerosol Optical Depth', 'Clearsky DHI', 'Clearsky DNI', 'Clearsky GHI',
                'DHI', 'DNI', 'GHI']

# Define valid zones
zones = ['PowerConsumption_Zone1', 'PowerConsumption_Zone2', 'PowerConsumption_Zone3']

@app.route('/predict', methods=['POST'])
def predict():
    if solar_model is None:
        return jsonify({'error': 'Solar model not loaded'})
    station = request.json['station']
    req_type = request.json['type']
    return predict_solar_gen(station, req_type)
    
def predict_solar_gen(station, req_type):
    try:
        df = pd.read_csv(f"API data/daily/{station}_daily_api_data.csv")
        df = df[feature_order]
        if req_type == 1:
            data = df.loc[(df['Month'] == 12) & (df["Day"] == 30)]
            hourly_data = pd.read_csv(f"API data/hourly/{station}_hourly_api_data.csv")
            prediction = solar_model.predict(data)  # input must be 2D
            total_ghi = hourly_data['GHI'].sum()
            pred_per_ghi = prediction / total_ghi
            hourly_gen = hourly_data['GHI'] * pred_per_ghi
            predicted_hour = hourly_gen.tolist()
            
            return jsonify({'prediction': predicted_hour[-5:]+predicted_hour[:-5]})
        elif req_type == 7:
            data = df
            prediction = solar_model.predict(data)  # input must be 2D
            return jsonify({'prediction': prediction.tolist()})
        else:
            return jsonify({'error': 'Invalid request type'})
    except KeyError as e:
        return jsonify({'error': f'Missing key in request: {str(e)}'})
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'})

@app.route('/predict_consumption', methods=['POST'])
def predict_consumption():
    # Extract zone and forecast_hours from JSON payload
    zone = request.json['zone']
    forecast_hours = request.json['forecast_hours']
    return predict_demand(zone, forecast_hours)

def predict_demand(zone, forecast_hours):
    try:
        # Validate inputs
        if zone not in zones:
            return jsonify({'error': f"Invalid zone. Choose from {zones}"})
        if not isinstance(forecast_hours, int) or forecast_hours < 1:
            return jsonify({'error': 'forecast_hours must be a positive integer'})
        
        # Load the model for the specific zone on-demand
        try:
            with open(f'model/{zone}_model.pkl', 'rb') as file:
                model = pickle.load(file)
            print(f"Successfully loaded model for {zone}")
        except Exception as e:
            return jsonify({'error': f'Failed to load model for {zone}: {str(e)}'})
        
        # Generate forecast using the SARIMA model
        try:
            forecast = model.forecast(steps=forecast_hours)
        except Exception as e:
            return jsonify({'error': f'Forecast failed: {str(e)}'})
        
        
        return jsonify({'forcast': forecast.tolist()})
    
    except KeyError as e:
        return jsonify({'error': f'Missing key in request: {str(e)}'})
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'})

@app.route('/optimize_grid', methods=['POST'])
def optimize_grid():
    station = request.json['station']
    solar_data = predict_solar_gen(station, 1).json['prediction']
    demand1 = np.array(predict_demand('PowerConsumption_Zone1', 24).json['forcast'])
    demand2 = np.array(predict_demand('PowerConsumption_Zone2', 24).json['forcast'])
    demand3 = np.array(predict_demand('PowerConsumption_Zone3', 24).json['forcast'])
    
    return run_grid_timeseries(solar_data, demand1, demand2, demand3)
        
def run_grid_timeseries(solar_data, load3_data, load4_data, load5_data, n_timesteps=24, output_path="./results/"):
    # Create the same network as provided
    net = pp.create_empty_network()

    # Create buses
    bus1 = pp.create_bus(net, vn_kv=110, name="Bus 1 (Thermal)")
    bus2 = pp.create_bus(net, vn_kv=110, name="Bus 2 (Solar)")
    bus3 = pp.create_bus(net, vn_kv=110, name="Bus 3 (Hydro + Load)")
    bus4 = pp.create_bus(net, vn_kv=110, name="Bus 4 (Load)")
    bus5 = pp.create_bus(net, vn_kv=110, name="Bus 5 (Load)")

    # Assign 2D coordinates
    r = 100
    angles = np.linspace(0, 2 * np.pi, 5, endpoint=False)
    for i, bus in enumerate([bus1, bus2, bus3, bus4, bus5]):
        net.bus.loc[bus, "x"] = r * np.cos(angles[i])
        net.bus.loc[bus, "y"] = r * np.sin(angles[i])

    # Create generators with cost parameters for OPF
    pp.create_gen(net, bus=bus1, p_mw=100, vm_pu=1.0, slack=True, name="Thermal Gen", 
                min_q_mvar=-50, max_q_mvar=50, min_p_mw=0, max_p_mw=150)
    pp.create_poly_cost(net, 0, 'gen', cp1_eur_per_mw=50)  # Linear cost for thermal
    pp.create_gen(net, bus=bus2, p_mw=50, vm_pu=1.0, name="Solar Gen", 
                min_q_mvar=-25, max_q_mvar=25, min_p_mw=0, max_p_mw=100)
    pp.create_poly_cost(net, 1, 'gen', cp1_eur_per_mw=10)  # Lower cost for solar
    pp.create_gen(net, bus=bus3, p_mw=80, vm_pu=1.0, name="Hydro Gen", 
                min_q_mvar=-30, max_q_mvar=30, min_p_mw=0, max_p_mw=120)
    pp.create_poly_cost(net, 2, 'gen', cp1_eur_per_mw=30)  # Medium cost for hydro

    # Create loads
    load3 = pp.create_load(net, bus=bus3, p_mw=40, q_mvar=20, name="Load Bus 3")
    load4 = pp.create_load(net, bus=bus4, p_mw=60, q_mvar=30, name="Load Bus 4")
    load5 = pp.create_load(net, bus=bus5, p_mw=50, q_mvar=25, name="Load Bus 5")

    # Create lines
    pp.create_line(net, from_bus=bus1, to_bus=bus2, length_km=10, std_type="NA2XS2Y 1x240 RM/25 12/20 kV", name="Line 1-2")
    pp.create_line(net, from_bus=bus2, to_bus=bus3, length_km=15, std_type="NA2XS2Y 1x240 RM/25 12/20 kV", name="Line 2-3")
    pp.create_line(net, from_bus=bus3, to_bus=bus4, length_km=12, std_type="NA2XS2Y 1x240 RM/25 12/20 kV", name="Line 3-4")
    pp.create_line(net, from_bus=bus4, to_bus=bus5, length_km=10, std_type="NA2XS2Y 1x240 RM/25 12/20 kV", name="Line 4-5")
    pp.create_line(net, from_bus=bus5, to_bus=bus1, length_km=20, std_type="NA2XS2Y 1x240 RM/25 12/20 kV", name="Line 5-1")

    # Create sample time series data (24 hours)
    n_timesteps = 24
    time_steps = range(n_timesteps)

    # Sample solar forecast (MW) - varies between 0 and max capacity
    solar_forecast = np.sin(np.linspace(0, np.pi, n_timesteps)) * 80  # Sinusoidal pattern
    solar_forecast = np.clip(solar_forecast, 0, 100)  # Limit to max capacity

    # Sample load forecasts (MW) - some variation around base loads
    load3_forecast = 40 + 10 * np.random.normal(1, 0.1, n_timesteps)
    load4_forecast = 60 + 15 * np.random.normal(1, 0.1, n_timesteps)
    load5_forecast = 50 + 12 * np.random.normal(1, 0.1, n_timesteps)

    # Create DataFrame
    data = pd.DataFrame({
        'solar_p_mw': solar_forecast,
        'load3_p_mw': load3_forecast,
        'load4_p_mw': load4_forecast,
        'load5_p_mw': load5_forecast,
        'load3_q_mvar': load3_forecast * 0.5,  # Assume constant power factor
        'load4_q_mvar': load4_forecast * 0.5,
        'load5_q_mvar': load5_forecast * 0.5
    }, index=time_steps)

    # Create data source for time series
    ds = ts.DFData(data)

    # Create ConstControl for time series
    ConstControl(net, element='gen', element_index=1, variable='p_mw', data_source=ds, profile_name='solar_p_mw')
    ConstControl(net, element='load', element_index=load3, variable='p_mw', data_source=ds, profile_name='load3_p_mw')
    ConstControl(net, element='load', element_index=load4, variable='p_mw', data_source=ds, profile_name='load4_p_mw')
    ConstControl(net, element='load', element_index=load5, variable='p_mw', data_source=ds, profile_name='load5_p_mw')
    ConstControl(net, element='load', element_index=load3, variable='q_mvar', data_source=ds, profile_name='load3_q_mvar')
    ConstControl(net, element='load', element_index=load4, variable='q_mvar', data_source=ds, profile_name='load4_q_mvar')
    ConstControl(net, element='load', element_index=load5, variable='q_mvar', data_source=ds, profile_name='load5_q_mvar')

    # Create output writer to store results
    ow = OutputWriter(net, time_steps, output_path="./results/", output_file_type=".csv")
    ow.log_variable('res_bus', 'vm_pu')
    ow.log_variable('res_bus', 'p_mw')
    ow.log_variable('res_gen', 'p_mw')
    ow.log_variable('res_gen', 'q_mvar')
    ow.log_variable('res_line', 'loading_percent')

    # Run time series OPF
    try:
        run_timeseries(net, time_steps=time_steps, verbose=True)
        print("Time series OPF completed successfully!")
    except Exception as e:
        print(f"Error during OPF: {str(e)}")
        
    bus_v_results = pd.read_csv("results/res_bus/vm_pu.csv", index_col=0, sep=';')
    bus_p_results = pd.read_csv("results/res_bus/p_mw.csv", index_col=0, sep=';')
    gen_p_results = pd.read_csv("results/res_gen/p_mw.csv", index_col=0, sep=';')
    gen_q_results = pd.read_csv("results/res_gen/q_mvar.csv", index_col=0, sep=';')
    line_results = pd.read_csv("results/res_line/loading_percent.csv", index_col=0, sep=';')
    
    results = {
        "bus_v_results": bus_v_results.to_dict(),
        "bus_p_results": bus_p_results.to_dict(),
        "gen_p_results": gen_p_results.to_dict(),
        "gen_q_results": gen_q_results.to_dict(),
        "line_results": line_results.to_dict()
    }
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True, port=5000)