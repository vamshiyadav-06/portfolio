/**
 * Main Application Logic
 * Initializes Theme, Cursor, Dynamic Sections, Filtering, Form, and Navigation
 */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initCustomCursor();
  renderSkills();
  renderProjects("all");
  renderExperience();
  renderEducation();
  initProjectFiltering();
  initContactForm();
  initNavigation();
  initMobileMenu();

  // Apply saved dynamic resume URL if customized via Admin Portal
  const savedResumeUrl = localStorage.getItem("portfolio_resume_url");
  if (savedResumeUrl && window.applyResumeUrl) {
    window.applyResumeUrl(savedResumeUrl);
  }

  // Initialize modular components
  if (window.initHeroScene) {
    window.initHeroScene("hero-3d-canvas");
  }
  if (window.initCommandPalette) {
    window.initCommandPalette();
  }
  if (window.initCaseStudyModal) {
    window.initCaseStudyModal();
  }
  if (window.initGitHubIntegration) {
    window.initGitHubIntegration();
  }
});

/* ---------------- Theme Management ---------------- */
function initTheme() {
  const savedTheme = localStorage.getItem("vamshi_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  const themeToggleBtns = document.querySelectorAll(".theme-toggle-btn");
  themeToggleBtns.forEach(btn => {
    btn.addEventListener("click", toggleTheme);
    btn.setAttribute("aria-label", `Switch to ${savedTheme === "dark" ? "light" : "dark"} mode`);
  });
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("vamshi_theme", newTheme);

  const themeToggleBtns = document.querySelectorAll(".theme-toggle-btn");
  themeToggleBtns.forEach(btn => {
    btn.setAttribute("aria-label", `Switch to ${newTheme === "dark" ? "light" : "dark"} mode`);
  });

  showToast(`Switched to ${newTheme === "dark" ? "Dark" : "Light"} Mode`);
}
window.toggleTheme = toggleTheme;

/* ---------------- Custom Glowing Cursor ---------------- */
function initCustomCursor() {
  // Disable on touch devices
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const cursorDot = document.getElementById("cursor-dot");
  const cursorFollower = document.getElementById("cursor-follower");
  if (!cursorDot || !cursorFollower) return;

  let mouseX = -100;
  let mouseY = -100;
  let followerX = -100;
  let followerY = -100;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  });

  function animateFollower() {
    followerX += (mouseX - followerX) * 0.16;
    followerY += (mouseY - followerY) * 0.16;
    cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
    requestAnimationFrame(animateFollower);
  }
  requestAnimationFrame(animateFollower);

  // Add hover scale on interactive items
  const interactiveSelectors = "a, button, input, textarea, .glass-panel, .tech-tag, .command-item, .arch-node";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(interactiveSelectors)) {
      cursorFollower.classList.add("cursor-hover");
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(interactiveSelectors)) {
      cursorFollower.classList.remove("cursor-hover");
    }
  });
}

/* ---------------- Skills Section Rendering ---------------- */
function renderSkills() {
  const container = document.getElementById("skills-categories-grid");
  if (!container) return;

  const categories = [
    { key: "programming", title: "Programming", icon: "code" },
    { key: "generativeAi", title: "Generative AI & Agents", icon: "sparkles" },
    { key: "aiMl", title: "AI & Machine Learning", icon: "brain" },
    { key: "backend", title: "Backend Architecture", icon: "server" },
    { key: "databases", title: "Databases & Vector Stores", icon: "database" },
    { key: "frontend", title: "Frontend & UI", icon: "layout" },
    { key: "toolsDeployment", title: "Tools & Deployment", icon: "package" }
  ];

  container.innerHTML = categories.map(cat => {
    const skillList = PORTFOLIO_DATA.skills[cat.key] || [];
    const skillsHtml = skillList.map(skill => `
      <div class="skill-pill">
        <span class="skill-name">${skill.name}</span>
        <span class="skill-level">${skill.level}</span>
      </div>
    `).join("");

    return `
      <div class="skill-category-card glass-panel" data-category="${cat.key}">
        <div class="skill-category-header">
          <div class="skill-cat-icon-box">
            ${getCategoryIcon(cat.icon)}
          </div>
          <h3 class="skill-category-title">${cat.title}</h3>
        </div>
        <div class="skills-pill-wrap">
          ${skillsHtml}
        </div>
      </div>
    `;
  }).join("");
}

