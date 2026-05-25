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


// ── MOBILE NAV TOGGLE (Hamburger Menu) ──────────────────
const navToggleBtn = document.getElementById('nav-toggle');
const navEl = navToggleBtn ? navToggleBtn.closest('nav') : null;

if (navToggleBtn && navEl) {
  navToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navEl.classList.toggle('nav-open');
    navToggleBtn.setAttribute('aria-expanded', isOpen);
    navToggleBtn.classList.toggle('open', isOpen);
  });

  // Close menu when a nav link is clicked
  navEl.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navEl.classList.remove('nav-open');
      navToggleBtn.setAttribute('aria-expanded', 'false');
      navToggleBtn.classList.remove('open');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navEl.contains(e.target)) {
      navEl.classList.remove('nav-open');
      navToggleBtn.setAttribute('aria-expanded', 'false');
      navToggleBtn.classList.remove('open');
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



