import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';

import LocationPredict from './pages/LocationPredict.jsx';
import TestMap from './pages/TestMap.jsx';
import RevenueForecast from './pages/RevenueForecast.jsx';
import Predict from './pages/predict.jsx';
import Optimization from './pages/Optimization.jsx';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/predict' element={<Predict />} />
        <Route path="/plant-predict" element={<LocationPredict />} />
        <Route path="/test-map" element={<TestMap />} />
        <Route path="/revenue" element={<RevenueForecast />} />
        <Route path="/optimization" element={<Optimization />} />
      </Routes>
    </div>
  );
}

export default App;