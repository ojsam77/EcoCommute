const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const axios = require('axios');

// Environment variables
const USER_PROFILES_TABLE = process.env.USER_PROFILES_TABLE;
const TRANSIT_API_KEY = process.env.TRANSIT_API_KEY;

/**
 * Route Optimizer Lambda Function
 * 
 * This function optimizes transit routes based on:
 * 1. Carbon footprint (prioritizing low-emission options)
 * 2. User preferences (from stored profile)
 * 3. Real-time transit conditions
 * 4. Weather conditions
 */
exports.handler = async (event) => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    // Parse request body
    const body = JSON.parse(event.body);
    const { 
      userId, 
      startLocation, 
      endLocation, 
      departureTime, 
      priorityFactors = {} 
    } = body;
    
    // Validate required parameters
    if (!startLocation || !endLocation) {
      return formatResponse(400, { 
        message: 'Missing required parameters: startLocation and endLocation are required' 
      });
    }
    
    // Get user preferences if userId is provided
    let userPreferences = {};
    if (userId) {
      try {
        userPreferences = await getUserPreferences(userId);
      } catch (error) {
        console.warn('Error fetching user preferences:', error);
        // Continue with default preferences
      }
    }
    
    // Merge default priority factors with user preferences and request overrides
    const routePreferences = {
      maxWalkingDistance: 1000, // meters
      preferredTransitModes: ['subway', 'bus', 'tram', 'train'],
      avoidTransfers: false,
      accessibilityNeeds: false,
      ...userPreferences,
      ...priorityFactors
    };
    
    // Format locations for transit API
    const formattedStartLocation = formatLocation(startLocation);
    const formattedEndLocation = formatLocation(endLocation);
    
    // Get departure time or use current time
    const formattedDepartureTime = departureTime ? new Date(departureTime).toISOString() : new Date().toISOString();
    
    // Fetch routes from transit API
    const routes = await fetchTransitRoutes(
      formattedStartLocation,
      formattedEndLocation,
      formattedDepartureTime,
      routePreferences
    );
    
    // Calculate eco-score and carbon savings for each route
    const enhancedRoutes = routes.map(route => {
      const { ecoScore, co2Savings } = calculateEcoMetrics(route);
      return {
        ...route,
        ecoScore,
        co2Savings
      };
    });
    
    // Sort routes by eco-score (primary) and duration (secondary)
    const sortedRoutes = enhancedRoutes.sort((a, b) => {
      // First sort by eco-score (higher is better)
      if (b.ecoScore !== a.ecoScore) {
        return b.ecoScore - a.ecoScore;
      }
      // Then by duration (shorter is better)
      return a.duration - b.duration;
    });
    
    return formatResponse(200, { routes: sortedRoutes });
    
  } catch (error) {
    console.error('Error optimizing routes:', error);
    return formatResponse(500, { message: 'Error optimizing routes' });
  }
};

/**
 * Fetches user preferences from DynamoDB
 */
async function getUserPreferences(userId) {
  const params = {
    TableName: USER_PROFILES_TABLE,
    Key: { userId }
  };
  
  const result = await dynamoDB.get(params).promise();
  return result.Item?.preferences || {};
}

/**
 * Formats location object for transit API
 */
function formatLocation(location) {
  // Handle different location input formats
  if (typeof location === 'string') {
    // If it's a string, assume it's an address
    return { address: location };
  } else if (location.lat && location.lng) {
    // If it has lat/lng, use coordinates
    return { lat: location.lat, lng: location.lng };
  } else if (location.latitude && location.longitude) {
    // Alternative coordinate format
    return { lat: location.latitude, lng: location.longitude };
  }
  
  // Return as is if already formatted correctly
  return location;
}

/**
 * Fetches transit routes from external API
 * Note: This is a mock implementation. In a real application,
 * this would call an actual transit API service.
 */
