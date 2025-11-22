/**
 * PomodoroModule - Manages Pomodoro timer with statistics
 */
export class PomodoroModule {
  constructor(storageManager, eventBus) {
    this.storage = storageManager;
    this.eventBus = eventBus;
    this.stats = this.storage.get('pomodoroStats', { sessions: 0, totalTime: 0 });
    this.time = 25 * 60;
    this.interval = null;
    this.isRunning = false;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventBus.on('tab:changed', ({ tab }) => {
      if (tab === 'pomodoro') {
        this.updateStatsDisplay();
      }
    });
  }

  setTime(minutes) {
    this.time = minutes * 60;
    this.updateDisplay();
    if (this.isRunning) {
      this.pause();
    }
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      document.getElementById('pomodoro-start').classList.add('hidden');
      document.getElementById('pomodoro-pause').classList.remove('hidden');
      document.getElementById('pomodoro-status').textContent = 'Fokus!';

      this.interval = setInterval(() => {
        if (this.time > 0) {
          this.time--;
          this.updateDisplay();
        } else {
          this.complete();
        }
      }, 1000);
    }
  }

  pause() {
    if (this.isRunning) {
      this.isRunning = false;
      clearInterval(this.interval);
      document.getElementById('pomodoro-start').classList.remove('hidden');
      document.getElementById('pomodoro-pause').classList.add('hidden');
      document.getElementById('pomodoro-status').textContent = 'Dijeda';
    }
  }

  reset() {
    this.pause();
    this.time = 25 * 60;
    this.updateDisplay();
    document.getElementById('pomodoro-status').textContent = 'Siap Memulai';
  }

  complete() {
    this.pause();
    this.stats.sessions++;
    this.stats.totalTime += 25;
    this.storage.set('pomodoroStats', this.stats);
    this.updateStatsDisplay();

    document.getElementById('pomodoro-status').textContent = 'Selesai! Istirahat sejenak';

    if (Notification.permission === 'granted') {
      new Notification('Pomodoro Selesai!', {
        body: 'Waktu istirahat 5 menit',
        icon: 'https://cdn-icons-png.flaticon.com/512/2920/2920277.png'
      });
    }

    this.eventBus.emit('notification', {
      message: 'Pomodoro selesai! Waktu istirahat 5 menit',
      type: 'success'
    });
  }

  updateDisplay() {
    const minutes = Math.floor(this.time / 60);
    const seconds = this.time % 60;
    const display = document.getElementById('pomodoro-display');
    if (display) {
      display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  updateStatsDisplay() {
    const sessionsEl = document.getElementById('pomodoro-sessions');
    const timeEl = document.getElementById('pomodoro-time');
    
    if (sessionsEl) sessionsEl.textContent = this.stats.sessions;
    if (timeEl) timeEl.textContent = `${this.stats.totalTime}m`;
  }

  getStats() {
    return { ...this.stats };
  }
}
