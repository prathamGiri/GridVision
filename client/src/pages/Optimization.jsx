
import React, { useState, useEffect } from 'react';
import { Button, CircularProgress, Tooltip } from '@mui/material';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Navbar from '../components/Navbar';

// Register ChartJS components and plugins
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, ChartTooltip, Legend, ChartDataLabels);

const Optimization = () => {
  const [solarForecast, setSolarForecast] = useState(null);
  const [demand, setDemand] = useState(null);
  const [optimized, setOptimized] = useState(null);
  const [solarShare, setSolarShare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    const fetchMockData = async () => {
      try {
        const mockSolarForecast = Array(4).fill().map((_, plantIdx) => {
          const capacity = [250, 250, 5, 250][plantIdx];
          return Array(24).fill().map((_, hour) => {
            const baseOutput = capacity * 0.8 * Math.exp(-Math.pow((hour - 12) / 4, 2));
            const variation = baseOutput * (0.9 + Math.random() * 0.2);
            return (hour >= 20 || hour < 5) ? 0 : Math.min(variation, capacity);
          });
        });

        const mockDemand = Array(14).fill().map((_, busIdx) => {
          if (busIdx < 10) return Array(24).fill(0);
          const baseDemand = [150, 150, 100, 100][busIdx - 10];
          return Array(24).fill().map((_, hour) => {
            const timeFactor = (hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 22) ? 1 : 0.6;
            const variation = baseDemand * timeFactor * (0.85 + Math.random() * 0.3);
            return Math.max(0, variation);
          });
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
        setSolarForecast(mockSolarForecast);
        setDemand(mockDemand);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch mock data:', error);
        setLoading(false);
      }
    };
    fetchMockData();
  }, []);

  const unoptimizedSolar = solarForecast ? solarForecast.map(plant => plant.map(val => val * 0.5)) : [];
  const totalDemand = demand ? demand.reduce((sum, bus) => sum + bus.reduce((s, v) => s + v, 0), 0) : 0;
  const totalSolarUnopt = unoptimizedSolar.reduce((sum, plant) => sum + plant.reduce((s, v) => s + v, 0), 0);
  const thermalPerUnit = totalDemand && totalSolarUnopt ? (totalDemand - totalSolarUnopt) / 6 : 0;
  const unoptimizedThermal = Array(6).fill().map(() => Array(24).fill(thermalPerUnit / 24));

  const pieDataUnopt = {
    labels: ['ACME Solar', 'ARINSUN Solar', 'NTPC DADRI Solar', 'MAHINDRA Solar', 'Thermal 1', 'Thermal 2', 'Thermal 3', 'Thermal 4', 'Thermal 5', 'Thermal 6'],
    datasets: [{
      data: solarForecast && demand ? [
        ...unoptimizedSolar.map(plant => plant.reduce((sum, v) => sum + v, 0)),
        ...unoptimizedThermal.map(plant => plant.reduce((sum, v) => sum + v, 0)),
      ] : [],
      backgroundColor: ['#22c55e', '#16a34a', '#15803d', '#14532d', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#581c1c'],
      borderColor: '#fff',
      borderWidth: 2,
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
      borderColor: '#fff',
      borderWidth: 2,
    }],
  } : pieDataUnopt;

  const barData = {
    labels: Array(24).fill().map((_, i) => `Hour ${i + 1}`),
    datasets: solarForecast && demand ? [
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
    ] : [],
  };

  const handleOptimize = async () => {
    if (!solarForecast || !demand) return;
    try {
      setOptimizing(true);
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
    } finally {
      setOptimizing(false);
    }
  };

  const busPositions = [
    { x: 50, y: 100, label: 'ACME', power: solarForecast ? solarForecast[0][12].toFixed(0) : 0, type: 'solar' },
    { x: 100, y: 50, label: 'ARINSUN', power: solarForecast ? solarForecast[1][12].toFixed(0) : 0, type: 'solar' },
    { x: 150, y: 150, label: 'NTPC', power: solarForecast ? solarForecast[2][12].toFixed(0) : 0, type: 'solar' },
    { x: 200, y: 100, label: 'MAHINDRA', power: solarForecast ? solarForecast[3][12].toFixed(0) : 0, type: 'solar' },
    { x: 250, y: 50, label: 'T1', power: unoptimizedThermal[0][12].toFixed(0), type: 'thermal' },
    { x: 300, y: 100, label: 'T2', power: unoptimizedThermal[1][12].toFixed(0), type: 'thermal' },
    { x: 350, y: 150, label: 'T3', power: unoptimizedThermal[2][12].toFixed(0), type: 'thermal' },
    { x: 400, y: 100, label: 'T4', power: unoptimizedThermal[3][12].toFixed(0), type: 'thermal' },
    { x: 450, y: 50, label: 'T5', power: unoptimizedThermal[4][12].toFixed(0), type: 'thermal' },
    { x: 500, y: 150, label: 'T6', power: unoptimizedThermal[5][12].toFixed(0), type: 'thermal' },
    { x: 550, y: 100, label: 'L1', power: demand ? demand[10][18].toFixed(0) : 0, type: 'load', pct: '50%' },
    { x: 600, y: 50, label: 'L2', power: demand ? demand[11][18].toFixed(0) : 0, type: 'load', pct: '30%' },
    { x: 650, y: 150, label: 'L3', power: demand ? demand[12][18].toFixed(0) : 0, type: 'load', pct: '10%' },
    { x: 700, y: 100, label: 'L4', power: demand ? demand[13][18].toFixed(0) : 0, type: 'load', pct: '10%' },
  ];
  const lines = [
    [1, 5, '350'], [2, 6, '150'], [3, 7, '150'], [4, 8, '150'], [5, 9, '350'],
    [6, 10, '150'], [7, 11, '350'], [8, 12, '150'], [9, 13, '150'], [10, 14, '150'],
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />

      <main className="flex-grow w-[1200px] mx-auto px-0 py-8">
        <section className="mb-12 bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">14-Bus Grid Topology</h2>
          <div className="relative mx-auto" style={{ width: '750px', height: '200px', border: '1px solid #e5e7eb' }}>
            <svg width="750" height="200">
              {lines.map(([i, j, voltage], idx) => (
                <line
                  key={idx}
                  x1={busPositions[i - 1].x}
                  y1={busPositions[i - 1].y}
                  x2={busPositions[j - 1].x}
                  y2={busPositions[j - 1].y}
                  stroke={voltage === '350' ? '#ef4444' : voltage === '150' ? '#4b5563' : '#d1d5db'}
                  strokeWidth={voltage === '350' ? 3 : 2}
                  strokeDasharray={voltage === '150' ? '5,5' : voltage === '0' ? '2,2' : 'none'}
                />
              ))}
            </svg>
            {busPositions.map((pos, i) => (
              <Tooltip
                key={i}
                title={`${pos.type.charAt(0).toUpperCase() + pos.type.slice(1)} Bus: ${pos.label}\nPower: ${pos.power} MW${pos.pct ? `\nLoad: ${pos.pct}` : ''}`}
                arrow
              >
                <div
                  className={`absolute flex items-center justify-center w-12 h-12 rounded-full text-white text-sm font-medium transition-transform hover:scale-110 shadow-md
                    ${pos.type === 'solar' ? 'bg-green-500' : pos.type === 'thermal' ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ left: pos.x - 24, top: pos.y - 24 }}
                >
                  {pos.type === 'solar' ? '🌞' : pos.type === 'thermal' ? '🔥' : '🏭'}
                </div>
              </Tooltip>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
              <span>Solar 🌞</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              <span>Thermal 🔥</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
              <span>Load 🏭</span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">Generation Share</h2>
            <div style={{ height: '300px', position: 'relative' }}>
              <Doughnut
                data={pieDataOpt}
                options={{
                  plugins: {
                    legend: { position: 'bottom', labels: { font: { size: 14 } } },
                    datalabels: {
                      color: '#fff',
                      font: { weight: 'bold' },
                      formatter: (value, ctx) => `${((value / pieDataOpt.datasets[0].data.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%`,
                    },
                    tooltip: { callbacks: { label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw} MW` } },
                  },
                  cutout: '50%', // Doughnut hole size
                  maintainAspectRatio: false,
                  animation: { animateRotate: true, animateScale: true },
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  color: '#333',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                }}
              >
                Solar Share<br />{solarShare ? `${solarShare}%` : 'Calculating...'}
              </div>
            </div>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">Hourly Generation</h2>
            <div style={{ height: '300px' }}>
              <Bar data={barData} options={{
                scales: {
                  x: { stacked: true, title: { display: true, text: 'Hour' } },
                  y: { stacked: true, title: { display: true, text: 'Power (MW)' } },
                },
                maintainAspectRatio: false,
              }} />
            </div>
          </div>
        </section>

        <section className="text-center">
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleOptimize}
            disabled={optimizing || !solarForecast || !demand}
            startIcon={optimizing ? <CircularProgress size={20} /> : null}
            sx={{ padding: '12px 24px', fontSize: '1.1rem', fontWeight: 600 }}
          >
            {optimizing ? 'Optimizing...' : 'Optimize Grid'}
          </Button>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <p>Grid Optimization Dashboard | Updated: Jun 28, 2025, 09:58 AM IST</p>
        </div>
      </footer>
    </div>
  );
};

export default Optimization;
