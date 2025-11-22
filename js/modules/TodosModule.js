import { BaseModule } from '../utils/BaseModule.js';

/**
 * TodosModule - Manages todo tasks with priorities and reminders
 */
export class TodosModule extends BaseModule {
  constructor(storageManager, eventBus) {
    super(storageManager, eventBus, 'todos');
    this.setupEventListeners();
    this.startReminderCheck();
  }

  setupEventListeners() {
    this.eventBus.on('tab:changed', ({ tab }) => {
      if (tab === 'todos') {
        this.render();
      }
    });

    this.eventBus.on('shortcut:new-todo', () => {
      this.addFromInput();
    });
  }

  createTodo(text, priority = 'medium', reminder = '') {
    if (!text.trim()) {
      this.eventBus.emit('notification', {
        message: 'Task tidak boleh kosong!',
        type: 'error'
      });
      return null;
    }

    const todo = this.create({
      text,
      priority,
      reminder,
      completed: false
    });

    this.eventBus.emit('notification', {
      message: 'Task berhasil ditambahkan',
      type: 'success'
    });
    this.render();
    return todo;
  }

  toggleComplete(id) {
    const todo = this.findById(id);
    if (todo) {
      this.update(id, { completed: !todo.completed });
      this.render();
    }
  }

  deleteTodo(id) {
    const deleted = this.delete(id);
    if (deleted) {
      this.eventBus.emit('notification', {
        message: 'Task berhasil dihapus',
        type: 'info'
      });
      this.render();
    }
    return deleted;
  }

  addFromInput() {
    const input = document.getElementById('new-todo-input');
    const priority = document.getElementById('todo-priority').value;
    const reminder = document.getElementById('todo-reminder').value;

    if (input && input.value.trim()) {
      this.createTodo(input.value.trim(), priority, reminder);
      input.value = '';
      const reminderInput = document.getElementById('todo-reminder');
      if (reminderInput) reminderInput.value = '';
    }
  }

  getActiveTodos() {
    return this.data.filter(t => !t.completed);
  }

  getCompletedTodos() {
    return this.data.filter(t => t.completed);
  }

  getCompletedCount() {
    return this.getCompletedTodos().length;
  }

  startReminderCheck() {
    this.checkReminders();
    setInterval(() => this.checkReminders(), 60000);
  }

  checkReminders() {
    const now = new Date();
    this.data.forEach(todo => {
      if (!todo.completed && todo.reminder) {
        const reminderTime = new Date(todo.reminder);
        if (reminderTime <= now && reminderTime > new Date(now.getTime() - 60000)) {
          this.eventBus.emit('notification', {
            message: `Reminder: ${todo.text}`,
            type: 'info'
          });
          
          if (Notification.permission === 'granted') {
            new Notification('Task Reminder', {
              body: todo.text,
              icon: 'https://cdn-icons-png.flaticon.com/512/2920/2920277.png'
            });
          }
        }
      }
    });
  }

  render() {
    this.renderActiveTodos();
    this.renderCompletedTodos();
  }

  renderActiveTodos() {
    const container = document.getElementById('active-todos');
    const todos = this.getActiveTodos();

    if (todos.length === 0) {
      container.innerHTML = '<p class="text-white/60 text-sm">Tidak ada task aktif</p>';
      return;
    }

    container.innerHTML = todos.map(todo => `
      <div class="todo-item priority-${todo.priority} ${todo.completed ? 'completed' : ''} glass-morphism rounded-xl p-4 flex items-center gap-4">
        <input type="checkbox" ${todo.completed ? 'checked' : ''} 
               onchange="app.todos.toggleComplete(${todo.id})"
               class="flex-shrink-0">
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-1">
            <span class="text-white ${todo.completed ? 'line-through' : 'font-medium'}">${this.escapeHtml(todo.text)}</span>
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${this.getPriorityClass(todo.priority)} flex items-center gap-1">
              ${this.getPriorityIcon(todo.priority)}
              ${this.getPriorityLabel(todo.priority)}
            </span>
          </div>
          ${todo.reminder ? `
            <div class="text-xs text-white/60 flex items-center gap-1 mt-1">
              <i class="far fa-bell"></i>
              <span>${this.formatReminderTime(todo.reminder)}</span>
            </div>
          ` : ''}
        </div>
        <button onclick="app.todos.deleteTodo(${todo.id})" 
                class="flex-shrink-0 p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-white transition-all">
          <i class="fas fa-trash text-sm"></i>
        </button>
      </div>
    `).join('');
  }

  renderCompletedTodos() {
    const container = document.getElementById('completed-todos');
    const todos = this.getCompletedTodos();

    if (todos.length === 0) {
      container.innerHTML = '<p class="text-white/60 text-sm">Belum ada task yang selesai</p>';
      return;
    }

    container.innerHTML = todos.map(todo => `
      <div class="todo-item completed glass-morphism rounded-xl p-4 flex items-center gap-4">
        <input type="checkbox" checked 
               onchange="app.todos.toggleComplete(${todo.id})"
               class="flex-shrink-0">
        <div class="flex-1 min-w-0">
          <span class="text-white line-through opacity-70">${this.escapeHtml(todo.text)}</span>
        </div>
        <button onclick="app.todos.deleteTodo(${todo.id})" 
                class="flex-shrink-0 p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-white transition-all">
          <i class="fas fa-trash text-sm"></i>
        </button>
      </div>
    `).join('');
  }

  getPriorityClass(priority) {
    const classes = {
      high: 'bg-red-500/30 text-red-200',
      medium: 'bg-yellow-500/30 text-yellow-200',
      low: 'bg-green-500/30 text-green-200'
    };
    return classes[priority] || 'bg-gray-500/30 text-gray-200';
  }

  getPriorityLabel(priority) {
    const labels = {
      high: 'Tinggi',
      medium: 'Sedang',
      low: 'Rendah'
    };
    return labels[priority] || 'Normal';
  }

  getPriorityIcon(priority) {
    const icons = {
      high: '<i class="fas fa-exclamation-circle"></i>',
      medium: '<i class="fas fa-minus-circle"></i>',
      low: '<i class="fas fa-check-circle"></i>'
    };
    return icons[priority] || '<i class="fas fa-circle"></i>';
  }

  formatReminderTime(reminderString) {
    const date = new Date(reminderString);
    const now = new Date();
    const diffMs = date - now;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 0) return 'Lewat';
    if (diffMins < 60) return `${diffMins} menit lagi`;
    if (diffHours < 24) return `${diffHours} jam lagi`;
    if (diffDays === 1) return 'Besok';
    if (diffDays < 7) return `${diffDays} hari lagi`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
