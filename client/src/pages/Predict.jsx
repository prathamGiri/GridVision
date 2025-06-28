import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Navbar from '../components/Navbar.jsx';
import PredictionForm from '../components/PredictionForm.jsx';
import Weather from '../components/Weather.jsx';
import SolarCalculator from '../components/SolarCalculator.jsx';

const getCurrentHour = () => new Date().getHours();

const generateMockChartData = () => {
  const hour = getCurrentHour();
  const data = [];

  for (let i = 0; i <= hour; i++) {
    data.push({
      hour: `${i.toString().padStart(2, '0')}:00`,
      output: +(Math.random() * 6).toFixed(2),
    });
  }

  return data;
};

export default function Predict() {
  const { solarIrradiance, temperature, cloudCover, hour } = useSelector(
    (state) => state.prediction
  );

  const [lineChartData] = useState(generateMockChartData());

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'gray-100' }}>
      <Navbar />
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 2, md: 4 }, py: 3 }}>

        <Weather/>

        <SolarCalculator/>

        {/* Full-width form */}
        {/* <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 4,
            background: '#ffffff',
            mb: 4,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 900 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Enter Weather Conditions
            </Typography>
            <PredictionForm />
          </Box>
        </Paper> */}


        {/* Cards section */}
        {/* <Grid container spacing={3} mb={6}>
          <Grid item xs={12} md={6} sx={{ width: '49%' }} >
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center',
                borderRadius: 4,
                background: 'linear-gradient(to right, #fef3c7, #fde68a)',
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                Predicted Solar Output
              </Typography>
              <Typography variant="h2" color="primary" fontWeight={700}>
                500
              </Typography>
              <Typography variant="subtitle1" mt={2}>
                Based on:
              </Typography>
              <Typography>☀️ {solarIrradiance || '--'} W/m²</Typography>
              <Typography>🌡 {temperature || '--'} °C</Typography>
              <Typography>☁️ {cloudCover || '--'}%</Typography>
              <Typography>⏰ {hour ? `${hour}:00` : '--:00'}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} sx={{ width: '48%' }}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center',
                borderRadius: 4,
                background: 'linear-gradient(to right, #d1fae5, #6ee7b7)',
              }}
            >
              <Typography variant="h6" fontWeight={700} gutterBottom>
                🌍 Environmental Benefits
              </Typography>
              <Typography sx={{ my: 1 }}>
                🌱 CO₂ Reduction: <strong>1.2 kg</strong>
              </Typography>
              <Typography sx={{ my: 1 }}>
                🌳 Trees Saved: <strong>0.5 trees</strong>
              </Typography>
              <Typography sx={{ my: 1 }}>
                ⚡ Fossil Fuel Offset: <strong>0.8 L</strong>
              </Typography>
            </Paper>
          </Grid>
        </Grid> */}

        {/* Chart section */}
        {/* <Paper
          elevation={3}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            height: 400,
            width: '100%',
            bgcolor: '#ffffff',
          }}
        >
          <Typography variant="h6" fontWeight={700} mb={2}>
            Output Prediction for the Day (24 hrs)
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis
                label={{ value: 'kWh', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="output"
                stroke="#14b8a6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper> */}
      </Box>
    </Box>

  );
}
