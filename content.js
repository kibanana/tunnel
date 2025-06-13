class FocusTimerContent {
  constructor() {
    this.isActive = false;
    this.overlay = null;
    this.minutes = 0;
    
    this.init();
  }

  init() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.action) {
        case 'activateFocusMode':
          this.activateFocusMode(message.minutes);
          break;
        case 'deactivateFocusMode':
          this.deactivateFocusMode();
          break;
        case 'showBlockingMessage':
          this.showBlockingMessage(message.minutes);
          break;
      }
    });

    // Prevent keyboard shortcuts for new tabs/windows
    document.addEventListener('keydown', (e) => {
      if (this.isActive) {
        // Prevent Ctrl+T (new tab), Ctrl+N (new window), Ctrl+W (close tab), etc.
        if (e.ctrlKey && (e.key === 't' || e.key === 'n' || e.key === 'w' || e.key === 'Tab')) {
          e.preventDefault();
          this.showBlockingMessage(this.minutes);
        }
        // Prevent Alt+Tab (switch windows)
        if (e.altKey && e.key === 'Tab') {
          e.preventDefault();
          this.showBlockingMessage(this.minutes);
        }
      }
    });

    // Prevent window blur (user switching to another application)
    window.addEventListener('blur', () => {
      if (this.isActive) {
        setTimeout(() => {
          window.focus();
          this.showBlockingMessage(this.minutes);
        }, 100);
      }
    });
  }

  activateFocusMode(minutes) {
    this.isActive = true;
    this.minutes = minutes;
    this.createFocusIndicator();
  }

  deactivateFocusMode() {
    this.isActive = false;
    this.removeFocusIndicator();
    this.removeOverlay();
  }

  createFocusIndicator() {
    // Remove existing indicator if any
    this.removeFocusIndicator();

    const indicator = document.createElement('div');
    indicator.id = 'focus-timer-indicator';
    indicator.innerHTML = `
      <div class="focus-indicator-content">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <circle cx="12" cy="16" r="1"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span>Focus Mode Active</span>
      </div>
    `;
    
    document.body.appendChild(indicator);
  }

  removeFocusIndicator() {
    const indicator = document.getElementById('focus-timer-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  showBlockingMessage(minutes) {
    // Remove existing overlay if any
    this.removeOverlay();

    this.overlay = document.createElement('div');
    this.overlay.id = 'focus-timer-overlay';
    this.overlay.innerHTML = `
      <div class="focus-overlay-content">
        <div class="focus-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2>Stay in the flow</h2>
        <p>You chose ${minutes} minutes – honor your commitment.</p>
        <div class="motivational-quote">
          <p>"Deep work is the ability to focus without distraction on a cognitively demanding task."</p>
          <span>— Cal Newport</span>
        </div>
        <button class="focus-continue-btn" onclick="this.parentElement.parentElement.remove()">
          Continue Focusing
        </button>
      </div>
    `;

    document.body.appendChild(this.overlay);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.removeOverlay();
    }, 5000);
  }

  removeOverlay() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}

// Initialize content script
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new FocusTimerContent();
  });
} else {
  new FocusTimerContent();
}