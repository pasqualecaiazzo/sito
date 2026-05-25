// ── THEME SWITCHER LOGIC ────────────────────────────────
const themeToggleBtn = document.getElementById('theme-toggle');

if (themeToggleBtn) {
  // Sync button state and document theme
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  let currentTheme = (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) ? 'light' : 'dark';
  
  // Set theme attribute
  document.documentElement.setAttribute('data-theme', currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    
    // Notify canvas graph if it exists on the page
    if (window.graphInstance) {
      window.graphInstance.updateColors();
    }
  });
}

// ── REVEAL SECTIONS ON SCROLL (Intersection Observer) ───
const revealCallback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
};

const revealObserver = new IntersectionObserver(revealCallback, {
  threshold: 0.15
});

document.querySelectorAll('.reveal').forEach(section => {
  revealObserver.observe(section);
});



