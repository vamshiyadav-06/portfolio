/**
 * GitHub Integration for Vamshi Budida (vamshiyadav-06)
 * Safely fetches public repository data without credentials,
 * with caching and graceful offline fallback.
 */

const GITHUB_USERNAME = "vamshiyadav-06";
const GITHUB_CACHE_KEY = "vamshi_gh_repos_cache_v1";
const GITHUB_CACHE_TIME_KEY = "vamshi_gh_repos_time_v1";
const CACHE_DURATION_MS = 1000 * 60 * 30; // 30 minutes cache

// Verified fallback repository dataset from actual GitHub account
const VERIFIED_FALLBACK_REPOS = [
  {
    name: "AI-Recruitment-Portal",
    description: "AI-powered talent recruitment platform with candidate resume ingestion, scoring, and automated shortlisting.",
    language: "TypeScript",
    stargazers_count: 0,
    forks_count: 0,
    html_url: "https://github.com/vamshiyadav-06/AI-Recruitment-Portal",
    updated_at: "2026-09-15T00:00:00Z"
  },
  {
    name: "AI_Auto_Job_Apply_Agent",
    description: "Autonomous job application agent using Playwright, pdfplumber resume parsing, and semantic matching.",
    language: "Python",
    stargazers_count: 0,
    forks_count: 0,
    html_url: "https://github.com/vamshiyadav-06/AI_Auto_Job_Apply_Agent",
    updated_at: "2026-09-12T00:00:00Z"
  },
  {
    name: "AI_Research_Assistant",
    description: "Multi-agent research engine with Tavily web search, FAISS PDF indexing, and docx generation.",
    language: "Python",
    stargazers_count: 0,
    forks_count: 0,
    html_url: "https://github.com/vamshiyadav-06/AI_Research_Assistant",
    updated_at: "2026-09-10T00:00:00Z"
  },
  {
    name: "ai-travel-agent",
    description: "Intelligent travel itinerary generator featuring FastAPI microservices and Streamlit frontend.",
    language: "Python",
    stargazers_count: 0,
    forks_count: 0,
    html_url: "https://github.com/vamshiyadav-06/ai-travel-agent",
    updated_at: "2026-09-08T00:00:00Z"
  },
  {
    name: "the_smart_city",
    description: "Smart city intelligence platform integrating YOLO computer vision and LightGBM predictive models.",
    language: "Python",
    stargazers_count: 0,
    forks_count: 0,
    html_url: "https://github.com/vamshiyadav-06/the_smart_city",
    updated_at: "2026-09-04T00:00:00Z"
  },
  {
    name: "in_class_ai_study_planner",
    description: "Adaptive AI study schedule planning engine utilizing Groq LLM inference and structured timelines.",
    language: "Python",
    stargazers_count: 0,
    forks_count: 0,
    html_url: "https://github.com/vamshiyadav-06/in_class_ai_study_planner",
    updated_at: "2026-08-30T00:00:00Z"
  },
  {
    name: "Advanced-AI-Medical-Intelligence-Platform",
    description: "Medical diagnostic and healthcare query processing assistant with clinical guidelines integration.",
    language: "Python",
    stargazers_count: 0,
    forks_count: 0,
    html_url: "https://github.com/vamshiyadav-06/Advanced-AI-Medical-Intelligence-Platform",
    updated_at: "2026-08-25T00:00:00Z"
  },
  {
    name: "AI-Project-Architect",
    description: "Multi-agent blueprint generator converting software ideas into structured architecture and roadmaps.",
    language: "Python",
    stargazers_count: 0,
    forks_count: 0,
    html_url: "https://github.com/vamshiyadav-06/AI-Project-Architect",
    updated_at: "2026-08-20T00:00:00Z"
  }
];

const LANGUAGE_COLORS = {
  Python: "#3572A5",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051"
};

async function fetchGitHubRepos() {
  const container = document.getElementById("github-repos-grid");
  if (!container) return;

  // Check cached data
  try {
    const cachedData = sessionStorage.getItem(GITHUB_CACHE_KEY);
    const cachedTime = sessionStorage.getItem(GITHUB_CACHE_TIME_KEY);
    if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime, 10)) < CACHE_DURATION_MS) {
      const repos = JSON.parse(cachedData);
      renderGitHubRepos(repos, container);
      return;
    }
  } catch (err) {
    console.warn("Storage cache read error:", err);
  }

  // Fetch live from GitHub API
  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12`, {
      headers: {
        "Accept": "application/vnd.github.v3+json"
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with status ${response.status}`);
    }

    const liveRepos = await response.json();
    
    // Filter out forks or empty configs if needed, prioritize original work
    const filteredRepos = liveRepos
      .filter(repo => repo.name !== "demo" && repo.name !== GITHUB_USERNAME)
      .slice(0, 8);

    const reposToUse = filteredRepos.length > 0 ? filteredRepos : VERIFIED_FALLBACK_REPOS;

    try {
      sessionStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify(reposToUse));
      sessionStorage.setItem(GITHUB_CACHE_TIME_KEY, Date.now().toString());
    } catch (e) {
      // Ignore storage quota errors
    }

    renderGitHubRepos(reposToUse, container);
  } catch (error) {
    console.warn("Using verified fallback GitHub data:", error.message);
    renderGitHubRepos(VERIFIED_FALLBACK_REPOS, container);
  }
}

function renderGitHubRepos(repos, container) {
  container.innerHTML = repos.map(repo => {
    const lang = repo.language || "Python";
    const langColor = LANGUAGE_COLORS[lang] || "#00f2fe";
    const desc = repo.description || "Production-oriented engineering repository in AI & backend systems.";
    const stars = repo.stargazers_count ?? 0;
    const forks = repo.forks_count ?? 0;

    return `
      <div class="github-card glass-panel" data-tilt>
        <div class="github-card-header">
          <div class="repo-title-wrapper">
            <svg class="icon repo-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-name" title="View repository">
              ${repo.name}
            </a>
          </div>
          <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-link-btn" aria-label="Open ${repo.name} on GitHub">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>

        <p class="repo-description">${escapeHtml(desc)}</p>

        <div class="github-card-footer">
          <div class="repo-meta-item">
            <span class="language-indicator" style="background-color: ${langColor};"></span>
            <span class="repo-language">${lang}</span>
          </div>

          <div class="repo-stats">
            <span class="repo-stat" title="Stars">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              ${stars}
            </span>
            <span class="repo-stat" title="Forks">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
                <circle cx="12" cy="18" r="3"></circle>
                <circle cx="6" cy="6" r="3"></circle>
                <circle cx="18" cy="6" r="3"></circle>
                <path d="M18 9v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"></path>
                <path d="M12 12v3"></path>
              </svg>
              ${forks}
            </span>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

window.initGitHubIntegration = fetchGitHubRepos;
