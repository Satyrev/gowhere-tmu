import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Classroom, getAllClassrooms, searchClassrooms } from '../services/api';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import './ClassroomSearch.css';

interface ClassroomSearchProps {
  onClassroomSelect: (classroom: Classroom) => void;
  savedClassrooms: Classroom[];
  onSaveClassroom: (classroom: Classroom) => void;
  onRemoveSavedClassroom: (classroomId: string) => void;
}

const ClassroomSearch: React.FC<ClassroomSearchProps> = ({ 
  onClassroomSelect, 
  savedClassrooms,
  onSaveClassroom,
  onRemoveSavedClassroom
}) => {
  const [search, setSearch] = useState('');
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [filteredClassrooms, setFilteredClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
            setSearch(cleanText);
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

  const toggleVoiceRecognition = async () => {
    if (!recognizerRef.current) {
      setError('Speech recognition not initialized');
      return;
    }

    try {
      if (isListening) {
        await recognizerRef.current.stopContinuousRecognitionAsync();
      } else {
        setError(null);
        await recognizerRef.current.startContinuousRecognitionAsync();
      }
      setIsListening(!isListening);
    } catch (err) {
      console.error('Error toggling speech recognition:', err);
      setError('Failed to toggle speech recognition');
      setIsListening(false);
    }
  };

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllClassrooms();
        setClassrooms(data);
        setFilteredClassrooms(data);
      } catch (err) {
        console.error('Failed to fetch classrooms:', err);
        setError('Failed to load classrooms. Please try again later.');
        setClassrooms(fallbackClassrooms);
        setFilteredClassrooms(fallbackClassrooms);
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, []);

  const normalizeSearchTerm = (term: string): string => {
    return term.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const matchesSearch = (classroom: Classroom, searchTerm: string): boolean => {
    const normalizedSearch = normalizeSearchTerm(searchTerm);
    
    const normalizedId = normalizeSearchTerm(classroom.id);
    const normalizedBuilding = classroom.building ? normalizeSearchTerm(classroom.building) : '';
    
    const searchParts = normalizedSearch.split(/\s+/);
    
    return searchParts.every(part => 
      normalizedId.includes(part) || 
      normalizedBuilding.includes(part)
    );
  };

  useEffect(() => {
    if (search.trim() === '') {
      const allClassrooms = [...savedClassrooms, ...classrooms.filter(c => !savedClassrooms.some(sc => sc.id === c.id))];
      setFilteredClassrooms(allClassrooms);
    } else {
      const performSearch = async () => {
        try {
          setLoading(true);
          const data = await searchClassrooms(search);
          const sortedData = [...data].sort((a, b) => {
            const aSaved = savedClassrooms.some(sc => sc.id === a.id);
            const bSaved = savedClassrooms.some(sc => sc.id === b.id);
            return bSaved ? 1 : aSaved ? -1 : 0;
          });
          setFilteredClassrooms(sortedData);
        } catch (err) {
          console.error('Search failed:', err);
          const filtered = classrooms.filter(classroom => 
            matchesSearch(classroom, search)
          );
          const sortedFiltered = [...filtered].sort((a, b) => {
            const aSaved = savedClassrooms.some(sc => sc.id === a.id);
            const bSaved = savedClassrooms.some(sc => sc.id === b.id);
            return bSaved ? 1 : aSaved ? -1 : 0;
          });
          setFilteredClassrooms(sortedFiltered);
        } finally {
          setLoading(false);
        }
      };

      const searchTimeout = setTimeout(() => {
        performSearch();
      }, 300);

      return () => clearTimeout(searchTimeout);
    }
  }, [search, classrooms, savedClassrooms]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setSearch(e.target.value);
  };

  const handleClassroomClick = (e: React.MouseEvent, classroom: Classroom) => {
    e.stopPropagation();
    onClassroomSelect(classroom);
  };

  const fallbackClassrooms: Classroom[] = [
    {
      id: 'KHE-123',
      coordinates: [43.65196973085074, -79.37990394697654],
      building: 'Kerr Hall East',
      floor: 1
    },
    {
      id: 'KHE-321',
      coordinates: [43.65196973085074, -79.37990394697654],
      building: 'Kerr Hall East',
      floor: 3
    },
    {
      id: 'ENG-101',
      coordinates: [43.65897, -79.37834],
      building: 'Engineering Building',
      floor: 1
    },
    {
      id: 'ENG-202',
      coordinates: [43.65897, -79.37834],
      building: 'Engineering Building',
      floor: 2
    },
    {
      id: 'RCC-201',
      coordinates: [43.65834, -79.38189],
      building: 'Rogers Communications Centre',
      floor: 2
    },
    {
      id: 'RCC-301',
      coordinates: [43.65834, -79.38189],
      building: 'Rogers Communications Centre',
      floor: 3
    }
  ];

  return (
    <div className="classroom-search">
      <div className="search-input-container">
        <input
          type="text"
          value={search}
          onChange={handleInputChange}
          placeholder="Search classrooms..."
          className="search-input"
        />
        <button
          className={`voice-input-btn ${isListening ? 'listening' : ''}`}
          onClick={toggleVoiceRecognition}
          title={isListening ? "Stop voice input" : "Start voice input"}
        >
          🎤
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="classroom-list">
          {filteredClassrooms.map((classroom) => (
            <motion.div
              key={classroom.id}
              className={`classroom-item ${savedClassrooms.some(sc => sc.id === classroom.id) ? 'saved' : ''}`}
              onClick={(e) => handleClassroomClick(e, classroom)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="classroom-info">
                <div className="classroom-id">{classroom.id}</div>
                {classroom.building && (
                  <div className="classroom-building">{classroom.building}</div>
                )}
              </div>
              <button
                className={`save-btn ${savedClassrooms.some(sc => sc.id === classroom.id) ? 'saved' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (savedClassrooms.some(sc => sc.id === classroom.id)) {
                    onRemoveSavedClassroom(classroom.id);
                  } else {
                    onSaveClassroom(classroom);
                  }
                }}
                title={savedClassrooms.some(sc => sc.id === classroom.id) ? "Remove from favorites" : "Add to favorites"}
              >
                {savedClassrooms.some(sc => sc.id === classroom.id) ? '★' : '☆'}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassroomSearch; 