⚡ GridVision
GridVision is an intelligent energy grid management platform that leverages machine learning, real-time monitoring, and advanced forecasting to optimize the generation, distribution, and consumption of solar and conventional power sources. Designed for research, simulation, and practical deployment in smart grid environments, GridVision empowers efficient and sustainable energy management.

🌟 Features

🔋 Solar Power ForecastingPredict solar energy generation using weather data and advanced machine learning models.
📉 Demand PredictionUtilize time-series models to accurately forecast power consumption across different zones.
🔄 Grid OptimizationEnable smart dispatch and load balancing through sophisticated optimization algorithms.
🛰️ Interactive DashboardVisualize real-time data on demand, generation, and grid status with an intuitive interface.
📦 Modular ArchitectureEasily extend functionality or integrate with external APIs for enhanced flexibility.


🛠️ Tech Stack

Backend: Flask, Pandapower, NumPy, SciPy  
Frontend: React.js, TailwindCSS  
Machine Learning/Forecasting: Scikit-learn, TimeSeries  
Data Sources: OpenWeatherMap API, NASA POWER API, NSRDB


📂 Folder Structure
GridVision/
├── backend/           # Flask and Pandapower for backend logic
├── client/            # React frontend with TailwindCSS
├── test/              # Data collection, cleaning, EDA, and ML model development
└── README.md          # Project documentation


🚀 Getting Started
Follow these steps to set up GridVision locally:

Clone the Repository  
git clone https://github.com/prathamGiri/GridVision.git


Set Up the BackendNavigate to the backend folder and start the server:  
cd backend
python app.py


Set Up the FrontendNavigate to the client folder, install dependencies, and run the React app:  
cd client
npm install
npm run dev




📜 License
This project is licensed under the MIT License. See the LICENSE file for details.

🤝 Contributing
Contributions are welcome! Please read the Contributing Guidelines for details on how to get started.
