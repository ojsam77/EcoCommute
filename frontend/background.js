// EcoCommute Background Service Worker
console.log('EcoCommute background service worker initialized');

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('EcoCommute extension installed');
  
  // Set default settings
  chrome.storage.sync.set({
    preferredTransitModes: ['bus', 'subway', 'train', 'tram'],
    maxWalkingDistance: 1000, // meters
    notificationsEnabled: true,
    carbonTrackingEnabled: true
  });
});

// Set up alarm for periodic transit data updates
chrome.alarms.create('updateTransitData', { periodInMinutes: 15 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateTransitData') {
    updateTransitData();
  }
});

// Function to update transit data from backend
async function updateTransitData() {
  try {
    // In a real implementation, this would call your AWS Lambda backend
    console.log('Updating transit data from backend');
    
    // Simulate API call to backend
    // const response = await fetch('https://api.ecocommute.example/transit-data');
    // const data = await response.json();
    
    // Store updated data
    // chrome.storage.local.set({ transitData: data });
    
    // Check for relevant notifications
    checkForNotifications();
  } catch (error) {
    console.error('Error updating transit data:', error);
  }
}

// Function to check for and send notifications
function checkForNotifications() {
  chrome.storage.sync.get('notificationsEnabled', (data) => {
    if (data.notificationsEnabled) {
      // In a real implementation, this would check for relevant transit updates
      // and send notifications as needed
    }
  });
}

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getTransitOptions') {
    // Handle request for transit options
    sendResponse({ success: true, message: 'Transit options would be returned here' });
  }
  
  // Return true to indicate async response
  return true;
});
