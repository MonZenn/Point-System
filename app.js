// Configuration
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbywYhqDzyjkgnh9gcLiHBhg7-pTigJK-brRS3UIb6vf-6S5ooVjoW6X_440eGv4wZ2Oiw/exec';

// State
let userData = {
    username: '',
    points: 0,
    leisureMinutes: 0,
    leisureSeconds: 0  // Internal tracking in seconds for precision
};

let studyTimer = {
    isRunning: false,
    startTime: null,
    startTimestamp: null,
    elapsedSeconds: 0,
    intervalId: null
};

let leisureTimer = {
    isRunning: false,
    startTime: null,
    startTimestamp: null,
    elapsedSeconds: 0,
    intervalId: null
};

// Custom Modal Functions
function showAlert(message, title = 'Notice') {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-modal');
        const titleEl = document.getElementById('modal-title');
        const messageEl = document.getElementById('modal-message');
        const inputEl = document.getElementById('modal-input');
        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = document.getElementById('modal-cancel');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        inputEl.style.display = 'none';
        cancelBtn.style.display = 'none';
        
        modal.classList.add('active');
        
        const handleConfirm = () => {
            modal.classList.remove('active');
            confirmBtn.removeEventListener('click', handleConfirm);
            resolve(true);
        };
        
        confirmBtn.addEventListener('click', handleConfirm);
    });
}

function showPrompt(message, defaultValue = '', title = 'Input Required') {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-modal');
        const titleEl = document.getElementById('modal-title');
        const messageEl = document.getElementById('modal-message');
        const inputEl = document.getElementById('modal-input');
        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = document.getElementById('modal-cancel');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        inputEl.value = defaultValue;
        inputEl.style.display = 'block';
        cancelBtn.style.display = 'block';
        
        modal.classList.add('active');
        setTimeout(() => inputEl.focus(), 100);
        
        const cleanup = () => {
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            inputEl.removeEventListener('keypress', handleKeyPress);
        };
        
        const handleConfirm = () => {
            const value = inputEl.value.trim();
            modal.classList.remove('active');
            cleanup();
            resolve(value || null);
        };
        
        const handleCancel = () => {
            modal.classList.remove('active');
            cleanup();
            resolve(null);
        };
        
        const handleKeyPress = (e) => {
            if (e.key === 'Enter') handleConfirm();
            if (e.key === 'Escape') handleCancel();
        };
        
        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
        inputEl.addEventListener('keypress', handleKeyPress);
    });
}

function showConfirm(message, title = 'Confirm') {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-modal');
        const titleEl = document.getElementById('modal-title');
        const messageEl = document.getElementById('modal-message');
        const inputEl = document.getElementById('modal-input');
        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = document.getElementById('modal-cancel');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        inputEl.style.display = 'none';
        cancelBtn.style.display = 'block';
        confirmBtn.textContent = 'Yes';
        cancelBtn.textContent = 'No';
        
        modal.classList.add('active');
        
        const handleConfirm = () => {
            modal.classList.remove('active');
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            confirmBtn.textContent = 'OK';
            cancelBtn.textContent = 'Cancel';
            resolve(true);
        };
        
        const handleCancel = () => {
            modal.classList.remove('active');
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            confirmBtn.textContent = 'OK';
            cancelBtn.textContent = 'Cancel';
            resolve(false);
        };
        
        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
        console.log('Found saved username:', savedUsername);
        loadUserData(savedUsername);
    } else {
        console.log('No saved username, showing login screen');
    }

    // Update swap calculation on input
    const swapInput = document.getElementById('points-to-swap');
    if (swapInput) {
        swapInput.addEventListener('input', updateSwapCalculation);
    }

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed'));
    }
});

// Auth Functions
function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

function showLogin() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

async function register() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (!username || !password) {
        await showAlert('Please fill in all fields', 'Error');
        return;
    }

    if (password !== confirmPassword) {
        await showAlert('Passwords do not match', 'Error');
        return;
    }

    try {
        const url = `${APPS_SCRIPT_URL}?action=register&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
        console.log('Register URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow'
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const text = await response.text();
            console.error('Response text:', text);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('Response text:', text);
        const result = JSON.parse(text);

        if (result.success) {
            await showAlert('Registration successful! Please login.', 'Success');
            showLogin();
            // Clear form
            document.getElementById('register-username').value = '';
            document.getElementById('register-password').value = '';
            document.getElementById('register-confirm-password').value = '';
        } else {
            await showAlert(result.message || 'Registration failed - Username might already exist', 'Error');
        }
    } catch (error) {
        console.error('Registration error details:', error);
        await showAlert(`Registration Error: ${error.message}\n\nPossible causes:\n1. Username already exists\n2. Backend not properly deployed\n3. Check console for details (F12)`, 'Error');
    }
}

async function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        await showAlert('Please fill in all fields', 'Error');
        return;
    }

    try {
        const url = `${APPS_SCRIPT_URL}?action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
        console.log('Login URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow'
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
            const text = await response.text();
            console.error('Response text:', text);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('Response text:', text);
        const result = JSON.parse(text);

        if (result.success) {
            localStorage.setItem('username', username);
            userData = result.data;
            console.log('Logged in user data:', userData);
            showApp();
        } else {
            await showAlert(result.message || 'Login failed - Invalid username or password', 'Error');
        }
    } catch (error) {
        console.error('Login error details:', error);
        await showAlert(`Login Error: ${error.message}\n\nTroubleshooting:\n1. Make sure you deployed the UPDATED gas-backend.gs\n2. Check that deployment is set to 'Anyone' access\n3. Try opening the script URL directly in a new tab`, 'Error');
    }
}

