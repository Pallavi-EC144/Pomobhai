// ========================================
// POMOBAHI - Complete Timer & Alarm System
// ========================================

// ========================================
// STATE
// ========================================
let state = {
    // Pomodoro
    timeLeft: 25 * 60,
    timer: null,
    isRunning: false,
    currentMode: 'focus',
    sessionsToday: 0,
    totalSessions: 0,
    totalFocusTime: 0,
    settings: {
        focus: 25,
        shortBreak: 5,
        longBreak: 15
    },
    
    // Timer
    timerTimeLeft: 5 * 60,
    timerRunning: false,
    timerInterval: null,
    timerTotalSeconds: 5 * 60,
    
    // Alarm
    alarmTime: null,
    alarmInterval: null,
    alarmRinging: false,
    alarmSound: 'beep'
};

// ========================================
// DOM ELEMENTS
// ========================================
const DOM = {
    // Pomodoro
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
    
    // Timer
    timerMinutes: document.getElementById('timerMinutes'),
    timerSeconds: document.getElementById('timerSeconds'),
    timerProgressRing: document.getElementById('timerProgressRing'),
    timerHours: document.getElementById('timerHours'),
    timerMinutesInput: document.getElementById('timerMinutesInput'),
    timerSecondsInput: document.getElementById('timerSecondsInput'),
    timerStartBtn: document.getElementById('timerStartBtn'),
    timerPauseBtn: document.getElementById('timerPauseBtn'),
    timerResetBtn: document.getElementById('timerResetBtn'),
    timerStatus: document.getElementById('timerStatus'),
    
    // Alarm
    alarmHours: document.getElementById('alarmHours'),
    alarmMinutes: document.getElementById('alarmMinutes'),
    alarmStatus: document.getElementById('alarmStatus'),
    alarmHoursInput: document.getElementById('alarmHoursInput'),
    alarmMinutesInput: document.getElementById('alarmMinutesInput'),
    alarmAmPm: document.getElementById('alarmAmPm'),
    alarmSetBtn: document.getElementById('alarmSetBtn'),
    alarmStopBtn: document.getElementById('alarmStopBtn'),
    alarmSetTime: document.getElementById('alarmSetTime'),
    alarmTimeUntil: document.getElementById('alarmTimeUntil'),
    alarmSoundSelect: document.getElementById('alarmSoundSelect'),
    
    // Settings
    focusDuration: document.getElementById('focusDuration'),
    shortBreakDuration: document.getElementById('shortBreakDuration'),
    longBreakDuration: document.getElementById('longBreakDuration'),
    saveSettings: document.getElementById('saveSettings'),
    
    // Tabs
    pomodoroTab: document.getElementById('pomodoroTab'),
    timerTab: document.getElementById('timerTab'),
    alarmTab: document.getElementById('alarmTab'),
    pomodoroTabContent: document.getElementById('pomodoroTabContent'),
    timerTabContent: document.getElementById('timerTabContent'),
    alarmTabContent: document.getElementById('alarmTabContent')
};

// ========================================
// CONSTANTS
// ========================================
const CIRCUMFERENCE = 691.15;

// ========================================
// INITIALIZATION
// ========================================
function init() {
    loadFromLocalStorage();
    setMode('focus');
    updateUI();
    setupEventListeners();
    updateAlarmDisplay();
    console.log('🍅 Pomobhai initialized!');
    console.log('Controls: Space = Start/Pause, R = Reset, S = Skip');
}

// ========================================
// POMODORO FUNCTIONS
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
            
            handleSessionComplete();
            playAlarmSound('beep');
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

function handleSessionComplete() {
    if (state.currentMode === 'focus') {
        state.sessionsToday++;
        state.totalSessions++;
        state.totalFocusTime += state.settings.focus;
        saveToLocalStorage();
        updateUI();
        
        const nextMode = state.sessionsToday % 4 === 0 ? 'longBreak' : 'shortBreak';
        setTimeout(() => {
            setMode(nextMode);
            startTimer();
        }, 3000);
    } else {
        setTimeout(() => {
            setMode('focus');
        }, 2000);
    }
}

