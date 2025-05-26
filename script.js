const animatedElements = document.querySelectorAll('.fade-in, .slide-in, .bounce-in');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.1
});

animatedElements.forEach(el => {
  observer.observe(el);
});

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.filter-button');
  const images = document.querySelectorAll('.gallery img');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const category = button.getAttribute('data-category');

      images.forEach(img => {
        const imgCategory = img.getAttribute('data-category');

        if (category === 'all' || imgCategory === category) {
          img.classList.remove('hidden');
        } else {
          img.classList.add('hidden');
        }
      });
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  const closeBtn = document.querySelector('.close');

  if (modal && modalImg && closeBtn) {
    document.querySelectorAll('.gallery img').forEach(img => {
      img.addEventListener('click', () => {
        modal.style.display = 'block';
        modalImg.src = img.src;
        modalImg.alt = img.alt;
      });
    });

    closeBtn.onclick = () => {
      modal.style.display = 'none';
    };

    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    };
  }
});

