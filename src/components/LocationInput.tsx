import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

interface LocationInputProps {
  onLocationSubmit: (coordinates: [number, number]) => void;
}

interface GeocodingResult {
  place_name: string;
  center: [number, number];
  text: string;
}

const LocationInput: React.FC<LocationInputProps> = ({ onLocationSubmit }) => {
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognizerRef = useRef<sdk.SpeechRecognizer | null>(null);
  const audioConfigRef = useRef<sdk.AudioConfig | null>(null);

  useEffect(() => {
    const initializeSpeech = async () => {
      try {
        const speechKey = process.env.REACT_APP_AZURE_SPEECH_KEY;
        const serviceRegion = process.env.REACT_APP_AZURE_SPEECH_REGION;

        if (!speechKey || !serviceRegion) {
          setError('Azure Speech Service credentials not configured');
          return;
        }

        const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, serviceRegion);
        speechConfig.speechRecognitionLanguage = 'en-US';

        audioConfigRef.current = sdk.AudioConfig.fromDefaultMicrophoneInput();
        recognizerRef.current = new sdk.SpeechRecognizer(speechConfig, audioConfigRef.current);

        recognizerRef.current.recognized = (s, e) => {
          if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
            const cleanText = e.result.text.replace(/\./g, '').trim();
            setLocation(cleanText);
            searchLocation(cleanText);
          }
        };

        recognizerRef.current.canceled = (s, e) => {
          console.error(`CANCELED: Reason=${e.reason}`);
          if (e.reason === sdk.CancellationReason.Error) {
            setError(`Speech recognition error: ${e.errorDetails}`);
          }
          setIsListening(false);
        };

        recognizerRef.current.sessionStopped = () => {
          setIsListening(false);
        };

      } catch (err) {
        console.error('Error initializing speech recognition:', err);
        setError('Failed to initialize speech recognition');
      }
    };

    initializeSpeech();

    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stopContinuousRecognitionAsync();
        recognizerRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (location.trim()) {
        searchLocation(location);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [location]);

  const searchLocation = async (query: string) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${mapboxgl.accessToken}&` +
        `country=CA&` +
        `types=address,place,locality,neighborhood&` +
        `limit=5`
      );

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();
      setSuggestions(data.features);
    } catch (err) {
      console.error('Geocoding error:', err);
      setSuggestions([]);
    }
  };

  const handleLocationSelect = (suggestion: GeocodingResult) => {
    onLocationSubmit([suggestion.center[1], suggestion.center[0]]);
    setLocation(suggestion.place_name);
    setShowDropdown(false);
  };

  const toggleVoiceRecognition = async () => {
    if (!recognizerRef.current) {
      setError('Speech recognition not initialized');
      return;
    }

    try {
      if (isListening) {
        await recognizerRef.current.stopContinuousRecognitionAsync();
      } else {
        setError('');
        await recognizerRef.current.startContinuousRecognitionAsync();
      }
      setIsListening(!isListening);
    } catch (err) {
      console.error('Error toggling speech recognition:', err);
      setError('Failed to toggle speech recognition');
      setIsListening(false);
    }
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
        setLocation('Current GPS Location');
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
    <div className="dropdown-container">
      <div className="flex items-center gap-2">
        <button 
          className="btn btn-secondary w-full text-left"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {location || 'Enter your location'}
        </button>
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
      
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            className="dropdown-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Search for a location"
                  className="input-field flex-1"
                  autoFocus
                />
                <button
                  onClick={toggleVoiceRecognition}
                  className={`voice-input-btn ${isListening ? 'listening' : ''}`}
                  title={isListening ? "Stop voice input" : "Start voice input"}
                >
                  🎤
                </button>
              </div>
              
              {isLoading && (
                <div className="p-3 text-gray-500 text-center">
                  Loading...
                </div>
              )}
              
              {error && (
                <div className="p-3 text-red-700 text-center bg-red-50 rounded-md mt-2">
                  {error}
                </div>
              )}
              
              <motion.div 
                className="max-h-60 overflow-y-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      onClick={() => handleLocationSelect(suggestion)}
                      className="p-3 cursor-pointer bg-white hover:bg-blue-50 border-b border-gray-200 transition-colors"
                      whileHover={{ backgroundColor: 'rgba(25, 118, 210, 0.1)' }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="text-sm">{suggestion.place_name}</div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-3 text-gray-500 text-center">
                    No locations found. Try a different search.
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocationInput; 