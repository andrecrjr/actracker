import type { IPlugin, PluginSandbox } from '@/ac-components/types/plugin';
import { useEffect, useState } from 'react';
import SecureExamplePlugin from './SecureExamplePlugin';

// Sample Todo Plugin
export const todoPlugin: IPlugin = {
  id: 'todo-plugin',
  name: 'Daily Todo',
  description: 'Manage your daily tasks',
  version: '1.0.0',
  icon: '✅',
  color: '#10b981',
  isActive: false,
  trusted: true, // Sample plugins are trusted

  permissions: {
    storage: {
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedKeys: ['todos', 'settings', 'completed-count'],
    },
    network: {
      allowedDomains: [],
      maxRequests: 0,
    },
    events: {
      canEmit: ['todo:completed', 'todo:added'],
      canSubscribe: ['app:date:changed'],
    },
    ui: {
      maxHeight: 400,
      allowedComponents: ['div', 'span', 'button', 'input', 'checkbox'],
    },
  },

  data: {
    todos: [],
  },

  renderContent: (date: Date, data?: any, sandbox?: PluginSandbox) => {
    return <TodoPluginContent date={date} data={data} sandbox={sandbox} />;
  },

  onActivate: async (date: Date, sandbox?: PluginSandbox) => {
    console.log('Todo plugin activated for', date);
    try {
      await sandbox?.storage.set('last-activated', date.toISOString());
    } catch (error) {
      console.error('Todo plugin activation error:', error);
    }
  },

  onDataUpdate: async (data: any, sandbox?: PluginSandbox) => {
    console.log('Todo data updated:', data);
    try {
      await sandbox?.storage.set('todos', data.todos);
      sandbox?.hostAPI.emitEvent('todo:completed', {
        completedCount: data.todos?.filter((t: any) => t.completed).length,
      });
    } catch (error) {
      console.error('Todo plugin data update error:', error);
    }
  },
};

