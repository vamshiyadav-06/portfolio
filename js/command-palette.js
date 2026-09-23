/**
 * Command Palette Navigation (Ctrl+K / Cmd+K)
 * Fast, keyboard-accessible navigation and quick actions
 */

class CommandPalette {
  constructor() {
    this.modal = document.getElementById("command-palette-modal");
    this.input = document.getElementById("command-input");
    this.list = document.getElementById("command-list");
    this.triggerBtn = document.getElementById("palette-trigger-btn");
    this.isOpen = false;
    this.selectedIndex = 0;
    this.filteredCommands = [];

    this.commands = [
      {
        id: "nav-hero",
        title: "Home",
        subtitle: "Jump to hero introduction",
        icon: "home",
        action: () => this.navigateTo("#hero")
      },
      {
        id: "nav-about",
        title: "About Vamshi",
        subtitle: "Background, AI focus, and technical philosophy",
        icon: "user",
        action: () => this.navigateTo("#about")
      },
      {
        id: "nav-skills",
        title: "Skills & Tech Matrix",
        subtitle: "Python, AI/ML, Generative AI, RAG, Backend, DBs",
        icon: "cpu",
        action: () => this.navigateTo("#skills")
      },
      {
        id: "nav-projects",
        title: "Featured Projects",
        subtitle: "View AI & Full-Stack engineering work",
        icon: "folder",
        action: () => this.navigateTo("#projects")
      },
      {
        id: "nav-experience",
        title: "Work Experience",
        subtitle: "AI Engineer Intern at Clyptus Software Solutions",
        icon: "briefcase",
        action: () => this.navigateTo("#experience")
      },
      {
        id: "nav-education",
        title: "Education",
        subtitle: "B.Tech CSE at Mahaveer Institute of Science & Tech",
        icon: "award",
        action: () => this.navigateTo("#education")
      },
      {
        id: "nav-github-section",
        title: "GitHub Repositories",
        subtitle: "Inspect open-source codebases & stats",
        icon: "github",
        action: () => this.navigateTo("#github")
      },
      {
        id: "nav-contact",
        title: "Contact Me",
        subtitle: "Send a message or get direct contact details",
        icon: "mail",
        action: () => this.navigateTo("#contact")
      },
      {
        id: "act-theme",
        title: "Toggle Theme",
        subtitle: "Switch between Dark and Light mode",
        icon: "sun",
        action: () => {
          if (window.toggleTheme) window.toggleTheme();
        }
      },
      {
        id: "act-admin",
        title: "Admin Portal",
        subtitle: "Login, update resume link, change password (Ctrl+Shift+A)",
        icon: "lock",
        action: () => {
          if (window.openAdminModal) window.openAdminModal();
        }
      },
      {
        id: "act-resume",
        title: "Download Resume",
        subtitle: "Open official Google Drive resume PDF",
        icon: "file-text",
        action: () => {
          const url = (window.PORTFOLIO_DATA && window.PORTFOLIO_DATA.personal && window.PORTFOLIO_DATA.personal.resumeUrl) || "https://drive.google.com/file/d/1Cw5zAYogBXlEXsfJ7XzEkQovW-t6K0sp/view?usp=sharing";
          window.open(url, "_blank", "noopener,noreferrer");
        }
      },
      {
        id: "act-github-ext",
        title: "Open GitHub Profile",
        subtitle: "github.com/vamshiyadav-06",
        icon: "external-link",
        action: () => {
          window.open(PORTFOLIO_DATA.personal.github, "_blank", "noopener,noreferrer");
        }
      },
      {
        id: "act-linkedin-ext",
        title: "Open LinkedIn Profile",
        subtitle: "linkedin.com/in/vamshi-budida-087151425",
        icon: "external-link",
        action: () => {
          window.open(PORTFOLIO_DATA.personal.linkedin, "_blank", "noopener,noreferrer");
        }
      },
      {
        id: "act-copy-email",
        title: "Copy Email Address",
        subtitle: PORTFOLIO_DATA.personal.email,
        icon: "copy",
        action: () => {
          navigator.clipboard.writeText(PORTFOLIO_DATA.personal.email);
          if (window.showToast) window.showToast("Email address copied to clipboard!");
        }
      }
    ];

    // Add direct project case study jumps
    PORTFOLIO_DATA.projects.forEach(p => {
      this.commands.push({
        id: `proj-${p.id}`,
        title: `Case Study: ${p.title}`,
        subtitle: `${p.categoryLabel} · Architecture & Deep Dive`,
        icon: "layers",
        action: () => {
          if (window.openCaseStudy) window.openCaseStudy(p.id);
        }
      });
    });

    this.filteredCommands = [...this.commands];
    this.init();
  }

