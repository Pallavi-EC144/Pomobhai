// ========================================
// POMOBAHI - Pomodoro Timer
// ========================================

// ========================================
// STATE
// ========================================
let state = {
    timeLeft: 25 * 60,
    timer: null,
    isRunning: false,
    currentMode: 'focus',
    sessionsToday: 0,
    totalSessions: 0,
    totalFocusTime: 0, // in minutes
    settings: {
        focus: 25,
        shortBreak: 5,
        longBreak: 15
    }
};

// ========================================
// DOM ELEMENTS
// ========================================
const DOM = {
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    progressRing: document.getElementById('progressRing'),
    currentMode: document.getElementById('current-mode'),
    sessionCount: document.getElementById('sessionCount'),
    todaySessions: document.getElementById('todaySessions'),
    totalSessions: document.getElementById('totalSessions'),
    focusTime: document.getElementById('focusTime'),
    
    startBtn: document.getElementById('startBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
    skipBtn: document.getElementById('skipBtn'),
    
    focusMode: document.getElementById('focusMode'),
    shortBreak: document.getElementById('shortBreak'),
    longBreak: document.getElementById('longBreak'),
    
    focusDuration: document.getElementById('focusDuration'),
    shortBreakDuration: document.getElementById('shortBreakDuration'),
    longBreakDuration: document.getElementById('longBreakDuration'),
    saveSettings: document.getElementById('saveSettings'),
};

// ========================================
// CONSTANTS
// ========================================
const CIRCUMFERENCE = 691.15; // 2 * PI * 110

// ========================================
// INITIALIZATION
// ========================================
function init() {
    loadFromLocalStorage();
    setMode('focus');
    updateUI();
    setupEventListeners();
    console.log('🍅 Pomobhai initialized!');
    console.log('Controls: Space = Start/Pause, R = Reset, S = Skip');
}

// ========================================
// CORE FUNCTIONS
// ========================================
function setMode(mode) {
    state.currentMode = mode;
    const duration = state.settings[mode];
    state.timeLeft = duration * 60;
    pauseTimer();
    updateUI();
    updateActiveButton();
}

function startTimer() {
    if (state.isRunning) return;
    
    if (state.timeLeft === 0) {
        setMode(state.currentMode);
    }
    
    state.isRunning = true;
    DOM.startBtn.textContent = '▶ Running';
    DOM.startBtn.style.opacity = '0.7';
    document.querySelector('.timer-text').classList.add('running');
    
    state.timer = setInterval(() => {
        state.timeLeft--;
        updateUI();
        
        if (state.timeLeft === 0) {
            clearInterval(state.timer);
            state.isRunning = false;
            DOM.startBtn.textContent = '▶ Start';
            DOM.startBtn.style.opacity = '1';
            document.querySelector('.timer-text').classList.remove('running');
            
            // Handle session completion
            handleSessionComplete();
            
            // Play sound and show notification
            playSound();
            showNotification();
        }
    }, 1000);
}

function pauseTimer() {
    if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
        state.isRunning = false;
        DOM.startBtn.textContent = '▶ Start';
        DOM.startBtn.style.opacity = '1';
        document.querySelector('.timer-text').classList.remove('running');
    }
}

function resetTimer() {
    pauseTimer();
    setMode(state.currentMode);
}

function skipTimer() {
    pauseTimer();
    state.timeLeft = 0;
    updateUI();
    handleSessionComplete();
}

// ========================================
// SESSION MANAGEMENT
// ========================================
function handleSessionComplete() {
    if (state.currentMode === 'focus') {
        state.sessionsToday++;
        state.totalSessions++;
        state.totalFocusTime += state.settings.focus;
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Update UI
        updateUI();
        
        // Auto-start next mode (focus -> short break)
        const nextMode = state.sessionsToday % 4 === 0 ? 'longBreak' : 'shortBreak';
        setTimeout(() => {
            setMode(nextMode);
            startTimer();
        }, 3000); // Wait 3 seconds before starting next session
    } else {
        // Break ended, go back to focus
        setTimeout(() => {
            setMode('focus');
        }, 2000);
    }
}

