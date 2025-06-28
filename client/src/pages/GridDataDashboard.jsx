
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FormControl, InputLabel, Select, MenuItem, Box, Typography, Button, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';

const solarPlants = [
  { id: 1, name: 'ACME(Ramnagar)', lat: 24.48, lng: 81.85, capacity: 250, location: 'Rewa, Madhya Pradesh', efficiency: 18.5, station: "ACME(Ramnagar)" },
  { id: 2, name: 'ARINSUN SOLAR', lat: 24, lng: 80, capacity: 250, location: 'Rewa, Madhya Pradesh', efficiency: 17.8, station: "ARINSUN SOLAR (BARSAITADESH)" },
  { id: 3, name: 'NTPC DADRI SOLAR', lat: 28.57, lng: 77.63, capacity: 5, location: 'Dadri, Uttar Pradesh', efficiency: 19.0, station: "DADRI SOLAR" },
  { id: 4, name: 'MAHINDRA SOLAR', lat: 26, lng: 82, capacity: 250, location: 'Badwar, Madhya Pradesh', efficiency: 18.2, station: "MAHINDRA SOLAR (BADWAR)" },
  { id: 5, name: 'UNCHACHAR SOLAR', lat: 25.88, lng: 81.31, capacity: 10, location: 'Unchahar, Gujarat', efficiency: 17.5, station: "UNCHAHAR SOLAR" },
];

const GridDataDashboard = () => {
  const [selectedComponent, setSelectedComponent] = useState('bus_p_results');
  const [selectedStation, setSelectedStation] = useState('');
  const [selectedComponentId, setSelectedComponentId] = useState('');
  const [gridData, setGridData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const componentOptions = [
    { value: 'bus_p_results', label: 'Bus Active Power' },
    { value: 'bus_v_results', label: 'Bus Voltage' },
    { value: 'gen_p_results', label: 'Generator Active Power' },
    { value: 'gen_q_results', label: 'Generator Reactive Power' },
    { value: 'line_results', label: 'Line Flows' }
  ];

  // Fetch data from backend using POST
  const fetchData = async () => {
    if (!selectedStation) {
      setError('Please select a station');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('http://localhost:5000/optimize_grid', { station: selectedStation });
      setGridData(response.data);
      setSelectedComponentId(''); // Reset component ID selection on new data fetch
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch data from the server');
      setLoading(false);
    }
  };

  // Get available component IDs based on selected component and grid data
  const getComponentIdOptions = () => {
    if (!gridData || !gridData[selectedComponent]) return [];
    return Object.keys(gridData[selectedComponent]).map(id => ({
      value: id,
      label: selectedComponent.includes('gen') ? `Generator ${id}` : selectedComponent.includes('line') ? `Line ${id}` : `Bus ${id}`
    }));
  };

  // Prepare data for Recharts
  const prepareChartData = (data) => {
    if (!data || !selectedComponentId) return [];
    const hours = Array.from({ length: 24 }, (_, i) => i.toString());
    return [{
      name: selectedComponent.includes('gen') ? `Generator ${selectedComponentId}` : selectedComponent.includes('line') ? `Line ${selectedComponentId}` : `Bus ${selectedComponentId}`,
      data: hours.map((hour) => ({
        hour,
        value: data[selectedComponentId][hour]
      }))
    }];
  };

  // Determine chart configuration
  const getChartConfig = () => {
    switch (selectedComponent) {
      case 'bus_p_results':
        return { title: 'Bus Active Power Over Time', unit: 'MW' };
      case 'bus_v_results':
        return { title: 'Bus Voltage Over Time', unit: 'p.u.' };
      case 'gen_p_results':
        return { title: 'Generator Active Power Over Time', unit: 'MW' };
      case 'gen_q_results':
        return { title: 'Generator Reactive Power Over Time', unit: 'MVar' };
      case 'line_results':
        return { title: 'Line Flows Over Time', unit: 'MW' };
      default:
        return { title: '', unit: '' };
    }
  };

  const componentIdOptions = getComponentIdOptions();
  const chartData = gridData ? prepareChartData(gridData[selectedComponent]) : [];
  const { title, unit } = getChartConfig();
  const colors = ['#8884d8'];

  // Reset component ID when component changes
  useEffect(() => {
    setSelectedComponentId('');
  }, [selectedComponent]);

  return (
    <Box className=" bg-gray-100 min-h-screen">
        <Navbar />
      <Typography variant="h4" className="text-center mb-6 text-gray-800">
        Grid Component Data Visualization
      </Typography>

      <Box className="flex justify-center mt-10 mb-8 gap-4 w-[1200px] mx-auto">
        <FormControl className="w-64">
          <InputLabel id="component-select-label">Select Component</InputLabel>
          <Select
            labelId="component-select-label"
            value={selectedComponent}
            label="Select Component"
            onChange={(e) => setSelectedComponent(e.target.value)}
            className="bg-white"
          >
            {componentOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl className="w-64">
          <InputLabel id="station-select-label">Select Station</InputLabel>
          <Select
            labelId="station-select-label"
            value={selectedStation}
            label="Select Station"
            onChange={(e) => setSelectedStation(e.target.value)}
            className="bg-white"
          >
            <MenuItem value="">
              <em>Select a station</em>
            </MenuItem>
            {solarPlants.map((plant) => (
              <MenuItem key={plant.id} value={plant.station}>
                {plant.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl className="w-64" disabled={!gridData}>
          <InputLabel id="component-id-select-label">Select ID</InputLabel>
          <Select
            labelId="component-id-select-label"
            value={selectedComponentId}
            label="Select ID"
            onChange={(e) => setSelectedComponentId(e.target.value)}
            className="bg-white"
          >
            <MenuItem value="">
              <em>Select an ID</em>
            </MenuItem>
            {componentIdOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          onClick={fetchData}
          disabled={loading || !selectedStation}
          className="h-14"
        >
          Fetch Data
        </Button>
      </Box>

      {loading && (
        <Box className="flex justify-center items-center">
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Box className="flex justify-center items-center">
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Box>
      )}

      {gridData && !loading && !error && !selectedComponentId && (
        <Box className="flex justify-center items-center">
          <Typography variant="h6" className="text-gray-700">
            Please select a component ID to view the data
          </Typography>
        </Box>
      )}

      {gridData && !loading && !error && selectedComponentId && (
        <Box className="bg-white p-6 rounded-lg shadow-lg w-[1200px] mx-auto">
          <Typography variant="h5" className="mb-4 text-gray-700">
            {title} - {solarPlants.find(plant => plant.station === selectedStation)?.name} - {componentIdOptions.find(option => option.value === selectedComponentId)?.label}
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="hour"
                label={{ value: 'Hour', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                label={{ value: unit, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend />
              {chartData.map((component, index) => (
                <Line
                  key={component.name}
                  type="monotone"
                  dataKey="value"
                  data={component.data}
                  name={component.name}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
};

export default GridDataDashboard;