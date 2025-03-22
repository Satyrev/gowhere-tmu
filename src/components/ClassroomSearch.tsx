import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Classroom, getAllClassrooms, searchClassrooms } from '../services/api';

interface ClassroomSearchProps {
  onClassroomSelect: (classroom: Classroom) => void;
}

const ClassroomSearch: React.FC<ClassroomSearchProps> = ({ onClassroomSelect }) => {
  const [search, setSearch] = useState('');
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [filteredClassrooms, setFilteredClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredClassrooms(classrooms);
    } else {
      const performSearch = async () => {
        try {
          setLoading(true);
          const data = await searchClassrooms(search);
          setFilteredClassrooms(data);
        } catch (err) {
          console.error('Search failed:', err);
          const filtered = classrooms.filter(classroom =>
            classroom.id.toLowerCase().includes(search.toLowerCase())
          );
          setFilteredClassrooms(filtered);
        } finally {
          setLoading(false);
        }
      };

      const searchTimeout = setTimeout(() => {
        performSearch();
      }, 300);

      return () => clearTimeout(searchTimeout);
    }
  }, [search, classrooms]);

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
    <div onClick={(e) => e.stopPropagation()}>
      <input
        type="text"
        value={search}
        onChange={handleInputChange}
        placeholder="Search for a classroom"
        className="input-field"
        autoFocus
        onClick={(e) => e.stopPropagation()}
      />
      
      {loading && (
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
        className="max-h-60 overflow-y-auto mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {filteredClassrooms.length > 0 ? (
          filteredClassrooms.map((classroom, index) => (
            <motion.div
              key={classroom.id}
              onClick={(e) => handleClassroomClick(e, classroom)}
              className="p-3 cursor-pointer bg-white hover:bg-blue-50 border-b border-gray-200 transition-colors"
              whileHover={{ backgroundColor: 'rgba(25, 118, 210, 0.1)' }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="font-medium">{classroom.id}</div>
              {classroom.building && (
                <div className="text-sm text-gray-500">{classroom.building} {classroom.floor && `- Floor ${classroom.floor}`}</div>
              )}
              {classroom.description && (
                <div className="text-sm text-gray-500">{classroom.description}</div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="p-3 text-gray-500 text-center">
            No classrooms found. Try a different search.
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ClassroomSearch; 