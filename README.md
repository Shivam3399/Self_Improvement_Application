# 🌱 Self-Improvement Tracker

A sleek, client-side self-improvement app built to help users build better habits, track daily progress, and unlock their full potential — all powered by the browser using **IndexedDB** for local storage.

---

## 🚀 Features

- ✅ **User Progress Tracking**
  - Create, edit, and delete custom behaviors
  - Daily check-ins with streaks and success rates
  - Editable improvement items (to-dos) under each behavior

- 📊 **Insights & Analytics**
  - Streak counter and progress history
  - Success rate per behavior
  - Weekly/monthly behavioral trends

- 🔔 **Notification-Ready Design**
  - Structure supports daily reminders and streak alerts
  - Future-ready for browser-based push notifications

- 💡 **Offline-First**
  - Built with **IndexedDB** for full offline functionality
  - No backend or external database needed

- ⚡ **Lightweight & Fast**
  - Minimalist design with modern UX
  - Instant reads/writes with IndexedDB APIs

---

## 🛠️ Tech Stack

| Layer       | Technology               |
|-------------|---------------------------|
| Frontend    | Next.js, React, Tailwind CSS |
| Storage     | **IndexedDB**  |
| State Mgmt  | useState / useContext     |
| UI Toolkit  | Radix UI + ShadCN + Tailwind |
| Hosting     | Vercel                    |

---

## 📁 Project Structure
/
├── app/ # Next.js app structure (pages, API routes)
├── components/ # Reusable UI components
├── hooks/ # Custom React hooks (e.g., useIndexedDB)
├── lib/ # IndexedDB helper functions
├── public/ # Static assets
├── styles/ # Global styling

yaml
Copy
Edit

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yShivam3399/Self_Improvement_Application.git
cd self_improvement_app
2. Install Dependencies
bash
Copy
Edit
npm install
3. Start the Dev Server
bash
Copy
Edit
npm run dev
Visit http://localhost:3000 to use the app.

💾 How Data is Stored
All user data (behaviors, check-ins, progress) is stored locally in the browser using IndexedDB. No internet connection or login is required.

To reset your data, clear your browser cache or run:
js
Copy
Edit
indexedDB.deleteDatabase("self-improvement-db")


📦 Deployment
The app is optimized for deployment on Vercel:

Push the repo to GitHub

Go to vercel.com

Import the project

Deploy instantly (no env variables required)

📄 License
MIT License — use, modify, and distribute freely with credit.

🙌 Credits
Built with Next.js, Tailwind CSS, and Radix UI

IndexedDB managed via idb or Dexie.js

Inspired by the Eubrics self-improvement assignment

📬 Contact
Made with ❤️ by Shivam Singh

yaml
Copy
Edit

---

Would you like me to include example code snippets for the IndexedDB logic (e.g., `addBehavior`, `getCheckIns`) as well?








