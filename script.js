// Enhanced Animation Observer with Mobile Optimization
class AnimationManager {
  constructor() {
    this.animatedElements = document.querySelectorAll('.fade-in, .slide-in, .bounce-in');
    this.isMobile = window.innerWidth <= 767;
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    this.initAnimationObserver();
    this.handleResizeEvents();
  }

  initAnimationObserver() {
    // Adjust threshold for mobile devices
    const threshold = this.isMobile ? 0.05 : 0.1;
    
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add delay for staggered animations on mobile
          const delay = this.isMobile ? Math.random() * 200 : 0;
          
          setTimeout(() => {
            entry.target.classList.add('visible');
            // Stop observing once animated (performance optimization)
            this.observer.unobserve(entry.target);
          }, delay);
        }
      });
    }, {
      threshold: threshold,
      rootMargin: this.isMobile ? '0px 0px -50px 0px' : '0px 0px -100px 0px'
    });

    this.animatedElements.forEach(el => {
      // Skip animations if user prefers reduced motion
      if (this.isReducedMotion) {
        el.classList.add('visible');
      } else {
        this.observer.observe(el);
      }
    });
  }

  handleResizeEvents() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.isMobile = window.innerWidth <= 767;
      }, 250);
    });
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Enhanced Portfolio Filter with Touch Support
class PortfolioFilter {
  constructor() {
    this.buttons = document.querySelectorAll('.filter-button');
    this.images = document.querySelectorAll('.gallery img');
    this.activeCategory = 'all';
    
    this.init();
  }

  init() {
    if (this.buttons.length === 0 || this.images.length === 0) return;

    this.buttons.forEach(button => {
      // Add both click and touch support
      this.addEventListeners(button);
      
      // Add keyboard support for accessibility
      button.setAttribute('tabindex', '0');
      button.setAttribute('role', 'button');
      button.setAttribute('aria-pressed', 'false');
    });

    // Set initial active state
    const firstButton = this.buttons[0];
    if (firstButton) {
      firstButton.classList.add('active');
      firstButton.setAttribute('aria-pressed', 'true');
    }
  }

  addEventListeners(button) {
    // Click event
    button.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleFilter(button);
    });

    // Touch events for better mobile experience
    let touchStartY = 0;
    button.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    button.addEventListener('touchend', (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const touchDiff = Math.abs(touchEndY - touchStartY);
      
      // Only trigger if it's not a scroll gesture
      if (touchDiff < 10) {
        e.preventDefault();
        this.handleFilter(button);
      }
    });

    // Keyboard support
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleFilter(button);
      }
    });
  }

  handleFilter(activeButton) {
    // Prevent double-clicking the same button
    if (activeButton.classList.contains('active')) return;

    // Update button states
    this.buttons.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
    
    activeButton.classList.add('active');
    activeButton.setAttribute('aria-pressed', 'true');

    const category = activeButton.getAttribute('data-category');
    this.activeCategory = category;

    // Filter images with smooth transition
    this.filterImages(category);
    
    // Provide haptic feedback on mobile (if supported)
    if ('vibrate' in navigator && window.innerWidth <= 767) {
      navigator.vibrate(50);
    }
  }

  filterImages(category) {
    // Use requestAnimationFrame for smooth animations
    requestAnimationFrame(() => {
      this.images.forEach((img, index) => {
        const imgCategory = img.getAttribute('data-category');
        const shouldShow = category === 'all' || imgCategory === category;
        
        // Add staggered animation delay
        setTimeout(() => {
          if (shouldShow) {
            img.classList.remove('hidden');
            img.setAttribute('aria-hidden', 'false');
          } else {
            img.classList.add('hidden');
            img.setAttribute('aria-hidden', 'true');
          }
        }, index * 50);
      });
    });
  }

  // Method to programmatically set filter
  setFilter(category) {
    const button = [...this.buttons].find(btn => 
      btn.getAttribute('data-category') === category
    );
    if (button) {
      this.handleFilter(button);
    }
  }
}

// Enhanced Modal with Touch Gestures and Keyboard Support
class ImageModal {
  constructor() {
    this.modal = document.getElementById('image-modal');
    this.modalImg = document.getElementById('modal-img');
    this.closeBtn = document.querySelector('.close');
    this.galleryImages = document.querySelectorAll('.gallery img');
    
    this.currentImageIndex = 0;
    this.visibleImages = [];
    this.touchStartX = 0;
    this.touchStartY = 0;
    
    this.init();
  }

