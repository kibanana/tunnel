class FocusTimerBackground {
  constructor() {
    this.isActive = false;
    this.originalTabId = null;
    this.startTime = null;
    this.duration = null;
    this.minutes = null;
    
    this.init();
  }

  init() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'startFocusTimer') {
        this.startFocusTimer(message.duration, message.minutes, sender.tab.id);
      } else if (message.action === 'stopFocusTimer') {
        this.stopFocusTimer();
      }
    });

    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.handleTabSwitch(activeInfo.tabId);
    });

    chrome.tabs.onCreated.addListener((tab) => {
      this.handleNewTab(tab);
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.url && this.isActive && tabId === this.originalTabId) {
        this.handleNavigation(tabId, changeInfo.url);
      }
    });

    // Restore state on startup
    this.restoreState();
  }

  async restoreState() {
    const result = await chrome.storage.local.get(['focusTimer']);
    const timerData = result.focusTimer;
    
    if (timerData && timerData.isActive) {
      const now = Date.now();
      const elapsed = now - timerData.startTime;
      const remaining = timerData.duration - elapsed;
      
      if (remaining > 0) {
        this.isActive = true;
        this.startTime = timerData.startTime;
        this.duration = timerData.duration;
        this.minutes = timerData.minutes;
        
        // Find the original tab
        const tabs = await chrome.tabs.query({});
        // For simplicity, we'll use the first tab. In a real implementation,
        // you might want to store the tab ID or URL
        if (tabs.length > 0) {
          this.originalTabId = tabs[0].id;
        }
      } else {
        this.stopFocusTimer();
      }
    }
  }

  async startFocusTimer(duration, minutes, tabId) {
    this.isActive = true;
    this.originalTabId = tabId;
    this.startTime = Date.now();
    this.duration = duration;
    this.minutes = minutes;

    // Set up auto-completion timer
    setTimeout(() => {
      if (this.isActive) {
        this.completeFocusTimer();
      }
    }, duration);

    // Inject content script into the current tab
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });
      
      // Send activation message to content script
      chrome.tabs.sendMessage(tabId, {
        action: 'activateFocusMode',
        minutes: minutes
      });
    } catch (error) {
      console.error('Error injecting content script:', error);
    }
  }

  stopFocusTimer() {
    this.isActive = false;
    
    if (this.originalTabId) {
      // Send deactivation message to content script
      chrome.tabs.sendMessage(this.originalTabId, {
        action: 'deactivateFocusMode'
      }).catch(() => {
        // Tab might be closed, ignore error
      });
    }
    
    this.originalTabId = null;
    this.startTime = null;
    this.duration = null;
    this.minutes = null;
  }

  async completeFocusTimer() {
    await chrome.storage.local.remove('focusTimer');
    this.stopFocusTimer();
    
    // Show completion notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon48.png',
      title: 'Focus Timer Complete!',
      message: 'Great job! You\'ve completed your focus session.'
    });
  }

  async handleTabSwitch(newTabId) {
    if (!this.isActive || newTabId === this.originalTabId) {
      return;
    }

    // Switch back to original tab
    try {
      await chrome.tabs.update(this.originalTabId, { active: true });
      
      // Show blocking message
      chrome.tabs.sendMessage(this.originalTabId, {
        action: 'showBlockingMessage',
        minutes: this.minutes
      });
    } catch (error) {
      console.error('Error switching back to original tab:', error);
      // Original tab might be closed, stop the timer
      this.stopFocusTimer();
    }
  }

  async handleNewTab(tab) {
    if (!this.isActive) {
      return;
    }

    // Close the new tab and switch back to original
    try {
      await chrome.tabs.remove(tab.id);
      await chrome.tabs.update(this.originalTabId, { active: true });
      
      // Show blocking message
      chrome.tabs.sendMessage(this.originalTabId, {
        action: 'showBlockingMessage',
        minutes: this.minutes
      });
    } catch (error) {
      console.error('Error handling new tab:', error);
    }
  }

  handleNavigation(tabId, url) {
    if (!this.isActive || tabId !== this.originalTabId) {
      return;
    }

    // For now, we'll allow navigation within the same tab
    // but you could implement URL blocking here if needed
  }
}

// Initialize background script
new FocusTimerBackground();