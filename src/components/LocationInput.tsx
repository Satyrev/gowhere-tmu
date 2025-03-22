import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface LocationInputProps {
  onLocationSubmit: (coordinates: [number, number]) => void;
}

const LocationInput: React.FC<LocationInputProps> = ({ onLocationSubmit }) => {
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`)
      .then(response => response.json())
      .then(data => {
        if (data && data[0]) {
          onLocationSubmit([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          setError('Location not found. Please try again.');
        }
      })
      .catch(err => {
        setError('Error finding location. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      setError('GPS is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    setError('');

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationSubmit([position.coords.latitude, position.coords.longitude]);
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Please allow location access in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable. Please try again.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out. Please try again.');
            break;
          default:
            setError('An unknown error occurred. Please try again.');
        }
      },
      options
    );
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your current location"
            className="input-field"
            disabled={isLoading}
          />
          <motion.button
            type="button"
            onClick={handleGPS}
            className="btn btn-primary"
            disabled={isLoading}
            whileTap={{ scale: 0.95 }}
            title="Use your current GPS location"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="1"></circle>
              <line x1="12" y1="2" x2="12" y2="7"></line>
              <line x1="12" y1="17" x2="12" y2="22"></line>
              <line x1="2" y1="12" x2="7" y2="12"></line>
              <line x1="17" y1="12" x2="22" y2="12"></line>
            </svg>
          </motion.button>
        </div>
        <motion.button
          type="submit"
          className="btn btn-secondary"
          disabled={isLoading}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </motion.button>
      </form>
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-2 bg-red-50 text-red-700 rounded-md text-sm"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
};

export default LocationInput; 