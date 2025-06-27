import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import Navbar from '../components/Navbar.jsx';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CarbonCreditEstimator from '../components/CarbonCreditEstimator.jsx';
import Optimization from '../components/Optimization.jsx';
import { dummyData } from '../components/DummyData.jsx';


ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const solarPlants = [
  { id: 1, name: 'ACME(Ramnagar)', lat: 24.48, lng: 81.85, capacity: 250, location: 'Rewa, Madhya Pradesh', efficiency: 18.5, station: "ACME(Ramnagar)" },
  { id: 2, name: 'ARINSUN SOLAR', lat: 24, lng: 80, capacity: 250, location: 'Rewa, Madhya Pradesh', efficiency: 17.8, station: "ARINSUN SOLAR (BARSAITADESH)" },
  { id: 3, name: 'NTPC DADRI SOLAR', lat: 28.57, lng: 77.63, capacity: 5, location: 'Dadri, Uttar Pradesh', efficiency: 19.0, station: "DADRI SOLAR" },
  { id: 4, name: 'MAHINDRA SOLAR', lat: 26, lng: 82, capacity: 250, location: 'Badwar, Madhya Pradesh', efficiency: 18.2, station: "MAHINDRA SOLAR (BADWAR)" },
  { id: 5, name: 'UNCHACHAR SOLAR', lat: 25.88, lng: 81.31, capacity: 10, location: 'Unchahar, Gujarat', efficiency: 17.5, station: "UNCHAHAR SOLAR" },
];

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function LocationPredict() {
  const [selectedPlant, setSelectedPlant] = useState(solarPlants[3]);
  const [predictionType, setPredictionType] = useState('today');
  const [graphData, setGraphData] = useState(generateInitialData('today'));
  const [loading, setLoading] = useState(false);
  const mapRef = useRef();
  const { solarIrradiance, temperature, cloudCover } = useSelector((state) => state.prediction);

  const [prediction, setPrediction] = useState([])

  function generateInitialData(type) {
    const labels = type === 'today'
      ? Array.from({ length: 24 }, (_, i) => `${i}:00`)
      : ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'];

    return {
      labels,
      datasets: [
        {
          label: 'Predicted Output (Mu)',
          data: Array(labels.length).fill(0),
          fill: true,
          borderColor: '#90caf9',
          backgroundColor: 'rgba(144, 202, 249, 0.2)',
          pointRadius: 0,
          tension: 0.35,
          borderWidth: 1.5,
        },
      ],
    };
  }

  const handleMarkerClick = (plant) => {
    setSelectedPlant(plant);
    if (mapRef.current) {
      mapRef.current.setView([plant.lat, plant.lng], 5);
    }
  };


  const handlePredict = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          station: selectedPlant.station,
          type: predictionType === "today" ? 1 : 7,
        }),
      });

      const result = await response.json();
      setPrediction(result.prediction)

      if (result.prediction) {
        const labels = predictionType === "today"
          ? Array.from({ length: 24 }, (_, i) => `${i}:00`)
          : ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'];

        const predictionData = result.prediction;

        const cumulativeData = predictionType === "today"
          ? predictionData.reduce((acc, val, i) => {
            acc.push(val + (acc[i - 1] || 0));
            return acc;
          }, [])
          : [];

        const datasets = [
          {
            label: predictionType === "today" ? "Hourly Power (kW)" : "Predicted Output (Mu)",
            data: predictionData,
            yAxisID: 'y1',
            fill: false,
            borderColor: "#2196f3",
            backgroundColor: "rgba(33, 150, 243, 0.12)",
            pointRadius: 2,
            pointHoverRadius: 4,
            tension: 0.3,
            borderWidth: 2,
          },
        ];

        if (predictionType === "today") {
          datasets.push({
            label: "Cumulative Energy (kWh)",
            data: cumulativeData,
            yAxisID: 'y2',
            fill: false,
            borderColor: "#66bb6a",
            backgroundColor: "rgba(102, 187, 106, 0.12)",
            pointRadius: 2,
            pointHoverRadius: 4,
            borderDash: [5, 5],
            tension: 0.3,
            borderWidth: 2,
          });
        }

        setGraphData({
          labels,
          datasets,
        });
      }
    } catch (error) {
      console.error("Prediction request failed:", error);
    } finally {
      setLoading(false);
    }
  };

  
  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      y1: {
        type: 'linear',
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: predictionType === "today" ? 'Power (kW)' : 'Output (Mu)',
        },
        ticks: {
          color: '#1976d2',
        },
        grid: {
          color: '#e0e0e0',
        },
      },
      y2: predictionType === "today"
        ? {
          type: 'linear',
          position: 'right',
          beginAtZero: true,
          title: {
            display: true,
            text: 'Cumulative Energy (kWh)',
          },
          ticks: {
            color: '#388e3c',
          },
          grid: {
            drawOnChartArea: false,
          },
        }
        : undefined,
      x: {
        ticks: {
          color: '#333',
          font: { size: 12 },
        },
        grid: { display: false },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#444',
          font: { size: 13, weight: '500' },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const unit = context.dataset.label.includes('Cumulative') ? 'kWh' :
              context.dataset.label.includes('Power') ? 'kW' : 'Mu';
            return `${context.dataset.label}: ${context.parsed.y} ${unit}`;
          },
        },
      },
    },
  };

  return (
    <Box className="min-h-screen bg-gray-100">
      <Navbar />
      <Box className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT: Map & Controls */}
        <Paper  className="rounded-xl shadow-lg overflow-hidden bg-white">
          <Box className="relative" style={{ height: '400px' }}>
            <MapContainer
              center={[22.5, 78.9]}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {solarPlants.map((plant) => (
                <Marker
                  key={plant.id}
                  position={[plant.lat, plant.lng]}
                  icon={customIcon}
                  eventHandlers={{ click: () => handleMarkerClick(plant) }}
                >
                  <Popup>{plant.name}</Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Info Card */}
            <Box className="absolute bottom-4 left-4 bg-white shadow-md rounded-lg p-4 z-[1000] max-w-xs border">
              <Typography variant="h6" fontWeight={600}>{selectedPlant.name}</Typography>
              <Typography variant="body2">📍 {selectedPlant.location}</Typography>
              <Typography variant="body2">⚡ {selectedPlant.capacity} MW</Typography>
              <Typography variant="body2">🌞 Efficiency: {selectedPlant.efficiency}%</Typography>
              <Typography variant="body2">🧭 Lat: {selectedPlant.lat}, Lng: {selectedPlant.lng}</Typography>
            </Box>
          </Box>

          {/* Controls */}
          <Box className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
            <FormControl
              fullWidth
              className="md:max-w-sm"
              sx={{
                '& label': { color: '#1976d2', fontWeight: 500 },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#90caf9' },
                  '&:hover fieldset': { borderColor: '#42a5f5' },
                  '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                },
              }}
            >
              <InputLabel id="prediction-type-label">Prediction Type</InputLabel>
              <Select
                labelId="prediction-type-label"
                value={predictionType}
                label="Prediction Type"
                onChange={(e) => {
                  setPredictionType(e.target.value);
                  setGraphData(generateInitialData(e.target.value));
                }}
              >

                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="7days">7 Days</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handlePredict}
              disabled={loading}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                backgroundColor: '#1976d2',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#1565c0' },
              }}
            >
              {loading ? "Loading..." : "Predict"}
            </Button>
          </Box>
        </Paper>

        {/* RIGHT: Graph */}
        <Paper className="rounded-xl shadow-lg bg-white p-6 h-fit">
          <Typography variant="h6" fontWeight={700} className="mb-4 text-gray-800">
            Solar Prediction Graph — {predictionType === 'today' ? 'Hourly' : 'Next 7 Days'}
          </Typography>
          <Box style={{ height: '425px' }}>
            <Line data={graphData} options={chartOptions} />
          </Box>
        </Paper>


        <Optimization solarForecast={dummyData.solarForecast} demand={dummyData.demand} />

        <CarbonCreditEstimator predictedGeneration={prediction}/>
      </Box>
    </Box>
  );
}
