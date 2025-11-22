import { BaseModule } from '../utils/BaseModule.js';

/**
 * NotesModule - Manages personal notes with categories and search
 */
export class NotesModule extends BaseModule {
  constructor(storageManager, eventBus) {
    super(storageManager, eventBus, 'notes');
    this.currentNoteId = null;
    this.currentCategory = '';
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventBus.on('tab:changed', ({ tab }) => {
      if (tab === 'notes') {
        this.render();
      }
    });

    this.eventBus.on('shortcut:new-note', () => {
      this.openModal();
    });
  }

  createNote(title, content, category) {
    if (!title.trim()) {
      this.eventBus.emit('notification', {
        message: 'Judul catatan tidak boleh kosong!',
        type: 'error'
      });
      return null;
    }

    const note = this.create({ title, content, category });
    this.eventBus.emit('notification', {
      message: 'Catatan berhasil disimpan',
      type: 'success'
    });
    this.render();
    return note;
  }

  updateNote(id, title, content, category) {
    const updated = this.update(id, { title, content, category });
    if (updated) {
      this.eventBus.emit('notification', {
        message: 'Catatan berhasil diperbarui',
        type: 'success'
      });
      this.render();
    }
    return updated;
  }

  deleteNote(id) {
    const deleted = this.delete(id);
    if (deleted) {
      this.eventBus.emit('notification', {
        message: 'Catatan berhasil dihapus',
        type: 'info'
      });
      this.render();
    }
    return deleted;
  }

  filterByCategory(category) {
    this.currentCategory = category;
    this.render();
  }

  search(query) {
    const noteCards = document.querySelectorAll('.note-card');
    const searchTerm = query.toLowerCase();

    noteCards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const content = card.querySelector('p').textContent.toLowerCase();
      card.style.display = title.includes(searchTerm) || content.includes(searchTerm) ? 'block' : 'none';
    });
  }

  getFilteredNotes() {
    if (!this.currentCategory) {
      return this.getAll();
    }
    return this.data.filter(n => n.category === this.currentCategory);
  }

  openModal(noteId = null) {
    this.currentNoteId = noteId;
    const modal = document.getElementById('note-modal');
    const titleInput = document.getElementById('note-title');
    const contentInput = document.getElementById('note-content');
    const categorySelect = document.getElementById('note-category');

    if (noteId) {
      const note = this.findById(noteId);
      if (note) {
        titleInput.value = note.title;
        contentInput.value = note.content;
        categorySelect.value = note.category || 'personal';
      }
    } else {
      titleInput.value = '';
      contentInput.value = '';
      categorySelect.value = 'personal';
    }

    modal.style.display = 'flex';
  }

  closeModal() {
    document.getElementById('note-modal').style.display = 'none';
    this.currentNoteId = null;
  }

  saveFromModal() {
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;
    const category = document.getElementById('note-category').value;

    if (this.currentNoteId) {
      this.updateNote(this.currentNoteId, title, content, category);
    } else {
      this.createNote(title, content, category);
    }

    this.closeModal();
  }

  render() {
    const container = document.getElementById('notes-container');
    const notes = this.getFilteredNotes();

    if (notes.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12">
          <i class="fas fa-sticky-note text-6xl text-white/30 mb-4"></i>
          <p class="text-white/60">Belum ada catatan. Mulai dengan menambah catatan baru!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = notes.map(note => `
      <div class="note-card glass-morphism rounded-xl p-5 text-white">
        <div class="flex justify-between items-start mb-3">
          <h3 class="font-bold text-lg flex-1 mr-2 text-white">${this.escapeHtml(note.title)}</h3>
          <div class="flex gap-2">
            <button onclick="app.notes.openModal(${note.id})" 
                    class="p-2 rounded-lg hover:bg-white/10 transition-all hover:scale-110"
                    title="Edit catatan">
              <i class="fas fa-edit text-sm"></i>
            </button>
            <button onclick="app.notes.handleDelete(${note.id})" 
                    class="p-2 rounded-lg hover:bg-red-500/20 transition-all hover:scale-110"
                    title="Hapus catatan">
              <i class="fas fa-trash text-sm"></i>
            </button>
          </div>
        </div>
        <p class="note-content-preview text-white/70 text-sm mb-4 leading-relaxed">
          ${this.escapeHtml(note.content || 'Tidak ada konten')}
        </p>
        <div class="flex justify-between items-center">
          <span class="note-category-badge ${this.getCategoryClass(note.category)}">
            ${this.getCategoryIcon(note.category)}
            ${this.getCategoryLabel(note.category)}
          </span>
          <div class="text-xs text-white/50 flex items-center gap-1">
            <i class="far fa-clock"></i>
            <span>${this.formatDate(note.updatedAt)}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  handleDelete(id) {
    if (confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
      this.deleteNote(id);
    }
  }

  getCategoryClass(category) {
    const classes = {
      personal: 'bg-blue-500/30 text-blue-200',
      work: 'bg-purple-500/30 text-purple-200',
      ideas: 'bg-yellow-500/30 text-yellow-200',
      important: 'bg-red-500/30 text-red-200'
    };
    return classes[category] || 'bg-gray-500/30 text-gray-200';
  }

  getCategoryLabel(category) {
    const labels = {
      personal: 'Personal',
      work: 'Pekerjaan',
      ideas: 'Ide',
      important: 'Penting'
    };
    return labels[category] || 'Lainnya';
  }

  getCategoryIcon(category) {
    const icons = {
      personal: '<i class="fas fa-user"></i>',
      work: '<i class="fas fa-briefcase"></i>',
      ideas: '<i class="fas fa-lightbulb"></i>',
      important: '<i class="fas fa-star"></i>'
    };
    return icons[category] || '<i class="fas fa-tag"></i>';
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
