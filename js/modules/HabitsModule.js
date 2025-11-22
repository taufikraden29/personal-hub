import { BaseModule } from '../utils/BaseModule.js';

/**
 * HabitsModule - Manages habit tracking with streaks
 */
export class HabitsModule extends BaseModule {
  constructor(storageManager, eventBus) {
    super(storageManager, eventBus, 'habits');
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventBus.on('tab:changed', ({ tab }) => {
      if (tab === 'habits') {
        this.render();
      }
    });
  }

  createHabit(name) {
    if (!name.trim()) {
      this.eventBus.emit('notification', {
        message: 'Nama habit tidak boleh kosong!',
        type: 'error'
      });
      return null;
    }

    const habit = this.create({
      name,
      streak: 0,
      completedDates: []
    });

    this.eventBus.emit('notification', {
      message: 'Habit berhasil ditambahkan',
      type: 'success'
    });
    this.render();
    return habit;
  }

  addFromInput() {
    const input = document.getElementById('new-habit-input');
    if (input && input.value.trim()) {
      this.createHabit(input.value.trim());
      input.value = '';
    }
  }

  toggleHabit(id) {
    const habit = this.findById(id);
    const today = new Date().toDateString();

    if (habit) {
      if (habit.completedDates.includes(today)) {
        habit.completedDates = habit.completedDates.filter(date => date !== today);
        habit.streak = Math.max(0, habit.streak - 1);
      } else {
        habit.completedDates.push(today);
        habit.streak++;
      }
      this.update(id, habit);
      this.render();
    }
  }

  deleteHabit(id) {
    const deleted = this.delete(id);
    if (deleted) {
      this.eventBus.emit('notification', {
        message: 'Habit berhasil dihapus',
        type: 'info'
      });
      this.render();
    }
    return deleted;
  }

  calculateStreak() {
    let maxStreak = 0;
    const today = new Date();
    
    this.data.forEach(habit => {
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toDateString();
        
        if (habit.completedDates.includes(dateStr)) {
          if (i === 0 || habit.completedDates.includes(new Date(today).setDate(today.getDate() - (i - 1)))) {
            maxStreak = Math.max(maxStreak, i + 1);
          }
        } else if (i > 0) {
          break;
        }
      }
    });
    
    return maxStreak;
  }

  render() {
    const container = document.getElementById('habits-container');

    if (this.data.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12">
          <i class="fas fa-chart-line text-6xl text-white/30 mb-4"></i>
          <p class="text-white/60">Belum ada habit. Mulai dengan menambah habit baru!</p>
        </div>
      `;
      return;
    }

    const today = new Date().toDateString();

    container.innerHTML = this.data.map(habit => {
      const isCompletedToday = habit.completedDates.includes(today);
      const percentage = Math.min(100, (habit.streak / 30) * 100);
      const streakLevel = this.getStreakLevel(habit.streak);

      return `
        <div class="habit-ring glass-morphism rounded-xl p-6 text-white">
          <div class="flex justify-between items-start mb-4">
            <h3 class="font-bold text-lg flex-1">${this.escapeHtml(habit.name)}</h3>
            <button onclick="app.habits.deleteHabit(${habit.id})" 
                    class="p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-white transition-all">
              <i class="fas fa-trash text-sm"></i>
            </button>
          </div>
          
          <div class="habit-streak-badge mb-4">
            <div class="text-4xl font-bold">${habit.streak}</div>
            <div class="text-xs opacity-80 font-semibold">${streakLevel}</div>
          </div>
          
          <div class="mb-2">
            <div class="flex justify-between text-xs text-white/60 mb-1">
              <span>Progress ke 30 hari</span>
              <span>${Math.round(percentage)}%</span>
            </div>
            <div class="habit-progress-bar">
              <div class="habit-progress-fill" style="width: ${percentage}%"></div>
            </div>
          </div>
          
          <button onclick="app.habits.toggleHabit(${habit.id})" 
                  class="w-full py-3 rounded-xl font-semibold ${isCompletedToday ? 'bg-green-500/40 border-2 border-green-400/50' : 'glass-morphism border-2 border-white/10'} hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
            ${isCompletedToday 
              ? '<i class="fas fa-check-circle"></i><span>Selesai Hari Ini!</span>' 
              : '<i class="far fa-circle"></i><span>Tandai Selesai</span>'}
          </button>
          
          ${habit.streak > 0 ? `
            <div class="mt-3 text-center text-xs text-white/50">
              <i class="fas fa-calendar-check mr-1"></i>
              ${habit.completedDates.length} hari total
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  getStreakLevel(streak) {
    if (streak === 0) return 'Mulai';
    if (streak < 7) return 'Pemula';
    if (streak < 21) return 'Berkembang';
    if (streak < 30) return 'Konsisten';
    if (streak < 60) return 'Hebat';
    if (streak < 100) return 'Luar Biasa';
    return 'Legenda';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
