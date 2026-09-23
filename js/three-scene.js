/**
 * 3D AI Visual Scene using Three.js
 * Renders an interactive neural core with glowing nodes, synaptic filaments,
 * and ambient particle clouds reacting to mouse movement and scrolling.
 */

class HeroScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.neuralCore = null;
    this.innerCore = null;
    this.particleCloud = null;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.clock = null;
    this.animationFrameId = null;
    this.isVisible = true;

    // Check user preference for motion
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
  }

  init() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded. Falling back to CSS ambient visual.');
      return;
    }

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.z = 24;

    this.clock = new THREE.Clock();

    // 2. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const pointLightCyan = new THREE.PointLight(0x00f2fe, 3, 50);
    pointLightCyan.position.set(10, 10, 10);
    this.scene.add(pointLightCyan);

    const pointLightPurple = new THREE.PointLight(0x9d4edd, 3, 50);
    pointLightPurple.position.set(-10, -10, 10);
    this.scene.add(pointLightPurple);

    // 4. Outer Neural Lattice (Icosahedron Wireframe with vertices)
    const icosaGeometry = new THREE.IcosahedronGeometry(7.2, 2);
    
    // Wireframe lines
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.28
    });
    this.neuralCore = new THREE.Mesh(icosaGeometry, wireframeMaterial);
    this.scene.add(this.neuralCore);

    // Glowing Node Points on vertices
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0x64d2ff,
      size: 0.35,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const nodePoints = new THREE.Points(icosaGeometry, pointsMaterial);
    this.neuralCore.add(nodePoints);

    // 5. Inner Core (Torus Knot representing compute core)
    const torusGeometry = new THREE.TorusKnotGeometry(3.6, 0.7, 100, 16);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: 0x0c1427,
      emissive: 0x4318ff,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.85,
      wireframe: false
    });
    this.innerCore = new THREE.Mesh(torusGeometry, torusMaterial);
    this.scene.add(this.innerCore);

    // Inner wireframe glow
    const innerWireMaterial = new THREE.MeshBasicMaterial({
      color: 0x9d4edd,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const innerWire = new THREE.Mesh(torusGeometry, innerWireMaterial);
    this.innerCore.add(innerWire);

    // 6. Ambient Data Particles Cloud
    const particleCount = 280;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00f2fe);
    const color2 = new THREE.Color(0x9d4edd);

    for (let i = 0; i < particleCount; i++) {
      const radius = 9 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      const mixedColor = color1.clone().lerp(color2, Math.random());
      particleColors[i * 3] = mixedColor.r;
      particleColors[i * 3 + 1] = mixedColor.g;
      particleColors[i * 3 + 2] = mixedColor.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.24,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.particleCloud = new THREE.Points(particleGeometry, particleMat);
    this.scene.add(this.particleCloud);

    // 7. Event listeners
    this.setupEvents();

    // 8. Start loop
    this.animate();
  }

  setupEvents() {
    window.addEventListener('resize', () => this.onResize());

    window.addEventListener('mousemove', (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      this.mouse.targetX = normX * 0.7;
      this.mouse.targetY = normY * 0.7;
    });

    // Pause rendering when hero is off-screen
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          this.isVisible = entry.isIntersecting;
        });
      }, { threshold: 0.1 });
      observer.observe(this.container);
    }
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    if (!this.isVisible) return;

    const delta = this.clock.getDelta();
    const speed = this.prefersReducedMotion ? 0.15 : 1.0;

    // Smooth mouse lerping
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Rotations
    if (this.neuralCore) {
      this.neuralCore.rotation.y += 0.12 * delta * speed;
      this.neuralCore.rotation.x = this.mouse.y * 0.45;
      this.neuralCore.rotation.z = -this.mouse.x * 0.45;
    }

    if (this.innerCore) {
      this.innerCore.rotation.x += 0.25 * delta * speed;
      this.innerCore.rotation.y += 0.35 * delta * speed;
      this.innerCore.rotation.z += 0.15 * delta * speed;
    }

    if (this.particleCloud) {
      this.particleCloud.rotation.y -= 0.08 * delta * speed;
      this.particleCloud.rotation.x = this.mouse.y * 0.25;
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}

// Global initialization helper
window.initHeroScene = function(containerId) {
  return new HeroScene(containerId);
};
