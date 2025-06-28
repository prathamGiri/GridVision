# ⚡ GridVision

**GridVision** is an intelligent energy grid management platform that leverages machine learning, real-time monitoring, and advanced forecasting to optimize the generation, distribution, and consumption of solar and conventional power sources. Designed for research, simulation, and practical deployment in smart grid environments, GridVision empowers efficient and sustainable energy management.

---

## 🌟 Features

- **🔋 Solar Power Forecasting**  
  Predict solar energy generation using weather data and advanced machine learning models.
- **📉 Demand Prediction**  
  Utilize time-series models to accurately forecast power consumption across different zones.
- **🔄 Grid Optimization**  
  Enable smart dispatch and load balancing through sophisticated optimization algorithms.
- **🛰️ Interactive Dashboard**  
  Visualize real-time data on demand, generation, and grid status with an intuitive interface.
- **📦 Modular Architecture**  
  Easily extend functionality or integrate with external APIs for enhanced flexibility.

---

## 🛠️ Tech Stack

- **Backend:** Flask, Pandapower, NumPy, SciPy  
- **Frontend:** React.js, TailwindCSS  
- **Machine Learning/Forecasting:** Scikit-learn, TimeSeries  
- **Data Sources:** OpenWeatherMap API, NASA POWER API, NSRDB  

---

## 📂 Folder Structure

```
GridVision/
├── backend/           # Flask and Pandapower for backend logic
├── client/            # React frontend with TailwindCSS
├── test/              # Data collection, cleaning, EDA, and ML model development
└── README.md          # Project documentation
```

---

## 🚀 Getting Started

Follow these steps to set up **GridVision** locally:

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/prathamGiri/GridVision.git
   ```

2. **Set Up the Backend**  
   Navigate to the backend folder and start the server:  
   ```bash
   cd backend
   python app.py
   ```

3. **Set Up the Frontend**  
   Navigate to the client folder, install dependencies, and run the React app:  
   ```bash
   cd client
   npm install
   npm run dev
   ```
---

## 🤝 Contributing

Contributions are welcome!
