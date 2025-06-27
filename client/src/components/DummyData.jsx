import React from 'react';

// Dummy solar forecast: [4][24] array for 4 plants (ACME, ARINSUN, NTPC DADRI, MAHINDRA) over 24 hours (MW)
const solarForecast = Array(4).fill().map((_, plantIdx) => {
  const capacity = [250, 250, 5, 250][plantIdx]; // Capacities in MW
  return Array(24).fill().map((_, hour) => {
    // Gaussian-like solar output: peaks at noon (hour 12), 0 at night
    const baseOutput = capacity * 0.8 * Math.exp(-Math.pow((hour - 12) / 4, 2));
    // Add ±10% random variation
    const variation = baseOutput * (0.9 + Math.random() * 0.2);
    // 0 output from 8 PM to 5 AM (hours 20-5)
    return (hour >= 20 || hour < 5) ? 0 : Math.min(variation, capacity);
  });
});

// Dummy demand: [14][24] array for 14 buses over 24 hours (MW)
const demand = Array(14).fill().map((_, busIdx) => {
  // Buses 1-10 (generation): 0 demand
  if (busIdx < 10) return Array(24).fill(0);
  // Buses 11-14 (load): Split total demand (peak ~500 MW)
  const baseDemand = [150, 150, 100, 100][busIdx - 10]; // Per-bus peak demand
  return Array(24).fill().map((_, hour) => {
    // Demand peaks in morning (8-10) and evening (18-22), lower at night
    const timeFactor = (hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 22) ? 1 : 0.6;
    // Add ±15% random variation
    const variation = baseDemand * timeFactor * (0.85 + Math.random() * 0.3);
    return Math.max(0, variation);
  });
});

export const dummyData = { solarForecast, demand };
