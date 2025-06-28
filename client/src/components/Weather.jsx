import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Paper
} from '@mui/material';
import {
  WbSunny,
  NightlightRound,
  Cloud,
  Umbrella,
  FlashOn,
  AcUnit,
  Thermostat,
  Water,
  Air,
  CloudQueue
} from '@mui/icons-material';
import axios from 'axios';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState('');
  const [manualLocation, setManualLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_KEY = '9c76fa4754416d89b768ba0018528871';
  const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
  const GEOCODE_API_URL = 'https://api.openweathermap.org/geo/1.0/direct';

  const getWeatherIcon = (iconCode) => {
    const iconMap = {
      '01d': <WbSunny sx={{ color: 'orange', mr: 1 }} />,
      '01n': <NightlightRound sx={{ color: '#90caf9', mr: 1 }} />,
      '02d': <Cloud sx={{ color: '#757575', mr: 1 }} />,
      '02n': <Cloud sx={{ color: '#757575', mr: 1 }} />,
      '03d': <Cloud sx={{ color: '#757575', mr: 1 }} />,
      '03n': <Cloud sx={{ color: '#757575', mr: 1 }} />,
      '04d': <Cloud sx={{ color: '#757575', mr: 1 }} />,
      '04n': <Cloud sx={{ color: '#757575', mr: 1 }} />,
      '09d': <Umbrella sx={{ color: '#42a5f5', mr: 1 }} />,
      '09n': <Umbrella sx={{ color: '#42a5f5', mr: 1 }} />,
      '10d': <Umbrella sx={{ color: '#42a5f5', mr: 1 }} />,
      '10n': <Umbrella sx={{ color: '#42a5f5', mr: 1 }} />,
      '11d': <FlashOn sx={{ color: '#ffb300', mr: 1 }} />,
      '11n': <FlashOn sx={{ color: '#ffb300', mr: 1 }} />,
      '13d': <AcUnit sx={{ color: '#81d4fa', mr: 1 }} />,
      '13n': <AcUnit sx={{ color: '#81d4fa', mr: 1 }} />,
      '50d': <Cloud sx={{ color: '#9e9e9e', mr: 1 }} />,
      '50n': <Cloud sx={{ color: '#9e9e9e', mr: 1 }} />,
    };
    return iconMap[iconCode] || <Cloud sx={{ color: '#757575', mr: 1 }} />;
  };

  const formatTime = (unixTimestamp, timezoneOffset) => {
    const date = new Date((unixTimestamp + timezoneOffset) * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    });
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(WEATHER_API_URL, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric',
        },
      });
      setWeatherData(response.data);
      setLocation(response.data.name);
    } catch {
      setError('Failed to fetch weather data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoordsByCity = async (city) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(GEOCODE_API_URL, {
        params: {
          q: city,
          limit: 1,
          appid: API_KEY,
        },
      });
      if (response.data.length > 0) {
        const { lat, lon, name } = response.data[0];
        setLocation(name);
        await fetchWeatherByCoords(lat, lon);
      } else {
        setError('City not found.');
        setLoading(false);
      }
    } catch {
      setError('Failed to fetch location.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        () => setError('Failed to get location. Enter city manually.')
      );
    } else {
      setError('Geolocation not supported.');
    }
  }, []);

  const handleLocationSubmit = () => {
    if (manualLocation.trim()) {
      fetchCoordsByCity(manualLocation.trim());
    } else {
      setError('Please enter a city.');
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      <Paper elevation={0} sx={{ p: 3.5 }}>
        {/* Top Row: Location and Search */}
        <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
          {/* Location & Weather Description */}
          <Grid item xs={12} md={8}>
            <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
              <Typography variant="h5" sx={{ fontWeight: 500 }}>
                {location || 'Your Location'}
              </Typography>

              {weatherData && (
                <Box
                  display="flex"
                  alignItems="center"
                  sx={{
                    cursor: 'pointer',
                    transition: '0.2s ease',
                    textDecoration: 'underline',
                    '&:hover .hover-desc': {
                      textDecoration: 'underline',
                    //   backgroundColor: 'rgba(0,0,0,0.03)',
                    },
                  }}
                >
                  {getWeatherIcon(weatherData.weather[0].icon)}
                  <Typography className="hover-desc" variant="body1" sx={{ px: 0.5 }}>
                    {weatherData.weather[0].description}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Search Field */}
          <Grid item xs={12} md={4}>
            <Box
              display="flex"
              gap={1}
              sx={{
                flexDirection: { xs: 'column', sm: 'row' },
                width: '100%',
              }}
            >
              <TextField
                label="Enter city"
                variant="outlined"
                size="small"
                fullWidth
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={handleLocationSubmit}
                sx={{
                  px: 3,
                  fontWeight: 600,
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  },
                }}
              >
                Search
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        {/* Weather Info */}
        {weatherData && !loading && (
          <Grid container spacing={3} mt={4}>
            {[
              {
                icon: <Thermostat color="error" />,
                label: `Temp: ${weatherData.main.temp}°C`
              },
              {
                icon: <Water color="primary" />,
                label: `Humidity: ${weatherData.main.humidity}%`
              },
              {
                icon: <CloudQueue color="action" />,
                label: `Clouds: ${weatherData.clouds.all}%`
              },
              {
                icon: <Air color="action" />,
                label: `Wind: ${weatherData.wind.speed} m/s`
              },
              {
                icon: <WbSunny sx={{ color: 'orange' }} />,
                label: `Sunrise: ${formatTime(weatherData.sys.sunrise, weatherData.timezone)}`
              },
              {
                icon: <NightlightRound sx={{ color: '#90caf9' }} />,
                label: `Sunset: ${formatTime(weatherData.sys.sunset, weatherData.timezone)}`
              },
              {
                icon: <Umbrella sx={{ color: '#1e88e5' }} />,
                label: `Precipitation: ${
                  weatherData.rain ? `${weatherData.rain['1h'] || 0} mm` : '0 mm'
                }`
              }
            ].map((item, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Box
                  display="flex"
                  alignItems="center"
                  sx={{
                    transition: '0.2s',
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    //   textDecoration: 'underline',
                    },
                  }}
                >
                  {item.icon}
                  <Typography sx={{ ml: 1 }}>{item.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default Weather;
