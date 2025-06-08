// Theme Toggle Functionality
const themeToggle = document.getElementById('themeToggle');
const toggleText = document.querySelector('.toggle-text');

// Check for saved theme preference or use preferred color scheme
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateToggleText(savedTheme);
  } else if (prefersDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateToggleText('dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    updateToggleText('light');
  }
}

// Update toggle button text
function updateToggleText(theme) {
  toggleText.textContent = theme === 'dark' ? '-' : '+';
}

// Toggle between themes
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateToggleText(newTheme);
}

// Initialize theme on load
initTheme();

// Add event listener to toggle button
themeToggle.addEventListener('click', toggleTheme);

// Watch for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!localStorage.getItem('theme')) {
    const newTheme = e.matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    updateToggleText(newTheme);
  }
});