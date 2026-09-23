/**
 * Admin Portal & Dynamic Configuration Manager
 * Handles:
 *  - Authentication & Secure Session
 *  - SHA-256 Password Hashing & Password Change
 *  - Dynamic Resume Link Management with DOM Sync & LocalStorage Persistence
 *  - Contact Email Service Configuration
 */

(function () {
  "use strict";

  // Storage Keys
  const STORAGE_AUTH_KEY = "portfolio_admin_credentials";
  const STORAGE_SESSION_KEY = "portfolio_admin_session";
  const STORAGE_RESUME_KEY = "portfolio_resume_url";
  const STORAGE_WEB3FORMS_KEY = "portfolio_web3forms_key";

  // Default credentials (will be initialized if empty)
  const DEFAULT_USERNAME = "admin";
  const DEFAULT_PASSWORD = "admin"; // Easy to remember, change immediately

  // Helper: SHA-256 hashing using native Web Crypto API
  async function sha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Initialize or get stored credentials
  async function getStoredCredentials() {
    let creds = localStorage.getItem(STORAGE_AUTH_KEY);
    if (!creds) {
      const defaultHash = await sha256(DEFAULT_PASSWORD);
      const initial = {
        username: DEFAULT_USERNAME,
        passwordHash: defaultHash,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(creds);
    } catch (e) {
      console.error("Failed to parse admin credentials:", e);
      return null;
    }
  }

  // Get active resume URL (from localStorage or config fallback)
  function getActiveResumeUrl() {
    const stored = localStorage.getItem(STORAGE_RESUME_KEY);
    if (stored && stored.trim()) {
      return stored.trim();
    }
    return (
      (window.PORTFOLIO_DATA &&
        window.PORTFOLIO_DATA.personal &&
        window.PORTFOLIO_DATA.personal.resumeUrl) ||
      "https://drive.google.com/file/d/1Cw5zAYogBXlEXsfJ7XzEkQovW-t6K0sp/view?usp=sharing"
    );
  }

  // Apply Resume URL to all interactive DOM elements
  function applyResumeUrl(url) {
    if (!url) return;
    const cleanUrl = url.trim();

    // 1. Update in-memory configuration
    if (window.PORTFOLIO_DATA && window.PORTFOLIO_DATA.personal) {
      window.PORTFOLIO_DATA.personal.resumeUrl = cleanUrl;
    }

    // 2. Update all DOM elements with data-resume-link
    const resumeLinks = document.querySelectorAll("[data-resume-link], a[href*='drive.google.com/file/d']");
    resumeLinks.forEach((link) => {
      link.setAttribute("href", cleanUrl);
    });

    // 3. Update current display in Admin Panel if open
    const currentDisplay = document.getElementById("admin-current-resume-display");
    if (currentDisplay) {
      currentDisplay.textContent = cleanUrl;
    }

    const codeSnippet = document.getElementById("admin-code-snippet");
    if (codeSnippet) {
      codeSnippet.textContent = `// In js/config.js (line 15):\nresumeUrl: "${cleanUrl}",`;
    }
  }
  window.applyResumeUrl = applyResumeUrl;

  // DOM Elements
  let backdrop,
    dialog,
    closeBtn,
    loginView,
    dashboardView,
    loginForm,
    loginStatus,
    changePwdForm,
    changePwdStatus,
    resumeForm,
    resumeStatus,
    emailForm,
    emailStatus,
    logoutBtn,
    resetResumeBtn,
    copyCodeBtn;

  function initElements() {
    backdrop = document.getElementById("admin-modal-backdrop");
    if (!backdrop) return false;

    dialog = backdrop.querySelector(".admin-modal-dialog");
    closeBtn = document.getElementById("admin-close-btn");
    loginView = document.getElementById("admin-login-view");
    dashboardView = document.getElementById("admin-dashboard-view");
    loginForm = document.getElementById("admin-login-form");
    loginStatus = document.getElementById("admin-login-status");
    changePwdForm = document.getElementById("admin-change-password-form");
    changePwdStatus = document.getElementById("admin-password-status");
    resumeForm = document.getElementById("admin-resume-form");
    resumeStatus = document.getElementById("admin-resume-status");
    emailForm = document.getElementById("admin-email-form");
    emailStatus = document.getElementById("admin-email-status");
    logoutBtn = document.getElementById("admin-logout-btn");
    resetResumeBtn = document.getElementById("admin-reset-resume-btn");
    copyCodeBtn = document.getElementById("admin-copy-code-btn");

    return true;
  }

  // Open / Close Modal
  function openAdminModal(initialTab = "resume") {
    if (!initElements()) return;

    backdrop.classList.add("active");
    backdrop.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Check session
    const isAuthenticated = sessionStorage.getItem(STORAGE_SESSION_KEY) === "true";
    if (isAuthenticated) {
      showDashboardView();
      switchTab(initialTab);
    } else {
      showLoginView();
    }
  }
  window.openAdminModal = openAdminModal;

  function closeAdminModal() {
    if (!backdrop) return;
    backdrop.classList.remove("active");
    backdrop.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    clearAlerts();
  }
  window.closeAdminModal = closeAdminModal;

  // View switchers
  function showLoginView() {
    loginView.style.display = "block";
    dashboardView.style.display = "none";
    document.getElementById("admin-login-user").focus();
  }

  function showDashboardView() {
    loginView.style.display = "none";
    dashboardView.style.display = "block";

    // Refresh current values
    const currentUrl = getActiveResumeUrl();
    const currentDisplay = document.getElementById("admin-current-resume-display");
    const resumeInput = document.getElementById("admin-resume-input");
    const codeSnippet = document.getElementById("admin-code-snippet");
    const emailKeyInput = document.getElementById("admin-email-key-input");

    if (currentDisplay) currentDisplay.textContent = currentUrl;
    if (resumeInput) resumeInput.value = currentUrl;
    if (codeSnippet) {
      codeSnippet.textContent = `// In js/config.js (line 15):\nresumeUrl: "${currentUrl}",`;
    }

    const savedKey = localStorage.getItem(STORAGE_WEB3FORMS_KEY) || "";
    if (emailKeyInput) emailKeyInput.value = savedKey;
  }

  function showAlert(elem, msg, type = "info") {
    if (!elem) return;
    elem.className = `admin-alert admin-alert-${type} show`;
    elem.textContent = msg;
  }

  function clearAlerts() {
    const alerts = document.querySelectorAll(".admin-alert");
    alerts.forEach((a) => {
      a.className = "admin-alert";
      a.textContent = "";
    });
  }

  // Tab switching
  function switchTab(tabId) {
    const tabBtns = document.querySelectorAll(".admin-tab-btn");
    const tabPanels = document.querySelectorAll(".admin-tab-panel");

    tabBtns.forEach((btn) => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    tabPanels.forEach((panel) => {
      if (panel.id === `admin-tab-${tabId}`) {
        panel.classList.add("active");
      } else {
        panel.classList.remove("active");
      }
    });

    clearAlerts();
  }

  // Setup Event Listeners
  function setupEvents() {
    if (!initElements()) return;

    // Trigger buttons
    document.querySelectorAll(".admin-trigger").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openAdminModal();
      });
    });

    // Close button & backdrop click
    if (closeBtn) {
      closeBtn.addEventListener("click", closeAdminModal);
    }
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeAdminModal();
    });

    // Tab buttons
    document.querySelectorAll(".admin-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        switchTab(btn.dataset.tab);
      });
    });

    // Toggle password fields visibility
    document.querySelectorAll(".admin-toggle-pwd-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        if (!input) return;
        if (input.type === "password") {
          input.type = "text";
          btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
        } else {
          input.type = "password";
          btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
        }
      });
    });

    // Login Form Submit
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const userInput = document.getElementById("admin-login-user").value.trim();
        const pwdInput = document.getElementById("admin-login-pwd").value;

        if (!userInput || !pwdInput) {
          showAlert(loginStatus, "Please provide both username and password.", "error");
          return;
        }

        const creds = await getStoredCredentials();
        const inputHash = await sha256(pwdInput);

        if (
          userInput.toLowerCase() === creds.username.toLowerCase() &&
          inputHash === creds.passwordHash
        ) {
          sessionStorage.setItem(STORAGE_SESSION_KEY, "true");
          showAlert(loginStatus, "Authentication successful! Entering admin portal...", "success");
          setTimeout(() => {
            clearAlerts();
            showDashboardView();
            switchTab("resume");
            if (window.showToast) window.showToast("Welcome to Admin Portal");
          }, 450);
        } else {
          showAlert(
            loginStatus,
            "Invalid username or password. Default username: 'admin', default password: 'admin'",
            "error"
          );
        }
      });
    }

    // Logout
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem(STORAGE_SESSION_KEY);
        showAlert(loginStatus, "You have been logged out successfully.", "info");
        showLoginView();
        if (window.showToast) window.showToast("Admin Logged Out");
      });
    }

    // Resume Link Form Submit
    if (resumeForm) {
      resumeForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const resumeInput = document.getElementById("admin-resume-input");
        const newUrl = resumeInput.value.trim();

        if (!newUrl) {
          showAlert(resumeStatus, "Please enter a valid URL.", "error");
          return;
        }

        if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {
          showAlert(resumeStatus, "URL must start with http:// or https://", "error");
          return;
        }

        // Save to LocalStorage
        localStorage.setItem(STORAGE_RESUME_KEY, newUrl);

        // Update DOM & in-memory data
        applyResumeUrl(newUrl);

        showAlert(
          resumeStatus,
          "Resume link successfully updated! All buttons across the portfolio now point to the new URL.",
          "success"
        );
        if (window.showToast) window.showToast("Resume Link Updated Live!");
      });
    }

    // Reset Resume to Default
    if (resetResumeBtn) {
      resetResumeBtn.addEventListener("click", () => {
        localStorage.removeItem(STORAGE_RESUME_KEY);
        const originalUrl =
          "https://drive.google.com/file/d/1Cw5zAYogBXlEXsfJ7XzEkQovW-t6K0sp/view?usp=sharing";
        applyResumeUrl(originalUrl);
        document.getElementById("admin-resume-input").value = originalUrl;
        showAlert(resumeStatus, "Resume link reset to original default.", "info");
        if (window.showToast) window.showToast("Resume Link Reset");
      });
    }

    // Copy Code Snippet for Git commit
    if (copyCodeBtn) {
      copyCodeBtn.addEventListener("click", () => {
        const currentUrl = getActiveResumeUrl();
        const snippet = `resumeUrl: "${currentUrl}",`;
        navigator.clipboard.writeText(snippet).then(
          () => {
            if (window.showToast) window.showToast("Copied to clipboard!");
            showAlert(
              resumeStatus,
              "Snippet copied to clipboard! Paste this into js/config.js if you want the link permanently baked into the source code.",
              "success"
            );
          },
          () => {
            showAlert(resumeStatus, "Failed to copy automatically. Please copy the snippet box manually.", "error");
          }
        );
      });
    }

    // Change Password Form Submit
    if (changePwdForm) {
      changePwdForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const currentPwd = document.getElementById("admin-pwd-current").value;
        const newPwd = document.getElementById("admin-pwd-new").value;
        const confirmPwd = document.getElementById("admin-pwd-confirm").value;

        if (!currentPwd || !newPwd || !confirmPwd) {
          showAlert(changePwdStatus, "Please complete all password fields.", "error");
          return;
        }

        if (newPwd.length < 5) {
          showAlert(changePwdStatus, "New password must be at least 5 characters long.", "error");
          return;
        }

        if (newPwd !== confirmPwd) {
          showAlert(changePwdStatus, "New password and Confirm password do not match.", "error");
          return;
        }

        const creds = await getStoredCredentials();
        const currentHash = await sha256(currentPwd);

        if (currentHash !== creds.passwordHash) {
          showAlert(changePwdStatus, "Incorrect current password.", "error");
          return;
        }

        // Hash and save new password
        const newHash = await sha256(newPwd);
        const updated = {
          username: creds.username,
          passwordHash: newHash,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(updated));

        // Reset form
        changePwdForm.reset();
        showAlert(
          changePwdStatus,
          "Password updated successfully! Your new password is now active.",
          "success"
        );
        if (window.showToast) window.showToast("Admin Password Changed");
      });
    }

    // Email Config Form Submit
    if (emailForm) {
      emailForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const keyInput = document.getElementById("admin-email-key-input");
        const key = keyInput.value.trim();

        if (key) {
          localStorage.setItem(STORAGE_WEB3FORMS_KEY, key);
          showAlert(
            emailStatus,
            "Web3Forms Access Key saved! All portfolio contact submissions will now deliver straight to your inbox.",
            "success"
          );
        } else {
          localStorage.removeItem(STORAGE_WEB3FORMS_KEY);
          showAlert(
            emailStatus,
            "Access key removed. Contact form will use default handler / fallback.",
            "info"
          );
        }
        if (window.showToast) window.showToast("Email Service Settings Saved");
      });
    }

    // Global Keyboard Shortcut: Ctrl + Shift + A to open Admin
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) || (e.altKey && (e.key === "a" || e.key === "A"))) {
        e.preventDefault();
        if (backdrop && backdrop.classList.contains("active")) {
          closeAdminModal();
        } else {
          openAdminModal();
        }
      } else if (e.key === "Escape" && backdrop && backdrop.classList.contains("active")) {
        closeAdminModal();
      }
    });
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setupEvents();
      // Apply active resume URL on initial load
      applyResumeUrl(getActiveResumeUrl());
    });
  } else {
    setupEvents();
    applyResumeUrl(getActiveResumeUrl());
  }
})();
