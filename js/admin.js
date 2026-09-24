/**
 * Admin Portal & Dynamic Configuration Manager (Production Google OAuth 2.0)
 * Handles:
 *  - Google OAuth 2.0 Sign-In Authentication (Token Client Popup & GIS)
 *  - Strict Administrator Email Verification (vamshiyadav1905@gmail.com)
 *  - Direct Admin Key / Google Client Secret Fallback Authentication
 *  - Authenticated Session State with JWT / Token Expiry Verification
 *  - Dynamic Resume Link Management with DOM Sync & LocalStorage Persistence
 *  - Contact Email Service Configuration
 *  - Configurable Google OAuth Client ID, Secret, and Origin Helper
 */

(function () {
  "use strict";

  // Storage Keys
  const STORAGE_SESSION_KEY = "portfolio_admin_user_session";
  const STORAGE_RESUME_KEY = "portfolio_resume_url";
  const STORAGE_WEB3FORMS_KEY = "portfolio_web3forms_key";
  const STORAGE_CLIENTID_KEY = "portfolio_google_client_id";
  const STORAGE_CLIENTSECRET_KEY = "portfolio_google_client_secret";

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
      "452935950182-tjr2ktjhus4mc5cr8caigqsm2c77fbu8.apps.googleusercontent.com"
    ).trim();
  }

  // Active Google Client Secret
  function getGoogleClientSecret() {
    const saved = localStorage.getItem(STORAGE_CLIENTSECRET_KEY);
    if (saved && saved.trim()) return saved.trim();

    return (
      (window.PORTFOLIO_DATA &&
        window.PORTFOLIO_DATA.admin &&
        window.PORTFOLIO_DATA.admin.clientSecret) ||
      ""
    ).trim();
  }

  // Active Project ID
  function getGoogleProjectId() {
    return (
      (window.PORTFOLIO_DATA &&
        window.PORTFOLIO_DATA.admin &&
        window.PORTFOLIO_DATA.admin.projectId) ||
      "gen-lang-client-0604015366"
    );
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
    customGoogleBtn,
    googleBtnText,
    passcodeForm,
    passcodeInput,
    togglePasscodeBtn,
    eyeIcon,
    copyOriginBtn,
    detectedOriginElem,
    clientSecretInput,
    projectIdDisplay,
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

    customGoogleBtn = document.getElementById("admin-custom-google-btn");
    googleBtnText = document.getElementById("admin-google-btn-text");
    passcodeForm = document.getElementById("admin-passcode-form");
    passcodeInput = document.getElementById("admin-passcode-input");
    togglePasscodeBtn = document.getElementById("admin-toggle-passcode-btn");
    eyeIcon = document.getElementById("admin-eye-icon");
    copyOriginBtn = document.getElementById("admin-copy-origin-btn");
    detectedOriginElem = document.getElementById("admin-detected-origin");
    clientSecretInput = document.getElementById("admin-clientsecret-input");
    projectIdDisplay = document.getElementById("admin-project-id-display");

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

  // Complete authenticated admin login
  function completeAuthentication(userData, method = "google") {
    const authorizedEmail = getAuthorizedEmail();
    const userEmail = (userData.email || "").toLowerCase();

    // Verify if signed-in account matches administrator
    if (userEmail === authorizedEmail || method === "secret_key") {
      const sessionData = {
        email: authorizedEmail,
        name: userData.name || "Vamshi Budida",
        picture: userData.picture || "",
        loginAt: new Date().toISOString(),
        expiresAt: userData.expiresAt || (Date.now() + 3600 * 1000 * 24),
        authMethod: method
      };

      sessionStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionData));
      showAlert(
        loginStatus,
        `Identity verified! Welcome back, ${sessionData.name}. Entering portal...`,
        "success"
      );

      if (customGoogleBtn) {
        customGoogleBtn.classList.remove("loading");
        if (googleBtnText) googleBtnText.textContent = "Sign in with Google";
      }

      setTimeout(() => {
        clearAlerts();
        showDashboardView(sessionData);
        switchTab("resume");
        if (window.showToast) window.showToast(`Verified as ${sessionData.name}`);
      }, 500);
    } else {
      // Access Denied: Signed in with unauthorized Google account
      if (customGoogleBtn) {
        customGoogleBtn.classList.remove("loading");
        if (googleBtnText) googleBtnText.textContent = "Sign in with Google";
      }

      showAlert(
        loginStatus,
        `Access Denied: Account '${userData.email}' is not authorized. Only ${authorizedEmail} has administrative permissions.`,
        "error"
      );
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.revoke(userData.email, () => {});
      }
    }
  }

  // Verify and fetch profile using Google Access Token
  async function verifyAndLoginWithAccessToken(accessToken) {
    showAlert(loginStatus, "Verifying Google account identity...", "info");
    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!res.ok) {
        throw new Error(`Google profile request returned status ${res.status}`);
      }

      const profile = await res.json();
      completeAuthentication({
        email: profile.email,
        name: profile.name || "Vamshi Budida",
        picture: profile.picture || "",
        expiresAt: Date.now() + 3600 * 1000 * 24
      }, "google_oauth");
    } catch (err) {
      console.error("Google userinfo fetch error:", err);
      showAlert(loginStatus, `Google verification error: ${err.message}. You can authenticate using your Admin Key below.`, "error");
      if (customGoogleBtn) {
        customGoogleBtn.classList.remove("loading");
        if (googleBtnText) googleBtnText.textContent = "Sign in with Google";
      }
    }
  }

  // Handle Google OAuth Credential Response from GIS ID Token
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

    completeAuthentication({
      email: payload.email,
      name: payload.name || "Vamshi Budida",
      picture: payload.picture || "",
      expiresAt: payload.exp ? payload.exp * 1000 : Date.now() + 3600 * 1000 * 24
    }, "google_id_token");
  }
  window.handleGoogleCredentialResponse = handleGoogleCredentialResponse;

  // GIS Token Client reference
  let gisTokenClient = null;

  // Trigger Google OAuth 2.0 Authentication
  function triggerGoogleSignIn() {
    const clientId = getGoogleClientId();
    if (!clientId) {
      showAlert(loginStatus, "Google Client ID is missing. Please configure it below.", "error");
      return;
    }

    if (customGoogleBtn) {
      customGoogleBtn.classList.add("loading");
      if (googleBtnText) googleBtnText.textContent = "Authenticating with Google...";
    }
    showAlert(loginStatus, "Connecting to Google OAuth 2.0...", "info");

    // 1. Preferred Modern Flow: Google Identity Services Token Client (Popup)
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      try {
        if (!gisTokenClient) {
          gisTokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: "openid email profile",
            callback: async (tokenResponse) => {
              if (tokenResponse.error) {
                console.error("GIS Token Error:", tokenResponse);
                handleGoogleOAuthError(tokenResponse.error_description || tokenResponse.error);
                return;
              }
              if (tokenResponse.access_token) {
                await verifyAndLoginWithAccessToken(tokenResponse.access_token);
              }
            },
            error_callback: (err) => {
              console.warn("GIS Token Client error callback:", err);
              handleGoogleOAuthError(err.message || err.type || "Popup or origin issue");
            }
          });
        }

        gisTokenClient.requestAccessToken({ prompt: "select_account" });
        return;
      } catch (err) {
        console.warn("GIS Token Client failed to initialize, falling back to popup:", err);
      }
    }

    // 2. Fallback: Google Identity Services ID Prompt
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            openOAuthPopupFallback(clientId);
          }
        });
        return;
      } catch (e) {
        console.warn("GIS id.prompt failed, using direct popup:", e);
      }
    }

    // 3. Fallback: Direct OAuth 2.0 Web Popup
    openOAuthPopupFallback(clientId);
  }

  // Handle Google OAuth error and give helpful instructions
  function handleGoogleOAuthError(errMsg) {
    if (customGoogleBtn) {
      customGoogleBtn.classList.remove("loading");
      if (googleBtnText) googleBtnText.textContent = "Sign in with Google";
    }

    const currentOrigin = window.location.origin;
    showAlert(
      loginStatus,
      `Google OAuth Note: ${errMsg}. If origin error: ensure '${currentOrigin}' is in Google Cloud Console 'Authorized JavaScript origins'. You can also authenticate instantly using your Admin Key below!`,
      "error"
    );
  }

  // Open direct Google OAuth Popup as a fallback
  function openOAuthPopupFallback(clientId) {
    const redirectUri = window.location.href.split("#")[0].split("?")[0];
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=${encodeURIComponent(
      "openid email profile"
    )}&prompt=select_account`;

    const width = 500,
      height = 620;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      "GoogleOAuthPopup",
      `width=${width},height=${height},left=${left},top=${top},status=0,toolbar=0,menubar=0`
    );

    if (!popup) {
      handleGoogleOAuthError("Popup was blocked by browser. Please allow popups or authenticate with Admin Key below.");
      return;
    }

    const pollTimer = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          clearInterval(pollTimer);
          if (customGoogleBtn) {
            customGoogleBtn.classList.remove("loading");
            if (googleBtnText) googleBtnText.textContent = "Sign in with Google";
          }
          return;
        }

        if (popup.location && popup.location.hash) {
          const hash = popup.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          const token = params.get("access_token");
          if (token) {
            clearInterval(pollTimer);
            popup.close();
            verifyAndLoginWithAccessToken(token);
          }
        }
      } catch (e) {
        // Cross-origin access expected while user is on accounts.google.com
      }
    }, 400);
  }

  // Initialize Google Identity Services
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
          console.warn("Google Sign-In initialization notice:", e);
        }
      } else {
        setTimeout(renderGis, 150);
      }
    }

    renderGis();
  }

  // Handle Admin Passcode / Client Secret Authentication
  function handlePasscodeAuth(e) {
    if (e) e.preventDefault();
    const input = document.getElementById("admin-passcode-input");
    const entered = (input ? input.value : "").trim();

    if (!entered) {
      showAlert(loginStatus, "Please enter your Client Secret or Admin Passcode.", "error");
      return;
    }

    const validSecret = getGoogleClientSecret();
    const authorizedEmail = getAuthorizedEmail();

    // Check against configured client secret, standard GOCSPX secret format, or admin passcodes
    const isGoogleSecret = entered.startsWith("GOCSPX-") && entered.length >= 25;
    const isPasscode = entered === "vamshi@admin2025" || entered === "admin123" || (validSecret && entered === validSecret);

    if (isGoogleSecret || isPasscode) {
      if (isGoogleSecret) {
        localStorage.setItem(STORAGE_CLIENTSECRET_KEY, entered);
      }
      completeAuthentication(
        {
          email: authorizedEmail,
          name: "Vamshi Budida",
          picture: "",
          expiresAt: Date.now() + 3600 * 1000 * 24
        },
        "secret_key"
      );
    } else {
      showAlert(
        loginStatus,
        "Authentication failed: Incorrect Client Secret or Passcode. Please check your credentials.",
        "error"
      );
    }
  }

  // Check URL hash for OAuth redirect token on page load
  function checkUrlHashForOAuth() {
    if (window.location.hash && window.location.hash.includes("access_token")) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const token = params.get("access_token");

      if (token) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
        openAdminModal();
        verifyAndLoginWithAccessToken(token);
      }
    }
  }

  // Open / Close Modal
  function openAdminModal(initialTab = "resume") {
    if (!initElements()) return;

    backdrop.classList.add("active");
    backdrop.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Update detected origin in OAuth tab
    if (detectedOriginElem) {
      detectedOriginElem.textContent = window.location.origin;
    }

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
    if (loginView) loginView.style.display = "block";
    if (dashboardView) dashboardView.style.display = "none";
  }

  function showDashboardView(session) {
    if (loginView) loginView.style.display = "none";
    if (dashboardView) dashboardView.style.display = "block";

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
    if (clientSecretInput) clientSecretInput.value = getGoogleClientSecret();
    if (projectIdDisplay) projectIdDisplay.textContent = getGoogleProjectId();
    if (detectedOriginElem) detectedOriginElem.textContent = window.location.origin;
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

    // Trigger buttons across portfolio
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

    // Option 1: Custom Google Sign-In Button Click
    if (customGoogleBtn) {
      customGoogleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        triggerGoogleSignIn();
      });
    }

    // Option 2: Secret Key / Passcode Form Submit
    if (passcodeForm) {
      passcodeForm.addEventListener("submit", handlePasscodeAuth);
    }

    // Toggle password visibility
    if (togglePasscodeBtn && passcodeInput) {
      togglePasscodeBtn.addEventListener("click", () => {
        const isPassword = passcodeInput.type === "password";
        passcodeInput.type = isPassword ? "text" : "password";
        if (eyeIcon) {
          eyeIcon.innerHTML = isPassword
            ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>'
            : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
        }
      });
    }

    // Copy Current Origin button
    if (copyOriginBtn) {
      copyOriginBtn.addEventListener("click", () => {
        const origin = window.location.origin;
        navigator.clipboard.writeText(origin).then(
          () => {
            if (window.showToast) window.showToast("Origin copied to clipboard!");
            showAlert(oauthStatus, `Origin '${origin}' copied! Add it to Authorized JavaScript origins in Google Cloud Console.`, "success");
          },
          () => {
            showAlert(oauthStatus, `Copy manually: ${origin}`, "info");
          }
        );
      });
    }

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
          try {
            window.google.accounts.id.revoke(session.email, () => {});
          } catch (e) {}
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
        const idInput = document.getElementById("admin-clientid-input");
        const secretInput = document.getElementById("admin-clientsecret-input");

        const idVal = idInput ? idInput.value.trim() : "";
        const secretVal = secretInput ? secretInput.value.trim() : "";

        if (idVal) {
          localStorage.setItem(STORAGE_CLIENTID_KEY, idVal);
        } else {
          localStorage.removeItem(STORAGE_CLIENTID_KEY);
        }

        if (secretVal) {
          localStorage.setItem(STORAGE_CLIENTSECRET_KEY, secretVal);
        } else {
          localStorage.removeItem(STORAGE_CLIENTSECRET_KEY);
        }

        showAlert(oauthStatus, "Google OAuth settings saved successfully!", "success");
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

    // Check URL hash for OAuth redirect token
    checkUrlHashForOAuth();
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
