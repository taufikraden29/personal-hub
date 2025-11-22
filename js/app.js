/**
 * Main Application - Orchestrates all modules
 */
import { StorageManager } from './storage/StorageManager.js';
import { EventBus } from './utils/EventBus.js';
import { UIManager } from './ui/UIManager.js';
import { NotesModule } from './modules/NotesModule.js';
import { TodosModule } from './modules/TodosModule.js';
import { PomodoroModule } from './modules/PomodoroModule.js';
import { HabitsModule } from './modules/HabitsModule.js';
import { MoodModule } from './modules/MoodModule.js';
import { CalendarModule } from './modules/CalendarModule.js';
import { QuickNotesModule } from './modules/QuickNotesModule.js';
import { StatsManager } from './utils/StatsManager.js';
import { DataManager } from './utils/DataManager.js';

class PersonalHubApp {
  constructor() {
    this.storage = new StorageManager();
    this.eventBus = new EventBus();
    
    this.ui = new UIManager(this.eventBus);
    
    this.notes = new NotesModule(this.storage, this.eventBus);
    this.todos = new TodosModule(this.storage, this.eventBus);
    this.pomodoro = new PomodoroModule(this.storage, this.eventBus);
    this.habits = new HabitsModule(this.storage, this.eventBus);
    this.moods = new MoodModule(this.storage, this.eventBus);
    this.calendar = new CalendarModule(this.storage, this.eventBus, this.notes, this.todos);
    this.quickNotes = new QuickNotesModule(this.storage, this.eventBus);
    
    this.stats = new StatsManager(this.eventBus, this.notes, this.todos, this.habits, this.moods);
    this.dataManager = new DataManager(this.storage, this.eventBus);
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.requestNotificationPermission();
    this.notes.render();
  }

  setupEventListeners() {
    this.eventBus.on('notification', ({ message, type }) => {
      this.ui.showNotification(message, type);
    });

    const importFileInput = document.getElementById('import-file');
    if (importFileInput) {
      importFileInput.addEventListener('change', (e) => {
        this.dataManager.handleImport(e);
      });
    }
  }

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new PersonalHubApp();
});
