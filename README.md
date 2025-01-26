# ACTracker - Advanced Habit Tracking Platform

![ACTracker Demo](demo-screenshot.png) <!-- Add a screenshot if available -->

A modern, extensible habit tracking platform with plugin support, calendar views, and cloud synchronization.

## Features

- **Daily Habit Tracking**: Mark habits as completed with intuitive checkboxes
- **Calendar View**: Visualize habit streaks and completion rates in month/week views
- **Plugin System**: Extend functionality with community/third-party plugins
- **Cross-Device Sync**: Cloud backup and synchronization
- **Advanced Analytics**: Track streaks, completion rates, and habit evolution
- **Customizable Interface**: Drag-and-drop reordering, dark mode, and theming
- **Multi-Frequency Habits**: Daily, weekly, and monthly tracking patterns

## Core Components

- **Landing Page**: Marketing page with feature highlights and pricing
- **Calendar Mode**: Interactive calendar grid with completion heatmaps
- **Daily Habit List**: Sortable list of daily habits with streak indicators
- **Habit Form**: Detailed habit creation/editing with plugin integrations
- **Plugin Marketplace**: Discover and manage habit extensions

## Technologies

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React hooks + localStorage
- **Plugin System**: Webpack Module Federation
- **UI Toolkit**: Radix UI + custom components
- **Icons**: Lucide React
- **Build System**: Modern.js

## Installation

1. Clone repository:
```bash
git clone https://github.com/yourusername/actracker.git
cd actracker
```

## Install dependencies:

```bash
npm install
```

## Start development server:

```bash
npm run dev
```

## Plugin Development

ACTracker supports custom plugins for:

* Custom habit metrics
* Data visualizations
* Integration with third-party services

### Example plugin structure:

```typescript
interface HabitPlugin {
  id: string;
  name: string;
  version: string;
  RenderHabitCard?: (habit: Habit) => JSX.Element;
  onHabitComplete?: (habit: Habit) => void;
}
```


## Contributing
We welcome contributions! Please follow these steps:

* Fork the repository

* Create a feature branch (git checkout -b feature/amazing-feature)

* Commit your changes

* Push to the branch

* Open a Pull Request


## Acknowledgments
* Lucide React for beautiful icons

* Radix UI for accessible primitives

* Modern.js for build infrastructure

* Webpack/RSpack Module Federation for plugin system

