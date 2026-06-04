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


// ── NAV DRAWER LOGIC (Unified Desktop & Mobile) ──────────
const navToggleBtn = document.getElementById('nav-toggle');
const navDrawer = document.getElementById('nav-drawer');
const drawerCloseBtn = document.getElementById('drawer-close');
const drawerBackdrop = document.getElementById('drawer-backdrop');

function openDrawer() {
  if (navDrawer && drawerBackdrop && navToggleBtn) {
    navDrawer.classList.add('open');
    drawerBackdrop.classList.add('active');
    navToggleBtn.setAttribute('aria-expanded', 'true');
    navDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
}

function closeDrawer() {
  if (navDrawer && drawerBackdrop && navToggleBtn) {
    navDrawer.classList.remove('open');
    drawerBackdrop.classList.remove('active');
    navToggleBtn.setAttribute('aria-expanded', 'false');
    navDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restore background scrolling
  }
}

if (navToggleBtn) {
  navToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (navDrawer && navDrawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });
}

if (drawerCloseBtn) {
  drawerCloseBtn.addEventListener('click', closeDrawer);
}

if (drawerBackdrop) {
  drawerBackdrop.addEventListener('click', closeDrawer);
}

// Close drawer when a link is clicked
if (navDrawer) {
  navDrawer.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
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



