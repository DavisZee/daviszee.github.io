const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      } else {
        entry.target.classList.remove('show'); // Remove when out of view
      }
    });
  }, {
    threshold: 0.1 // Adjust sensitivity (0.1 = 10% visible)
  });
  
  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));


  // Dropdown toggle
const dropdownToggle = document.querySelector('.dropdown-toggle');
const dropdownMenu = document.querySelector('.dropdown-menu');

dropdownToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdownMenu.classList.toggle('open');
});

// Close when clicking anywhere else
document.addEventListener('click', () => {
  dropdownMenu.classList.remove('open');
});