function TodoPluginContent({
  date,
  data,
  sandbox,
}: { date: Date; data?: any; sandbox?: PluginSandbox }) {
  const [todos, setTodos] = useState<any[]>(data?.todos || []);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const savedTodos = await sandbox?.storage.get('todos');
        if (savedTodos) {
          setTodos(savedTodos);
        }
      } catch (error) {
        console.error('Error loading todos:', error);
      }
    };
    loadTodos();
  }, [sandbox]);

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    const updatedTodos = [...todos, { text: newTodo, completed: false }];
    setTodos(updatedTodos);
    setNewTodo('');

    try {
      await sandbox?.storage.set('todos', updatedTodos);
      sandbox?.hostAPI.updatePluginData({ todos: updatedTodos });
      sandbox?.hostAPI.emitEvent('todo:added', { text: newTodo });
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (index: number) => {
    const updatedTodos = todos.map((todo, i) =>
      i === index ? { ...todo, completed: !todo.completed } : todo,
    );
    setTodos(updatedTodos);

    try {
      await sandbox?.storage.set('todos', updatedTodos);
      sandbox?.hostAPI.updatePluginData({ todos: updatedTodos });
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Today's Tasks</h4>

      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          placeholder="Add new task..."
          className="flex-1 text-xs border rounded px-2 py-1"
          onKeyPress={e => e.key === 'Enter' && addTodo()}
        />
        <button
          onClick={addTodo}
          className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
        >
          Add
        </button>
      </div>

      <div className="space-y-1">
        {todos.map((todo: any, idx: number) => (
          <div
            key={idx}
            className={`flex items-center gap-2 text-sm p-2 rounded cursor-pointer ${
              todo.completed
                ? 'bg-green-50 text-green-800 line-through'
                : 'bg-gray-50'
            }`}
            onClick={() => toggleTodo(idx)}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => {}} // handled by onClick
              className="mr-1"
            />
            <span className="flex-1">{todo.text}</span>
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
}

// Sample Note Plugin
export const notePlugin: IPlugin = {
  id: 'note-plugin',
  name: 'Daily Notes',
  description: 'Quick notes for the day',
  version: '1.0.0',
  icon: '📝',
  color: '#3b82f6',
  isActive: false,
  trusted: true,

  permissions: {
    storage: {
      maxSize: 1024 * 1024, // 1MB
      allowedKeys: ['notes', 'drafts'],
    },
    network: {
      allowedDomains: [],
      maxRequests: 0,
    },
    events: {
      canEmit: ['note:saved'],
      canSubscribe: ['app:date:changed'],
    },
    ui: {
      maxHeight: 300,
      allowedComponents: ['div', 'span', 'textarea', 'button'],
    },
  },

  data: {
    note: 'Working on the new plugin architecture. Great progress so far! Need to add more interactive features.',
  },

  renderContent: (date: Date, data?: any, sandbox?: PluginSandbox) => {
    return <NotePluginContent date={date} data={data} sandbox={sandbox} />;
  },

  onActivate: async (date: Date, sandbox?: PluginSandbox) => {
    try {
      await sandbox?.storage.set('last-opened', date.toISOString());
    } catch (error) {
      console.error('Note plugin activation error:', error);
    }
  },

  onDataUpdate: async (data: any, sandbox?: PluginSandbox) => {
    try {
      await sandbox?.storage.set('notes', data.note);
      sandbox?.hostAPI.emitEvent('note:saved', {
        length: data.note?.length || 0,
      });
    } catch (error) {
      console.error('Note plugin data update error:', error);
    }
  },
};

function NotePluginContent({
  date,
  data,
  sandbox,
}: { date: Date; data?: any; sandbox?: PluginSandbox }) {
  const [note, setNote] = useState(data?.note || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadNote = async () => {
      try {
        const savedNote = await sandbox?.storage.get('notes');
        if (savedNote) {
          setNote(savedNote);
        }
      } catch (error) {
        console.error('Error loading note:', error);
      }
    };
    loadNote();
  }, [sandbox]);

  const saveNote = async () => {
    try {
      await sandbox?.storage.set('notes', note);
      sandbox?.hostAPI.updatePluginData({ note });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-sm">Daily Note</h4>
        <button
          onClick={() => (isEditing ? saveNote() : setIsEditing(true))}
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
        >
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>

      <div className="text-sm">
        {isEditing ? (
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full p-2 border rounded text-xs resize-none"
            rows={4}
            placeholder="Write your note here..."
          />
        ) : note ? (
          <p className="bg-blue-50 p-3 rounded text-blue-900">{note}</p>
        ) : (
          <p className="text-muted-foreground italic">No note for today</p>
        )}
      </div>
    </div>
  );
}

// Sample Weather Plugin
export const weatherPlugin: IPlugin = {
  id: 'weather-plugin',
  name: 'Weather',
  description: 'Current weather information',
  version: '1.0.0',
  icon: '🌤️',
  color: '#f59e0b',
  isActive: false,
  trusted: true,

  permissions: {
    storage: {
      maxSize: 512 * 1024, // 512KB
      allowedKeys: ['weather-cache', 'location'],
    },
    network: {
      allowedDomains: ['api.openweathermap.org'], // Example weather API
      maxRequests: 60, // 1 per minute
    },
    events: {
      canEmit: ['weather:updated'],
      canSubscribe: ['app:date:changed'],
    },
    ui: {
      maxHeight: 200,
      allowedComponents: ['div', 'span', 'button'],
    },
  },

  data: {
    weather: { temp: '24°C', condition: 'Partly Cloudy', humidity: '52%' },
  },

  renderContent: (date: Date, data?: any, sandbox?: PluginSandbox) => {
    return <WeatherPluginContent date={date} data={data} sandbox={sandbox} />;
  },

  onActivate: async (date: Date, sandbox?: PluginSandbox) => {
    try {
      await sandbox?.storage.set('last-updated', date.toISOString());
    } catch (error) {
      console.error('Weather plugin activation error:', error);
    }
  },
};

function WeatherPluginContent({
  date,
  data,
  sandbox,
}: { date: Date; data?: any; sandbox?: PluginSandbox }) {
  const [weather, setWeather] = useState(
    data?.weather || {
      temp: '22°C',
      condition: 'Sunny',
      humidity: '45%',
    },
  );

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const cachedWeather = await sandbox?.storage.get('weather-cache');
        if (cachedWeather) {
          setWeather(cachedWeather);
        }
      } catch (error) {
        console.error('Error loading weather:', error);
      }
    };
    loadWeather();
  }, [sandbox]);

  const refreshWeather = async () => {
    // Simulate weather refresh
    const conditions = ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy'];
    const temps = ['18°C', '22°C', '24°C', '26°C', '28°C'];

    const newWeather = {
      temp: temps[Math.floor(Math.random() * temps.length)],
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      humidity: `${Math.floor(Math.random() * 40) + 30}%`,
    };

    setWeather(newWeather);

    try {
      await sandbox?.storage.set('weather-cache', newWeather);
      sandbox?.hostAPI.updatePluginData({ weather: newWeather });
      sandbox?.hostAPI.emitEvent('weather:updated', newWeather);
    } catch (error) {
      console.error('Error saving weather:', error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-sm">Weather</h4>
        <button
          onClick={refreshWeather}
          className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
        >
          Refresh
        </button>
      </div>
      <div className="bg-yellow-50 p-3 rounded">
        <div className="text-lg font-bold text-yellow-900">{weather.temp}</div>
        <div className="text-yellow-800">{weather.condition}</div>
        <div className="text-sm text-yellow-700">
          Humidity: {weather.humidity}
        </div>
      </div>
    </div>
  );
}

// Sample Habit Tracker Plugin (for backward compatibility)
export const habitTrackerPlugin: IPlugin = {
  id: 'habit-tracker-plugin',
  name: 'Habit Tracker',
  description: 'Track your daily habits',
  version: '1.0.0',
  icon: '🎯',
  color: '#8b5cf6',
  isActive: false,
  trusted: true,

  permissions: {
    storage: {
      maxSize: 1024 * 1024, // 1MB
      allowedKeys: ['habits', 'streaks', 'stats'],
    },
    network: {
      allowedDomains: [],
      maxRequests: 0,
    },
    events: {
      canEmit: ['habit:completed', 'habit:streak'],
      canSubscribe: ['app:date:changed'],
    },
    ui: {
      maxHeight: 350,
      allowedComponents: ['div', 'span', 'button', 'checkbox'],
    },
  },

  data: {
    habits: [
      { name: 'Drink 8 glasses of water', completed: true },
      { name: 'Exercise for 30 minutes', completed: false },
      { name: 'Read for 20 minutes', completed: true },
      { name: 'Meditate', completed: false },
    ],
  },

  renderContent: (date: Date, data?: any, sandbox?: PluginSandbox) => {
    return <HabitTrackerContent date={date} data={data} sandbox={sandbox} />;
  },

  onActivate: async (date: Date, sandbox?: PluginSandbox) => {
    try {
      await sandbox?.storage.set('last-checked', date.toISOString());
    } catch (error) {
      console.error('Habit tracker activation error:', error);
    }
  },
};

function HabitTrackerContent({
  date,
  data,
  sandbox,
}: { date: Date; data?: any; sandbox?: PluginSandbox }) {
  const [habits, setHabits] = useState(data?.habits || []);

  useEffect(() => {
    const loadHabits = async () => {
      try {
        const savedHabits = await sandbox?.storage.get('habits');
        if (savedHabits) {
          setHabits(savedHabits);
        }
      } catch (error) {
        console.error('Error loading habits:', error);
      }
    };
    loadHabits();
  }, [sandbox]);

  const toggleHabit = async (index: number) => {
    const updatedHabits = habits.map((habit: any, i: number) =>
      i === index ? { ...habit, completed: !habit.completed } : habit,
    );
    setHabits(updatedHabits);

    try {
      await sandbox?.storage.set('habits', updatedHabits);
      sandbox?.hostAPI.updatePluginData({ habits: updatedHabits });

      const completedCount = updatedHabits.filter(
        (h: any) => h.completed,
      ).length;
      sandbox?.hostAPI.emitEvent('habit:completed', {
        total: updatedHabits.length,
        completed: completedCount,
      });
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Habits</h4>
      <div className="space-y-1">
        {habits.map((habit: any, idx: number) => (
          <div
            key={idx}
            className={`flex items-center justify-between text-sm p-2 rounded cursor-pointer ${
              habit.completed ? 'bg-purple-50' : 'bg-gray-50'
            }`}
            onClick={() => toggleHabit(idx)}
          >
            <span className={habit.completed ? 'line-through' : ''}>
              {habit.name}
            </span>
            <span
              className={habit.completed ? 'text-purple-600' : 'text-gray-400'}
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
}

// Sample Calendar Plugin
export const calendarPlugin: IPlugin = {
  id: 'calendar-plugin',
  name: 'Mini Calendar',
  description: 'Quick calendar view',
  version: '1.0.0',
  icon: '📅',
  color: '#ef4444',
  isActive: false,
  trusted: true,

  permissions: {
    storage: {
      maxSize: 256 * 1024, // 256KB
      allowedKeys: ['calendar-view', 'selected-date'],
    },
    network: {
      allowedDomains: [],
      maxRequests: 0,
    },
    events: {
      canEmit: ['calendar:date-selected'],
      canSubscribe: ['app:date:changed'],
    },
    ui: {
      maxHeight: 200,
      allowedComponents: ['div', 'span', 'button'],
    },
  },

  renderContent: (date: Date, data?: any, sandbox?: PluginSandbox) => {
    return <CalendarPluginContent date={date} data={data} sandbox={sandbox} />;
  },

  onActivate: async (date: Date, sandbox?: PluginSandbox) => {
    try {
      await sandbox?.storage.set('selected-date', date.toISOString());
    } catch (error) {
      console.error('Calendar plugin activation error:', error);
    }
  },
};

function CalendarPluginContent({
  date,
  data,
  sandbox,
}: { date: Date; data?: any; sandbox?: PluginSandbox }) {
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  const selectDate = async () => {
    try {
      await sandbox?.storage.set('selected-date', date.toISOString());
      sandbox?.hostAPI.emitEvent('calendar:date-selected', {
        date: date.toISOString(),
      });
    } catch (error) {
      console.error('Error selecting date:', error);
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Calendar</h4>
      <div
        className="bg-red-50 p-3 rounded text-center cursor-pointer hover:bg-red-100"
        onClick={selectDate}
      >
        <div className="text-2xl font-bold text-red-900">{date.getDate()}</div>
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
}

// Sample Progress Plugin
export const progressPlugin: IPlugin = {
  id: 'progress-plugin',
  name: 'Daily Progress',
  description: 'Track your daily progress',
  version: '1.0.0',
  icon: '📊',
  color: '#06b6d4',
  isActive: false,
  trusted: true,

  permissions: {
    storage: {
      maxSize: 512 * 1024, // 512KB
      allowedKeys: ['progress', 'goals', 'history'],
    },
    network: {
      allowedDomains: [],
      maxRequests: 0,
    },
    events: {
      canEmit: ['progress:updated'],
      canSubscribe: ['app:date:changed', 'todo:completed', 'habit:completed'],
    },
    ui: {
      maxHeight: 250,
      allowedComponents: ['div', 'span', 'button'],
    },
  },

  data: {
    progress: {
      completed: 7,
      total: 12,
      percentage: 58,
    },
  },

  renderContent: (date: Date, data?: any, sandbox?: PluginSandbox) => {
    return <ProgressPluginContent date={date} data={data} sandbox={sandbox} />;
  },

  onActivate: async (date: Date, sandbox?: PluginSandbox) => {
    try {
      await sandbox?.storage.set('last-updated', date.toISOString());

      // Subscribe to other plugins' events
      sandbox?.hostAPI.subscribeToEvent('todo:completed', eventData => {
        console.log('Progress plugin: Todos updated', eventData);
      });

      sandbox?.hostAPI.subscribeToEvent('habit:completed', eventData => {
        console.log('Progress plugin: Habits updated', eventData);
      });
    } catch (error) {
      console.error('Progress plugin activation error:', error);
    }
  },
};

function ProgressPluginContent({
  date,
  data,
  sandbox,
}: { date: Date; data?: any; sandbox?: PluginSandbox }) {
  const [progress, setProgress] = useState(
    data?.progress || {
      completed: 0,
      total: 0,
      percentage: 0,
    },
  );

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const savedProgress = await sandbox?.storage.get('progress');
        if (savedProgress) {
          setProgress(savedProgress);
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    };
    loadProgress();
  }, [sandbox]);

  const updateProgress = async (completed: number, total: number) => {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const newProgress = { completed, total, percentage };

    setProgress(newProgress);

    try {
      await sandbox?.storage.set('progress', newProgress);
      sandbox?.hostAPI.updatePluginData({ progress: newProgress });
      sandbox?.hostAPI.emitEvent('progress:updated', newProgress);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-sm">Daily Progress</h4>
        <button
          onClick={() =>
            updateProgress(progress.completed + 1, progress.total + 1)
          }
          className="text-xs bg-cyan-500 text-white px-2 py-1 rounded hover:bg-cyan-600"
        >
          Add Task
        </button>
      </div>
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
}

// Sample Interactive Plugin with buttons
export const interactivePlugin: IPlugin = {
  id: 'interactive-plugin',
  name: 'Interactive Demo',
  description: 'Demo plugin with interactive elements',
  version: '1.0.0',
  icon: '🎮',
  color: '#f97316',
  isActive: false,
  trusted: true,

  permissions: {
    storage: {
      maxSize: 256 * 1024, // 256KB
      allowedKeys: ['counter', 'history', 'settings'],
    },
    network: {
      allowedDomains: [],
      maxRequests: 0,
    },
    events: {
      canEmit: ['interactive:clicked', 'interactive:reset'],
      canSubscribe: ['app:date:changed'],
    },
    ui: {
      maxHeight: 300,
      allowedComponents: ['div', 'span', 'button'],
    },
  },

  data: {
    counter: 0,
    lastClicked: null,
  },

  renderContent: (date: Date, data?: any, sandbox?: PluginSandbox) => {
    return (
      <InteractivePluginContent date={date} data={data} sandbox={sandbox} />
    );
  },

  onActivate: async (date: Date, sandbox?: PluginSandbox) => {
    try {
      await sandbox?.storage.set('session-start', date.toISOString());
    } catch (error) {
      console.error('Interactive plugin activation error:', error);
    }
  },
};

function InteractivePluginContent({
  date,
  data,
  sandbox,
}: { date: Date; data?: any; sandbox?: PluginSandbox }) {
  const [counter, setCounter] = useState(data?.counter || 0);
  const [lastClicked, setLastClicked] = useState(data?.lastClicked);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedCounter = await sandbox?.storage.get('counter');
        const savedLastClicked = await sandbox?.storage.get('lastClicked');

        if (savedCounter !== null) setCounter(savedCounter);
        if (savedLastClicked) setLastClicked(savedLastClicked);
      } catch (error) {
        console.error('Error loading interactive data:', error);
      }
    };
    loadData();
  }, [sandbox]);

  const handleIncrement = async () => {
    const newCounter = counter + 1;
    const timestamp = new Date().toISOString();

    setCounter(newCounter);
    setLastClicked(timestamp);

    try {
      await sandbox?.storage.set('counter', newCounter);
      await sandbox?.storage.set('lastClicked', timestamp);

      sandbox?.hostAPI.updatePluginData({
        counter: newCounter,
        lastClicked: timestamp,
      });

      sandbox?.hostAPI.emitEvent('interactive:clicked', {
        counter: newCounter,
        timestamp,
      });
    } catch (error) {
      console.error('Error incrementing counter:', error);
    }
  };

  const handleReset = async () => {
    setCounter(0);
    const timestamp = new Date().toISOString();
    setLastClicked(timestamp);

    try {
      await sandbox?.storage.set('counter', 0);
      await sandbox?.storage.set('lastClicked', timestamp);

      sandbox?.hostAPI.updatePluginData({
        counter: 0,
        lastClicked: timestamp,
      });

      sandbox?.hostAPI.emitEvent('interactive:reset', { timestamp });
    } catch (error) {
      console.error('Error resetting counter:', error);
    }
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
}

export const samplePlugins: IPlugin[] = [
  todoPlugin,
  notePlugin,
  weatherPlugin,
  habitTrackerPlugin,
  calendarPlugin,
  progressPlugin,
  interactivePlugin,
  SecureExamplePlugin,
];
