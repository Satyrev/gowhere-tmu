import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Map from './components/Map';
import LocationInput from './components/LocationInput';
import ClassroomSearch from './components/ClassroomSearch';
import { Classroom } from './services/api';
import './App.css';

function App() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [showClassroomDropdown, setShowClassroomDropdown] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([43.6577, -79.3788]);
  const [mapShouldUpdate, setMapShouldUpdate] = useState(true);
  
  const handleLocationSubmit = (coordinates: [number, number]) => {
    setUserLocation(coordinates);
    setMapCenter(coordinates);
    setMapShouldUpdate(true);
  };

  const handleMapLocationSelect = (coordinates: [number, number]) => {
    setUserLocation(coordinates);
    setMapShouldUpdate(true);
  };

  const handleClassroomSelect = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setShowClassroomDropdown(false);
    setMapCenter(classroom.coordinates);
    setMapShouldUpdate(true);
  };

  const toggleClassroomDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowClassroomDropdown(!showClassroomDropdown);
    // Importantly, do NOT set mapShouldUpdate here
  };

  const toggleControls = () => {
    setIsControlsVisible(!isControlsVisible);
    setMapShouldUpdate(true); // Need to update the map when control visibility changes for padding
  };

  useEffect(() => {
    if (mapShouldUpdate) {
      const timer = setTimeout(() => {
        setMapShouldUpdate(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mapShouldUpdate]);

  return (
    <div className="App">
      {/* Full-screen map */}
      <div className="map-container">
        <Map 
          center={mapCenter}
          zoom={15}
          userLocation={userLocation || undefined}
          selectedClassroom={selectedClassroom || undefined}
          onLocationSelect={handleMapLocationSelect}
          isControlsVisible={isControlsVisible}
          shouldUpdate={mapShouldUpdate}
        />
      </div>

      {/* Toggle button for controls */}
      <motion.button 
        className="toggle-controls-btn"
        onClick={toggleControls}
        title={isControlsVisible ? "Hide controls" : "Show controls"}
        animate={{ 
          left: isControlsVisible ? "366px" : "16px",
          rotate: isControlsVisible ? 0 : 180
        }}
        transition={{ duration: 0.3 }}
      >
        ←
      </motion.button>

      {/* Controls overlay */}
      <AnimatePresence>
        {isControlsVisible && (
          <motion.div 
            className="controls-container"
            initial={{ opacity: 0, x: -350 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -350 }}
            transition={{ duration: 0.3 }}
          >
            <div className="control-panel">
              <div className="control-section">
                <h1 className="app-title">GoWhere Campus Navigation</h1>
              </div>
              
              <div className="control-section">
                <h3 className="section-title">Your Location</h3>
                <LocationInput onLocationSubmit={handleLocationSubmit} />
                
                {userLocation && (
                  <motion.div 
                    className="location-display"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div>Latitude: {userLocation[0].toFixed(6)}</div>
                    <div>Longitude: {userLocation[1].toFixed(6)}</div>
                  </motion.div>
                )}
              </div>
              
              <div className="control-section">
                <h3 className="section-title">Destination</h3>
                
                <div className="dropdown-container">
                  <div className="flex items-center gap-2">
                    <button 
                      className="btn btn-secondary w-full text-left"
                      onClick={toggleClassroomDropdown}
                    >
                      {selectedClassroom ? selectedClassroom.id : 'Select Classroom'}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {showClassroomDropdown && (
                      <motion.div
                        className="dropdown-menu"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-2">
                          <ClassroomSearch onClassroomSelect={handleClassroomSelect} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {selectedClassroom && (
                  <motion.div 
                    className="location-display"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div>Classroom: {selectedClassroom.id}</div>
                    <div>Lat: {selectedClassroom.coordinates[0].toFixed(6)}</div>
                    <div>Lng: {selectedClassroom.coordinates[1].toFixed(6)}</div>
                  </motion.div>
                )}
              </div>
              
              <div className="control-section">
                <div className="text-sm text-gray-500">
                  <p>Double-click on the map to set your location</p>
                  {userLocation && selectedClassroom && (
                    <motion.div 
                      className="route-active-indicator"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="route-dot"></div>
                      <p className="text-green-600 font-medium">Route displayed on map</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;