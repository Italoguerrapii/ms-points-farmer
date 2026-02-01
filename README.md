# MS Points Farmer 🎯

A browser extension to help you earn Microsoft Rewards points more efficiently.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Edge%20%7C%20Chrome-brightgreen)

## ✨ Features

- 🖥️ **Desktop Searches** - Perform 45 daily Bing searches
- 📱 **Mobile Searches** - Perform 35 mobile searches with User-Agent spoofing
- 🎴 **Daily Cards** - Complete daily activities automatically
- ⏱️ **Human-like Delays** - Random delays between actions to avoid detection
- 📊 **Progress Tracking** - Real-time statistics and logs
- 🔔 **Notifications** - Get notified when tasks are completed

## 📸 Screenshot

![MS Points Farmer](icons/icon128.png)

## 📥 Installation

### From Source (Developer Mode)

1. Download or clone this repository
2. Open your browser's extension page:
   - **Edge**: `edge://extensions`
   - **Chrome**: `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extension folder

### From Store (Coming Soon)

- Microsoft Edge Add-ons Store
- Chrome Web Store

## 🚀 Usage

1. Click the extension icon in your browser toolbar
2. Make sure you're logged into your Microsoft account
3. Choose what you want to run:
   - **Desktop** - Run 45 desktop searches
   - **Mobile** - Run 35 mobile searches  
   - **Cards** - Complete daily cards/activities
4. Watch the progress in the popup

## ⚙️ How It Works

- **Search Terms**: Uses an elaborate system with 2.9 billion+ unique search combinations
- **Human Behavior**: Random delays (8-15 seconds) between searches with pauses every 5 searches
- **Mobile Emulation**: Spoofs User-Agent to simulate iPhone for mobile searches
- **Smart Detection**: Automatically skips already completed cards

## 📋 Requirements

- Microsoft Edge or Google Chrome browser
- Microsoft Rewards account
- Logged into Bing/Microsoft

## 🔧 Technical Details

- **Manifest Version**: V3 (latest)
- **Service Worker**: Background script runs independently
- **Content Scripts**: Injected into Bing/Microsoft pages
- **Permissions**: Storage, Tabs, Scripting, Notifications

## ⚠️ Disclaimer

This extension is for educational purposes only. Use at your own risk. The developer is not responsible for any account bans or violations of Microsoft's Terms of Service.

## 👨‍💻 Author

**Italo Guerra**
- GitHub: [@Italoguerrapii](https://github.com/Italoguerrapii)

## 📄 License

MIT License - feel free to use and modify.

---

⭐ If you find this useful, please star the repository!
