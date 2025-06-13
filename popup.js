class FocusTimer {
  constructor() {
    this.timerSelectionEl = document.getElementById('timer-selection');
    this.activeTimerEl = document.getElementById('active-timer');
    this.completionMessageEl = document.getElementById('completion-message');
    this.timeRemainingEl = document.getElementById('time-remaining');
    this.stopTimerBtn = document.getElementById('stop-timer');
    this.newSessionBtn = document.getElementById('new-session');
    this.progressRing = document.querySelector('.progress-ring-progress');
    
    this.circumference = 2 * Math.PI * 50; // radius = 50
    this.progressRing.style.strokeDasharray = this.circumference;
    this.progressRing.style.strokeDashoffset = this.circumference;
    
    this.init();
  }

  init() {
    this.checkActiveTimer();
    this.bindEvents();
  }

  async checkActiveTimer() {
    const result = await chrome.storage.local.get(['focusTimer']);
    const timerData = result.focusTimer;
    
    if (timerData && timerData.isActive) {
      const now = Date.now();
      const elapsed = now - timerData.startTime;
      const remaining = timerData.duration - elapsed;
      
      if (remaining > 0) {
        this.showActiveTimer(remaining, timerData.duration);
        this.startCountdown(remaining);
      } else {
        this.completeTimer();
      }
    }
  }

  bindEvents() {
    // Timer selection buttons
    document.querySelectorAll('.timer-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const minutes = parseInt(e.currentTarget.dataset.minutes);
        this.startTimer(minutes);
      });
    });

    // Stop timer button
    this.stopTimerBtn.addEventListener('click', () => {
      this.stopTimer();
    });

    // New session button
    this.newSessionBtn.addEventListener('click', () => {
      this.resetToSelection();
    });
  }

  async startTimer(minutes) {
    const duration = minutes * 60 * 1000; // Convert to milliseconds
    const startTime = Date.now();
    
    const timerData = {
      isActive: true,
      duration: duration,
      startTime: startTime,
      minutes: minutes
    };

    await chrome.storage.local.set({ focusTimer: timerData });
    
    // Send message to background script to start monitoring
    chrome.runtime.sendMessage({
      action: 'startFocusTimer',
      duration: duration,
      minutes: minutes
    });

    this.showActiveTimer(duration, duration);
    this.startCountdown(duration);
  }

  showActiveTimer(remaining, totalDuration) {
    this.timerSelectionEl.classList.add('hidden');
    this.activeTimerEl.classList.remove('hidden');
    this.completionMessageEl.classList.add('hidden');
    
    this.updateProgress(remaining, totalDuration);
  }

  startCountdown(remaining) {
    const totalDuration = remaining;
    let timeLeft = remaining;
    
    const updateTimer = () => {
      if (timeLeft <= 0) {
        this.completeTimer();
        return;
      }
      
      this.updateDisplay(timeLeft);
      this.updateProgress(timeLeft, totalDuration);
      timeLeft -= 1000;
    };
    
    updateTimer(); // Initial update
    this.countdownInterval = setInterval(updateTimer, 1000);
  }

  updateDisplay(timeLeft) {
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    
    this.timeRemainingEl.textContent = 
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  updateProgress(remaining, total) {
    const progress = (total - remaining) / total;
    const offset = this.circumference - (progress * this.circumference);
    this.progressRing.style.strokeDashoffset = offset;
  }

  async completeTimer() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    
    await chrome.storage.local.remove('focusTimer');
    
    chrome.runtime.sendMessage({
      action: 'stopFocusTimer'
    });

    this.showCompletion();
    
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon48.png',
      title: 'Focus Timer Complete!',
      message: 'Great job! You\'ve completed your focus session.'
    });
  }

  async stopTimer() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    
    await chrome.storage.local.remove('focusTimer');
    
    chrome.runtime.sendMessage({
      action: 'stopFocusTimer'
    });

    this.resetToSelection();
  }

  showCompletion() {
    this.timerSelectionEl.classList.add('hidden');
    this.activeTimerEl.classList.add('hidden');
    this.completionMessageEl.classList.remove('hidden');
  }

  resetToSelection() {
    this.timerSelectionEl.classList.remove('hidden');
    this.activeTimerEl.classList.add('hidden');
    this.completionMessageEl.classList.add('hidden');
    
    // Reset progress ring
    this.progressRing.style.strokeDashoffset = this.circumference;
  }
}

// Initialize the focus timer when popup opens
document.addEventListener('DOMContentLoaded', () => {
  new FocusTimer();
});