// ========================================
// TIMER FUNCTIONS
// ========================================
function startTimerMode() {
    if (state.timerRunning) return;
    
    const hours = parseInt(DOM.timerHours.value) || 0;
    const minutes = parseInt(DOM.timerMinutesInput.value) || 0;
    const seconds = parseInt(DOM.timerSecondsInput.value) || 0;
    
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    
    if (totalSeconds === 0) {
        DOM.timerStatus.textContent = '⚠️ Please set a time';
        return;
    }
    
    if (state.timerTimeLeft === 0 || state.timerTimeLeft !== totalSeconds) {
        state.timerTimeLeft = totalSeconds;
        state.timerTotalSeconds = totalSeconds;
    }
    
    state.timerRunning = true;
    DOM.timerStatus.textContent = '⏱️ Running...';
    DOM.timerStartBtn.textContent = '▶ Running';
    DOM.timerStartBtn.style.opacity = '0.7';
    
    state.timerInterval = setInterval(() => {
        state.timerTimeLeft--;
        updateTimerDisplay();
        
        if (state.timerTimeLeft === 0) {
            clearInterval(state.timerInterval);
            state.timerRunning = false;
            DOM.timerStatus.textContent = '⏰ Time\'s Up!';
            DOM.timerStartBtn.textContent = '▶ Start';
            DOM.timerStartBtn.style.opacity = '1';
            playAlarmSound('urgent');
            showTimerNotification();
        }
    }, 1000);
}

function pauseTimerMode() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        state.timerRunning = false;
        DOM.timerStatus.textContent = '⏸️ Paused';
        DOM.timerStartBtn.textContent = '▶ Start';
        DOM.timerStartBtn.style.opacity = '1';
    }
}

function resetTimerMode() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        state.timerRunning = false;
    }
    
    const hours = parseInt(DOM.timerHours.value) || 0;
    const minutes = parseInt(DOM.timerMinutesInput.value) || 0;
    const seconds = parseInt(DOM.timerSecondsInput.value) || 0;
    
    state.timerTimeLeft = hours * 3600 + minutes * 60 + seconds;
    state.timerTotalSeconds = state.timerTimeLeft;
    state.timerRunning = false;
    
    DOM.timerStatus.textContent = '⏸️ Reset';
    DOM.timerStartBtn.textContent = '▶ Start';
    DOM.timerStartBtn.style.opacity = '1';
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const hours = Math.floor(state.timerTimeLeft / 3600);
    const minutes = Math.floor((state.timerTimeLeft % 3600) / 60);
    const seconds = state.timerTimeLeft % 60;
    
    DOM.timerMinutes.textContent = String(hours * 60 + minutes).padStart(2, '0');
    DOM.timerSeconds.textContent = String(seconds).padStart(2, '0');
    
    // Update progress ring
    if (state.timerTotalSeconds > 0) {
        const progress = 1 - (state.timerTimeLeft / state.timerTotalSeconds);
        const offset = CIRCUMFERENCE * progress;
        DOM.timerProgressRing.style.strokeDashoffset = offset;
    }
}

// ========================================
// ALARM FUNCTIONS
// ========================================
function setAlarm() {
    let hours = parseInt(DOM.alarmHoursInput.value) || 0;
    let minutes = parseInt(DOM.alarmMinutesInput.value) || 0;
    const ampm = DOM.alarmAmPm.value;
    
    // Convert to 24-hour format
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    const now = new Date();
    const alarmDate = new Date();
    alarmDate.setHours(hours, minutes, 0, 0);
    
    // If alarm time is in the past, set for tomorrow
    if (alarmDate <= now) {
        alarmDate.setDate(alarmDate.getDate() + 1);
    }
    
    state.alarmTime = alarmDate;
    DOM.alarmSetTime.textContent = alarmDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
    
    DOM.alarmStatus.textContent = '⏰ Alarm SET';
    DOM.alarmStatus.className = 'alarm-status active';
    
    // Check alarm every second
    if (state.alarmInterval) clearInterval(state.alarmInterval);
    
    state.alarmInterval = setInterval(() => {
        const now = new Date();
        const diff = state.alarmTime - now;
        
        // Update time until
        if (diff > 0) {
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            DOM.alarmTimeUntil.textContent = 
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else {
            DOM.alarmTimeUntil.textContent = '🔔 NOW!';
        }
        
        // Check if it's time to ring
        if (state.alarmTime && now >= state.alarmTime && !state.alarmRinging) {
            triggerAlarm();
        }
    }, 1000);
    
    // Update alarm display
    updateAlarmDisplay();
}

function triggerAlarm() {
    state.alarmRinging = true;
    DOM.alarmStatus.textContent = '🔔 ALARM RINGING!';
    DOM.alarmStatus.className = 'alarm-status ringing';
    document.querySelector('.alarm-display').classList.add('alarm-ringing');
    
    // Play alarm sound continuously
    playAlarmSound(state.alarmSound, true);
    
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🔔 Alarm!', {
            body: 'Time to wake up!',
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔔</text></svg>'
        });
    }
}

