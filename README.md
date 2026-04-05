# ⌨️ Shortcut Sensei

Master keyboard shortcuts through interactive challenges. Train yourself on VS Code, macOS, Chrome, and Figma shortcuts with a beautiful dark neumorphic UI.

## ✨ Features

- **4 Apps** — VS Code, macOS, Chrome, Figma (120+ shortcuts total)
- **3 Game Modes** — Practice (untimed), Speed Run (30s), Survival (3 lives)
- **3 Difficulties** — Beginner, Advanced, Master
- **Visual Keyboard** — Neumorphic 3D keys that glow on correct/wrong
- **Live Feedback** — Green pulse for correct, red shake for wrong
- **Streak System** — Track your combo with 🔥 counter
- **Score Tracking** — Accuracy, WPM, grade (S/A/B/C/D)
- **Personal Bests** — Saved per app/mode/difficulty in localStorage
- **Skip & Learn** — Skip to reveal the answer with keyboard highlight

## 🛠️ Tech Stack

- **React 19** + **Vite 8**
- **Tailwind CSS v4**
- **Framer Motion** — Smooth transitions and key animations
- **Inter** + **JetBrains Mono** typography

## 🚀 Getting Started

```bash
git clone https://github.com/Sanjays2402/shortcut-sensei.git
cd shortcut-sensei
npm install
npm run dev
```

## 🎮 How to Play

1. Choose an app, game mode, and difficulty
2. Read the task description
3. Press the correct keyboard shortcut
4. Green = correct ✓, Red = wrong ✗
5. Skip if you don't know — it'll show you the answer

## 📁 Project Structure

```
src/
├── App.jsx              # Main app with screen routing
├── index.css            # Global styles + Tailwind
├── main.jsx             # Entry point
├── data/
│   └── shortcuts.js     # 120+ shortcuts across 4 apps
└── components/
    ├── MenuScreen.jsx   # App/mode/difficulty selection
    ├── GameScreen.jsx   # Main gameplay loop
    ├── Keyboard.jsx     # Neumorphic visual keyboard
    └── ResultScreen.jsx # Score & grade display
```

## 📄 License

MIT
