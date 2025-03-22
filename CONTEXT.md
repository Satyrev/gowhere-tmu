# GoWhere Campus Navigation App: Implementation Guide

This guide provides detailed instructions for implementing the GoWhere campus navigation application, which helps university students find their way to classrooms on campus.

## Project Overview

GoWhere is a campus navigation application designed for environments similar to TorontoMet University. The app helps users locate and navigate to their classrooms by:
- Allowing various input methods for current location (manual, voice, GPS)
- Enabling classroom selection through search or voice input
- Providing step-by-step navigation instructions
- Displaying real-time location on a campus map
- Offering accessibility features

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Security**: JWT authentication, HTTPS, Rate limiting
- **Hosting**: Vercel, Cloudflare
- **APIs**:
  - Mapbox for mapping
  - Google Geocoding API
  - Google Text-to-Speech for voice recognition
  - OpenStreetMap (optional)

## Implementation Phases

The implementation is divided into two sprints:

### Sprint 1 (First Development Cycle)

1. Location Input (User Stories 1-3)
2. Classroom Selection (User Stories 4-5)
3. Navigation Assistance (User Stories 6-7)
4. Map Display (User Story 8)

### Sprint 2 (Second Development Cycle)

1. Notifications (User Story 9)
2. Accessibility Features (User Story 10)
3. Nearest Classroom (User Story 11)
4. Report Missing/Incorrect Classrooms (User Story 12)
5. Re-enter Location (User Story 13)

## Detailed Implementation Steps

### Phase 1: Project Setup

1. **Initialize Project Structure**
   - Set up a React.js project using Create React App
   - Configure Node.js backend with Express.js
   - Set up MongoDB database
   - Implement basic authentication using JWT

2. **Configure API Integrations**
   - Set up Mapbox API for campus mapping
   - Configure Google Geocoding API for location services
   - Implement Google Text-to-Speech API for voice functionality

### Phase 2: Core Functionality Implementation (Sprint 1)

#### 1. Location Input (High Priority)

- **Task 1.1: Manual Input**
   - Implement a search bar in the UI
   - Create input validation for location entries
   - Design a clean, user-friendly input interface
   - Estimated time: 1 hour

- **Task 1.2: Voice Input**
   - Integrate microphone access permissions
   - Implement voice recognition using Google API
   - Convert speech to text for location input
   - Add visual feedback for voice recording
   - Estimated time: 3 hours

- **Task 1.3: GPS Integration**
   - Request geolocation permissions from user
   - Implement GPS location detection
   - Create fallback mechanisms for GPS failures
   - Display current location coordinates
   - Estimated time: 2 hours

#### 2. Classroom Selection (High Priority)

- **Task 2.1: Implement Classroom Search**
   - Create a searchable dropdown menu
   - Implement filtering/fuzzy search functionality
   - Connect to classroom database
   - Design UI for classroom selection
   - Estimated time: 2 hours

- **Task 2.2: Voice Input for Classroom Selection**
   - Extend voice recognition to classroom selection
   - Match voice input to classroom database entries
   - Implement confirmation for selected classroom
   - Estimated time: 1 hour

#### 3. Navigation Functionality (High Priority)

- **Task 3.1: Step-by-Step Instructions**
   - Implement route calculation algorithm
   - Create UI for displaying navigation instructions
   - Show distance, direction, and turn indicators
   - Implement real-time updates
   - Estimated time: 2 hours

- **Task 3.2: Voice Guidance**
   - Implement text-to-speech for navigation instructions
   - Create toggle controls for voice guidance
   - Design voice prompts for different navigation scenarios
   - Estimated time: 2 hours

#### 4. Map Display (High Priority)

- **Task 4.1: Campus Map Integration**
   - Implement Mapbox integration
   - Add campus building details and markers
   - Create custom map styling for campus elements
   - Display user's current location on map
   - Display destination classroom on map
   - Estimated time: 3-4 hours

### Phase 3: Advanced Features Implementation (Sprint 2)

#### 5. Notifications (Medium Priority)

- **Task 5.1: Destination Arrival Notification**
   - Implement geofencing for destination detection
   - Create arrival notification system
   - Design confirmation UI for arrival
   - Estimated time: 1-2 hours

- **Task 5.2: Location Bookmarking**
   - Create bookmark functionality for frequently visited locations
   - Implement save/delete controls for bookmarks
   - Design UI for displaying saved locations
   - Estimated time: 1 hour

#### 6. Accessibility Features (Medium Priority)

- **Task 6.1: Visual Accessibility**
   - Implement high-contrast mode
   - Add zoom controls for map
   - Ensure text is scalable
   - Test with screen readers
   - Estimated time: 2 hours

- **Task 6.2: Audio Accessibility**
   - Enhance voice guidance for visually impaired users
   - Implement haptic feedback where applicable
   - Add audio cues for important notifications
   - Estimated time: 1-2 hours

#### 7. Fallback and Error Handling (Low-Medium Priority)

- **Task 7.1: Nearest Classroom Suggestion**
   - Implement algorithm to find nearest available classroom
   - Create UI for displaying alternatives
   - Design the suggestion notification system
   - Estimated time: 2-3 hours

