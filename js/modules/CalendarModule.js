/**
 * CalendarModule - Displays calendar with notes and todos
 */
export class CalendarModule {
  constructor(storageManager, eventBus, notesModule, todosModule) {
    this.storage = storageManager;
    this.eventBus = eventBus;
    this.notes = notesModule;
    this.todos = todosModule;
    this.currentMonth = new Date();
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventBus.on('tab:changed', ({ tab }) => {
      if (tab === 'calendar') {
        this.render();
      }
    });
  }

  previousMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.render();
  }

  nextMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.render();
  }

  showDayEvents(dateStr) {
    const dayNotes = this.notes.getAll().filter(n => 
      new Date(n.createdAt).toDateString() === dateStr
    );
    const dayTodos = this.todos.getAll().filter(t => 
      new Date(t.createdAt).toDateString() === dateStr
    );

    let message = `Events for ${new Date(dateStr).toLocaleDateString('id-ID')}:\n\n`;

    if (dayNotes.length > 0) {
      message += 'Notes:\n';
      dayNotes.forEach(note => {
        message += `- ${note.title}\n`;
      });
    }

    if (dayTodos.length > 0) {
      message += '\nTasks:\n';
      dayTodos.forEach(todo => {
        message += `- ${todo.text}\n`;
      });
    }

    if (dayNotes.length === 0 && dayTodos.length === 0) {
      message = 'No events for this day';
    }

    this.eventBus.emit('notification', {
      message,
      type: 'info'
    });
  }

  render() {
    this.renderMonthHeader();
    this.renderDays();
  }

  renderMonthHeader() {
    const monthEl = document.getElementById('current-month');
    if (monthEl) {
      const year = this.currentMonth.getFullYear();
      const month = this.currentMonth.getMonth();
      monthEl.textContent = new Date(year, month).toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric'
      });
    }
  }

  renderDays() {
    const container = document.getElementById('calendar-days');
    if (!container) return;

    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    container.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
      container.innerHTML += '<div></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toDateString();
      const dayNotes = this.notes.getAll().filter(n => 
        new Date(n.createdAt).toDateString() === dateStr
      );
      const dayTodos = this.todos.getAll().filter(t => 
        new Date(t.createdAt).toDateString() === dateStr
      );
      const hasEvents = dayNotes.length > 0 || dayTodos.length > 0;

      container.innerHTML += `
        <div class="calendar-day glass-morphism rounded-lg p-2 text-center text-white cursor-pointer relative ${hasEvents ? 'ring-2 ring-white/50' : ''}"
             onclick="app.calendar.showDayEvents('${dateStr}')">
          <div class="font-semibold">${day}</div>
          ${dayNotes.length > 0 ? `<div class="text-xs text-blue-300">${dayNotes.length} notes</div>` : ''}
          ${dayTodos.length > 0 ? `<div class="text-xs text-green-300">${dayTodos.length} tasks</div>` : ''}
        </div>
      `;
    }
  }
}