async function fetchTransitRoutes(start, end, departureTime, preferences) {
  // In a real implementation, this would call an external API
  // For demo purposes, we'll return mock data
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock routes with different transit options
  return [
    {
      id: 'route-1',
      duration: 32, // minutes
      distance: 5.2, // kilometers
      departureTime: departureTime,
      arrivalTime: new Date(new Date(departureTime).getTime() + 32 * 60000).toISOString(),
      segments: [
        {
          type: 'walking',
          duration: 5,
          distance: 0.4,
          instructions: 'Walk to Central Station'
        },
        {
          type: 'transit',
          mode: 'subway',
          line: 'Blue Line',
          duration: 15,
          distance: 4.2,
          instructions: 'Take Blue Line to Downtown Station'
        },
        {
          type: 'walking',
          duration: 12,
          distance: 0.6,
          instructions: 'Walk to destination'
        }
      ],
      transfers: 0,
      fare: {
        amount: 2.75,
        currency: 'USD'
      }
    },
    {
      id: 'route-2',
      duration: 28,
      distance: 4.8,
      departureTime: departureTime,
      arrivalTime: new Date(new Date(departureTime).getTime() + 28 * 60000).toISOString(),
      segments: [
        {
          type: 'walking',
          duration: 3,
          distance: 0.2,
          instructions: 'Walk to Bus Stop #42'
        },
        {
          type: 'transit',
          mode: 'bus',
          line: '301',
          duration: 20,
          distance: 4.3,
          instructions: 'Take Bus #301 to Market St'
        },
        {
          type: 'walking',
          duration: 5,
          distance: 0.3,
          instructions: 'Walk to destination'
        }
      ],
      transfers: 0,
      fare: {
        amount: 2.50,
        currency: 'USD'
      }
    },
    {
      id: 'route-3',
      duration: 45,
      distance: 5.0,
      departureTime: departureTime,
      arrivalTime: new Date(new Date(departureTime).getTime() + 45 * 60000).toISOString(),
      segments: [
        {
          type: 'walking',
          duration: 2,
          distance: 0.1,
          instructions: 'Walk to Bike Share Station'
        },
        {
          type: 'cycling',
          mode: 'bike-share',
          duration: 40,
          distance: 4.8,
          instructions: 'Bike to Downtown via Green Route'
        },
        {
          type: 'walking',
          duration: 3,
          distance: 0.1,
          instructions: 'Walk to destination'
        }
      ],
      transfers: 0,
      fare: {
        amount: 3.50,
        currency: 'USD'
      }
    }
  ];
}

/**
 * Calculates eco-score and CO2 savings for a route
 */
function calculateEcoMetrics(route) {
  // CO2 emissions per passenger-kilometer (in kg)
  const emissionFactors = {
    walking: 0,
    cycling: 0,
    'bike-share': 0,
    bus: 0.068,
    subway: 0.041,
    tram: 0.035,
    train: 0.028,
    ferry: 0.120,
    car: 0.171 // For comparison
  };
  
  // Calculate total emissions for this route
  let totalEmissions = 0;
  let totalDistance = 0;
  
  route.segments.forEach(segment => {
    const mode = segment.mode || segment.type;
    const factor = emissionFactors[mode] || 0;
    totalEmissions += factor * segment.distance;
    totalDistance += segment.distance;
  });
  
  // Calculate what car emissions would have been
  const carEmissions = emissionFactors.car * totalDistance;
  
  // Calculate savings compared to driving
  const co2Savings = carEmissions - totalEmissions;
  
  // Calculate eco-score (0-100)
  // Higher score means more eco-friendly
  let ecoScore = 100 - (totalEmissions / carEmissions * 100);
  
  // Ensure score is within bounds
  ecoScore = Math.max(0, Math.min(100, ecoScore));
  
  // Convert numeric score to letter grade
  let letterGrade;
  if (ecoScore >= 95) letterGrade = 'A++';
  else if (ecoScore >= 90) letterGrade = 'A+';
  else if (ecoScore >= 80) letterGrade = 'A';
  else if (ecoScore >= 70) letterGrade = 'B';
  else if (ecoScore >= 60) letterGrade = 'C';
  else if (ecoScore >= 50) letterGrade = 'D';
  else letterGrade = 'F';
  
  return {
    ecoScore: letterGrade,
    ecoScoreNumeric: Math.round(ecoScore),
    co2Savings: parseFloat(co2Savings.toFixed(2)),
    totalEmissions: parseFloat(totalEmissions.toFixed(2))
  };
}

/**
 * Formats the API response
 */
function formatResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(body)
  };
}
