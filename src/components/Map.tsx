import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Classroom } from '../services/api';

mapboxgl.accessToken = 'YOUR_TOKEN';

interface MapProps {
  center: [number, number];
  zoom: number;
  userLocation?: [number, number];
  selectedClassroom?: Classroom;
  onLocationSelect?: (coordinates: [number, number]) => void;
  isControlsVisible?: boolean;
  shouldUpdate?: boolean;
}

const Map: React.FC<MapProps> = ({ 
  center, 
  zoom, 
  userLocation, 
  selectedClassroom, 
  onLocationSelect,
  isControlsVisible = true,
  shouldUpdate = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const classroomMarker = useRef<mapboxgl.Marker | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const routeLayer = useRef<mapboxgl.GeoJSONSource | null>(null);
  const clickMarker = useRef<mapboxgl.Marker | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const centerRef = useRef(center);
  const zoomRef = useRef(zoom);
  const controlsRef = useRef(isControlsVisible);

  useEffect(() => {
    centerRef.current = center;
    zoomRef.current = zoom;
    controlsRef.current = isControlsVisible;
  }, [center, zoom, isControlsVisible]);

  const fetchRoute = async (start: [number, number], end: [number, number]) => {
    try {
      setRouteError(null);
      console.log('Fetching route from:', start, 'to:', end);
      
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${start[1]},${start[0]};${end[1]},${end[0]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch route');
      }

      const data = await response.json();
      console.log('Route response:', data);
      
      if (data.routes && data.routes[0]) {
        return data.routes[0].geometry;
      }
      throw new Error('No route found');
    } catch (error) {
      console.error('Error fetching route:', error);
      setRouteError(error instanceof Error ? error.message : 'Failed to fetch route');
      return null;
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [center[1], center[0]],
      zoom: zoom,
      attributionControl: false
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }), 'bottom-right');

    map.current.on('load', () => {
      if (!map.current) return;
      
      if (!map.current.getLayer('route')) {
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: []
            }
          }
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#1976d2',
            'line-width': 5,
            'line-opacity': 0.8
          }
        });

        routeLayer.current = map.current.getSource('route') as mapboxgl.GeoJSONSource;
      }
    });

    map.current.on('dblclick', (e) => {
      if (!map.current || !onLocationSelect) return;
      
      // Remove existing click marker
      if (clickMarker.current) {
        clickMarker.current.remove();
      }

      // Add new marker at clicked location
      // clickMarker.current = new mapboxgl.Marker({ color: '#FFA500' })
      //   .setLngLat(e.lngLat.toArray())
      //   .setPopup(new mapboxgl.Popup().setHTML('<h3>Selected Location</h3>'))
      //   .addTo(map.current);

      onLocationSelect([e.lngLat.lat, e.lngLat.lng]);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || !shouldUpdate) return;
    
    console.log('Updating map view with:', center);
    
    map.current.flyTo({
      center: [center[1], center[0]],
      zoom: zoom,
      essential: true,
      duration: 1500,
      padding: isControlsVisible 
        ? { top: 50, bottom: 50, left: 350, right: 50 }
        : { top: 50, bottom: 50, left: 50, right: 50 }
    });
  }, [center, zoom, isControlsVisible, shouldUpdate]);

  useEffect(() => {
    if (!map.current) return;

    if (userLocation) {
      if (userMarker.current) {
        userMarker.current.remove();
      }

      const userMarkerEl = document.createElement('div');
      userMarkerEl.className = 'user-marker';
      userMarkerEl.style.width = '24px';
      userMarkerEl.style.height = '24px';
      userMarkerEl.style.borderRadius = '50%';
      userMarkerEl.style.backgroundColor = '#4CAF50';
      userMarkerEl.style.border = '3px solid white';
      userMarkerEl.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';

      userMarker.current = new mapboxgl.Marker({ element: userMarkerEl })
        .setLngLat([userLocation[1], userLocation[0]])
        .setPopup(new mapboxgl.Popup().setHTML('<h3>Your Location</h3>'))
        .addTo(map.current);
    }

    if (selectedClassroom) {
      if (classroomMarker.current) {
        classroomMarker.current.remove();
      }

      const classroomMarkerEl = document.createElement('div');
      classroomMarkerEl.className = 'classroom-marker';
      classroomMarkerEl.style.width = '24px';
      classroomMarkerEl.style.height = '24px';
      classroomMarkerEl.style.borderRadius = '50%';
      classroomMarkerEl.style.backgroundColor = '#1976d2';
      classroomMarkerEl.style.border = '3px solid white';
      classroomMarkerEl.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';

      classroomMarker.current = new mapboxgl.Marker({ element: classroomMarkerEl })
        .setLngLat([selectedClassroom.coordinates[1], selectedClassroom.coordinates[0]])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${selectedClassroom.id}</h3>`))
        .addTo(map.current);
    }

    if (userLocation && selectedClassroom) {
      console.log('Drawing route between:', userLocation, 'and:', selectedClassroom.coordinates);
      
      fetchRoute(userLocation, selectedClassroom.coordinates).then(geometry => {
        if (!map.current) return;
        
        if (!map.current.getSource('route')) {
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: []
              }
            }
          });

          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#1976d2',
              'line-width': 5,
              'line-opacity': 0.8
            }
          });
        }

        const routeSource = map.current.getSource('route') as mapboxgl.GeoJSONSource;
        if (!routeSource) {
          console.error('Failed to get route source');
          return;
        }
        
        if (geometry) {
          console.log('Setting route data:', geometry);
          const routeData = {
            type: 'Feature' as const,
            properties: {},
            geometry: {
              type: 'LineString' as const,
              coordinates: geometry.coordinates
            }
          };
          console.log('Final route data:', routeData);
          routeSource.setData(routeData);
        } else {
          console.log('Drawing direct line as fallback');
          const directLine = {
            type: 'Feature' as const,
            properties: {},
            geometry: {
              type: 'LineString' as const,
              coordinates: [
                [userLocation[1], userLocation[0]],
                [selectedClassroom.coordinates[1], selectedClassroom.coordinates[0]]
              ]
            }
          };
          routeSource.setData(directLine);
        }
      });

      if (shouldUpdate) {
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([userLocation[1], userLocation[0]]);
        bounds.extend([selectedClassroom.coordinates[1], selectedClassroom.coordinates[0]]);
        
        map.current.fitBounds(bounds, {
          padding: isControlsVisible
            ? { top: 50, bottom: 50, left: 350, right: 50 }
            : { top: 50, bottom: 50, left: 50, right: 50 },
          duration: 1000
        });
      }
    }
  }, [userLocation, selectedClassroom, shouldUpdate, isControlsVisible]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {routeError && (
        <div style={{
          position: 'absolute',
          top: '70px',
          right: '10px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '10px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '14px',
          maxWidth: '300px',
          zIndex: 10
        }}>
          {routeError}
        </div>
      )}
    </div>
  );
};

export default Map;