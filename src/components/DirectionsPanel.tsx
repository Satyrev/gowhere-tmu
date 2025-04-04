import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import { Classroom } from '../services/api';

interface DirectionsPanelProps {
  userLocation: [number, number];
  selectedClassroom: Classroom;
}

interface RouteStep {
  distance: number;
  instruction: string;
  maneuver?: string;
}

const DirectionsPanel: React.FC<DirectionsPanelProps> = ({ userLocation, selectedClassroom }) => {
  const [steps, setSteps] = useState<RouteStep[]>([]);
  const [totalDistance, setTotalDistance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const stepsRef = useRef<RouteStep[]>([]);
  const [showProximityAlert, setShowProximityAlert] = useState(false);

  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const voices = speechSynthesisRef.current?.getVoices() || [];
        setAvailableVoices(voices);
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
      };
      
      speechSynthesisRef.current.addEventListener('voiceschanged', loadVoices);
      
      loadVoices();
      
      return () => {
        speechSynthesisRef.current?.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  const speakDirections = () => {
    if (!speechSynthesisRef.current || !selectedClassroom || stepsRef.current.length === 0) {
      setError('Cannot speak directions: No route available');
      return;
    }

    try {
      if (isSpeaking) {
        speechSynthesisRef.current.cancel();
      }
      
      setError(null);

      const text = `Directions to ${selectedClassroom.id}. ` +
        (totalDistance ? `Total distance: ${formatDistance(totalDistance)}. ` : '') +
        stepsRef.current.map((step, index) => 
          `Step ${index + 1}: ${step.instruction}. Distance: ${formatDistance(step.distance)}.`
        ).join(' ');

      const utterance = new SpeechSynthesisUtterance(text);
      
      const englishVoice = availableVoices.find(voice => 
        voice.lang.startsWith('en') && !voice.name.includes('Google')
      ) || availableVoices.find(voice => 
        voice.lang.startsWith('en')
      );
      
      if (englishVoice) {
        console.log(`Using voice: ${englishVoice.name} (${englishVoice.lang})`);
        utterance.voice = englishVoice;
      } else {
        console.log('No English voice found, using default voice');
      }
      
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utteranceRef.current = utterance;

      utterance.onstart = () => {
        console.log('Speech started');
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        console.log('Speech ended normally');
        setIsSpeaking(false);
        utteranceRef.current = null;
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error, event);
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      speechSynthesisRef.current.speak(utterance);
    } catch (err) {
      console.error('Error in speech synthesis:', err);
      setError('Speech synthesis failed. Please try again.');
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    try {
      if (speechSynthesisRef.current) {
        console.log('Stopping speech');
        speechSynthesisRef.current.cancel();
        utteranceRef.current = null;
        setIsSpeaking(false);
      }
    } catch (err) {
      console.error('Error stopping speech:', err);
      setIsSpeaking(false);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakDirections();
    }
  };

  useEffect(() => {
    const fetchDirections = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/walking/${userLocation[1]},${userLocation[0]};${selectedClassroom.coordinates[1]},${selectedClassroom.coordinates[0]}?` +
          `geometries=geojson&` +
          `steps=true&` +
          `access_token=${mapboxgl.accessToken}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch directions');
        }

        const data = await response.json();
        
        if (data.routes && data.routes[0]) {
          const route = data.routes[0];
          setTotalDistance(route.distance);
          
          const processedSteps: RouteStep[] = route.legs[0].steps.map((step: any) => ({
            distance: step.distance,
            instruction: step.maneuver.instruction,
            maneuver: step.maneuver.type
          }));
          
          setSteps(processedSteps);
        } else {
          throw new Error('No routes found');
        }
      } catch (err) {
        console.error('Error fetching directions:', err);
        setError('Failed to load directions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDirections();
  }, [userLocation, selectedClassroom]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  useEffect(() => {
    const distance = calculateDistance(
      userLocation[0],
      userLocation[1],
      selectedClassroom.coordinates[0],
      selectedClassroom.coordinates[1]
    );
    
    setShowProximityAlert(distance <= 10);
  }, [userLocation, selectedClassroom]);

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} meters`;
    }
    return `${(meters / 1000).toFixed(1)} kilometers`;
  };

  return (
    <motion.div
      className="directions-panel"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <div className="directions-header">
        <div className="flex justify-between items-center">
          <h3>Directions to {selectedClassroom.id}</h3>
          <button
            onClick={toggleSpeech}
            className={`speech-btn ${isSpeaking ? 'speaking' : ''}`}
            title={isSpeaking ? "Stop speaking" : "Read directions"}
            disabled={isLoading || steps.length === 0}
          >
            {isSpeaking ? '🔇' : '🔊'}
          </button>
        </div>
        {totalDistance && (
          <div className="total-distance">
            Total distance: {formatDistance(totalDistance)}
          </div>
        )}
        {error && (
          <div className="error-banner bg-red-100 text-red-800 p-2 mt-2 rounded">
            {error}
          </div>
        )}
      </div>

      {showProximityAlert && (
        <div className="proximity-alert">
          🎉 You're almost there! You're within 10 meters of your destination.
        </div>
      )}

      {isLoading ? (
        <div className="loading">Loading directions...</div>
      ) : steps.length === 0 && !error ? (
        <div className="no-route">No route available</div>
      ) : (
        <div className="steps-container">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-content">
                <div className="step-instruction">{step.instruction}</div>
                <div className="step-distance">{formatDistance(step.distance)}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default DirectionsPanel;