function getCategoryIcon(icon) {
  switch (icon) {
    case "code":
      return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`;
    case "sparkles":
      return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>`;
    case "brain":
      return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 2a4 4 0 0 0-4 4v1a4 4 0 0 0-4 4 4 4 0 0 0 2 3.5A4 4 0 0 0 8 18h1a4 4 0 0 0 4 4 4 4 0 0 0 4-4h1a4 4 0 0 0 2-3.5 4 4 0 0 0 2-3.5 4 4 0 0 0-4-4V6a4 4 0 0 0-4-4z"></path></svg>`;
    case "server":
      return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>`;
    case "database":
      return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`;
    case "layout":
      return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`;
    case "package":
      return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`;
    default:
      return `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle></svg>`;
  }
}

/* ---------------- Projects Rendering & Filtering ---------------- */
function renderProjects(filter = "all") {
  const container = document.getElementById("projects-grid");
  if (!container) return;

  const filtered = filter === "all"
    ? PORTFOLIO_DATA.projects
    : PORTFOLIO_DATA.projects.filter(p => p.category === filter);

  container.innerHTML = filtered.map(proj => {
    const techTags = proj.techStack.map(t => `<span class="tech-tag">${t}</span>`).join("");
    const githubLink = proj.githubUrl ? `
      <a href="${proj.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn-icon" aria-label="View source code on GitHub" title="GitHub Repository">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
      </a>
    ` : "";

    return `
      <div class="project-card glass-panel" data-project-id="${proj.id}">
        <div class="project-card-banner">
          <div class="project-card-category">${proj.categoryLabel}</div>
          <div class="project-card-status">Production Verified</div>
        </div>

        <div class="project-card-content">
          <h3 class="project-title">${proj.title}</h3>
          <p class="project-summary">${proj.summary}</p>

          <div class="project-tech-tags">
            ${techTags}
          </div>

          <div class="project-card-footer">
            <button class="btn btn-secondary btn-sm btn-case-study" onclick="window.openCaseStudy('${proj.id}')">
              <span>View Case Study</span>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
            <div class="project-card-actions">
              ${githubLink}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function initProjectFiltering() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");
      renderProjects(filter);
    });
  });
}

/* ---------------- Experience Timeline Rendering ---------------- */
function renderExperience() {
  const container = document.getElementById("experience-timeline");
  if (!container) return;

  container.innerHTML = PORTFOLIO_DATA.experience.map(exp => {
    const respItems = exp.responsibilities.map(r => `
      <li class="timeline-resp-item">
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="#00f2fe" stroke-width="2.5" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>${r}</span>
      </li>
    `).join("");

    const techPills = exp.technologies.map(t => `<span class="tech-tag">${t}</span>`).join("");

    return `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-card glass-panel">
          <div class="timeline-card-header">
            <div>
              <span class="timeline-period-badge">${exp.startDate} — ${exp.endDate}</span>
              <h3 class="timeline-role">${exp.role}</h3>
              <div class="timeline-company">${exp.company} · <span class="timeline-location">${exp.location}</span></div>
            </div>
            <span class="timeline-type-pill">${exp.type}</span>
          </div>

          <p class="timeline-desc">${exp.description}</p>

          <ul class="timeline-resp-list">
            ${respItems}
          </ul>

          <div class="timeline-tech-row">
            ${techPills}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

/* ---------------- Education Section Rendering ---------------- */
function renderEducation() {
  const container = document.getElementById("education-card-wrap");
  if (!container) return;

  container.innerHTML = PORTFOLIO_DATA.education.map(edu => {
    const courseworkPills = edu.coursework.map(c => `<span class="tech-tag">${c}</span>`).join("");

    return `
      <div class="education-card glass-panel">
        <div class="education-header">
          <div class="edu-icon-badge">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
          </div>
          <div class="edu-details">
            <div class="edu-period-badge">${edu.period}</div>
            <h3 class="edu-degree">${edu.degree}</h3>
            <div class="edu-institution">${edu.institution}</div>
            <div class="edu-meta">
              <span class="edu-cgpa">CGPA: <strong>${edu.cgpa}</strong></span>
              <span class="edu-location">${edu.location}</span>
            </div>
          </div>
        </div>

        <div class="edu-coursework-section">
          <span class="edu-coursework-label">Core Coursework & Foundations:</span>
          <div class="edu-coursework-pills">
            ${courseworkPills}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

/* ---------------- Contact Form Handling ---------------- */
function initContactForm() {
  const form = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");
  const submitBtn = document.getElementById("contact-submit-btn");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("contact-name");
    const emailInput = document.getElementById("contact-email");
    const messageInput = document.getElementById("contact-message");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    // Client-side validation
    if (!name || !email || !message) {
      showFormStatus("Please fill in all required fields.", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showFormStatus("Please enter a valid email address.", "error");
      return;
    }

    // Enter loading state
    submitBtn.disabled = true;
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <span class="spinner"></span>
      <span>Sending Message...</span>
    `;
    showFormStatus("Dispatching message directly to Vamshi's inbox...", "loading");

    // Check for configured Web3Forms access key
    const web3formsKey = localStorage.getItem("portfolio_web3forms_key");

    if (web3formsKey && web3formsKey.trim()) {
      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            access_key: web3formsKey.trim(),
            name: name,
            email: email,
            message: message,
            from_name: "Portfolio Contact Form",
            subject: `New Portfolio Message from ${name}`
          })
        });

        const result = await response.json();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        if (response.status === 200 && result.success) {
          showFormStatus("Message sent successfully! Vamshi has received your details and will reply shortly.", "success");
          form.reset();
          if (window.showToast) window.showToast("Message Sent Directly to Vamshi!");
          return;
        } else {
          showFormStatus(`Delivery note: ${result.message || "Could not dispatch via API"}. Launching direct mail option...`, "info");
        }
      } catch (err) {
        console.warn("Direct API send error:", err);
      }
    }

    // Direct mailto fallback or default behavior
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;

      showFormStatus("Your message has been prepared for Vamshi (vamshiyadav1905@gmail.com). Opening mail client...", "success");
      form.reset();

      const mailtoLink = `mailto:${PORTFOLIO_DATA.personal.email}?subject=${encodeURIComponent("Portfolio Contact from " + name)}&body=${encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\nMessage:\n" + message)}`;
      window.location.href = mailtoLink;
    }, 600);
  });

  function showFormStatus(msg, type) {
    if (!formStatus) return;
    formStatus.className = `form-status status-${type}`;
    formStatus.textContent = msg;
    formStatus.style.display = "block";
  }
}

/* ---------------- Navigation & Active Indicators ---------------- */
function initNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");

  window.addEventListener("scroll", () => {
    let current = "";
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });
}

/* ---------------- Mobile Menu Drawer ---------------- */
function initMobileMenu() {
  const menuToggle = document.getElementById("mobile-menu-toggle");
  const mobileNav = document.getElementById("mobile-nav-drawer");
  const closeBtn = document.getElementById("mobile-menu-close");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");

  if (!menuToggle || !mobileNav) return;

  function openMobile() {
    mobileNav.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeMobile() {
    mobileNav.classList.remove("active");
    document.body.style.overflow = "";
  }

  menuToggle.addEventListener("click", openMobile);
  if (closeBtn) closeBtn.addEventListener("click", closeMobile);

  mobileLinks.forEach(link => {
    link.addEventListener("click", closeMobile);
  });
}

/* ---------------- Toast Notification Helper ---------------- */
function showToast(message) {
  let toast = document.getElementById("app-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "app-toast";
    toast.className = "app-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}
window.showToast = showToast;
