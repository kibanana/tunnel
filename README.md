# Focus Timer Chrome Extension

A beautiful Chrome extension that helps users stay focused by preventing tab switching for selected durations.

## Features

- **Timer Options**: Choose from 5, 10, 15, or 20-minute focus sessions
- **Tab Blocking**: Prevents switching to other tabs or opening new ones during focus sessions
- **Motivational Messages**: Shows encouraging messages when users try to leave the focus tab
- **Visual Indicators**: Live countdown timer with progress ring and focus mode indicator
- **Elegant Design**: Modern UI with smooth animations and micro-interactions
- **Completion Notifications**: Celebrates successful focus sessions

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The Focus Timer extension will appear in your extensions toolbar

## How to Use

1. Click the Focus Timer extension icon in your browser toolbar
2. Select your desired focus duration (5, 10, 15, or 20 minutes)
3. The timer will start and focus mode will be activated
4. If you try to switch tabs or open new ones, you'll be redirected back with a motivational message
5. Once the timer completes, you'll receive a celebration notification and can freely switch tabs again

## Technical Details

### Files Structure

- `manifest.json` - Extension configuration and permissions
- `popup.html` - Extension popup interface
- `popup.css` - Popup styling with modern design
- `popup.js` - Popup functionality and timer management
- `background.js` - Service worker for tab monitoring and blocking
- `content.js` - Content script for focus indicators and blocking overlays
- `content.css` - Styling for focus indicators and blocking messages
- `icon16.png`, `icon48.png`, `icon128.png` - Extension icons

### Key Features

- **Tab Monitoring**: Uses Chrome's tabs API to detect and prevent tab switching
- **Persistent State**: Maintains focus session state even if popup is closed
- **Keyboard Blocking**: Prevents common keyboard shortcuts for opening new tabs
- **Window Focus**: Attempts to maintain focus on the original tab
- **Clean Completion**: Automatically cleans up when timer expires

## Permissions

- `activeTab` - Access to the currently active tab
- `tabs` - Monitor and control browser tabs
- `storage` - Store timer state and preferences

## Browser Compatibility

This extension is designed for Chrome and Chromium-based browsers that support Manifest V3.

## Development

To modify or extend this extension:

1. Make your changes to the relevant files
2. Reload the extension in `chrome://extensions/`
3. Test the functionality thoroughly
4. Consider adding new timer durations or customization options

## License

This project is open source and available under the MIT License.