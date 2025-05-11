document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const statusMessage = document.getElementById('status-message');
  const quickLoginBeta = document.getElementById('quick-login-beta');
  const quickLoginAdmin = document.getElementById('quick-login-admin');
  
  // Function to show status message
  function showStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.style.display = 'block';
    
    if (isError) {
      statusMessage.className = 'status-message error';
    } else {
      statusMessage.className = 'status-message success';
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      statusMessage.style.display = 'none';
    }, 5000);
  }
  
  // Function to handle login
  function handleLogin(username, password) {
    console.log(`Attempting login with username: ${username}`);
    
    // Check for specific test users
    if (username === 'newuser' && password === '2025DEVChallenge') {
      // Beta user profile
      const userProfile = {
        name: 'Beta User',
        username: 'newuser',
        co2Saved: 15.7,
        tripsTaken: 12,
        ecoRank: 'Eco Explorer',
        userType: 'beta'
      };
      
      // Save to Chrome storage
      chrome.storage.sync.set({ userProfile }, () => {
        showStatus('Beta user login successful! Welcome to EcoCommute.');
        console.log('Beta user profile saved to Chrome storage');
        
        // Close this tab after a short delay
        setTimeout(() => {
          window.close();
        }, 1500);
      });
      
      return true;
    } 
    else if (username === 'admin' && password === '2025DEVChallenge') {
      // Admin user profile
      const userProfile = {
        name: 'Admin',
        username: 'admin',
        co2Saved: 87.3,
        tripsTaken: 64,
        ecoRank: 'Eco Master',
        userType: 'admin'
      };
      
      // Save to Chrome storage
      chrome.storage.sync.set({ userProfile }, () => {
        showStatus('Admin login successful! Welcome to EcoCommute.');
        console.log('Admin user profile saved to Chrome storage');
        
        // Close this tab after a short delay
        setTimeout(() => {
          window.close();
        }, 1500);
      });
      
      return true;
    }
    else {
      // For any other credentials, create a regular user profile
      const userProfile = {
        name: username, // Use username as name
        username: username,
        co2Saved: 0,
        tripsTaken: 0,
        ecoRank: 'Beginner',
        userType: 'regular'
      };
      
      // Save to Chrome storage
      chrome.storage.sync.set({ userProfile }, () => {
        showStatus('Login successful! Welcome to EcoCommute.');
        console.log('Regular user profile saved to Chrome storage');
        
        // Close this tab after a short delay
        setTimeout(() => {
          window.close();
        }, 1500);
      });
      
      return true;
    }
  }
  
  // Form submission handler
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
      showStatus('Please enter both username and password', true);
      return;
    }
    
    handleLogin(username, password);
  });
  
  // Quick login buttons
  quickLoginBeta.addEventListener('click', () => {
    handleLogin('newuser', '2025DEVChallenge');
  });
  
  quickLoginAdmin.addEventListener('click', () => {
    handleLogin('admin', '2025DEVChallenge');
  });
});
