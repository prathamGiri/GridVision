import { createSlice } from '@reduxjs/toolkit';

const predictionSlice = createSlice({
  name: 'prediction',
  initialState: {
    solarIrradiance: '',
    temperature: '',
    cloudCover: '',
  },
  reducers: {
    setPredictionData: (state, action) => {
      state.solarIrradiance = action.payload.solarIrradiance;
      state.temperature = action.payload.temperature;
      state.cloudCover = action.payload.cloudCover;
    },
  },
});

export const { setPredictionData } = predictionSlice.actions;
export default predictionSlice.reducer;