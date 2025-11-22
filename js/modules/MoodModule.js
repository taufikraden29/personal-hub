import { BaseModule } from '../utils/BaseModule.js';

/**
 * MoodModule - Tracks daily mood with notes and visualization
 */
export class MoodModule extends BaseModule {
  constructor(storageManager, eventBus) {
    super(storageManager, eventBus, 'moods');
    this.currentMood = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventBus.on('tab:changed', ({ tab }) => {
      if (tab === 'mood') {
        this.renderChart();
      }
    });
  }

  selectMood(mood) {
    this.currentMood = mood;
    document.querySelectorAll('.mood-emoji').forEach(emoji => {
      emoji.classList.remove('selected');
    });
    const selected = document.querySelector(`[data-mood="${mood}"]`);
    if (selected) {
      selected.classList.add('selected');
    }
  }

  saveMood(note = '') {
    if (!this.currentMood) {
      this.eventBus.emit('notification', {
        message: 'Pilih mood terlebih dahulu!',
        type: 'error'
      });
      return null;
    }

    const today = new Date().toDateString();
    const existingMoodIndex = this.data.findIndex(m => m.date === today);
    
    const moodData = {
      date: today,
      mood: this.currentMood,
      note,
      timestamp: new Date().toISOString()
    };

    if (existingMoodIndex !== -1) {
      this.data[existingMoodIndex] = moodData;
    } else {
      this.data.push(moodData);
    }

    this.saveData();
    this.renderChart();
    
    this.eventBus.emit('notification', {
      message: 'Mood berhasil disimpan',
      type: 'success'
    });

    this.currentMood = null;
    const noteInput = document.getElementById('mood-note');
    if (noteInput) noteInput.value = '';
    
    document.querySelectorAll('.mood-emoji').forEach(emoji => {
      emoji.classList.remove('selected');
    });

    return moodData;
  }

  renderChart() {
    const container = document.getElementById('mood-chart');
    if (!container) return;

    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push(date.toDateString());
    }

    const moodValues = {
      'very-sad': 1,
      'sad': 2,
      'neutral': 3,
      'happy': 4,
      'very-happy': 5
    };

    container.innerHTML = last7Days.map(dateStr => {
      const mood = this.data.find(m => m.date === dateStr);
      const value = mood ? moodValues[mood.mood] : 0;
      const height = value * 20;
      const emoji = mood ? this.getMoodEmoji(mood.mood) : '❓';

      return `
        <div class="flex flex-col items-center">
          <div class="w-8 bg-white/20 rounded-t" style="height: ${height}px"></div>
          <div class="text-2xl mt-1">${emoji}</div>
          <div class="text-xs text-white/60 mt-1">${new Date(dateStr).getDate()}</div>
        </div>
      `;
    }).join('');
  }

  getMoodEmoji(mood) {
    const emojis = {
      'very-sad': '😢',
      'sad': '😔',
      'neutral': '😐',
      'happy': '😊',
      'very-happy': '😄'
    };
    return emojis[mood] || '❓';
  }
}
