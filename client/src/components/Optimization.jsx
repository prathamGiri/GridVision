import React, { useState } from 'react';
import { Button } from '@mui/material';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Optimization = ({ solarForecast, demand }) => {
  const unoptimizedSolar = solarForecast.map(plant => plant.map(val => val * 0.5));
  const totalDemand = demand.reduce((sum, bus) => sum + bus.reduce((s, v) => s + v, 0), 0);
  const totalSolarUnopt = unoptimizedSolar.reduce((sum, plant) => sum + plant.reduce((s, v) => s + v, 0), 0);
  const thermalPerUnit = (totalDemand - totalSolarUnopt) / 6;
  const unoptimizedThermal = Array(6).fill().map(() => Array(24).fill(thermalPerUnit / 24));

  const [optimized, setOptimized] = useState(null);
  const [solarShare, setSolarShare] = useState((totalSolarUnopt / totalDemand * 100).toFixed(2));

  const busPositions = [
    { x: 100, y: 100 }, { x: 200, y: 100 }, { x: 300, y: 100 }, { x: 400, y: 100 },
    { x: 100, y: 200 }, { x: 200, y: 200 }, { x: 300, y: 200 }, { x: 400, y: 200 },
    { x: 100, y: 300 }, { x: 200, y: 300 }, { x: 300, y: 300 },
    { x: 400, y: 300 }, { x: 100, y: 400 }, { x: 200, y: 400 },
  ];
  const lines = [
    [1, 2], [1, 5], [2, 3], [2, 4], [3, 4], [4, 5], [5, 6], [6, 11], [6, 12],
    [7, 8], [7, 9], [9, 10], [10, 11], [12, 13], [13, 14],
  ];

  const pieDataUnopt = {
    labels: ['Solar 1', 'Solar 2', 'Solar 3', 'Solar 4', 'Thermal 1', 'Thermal 2', 'Thermal 3', 'Thermal 4', 'Thermal 5', 'Thermal 6'],
    datasets: [{
      data: [
        ...unoptimizedSolar.map(plant => plant.reduce((sum, v) => sum + v, 0)),
        ...unoptimizedThermal.map(plant => plant.reduce((sum, v) => sum + v, 0)),
      ],
      backgroundColor: ['#22c55e', '#16a34a', '#15803d', '#14532d', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#581c1c'],
    }],
  };

  const pieDataOpt = optimized ? {
    labels: pieDataUnopt.labels,
    datasets: [{
      data: [
        ...optimized.solar_gen.map(plant => plant.reduce((sum, v) => sum + v, 0)),
        ...optimized.thermal_gen.map(plant => plant.reduce((sum, v) => sum + v, 0)),
      ],
      backgroundColor: pieDataUnopt.datasets[0].backgroundColor,
    }],
  } : pieDataUnopt;

  const barData = {
    labels: Array(24).fill().map((_, i) => `Hour ${i + 1}`),
    datasets: [
      {
        label: 'Unoptimized Solar',
        data: Array(24).fill().map((_, t) => unoptimizedSolar.reduce((sum, plant) => sum + plant[t], 0)),
        backgroundColor: '#22c55e',
      },
      {
        label: 'Unoptimized Thermal',
        data: Array(24).fill().map((_, t) => unoptimizedThermal.reduce((sum, plant) => sum + plant[t], 0)),
        backgroundColor: '#ef4444',
      },
      ...(optimized ? [
        {
          label: 'Optimized Solar',
          data: Array(24).fill().map((_, t) => optimized.solar_gen.reduce((sum, plant) => sum + plant[t], 0)),
          backgroundColor: '#16a34a',
        },
        {
          label: 'Optimized Thermal',
          data: Array(24).fill().map((_, t) => optimized.thermal_gen.reduce((sum, plant) => sum + plant[t], 0)),
          backgroundColor: '#dc2626',
        },
      ] : []),
    ],
  };

  const handleOptimize = async () => {
    try {
      const response = await fetch('http://localhost:5000/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solar_forecast: solarForecast, demand }),
      });
      const data = await response.json();
      setOptimized({ solar_gen: data.solar_gen, thermal_gen: data.thermal_gen });
      setSolarShare(data.solar_share);
    } catch (error) {
      console.error('Optimization failed:', error);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-4">14-Bus Grid Optimization</h1>
      <p className="text-center mb-6">Visualize and optimize power dispatch for a 14-bus system with 4 solar and 6 thermal units.</p>

      {/* Grid Display */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-center">Grid Topology</h2>
        <div className="relative mx-auto" style={{ width: '500px', height: '500px', border: '1px solid #ccc' }}>
          <svg width="500" height="500">
            {lines.map(([i, j], idx) => (
              <line
                key={idx}
                x1={busPositions[i - 1].x}
                y1={busPositions[i - 1].y}
                x2={busPositions[j - 1].x}
                y2={busPositions[j - 1].y}
                stroke="#4b5563"
                strokeWidth="2"
              />
            ))}
          </svg>
          {busPositions.map((pos, i) => (
            <div
              key={i}
              className={`absolute flex items-center justify-center w-8 h-8 rounded-full text-white text-xs
                ${i < 4 ? 'bg-green-500' : i < 10 ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ left: pos.x - 16, top: pos.y - 16 }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
        <div className="bg-white shadow rounded p-4 w-full">
          <h2 className="text-xl font-semibold mb-2 text-center">Generation Share</h2>
          <Pie data={pieDataOpt} options={{ plugins: { legend: { position: 'right' } } }} />
          <p className="text-center mt-2 font-medium">Solar Share: {solarShare}%</p>
        </div>

        <div className="bg-white shadow rounded p-4 w-full">
          <h2 className="text-xl font-semibold mb-2 text-center">Hourly Generation (Stacked)</h2>
          <Bar data={barData} options={{ scales: { x: { stacked: true }, y: { stacked: true } } }} />
        </div>
      </div>

      {/* Optimize Button */}
      <div className="text-center">
        <Button variant="contained" color="primary" onClick={handleOptimize}>
          OPTIMIZE GRID
        </Button>
      </div>
    </div>
  );
};

export default Optimization;
