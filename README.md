# 📦 WhatsApp Contact Extractor Extension

A JavaScript browser extension to extract group contact information from WhatsApp Web by accessing the internal IndexedDB storage.

## 🔍 Features

- Extracts contact information (name, phone, group details) from WhatsApp Web
- Accesses data stored in IndexedDB used by WhatsApp
- One-click download of contact data in JSON or CSV format
- Lightweight and privacy-respecting (runs only in the browser)

## 🚀 Getting Started

### 1. Clone the Repository

```
git clone https://github.com/robolt-ai
```

### 2. Load the Extension in Chrome

1. Open **chrome://extensions/**
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select the folder where this repo is cloned

### 3. Use the Extension

1. Open [WhatsApp Web](https://web.whatsapp.com/)
2. Click the extension icon in the toolbar
3. Follow prompts to extract group contact data

## 📂 Project Structure

```
whatsapp-contact-extractor/
├── manifest.json         # Extension metadata
├── background.js         # Background script (optional)
├── content.js            # Script injected into WhatsApp Web
├── popup.html            # Popup UI
├── popup.js              # Popup logic
├── utils.js              # IndexedDB extraction logic
└── README.md
```

## ⚠️ Disclaimer

This extension is for **educational and personal use only**. Use responsibly and respect user privacy and WhatsApp's [Terms of Service](https://www.whatsapp.com/legal/terms-of-service).

## 📃 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.