- **Task 7.2: Error Reporting**
   - Create reporting form for incorrect classroom information
   - Implement submission system to database
   - Design confirmation for submitted reports
   - Estimated time: 1-2 hours

- **Task 7.3: Location Re-entry**
   - Implement location correction mechanism
   - Create UI for re-entering location
   - Ensure navigation recalculation on location change
   - Estimated time: 1-2 hours

### Phase 4: Testing and Optimization

Following the test plan outlined in the specifications:

1. **Functional Testing**
   - Test all location input methods
   - Validate classroom selection functionality
   - Verify navigation instruction accuracy
   - Confirm map display correctness

2. **Performance Testing**
   - Ensure search results load in under 2 seconds
   - Test with simulated load of 100+ users
   - Optimize API calls and data fetching

3. **Security Testing**
   - Verify data encryption for location information
   - Test access controls
   - Validate logout functionality

## Component Structure

### Frontend Components

1. **Core Components**
   - `App.js`: Main application container
   - `Login.js`: User authentication
   - `Dashboard.js`: Main user interface after login

2. **Location Components**
   - `LocationInput.js`: Manual location entry
   - `VoiceInput.js`: Voice recognition component
   - `GpsLocator.js`: GPS location detection

3. **Search Components**
   - `ClassroomSearch.js`: Classroom search dropdown
   - `SearchResults.js`: Display search results

4. **Navigation Components**
   - `NavigationInstructions.js`: Display step-by-step directions
   - `VoiceGuidance.js`: Text-to-speech navigation
   - `RouteDisplay.js`: Show route on map

5. **Map Components**
   - `CampusMap.js`: Main map display
   - `LocationMarker.js`: Current location indicator
   - `DestinationMarker.js`: Classroom location marker

6. **Utility Components**
   - `Notifications.js`: User notifications
   - `Bookmarks.js`: Saved locations
   - `ErrorReporting.js`: Report incorrect information

### Backend Structure

1. **API Routes**
   - `/api/auth`: Authentication endpoints
   - `/api/location`: Location-related endpoints
   - `/api/classrooms`: Classroom data endpoints
   - `/api/navigation`: Route calculation endpoints
   - `/api/reports`: Error reporting endpoints

2. **Models**
   - `User.js`: User data schema
   - `Classroom.js`: Classroom information schema
   - `Building.js`: Building information schema
   - `Bookmark.js`: Saved locations schema
   - `Report.js`: Error reports schema

3. **Controllers**
   - `authController.js`: Authentication logic
   - `locationController.js`: Location processing
   - `navigationController.js`: Route calculation
   - `classroomController.js`: Classroom data handling
   - `reportController.js`: Error report handling

4. **Middleware**
   - `auth.js`: Authentication verification
   - `rateLimiter.js`: API request limiting
   - `errorHandler.js`: Error processing

## Database Schema

### Users Collection
```
{
  _id: ObjectId,
  username: String,
  password: String (hashed),
  email: String,
  savedLocations: [
    {
      name: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### Classrooms Collection
```
{
  _id: ObjectId,
  name: String,
  buildingId: ObjectId (ref: Buildings),
  floor: Number,
  roomNumber: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  capacity: Number,
  features: [String]
}
```

### Buildings Collection
```
{
  _id: ObjectId,
  name: String,
  code: String,
  address: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  floors: Number,
  entrances: [
    {
      name: String,
      coordinates: {
        lat: Number,
        lng: Number
      },
      accessible: Boolean
    }
  ]
}
```

### Reports Collection
```
{
  _id: ObjectId,
  type: String,
  description: String,
  classroomId: ObjectId (ref: Classrooms),
  userId: ObjectId (ref: Users),
  status: String,
  createdAt: Date
}
```

## Implementation Notes

1. **API Security**
   - Implement rate limiting to prevent abuse
   - Use HTTPS for all data transfers
   - Sanitize all user inputs
   - Implement proper error handling

2. **Performance Considerations**
   - Cache frequent queries
   - Optimize map loading for mobile devices
   - Implement progressive loading for map features
   - Minimize API calls by batching requests

3. **Accessibility Guidelines**
   - Follow WCAG 2.1 standards
   - Ensure keyboard navigation is possible
   - Provide alternative text for visual elements
   - Test with screen readers

4. **Testing Requirements**
   - Implement unit tests for all components
   - Create integration tests for API endpoints
   - Perform usability testing with actual users
   - Test across multiple devices and browsers

## Deployment Strategy

1. **Development Environment**
   - Local development with environment variables
   - Use development APIs with limited quota

2. **Staging Environment**
   - Deploy to staging server
   - Use production APIs with test data
   - Perform integration testing

3. **Production Environment**
   - Deploy frontend to Vercel
   - Deploy backend to appropriate hosting
   - Set up Cloudflare for CDN and security
   - Configure monitoring and alerts

## Release Plan

1. **Alpha Release (Internal)**
   - Core functionality only (Sprint 1 features)
   - Limited user testing within development team

2. **Beta Release (Limited Users)**
   - All Sprint 1 features plus critical Sprint 2 features
   - Testing with selected student groups

3. **Full Release**
   - All features implemented
   - Campus-wide availability
   - Ongoing support and bug fixes