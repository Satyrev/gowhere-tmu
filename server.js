const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

const classroomSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  coordinates: { type: [Number], required: true },
  building: { type: String },
  floor: { type: Number },
  description: { type: String }
});

let Classroom;
try {
  Classroom = mongoose.model('Classroom');
} catch {
  Classroom = mongoose.model('Classroom', classroomSchema);
}

const fallbackClassrooms = [
  {
    id: 'KHE-123',
    coordinates: [43.65895544439962, -79.37854820421036],
    building: 'Kerr Hall East',
    floor: 1
  },
  {
    id: 'KHE-321',
    coordinates: [43.65895544439962, -79.37854820421036],
    building: 'Kerr Hall East',
    floor: 3
  },
  {
    id: 'ENG-101',
    coordinates: [43.65757173564517, -79.37721037381903],
    building: 'Engineering Building',
    floor: 1
  },
  {
    id: 'ENG-202',
    coordinates: [43.65757173564517, -79.37721037381903],
    building: 'Engineering Building',
    floor: 2
  },
  {
    id: 'RCC-201',
    coordinates: [43.6587185293533, -79.3769543018029],
    building: 'Rogers Communications Centre',
    floor: 2
  },
  {
    id: 'RCC-301',
    coordinates: [43.6587185293533, -79.3769543018029],
    building: 'Rogers Communications Centre',
    floor: 3
  }
];

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

app.get('/api/classrooms/search/:query', async (req, res) => {
  try {
    const query = req.params.query.toLowerCase();
    
    if (isMongoConnected) {
      const searchParts = query.split(/\s+/);
      
      const searchPattern = searchParts.map(part => `(?=.*${part})`).join('');
      
      const classrooms = await Classroom.find({
        $or: [
          { id: { $regex: searchPattern, $options: 'i' } },
          { building: { $regex: searchPattern, $options: 'i' } }
        ]
      });
      
      res.json(classrooms);
    } else {
      const filtered = fallbackClassrooms.filter(classroom => {
        const normalizedId = classroom.id.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedBuilding = classroom.building ? classroom.building.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
        const normalizedQuery = query.replace(/[^a-z0-9]/g, '');
        
        return searchParts.every(part => 
          normalizedId.includes(part) || 
          normalizedBuilding.includes(part)
        );
      });
      res.json(filtered);
    }
  } catch (error) {
    console.error('Error searching classrooms:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

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

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  
  if (isMongoConnected) {
    seedDatabase();
  }
});

process.on('SIGINT', async () => {
  if (isMongoConnected) {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
  process.exit(0);
}); 