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
