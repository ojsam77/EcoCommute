document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const startLocationInput = document.getElementById('start-location');
  const destinationInput = document.getElementById('destination');
  const departureTimeInput = document.getElementById('departure-time');
  const searchButton = document.getElementById('search-button');
  const routesList = document.getElementById('routes-list');
  const loginButton = document.getElementById('login-button');
  const userName = document.getElementById('user-name');
  const co2Saved = document.getElementById('co2-saved');
  const tripsTaken = document.getElementById('trips-taken');
  const ecoRank = document.getElementById('eco-rank');

  // Set default departure time to now
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  departureTimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;

  // Check if user is logged in
  checkLoginStatus();

  // Event listeners
  searchButton.addEventListener('click', searchRoutes);
  loginButton.addEventListener('click', handleLogin);
  document.getElementById('settings-button').addEventListener('click', openSettings);
  document.getElementById('achievements-button').addEventListener('click', openAchievements);
  document.getElementById('share-button').addEventListener('click', shareStats);

  // Try to get current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      reverseGeocode(latitude, longitude)
        .then(address => {
          startLocationInput.value = address;
        })
        .catch(error => {
          console.error('Error getting current location address:', error);
        });
    }, error => {
      console.error('Error getting current location:', error);
    });
  }

  // Functions
  function checkLoginStatus() {
    chrome.storage.sync.get(['userProfile'], result => {
      if (result.userProfile) {
        userName.textContent = result.userProfile.name;
        loginButton.textContent = 'Logout';
        updateEcoStats(result.userProfile);
      } else {
        userName.textContent = 'Guest';
        loginButton.textContent = 'Login';
        // Show default stats for guest
        co2Saved.textContent = '0';
        tripsTaken.textContent = '0';
        ecoRank.textContent = '--';
      }
    });
  }

  function updateEcoStats(profile) {
    co2Saved.textContent = profile.co2Saved.toFixed(1);
    tripsTaken.textContent = profile.tripsTaken;
    ecoRank.textContent = profile.ecoRank || '--';
    
    // Check if user is admin and show admin indicator if needed
    if (profile.userType === 'admin') {
      userName.textContent = profile.name + ' (Admin)';
    } else if (profile.userType === 'beta') {
      userName.textContent = profile.name + ' (Beta)';
    } else {
      userName.textContent = profile.name;
    }
  }

  function handleLogin() {
    if (loginButton.textContent === 'Login') {
      // Open login page
      chrome.tabs.create({ url: 'login.html' });
    } else {
      // Logout
      chrome.storage.sync.remove('userProfile', () => {
        checkLoginStatus();
      });
    }
  }

  function searchRoutes() {
    const start = startLocationInput.value;
    const destination = destinationInput.value;
    const departureTime = departureTimeInput.value;

    if (!start || !destination) {
      alert('Please enter both start and destination locations');
      return;
    }

    // Show loading state
    routesList.innerHTML = '<div class="loading">Finding the best eco-friendly routes...</div>';

    // In a real extension, this would call your backend API
    // For demo purposes, we'll simulate an API call with mock data
    setTimeout(() => {
      const routes = getMockRoutes(start, destination, departureTime);
      displayRoutes(routes);
    }, 1500);
  }

  function displayRoutes(routes) {
    if (!routes || routes.length === 0) {
      routesList.innerHTML = '<div class="empty-state">No routes found. Please try different locations.</div>';
      return;
    }

    // Create modal overlay for popup effect
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'route-modal-overlay';
    document.body.appendChild(modalOverlay);

    routesList.innerHTML = '';
    routes.forEach((route, index) => {
      const routeCard = document.createElement('div');
      routeCard.className = 'route-card compact';
      
      // Add recommended badge if it's the first route
      if (index === 0) {
        const recommendedBadge = document.createElement('div');
        recommendedBadge.className = 'recommended-badge';
        recommendedBadge.textContent = 'Recommended';
        routeCard.appendChild(recommendedBadge);
      }
      
      // Create route summary (visible in compact mode)
      const routeSummary = document.createElement('div');
      routeSummary.className = 'route-summary';
      
      const routeTime = document.createElement('div');
      routeTime.className = 'route-time';
      routeTime.textContent = `${route.duration} min`;
      
      const ecoScore = document.createElement('div');
      ecoScore.className = 'eco-score';
      ecoScore.innerHTML = `<span>Eco Score:</span> <span class="eco-score-value">${route.ecoScore}</span>`;
      
      // Create summary icons
      const summaryIcons = document.createElement('div');
      summaryIcons.className = 'route-summary-icons';
      
      // Get unique transport modes
      const transportModes = route.steps.map(step => step.mode);
      const uniqueModes = [...new Set(transportModes)];
      
      uniqueModes.forEach(mode => {
        const icon = document.createElement('span');
        icon.className = 'summary-icon';
        icon.textContent = getTransportIcon(mode);
        summaryIcons.appendChild(icon);
      });
      
      // Add CO2 badge
      const co2Badge = document.createElement('div');
      co2Badge.className = 'co2-badge';
      co2Badge.textContent = `${route.co2Savings.toFixed(1)}kg CO₂`;
      routeCard.appendChild(co2Badge);
      
      routeSummary.appendChild(routeTime);
      routeSummary.appendChild(ecoScore);
      routeSummary.appendChild(summaryIcons);
      routeCard.appendChild(routeSummary);
      
      // Create modal content for this route
      const modalContent = createRouteModal(route, index + 1);
      
      // Toggle modal when clicked
      routeCard.addEventListener('click', () => {
        modalOverlay.innerHTML = '';
        modalOverlay.appendChild(modalContent);
        modalOverlay.style.display = 'flex';
      });
      
      routesList.appendChild(routeCard);
    });
    
    // Close modal when clicking outside
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.style.display = 'none';
      }
    });
  }
  
  // Function to create a modal for a route
  function createRouteModal(route, routeNumber) {
    const modal = document.createElement('div');
    modal.className = 'route-modal';
    
    // Modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    
    const modalTitle = document.createElement('div');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = `Route Details`;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'modal-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event bubbling
      const overlay = document.querySelector('.route-modal-overlay');
      if (overlay) {
        overlay.style.display = 'none';
      }
    });
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    
    // Modal body
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    
    // Route summary
    const routeSummary = document.createElement('div');
    routeSummary.style.display = 'flex';
    routeSummary.style.justifyContent = 'space-between';
    routeSummary.style.marginBottom = '16px';
    
    const timeInfo = document.createElement('div');
    timeInfo.innerHTML = `<strong>Duration:</strong> ${route.duration} min`;
    
    const ecoInfo = document.createElement('div');
    ecoInfo.innerHTML = `<strong>Eco Score:</strong> <span style="color: var(--primary-color); font-weight: bold;">${route.ecoScore}</span>`;
    
    const co2Info = document.createElement('div');
    co2Info.innerHTML = `<strong>CO₂ Savings:</strong> ${route.co2Savings.toFixed(1)}kg`;
    
    routeSummary.appendChild(timeInfo);
    routeSummary.appendChild(ecoInfo);
    
    modalBody.appendChild(routeSummary);
    modalBody.appendChild(co2Info);
    
    // Divider
    const divider = document.createElement('hr');
    divider.style.margin = '16px 0';
    divider.style.border = 'none';
    divider.style.borderTop = '1px solid var(--light-gray)';
    modalBody.appendChild(divider);
    
    // Route steps
    const stepsTitle = document.createElement('h3');
    stepsTitle.textContent = 'Journey Steps';
    stepsTitle.style.marginBottom = '12px';
    modalBody.appendChild(stepsTitle);
    
    const routeSteps = document.createElement('div');
    routeSteps.className = 'route-steps';
    
    route.steps.forEach(step => {
      const routeStep = document.createElement('div');
      routeStep.className = 'route-step';
      
      const transportIcon = document.createElement('div');
      transportIcon.className = 'transport-icon';
      transportIcon.textContent = getTransportIcon(step.mode);
      
      const stepDetails = document.createElement('div');
      stepDetails.className = 'step-details';
      stepDetails.textContent = step.instruction;
      
      routeStep.appendChild(transportIcon);
      routeStep.appendChild(stepDetails);
      routeSteps.appendChild(routeStep);
    });
    
    modalBody.appendChild(routeSteps);
    
    // Modal footer
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    
    const selectButton = document.createElement('button');
    selectButton.className = 'primary-button';
    selectButton.textContent = 'Select This Route';
    selectButton.style.width = 'auto';
    selectButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event bubbling
      selectRoute(route);
      const overlay = document.querySelector('.route-modal-overlay');
      if (overlay) {
        overlay.style.display = 'none';
      }
    });
    
    modalFooter.appendChild(selectButton);
    
    // Assemble modal
    modal.appendChild(modalHeader);
    modal.appendChild(modalBody);
    modal.appendChild(modalFooter);
    
    // Prevent clicks inside the modal from closing it
    modal.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    return modal;
  }

  function getTransportIcon(mode) {
    switch (mode.toLowerCase()) {
      case 'walk': return '🚶';
      case 'bus': return '🚌';
      case 'subway': return '🚇';
      case 'train': return '🚆';
      case 'tram': return '🚊';
      case 'bike': return '🚲';
      case 'ferry': return '⛴️';
      default: return '🚶';
    }
  }

  function selectRoute(route) {
    // In a real extension, this would save the selected route
    // and potentially open maps with directions
    
    // Update user stats if logged in
    chrome.storage.sync.get(['userProfile'], result => {
      if (result.userProfile) {
        const profile = result.userProfile;
        profile.co2Saved += route.co2Savings;
        profile.tripsTaken += 1;
        
        chrome.storage.sync.set({ userProfile: profile }, () => {
          updateEcoStats(profile);
          
          // Show confirmation
          alert(`Route selected! You'll save ${route.co2Savings.toFixed(1)}kg of CO2 with this trip.`);
        });
      } else {
        // Show confirmation for guest
        alert(`Route selected! You'll save ${route.co2Savings.toFixed(1)}kg of CO2 with this trip. Login to track your impact!`);
      }
    });
  }

  function openSettings() {
    chrome.runtime.openOptionsPage();
  }

  function openAchievements() {
    chrome.tabs.create({ url: 'achievements.html' });
  }

  function shareStats() {
    chrome.storage.sync.get(['userProfile'], result => {
      if (result.userProfile) {
        const profile = result.userProfile;
        const shareText = `I've saved ${profile.co2Saved.toFixed(1)}kg of CO2 by taking ${profile.tripsTaken} eco-friendly trips with EcoCommute! #SustainableTransit`;
        
        // In a real extension, this would open a share dialog
        // For demo purposes, copy to clipboard
        navigator.clipboard.writeText(shareText)
          .then(() => {
            alert('Stats copied to clipboard! Share on your favorite social media platform.');
          })
          .catch(err => {
            console.error('Failed to copy text: ', err);
          });
      } else {
        alert('Login to track and share your environmental impact!');
      }
    });
  }

  // Mock API functions
  function reverseGeocode(lat, lng) {
    // In a real extension, this would call a geocoding API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('Current Location');
      }, 500);
    });
  }

  function getMockRoutes(start, destination) {
    return [
      {
        duration: 32,
        ecoScore: 'A+',
        co2Savings: 2.4,
        steps: [
          { mode: 'walk', instruction: 'Walk to Central Station (5 min)' },
          { mode: 'subway', instruction: 'Take Line 2 to Downtown (15 min)' },
          { mode: 'walk', instruction: 'Walk to destination (12 min)' }
        ]
      },
      {
        duration: 28,
        ecoScore: 'A',
        co2Savings: 2.1,
        steps: [
          { mode: 'walk', instruction: 'Walk to Bus Stop #42 (3 min)' },
          { mode: 'bus', instruction: 'Take Bus #301 to Market St (20 min)' },
          { mode: 'walk', instruction: 'Walk to destination (5 min)' }
        ]
      },
      {
        duration: 45,
        ecoScore: 'A++',
        co2Savings: 3.2,
        steps: [
          { mode: 'walk', instruction: 'Walk to Bike Share Station (2 min)' },
          { mode: 'bike', instruction: 'Bike to Downtown via Green Route (40 min)' },
          { mode: 'walk', instruction: 'Walk to destination (3 min)' }
        ]
      }
    ];
  }
});
