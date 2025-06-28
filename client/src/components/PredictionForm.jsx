import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, TextField, Button, Grid } from '@mui/material';
import { setPredictionData } from '../redux/slices/predictionSlice.js';

function PredictionForm() {
  const dispatch = useDispatch();
  const { solarIrradiance, temperature, cloudCover } = useSelector((state) => state.prediction);
  const [currentHour, setCurrentHour] = useState('');
  const [currentDay, setCurrentDay] = useState('');

  useEffect(() => {
    const now = new Date();
    setCurrentHour(now.getHours());
    setCurrentDay(now.toLocaleString('default', { weekday: 'long' }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      setPredictionData({
        solarIrradiance,
        temperature,
        cloudCover,
        hour: currentHour,
        day: currentDay,
      })
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Solar Irradiance (W/m²)"
            type="number"
            value={solarIrradiance}
            onChange={(e) =>
              dispatch(setPredictionData({ solarIrradiance: e.target.value, temperature, cloudCover }))
            }
            required
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Temperature (°C)"
            type="number"
            value={temperature}
            onChange={(e) =>
              dispatch(setPredictionData({ solarIrradiance, temperature: e.target.value, cloudCover }))
            }
            required
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Cloud Cover (%)"
            type="number"
            value={cloudCover}
            onChange={(e) =>
              dispatch(setPredictionData({ solarIrradiance, temperature, cloudCover: e.target.value }))
            }
            required
          />
        </Grid>

        <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'stretch' }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                backgroundColor: '#1976d2',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#1565c0' },
              }}
          >
            Predict
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PredictionForm;
