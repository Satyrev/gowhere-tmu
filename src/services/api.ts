const API_URL = 'http://localhost:5000/api';

export interface Classroom {
  id: string;
  coordinates: [number, number];
  building?: string;
  floor?: number;
  description?: string;
}

export const getAllClassrooms = async (): Promise<Classroom[]> => {
  try {
    const response = await fetch(`${API_URL}/classrooms`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    throw error;
  }
};

export const getClassroomById = async (id: string): Promise<Classroom> => {
  try {
    const response = await fetch(`${API_URL}/classrooms/${id}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching classroom with ID ${id}:`, error);
    throw error;
  }
};

export const searchClassrooms = async (query: string): Promise<Classroom[]> => {
  try {
    const response = await fetch(`${API_URL}/classrooms/search/${query}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error searching classrooms with query ${query}:`, error);
    throw error;
  }
};

export const createClassroom = async (classroom: Classroom): Promise<Classroom> => {
  try {
    const response = await fetch(`${API_URL}/classrooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(classroom),
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating classroom:', error);
    throw error;
  }
};

export const updateClassroom = async (id: string, classroom: Partial<Classroom>): Promise<Classroom> => {
  try {
    const response = await fetch(`${API_URL}/classrooms/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(classroom),
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error updating classroom with ID ${id}:`, error);
    throw error;
  }
};

export const deleteClassroom = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/classrooms/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error deleting classroom with ID ${id}:`, error);
    throw error;
  }
}; 