  init() {
    if (!this.modal || !this.modalImg || !this.closeBtn) return;

    this.setupImageClickHandlers();
    this.setupCloseHandlers();
    this.setupKeyboardNavigation();
    this.setupTouchGestures();
    this.setupAccessibility();
  }

  setupImageClickHandlers() {
    this.galleryImages.forEach((img, index) => {
      img.addEventListener('click', () => {
        this.openModal(img, index);
      });
      
      // Add keyboard support for gallery images
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', `View ${img.alt || 'image'} in full size`);
      
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openModal(img, index);
        }
      });
    });
  }

  setupCloseHandlers() {
    // Close button
    this.closeBtn.addEventListener('click', () => this.closeModal());
    
    // Click outside modal
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // Touch outside modal for mobile
    this.modal.addEventListener('touchend', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (!this.isModalOpen()) return;

      switch (e.key) {
        case 'Escape':
          this.closeModal();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.showPreviousImage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.showNextImage();
          break;
      }
    });
  }

  setupTouchGestures() {
    this.modal.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });

    this.modal.addEventListener('touchend', (e) => {
      if (!this.isModalOpen()) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - this.touchStartX;
      const deltaY = touchEndY - this.touchStartY;

      // Swipe detection (minimum 50px movement)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          this.showPreviousImage(); // Swipe right
        } else {
          this.showNextImage(); // Swipe left
        }
      }
    });
  }

  setupAccessibility() {
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-hidden', 'true');
    this.modal.setAttribute('aria-labelledby', 'modal-title');
  }

  openModal(img, index) {
    this.updateVisibleImages();
    this.currentImageIndex = this.visibleImages.indexOf(img);
    
    this.modal.style.display = 'block';
    this.modal.setAttribute('aria-hidden', 'false');
    this.modalImg.src = img.src;
    this.modalImg.alt = img.alt || 'Full size image';
    
    // Focus management for accessibility
    this.closeBtn.focus();
    
    // Prevent body scroll on mobile
    document.body.style.overflow = 'hidden';
    
    // Add loading state
    this.modalImg.style.opacity = '0';
    this.modalImg.onload = () => {
      this.modalImg.style.opacity = '1';
    };
  }

  closeModal() {
    this.modal.style.display = 'none';
    this.modal.setAttribute('aria-hidden', 'true');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Return focus to the image that opened the modal
    if (this.visibleImages[this.currentImageIndex]) {
      this.visibleImages[this.currentImageIndex].focus();
    }
  }

  showNextImage() {
    if (this.currentImageIndex < this.visibleImages.length - 1) {
      this.currentImageIndex++;
      this.updateModalImage();
    }
  }

  showPreviousImage() {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.updateModalImage();
    }
  }

  updateModalImage() {
    const img = this.visibleImages[this.currentImageIndex];
    if (img) {
      this.modalImg.style.opacity = '0';
      setTimeout(() => {
        this.modalImg.src = img.src;
        this.modalImg.alt = img.alt || 'Full size image';
      }, 150);
    }
  }

  updateVisibleImages() {
    this.visibleImages = [...this.galleryImages].filter(img => 
      !img.classList.contains('hidden')
    );
  }

  isModalOpen() {
    return this.modal.style.display === 'block';
  }
}

// Performance Optimization Utilities
class PerformanceOptimizer {
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  static lazyLoadImages() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  const animationManager = new AnimationManager();
  const portfolioFilter = new PortfolioFilter();
  const imageModal = new ImageModal();
  
  // Performance optimizations
  PerformanceOptimizer.lazyLoadImages();
  
  // Handle page visibility changes (pause animations when tab is not active)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Pause animations or reduce activity
    } else {
      // Resume animations
    }
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    animationManager.destroy();
  });

  // Expose to global scope for debugging (optional)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.portfolioFilter = portfolioFilter;
    window.imageModal = imageModal;
  }
});

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator && 'production' === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll('.filter-button');
  const images = document.querySelectorAll('.gallery img');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');

      // Set active button
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Filter images
      images.forEach(img => {
        const imgCategory = img.getAttribute('data-category');

        if (category === 'all' || imgCategory === category) {
          img.style.display = 'block';
        } else {
          img.style.display = 'none';
        }
      });
    });
  });
});
