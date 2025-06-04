import type { IPlugin } from '@/ac-components/types/plugin';

// Sample Todo Plugin
export const todoPlugin: IPlugin = {
  id: 'todo-plugin',
  name: 'Daily Todo',
  description: 'Manage your daily tasks',
  version: '1.0.0',
  icon: '✅',
  color: '#10b981',
  isActive: false,
  data: {
    todos: [
      { text: 'Review code changes', completed: false },
      { text: 'Update documentation', completed: true },
      { text: 'Plan next sprint', completed: false },
    ],
  },

  renderContent: (date: Date, data?: any) => {
    const todos = data?.todos || [];

    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Today's Tasks</h4>
        <div className="space-y-1">
          {todos.map((todo: any, idx: number) => (
            <div
              key={idx}
              className={`flex items-center gap-2 text-sm p-2 rounded ${
                todo.completed ? 'bg-green-50 text-green-800' : 'bg-gray-50'
              }`}
            >
              <span>{todo.text}</span>
              {todo.completed && <span>✓</span>}
            </div>
          ))}
          {todos.length === 0 && (
            <div className="text-muted-foreground text-sm italic">
              No tasks for today
            </div>
          )}
        </div>
      </div>
    );
  },

  onActivate: async (date: Date) => {
    console.log('Todo plugin activated for', date);
  },

  onDataUpdate: async (data: any) => {
    console.log('Todo data updated:', data);
  },
};

// Sample Note Plugin
export const notePlugin: IPlugin = {
  id: 'note-plugin',
  name: 'Daily Notes',
  description: 'Quick notes for the day',
  version: '1.0.0',
  icon: '📝',
  color: '#3b82f6',
  isActive: false,
  data: {
    note: 'Working on the new plugin architecture. Great progress so far! Need to add more interactive features.',
  },

  renderContent: (date: Date, data?: any) => {
    const note = data?.note || '';

    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Daily Note</h4>
        <div className="text-sm">
          {note ? (
            <p className="bg-blue-50 p-3 rounded text-blue-900">{note}</p>
          ) : (
            <p className="text-muted-foreground italic">No note for today</p>
          )}
        </div>
      </div>
    );
  },
};

// Sample Weather Plugin
export const weatherPlugin: IPlugin = {
  id: 'weather-plugin',
  name: 'Weather',
  description: 'Current weather information',
  version: '1.0.0',
  icon: '🌤️',
  color: '#f59e0b',
  isActive: false,
  data: {
    weather: { temp: '24°C', condition: 'Partly Cloudy', humidity: '52%' },
  },

  renderContent: (date: Date, data?: any) => {
    const weather = data?.weather || {
      temp: '22°C',
      condition: 'Sunny',
      humidity: '45%',
    };

    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Weather</h4>
        <div className="bg-yellow-50 p-3 rounded">
          <div className="text-lg font-bold text-yellow-900">
            {weather.temp}
          </div>
          <div className="text-yellow-800">{weather.condition}</div>
          <div className="text-sm text-yellow-700">
            Humidity: {weather.humidity}
          </div>
        </div>
      </div>
    );
  },
};

// Sample Habit Tracker Plugin (for backward compatibility)
export const habitTrackerPlugin: IPlugin = {
  id: 'habit-tracker-plugin',
  name: 'Habit Tracker',
  description: 'Track your daily habits',
  version: '1.0.0',
  icon: '🎯',
  color: '#8b5cf6',
  isActive: false,
  data: {
    habits: [
      { name: 'Drink 8 glasses of water', completed: true },
      { name: 'Exercise for 30 minutes', completed: false },
      { name: 'Read for 20 minutes', completed: true },
      { name: 'Meditate', completed: false },
    ],
  },

  renderContent: (date: Date, data?: any) => {
    const habits = data?.habits || [];

    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Habits</h4>
        <div className="space-y-1">
          {habits.map((habit: any, idx: number) => (
            <div
              key={idx}
              className={`flex items-center justify-between text-sm p-2 rounded ${
                habit.completed ? 'bg-purple-50' : 'bg-gray-50'
              }`}
            >
              <span>{habit.name}</span>
              <span
                className={
                  habit.completed ? 'text-purple-600' : 'text-gray-400'
                }
              >
                {habit.completed ? '✓' : '○'}
              </span>
            </div>
          ))}
          {habits.length === 0 && (
            <div className="text-muted-foreground text-sm italic">
              No habits configured
            </div>
          )}
        </div>
      </div>
    );
  },
};

