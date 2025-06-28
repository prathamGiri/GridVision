import { configureStore } from '@reduxjs/toolkit';
import predictionReducer from './slices/predictionSlice.js';

export default configureStore({
  reducer: {
    prediction: predictionReducer,
  },
});