// Parallax Effect
document.addEventListener('DOMContentLoaded', function() {
    const parallaxContainer = document.querySelector('.file-icons-container');
    
    if (parallaxContainer) {
      let lastScrollPosition = 0;
      let ticking = false;
      
      window.addEventListener('scroll', function() {
        lastScrollPosition = window.scrollY;
        
        if (!ticking) {
          window.requestAnimationFrame(function() {
            updateParallax(lastScrollPosition);
            ticking = false;
          });
          ticking = true;
        }
      });
      
      function updateParallax(scrollPos) {
        // Adjust the 0.3 value to control parallax speed (lower = slower)
        const movement = scrollPos * -.03;
        parallaxContainer.style.transform = `translateX(${movement}px)`;
      }
      
      // Active state handling
      const fileIcons = document.querySelectorAll('.file-icon');
      fileIcons.forEach(icon => {
        icon.addEventListener('click', function() {
          fileIcons.forEach(i => i.classList.remove('active'));
          this.classList.add('active');
        });
      });
    }
  });