function stopAlarm() {
    state.alarmRinging = false;
    state.alarmTime = null;
    
    if (state.alarmInterval) {
        clearInterval(state.alarmInterval);
        state.alarmInterval = null;
    }
    
    DOM.alarmStatus.textContent = '⏰ Alarm stopped';
    DOM.alarmStatus.className = 'alarm-status';
    DOM.alarmSetTime.textContent = 'Not Set';
    DOM.alarmTimeUntil.textContent = '--:--';
    document.querySelector('.alarm-display').classList.remove('alarm-ringing');
}

function updateAlarmDisplay() {
    if (state.alarmTime) {
        const hours = state.alarmTime.getHours();
        const minutes = state.alarmTime.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        
        DOM.alarmHours.textContent = String(displayHours).padStart(2, '0');
        DOM.alarmMinutes.textContent = String(minutes).padStart(2, '0');
    } else {
        DOM.alarmHours.textContent = '00';
        DOM.alarmMinutes.textContent = '00';
    }
}

// ========================================
// ALARM SOUND SYSTEM
// ========================================
let alarmAudioContext = null;
let alarmOscillators = [];
let alarmGainNodes = [];
let isAlarmPlaying = false;

function playAlarmSound(type = 'beep', loop = false) {
    try {
        if (isAlarmPlaying && loop) return;
        if (isAlarmPlaying && !loop) {
            // Stop current sound and play new one
            stopAlarmSound();
        }
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        alarmAudioContext = audioContext;
        
        const sounds = {
            'beep': { frequency: 880, type: 'sine', pattern: [0.2, 0.1] },
            'gentle': { frequency: 523.25, type: 'sine', pattern: [0.3, 0.2] },
            'urgent': { frequency: 1000, type: 'square', pattern: [0.1, 0.1] },
            'phone': { frequency: 440, type: 'sawtooth', pattern: [0.15, 0.15] }
        };
        
        const sound = sounds[type] || sounds['beep'];
        isAlarmPlaying = true;
        
        function playBeep() {
            if (!isAlarmPlaying) return;
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = sound.frequency;
            oscillator.type = sound.type;
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.pattern[0]);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + sound.pattern[0]);
            
            alarmOscillators.push(oscillator);
            alarmGainNodes.push(gainNode);
            
            if (loop && isAlarmPlaying) {
                setTimeout(() => {
                    if (isAlarmPlaying) playBeep();
                }, (sound.pattern[0] + sound.pattern[1]) * 1000);
            }
        }
        
        // Play 3 beeps for non-looping
        if (!loop) {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => playBeep(), i * 400);
            }
            setTimeout(() => { isAlarmPlaying = false; }, 1500);
        } else {
            playBeep();
        }
    } catch (e) {
        console.log('Audio not available');
    }
}