function loadUserData(username) {
    const url = APPS_SCRIPT_URL + '?action=getUserData&username=' + encodeURIComponent(username);
    console.log('Loading user data:', url);
    
    fetch(url, {
        method: 'GET',
        redirect: 'follow'
    })
    .then(response => {
        console.log('Load data response status:', response.status);
        return response.text();
    })
    .then(text => {
        console.log('Load data response text:', text);
        const result = JSON.parse(text);
        if (result.success) {
            userData = result.data;
            console.log('User data loaded:', userData);
            showApp();
        } else {
            console.error('Failed to load user data:', result.message);
            localStorage.removeItem('username');
            showAlert('Session expired. Please login again.', 'Session Expired');
        }
    })
    .catch(error => {
        console.error('Load user data error:', error);
        localStorage.removeItem('username');
        showAlert('Failed to load your data. Please login again.', 'Error');
    });
}

function showApp() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
    // Use leisureSeconds from backend if available, otherwise calculate from leisureMinutes
    if (!userData.leisureSeconds && userData.leisureMinutes) {
        userData.leisureSeconds = userData.leisureMinutes * 60;
    }
    updateUI();
}

function logout() {
    localStorage.removeItem('username');
    location.reload();
}

// UI Update Functions
function updateUI() {
    console.log('Updating UI with userData:', userData);
    document.getElementById('username-display').textContent = userData.username || 'Unknown';
    document.getElementById('total-points').textContent = formatPoints(userData.points || 0);
    updateLeisureTimeDisplay();
}

function formatPoints(points) {
    return points.toLocaleString() + ' Pts';
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Tab Navigation
function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const targetTab = document.getElementById(tabName + '-tab');
    if (targetTab) {
        targetTab.classList.add('active');
    } else {
        console.error('Tab not found:', tabName);
        return;
    }

    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach((btn) => {
        btn.classList.remove('active');
    });

    // Determine which button to highlight
    const tabIndex = tabName === 'leisure' ? 0 : (tabName === 'home' ? 1 : 2);
    const navButtons = document.querySelectorAll('.nav-btn');
    if (navButtons[tabIndex]) {
        navButtons[tabIndex].classList.add('active');
    }
}

// Study Timer Functions
function toggleTimer() {
    const playBtn = document.getElementById('play-btn');
    
    if (studyTimer.isRunning) {
        // Stop timer
        stopStudyTimer();
        playBtn.classList.remove('playing');
    } else {
        // Start timer
        startStudyTimer();
        playBtn.classList.add('playing');
    }
}

function startStudyTimer() {
    studyTimer.isRunning = true;
    studyTimer.startTime = Date.now() - (studyTimer.elapsedSeconds * 1000);
    
    studyTimer.intervalId = setInterval(() => {
        studyTimer.elapsedSeconds = Math.floor((Date.now() - studyTimer.startTime) / 1000);
        document.getElementById('timer-display').textContent = formatTime(studyTimer.elapsedSeconds);
        
        // Update points gained
        const pointsGained = calculatePointsGained(studyTimer.elapsedSeconds);
        document.getElementById('points-gained').textContent = pointsGained + ' pts gained';
    }, 1000);
}

function stopStudyTimer() {
    studyTimer.isRunning = false;
    clearInterval(studyTimer.intervalId);
}

function calculatePointsGained(seconds) {
    // 100 points per 5 minutes (300 seconds)
    return Math.floor(seconds / 300) * 100;
}

