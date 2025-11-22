/**
 * StatsManager - Manages and displays statistics
 */
export class StatsManager {
  constructor(eventBus, notesModule, todosModule, habitsModule, moodsModule) {
    this.eventBus = eventBus;
    this.notes = notesModule;
    this.todos = todosModule;
    this.habits = habitsModule;
    this.moods = moodsModule;
    
    this.setupEventListeners();
    this.update();
  }

  setupEventListeners() {
    this.eventBus.on('data:changed', () => {
      this.update();
    });
  }

  update() {
    this.updateNotesCount();
    this.updateCompletedTasks();
    this.updateStreak();
  }

  updateNotesCount() {
    const el = document.getElementById('total-notes');
    if (el) {
      el.textContent = this.notes.count();
    }
  }

  updateCompletedTasks() {
    const el = document.getElementById('completed-tasks');
    if (el) {
      el.textContent = this.todos.getCompletedCount();
    }
  }

  updateStreak() {
    const el = document.getElementById('streak-days');
    if (el) {
      el.textContent = this.calculateStreak();
    }
  }

  calculateStreak() {
    let streak = 0;
    const today = new Date();
    const habits = this.habits.getAll();
    const moods = this.moods.getAll();

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toDateString();

      const hasCompletedHabits = habits.some(h => h.completedDates && h.completedDates.includes(dateStr));
      const hasMood = moods.some(m => m.date === dateStr);

      if (hasCompletedHabits || hasMood) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  }
}