// ========================================
// UI UPDATE FUNCTIONS
// ========================================
function updateUI() {
    // Update timer display
    const mins = Math.floor(state.timeLeft / 60);
    const secs = state.timeLeft % 60;
    DOM.minutes.textContent = String(mins).padStart(2, '0');
    DOM.seconds.textContent = String(secs).padStart(2, '0');
    
    // Update progress ring
    const totalSeconds = state.settings[state.currentMode] * 60;
    const progress = 1 - (state.timeLeft / totalSeconds);
    const offset = CIRCUMFERENCE * progress;
    DOM.progressRing.style.strokeDashoffset = offset;
    
    // Update mode display
    const modeNames = {
        focus: '🎯 Focus',
        shortBreak: '☕ Short Break',
        longBreak: '🌙 Long Break'
    };
    DOM.currentMode.textContent = modeNames[state.currentMode];
    
    // Update statistics
    DOM.sessionCount.textContent = `Sessions: ${state.sessionsToday}`;
    DOM.todaySessions.textContent = state.sessionsToday;
    DOM.totalSessions.textContent = state.totalSessions;
    
    const hours = Math.floor(state.totalFocusTime / 60);
    const minutes = state.totalFocusTime % 60;
    DOM.focusTime.textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function updateActiveButton() {
    const buttons = [DOM.focusMode, DOM.shortBreak, DOM.longBreak];
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (state.currentMode === 'focus') DOM.focusMode.classList.add('active');
    else if (state.currentMode === 'shortBreak') DOM.shortBreak.classList.add('active');
    else if (state.currentMode === 'longBreak') DOM.longBreak.classList.add('active');
}

// ========================================
// SOUND & NOTIFICATIONS
// ========================================
function playSound() {
    try {
        // Create a simple beep using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 880;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
        
        // Play a second beep
        setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.frequency.value = 880;
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            osc2.start();
            osc2.stop(audioContext.currentTime + 0.5);
        }, 200);
    } catch (e) {
        console.log('Audio not available');
    }
}

function showNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        const modeNames = {
            focus: 'Focus session',
            shortBreak: 'Short break',
            longBreak: 'Long break'
        };
        new Notification(`🍅 ${modeNames[state.currentMode]} complete!`, {
            body: `Time to ${state.currentMode === 'focus' ? 'take a break' : 'get back to work'}!`,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍅</text></svg>'
        });
    } else if ('Notification' in window) {
        Notification.requestPermission();
    }
}

// ========================================
// LOCAL STORAGE
// ========================================
function saveToLocalStorage() {
    try {
        const data = {
            sessionsToday: state.sessionsToday,
            totalSessions: state.totalSessions,
            totalFocusTime: state.totalFocusTime,
            settings: state.settings,
            date: new Date().toDateString()
        };
        localStorage.setItem('pomobhaiData', JSON.stringify(data));
    } catch (e) {
        console.log('Could not save to localStorage');
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('pomobhaiData');
        if (saved) {
            const data = JSON.parse(saved);
            
            // Check if it's a new day
            if (data.date !== new Date().toDateString()) {
                state.sessionsToday = 0;
            } else {
                state.sessionsToday = data.sessionsToday || 0;
            }
            
            state.totalSessions = data.totalSessions || 0;
            state.totalFocusTime = data.totalFocusTime || 0;
            state.settings = data.settings || state.settings;
            
            // Update input fields
            DOM.focusDuration.value = state.settings.focus;
            DOM.shortBreakDuration.value = state.settings.shortBreak;
            DOM.longBreakDuration.value = state.settings.longBreak;
        }
    } catch (e) {
        console.log('Could not load from localStorage');
    }
}

// ========================================
// SETTINGS
// ========================================
function saveSettings() {
    const focus = parseInt(DOM.focusDuration.value);
    const shortBreak = parseInt(DOM.shortBreakDuration.value);
    const longBreak = parseInt(DOM.longBreakDuration.value);
    
    if (focus < 1 || shortBreak < 1 || longBreak < 1) {
        alert('Please enter values greater than 0');
        return;
    }
    
    state.settings.focus = focus;
    state.settings.shortBreak = shortBreak;
    state.settings.longBreak = longBreak;
    
    // Reset timer with new settings
    pauseTimer();
    setMode(state.currentMode);
    saveToLocalStorage();
    
    // Show feedback
    DOM.saveSettings.textContent = '✅ Saved!';
    setTimeout(() => {
        DOM.saveSettings.textContent = '💾 Save Settings';
    }, 2000);
}

// ========================================
// EVENT LISTENERS
// ========================================
function setupEventListeners() {
    // Control buttons
    DOM.startBtn.addEventListener('click', startTimer);
    DOM.pauseBtn.addEventListener('click', pauseTimer);
    DOM.resetBtn.addEventListener('click', resetTimer);
    DOM.skipBtn.addEventListener('click', skipTimer);
    
    // Mode buttons
    DOM.focusMode.addEventListener('click', () => {
        pauseTimer();
        setMode('focus');
    });
    DOM.shortBreak.addEventListener('click', () => {
        pauseTimer();
        setMode('shortBreak');
    });
    DOM.longBreak.addEventListener('click', () => {
        pauseTimer();
        setMode('longBreak');
    });
    
    // Settings
    DOM.saveSettings.addEventListener('click', saveSettings);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Space: Start/Pause
        if (e.key === ' ' || e.key === 'Space') {
            e.preventDefault();
            if (state.isRunning) {
                pauseTimer();
            } else {
                startTimer();
            }
        }
        // R: Reset
        if (e.key === 'r' || e.key === 'R') {
            resetTimer();
        }
        // S: Skip
        if (e.key === 's' || e.key === 'S') {
            skipTimer();
        }
    });
    
    // Request notification permission on first click
    document.addEventListener('click', () => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, { once: true });
}

// ========================================
// START THE APP
// ========================================
init();
