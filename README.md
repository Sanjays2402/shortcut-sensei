# ⌨️ Shortcut Sensei

> Master keyboard shortcuts through interactive challenges — VS Code, macOS, Chrome & Figma

A keyboard shortcut training game with a dark cinematic UI and neumorphic visual keyboard. Press the right combo, build streaks, and become a shortcut master.

![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat&logo=framer&logoColor=white)

## ✨ Features

### 🎮 Game Modes
- **Practice** — No timer, learn at your own pace
- **Speed Run** — 30 seconds, score as many as possible
- **Survival** — 3 lives, one wrong answer = lose a life

### 📱 4 App Categories (120+ shortcuts)
- 💻 **VS Code** — Command palette, multi-cursor, code folding, and more
- 🍎 **macOS** — Spotlight, screenshots, window management, system shortcuts
- 🌐 **Chrome** — DevTools, tab management, navigation, bookmarks
- 🎨 **Figma** — Tools, components, auto layout, export

### 🎯 Difficulty Levels
- 🟢 **Beginner** — Common everyday shortcuts
- 🟡 **Advanced** — Power user combos
- 🔴 **Master** — Obscure shortcuts most people don't know

### 🎹 Visual Keyboard
- Neumorphic 3D keys on dark surface with dual shadow effect
- **Green glow pulse** on correct answer
- **Red shake** on wrong answer
- Key highlighting shows the correct answer after a miss
- Real-time display of pressed vs expected keys

### 📊 Tracking & Progress
- 🔥 Streak counter with animated combo text (DOUBLE → TRIPLE → GODLIKE!)
- 📈 Accuracy percentage and grade system (S/A/B/C/D)
- 🏆 Local leaderboard per category with personal bests
- 📉 Mastery progress bar per app
- 🔊 Sound effects via Web Audio API (correct dings, wrong buzzes, combo crescendos)

### 🎯 Daily Challenge
- 10 random shortcuts across all apps, seeded by date
- Shareable emoji score card (`🟩🟩🟩🟥🟩...`)
- One attempt per day

### ➕ More
- **Custom Shortcuts** — Add your own shortcuts to practice
- **Cheat Sheet** — Browse all shortcuts grouped by difficulty (printable!)
- **Wrong Answer Review** — See what you missed after each session
- **Combo Display** — Live view of keys pressed vs expected

## 🖥️ Design

Dark cinematic aesthetic with neumorphic keyboard visualization:

- **Background:** Deep charcoal `#0d0d0d` with subtle purple/blue gradient mesh blobs
- **Keyboard:** Dark raised surfaces `#1a1a1a` with 3D dual-shadow pop effect
- **Cards:** Glassmorphism panels with `backdrop-blur` and thin accent borders
- **Typography:** Inter for UI, JetBrains Mono for shortcut display
- **Accent:** Indigo `#6366f1` primary, amber for CTAs
- **Animations:** Framer Motion transitions between every screen

## 🚀 Getting Started

```bash
git clone https://github.com/Sanjays2402/shortcut-sensei.git
cd shortcut-sensei
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and start training.

## 🎮 How to Play

1. Pick an app (VS Code, macOS, Chrome, Figma)
2. Choose game mode and difficulty
3. Read the task (e.g. "Open Command Palette")
4. Press the correct keyboard shortcut
5. ✅ Green glow = correct → streak builds
6. ❌ Red shake = wrong → keyboard highlights the answer
7. Review missed shortcuts at the end

## 📁 Structure

```
src/
├── App.jsx                    # Screen router + state
├── index.css                  # Tailwind v4 + global styles
├── main.jsx                   # Entry point
├── data/
│   └── shortcuts.js           # 120+ shortcuts (30 per app)
├── components/
│   ├── MenuScreen.jsx         # App/mode/difficulty picker
│   ├── GameScreen.jsx         # Core gameplay loop
│   ├── Keyboard.jsx           # Neumorphic visual keyboard
│   ├── ResultScreen.jsx       # Score + grade display
│   ├── ComboCounter.jsx       # Animated streak text
│   ├── WrongAnswerReview.jsx  # Missed shortcuts list
│   ├── CheatSheet.jsx         # Browse all shortcuts
│   ├── CustomShortcuts.jsx    # CRUD custom shortcuts
│   ├── DailyChallenge.jsx     # Daily 10-question mode
│   └── Leaderboard.jsx        # Per-category score rankings
└── utils/
    ├── storage.js             # localStorage helpers
    └── sound.js               # Web Audio sound effects
```

## 🛠️ Tech Stack

| Tech | Version | Purpose |
|------|---------|---------|
| React | 19 | UI framework |
| Vite | 6+ | Build tool |
| Tailwind CSS | v4 | Utility-first styling |
| Framer Motion | 12+ | Animations & transitions |
| Web Audio API | — | Sound effects |
| localStorage | — | Progress & score persistence |

## 📄 License

MIT
