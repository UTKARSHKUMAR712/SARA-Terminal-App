# SARA Terminal — Mobile Terminal App

A React Native (Expo) mobile app that connects to the SARA remote terminal runtime, providing a full-featured terminal emulator on Android with tabs, themes, and a hardware keyboard command bar.

## Features

- **WebView Terminal** — xterm.js inside a WebView, connecting via WebSocket to SARA's ConPTY sessions
- **Multi-Tab Support** — Open multiple terminal tabs (PowerShell, CMD), each with its own shell process
- **Split View** — Side-by-side terminal panes
- **Shell Selection** — Create new terminals with PowerShell or CMD
- **5 Themes** — Classic, VS Code Dark, Dracula, Windows Terminal, Hacker
- **Font Size Control** — Adjustable from 5px to 24px
- **Desktop Mode** — Switch user-agent to desktop Chrome for better terminal layouts
- **Background Image** — URL-based background image with opacity control
- **Command Bar** — Bottom toolbar with ESC, Tab, modifiers (Ctrl/Alt/Shift), arrow keys, Page Up/Down, Home/End
- **Modifier Capture** — Press CTRL → Type any key on mobile keyboard → sends Ctrl+key
- **Settings Persistence** — All settings saved via AsyncStorage
- **Dark Theme** — GitHub Dark-inspired UI throughout
- **EAS Build** — Configured for cloud APK builds

## Screenshots

| Home Screen | Terminal Connected | Settings |
|-------------|-------------------|----------|
| Paste terminal link from Telegram | Tabbed terminal with command bar | Theme, font, background config |

## Architecture

```
┌──────────────────────────────────────────┐
│           sara-terminal-app              │
│                                          │
│  ┌──────────────┐  ┌──────────────────┐  │
│  │ Terminal Screen │  │ Settings Panel  │  │
│  │ (WebView)    │  │ (Theme, Font,    │  │
│  │              │  │  Background, etc) │  │
│  └──────┬───────┘  └──────────────────┘  │
│         │                                │
│  ┌──────▼───────┐                       │
│  │ CommandBar   │                       │
│  │ (Key Inject) │                       │
│  └──────────────┘                       │
└──────────┬───────────────────────────────┘
           │ WebView (injectJavaScript)
           ▼
┌──────────────────────────────────────────┐
│      SARA Remote Terminal (Server)      │
│  ConPTY → WebSocket → xterm.js          │
└──────────────────────────────────────────┘
```

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- EAS CLI (for APK builds)
- A running SARA agent with terminal server

### Install & Run
```bash
cd sara-terminal-app
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `a` for Android emulator.

### Connecting
1. Send `/terminal` to your SARA Telegram bot
2. Copy the browser link from the bot reply
3. Paste it in the app and tap **Connect**

## Build APK

The project is configured for EAS (Expo Application Services) cloud builds.

### Prerequisites
```bash
npm install -g eas-cli
eas login
```

### Development APK
```bash
eas build -p android --profile preview
```

This creates an APK with internal distribution. Download URL is shown after build completes.

### Production AAB
```bash
eas build -p android --profile production
```

## Configuration

### Settings (persisted via AsyncStorage)

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Theme | enum | classic | classic, vscode, dracula, windows, hacker |
| Font Size | number | 13 | 5–24 px |
| Desktop Mode | bool | false | Chrome desktop user-agent |
| Background Enabled | bool | false | Toggle background image |
| Background URL | string | "" | Image URL for background |
| Background Opacity | number | 0.3 | 0.1–0.9 |

### Theme Colors

| Theme | Background | Foreground | Accent |
|-------|-----------|------------|--------|
| Classic | `#0d1117` | `#e6edf3` | `#58a6ff` |
| VS Code Dark | `#1e1e1e` | `#d4d4d4` | `#569cd6` |
| Dracula | `#282a36` | `#f8f8f2` | `#bd93f9` |
| Windows Terminal | `#0c0c0c` | `#cccccc` | `#3b78ff` |
| Hacker | `#000000` | `#00ff00` | `#00ff00` |

## Project Structure

```
sara-terminal-app/
├── src/
│   ├── components/
│   │   └── CommandBar.js     # Bottom keyboard toolbar with modifier keys
│   └── screens/
│       └── TerminalScreen.js # Main terminal screen with WebView, settings, tabs
├── App.js                    # Root component with SafeAreaProvider
├── app.json                  # Expo configuration
├── eas.json                  # EAS Build profiles
├── babel.config.js           # Babel config
└── package.json              # Dependencies and scripts
```

## Dependencies

- **expo** ~56.0 — Expo framework
- **react-native-webview** 13.16.1 — WebView for terminal rendering
- **react-native-safe-area-context** ~5.7 — Safe area insets
- **@react-native-async-storage/async-storage** 2.2.0 — Settings persistence
- **@expo/vector-icons** ^15.0 — Icon set (Ionicons)
- **react-native-url-polyfill** ^3.0 — URL polyfill for WebView

## Android Build Requirements

- `INTERNET` permission (already configured in app.json)
- `usesCleartextTraffic: true` for HTTP tunnel URLs (already configured)
- MinSdk: determined by Expo SDK 56

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Blank terminal after connect | Pull down to reload the WebView |
| Keyboard not working | Toggle Desktop Mode in settings |
| Can't create new tabs | Ensure the initial session is still active |
| Settings not saving | Check AsyncStorage is available |
