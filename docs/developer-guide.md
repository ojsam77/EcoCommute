# EcoCommute Developer Guide

## Project Overview

EcoCommute is a browser extension and serverless backend that helps users find eco-friendly public transit routes. The project consists of:

1. **Browser Extension**: Frontend interface built with JavaScript/React
2. **AWS Serverless Backend**: API Gateway, Lambda, DynamoDB, and other AWS services
3. **Transit Data Integration**: Connections to public transit APIs

## Development Environment Setup

### Prerequisites
- Node.js 16+ and npm
- AWS CLI configured with appropriate permissions
- AWS SAM CLI for serverless development
- Git for version control

### Setting Up Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/ecocommute.git
   cd ecocommute
   ```

2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Configure environment variables:
   ```bash
   # Create .env file in frontend directory
   cp frontend/.env.example frontend/.env
   
   # Create .env file in backend directory
   cp backend/.env.example backend/.env
   ```

4. Start the development servers:
   ```bash
   # Start frontend development server
   cd frontend
   npm run dev
   
   # Start backend local API
   cd ../backend
   sam local start-api
   ```

## Project Structure

```
ecocommute/
├── frontend/                 # Browser extension code
│   ├── manifest.json         # Extension manifest
│   ├── popup.html            # Extension popup UI
│   ├── popup.js              # Popup logic
│   ├── background.js         # Background service worker
│   ├── content.js            # Content script for map sites
│   └── styles.css            # Extension styles
│
├── backend/                  # AWS serverless backend
│   ├── template.yaml         # SAM template
│   ├── src/                  # Lambda function code
│   │   └── functions/        # Individual Lambda functions
│   └── statemachines/        # Step Functions workflows
│
└── docs/                     # Documentation
    ├── architecture.md       # System architecture
    ├── user-guide.md         # End-user documentation
    └── developer-guide.md    # Developer documentation
```

## Frontend Development

### Browser Extension Structure

The browser extension follows Chrome's Manifest V3 format:

- **popup.html/js**: The main UI that appears when clicking the extension icon
- **background.js**: Service worker for background tasks and API communication
- **content.js**: Injects into map websites to enhance with eco-routing options

### Building the Extension

1. Make changes to the extension code
2. Run the build process:
   ```bash
   cd frontend
   npm run build
   ```
3. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `frontend/dist` directory

### UI Components

The extension uses a component-based architecture:
- **RouteList**: Displays available transit routes
- **RouteCard**: Individual route display with eco-metrics
- **SearchForm**: Location input and search controls
- **EcoStats**: User's environmental impact statistics

## Backend Development

### AWS Services Used

- **API Gateway**: RESTful API endpoints
- **Lambda**: Serverless functions for business logic
- **DynamoDB**: NoSQL database for user data and routes
- **Cognito**: User authentication and management
- **Step Functions**: Orchestration of complex workflows
- **EventBridge**: Event-driven architecture components

### Deploying the Backend

1. Make changes to the backend code
2. Deploy using AWS SAM:
   ```bash
   cd backend
   sam build
   sam deploy --guided  # First time
   # or
   sam deploy  # Subsequent deployments
   ```

### Key Lambda Functions

- **RouteOptimizerFunction**: Finds and optimizes transit routes
- **CarbonCalculatorFunction**: Calculates emissions and savings
- **UserProfileFunction**: Manages user preferences and data
- **TransitDataFunction**: Interfaces with external transit APIs

## Data Models

### User Profile

```json
{
  "userId": "user123",
  "email": "user@example.com",
  "name": "Jane Smith",
  "preferences": {
    "maxWalkingDistance": 1000,
    "preferredTransitModes": ["subway", "bus"],
    "avoidTransfers": true,
    "accessibilityNeeds": false
  },
  "stats": {
    "co2Saved": 45.2,
    "tripsTaken": 28,
    "ecoRank": "Silver"
  },
  "createdAt": "2023-05-15T14:30:00Z",
  "updatedAt": "2023-06-20T09:15:00Z"
}
```

### Saved Route

```json
{
  "userId": "user123",
  "routeId": "route456",
  "name": "Home to Work",
  "startLocation": {
    "address": "123 Home St",
    "coordinates": {
      "lat": 37.7749,
      "lng": -122.4194
    }
  },
  "endLocation": {
    "address": "456 Work Ave",
    "coordinates": {
      "lat": 37.7899,
      "lng": -122.4000
    }
  },
  "frequency": "weekdays",
  "preferredDepartureTime": "08:30",
  "createdAt": "2023-05-20T10:00:00Z"
}
```

### Achievement

```json
{
  "userId": "user123",
  "achievementId": "achievement789",
  "type": "CO2_MILESTONE",
  "title": "Carbon Crusher",
  "description": "Save 50kg of CO2 emissions",
  "iconUrl": "https://assets.ecocommute.example.com/badges/carbon-crusher.png",
  "earnedAt": "2023-06-15T16:45:00Z",
  "progress": 100
}
```

## API Endpoints

### Route Optimization

```
POST /routes/optimize
```

Request:
```json
{
  "userId": "user123",
  "startLocation": {
    "address": "123 Main St, San Francisco, CA"
  },
  "endLocation": {
    "lat": 37.7899,
    "lng": -122.4000
  },
  "departureTime": "2023-06-21T08:30:00Z",
  "priorityFactors": {
    "maxWalkingDistance": 800,
    "preferredTransitModes": ["subway", "bus"]
  }
}
```

Response:
```json
{
  "routes": [
    {
      "id": "route1",
      "duration": 32,
      "ecoScore": "A+",
      "co2Savings": 2.4,
      "segments": [
        {
          "type": "walking",
          "duration": 5,
          "distance": 0.4,
          "instructions": "Walk to Central Station"
        },
        {
          "type": "transit",
          "mode": "subway",
          "line": "Blue Line",
          "duration": 15,
          "distance": 4.2,
          "instructions": "Take Blue Line to Downtown Station"
        },
        {
          "type": "walking",
          "duration": 12,
          "distance": 0.6,
          "instructions": "Walk to destination"
        }
      ]
    }
  ]
}
```

### User Profile

```
GET /users/{userId}
```

Response:
```json
{
  "userId": "user123",
  "name": "Jane Smith",
  "preferences": {
    "maxWalkingDistance": 1000,
    "preferredTransitModes": ["subway", "bus"],
    "avoidTransfers": true
  },
  "stats": {
    "co2Saved": 45.2,
    "tripsTaken": 28,
    "ecoRank": "Silver"
  }
}
```

## Testing

### Frontend Testing

```bash
cd frontend
npm test
```

The frontend uses Jest for unit tests and Cypress for end-to-end testing.

### Backend Testing

```bash
cd backend
npm test
```

Backend tests use Jest with mocked AWS services.

## Continuous Integration/Deployment

The project uses GitHub Actions for CI/CD:

- **Pull Request Workflow**: Runs tests and linting
- **Main Branch Workflow**: Deploys to development environment
- **Release Workflow**: Deploys to production environment

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m "Add your feature"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a pull request

## Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
- [Chrome Extension Development](https://developer.chrome.com/docs/extensions/mv3/getstarted/)
- [Transit Data APIs Documentation](https://developer.transit-api.example.com)
