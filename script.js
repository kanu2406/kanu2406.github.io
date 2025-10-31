// script.js — robust theme toggle + rotating text + reveal
(function () {
  // rotating phrases (unchanged)
  const phrases = [
    "AI Researcher",
    "Applied Mathematician",
    "Data Enthusiast",
    "Optimization & Causality"
  ];
  let pi = 0;
  const rot = document.getElementById("rotating-text");
  if (rot) {
    rot.textContent = phrases[0];
    setInterval(() => {
      pi = (pi + 1) % phrases.length;
      rot.textContent = phrases[pi];
    }, 2600);
  }

  // THEME: initialize from localStorage or system preference
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  function applyTheme(mode) {
    if (mode === "dark") {
      body.classList.add("dark-mode");
      if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      body.classList.remove("dark-mode");
      if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    console.debug("Applied theme:", mode);
  }

  // determine initial theme
  (function initTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") {
      applyTheme(saved);
    } else {
      // use system preference if no saved choice
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(prefersDark ? "dark" : "light");
    }
  })();

  // toggle action
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nowDark = body.classList.toggle("dark-mode");
      const mode = nowDark ? "dark" : "light";
      localStorage.setItem("theme", mode);
      applyTheme(mode);
    });
  }

  // simple reveal-on-scroll (keeps your previous IO logic)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("show");
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".card, .project-card, .two-col > .card, .skill-group").forEach(el => io.observe(el));
})();

// === education page helpers ===
(function () {
  try {
    // 1) Details: only one coursework open at a time
    const details = Array.from(document.querySelectorAll('details.coursework'));
    details.forEach(d => {
      d.addEventListener('toggle', () => {
        if (!d.open) return;
        details.forEach(other => {
          if (other !== d) other.open = false;
        });
      });
    });

    // 2) Fill counts in each coursework summary
    details.forEach(d => {
      const countSpan = d.querySelector('.cr-count');
      const courses = d.querySelectorAll('.course-tag').length;
      if (countSpan) countSpan.textContent = courses;
    });

    // 3) Awards: count and keyboard support
    const awardsDetails = document.querySelector('.awards details');
    if (awardsDetails) {
      const awardsCountSpan = awardsDetails.querySelector('.award-count');
      const awardItems = document.querySelectorAll('.award-item').length;
      if (awardsCountSpan) awardsCountSpan.textContent = awardItems;
    }

    // 4) Make summary elements keyboard friendly if browser doesn't already
    document.querySelectorAll('details.coursework summary, .awards details summary').forEach(sum => {
      sum.setAttribute('tabindex', '0');
      sum.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const parent = sum.parentElement;
          parent.open = !parent.open;
        }
      });
    });
  } catch (err) {
    // fail silently so main script.js behavior isn't disrupted
    console.error('Education helpers failed:', err);
  }
})();


// ===== scroll-indicator + dynamic nav offset helper =====
(function () {
  // set CSS var --nav-height based on current navbar height
  function setNavHeightVar() {
    const nav = document.getElementById('navbar');
    const fallback = '80px';
    if (nav) {
      const h = nav.offsetHeight;
      document.documentElement.style.setProperty('--nav-height', h + 'px');
    } else {
      document.documentElement.style.setProperty('--nav-height', fallback);
    }
  }

  // hide/fade scroll indicator on scroll and remove on small screens
  function bindScrollIndicator() {
    const indicator = document.querySelector('.scroll-indicator');
    if (!indicator) return;

    // initial hide on small screens
    if (window.innerWidth <= 760) {
      indicator.style.display = 'none';
    } else {
      indicator.style.display = '';
    }

    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      // if scrolled down beyond 60px, fade out; otherwise show
      if (y > 60) {
        indicator.style.opacity = '0';
        indicator.style.transform = 'translateX(-50%) translateY(6px)';
      } else {
        indicator.style.opacity = '1';
        indicator.style.transform = 'translateX(-50%) translateY(0)';
      }
      lastY = y;
    });

    // update on resize: hide on small screens or show on large
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 760) {
        indicator.style.display = 'none';
      } else {
        indicator.style.display = '';
      }
      // recalc nav height in case layout changed
      setNavHeightVar();
    });
  }

  // run on load
  setNavHeightVar();
  bindScrollIndicator();

  // Recompute nav height after fonts/images load (safer)
  window.addEventListener('load', setNavHeightVar);
})();

// ===== mobile nav toggle + nav-height + accessibility =====
(function () {
  const nav = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('primary-menu'); // changed id per HTML
  const navLinks = navMenu ? Array.from(navMenu.querySelectorAll('a')) : [];

  function setNavHeightVar() {
    if (!nav) return;
    const height = nav.offsetHeight || 72;
    document.documentElement.style.setProperty('--nav-height', height + 'px');
  }

  function openMenu(open) {
    if (!navMenu || !navToggle) return;
    const willOpen = (typeof open === 'boolean') ? open : !navMenu.classList.contains('open');
    if (willOpen) {
      navMenu.classList.add('open');
      navToggle.classList.add('open');
      navToggle.setAttribute('aria-expanded', 'true');
      navMenu.setAttribute('aria-hidden', 'false');
      // trap focus? (simple approach: focus first link)
      const firstLink = navMenu.querySelector('a');
      if (firstLink) firstLink.focus({ preventScroll: true });
    } else {
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navMenu.setAttribute('aria-hidden', 'true');
      // return focus to toggle
      navToggle.focus({ preventScroll: true });
    }
    // recalc nav height slightly after open/close
    setTimeout(setNavHeightVar, 120);
  }

  // attach toggle handler
  if (navToggle) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      openMenu();
    });
  }

  // close when clicking outside
  document.addEventListener('click', (e) => {
    if (!navMenu) return;
    if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
      openMenu(false);
    }
  });

  // close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') openMenu(false);
  });

  // close menu on link click (useful for single-page anchors too)
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      // small delay so link navigation can begin
      setTimeout(() => openMenu(false), 60);
    });
  });

  // update nav height on load/resize (for scroll offset)
  window.addEventListener('resize', setNavHeightVar);
  window.addEventListener('load', setNavHeightVar);
  setNavHeightVar();
})();