async function resetSession() {
    if (studyTimer.isRunning) {
        stopStudyTimer();
        document.getElementById('play-btn').classList.remove('playing');
    }

    // Calculate and add points
    const pointsGained = calculatePointsGained(studyTimer.elapsedSeconds);
    
    if (pointsGained > 0) {
        userData.points += pointsGained;
        saveUserData();
        
        // Show feedback
        await showAlert(`Session complete! You earned ${pointsGained} points!`, 'Success');
    }

    // Reset timer
    studyTimer.elapsedSeconds = 0;
    document.getElementById('timer-display').textContent = '0:00';
    document.getElementById('points-gained').textContent = '0 pts gained';
    
    updateUI();
}

// Username Edit
async function editUsername() {
    const newUsername = await showPrompt('Enter new username:', userData.username, 'Edit Username');
    
    if (newUsername && newUsername !== userData.username) {
        const oldUsername = userData.username;
        userData.username = newUsername;
        
        // Update in database
        const url = `${APPS_SCRIPT_URL}?action=updateUsername&oldUsername=${encodeURIComponent(oldUsername)}&newUsername=${encodeURIComponent(userData.username)}`;
        console.log('Update username URL:', url);
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                redirect: 'follow'
            });
            
            console.log('Update response status:', response.status);
            const text = await response.text();
            console.log('Update response text:', text);
            const result = JSON.parse(text);
            
            if (result.success) {
                localStorage.setItem('username', userData.username);
                updateUI();
                await showAlert('Username updated successfully!', 'Success');
            } else {
                userData.username = oldUsername;
                await showAlert('Failed to update username: ' + (result.message || 'Unknown error'), 'Error');
            }
        } catch (error) {
            console.error('Update username error:', error);
            userData.username = oldUsername;
            await showAlert('Failed to update username: ' + error.message, 'Error');
        }
    }
}

// Shop Functions
function updateSwapCalculation() {
    const points = parseInt(document.getElementById('points-to-swap').value) || 0;
    const minutes = Math.floor(points / 2);
    document.getElementById('swap-result').textContent = `= ${minutes} minutes`;
}

async function swapPoints() {
    const pointsToSwap = parseInt(document.getElementById('points-to-swap').value) || 0;
    
    if (pointsToSwap <= 0) {
        await showAlert('Please enter a valid amount of points', 'Error');
        return;
    }

    if (pointsToSwap > userData.points) {
        await showAlert("You don't have enough points!", 'Error');
        return;
    }

    if (pointsToSwap % 2 !== 0) {
        await showAlert('Points must be an even number (2 points = 1 minute)', 'Error');
        return;
    }

    const minutesGained = Math.floor(pointsToSwap / 2);
    
    const confirmed = await showConfirm(`Swap ${pointsToSwap} points for ${minutesGained} minutes of leisure time?`, 'Confirm Swap');
    
    if (confirmed) {
        userData.points -= pointsToSwap;
        userData.leisureMinutes += minutesGained;
        // Add the new seconds to existing leisure seconds
        userData.leisureSeconds = (userData.leisureSeconds || 0) + (minutesGained * 60);
        
        saveUserData();
        updateUI();
        
        document.getElementById('points-to-swap').value = '';
        document.getElementById('swap-result').textContent = '= 0 minutes';
        
        await showAlert(`Success! You gained ${minutesGained} minutes of leisure time!`, 'Success');
    }
}

async function addAchievementPoints() {
    const confirmed = await showConfirm('Add 500 achievement points?', 'Achievement Bonus');
    if (confirmed) {
        userData.points += 500;
        saveUserData();
        updateUI();
        await showAlert('500 points added!', 'Success');
    }
}

// Leisure Timer Functions
function updateLeisureTimeDisplay() {
    const totalMinutes = userData.leisureMinutes || 0;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    let displayText;
    if (hours > 0) {
        displayText = `${hours}:${minutes.toString().padStart(2, '0')}`;
    } else {
        displayText = `${minutes}:00`;
    }
    
    document.getElementById('leisure-time-display').textContent = displayText;
    
    // Update current session display when not running
    if (!leisureTimer.isRunning) {
        document.getElementById('leisure-timer-display').textContent = formatTime(userData.leisureSeconds || 0);
    }
}

async function toggleLeisureTimer() {
    const leisureBtn = document.getElementById('leisure-play-btn');
    
    if (leisureTimer.isRunning) {
        // Stop timer
        stopLeisureTimer();
        leisureBtn.classList.remove('playing');
        leisureBtn.innerHTML = `
            <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
            </svg>
            <span>Start Leisure</span>
        `;
    } else {
        // Check if there's leisure time available
        if (!userData.leisureSeconds || userData.leisureSeconds === 0) {
            await showAlert('No leisure time available! Swap points in the Shop to get leisure time.', 'No Leisure Time');
            return;
        }
        
        // Start timer
        startLeisureTimer();
        leisureBtn.classList.add('playing');
        leisureBtn.innerHTML = `
            <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
            <span>Stop Leisure</span>
        `;
    }
}

