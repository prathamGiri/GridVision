import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import {
  Box,
  Paper,
  Typography,
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
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [hourlyData, setHourlyData] = useState({
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Hourly Power (kW)',
        data: Array(24).fill(0),
        yAxisID: 'y1',
        borderColor: "#1976d2",
        backgroundColor: "rgba(33, 150, 243, 0.2)",
        pointRadius: 2,
        tension: 0.3,
        borderWidth: 2,
      },
      {
        label: 'Cumulative Energy (kWh)',
        data: Array(24).fill(0),
        yAxisID: 'y2',
        borderColor: "#66bb6a",
        borderDash: [5, 5],
        pointRadius: 2,
        tension: 0.3,
        borderWidth: 2,
      },
    ],
  });
  const [weeklyData, setWeeklyData] = useState({
    labels: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'],
    datasets: [
      {
        label: 'Predicted Output (Mu)',
        data: Array(7).fill(0),
        yAxisID: 'y1',
        borderColor: "#1976d2",
        backgroundColor: "rgba(33, 150, 243, 0.2)",
        pointRadius: 2,
        tension: 0.3,
        borderWidth: 2,
      },
    ],
  });
  const [carbonData, setCarbonData] = useState(Array(24).fill(0));
  const mapRef = useRef();

  const generateLabels = (type) =>
    type === 'today'
      ? Array.from({ length: 24 }, (_, i) => `${i}:00`)
      : ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'];

  const formatGraphData = (prediction, type) => {
    const labels = generateLabels(type);
    const cumulativeData = type === 'today'
      ? prediction.reduce((acc, val, i) => {
        acc.push(val + (acc[i - 1] || 0));
        return acc;
      }, [])
      : [];

    const datasets = [
      {
        label: type === 'today' ? 'Hourly Power (kW)' : 'Predicted Output (Mu)',
        data: prediction,
        yAxisID: 'y1',
        borderColor: "#1976d2",
        backgroundColor: "rgba(33, 150, 243, 0.2)",
        pointRadius: 2,
        tension: 0.3,
        borderWidth: 2,
      },
    ];

    if (type === 'today') {
      datasets.push({
        label: 'Cumulative Energy (kWh)',
        data: cumulativeData,
        yAxisID: 'y2',
        borderColor: "#66bb6a",
        borderDash: [5, 5],
        pointRadius: 2,
        tension: 0.3,
        borderWidth: 2,
      });
    }

    return { labels, datasets };
  };

  const fetchPredictions = async (plant) => {
    try {
      const [todayRes, weekRes] = await Promise.all([
        fetch('http://localhost:5000/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ station: plant.station, type: 1 }),
        }),
        fetch('http://localhost:5000/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ station: plant.station, type: 7 }),
        }),
      ]);

      const todayData = await todayRes.json();
      const weekData = await weekRes.json();

      setHourlyData(formatGraphData(todayData.prediction, 'today'));
      setWeeklyData(formatGraphData(weekData.prediction, '7days'));
      setCarbonData(todayData.prediction);
    } catch (err) {
      console.error('Prediction error:', err);
    }
  };

  const handleMarkerClick = (plant) => {
    setSelectedPlant(plant);
    fetchPredictions(plant);
    if (mapRef.current) {
      mapRef.current.setView([plant.lat, plant.lng], 5);
    }
  };

  const chartOptions = (type) => ({
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      y1: {
        type: 'linear',
        position: 'left',
        beginAtZero: true,
        title: { display: true, text: type === 'today' ? 'Power (kW)' : 'Output (Mu)' },
        ticks: { color: '#1976d2' },
      },
      y2: type === 'today' ? {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        title: { display: true, text: 'Cumulative Energy (kWh)' },
        ticks: { color: '#388e3c' },
        grid: { drawOnChartArea: false },
      } : undefined,
      x: {
        ticks: { color: '#333', font: { size: 12 } },
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
  });

  return (
    <Box className="min-h-screen bg-gray-100">
      <Navbar />

      <Box className="flex flex-col md:flex-row w-full h-[calc(100vh-64px)]">
        {/* Map Section */}
        <Box className="md:w-1/2 w-full h-full">
          <MapContainer
            center={[22.5, 78.9]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
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

          {selectedPlant && (
            <Box className="absolute bottom-4 left-4 bg-white p-4Mixed reality rounded-lg shadow-md max-w-xs z-[1000]">
              <Typography variant="h6" fontWeight={600}>{selectedPlant.name}</Typography>
              <Typography variant="body2">📍 {selectedPlant.location}</Typography>
              <Typography variant="body2">⚡ {selectedPlant.capacity} MW</Typography>
              <Typography variant="body2">🌞 Efficiency: {selectedPlant.efficiency}%</Typography>
              <Typography variant="body2">🧭 Lat: {selectedPlant.lat}, Lng: {selectedPlant.lng}</Typography>
            </Box>
          )}
        </Box>

        {/* Data Section */}
        <Box className="md:w-1/2 w-full p-4 overflow-y-auto bg-white">
          <Paper className="mb-6 p-4 shadow-lg rounded-xl">
            <Typography variant="h6" fontWeight={600} className="mb-4">
              {selectedPlant ? `${selectedPlant.name} - Today’s Hourly Prediction` : 'Today’s Hourly Prediction (Select a plant)'}
            </Typography>
            <Box style={{ height: 300 }}>
              <Line data={hourlyData} options={chartOptions('today')} />
            </Box>
          </Paper>

          <Paper className="mb-6 p-4 shadow-lg rounded-xl">
            <Typography variant="h6" fontWeight={600} className="mb-4">
              {selectedPlant ? `${selectedPlant.name} - 7-Day Forecast` : '7-Day Forecast (Select a plant)'}
            </Typography>
            <Box style={{ height: 300 }}>
              <Line data={weeklyData} options={chartOptions('7days')} />
            </Box>
          </Paper>

          {/* <Paper className="p-4 shadow-lg rounded-xl"> */}
            <CarbonCreditEstimator predictedGeneration={carbonData} />
          {/* </Paper> */}
        </Box>
      </Box>
    </Box>
  );
}