  init() {
    if (!this.modal || !this.input || !this.list) return;

    // Trigger button
    if (this.triggerBtn) {
      this.triggerBtn.addEventListener("click", () => this.open());
    }

    // Keyboard shortcuts
    window.addEventListener("keydown", (e) => {
      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        this.toggle();
      }

      if (!this.isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        this.close();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        this.navigateList(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.navigateList(-1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        this.executeSelected();
      }
    });

    // Close on overlay click
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Input filtering
    this.input.addEventListener("input", () => {
      this.filter(this.input.value.trim().toLowerCase());
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.modal.classList.add("active");
    this.modal.setAttribute("aria-hidden", "false");
    this.input.value = "";
    this.filter("");
    setTimeout(() => this.input.focus(), 50);
    document.body.style.overflow = "hidden";
  }

  close() {
    this.isOpen = false;
    this.modal.classList.remove("active");
    this.modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  filter(query) {
    if (!query) {
      this.filteredCommands = [...this.commands];
    } else {
      this.filteredCommands = this.commands.filter(cmd => {
        return (
          cmd.title.toLowerCase().includes(query) ||
          cmd.subtitle.toLowerCase().includes(query)
        );
      });
    }
    this.selectedIndex = 0;
    this.render();
  }

  navigateList(direction) {
    if (this.filteredCommands.length === 0) return;
    this.selectedIndex = (this.selectedIndex + direction + this.filteredCommands.length) % this.filteredCommands.length;
    this.updateActiveItem();
  }

  updateActiveItem() {
    const items = this.list.querySelectorAll(".command-item");
    items.forEach((item, idx) => {
      if (idx === this.selectedIndex) {
        item.classList.add("selected");
        item.scrollIntoView({ block: "nearest" });
      } else {
        item.classList.remove("selected");
      }
    });
  }

  executeSelected() {
    if (this.filteredCommands.length > 0 && this.filteredCommands[this.selectedIndex]) {
      const selected = this.filteredCommands[this.selectedIndex];
      this.close();
      selected.action();
    }
  }

  navigateTo(hash) {
    const target = document.querySelector(hash);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  render() {
    if (this.filteredCommands.length === 0) {
      this.list.innerHTML = `
        <div class="command-empty">
          <p>No matching commands found for "${escapeHtml(this.input.value)}"</p>
        </div>
      `;
      return;
    }

    this.list.innerHTML = this.filteredCommands.map((cmd, idx) => {
      const isSelected = idx === this.selectedIndex ? "selected" : "";
      return `
        <li class="command-item ${isSelected}" data-index="${idx}" role="button" tabindex="0">
          <div class="command-item-left">
            <span class="command-icon-badge">${this.getIconSvg(cmd.icon)}</span>
            <div class="command-text">
              <span class="command-title">${escapeHtml(cmd.title)}</span>
              <span class="command-subtitle">${escapeHtml(cmd.subtitle)}</span>
            </div>
          </div>
          <span class="command-badge">Jump</span>
        </li>
      `;
    }).join("");

    // Add click listeners to items
    this.list.querySelectorAll(".command-item").forEach(item => {
      item.addEventListener("click", () => {
        const idx = parseInt(item.getAttribute("data-index"), 10);
        this.selectedIndex = idx;
        this.executeSelected();
      });
      item.addEventListener("mouseenter", () => {
        const idx = parseInt(item.getAttribute("data-index"), 10);
        this.selectedIndex = idx;
        this.updateActiveItem();
      });
    });
  }

  getIconSvg(iconName) {
    switch (iconName) {
      case "home":
        return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
      case "user":
        return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
      case "cpu":
        return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>`;
      case "folder":
        return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;
      case "briefcase":
        return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`;
      case "award":
        return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`;
      case "mail":
        return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;
      case "sun":
        return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line></svg>`;
      case "file-text":
        return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`;
      case "external-link":
        return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;
      case "copy":
        return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
      case "layers":
        return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`;
      case "lock":
        return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
      default:
        return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle></svg>`;
    }
  }
}

window.initCommandPalette = function() {
  window.commandPaletteInstance = new CommandPalette();
};
