import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const RevenueForecast = () => {
  const [data, setData] = useState({ spot: [], ppa: [] });
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    // Simulate API call to backend for revenue data
    const fetchData = async () => {
      // Replace with actual API call
      const response = {
        hours: Array.from({ length: 24 }, (_, i) => `Hour ${i}`),
        spotRevenue: [0, 0, 0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 900, 800, 700, 600, 500, 400, 300, 200, 100, 0, 0],
        ppaRevenue: Array(24).fill(500), // Fixed PPA price
      };
      setLabels(response.hours);
      setData({
        spot: response.spotRevenue,
        ppa: response.ppaRevenue,
      });
    };
    fetchData();
  }, []);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Spot Market Revenue ($)',
        data: data.spot,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'PPA Revenue ($)',
        data: data.ppa,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Hourly Revenue Forecast' },
    },
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Revenue Forecast</h2>
      <Line data={chartData} options={options} />
      <div className="mt-4">
        <p>Total Spot Revenue: ${data.spot.reduce((a, b) => a + b, 0)}</p>
        <p>Total PPA Revenue: ${data.ppa.reduce((a, b) => a + b, 0)}</p>
      </div>
    </div>
  );
};

export default RevenueForecast;