function stopAlarmSound() {
    isAlarmPlaying = false;
    alarmOscillators.forEach(osc => {
        try { osc.stop(); } catch(e) {}
    });
    alarmOscillators = [];
    alarmGainNodes = [];
    if (alarmAudioContext) {
        try { alarmAudioContext.close(); } catch(e) {}
        alarmAudioContext = null;
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
// NOTIFICATIONS
// ========================================
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

function showTimerNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⏱️ Timer Complete!', {
            body: 'Your countdown timer has finished!',
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⏱️</text></svg>'
        });
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
            
            if (data.date !== new Date().toDateString()) {
                state.sessionsToday = 0;
            } else {
                state.sessionsToday = data.sessionsToday || 0;
            }
            
            state.totalSessions = data.totalSessions || 0;
            state.totalFocusTime = data.totalFocusTime || 0;
            state.settings = data.settings || state.settings;
            
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
    
    pauseTimer();
    setMode(state.currentMode);
    saveToLocalStorage();
    
    DOM.saveSettings.textContent = '✅ Saved!';
    setTimeout(() => {
        DOM.saveSettings.textContent = '💾 Save Settings';
    }, 2000);
}

// ========================================
// TAB SWITCHING
// ========================================
function switchTab(tab) {
    // Hide all tab contents
    DOM.pomodoroTabContent.classList.remove('active');
    DOM.timerTabContent.classList.remove('active');
    DOM.alarmTabContent.classList.remove('active');
    
    // Remove active class from all tabs
    DOM.pomodoroTab.classList.remove('active');
    DOM.timerTab.classList.remove('active');
    DOM.alarmTab.classList.remove('active');
    
    // Show selected tab
    if (tab === 'pomodoro') {
        DOM.pomodoroTabContent.classList.add('active');
        DOM.pomodoroTab.classList.add('active');
    } else if (tab === 'timer') {
        DOM.timerTabContent.classList.add('active');
        DOM.timerTab.classList.add('active');
        // Update timer display when switching to timer tab
        updateTimerDisplay();
    } else if (tab === 'alarm') {
        DOM.alarmTabContent.classList.add('active');
        DOM.alarmTab.classList.add('active');
        updateAlarmDisplay();
    }
}

// ========================================
// EVENT LISTENERS
// ========================================
function setupEventListeners() {
    // ===== Pomodoro Controls =====
    DOM.startBtn.addEventListener('click', startTimer);
    DOM.pauseBtn.addEventListener('click', pauseTimer);
    DOM.resetBtn.addEventListener('click', resetTimer);
    DOM.skipBtn.addEventListener('click', skipTimer);
    
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
    
    // ===== Timer Controls =====
    DOM.timerStartBtn.addEventListener('click', startTimerMode);
    DOM.timerPauseBtn.addEventListener('click', pauseTimerMode);
    DOM.timerResetBtn.addEventListener('click', resetTimerMode);
    
    // Update timer when inputs change
    [DOM.timerHours, DOM.timerMinutesInput, DOM.timerSecondsInput].forEach(input => {
        input.addEventListener('change', resetTimerMode);
    });
    
    // ===== Alarm Controls =====
    DOM.alarmSetBtn.addEventListener('click', setAlarm);
    DOM.alarmStopBtn.addEventListener('click', () => {
        stopAlarm();
        stopAlarmSound();
    });
    
    DOM.alarmSoundSelect.addEventListener('change', (e) => {
        state.alarmSound = e.target.value;
    });
    
    // ===== Settings =====
    DOM.saveSettings.addEventListener('click', saveSettings);
    
    // ===== Tabs =====
    DOM.pomodoroTab.addEventListener('click', () => switchTab('pomodoro'));
    DOM.timerTab.addEventListener('click', () => switchTab('timer'));
    DOM.alarmTab.addEventListener('click', () => switchTab('alarm'));
    
    // ===== Keyboard Shortcuts =====
    document.addEventListener('keydown', (e) => {
        // Only for pomodoro tab
        if (!DOM.pomodoroTabContent.classList.contains('active')) return;
        
        if (e.key === ' ' || e.key === 'Space') {
            e.preventDefault();
            if (state.isRunning) {
                pauseTimer();
            } else {
                startTimer();
            }
        }
        if (e.key === 'r' || e.key === 'R') {
            resetTimer();
        }
        if (e.key === 's' || e.key === 'S') {
            skipTimer();
        }
    });
    
    // ===== Notification Permission =====
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
