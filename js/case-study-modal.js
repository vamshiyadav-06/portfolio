/**
 * Project Case Studies Modal & Interactive Architecture Flowchart
 */

class CaseStudyModal {
  constructor() {
    this.modal = document.getElementById("case-study-modal");
    this.modalContent = document.getElementById("case-study-body");
    this.closeBtn = document.getElementById("case-study-close-btn");
    this.currentProject = null;
    this.init();
  }

  init() {
    if (!this.modal || !this.closeBtn) return;

    this.closeBtn.addEventListener("click", () => this.close());
    
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modal.classList.contains("active")) {
        this.close();
      }
    });
  }

  open(projectId) {
    const project = PORTFOLIO_DATA.projects.find(p => p.id === projectId);
    if (!project) return;

    this.currentProject = project;
    this.renderCaseStudy(project);
    this.modal.classList.add("active");
    this.modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Re-attach interactive architecture diagram events
    this.setupArchitectureInteractions();
  }

  close() {
    this.modal.classList.remove("active");
    this.modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    this.currentProject = null;
  }

  renderCaseStudy(project) {
    const cs = project.caseStudy;
    if (!cs) return;

    const githubBtn = project.githubUrl ? `
      <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
        <span>View on GitHub</span>
      </a>
    ` : "";

    const liveBtn = project.liveUrl ? `
      <a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        <span>Live Demo</span>
      </a>
    ` : "";

    const techBadges = project.techStack.map(t => `<span class="tech-tag">${t}</span>`).join("");

    const featuresList = cs.keyFeatures.map(f => `
      <li class="cs-feature-item">
        <svg class="cs-check-icon" viewBox="0 0 24 24" width="16" height="16" stroke="#00f2fe" stroke-width="2.5" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>${f}</span>
      </li>
    `).join("");

    const considerationsList = cs.engineeringConsiderations.map(c => `
      <li class="cs-consideration-item">
        <span class="cs-bullet-dot"></span>
        <span>${c}</span>
      </li>
    `).join("");

    // Generate architecture diagram HTML
    const archHtml = this.generateArchitectureDiagram(cs.architectureNodes, cs.architectureFlow);

    this.modalContent.innerHTML = `
      <div class="cs-header">
        <div class="cs-category-badge">${project.categoryLabel}</div>
        <h2 class="cs-title">${project.title}</h2>
        <p class="cs-summary">${project.summary}</p>

        <div class="cs-tags-row">
          ${techBadges}
        </div>

        <div class="cs-actions-row">
          ${githubBtn}
          ${liveBtn}
        </div>
      </div>

      <div class="cs-section-divider"></div>

      <!-- Problem & Solution Grid -->
      <div class="cs-grid-two">
        <div class="cs-card glass-panel">
          <div class="cs-card-header">
            <span class="cs-card-icon icon-problem">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </span>
            <h3>The Problem</h3>
          </div>
          <p class="cs-card-text">${cs.problem}</p>
        </div>

        <div class="cs-card glass-panel">
          <div class="cs-card-header">
            <span class="cs-card-icon icon-solution">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </span>
            <h3>The Engineering Solution</h3>
          </div>
          <p class="cs-card-text">${cs.solution}</p>
        </div>
      </div>

      <!-- Interactive Architecture Diagram -->
      <div class="cs-arch-wrapper glass-panel">
        <div class="cs-arch-header">
          <div>
            <h3 class="cs-arch-title">Interactive System Architecture</h3>
            <p class="cs-arch-subtitle">Hover or tap on nodes to trace data flow paths across components.</p>
          </div>
          <span class="arch-badge">Live Topology</span>
        </div>

        ${archHtml}

        <div id="arch-node-details" class="arch-node-details">
          <span class="arch-details-label">Component Insight:</span>
          <span id="arch-details-text">Select or hover a node in the diagram above to inspect its role.</span>
        </div>
      </div>

      <!-- Key Features & Engineering Considerations -->
      <div class="cs-grid-two">
        <div class="cs-card glass-panel">
          <div class="cs-card-header">
            <span class="cs-card-icon icon-features">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </span>
            <h3>Verified Key Features</h3>
          </div>
          <ul class="cs-features-list">
            ${featuresList}
          </ul>
        </div>

        <div class="cs-card glass-panel">
          <div class="cs-card-header">
            <span class="cs-card-icon icon-challenges">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
            </span>
            <h3>Challenges & Engineering Decisions</h3>
          </div>
          <ul class="cs-considerations-list">
            ${considerationsList}
          </ul>
        </div>
      </div>
    `;
  }

  generateArchitectureDiagram(nodes, flow) {
    if (!nodes || nodes.length === 0) return "";

    const nodesHtml = nodes.map((node, i) => {
      let iconSvg = "";
      if (node.type === "frontend") {
        iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;
      } else if (node.type === "backend") {
        iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>`;
      } else if (node.type === "ai") {
        iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
      } else {
        iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`;
      }

      return `
        <div class="arch-node arch-node-${node.type}" data-node-id="${node.id}" data-node-desc="${escapeHtml(node.desc)}">
          <div class="arch-node-badge">${iconSvg}</div>
          <span class="arch-node-title">${escapeHtml(node.label)}</span>
          <span class="arch-node-type-label">${node.type.toUpperCase()}</span>
        </div>
      `;
    }).join("");

    const flowStepsHtml = flow.map((step, idx) => {
      return `
        <div class="arch-flow-step" data-from="${step.from}" data-to="${step.to}">
          <span class="step-num">${idx + 1}</span>
          <span class="step-label">${escapeHtml(step.label)}</span>
          <span class="step-arrow">→</span>
        </div>
      `;
    }).join("");

    return `
      <div class="arch-diagram-container">
        <div class="arch-nodes-strip">
          ${nodesHtml}
        </div>
        <div class="arch-flow-pipeline">
          <div class="arch-flow-title">Pipeline Sequencing</div>
          <div class="arch-flow-steps">
            ${flowStepsHtml}
          </div>
        </div>
      </div>
    `;
  }

  setupArchitectureInteractions() {
    const nodes = this.modalContent.querySelectorAll(".arch-node");
    const flowSteps = this.modalContent.querySelectorAll(".arch-flow-step");
    const detailsText = document.getElementById("arch-details-text");

    nodes.forEach(node => {
      const nodeId = node.getAttribute("data-node-id");
      const desc = node.getAttribute("data-node-desc");

      const highlight = () => {
        nodes.forEach(n => n.classList.remove("active-highlight"));
        node.classList.add("active-highlight");
        if (detailsText) detailsText.textContent = desc;

        // Highlight connected flow steps
        flowSteps.forEach(step => {
          if (step.getAttribute("data-from") === nodeId || step.getAttribute("data-to") === nodeId) {
            step.classList.add("step-active");
          } else {
            step.classList.remove("step-active");
          }
        });
      };

      node.addEventListener("mouseenter", highlight);
      node.addEventListener("click", highlight);
    });

    flowSteps.forEach(step => {
      step.addEventListener("mouseenter", () => {
        const from = step.getAttribute("data-from");
        const to = step.getAttribute("data-to");
        nodes.forEach(n => {
          const id = n.getAttribute("data-node-id");
          if (id === from || id === to) {
            n.classList.add("active-highlight");
          } else {
            n.classList.remove("active-highlight");
          }
        });
      });
      step.addEventListener("mouseleave", () => {
        nodes.forEach(n => n.classList.remove("active-highlight"));
      });
    });
  }
}

window.initCaseStudyModal = function() {
  window.caseStudyModalInstance = new CaseStudyModal();
  window.openCaseStudy = function(projectId) {
    if (window.caseStudyModalInstance) {
      window.caseStudyModalInstance.open(projectId);
    }
  };
};
