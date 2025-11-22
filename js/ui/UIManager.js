/**
 * UIManager - Manages UI components like notifications, modals, and navigation
 */
export class UIManager {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.activeTab = 'notes';
    this.isDarkMode = false;
    this.init();
  }

  init() {
    this.initTheme();
    this.setupKeyboardShortcuts();
    this.setupMobileMenu();
  }

  initTheme() {
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      this.updateThemeIcon();
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', this.isDarkMode);
    this.updateThemeIcon();
    this.showNotification(
      this.isDarkMode ? 'Mode gelap diaktifkan' : 'Mode terang diaktifkan',
      'info'
    );
  }

  updateThemeIcon() {
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');
    if (this.isDarkMode) {
      icon.className = 'fas fa-sun';
      text.textContent = 'Mode Terang';
    } else {
      icon.className = 'fas fa-moon';
      text.textContent = 'Mode Gelap';
    }
  }

  showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = 'notification-toast glass-morphism rounded-xl p-4 mb-2 text-white';

    const bgColor = type === 'success' ? 'bg-green-500/30' :
                    type === 'error' ? 'bg-red-500/30' : 'bg-blue-500/30';

    notification.style.background = bgColor;
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                       type === 'error' ? 'fa-exclamation-circle' : 
                       'fa-info-circle'}"></i>
        <span>${message}</span>
      </div>
    `;

    container.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.5s ease';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(section => {
      section.classList.add('hidden');
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('tab-active');
    });

    const section = document.getElementById(`${tabName}-section`);
    const button = document.getElementById(`${tabName}-tab`);
    
    if (section) section.classList.remove('hidden');
    if (button) button.classList.add('tab-active');

    this.activeTab = tabName;
    this.eventBus.emit('tab:changed', { tab: tabName });

    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth < 1024 && sidebar.classList.contains('mobile-open')) {
      this.toggleMobileMenu();
    }
  }

  toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('mobile-backdrop');
    const hamburger = document.getElementById('mobile-menu-toggle');
    
    sidebar.classList.toggle('mobile-open');
    backdrop.classList.toggle('active');
    
    if (sidebar.classList.contains('mobile-open')) {
      document.body.style.overflow = 'hidden';
      hamburger.innerHTML = '<i class="fas fa-times text-lg"></i>';
    } else {
      document.body.style.overflow = '';
      hamburger.innerHTML = '<i class="fas fa-bars text-lg"></i>';
    }
  }

  toggleFocusMode() {
    const focusMode = document.getElementById('focus-mode');
    focusMode.classList.toggle('active');
    if (focusMode.classList.contains('active')) {
      this.showNotification('Mode fokus diaktifkan', 'success');
    }
  }

  setupMobileMenu() {
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) {
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('mobile-backdrop');
        const hamburger = document.getElementById('mobile-menu-toggle');
        
        sidebar.classList.remove('mobile-open');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
        hamburger.innerHTML = '<i class="fas fa-bars text-lg"></i>';
      }
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            this.eventBus.emit('shortcut:new-note');
            break;
          case 't':
            e.preventDefault();
            this.eventBus.emit('shortcut:new-todo');
            break;
          case 'f':
            e.preventDefault();
            this.toggleFocusMode();
            break;
          case 'q':
            e.preventDefault();
            this.eventBus.emit('shortcut:quick-note');
            break;
          case 'e':
            e.preventDefault();
            this.eventBus.emit('shortcut:export');
            break;
          case 'i':
            e.preventDefault();
            this.eventBus.emit('shortcut:import');
            break;
        }
      }
      
      if (e.key === 'Escape') {
        const sidebar = document.getElementById('sidebar');
        if (sidebar.classList.contains('mobile-open')) {
          this.toggleMobileMenu();
        }
      }
    });
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
    }
  }
}
