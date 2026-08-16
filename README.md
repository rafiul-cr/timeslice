# TimeSlice

### Shape your day, your way.

TimeSlice is a visual day planner built around a simple idea: **your schedule should be something you can see and shape, not just a list of tasks.**

Move activities around the timeline, resize them, organize them by category, and see how your time is being used.

<br>

<div align="center">

<table>
<tr>
<td align="center" valign="top">

<b>Desktop Preview</b>

<br><br>

<img src="./screenshots/Desktop.png" alt="TimeSlice desktop preview" width="680">

</td>

<td align="center" valign="top">

<b>Mobile Preview</b>

<br><br>

<img src="./screenshots/phone.jpg" alt="TimeSlice mobile preview" width="220">

</td>
</tr>
</table>

</div>

---

## ✨ Features

- Visual day timeline
- Freeform activity positioning
- Drag activities to change their time
- Resize activities to change their duration
- Add, edit, duplicate, complete, and delete activities
- Work, Study, Health, Personal, Break, Sleep, and Other categories
- Live current-time indicator
- Automatic local timezone detection
- Schedule overlap detection
- Daily time statistics
- Category breakdown
- Focus mode
- Light and dark mode
- Responsive desktop and mobile layouts
- Automatic local schedule saving
- No account required
- No AI or external API required

---

## 🎯 The Idea

Most productivity apps start with a list of tasks.

TimeSlice treats your day as a **visual timeline**.

Instead of only asking:

> What do I need to do?

TimeSlice asks:

> **Where does it fit into my day?**

Every activity occupies a real amount of time, making it easier to see busy periods, free time, and how your day is actually divided.

---

## 🖱️ How It Works

### Add

Create an activity and choose its title, time, and category.

### Move

Drag an activity anywhere on the timeline to change when it happens.

### Resize

Change the height of an activity to adjust how much time it takes.

### Organize

Use categories to understand where your time goes.

### Track

TimeSlice automatically calculates planned time, free time, category totals, and schedule conflicts.

---

## 💾 Local & Private

TimeSlice does not require an account.

Your schedule is saved locally in your browser using `localStorage`.

```text
Your schedule
      ↓
Your browser
      ↓
localStorage
```

No server is required to store your daily activities.

Your schedule stays on the browser/device where you created it.

---

## 🕐 Local Time

TimeSlice automatically uses the timezone provided by your device or browser.

The current-time indicator follows your local clock, so the planner works naturally across different timezones.

---

## 📱 Responsive Design

TimeSlice has separate layouts for desktop and mobile.

The desktop version provides a larger workspace for the timeline, navigation, categories, and statistics.

The mobile version removes the desktop sidebar and focuses on the timeline so the interface remains comfortable to use on smaller screens.

---

## 🛠️ Built With

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- CSS
- [Motion](https://motion.dev/)
- [React RND](https://github.com/bokuweb/react-rnd)
- [Lucide React](https://lucide.dev/)
- Browser `localStorage`

---

## 📁 Project Structure

```text
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   └── TimeSlice.tsx
│
└── lib/
    ├── data.ts
    └── types.ts
```

### Main Files

**`src/app/page.tsx`**  
Entry point for the application.

**`src/components/TimeSlice.tsx`**  
Main planner interface, timeline interactions, activity management, statistics, and application state.

**`src/lib/data.ts`**  
Timeline configuration and activity categories.

**`src/lib/types.ts`**  
TypeScript types used throughout the application.

**`src/app/globals.css`**  
Main styling, responsive layouts, and animations.

---

## 🚀 Getting Started

### Requirements

- Node.js
- npm
- A modern web browser

### Installation

Clone the repository:

```bash
git clone https://github.com/rafiul-cr/timeslice.git
```

Enter the project:

```bash
cd timeslice
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🔮 Future Ideas

Some possible directions for future versions:

- Weekly planning
- Recurring activities
- Custom categories
- Schedule templates
- Export and import
- Shareable schedules
- PWA support
- Notifications and reminders
- More detailed statistics
- Calendar integration
- Optional cloud synchronization

---

## 📌 Project Status

**Personal project.**

TimeSlice was built as a practical project for exploring interactive UI, React state management, TypeScript, drag-and-resize interactions, time-based interfaces, browser storage, responsive design, and animations. I built it for fun and test myself and because of my many experiments manything might be broken in later updates but I'll try fix them asap. 

---

<div align="center">

### TimeSlice

*Shape your day, your way.*

**Built by [rafiul-cr](https://github.com/rafiul-cr)**

</div>
