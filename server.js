const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let isMongoConnected = false;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    isMongoConnected = true;
  })
  .catch(err => {
    console.log('MongoDB connection error:', err);
    console.log('Server will run with in-memory data');
  });

// Define Classroom schema
const classroomSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  coordinates: { type: [Number], required: true },
  building: { type: String },
  floor: { type: Number },
  description: { type: String }
});

// Create Classroom model if MongoDB is connected
let Classroom;
try {
  Classroom = mongoose.model('Classroom');
} catch {
  Classroom = mongoose.model('Classroom', classroomSchema);
}

// In-memory fallback data
const fallbackClassrooms = [
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

// Function to seed the database with initial classroom data
async function seedDatabase() {
  if (!isMongoConnected) return;
  
  try {
    const count = await Classroom.countDocuments();
    if (count === 0) {
      await Classroom.insertMany(fallbackClassrooms);
      console.log('Database seeded with initial data');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// API Routes
// Get all classrooms
app.get('/api/classrooms', async (req, res) => {
  try {
    if (isMongoConnected) {
      const classrooms = await Classroom.find();
      res.json(classrooms);
    } else {
      res.json(fallbackClassrooms);
    }
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get classroom by ID
app.get('/api/classrooms/:id', async (req, res) => {
  try {
    if (isMongoConnected) {
      const classroom = await Classroom.findOne({ id: req.params.id });
      if (!classroom) {
        return res.status(404).json({ message: 'Classroom not found' });
      }
      res.json(classroom);
    } else {
      const classroom = fallbackClassrooms.find(c => c.id === req.params.id);
      if (!classroom) {
        return res.status(404).json({ message: 'Classroom not found' });
      }
      res.json(classroom);
    }
  } catch (error) {
    console.error('Error fetching classroom by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search classrooms
app.get('/api/classrooms/search/:query', async (req, res) => {
  try {
    const query = req.params.query.toUpperCase();
    
    if (isMongoConnected) {
      const classrooms = await Classroom.find({
        id: { $regex: query, $options: 'i' }
      });
      res.json(classrooms);
    } else {
      const filtered = fallbackClassrooms.filter(
        classroom => classroom.id.toUpperCase().includes(query)
      );
      res.json(filtered);
    }
  } catch (error) {
    console.error('Error searching classrooms:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new classroom
app.post('/api/classrooms', async (req, res) => {
  try {
    if (!isMongoConnected) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const newClassroom = new Classroom(req.body);
    await newClassroom.save();
    res.status(201).json(newClassroom);
  } catch (error) {
    console.error('Error adding classroom:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update classroom
app.put('/api/classrooms/:id', async (req, res) => {
  try {
    if (!isMongoConnected) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const classroom = await Classroom.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    res.json(classroom);
  } catch (error) {
    console.error('Error updating classroom:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete classroom
app.delete('/api/classrooms/:id', async (req, res) => {
  try {
    if (!isMongoConnected) {
      return res.status(503).json({ message: 'Database not available' });
    }

    const classroom = await Classroom.findOneAndDelete({ id: req.params.id });

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    res.json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    console.error('Error deleting classroom:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  
  // Try to seed the database
  if (isMongoConnected) {
    seedDatabase();
  }
});

// Handle process termination
process.on('SIGINT', async () => {
  if (isMongoConnected) {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
  process.exit(0);
}); 