// Sample Calendar Plugin
export const calendarPlugin: IPlugin = {
  id: 'calendar-plugin',
  name: 'Mini Calendar',
  description: 'Quick calendar view',
  version: '1.0.0',
  icon: '📅',
  color: '#ef4444',
  isActive: false,

  renderContent: (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Calendar</h4>
        <div className="bg-red-50 p-3 rounded text-center">
          <div className="text-2xl font-bold text-red-900">
            {date.getDate()}
          </div>
          <div className="text-red-800">
            {date.toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })}
          </div>
          {isToday && <div className="text-xs text-red-600 mt-1">Today</div>}
        </div>
      </div>
    );
  },
};

// Sample Progress Plugin
export const progressPlugin: IPlugin = {
  id: 'progress-plugin',
  name: 'Daily Progress',
  description: 'Track your daily progress',
  version: '1.0.0',
  icon: '📊',
  color: '#06b6d4',
  isActive: false,
  data: {
    progress: {
      completed: 7,
      total: 12,
      percentage: 58,
    },
  },

  renderContent: (date: Date, data?: any) => {
    const progress = data?.progress || {
      completed: 0,
      total: 0,
      percentage: 0,
    };

    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Daily Progress</h4>
        <div className="bg-cyan-50 p-3 rounded">
          <div className="text-cyan-900 mb-2">
            {progress.completed}/{progress.total} tasks completed
          </div>
          <div className="w-full bg-cyan-200 rounded-full h-2">
            <div
              className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <div className="text-sm text-cyan-700 mt-1">
            {progress.percentage}% complete
          </div>
        </div>
      </div>
    );
  },
};

// Sample Interactive Plugin with buttons
export const interactivePlugin: IPlugin = {
  id: 'interactive-plugin',
  name: 'Interactive Demo',
  description: 'Demo plugin with interactive elements',
  version: '1.0.0',
  icon: '🎮',
  color: '#f97316',
  isActive: false,
  data: {
    counter: 0,
    lastClicked: null,
  },

  renderContent: (date: Date, data?: any) => {
    const counter = data?.counter || 0;
    const lastClicked = data?.lastClicked;

    const handleIncrement = () => {
      // In a real implementation, you'd call onDataUpdate here
      console.log('Increment clicked!', {
        counter: counter + 1,
        lastClicked: new Date().toISOString(),
      });
    };

    const handleReset = () => {
      console.log('Reset clicked!', {
        counter: 0,
        lastClicked: new Date().toISOString(),
      });
    };

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Interactive Demo</h4>
        <div className="bg-orange-50 p-3 rounded">
          <div className="text-center mb-3">
            <div className="text-2xl font-bold text-orange-900">{counter}</div>
            <div className="text-sm text-orange-700">Click count</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleIncrement}
              className="flex-1 bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
            >
              + Increment
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-orange-200 text-orange-800 px-3 py-1 rounded text-sm hover:bg-orange-300 transition-colors"
            >
              Reset
            </button>
          </div>

          {lastClicked && (
            <div className="text-xs text-orange-600 mt-2">
              Last clicked: {new Date(lastClicked).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    );
  },
};

export const samplePlugins: IPlugin[] = [
  todoPlugin,
  notePlugin,
  weatherPlugin,
  habitTrackerPlugin,
  calendarPlugin,
  progressPlugin,
  interactivePlugin,
];
