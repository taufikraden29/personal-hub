import { BaseModule } from '../utils/BaseModule.js';

/**
 * QuickNotesModule - Manages draggable sticky notes
 */
export class QuickNotesModule extends BaseModule {
  constructor(storageManager, eventBus) {
    super(storageManager, eventBus, 'quickNotes');
    this.setupEventListeners();
    this.loadAllNotes();
  }

  setupEventListeners() {
    this.eventBus.on('shortcut:quick-note', () => {
      this.addNote();
    });
  }

  addNote() {
    const quickNote = {
      content: '',
      x: Math.random() * (window.innerWidth - 250),
      y: Math.random() * (window.innerHeight - 250),
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    };

    const note = this.create(quickNote);
    this.renderNote(note);
    
    this.eventBus.emit('notification', {
      message: 'Quick note ditambahkan',
      type: 'success'
    });
    
    return note;
  }

  removeNote(id) {
    const deleted = this.delete(id);
    if (deleted) {
      const element = document.getElementById(`quick-note-${id}`);
      if (element) element.remove();
      
      this.eventBus.emit('notification', {
        message: 'Quick note dihapus',
        type: 'info'
      });
    }
    return deleted;
  }

  updateNoteContent(id, content) {
    this.update(id, { content });
  }

  updateNotePosition(id, x, y) {
    this.update(id, { x, y });
  }

  bringToFront(id) {
    document.querySelectorAll('.quick-note').forEach(note => {
      note.style.zIndex = '1000';
    });
    
    const element = document.getElementById(`quick-note-${id}`);
    if (element) {
      element.style.zIndex = '1001';
    }
  }

  loadAllNotes() {
    this.data.forEach(note => this.renderNote(note));
  }

  renderNote(note) {
    const container = document.getElementById('quick-notes-container');
    const noteElement = document.createElement('div');
    noteElement.className = 'quick-note glass-morphism rounded-xl';
    noteElement.id = `quick-note-${note.id}`;
    noteElement.style.left = note.x + 'px';
    noteElement.style.top = note.y + 'px';
    noteElement.style.background = note.color;
    noteElement.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <button onclick="app.quickNotes.removeNote(${note.id})" class="text-white/80 hover:text-white text-sm">
          <i class="fas fa-times"></i>
        </button>
        <button onclick="app.quickNotes.bringToFront(${note.id})" class="text-white/80 hover:text-white text-sm">
          <i class="fas fa-layer-group"></i>
        </button>
      </div>
      <textarea placeholder="Quick note..." 
                class="w-full h-32 bg-transparent text-white placeholder-white/60 outline-none resize-none text-sm"
                onblur="app.quickNotes.updateNoteContent(${note.id}, this.value)">${note.content}</textarea>
    `;
    container.appendChild(noteElement);
    this.makeDraggable(noteElement, note.id);
  }

  makeDraggable(element, noteId) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;

    element.addEventListener('mousedown', dragMouseDown);

    const self = this;

    function dragMouseDown(e) {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON' || e.target.tagName === 'I') {
        return;
      }

      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      isDragging = true;
      element.classList.add('dragging');

      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;

      self.bringToFront(noteId);
    }

    function elementDrag(e) {
      if (!isDragging) return;

      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;

      let newTop = element.offsetTop - pos2;
      let newLeft = element.offsetLeft - pos1;

      newTop = Math.max(0, Math.min(newTop, window.innerHeight - element.offsetHeight));
      newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - element.offsetWidth));

      element.style.top = newTop + "px";
      element.style.left = newLeft + "px";

      self.updateNotePosition(noteId, newLeft, newTop);
    }

    function closeDragElement() {
      isDragging = false;
      element.classList.remove('dragging');
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
}
