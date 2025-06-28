import React, { useState } from 'react';
import {
  Box, TextField, Button, Grid, Typography, MenuItem, Select,
  InputLabel, FormControl, Modal, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

function SolarCalculator() {
  const [formData, setFormData] = useState({
    irradiance: '',
    efficiency: '',
    moduleArea: '',
    moduleCount: '',
    performanceRatio: '',
    timePeriod: 'day',
    unitsGenerated: '',
  });

  const [result, setResult] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [applianceData, setApplianceData] = useState([
    { name: 'Bulb', quantity: '', wattage: '10', usageTime: '4', timeUnit: 'hours' },
    { name: 'Fan', quantity: '', wattage: '75', usageTime: '8', timeUnit: 'hours' },
    { name: 'Fridge', quantity: '', wattage: '150', usageTime: '24', timeUnit: 'hours' },
    { name: 'AC', quantity: '', wattage: '1500', usageTime: '6', timeUnit: 'hours' },
    { name: 'Oven', quantity: '', wattage: '2000', usageTime: '1', timeUnit: 'hours' },
    { name: 'Induction', quantity: '', wattage: '1800', usageTime: '1', timeUnit: 'hours' },
    { name: 'Geyser', quantity: '', wattage: '2000', usageTime: '1', timeUnit: 'hours' },
    { name: 'TV', quantity: '', wattage: '100', usageTime: '4', timeUnit: 'hours' },
  ]);
  const [customAppliances, setCustomAppliances] = useState([]);
  const [applianceReport, setApplianceReport] = useState(null);
  const [modalTimePeriod, setModalTimePeriod] = useState(formData.timePeriod);

  const handleChangeInput = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleTimePeriodChange = (e) => setFormData({ ...formData, timePeriod: e.target.value });
  const handleModalTimePeriodChange = (e) => setModalTimePeriod(e.target.value);

  const handleApplianceChange = (listSetter, list, index, field, value) => {
    const updated = [...list];
    updated[index][field] = value;
    listSetter(updated);
  };

  const addCustomAppliance = () => {
    setCustomAppliances([...customAppliances, {
      name: '', quantity: '', wattage: '', usageTime: '', timeUnit: 'hours'
    }]);
  };

  const removeCustomAppliance = (index) => {
    const updated = [...customAppliances];
    updated.splice(index, 1);
    setCustomAppliances(updated);
  };

  const calculateUnits = () => {
    let totalUnits = 0;
    const report = [];

    [...applianceData, ...customAppliances].forEach((item) => {
      if (item.quantity && item.wattage && item.usageTime) {
        const qty = parseFloat(item.quantity);
        const watts = parseFloat(item.wattage);
        let hours = parseFloat(item.usageTime);
        if (item.timeUnit === 'minutes') hours /= 60;
        const units = (qty * watts * hours) / 1000;
        totalUnits += units;
        report.push({ ...item, usageTime: `${hours} hours`, units: units.toFixed(2) });
      }
    });

    const multiplier = modalTimePeriod === 'week' ? 7 : modalTimePeriod === 'month' ? 30 : 1;
    totalUnits *= multiplier;

    setFormData({ ...formData, unitsGenerated: totalUnits.toFixed(2), timePeriod: modalTimePeriod });
    setApplianceReport(report);
    setOpenModal(false);
  };

  const calculateMissingValue = (data) => {
    let { irradiance, efficiency, moduleArea, moduleCount, performanceRatio, timePeriod, unitsGenerated } = data;
    const eff = parseFloat(efficiency) / 100;
    const pr = parseFloat(performanceRatio) / 100;
    let units = parseFloat(unitsGenerated);
    let area = parseFloat(moduleArea);
    let count = parseFloat(moduleCount);

    let timeMultiplier = 1;
    if (timePeriod === 'week') timeMultiplier = 7;
    else if (timePeriod === 'month') timeMultiplier = 30;

    if (!unitsGenerated) {
      units = parseFloat(irradiance) * eff * area * count * pr * timeMultiplier;
      return { ...data, unitsGenerated: units.toFixed(2) };
    } else if (!moduleCount) {
      count = units / (parseFloat(irradiance) * eff * area * pr * timeMultiplier);
      return { ...data, moduleCount: Math.ceil(count) };
    } else if (!moduleArea) {
      area = units / (parseFloat(irradiance) * eff * count * pr * timeMultiplier);
      return { ...data, moduleArea: area.toFixed(2) };
    }
    return data;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const missingCount = [!formData.unitsGenerated, !formData.moduleCount, !formData.moduleArea].filter(Boolean).length;
    if (missingCount !== 1) {
      alert('Leave exactly ONE field empty (Units, Module Count, or Module Area)');
      return;
    }
    const calculated = calculateMissingValue(formData);
    const landArea = calculated.moduleCount * calculated.moduleArea * 1.3;
    setResult({ ...calculated, landArea: landArea.toFixed(2) });
  };

  return (
    <Box sx={{ p: 4, maxWidth: '1200px', mx: 'auto', backgroundColor: '#fff', borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
        Solar Energy Calculator
      </Typography>

      {/* Form Section */}
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField label="Irradiance (kWh/m²/day)" name="irradiance" value={formData.irradiance} onChange={handleChangeInput} required fullWidth type="number" />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Efficiency (%)" name="efficiency" value={formData.efficiency} onChange={handleChangeInput} required fullWidth type="number" />
          </Grid>
          <Grid item xs={12} md={4}>
            <Tooltip title="Leave empty to calculate this">
              <TextField label="Module Area (m²)" name="moduleArea" value={formData.moduleArea} onChange={handleChangeInput} fullWidth type="number" />
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={4}>
            <Tooltip title="Leave empty to calculate this">
              <TextField label="Module Count" name="moduleCount" value={formData.moduleCount} onChange={handleChangeInput} fullWidth type="number" />
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Performance Ratio (%)" name="performanceRatio" value={formData.performanceRatio} onChange={handleChangeInput} required fullWidth type="number" />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" gap={1} alignItems="center">
              <Tooltip title="Leave empty to calculate this">
                <TextField label="Units Generated (kWh)" name="unitsGenerated" value={formData.unitsGenerated} onChange={handleChangeInput} fullWidth type="number" sx={{ height: '56px' }} />
              </Tooltip>
              <Button variant="outlined" onClick={() => setOpenModal(true)} sx={{
                height: '56px',
                minWidth: '110px',
                whiteSpace: 'nowrap',
                fontWeight: 600,
              }}>Calculate</Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="time-period-label">Time Period</InputLabel>
              <Select
                labelId="time-period-label"
                value={formData.timePeriod}
                label="Time Period"
                onChange={handleTimePeriodChange}
              >
                <MenuItem value="day">Day</MenuItem>
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button type="submit" variant="contained" fullWidth sx={{ py: 1.5 }}>Calculate</Button>
          </Grid>
        </Grid>
      </Box>

      {/* Modal for Appliance Inputs */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, width: '90%', maxWidth: 1000, maxHeight: '90vh', overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom>Appliance Energy Usage</Typography>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="modal-time-period">Time Period</InputLabel>
            <Select labelId="modal-time-period" value={modalTimePeriod} label="Time Period" onChange={handleModalTimePeriodChange}>
              <MenuItem value="day">Day</MenuItem>
              <MenuItem value="week">Week</MenuItem>
              <MenuItem value="month">Month</MenuItem>
            </Select>
          </FormControl>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Appliance</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Wattage (W)</TableCell>
                <TableCell>Usage Time</TableCell>
                <TableCell>Time Unit</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {[...applianceData, ...customAppliances].map((item, idx) => {
                const isCustom = idx >= applianceData.length;
                const list = isCustom ? customAppliances : applianceData;
                const listSetter = isCustom ? setCustomAppliances : setApplianceData;
                const index = isCustom ? idx - applianceData.length : idx;

                return (
                  <TableRow key={idx}>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={item.name}
                        onChange={(e) => handleApplianceChange(listSetter, list, index, 'name', e.target.value)}
                        disabled={!isCustom}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField type="number" value={item.quantity} onChange={(e) => handleApplianceChange(listSetter, list, index, 'quantity', e.target.value)} fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField type="number" value={item.wattage} onChange={(e) => handleApplianceChange(listSetter, list, index, 'wattage', e.target.value)} fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField type="number" value={item.usageTime} onChange={(e) => handleApplianceChange(listSetter, list, index, 'usageTime', e.target.value)} fullWidth />
                    </TableCell>
                    <TableCell>
                      <Select value={item.timeUnit} onChange={(e) => handleApplianceChange(listSetter, list, index, 'timeUnit', e.target.value)} fullWidth>
                        <MenuItem value="minutes">Minutes</MenuItem>
                        <MenuItem value="hours">Hours</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {isCustom && (
                        <IconButton onClick={() => removeCustomAppliance(index)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <Button variant="outlined" startIcon={<AddIcon />} onClick={addCustomAppliance} sx={{ my: 2 }}>
            Add Custom Appliance
          </Button>

          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button onClick={() => setOpenModal(false)} sx={{ mr: 2 }}>Cancel</Button>
            <Button onClick={calculateUnits} variant="contained">Calculate Units</Button>
          </Box>
        </Box>
      </Modal>

      {/* Results Section */}
      {result && (
        <Box mt={6} p={3} bgcolor="#f9f9f9" borderRadius={2}>
          <Typography variant="h6" gutterBottom>Results</Typography>
          <Typography>Units Generated: {result.unitsGenerated} kWh/{result.timePeriod}</Typography>
          <Typography>Module Count: {result.moduleCount}</Typography>
          <Typography>Module Area: {result.moduleArea} m²</Typography>
          <Typography>Estimated Land Area: {result.landArea} m²</Typography>

          {applianceReport?.length > 0 && (
            <Box mt={4}>
              <Typography variant="subtitle1" gutterBottom>Appliance Usage Report</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Appliance</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Wattage</TableCell>
                    <TableCell>Usage</TableCell>
                    <TableCell>Units (kWh)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applianceReport.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.wattage}</TableCell>
                      <TableCell>{item.usageTime}</TableCell>
                      <TableCell>{item.units}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export default SolarCalculator;
