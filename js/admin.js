/**
 * Admin Portal & Dynamic Configuration Manager (Production Google OAuth 2.0)
 * Handles:
 *  - Google Identity Services (GIS) Sign-In Authentication
 *  - Strict Administrator Email Verification (vamshiyadav1905@gmail.com)
 *  - Authenticated Session State with JWT Expiry Verification
 *  - Dynamic Resume Link Management with DOM Sync & LocalStorage Persistence
 *  - Contact Email Service Configuration
 *  - Configurable Google OAuth Client ID
 */

(function () {
  "use strict";

  // Storage Keys
  const STORAGE_SESSION_KEY = "portfolio_admin_user_session";
  const STORAGE_RESUME_KEY = "portfolio_resume_url";
  const STORAGE_WEB3FORMS_KEY = "portfolio_web3forms_key";
  const STORAGE_CLIENTID_KEY = "portfolio_google_client_id";

  // Authorized Admin Email
  function getAuthorizedEmail() {
    return (
      (window.PORTFOLIO_DATA &&
        window.PORTFOLIO_DATA.admin &&
        window.PORTFOLIO_DATA.admin.authorizedEmail) ||
      "vamshiyadav1905@gmail.com"
    ).toLowerCase();
  }

  // Active Google Client ID (from config or localStorage)
  function getGoogleClientId() {
    const saved = localStorage.getItem(STORAGE_CLIENTID_KEY);
    if (saved && saved.trim()) return saved.trim();

    return (
      (window.PORTFOLIO_DATA &&
        window.PORTFOLIO_DATA.admin &&
        window.PORTFOLIO_DATA.admin.googleClientId) ||
      ""
    ).trim();
  }

  // Parse JWT token from Google Identity Services
  function parseJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("Failed to parse Google JWT credential:", err);
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

    // 2. Update all DOM elements with data-resume-link or drive link
    const resumeLinks = document.querySelectorAll(
      "[data-resume-link], a[href*='drive.google.com/file/d']"
    );
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
    closeBtn,
    loginView,
    dashboardView,
    loginStatus,
    resumeForm,
    resumeStatus,
    emailForm,
    emailStatus,
    oauthForm,
    oauthStatus,
    logoutBtn,
    resetResumeBtn,
    copyCodeBtn;

  function initElements() {
    backdrop = document.getElementById("admin-modal-backdrop");
    if (!backdrop) return false;

    closeBtn = document.getElementById("admin-close-btn");
    loginView = document.getElementById("admin-login-view");
    dashboardView = document.getElementById("admin-dashboard-view");
    loginStatus = document.getElementById("admin-login-status");
    resumeForm = document.getElementById("admin-resume-form");
    resumeStatus = document.getElementById("admin-resume-status");
    emailForm = document.getElementById("admin-email-form");
    emailStatus = document.getElementById("admin-email-status");
    oauthForm = document.getElementById("admin-oauth-form");
    oauthStatus = document.getElementById("admin-oauth-status");
    logoutBtn = document.getElementById("admin-logout-btn");
    resetResumeBtn = document.getElementById("admin-reset-resume-btn");
    copyCodeBtn = document.getElementById("admin-copy-code-btn");

    return true;
  }

  // Check if session is valid and active
  function getActiveSession() {
    try {
      const data = sessionStorage.getItem(STORAGE_SESSION_KEY);
      if (!data) return null;
      const session = JSON.parse(data);
      if (session.expiresAt && Date.now() > session.expiresAt) {
        sessionStorage.removeItem(STORAGE_SESSION_KEY);
        return null;
      }
      return session;
    } catch (e) {
      sessionStorage.removeItem(STORAGE_SESSION_KEY);
      return null;
    }
  }

  // Handle Google OAuth Credential Response
  function handleGoogleCredentialResponse(response) {
    if (!response || !response.credential) {
      showAlert(loginStatus, "Google authentication did not return credentials. Please try again.", "error");
      return;
    }

    const payload = parseJwt(response.credential);
    if (!payload || !payload.email) {
      showAlert(loginStatus, "Could not verify identity token from Google. Please try again.", "error");
      return;
    }

    const authorizedEmail = getAuthorizedEmail();
    const userEmail = payload.email.toLowerCase();

    // Verify if signed-in Google account matches administrator
    if (userEmail === authorizedEmail && payload.email_verified) {
      const sessionData = {
        email: payload.email,
        name: payload.name || "Vamshi Budida",
        picture: payload.picture || "",
        loginAt: new Date().toISOString(),
        expiresAt: payload.exp ? payload.exp * 1000 : Date.now() + 3600 * 1000 * 24
      };

      sessionStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionData));
      showAlert(loginStatus, `Identity verified! Welcome, ${payload.name || "Administrator"}. Entering portal...`, "success");

      setTimeout(() => {
        clearAlerts();
        showDashboardView(sessionData);
        switchTab("resume");
        if (window.showToast) window.showToast(`Verified as ${payload.name || "Admin"}`);
      }, 500);
    } else {
      // Access Denied: Signed in with unauthorized Google account
      showAlert(
        loginStatus,
        `Access Denied: Account '${payload.email}' is not authorized. Only ${authorizedEmail} has administrative permissions.`,
        "error"
      );
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.revoke(payload.email, () => {});
      }
    }
  }
  window.handleGoogleCredentialResponse = handleGoogleCredentialResponse;

  // Initialize Google Identity Services Button
  function initGoogleSignIn() {
    const clientId = getGoogleClientId();
    const btnContainer = document.getElementById("google-signin-btn");
    const noClientIdNotice = document.getElementById("google-clientid-prompt");

    if (!clientId) {
      if (btnContainer) btnContainer.innerHTML = "";
      if (noClientIdNotice) noClientIdNotice.style.display = "block";
      return;
    }

    if (noClientIdNotice) noClientIdNotice.style.display = "none";

    // Wait for GIS library if loading
    function renderGis() {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          if (btnContainer) {
            btnContainer.innerHTML = "";
            window.google.accounts.id.renderButton(btnContainer, {
              theme: "filled_blue",
              size: "large",
              type: "standard",
              shape: "rectangular",
              text: "signin_with",
              logo_alignment: "left",
              width: 280
            });
          }
        } catch (e) {
          console.error("Google Sign-In initialization error:", e);
          showAlert(loginStatus, `Google Sign-In initialization error: ${e.message}`, "error");
        }
      } else {
        setTimeout(renderGis, 150);
      }
    }

    renderGis();
  }

  // Open / Close Modal
  function openAdminModal(initialTab = "resume") {
    if (!initElements()) return;

    backdrop.classList.add("active");
    backdrop.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    const session = getActiveSession();
    if (session) {
      showDashboardView(session);
      switchTab(initialTab);
    } else {
      showLoginView();
      initGoogleSignIn();
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
  }

  function showDashboardView(session) {
    loginView.style.display = "none";
    dashboardView.style.display = "block";

    // Update user profile info
    const sessionData = session || getActiveSession() || {
      name: "Vamshi Budida",
      email: getAuthorizedEmail(),
      picture: ""
    };

    const nameElem = document.getElementById("admin-user-name");
    const emailElem = document.getElementById("admin-user-email");
    const avatarElem = document.getElementById("admin-user-avatar");

    if (nameElem) nameElem.textContent = sessionData.name || "Vamshi Budida";
    if (emailElem) emailElem.textContent = sessionData.email || getAuthorizedEmail();

    if (avatarElem) {
      if (sessionData.picture) {
        avatarElem.innerHTML = `<img src="${sessionData.picture}" alt="${sessionData.name}" class="admin-avatar-img">`;
      } else {
        const initial = (sessionData.name || "V").charAt(0).toUpperCase();
        avatarElem.innerHTML = `<div class="admin-avatar-fallback">${initial}</div>`;
      }
    }

    // Refresh current values
    const currentUrl = getActiveResumeUrl();
    const currentDisplay = document.getElementById("admin-current-resume-display");
    const resumeInput = document.getElementById("admin-resume-input");
    const codeSnippet = document.getElementById("admin-code-snippet");
    const emailKeyInput = document.getElementById("admin-email-key-input");
    const oauthInput = document.getElementById("admin-clientid-input");

    if (currentDisplay) currentDisplay.textContent = currentUrl;
    if (resumeInput) resumeInput.value = currentUrl;
    if (codeSnippet) {
      codeSnippet.textContent = `// In js/config.js (line 15):\nresumeUrl: "${currentUrl}",`;
    }

    const savedEmailKey = localStorage.getItem(STORAGE_WEB3FORMS_KEY) || "";
    if (emailKeyInput) emailKeyInput.value = savedEmailKey;

    if (oauthInput) oauthInput.value = getGoogleClientId();
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
    if (closeBtn) closeBtn.addEventListener("click", closeAdminModal);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeAdminModal();
    });

    // Tab buttons
    document.querySelectorAll(".admin-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        switchTab(btn.dataset.tab);
      });
    });

    // Save Client ID from the setup prompt on login view
    const promptSaveBtn = document.getElementById("admin-save-clientid-prompt-btn");
    if (promptSaveBtn) {
      promptSaveBtn.addEventListener("click", () => {
        const input = document.getElementById("admin-login-clientid-input");
        const val = input ? input.value.trim() : "";
        if (!val) {
          showAlert(loginStatus, "Please enter a valid Google OAuth Client ID.", "error");
          return;
        }
        localStorage.setItem(STORAGE_CLIENTID_KEY, val);
        showAlert(loginStatus, "Google Client ID saved! Initializing Google Sign-In...", "success");
        setTimeout(() => {
          initGoogleSignIn();
        }, 300);
      });
    }

    // Logout
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        const session = getActiveSession();
        if (session && session.email && window.google && window.google.accounts && window.google.accounts.id) {
          window.google.accounts.id.revoke(session.email, () => {});
        }
        sessionStorage.removeItem(STORAGE_SESSION_KEY);
        showAlert(loginStatus, "You have been securely signed out.", "info");
        showLoginView();
        initGoogleSignIn();
        if (window.showToast) window.showToast("Signed Out");
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
              "Snippet copied to clipboard! Paste this into js/config.js to bake it into Git permanently.",
              "success"
            );
          },
          () => {
            showAlert(resumeStatus, "Failed to copy automatically. Please copy the snippet box manually.", "error");
          }
        );
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
            "Web3Forms Access Key saved! Contact inquiries will deliver straight to vamshiyadav1905@gmail.com.",
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

    // Google OAuth Settings Form Submit
    if (oauthForm) {
      oauthForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("admin-clientid-input");
        const val = input.value.trim();

        if (val) {
          localStorage.setItem(STORAGE_CLIENTID_KEY, val);
          showAlert(oauthStatus, "Google OAuth Client ID saved! Google Sign-In is configured.", "success");
        } else {
          localStorage.removeItem(STORAGE_CLIENTID_KEY);
          showAlert(oauthStatus, "Google Client ID removed.", "info");
        }
        if (window.showToast) window.showToast("Google OAuth Settings Saved");
      });
    }

    // Global Keyboard Shortcut: Ctrl + Shift + A to open Admin
    document.addEventListener("keydown", (e) => {
      if (
        (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) ||
        (e.altKey && (e.key === "a" || e.key === "A"))
      ) {
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
      applyResumeUrl(getActiveResumeUrl());
    });
  } else {
    setupEvents();
    applyResumeUrl(getActiveResumeUrl());
  }
})();
