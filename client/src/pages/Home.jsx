import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import Navbar from '../components/Navbar';

function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-500 to-green-500 text-white relative">
      <Navbar/>
      {/* GRIDVISION in top left */}
      <div className="absolute top-4 left-4">
        <h1 className="text-3xl md:text-4xl font-bold">GRIDVISION</h1>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center flex-grow text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Solar Energy Prediction</h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl">
          Predict solar energy output using advanced machine learning models. Enter environmental data to get accurate predictions.
        </p>
        <Link to="/plant-predict">
          <Button
            variant="contained"
            color="primary"
            endIcon={<ArrowUpward />}
            className="bg-white text-blue-500 hover:bg-blue-100"
            sx={{ borderRadius: '8px', padding: '10px 24px', fontSize: '1.1rem' }}
          >
            Get Started
          </Button>
        </Link>
      </div>

      {/* Developed by Deeppower in bottom right */}
      <div className="absolute bottom-4 right-4">
        <p className="text-sm md:text-base">Developed by Deeppower</p>
      </div>
    </div>
  );
}

export default Home;