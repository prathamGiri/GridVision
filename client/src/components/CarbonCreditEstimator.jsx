import React, { useState, useEffect } from 'react';
import {
  Card,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Divider,
} from '@mui/material';

const CarbonCreditEstimator = ({ predictedGeneration }) => {
  const [emissionFactor, setEmissionFactor] = useState(0.72); // default kg CO₂/kWh
  const [creditPrice, setCreditPrice] = useState(10); // $/tCO₂e
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmissionFactor = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://api.climatiq.io/data/v1/estimate', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer SMPCGGBBND77Q0K3R15QM8AT98', // Replace with secure key
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emission_factor: {
              activity_id: 'electricity-supply_grid-source_supplier_mix',
              region: 'IN',
              data_version: '22.22',
            },
            parameters: {
              energy: 1,
              energy_unit: 'kWh',
            },
          }),
        });

        const data = await response.json();
        if (data.co2e) {
          setEmissionFactor(data.co2e);
        }
      } catch (err) {
        setError('Could not fetch emission factor. Using default 0.72 kg CO₂/kWh.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmissionFactor();
  }, []);

  const totalGeneration = predictedGeneration.reduce((sum, kwh) => sum + kwh, 0);
  const totalAvoidedEmissionsTonnes = (totalGeneration * emissionFactor) / 1000;
  const totalCredits = totalAvoidedEmissionsTonnes;
  const totalRevenue = totalCredits * creditPrice;

  return (
    <Card className="w-full col-span-1 md:col-span-2 bg-white rounded-xl shadow-lg p-6">
      <Typography variant="h6" fontWeight={700} className="text-gray-800 mb-4">
        Carbon Credit Estimator (India)
      </Typography>

      {loading && (
        <Box className="flex justify-center my-4">
          <CircularProgress size={24} />
        </Box>
      )}

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Box>
          <Typography variant="body2" className="text-gray-700 mb-1">
            Emission Factor (kg CO₂/kWh)
          </Typography>
          <TextField
            type="number"
            value={emissionFactor}
            onChange={(e) => setEmissionFactor(parseFloat(e.target.value))}
            step="0.01"
            fullWidth
            size="small"
            variant="outlined"
            className="bg-gray-50"
            disabled={loading}
          />
        </Box>

        <Box>
          <Typography variant="body2" className="text-gray-700 mb-1">
            Carbon Credit Price ($/tCO₂e)
          </Typography>
          <TextField
            type="number"
            value={creditPrice}
            onChange={(e) => setCreditPrice(parseFloat(e.target.value))}
            step="0.1"
            fullWidth
            size="small"
            variant="outlined"
            className="bg-gray-50"
          />
        </Box>
      </Box>

      <Divider className="mb-4" />

      <Typography variant="h6" fontWeight={600} className="text-gray-800 mb-2">
        Summary
      </Typography>

      <Box className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Box>
          <Typography variant="body2" className="text-gray-600">
            Total Generation
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {totalGeneration.toFixed(2)} kWh
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" className="text-gray-600">
            Avoided Emissions
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {totalAvoidedEmissionsTonnes.toFixed(2)} tCO₂
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" className="text-gray-600">
            Carbon Credits
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {totalCredits.toFixed(2)}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" className="text-gray-600">
            Estimated Revenue
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            ${totalRevenue.toFixed(2)}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default CarbonCreditEstimator;
