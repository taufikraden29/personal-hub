/**
 * DataManager - Handles data import/export operations
 */
export class DataManager {
  constructor(storageManager, eventBus) {
    this.storage = storageManager;
    this.eventBus = eventBus;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventBus.on('shortcut:export', () => {
      this.exportData();
    });

    this.eventBus.on('shortcut:import', () => {
      this.triggerImport();
    });
  }

  exportData() {
    const data = {
      notes: this.storage.get('notes', []),
      todos: this.storage.get('todos', []),
      habits: this.storage.get('habits', []),
      moods: this.storage.get('moods', []),
      pomodoroStats: this.storage.get('pomodoroStats', {}),
      quickNotes: this.storage.get('quickNotes', []),
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `personal-hub-backup-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    this.eventBus.emit('notification', {
      message: 'Data berhasil diekspor',
      type: 'success'
    });
  }

  triggerImport() {
    const fileInput = document.getElementById('import-file');
    if (fileInput) {
      fileInput.click();
    }
  }

  handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (data.notes) this.storage.set('notes', data.notes);
        if (data.todos) this.storage.set('todos', data.todos);
        if (data.habits) this.storage.set('habits', data.habits);
        if (data.moods) this.storage.set('moods', data.moods);
        if (data.pomodoroStats) this.storage.set('pomodoroStats', data.pomodoroStats);
        if (data.quickNotes) this.storage.set('quickNotes', data.quickNotes);

        this.eventBus.emit('notification', {
          message: 'Data berhasil diimpor. Refresh halaman untuk melihat perubahan.',
          type: 'success'
        });

        setTimeout(() => {
          window.location.reload();
        }, 2000);

      } catch (error) {
        this.eventBus.emit('notification', {
          message: 'Gagal mengimpor data',
          type: 'error'
        });
      }
    };
    reader.readAsText(file);
  }
}