function startLeisureTimer() {
    leisureTimer.isRunning = true;
    leisureTimer.startTimestamp = Date.now();
    leisureTimer.elapsedSeconds = 0;
    
    leisureTimer.intervalId = setInterval(() => {
        // Calculate elapsed time from timestamp for accuracy
        leisureTimer.elapsedSeconds = Math.floor((Date.now() - leisureTimer.startTimestamp) / 1000);
        
        // Calculate remaining time
        const remainingSeconds = userData.leisureSeconds - leisureTimer.elapsedSeconds;
        
        if (remainingSeconds <= 0) {
            // Time's up!
            stopLeisureTimer();
            userData.leisureMinutes = 0;
            userData.leisureSeconds = 0;
            saveUserData();
            updateUI();
            document.getElementById('leisure-timer-display').textContent = '0:00';
            document.getElementById('leisure-play-btn').classList.remove('playing');
            document.getElementById('leisure-play-btn').innerHTML = `
                <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                </svg>
                <span>Start Leisure</span>
            `;
            showAlert("Leisure time is up!", 'Time Expired');
            return;
        }
        
        document.getElementById('leisure-timer-display').textContent = formatTime(remainingSeconds);
    }, 1000);
}

function stopLeisureTimer() {
    leisureTimer.isRunning = false;
    clearInterval(leisureTimer.intervalId);
    
    // Subtract exact seconds used
    userData.leisureSeconds = Math.max(0, userData.leisureSeconds - leisureTimer.elapsedSeconds);
    // Update leisureMinutes for database storage (convert back to minutes)
    userData.leisureMinutes = Math.floor(userData.leisureSeconds / 60);
    
    console.log(`Leisure timer stopped. Seconds used: ${leisureTimer.elapsedSeconds}, Remaining seconds: ${userData.leisureSeconds}, Remaining minutes: ${userData.leisureMinutes}`);
    
    leisureTimer.elapsedSeconds = 0;
    leisureTimer.startTimestamp = null;
    
    saveUserData();
    updateUI();
}

// Data Persistence
async function saveUserData() {
    try {
        const url = `${APPS_SCRIPT_URL}?action=updateUserData&username=${encodeURIComponent(userData.username)}&points=${userData.points}&leisureSeconds=${userData.leisureSeconds}`;
        console.log('Saving user data:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow'
        });
        
        const text = await response.text();
        console.log('Save response:', text);
        const result = JSON.parse(text);
        
        if (!result.success) {
            console.error('Failed to save user data:', result.message);
        } else {
            console.log('User data saved successfully');
        }
    } catch (error) {
        console.error('Save user data error:', error);
    }
}

// Handle page visibility for background timer support
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Page became visible - recalculate timers
        console.log('Page became visible, recalculating timers...');
        
        if (studyTimer.isRunning && studyTimer.startTime) {
            // Recalculate study timer
            studyTimer.elapsedSeconds = Math.floor((Date.now() - studyTimer.startTime) / 1000);
            document.getElementById('timer-display').textContent = formatTime(studyTimer.elapsedSeconds);
            const pointsGained = calculatePointsGained(studyTimer.elapsedSeconds);
            document.getElementById('points-gained').textContent = pointsGained + ' pts gained';
            console.log(`Study timer updated: ${studyTimer.elapsedSeconds}s elapsed`);
        }
        
        if (leisureTimer.isRunning && leisureTimer.startTimestamp) {
            // Recalculate leisure timer
            leisureTimer.elapsedSeconds = Math.floor((Date.now() - leisureTimer.startTimestamp) / 1000);
            const remainingSeconds = userData.leisureSeconds - leisureTimer.elapsedSeconds;
            
            if (remainingSeconds <= 0) {
                // Time's up while in background
                stopLeisureTimer();
                userData.leisureMinutes = 0;
                userData.leisureSeconds = 0;
                saveUserData();
                updateUI();
                document.getElementById('leisure-timer-display').textContent = '0:00';
                document.getElementById('leisure-play-btn').classList.remove('playing');
                document.getElementById('leisure-play-btn').innerHTML = `
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    <span>Start Leisure</span>
                `;
                showAlert("Leisure time is up!", 'Time Expired');
            } else {
                document.getElementById('leisure-timer-display').textContent = formatTime(remainingSeconds);
                console.log(`Leisure timer updated: ${leisureTimer.elapsedSeconds}s elapsed, ${remainingSeconds}s remaining`);
            }
        }
    }
});

// Prevent data loss on page unload
window.addEventListener('beforeunload', (e) => {
    if (studyTimer.isRunning || leisureTimer.isRunning) {
        e.preventDefault();
        e.returnValue = '';
    }
});
