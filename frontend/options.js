// EcoCommute Options Page Script

// DOM elements
const saveButton = document.getElementById('saveButton');
const saveStatus = document.getElementById('saveStatus');
const walkingDistance = document.getElementById('walkingDistance');
const walkingDistanceValue = document.getElementById('walkingDistanceValue');

// Transit mode checkboxes
const busCheckbox = document.getElementById('bus');
const subwayCheckbox = document.getElementById('subway');
const trainCheckbox = document.getElementById('train');
const tramCheckbox = document.getElementById('tram');
const ferryCheckbox = document.getElementById('ferry');

// Other settings
const carbonTrackingCheckbox = document.getElementById('carbonTracking');
const shareAchievementsCheckbox = document.getElementById('shareAchievements');
const notificationsCheckbox = document.getElementById('notifications');
const delayAlertsCheckbox = document.getElementById('delayAlerts');
const crowdingAlertsCheckbox = document.getElementById('crowdingAlerts');
const carbonMilestonesCheckbox = document.getElementById('carbonMilestones');
const anonymousDataCheckbox = document.getElementById('anonymousData');
const locationHistoryCheckbox = document.getElementById('locationHistory');

// Load saved settings when the options page opens
document.addEventListener('DOMContentLoaded', loadSettings);

// Update walking distance display when slider changes
walkingDistance.addEventListener('input', () => {
  walkingDistanceValue.textContent = walkingDistance.value;
});

// Save settings when the save button is clicked
saveButton.addEventListener('click', saveSettings);

// Function to load saved settings from storage
function loadSettings() {
  chrome.storage.sync.get({
    // Default values if not set
    preferredTransitModes: ['bus', 'subway', 'train', 'tram'],
    maxWalkingDistance: 1000,
    carbonTrackingEnabled: true,
    shareAchievements: false,
    notificationsEnabled: true,
    delayAlerts: true,
    crowdingAlerts: false,
    carbonMilestones: true,
    anonymousDataSharing: true,
    storeLocationHistory: false
  }, (items) => {
    // Set transit mode checkboxes
    busCheckbox.checked = items.preferredTransitModes.includes('bus');
    subwayCheckbox.checked = items.preferredTransitModes.includes('subway');
    trainCheckbox.checked = items.preferredTransitModes.includes('train');
    tramCheckbox.checked = items.preferredTransitModes.includes('tram');
    ferryCheckbox.checked = items.preferredTransitModes.includes('ferry');
    
    // Set walking distance
    walkingDistance.value = items.maxWalkingDistance;
    walkingDistanceValue.textContent = items.maxWalkingDistance;
    
    // Set other checkboxes
    carbonTrackingCheckbox.checked = items.carbonTrackingEnabled;
    shareAchievementsCheckbox.checked = items.shareAchievements;
    notificationsCheckbox.checked = items.notificationsEnabled;
    delayAlertsCheckbox.checked = items.delayAlerts;
    crowdingAlertsCheckbox.checked = items.crowdingAlerts;
    carbonMilestonesCheckbox.checked = items.carbonMilestones;
    anonymousDataCheckbox.checked = items.anonymousDataSharing;
    locationHistoryCheckbox.checked = items.storeLocationHistory;
  });
}

// Function to save settings to storage
function saveSettings() {
  // Get selected transit modes
  const preferredTransitModes = [];
  if (busCheckbox.checked) preferredTransitModes.push('bus');
  if (subwayCheckbox.checked) preferredTransitModes.push('subway');
  if (trainCheckbox.checked) preferredTransitModes.push('train');
  if (tramCheckbox.checked) preferredTransitModes.push('tram');
  if (ferryCheckbox.checked) preferredTransitModes.push('ferry');
  
  // Save all settings
  chrome.storage.sync.set({
    preferredTransitModes: preferredTransitModes,
    maxWalkingDistance: parseInt(walkingDistance.value),
    carbonTrackingEnabled: carbonTrackingCheckbox.checked,
    shareAchievements: shareAchievementsCheckbox.checked,
    notificationsEnabled: notificationsCheckbox.checked,
    delayAlerts: delayAlertsCheckbox.checked,
    crowdingAlerts: crowdingAlertsCheckbox.checked,
    carbonMilestones: carbonMilestonesCheckbox.checked,
    anonymousDataSharing: anonymousDataCheckbox.checked,
    storeLocationHistory: locationHistoryCheckbox.checked
  }, () => {
    // Show save confirmation
    saveStatus.classList.add('success');
    saveStatus.style.display = 'block';
    
    // Hide confirmation after 2 seconds
    setTimeout(() => {
      saveStatus.style.display = 'none';
      saveStatus.classList.remove('success');
    }, 2000);
  });
}
