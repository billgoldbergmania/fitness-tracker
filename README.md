# Trackerbuddy – Fitness Tracker for the Local Athlete

> **Honest, private, no subscriptions** – a fitness tracker that runs entirely on your own computer. All data stays in a local SQLite file. You own it.

---

## ✨ Features

- **Track body weight** – log daily weight, see trends, set a goal.
- **Track exercises** – log sets, reps, weight; automatic 1RM estimation.
- **Multi‑user support** – add family members or training partners, switch users instantly. Each user’s data stays separate.
- **Workout routines** – create routines (e.g. “Chest Day”), log sets during a guided workout, mark warm‑up sets, track failures.
- **Progress photos** – upload photos (stored per user) and see your transformation.
- **Performance analytics** – charts for body weight and 1RM progression, personal bests, volume ranking.
- **Export to CSV** – backup or analyse your logs in any spreadsheet.
- **Dark / Light theme** – choose what’s comfortable.
- **Units** – kilograms or pounds, centimetres or inches.

All data is stored in a single `tracker.db` file on your machine. No cloud, no accounts, no telemetry.

---
## Screenshots

![Dashboard TrackerBuddy](https://github.com/billgoldbergmania/fitness-tracker/blob/main/website/dashboard.png?raw=true
 "TrackerBuddy Dashboard")

 ![PB TrackerBuddy](https://github.com/billgoldbergmania/fitness-tracker/blob/main/website/pbs.png?raw=true
 "TrackerBuddy Personal Bests")

![PhotoTrackerBuddy](https://github.com/billgoldbergmania/fitness-tracker/blob/main/website/photo.png?raw=true
 "TrackerBuddy Phototracker")

![Tools TrackerBuddy](https://github.com/billgoldbergmania/fitness-tracker/blob/main/website/tools.png?raw=true
 "TrackerBuddy Tools")

![Workouts TrackerBuddy](https://github.com/billgoldbergmania/fitness-tracker/blob/main/website/workouts.png?raw=true
 "TrackerBuddy Workout")
 
![Workouts 2 TrackerBuddy](https://github.com/billgoldbergmania/fitness-tracker/blob/main/website/workout2.png?raw=true
 "TrackerBuddy Workouts 2")
 
![Dark Mode TrackerBuddy](https://github.com/billgoldbergmania/fitness-tracker/blob/main/website/darkmode.png?raw=true
 "Dark Mode TrackerBuddy")

-----

## 🚀 How to run it (for yourself)

1. **Install Node.js** (version 18 or newer) – [nodejs.org](https://nodejs.org)

2. **Clone or download the repository**
   ```bash
   git clone https://github.com/yourusername/trackerbuddy.git
   cd trackerbuddy

    Install dependencies
    bash

    npm install

    Run the development server
    bash

    npm run dev

    Open your browser at http://localhost:3000

    First start – the app creates a tracker.db SQLite file in the project root and seeds default data. All your logs are stored there.

Optional: run on your local network
bash

npm run dev -- -H 0.0.0.0

Then access from other devices on the same network using your computer’s IP address (e.g. http://192.168.1.10:3000).

📦 Build for production
bash

npm run build
npm run start

The app will run in production mode, still using the local SQLite database.
🖼️ Screenshots

(Add your own screenshots here – dashboard, workout routine editor, history, settings)
❓ Frequently asked questions

Can I use this on my phone?
Yes, the interface adapts to mobile screens. Run the server on your computer and open the network URL on your phone’s browser.

Will my data ever leave my computer?
No. All data is saved in the tracker.db file inside the app folder. No external API calls are made (except to load font icons).

Can I migrate my data to another computer?
Copy the tracker.db file to the new computer’s app folder.

Is there a user login / cloud sync?
No – this is a local‑first app. Multi‑user is supported, but switching users only changes the active user ID. No passwords, no internet needed.

What if I break something?
Delete tracker.db and restart the app – it will recreate a fresh database with default data. Your old data will be lost, so keep backups if important.
🛠️ Tech stack

    Next.js 16 (Turbopack for development)

    SQLite (via better-sqlite3)

    Tailwind CSS

    Recharts

    Lucide icons

📝 License

Use it, modify it, share it. No warranty.
🙌 Credits

Vibecoded by Billgoldbergmania with Deepseek/Claude and Gemini – on Arch btw.

This app is not a substitute for professional medical advice. Always consult a physician before starting any fitness program.
