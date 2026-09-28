/**
 * ===================================================================
 * PERSONAL INNOVATION LABORATORY - MASTER CONTROLLER (app.js)
 * Clean Futuristic Laboratory Logic, Canvas Engines, Audio & CLI
 * ===================================================================
 */

(function () {
  'use strict';

  /* ===================================================================
     AUDIO SYNTHESIZER (WEB AUDIO API)
     Zero-latency synthesized laboratory sound effects
     =================================================================== */
  class LabAudioEngine {
    constructor() {
      this.ctx = null;
      this.enabled = false; // default off until user toggles or enables
      this.initFromStorage();
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    initFromStorage() {
      const stored = localStorage.getItem('lab_sfx_enabled');
      if (stored === 'true') {
        this.enabled = true;
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('lab_sfx_enabled', this.enabled ? 'true' : 'false');
      if (this.enabled) {
        this.init();
        this.playChirp();
      }
      return this.enabled;
    }

    playClick() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    }

    playChirp() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    }

    playTransmit() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(440, now + 0.1);
      osc.frequency.linearRampToValueAtTime(880, now + 0.2);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    }

    playPulse() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.setValueAtTime(650, this.ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    }
  }

  const audio = new LabAudioEngine();

  /* ===================================================================
     AMBIENT LABORATORY CANVAS (PARTICLES & CIRCUIT GRID)
     =================================================================== */
  const canvas = document.getElementById('lab-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = 45;
    let mouse = { x: -1000, y: -1000, radius: 120 };

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 1.5 + 1;
        this.alpha = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Mouse repulsion
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x += (dx / dist) * force * 2;
          this.y += (dy / dist) * force * 2;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 245, 212, ${this.alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);

      // Connect nearby particles with subtle laser lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.22;
            ctx.strokeStyle = `rgba(0, 245, 212, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(renderParticles);
    }

    renderParticles();
  }

  /* ===================================================================
     THEME CONTROLLER (OBSIDIAN DARK / CLEANROOM LIGHT)
     =================================================================== */
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeLabel = document.getElementById('theme-label');
  const iconSun = document.querySelector('.icon-sun');
  const iconMoon = document.querySelector('.icon-moon');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lab_theme', theme);

    if (theme === 'light') {
      if (themeLabel) themeLabel.textContent = 'LIGHT';
      if (iconSun) iconSun.classList.remove('hidden');
      if (iconMoon) iconMoon.classList.add('hidden');
    } else {
      if (themeLabel) themeLabel.textContent = 'DARK';
      if (iconSun) iconSun.classList.add('hidden');
      if (iconMoon) iconMoon.classList.remove('hidden');
    }
  }

  const savedTheme = localStorage.getItem('lab_theme') || 'dark';
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      audio.playClick();
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    });
  }

  /* ===================================================================
     AUDIO TOGGLE BUTTON
     =================================================================== */
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioOnIcon = document.querySelector('.audio-on');
  const audioOffIcon = document.querySelector('.audio-off');

  function updateAudioButtonState() {
    if (audio.enabled) {
      if (audioOnIcon) audioOnIcon.classList.remove('hidden');
      if (audioOffIcon) audioOffIcon.classList.add('hidden');
    } else {
      if (audioOnIcon) audioOnIcon.classList.add('hidden');
      if (audioOffIcon) audioOffIcon.classList.remove('hidden');
    }
  }

  updateAudioButtonState();

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      const state = audio.toggle();
      updateAudioButtonState();
    });
  }

  /* ===================================================================
     MOBILE NAVIGATION & SECTION SPY
     =================================================================== */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mainNav = document.getElementById('main-nav');
  const navItems = document.querySelectorAll('.nav-item');

  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener('click', () => {
      audio.playClick();
      mainNav.classList.toggle('mobile-active');
    });

    navItems.forEach((link) => {
      link.addEventListener('click', () => {
        audio.playClick();
        mainNav.classList.remove('mobile-active');
      });
    });
  }

  // Active section indicator via IntersectionObserver
  const sections = document.querySelectorAll('.chamber-section, .chamber-hero');
  const observerOptions = { root: null, rootMargin: '-20% 0px -70% 0px', threshold: 0 };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach((item) => {
          if (item.getAttribute('data-section') === id || item.getAttribute('href') === `#${id}`) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((sec) => sectionObserver.observe(sec));

  /* ===================================================================
     EXPERIMENT 01: NEURAL CLUSTER CONVERGENCE SIMULATOR
     =================================================================== */
  const neuralCanvas = document.getElementById('neural-canvas');
  if (neuralCanvas) {
    const nCtx = neuralCanvas.getContext('2d');
    const sliderLr = document.getElementById('slider-lr');
    const sliderCentroids = document.getElementById('slider-centroids');
    const sliderNoise = document.getElementById('slider-noise');
    const valLr = document.getElementById('val-lr');
    const valCentroids = document.getElementById('val-centroids');
    const valNoise = document.getElementById('val-noise');
    const btnRunNeural = document.getElementById('btn-run-neural-sim');
    const btnResetNeural = document.getElementById('btn-reset-neural-sim');
    const neuralEpoch = document.getElementById('neural-epoch');
    const neuralLoss = document.getElementById('neural-loss');
    const neuralStatus = document.getElementById('neural-status');
    const coordsDisplay = document.getElementById('canvas-cursor-coords');

    let points = [];
    let centroids = [];
    let epoch = 142;
    let isSimulating = false;
    let simTimer = null;

    function initNeuralPoints() {
      points = [];
      centroids = [];
      const k = parseInt(sliderCentroids.value, 10);
      const noise = parseInt(sliderNoise.value, 10) / 100;
      const w = neuralCanvas.width;
      const h = neuralCanvas.height;

      // Seed K centroids with distinct colors
      const colors = ['#00f5d4', '#3a86ff', '#ff007f', '#ffbe0b', '#10b981', '#8338ec'];
      for (let i = 0; i < k; i++) {
        centroids.push({
          x: 100 + Math.random() * (w - 200),
          y: 70 + Math.random() * (h - 140),
          targetX: 100 + Math.random() * (w - 200),
          targetY: 70 + Math.random() * (h - 140),
          color: colors[i % colors.length]
        });
      }

      // Generate points associated with each centroid with noise
      const pointsPerCentroid = Math.floor(180 / k);
      centroids.forEach((c, idx) => {
        for (let j = 0; j < pointsPerCentroid; j++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = (Math.random() * 80 + 10) * (1 + noise * 1.5);
          points.push({
            x: c.x + Math.cos(angle) * radius,
            y: c.y + Math.sin(angle) * radius,
            centroidIdx: idx,
            color: c.color,
            radius: Math.random() * 2 + 1.8
          });
        }
      });
    }

    function drawNeuralSimulation() {
      nCtx.fillStyle = '#040711';
      nCtx.fillRect(0, 0, neuralCanvas.width, neuralCanvas.height);

      // Draw subtle coordinate grid
      nCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      nCtx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < neuralCanvas.width; x += step) {
        nCtx.beginPath();
        nCtx.moveTo(x, 0);
        nCtx.lineTo(x, neuralCanvas.height);
        nCtx.stroke();
      }
      for (let y = 0; y < neuralCanvas.height; y += step) {
        nCtx.beginPath();
        nCtx.moveTo(0, y);
        nCtx.lineTo(neuralCanvas.width, y);
        nCtx.stroke();
      }

      // Draw vectors connecting to centroids
      points.forEach((p) => {
        const c = centroids[p.centroidIdx];
        if (c) {
          nCtx.strokeStyle = `${c.color}22`;
          nCtx.beginPath();
          nCtx.moveTo(p.x, p.y);
          nCtx.lineTo(c.x, c.y);
          nCtx.stroke();
        }
      });

      // Draw points
      points.forEach((p) => {
        nCtx.beginPath();
        nCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        nCtx.fillStyle = p.color;
        nCtx.shadowColor = p.color;
        nCtx.shadowBlur = 6;
        nCtx.fill();
        nCtx.shadowBlur = 0;
      });

      // Draw centroids (Holographic pulsing rings)
      centroids.forEach((c) => {
        nCtx.strokeStyle = c.color;
        nCtx.lineWidth = 2;
        nCtx.beginPath();
        nCtx.arc(c.x, c.y, 9, 0, Math.PI * 2);
        nCtx.stroke();

        nCtx.fillStyle = '#ffffff';
        nCtx.beginPath();
        nCtx.arc(c.x, c.y, 3, 0, Math.PI * 2);
        nCtx.fill();

        // Crosshairs
        nCtx.beginPath();
        nCtx.moveTo(c.x - 14, c.y);
        nCtx.lineTo(c.x + 14, c.y);
        nCtx.moveTo(c.x, c.y - 14);
        nCtx.lineTo(c.x, c.y + 14);
        nCtx.strokeStyle = `${c.color}88`;
        nCtx.stroke();
      });
    }

    function stepEpoch() {
      const lr = parseFloat(sliderLr.value);
      epoch++;
      let totalDist = 0;

      // Move points toward their centroids
      points.forEach((p) => {
        const c = centroids[p.centroidIdx];
        if (c) {
          const dx = c.x - p.x;
          const dy = c.y - p.y;
          p.x += dx * lr;
          p.y += dy * lr;
          totalDist += Math.sqrt(dx * dx + dy * dy);
        }
      });

      // Recalculate centroids slightly toward mean of their cluster
      centroids.forEach((c, idx) => {
        const cluster = points.filter((p) => p.centroidIdx === idx);
        if (cluster.length > 0) {
          const meanX = cluster.reduce((acc, p) => acc + p.x, 0) / cluster.length;
          const meanY = cluster.reduce((acc, p) => acc + p.y, 0) / cluster.length;
          c.x += (meanX - c.x) * 0.1;
          c.y += (meanY - c.y) * 0.1;
        }
      });

      const avgLoss = (totalDist / (points.length * 100)).toFixed(4);
      if (neuralEpoch) neuralEpoch.textContent = epoch;
      if (neuralLoss) neuralLoss.textContent = avgLoss;
      if (neuralStatus) {
        neuralStatus.textContent = avgLoss < 0.05 ? 'CONVERGED' : 'ITERATING';
        neuralStatus.className = avgLoss < 0.05 ? 'r-v text-emerald' : 'r-v text-cyan';
      }

      drawNeuralSimulation();
    }

    sliderLr.addEventListener('input', (e) => {
      valLr.textContent = e.target.value;
    });

    sliderCentroids.addEventListener('input', (e) => {
      valCentroids.textContent = e.target.value;
      initNeuralPoints();
      drawNeuralSimulation();
    });

    sliderNoise.addEventListener('input', (e) => {
      valNoise.textContent = `${e.target.value}%`;
      initNeuralPoints();
      drawNeuralSimulation();
    });

    btnRunNeural.addEventListener('click', () => {
      audio.playPulse();
      for (let i = 0; i < 15; i++) {
        setTimeout(stepEpoch, i * 40);
      }
    });

    btnResetNeural.addEventListener('click', () => {
      audio.playClick();
      epoch = 0;
      initNeuralPoints();
      drawNeuralSimulation();
      if (neuralEpoch) neuralEpoch.textContent = '0';
      if (neuralLoss) neuralLoss.textContent = '0.4120';
      if (neuralStatus) neuralStatus.textContent = 'INITIALIZED';
    });

    neuralCanvas.addEventListener('mousemove', (e) => {
      const rect = neuralCanvas.getBoundingClientRect();
      const x = (e.clientX - rect.left).toFixed(1);
      const y = (e.clientY - rect.top).toFixed(1);
      if (coordsDisplay) {
        coordsDisplay.textContent = `X: ${x} | Y: ${y}`;
      }
    });

    initNeuralPoints();
    drawNeuralSimulation();
  }

  /* ===================================================================
     EXPERIMENT 02: HIGH-THROUGHPUT STRESS TEST (OSCILLOSCOPE)
     =================================================================== */
  const stressCanvas = document.getElementById('stress-canvas');
  if (stressCanvas) {
    const sCtx = stressCanvas.getContext('2d');
    const sliderConcurrency = document.getElementById('slider-concurrency');
    const valConcurrency = document.getElementById('val-concurrency');
    const btnStartStress = document.getElementById('btn-start-stress');
    const btnClearStress = document.getElementById('btn-clear-stress');
    const stressBtnText = document.getElementById('stress-btn-text');
    const stressFps = document.getElementById('stress-fps');
    const stressOps = document.getElementById('stress-ops');
    const stressJitter = document.getElementById('stress-jitter');
    const stressProcessedCount = document.getElementById('stress-processed-count');

    let isStressActive = false;
    let waveOffset = 0;
    let packetsProcessed = 0;
    let animationId = null;
    let lastTime = performance.now();
    let frameCount = 0;

    sliderConcurrency.addEventListener('input', (e) => {
      valConcurrency.textContent = e.target.value;
      const count = parseInt(e.target.value, 10);
      if (stressOps) {
        stressOps.textContent = (count * 85).toLocaleString();
      }
    });

    function drawStressVisualizer(now) {
      if (!isStressActive) return;

      const delta = now - lastTime;
      frameCount++;
      if (delta >= 1000) {
        const currentFps = ((frameCount * 1000) / delta).toFixed(1);
        if (stressFps) stressFps.textContent = currentFps;
        frameCount = 0;
        lastTime = now;
      }

      sCtx.fillStyle = '#040711';
      sCtx.fillRect(0, 0, stressCanvas.width, stressCanvas.height);

      const concurrency = parseInt(sliderConcurrency.value, 10);
      waveOffset += 0.05 + concurrency / 20000;
      packetsProcessed += Math.floor(concurrency * 0.15);
      if (stressProcessedCount) {
        stressProcessedCount.textContent = `PROCESSED: ${packetsProcessed.toLocaleString()} PACKETS`;
      }

      // Draw oscilloscope grid
      sCtx.strokeStyle = 'rgba(0, 245, 212, 0.08)';
      sCtx.lineWidth = 1;
      for (let x = 0; x < stressCanvas.width; x += 30) {
        sCtx.beginPath();
        sCtx.moveTo(x, 0);
        sCtx.lineTo(x, stressCanvas.height);
        sCtx.stroke();
      }
      for (let y = 0; y < stressCanvas.height; y += 30) {
        sCtx.beginPath();
        sCtx.moveTo(0, y);
        sCtx.lineTo(stressCanvas.width, y);
        sCtx.stroke();
      }

      // Multi-sine wave buffer channels
      const channels = [
        { color: '#00f5d4', freq: 0.02, amp: 35, speed: 1.2 },
        { color: '#3a86ff', freq: 0.04, amp: 20, speed: 1.8 },
        { color: '#ffb703', freq: 0.015, amp: 45, speed: 0.8 }
      ];

      channels.forEach((ch) => {
        sCtx.strokeStyle = ch.color;
        sCtx.lineWidth = 2;
        sCtx.shadowColor = ch.color;
        sCtx.shadowBlur = 8;
        sCtx.beginPath();

        const midY = stressCanvas.height / 2;
        for (let x = 0; x < stressCanvas.width; x += 3) {
          const jitter = (Math.random() - 0.5) * (concurrency > 1500 ? 6 : 2);
          const y = midY + Math.sin(x * ch.freq + waveOffset * ch.speed) * ch.amp + jitter;
          if (x === 0) sCtx.moveTo(x, y);
          else sCtx.lineTo(x, y);
        }
        sCtx.stroke();
        sCtx.shadowBlur = 0;
      });

      // Draw floating telemetry packet pulses
      for (let i = 0; i < 6; i++) {
        const px = (waveOffset * 100 + i * 90) % stressCanvas.width;
        const py = stressCanvas.height / 2 + Math.sin(px * 0.02) * 35;
        sCtx.fillStyle = '#ffffff';
        sCtx.beginPath();
        sCtx.arc(px, py, 3.5, 0, Math.PI * 2);
        sCtx.fill();
      }

      animationId = requestAnimationFrame(drawStressVisualizer);
    }

    btnStartStress.addEventListener('click', () => {
      audio.playPulse();
      isStressActive = !isStressActive;
      if (isStressActive) {
        stressBtnText.textContent = 'PAUSE INJECTION';
        animationId = requestAnimationFrame(drawStressVisualizer);
      } else {
        stressBtnText.textContent = 'INJECT STRESS LOAD';
        if (animationId) cancelAnimationFrame(animationId);
      }
    });

    btnClearStress.addEventListener('click', () => {
      audio.playClick();
      packetsProcessed = 0;
      if (stressProcessedCount) stressProcessedCount.textContent = 'PROCESSED: 0 PACKETS';
      sCtx.fillStyle = '#040711';
      sCtx.fillRect(0, 0, stressCanvas.width, stressCanvas.height);
    });

    // Initial silent render
    sCtx.fillStyle = '#040711';
    sCtx.fillRect(0, 0, stressCanvas.width, stressCanvas.height);
  }

  /* ===================================================================
     EXPERIMENT 03: STARTUP FEASIBILITY SYNTHESIZER
     =================================================================== */
  const btnSynthesizeVenture = document.getElementById('btn-synthesize-venture');
  const selTargetSector = document.getElementById('select-target-sector');
  const selTechWedge = document.getElementById('select-tech-wedge');
  const selBizModel = document.getElementById('select-business-model');

  const scMoat = document.getElementById('sc-moat');
  const barMoat = document.getElementById('bar-moat');
  const scVelocity = document.getElementById('sc-velocity');
  const barVelocity = document.getElementById('bar-velocity');
  const scCac = document.getElementById('sc-cac');
  const barCac = document.getElementById('bar-cac');
  const synthProtocolId = document.getElementById('synth-protocol-id');
  const synthProtocolBody = document.getElementById('synth-protocol-body');

  const ventureProtocols = {
    'developer-tools': {
      hypothesis: 'If we compile vector quantization directly to WASM for client-side edge runners, developer latency drops below 4ms and eliminates server egress bills.',
      sprint: '48h Sprint: Scaffold Rust HNSW core, bundle into Next.js package, benchmark on 100k embeddings vs Pinecone API.',
      metric: 'Falsification metric: Query latency must stay <= 5ms at 95th percentile with <100MB RAM.',
      distribution: 'Direct HN Show release + benchmark blog post with reproducible Docker sandbox.'
    },
    'autonomous-agents': {
      hypothesis: 'If multi-agent reflection loops use localized AST syntax trees rather than whole-file regeneration, error recovery speed increases by 3.4x.',
      sprint: '48h Sprint: Spin up Tree-Sitter Python parser hook, test across HumanEval Python 164 challenging exercises.',
      metric: 'Falsification metric: Pass@2 rate must exceed 85% with <= 2 retry cycles.',
      distribution: 'Open-source GitHub action for automated CI pull request fixing.'
    },
    'edge-iot': {
      hypothesis: 'If ring-buffer delta compression is implemented directly on SPI flash, 100% of sensor telemetry is retained through RF blackout zones.',
      sprint: '48h Sprint: Flash FreeRTOS task to ESP32-S3, inject RF noise in shielded chamber, verify bit-exact recovery over MQTT.',
      metric: 'Falsification metric: Zero packet drop over 30 simulated RF disconnects.',
      distribution: 'Drone OEM pilot partnerships and collegiate robotics lab demos.'
    },
    'creator-economy': {
      hypothesis: 'If micro-transactions are batched into state channels with zero-gas commitments, creators retain 98% of gross margin vs 70% on standard platforms.',
      sprint: '48h Sprint: Draft Solidity L2 escrow contract, test with 20 mock students simulating tip disbursements.',
      metric: 'Falsification metric: Gas cost per transaction must not exceed $0.0001.',
      distribution: 'Hackathon team micro-grant distribution trials.'
    }
  };

  function updateVentureSynthesis() {
    const sector = selTargetSector ? selTargetSector.value : 'developer-tools';
    const wedge = selTechWedge ? selTechWedge.value : 'vector-cache';
    const model = selBizModel ? selBizModel.value : 'usage-api';

    const proto = ventureProtocols[sector] || ventureProtocols['developer-tools'];
    const randomId = Math.floor(Math.random() * 800 + 200);

    if (synthProtocolId) synthProtocolId.textContent = `EXP-VENTURE-${randomId}`;

    let moatVal = 88;
    if (wedge === 'vector-cache' || wedge === 'zero-knowledge') moatVal = 94;
    if (wedge === 'local-slm') moatVal = 91;

    let velVal = '48 HOURS';
    let velPct = '90%';
    if (wedge === 'zero-knowledge') {
      velVal = '72 HOURS';
      velPct = '75%';
    }

    let cacVal = '1 : 4.8';
    if (model === 'usage-api') cacVal = '1 : 5.2';
    if (model === 'open-core') cacVal = '1 : 4.1';

    if (scMoat) scMoat.textContent = `${moatVal} / 100`;
    if (barMoat) barMoat.style.width = `${moatVal}%`;

    if (scVelocity) scVelocity.textContent = velVal;
    if (barVelocity) barVelocity.style.width = velPct;

    if (scCac) scCac.textContent = cacVal;

    if (synthProtocolBody) {
      synthProtocolBody.innerHTML = `
        <p><strong>FORMULATED HYPOTHESIS:</strong> ${proto.hypothesis}</p>
        <p style="margin-top: 0.6rem;"><strong>48-HOUR SPRINT ARCHITECTURE:</strong> ${proto.sprint}</p>
        <p style="margin-top: 0.6rem;"><strong>EMPIRICAL FALSIFICATION GATE:</strong> ${proto.metric}</p>
        <p style="margin-top: 0.6rem;"><strong>RAPID DISTRIBUTION TEST:</strong> ${proto.distribution}</p>
      `;
    }
  }

  if (btnSynthesizeVenture) {
    btnSynthesizeVenture.addEventListener('click', () => {
      audio.playPulse();
      updateVentureSynthesis();
    });
    updateVentureSynthesis();
  }

  /* ===================================================================
     SANDBOX TABS CONTROLLER
     =================================================================== */
  const sandboxTabs = document.querySelectorAll('.sandbox-tab');
  const sandboxPanels = document.querySelectorAll('.sandbox-panel');

  sandboxTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      audio.playClick();
      const targetId = tab.getAttribute('data-tab');

      sandboxTabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      sandboxPanels.forEach((p) => p.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  /* ===================================================================
     PROJECT FILTER & REAL-TIME SEARCH ENGINE
     =================================================================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('project-search-input');
  const projectCards = document.querySelectorAll('.project-exp-card');

  function applyProjectFilters() {
    const activeBtn = document.querySelector('.filter-btn.active');
    const filterValue = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    projectCards.forEach((card) => {
      const status = card.getAttribute('data-status');
      const text = card.textContent.toLowerCase();

      const matchesStatus = filterValue === 'all' || status === filterValue;
      const matchesSearch = query === '' || text.includes(query);

      if (matchesStatus && matchesSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      audio.playClick();
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      applyProjectFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyProjectFilters);
  }

  /* ===================================================================
     PROJECT TELEMETRY DOSSIER MODAL
     =================================================================== */
  const telemetryModal = document.getElementById('telemetry-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalDismissBtn = document.getElementById('modal-dismiss-btn');
  const openTelemetryBtns = document.querySelectorAll('.open-telemetry-btn');

  const modalProjectId = document.getElementById('modal-project-id');
  const modalProjectStatus = document.getElementById('modal-project-status');
  const modalProjectTitle = document.getElementById('modal-project-title');
  const modalArchCode = document.getElementById('modal-architecture-code');
  const modalPrimaryMetric = document.getElementById('modal-primary-metric');
  const modalSampleSize = document.getElementById('modal-sample-size');
  const modalPlatform = document.getElementById('modal-platform');
  const modalNotesText = document.getElementById('modal-notes-text');

  const projectTelemetryData = {
    'exp-401': {
      id: 'EXP-401 // TELEMETRY',
      status: 'STATUS: VALIDATED',
      title: 'ApexVector: Ultra-Low-Latency In-Memory Semantic Index',
      diagram: `+-----------------------+     +----------------------+     +---------------------+
| Client Memory Space   | --> | SIMD Quantizer Graph | --> | WASM Execution Core |
+-----------------------+     +----------------------+     +---------------------+
                                         |
                                         v
                              [ Sub-3.1ms Response ]`,
      metric: '3.1ms Avg Latency',
      sample: '250,000 Embeddings',
      platform: 'Rust + WASM SIMD (V8 / JSC)',
      notes: 'Stress-testing revealed that 8-bit scalar quantization reduced memory overhead from 380MB down to 94MB while retaining 97.4% recall on GloVe & OpenAI 1536-dim vector sets.'
    },
    'exp-402': {
      id: 'EXP-402 // TELEMETRY',
      status: 'STATUS: ACTIVE TRIALS',
      title: 'VenturePulse: AI Customer Discovery & Signal Analyzer',
      diagram: `+-----------------------+     +----------------------+     +---------------------+
| Audio Stream (Whisper)| --> | Semantic Topic Graph | --> | Willingness Heatmap |
+-----------------------+     +----------------------+     +---------------------+
                                         |
                                         v
                              [ 140+ Founder Sessions ]`,
      metric: '89.4% Objection Recall',
      sample: '140+ Recorded Calls',
      platform: 'FastAPI + Next.js 14 + PostgreSQL',
      notes: 'Objection clustering prevented 3 pilot startups from building costly secondary features, leading to 2 successful pivots into paid customer prepayments.'
    },
    'exp-403': {
      id: 'EXP-403 // TELEMETRY',
      status: 'STATUS: VALIDATED',
      title: 'SynapseMesh: Peer-to-Peer State Sync Engine',
      diagram: `+-----------------------+     +----------------------+     +---------------------+
| Local CRDT Document   | <-> | WebRTC DataChannel   | <-> | Mesh Gossip Nodes   |
+-----------------------+     +----------------------+     +---------------------+
                                         |
                                         v
                              [ Zero Central Server ]`,
      metric: '12ms Peer Delta Latency',
      sample: '64 Concurrent Peers',
      platform: 'TypeScript + Yjs + WebRTC',
      notes: 'Achieved complete convergence across 64 concurrent simulated peers typing simultaneously with zero split-brain states or central coordinator requirements.'
    },
    'exp-404': {
      id: 'EXP-404 // TELEMETRY',
      status: 'STATUS: ITERATING V2',
      title: 'AutoSpec: Self-Healing Code Synthesis Harness',
      diagram: `+-----------------------+     +----------------------+     +---------------------+
| Spec Formulation      | --> | AST Sandbox Runner   | --> | Traceback Injector  |
+-----------------------+     +----------------------+     +---------------------+
                                         ^                         |
                                         +--- Reflective Patch <---+`,
      metric: '89.6% HumanEval Pass@2',
      sample: '164 Challenge Problems',
      platform: 'Python 3.12 + Tree-Sitter + Docker',
      notes: 'Cyclic feedback boosted code completion accuracy from 61.2% to 89.6% by feeding raw AST compiler tracebacks directly into the token context buffer.'
    },
    'exp-405': {
      id: 'EXP-405 // TELEMETRY',
      status: 'STATUS: VALIDATED',
      title: 'ZeroSplit: Smart Contract Micro-Grant Escrow',
      diagram: `+-----------------------+     +----------------------+     +---------------------+
| Sponsor Deposit       | --> | Multi-Sig Checkpoint | --> | Milestone Release   |
+-----------------------+     +----------------------+     +---------------------+`,
      metric: '$8,500+ Disbursed',
      sample: '12 Hackathon Teams',
      platform: 'Solidity + Polygon L2 + Ethers.js',
      notes: 'Eliminated hackathon project abandonment by releasing micro-grants in 3 strict milestone disbursements verified cryptographically by peer teams.'
    },
    'exp-406': {
      id: 'EXP-406 // TELEMETRY',
      status: 'STATUS: ACTIVE TESTING',
      title: 'AeroTelemetry: Edge Flight Logger for Micro-Drones',
      diagram: `+-----------------------+     +----------------------+     +---------------------+
| 9-DOF IMU Sensors     | --> | SPI Ring Buffer      | --> | MQTT Uplink Sync    |
+-----------------------+     +----------------------+     +---------------------+`,
      metric: '0% Packet Drop Rate',
      sample: '40 Flight Maneuvers',
      platform: 'C++ / FreeRTOS on ESP32-S3',
      notes: 'Delta-compression on flash maintained 1000Hz inertial telemetry without causing RTOS thread starvation during sustained 4G aggressive drone aerobatics.'
    }
  };

  function openTelemetry(projectId) {
    audio.playPulse();
    const data = projectTelemetryData[projectId] || projectTelemetryData['exp-401'];

    if (modalProjectId) modalProjectId.textContent = data.id;
    if (modalProjectStatus) modalProjectStatus.textContent = data.status;
    if (modalProjectTitle) modalProjectTitle.textContent = data.title;
    if (modalArchCode) modalArchCode.textContent = data.diagram;
    if (modalPrimaryMetric) modalPrimaryMetric.textContent = data.metric;
    if (modalSampleSize) modalSampleSize.textContent = data.sample;
    if (modalPlatform) modalPlatform.textContent = data.platform;
    if (modalNotesText) modalNotesText.textContent = data.notes;

    if (telemetryModal) {
      telemetryModal.classList.add('active');
      telemetryModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeTelemetry() {
    audio.playClick();
    if (telemetryModal) {
      telemetryModal.classList.remove('active');
      telemetryModal.setAttribute('aria-hidden', 'true');
    }
  }

  openTelemetryBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const pid = btn.getAttribute('data-project');
      openTelemetry(pid);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeTelemetry);
  if (modalDismissBtn) modalDismissBtn.addEventListener('click', closeTelemetry);

  if (telemetryModal) {
    telemetryModal.addEventListener('click', (e) => {
      if (e.target === telemetryModal) closeTelemetry();
    });
  }

  /* ===================================================================
     IDEAS UPVOTE & COLLABORATION PREFILL
     =================================================================== */
  const upvoteBtns = document.querySelectorAll('.upvote-btn');
  const requestCollabBtns = document.querySelectorAll('.request-collab-btn');

  // Load saved votes from localStorage
  const savedVotes = JSON.parse(localStorage.getItem('lab_upvoted_ideas') || '[]');

  upvoteBtns.forEach((btn) => {
    const ideaId = btn.getAttribute('data-id');
    const countSpan = btn.querySelector('.upvote-count');

    if (savedVotes.includes(ideaId)) {
      btn.classList.add('voted');
    }

    btn.addEventListener('click', () => {
      audio.playChirp();
      let currentVotes = JSON.parse(localStorage.getItem('lab_upvoted_ideas') || '[]');
      let count = parseInt(countSpan.textContent, 10);

      if (currentVotes.includes(ideaId)) {
        currentVotes = currentVotes.filter((id) => id !== ideaId);
        btn.classList.remove('voted');
        countSpan.textContent = count - 1;
      } else {
        currentVotes.push(ideaId);
        btn.classList.add('voted');
        countSpan.textContent = count + 1;
      }

      localStorage.setItem('lab_upvoted_ideas', JSON.stringify(currentVotes));
    });
  });

  requestCollabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      audio.playClick();
      const ideaTitle = btn.getAttribute('data-idea');
      const contactSection = document.getElementById('contact');
      const commMessage = document.getElementById('comm-message');
      const commPurpose = document.getElementById('comm-purpose');

      if (commPurpose) commPurpose.value = 'startup-collab';
      if (commMessage) {
        commMessage.value = `Hello Arjun,\n\nI reviewed your Incubation Lab concept "${ideaTitle}" and would love to discuss pilot testing / collaboration opportunities.`;
      }

      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          if (commMessage) commMessage.focus();
        }, 600);
      }
    });
  });

  /* ===================================================================
     HYPOTHESIS PROPOSAL MODAL
     =================================================================== */
  const btnOpenHypoModal = document.getElementById('btn-open-hypothesis-modal');
  const hypoModal = document.getElementById('hypothesis-modal');
  const hypoModalCloseBtn = document.getElementById('hypo-modal-close-btn');
  const hypoForm = document.getElementById('hypothesis-proposal-form');
  const hypoStatusMsg = document.getElementById('hypo-status-msg');

  if (btnOpenHypoModal && hypoModal) {
    btnOpenHypoModal.addEventListener('click', () => {
      audio.playClick();
      hypoModal.classList.add('active');
      hypoModal.setAttribute('aria-hidden', 'false');
    });

    if (hypoModalCloseBtn) {
      hypoModalCloseBtn.addEventListener('click', () => {
        audio.playClick();
        hypoModal.classList.remove('active');
        hypoModal.setAttribute('aria-hidden', 'true');
      });
    }

    hypoModal.addEventListener('click', (e) => {
      if (e.target === hypoModal) {
        audio.playClick();
        hypoModal.classList.remove('active');
        hypoModal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  if (hypoForm) {
    hypoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      audio.playTransmit();
      if (hypoStatusMsg) {
        hypoStatusMsg.innerHTML = '<span class="text-cyan">TRANSMITTING HYPOTHESIS TO FACILITY QUEUE...</span>';
        setTimeout(() => {
          hypoStatusMsg.innerHTML = '<span class="text-emerald">&check; HYPOTHESIS ENQUEUED (PROTOCOL-799 RECORDED)</span>';
          hypoForm.reset();
          setTimeout(() => {
            if (hypoModal) hypoModal.classList.remove('active');
            if (hypoStatusMsg) hypoStatusMsg.innerHTML = '';
          }, 1800);
        }, 900);
      }
    });
  }

  /* ===================================================================
     TRANSMISSION CONSOLE (CONTACT FORM)
     =================================================================== */
  const transmissionForm = document.getElementById('transmission-form');
  const transmissionStatus = document.getElementById('transmission-status');
  const transmitBtnLabel = document.getElementById('transmit-btn-label');

  if (transmissionForm) {
    transmissionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      audio.playTransmit();

      const nameInput = document.getElementById('comm-name');
      const emailInput = document.getElementById('comm-email');
      const messageInput = document.getElementById('comm-message');

      if (!nameInput.value.trim() || !emailInput.value.trim() || !messageInput.value.trim()) {
        if (transmissionStatus) {
          transmissionStatus.className = 'transmission-status error';
          transmissionStatus.textContent = '! ALL TELEMETRY FIELDS REQUIRED';
        }
        return;
      }

      if (transmitBtnLabel) transmitBtnLabel.textContent = 'ENCRYPTING & DISPATCHING...';
      if (transmissionStatus) {
        transmissionStatus.className = 'transmission-status';
        transmissionStatus.innerHTML = '<span class="text-cyan">HANDSHAKE IN PROGRESS...</span>';
      }

      setTimeout(() => {
        audio.playChirp();
        if (transmitBtnLabel) transmitBtnLabel.textContent = 'TRANSMIT TO LABORATORY';
        if (transmissionStatus) {
          transmissionStatus.className = 'transmission-status success';
          transmissionStatus.innerHTML = '&check; TRANSMISSION DELIVERED. DISPATCH ACKNOWLEDGED.';
        }
        transmissionForm.reset();

        setTimeout(() => {
          if (transmissionStatus) transmissionStatus.innerHTML = '';
        }, 5000);
      }, 1200);
    });
  }

  /* ===================================================================
     FLOATING CLI TERMINAL DRAWER (~ lab-cli)
     =================================================================== */
  const terminalTriggerBtn = document.getElementById('terminal-trigger-btn');
  const labCliDrawer = document.getElementById('lab-cli-drawer');
  const cliCloseBtn = document.getElementById('cli-close-btn');
  const cliInput = document.getElementById('cli-input');
  const cliOutputHistory = document.getElementById('cli-output-history');

  function toggleTerminal() {
    audio.playClick();
    if (!labCliDrawer) return;
    const isOpen = labCliDrawer.classList.contains('open');
    if (isOpen) {
      labCliDrawer.classList.remove('open');
      labCliDrawer.setAttribute('aria-hidden', 'true');
    } else {
      labCliDrawer.classList.add('open');
      labCliDrawer.setAttribute('aria-hidden', 'false');
      setTimeout(() => {
        if (cliInput) cliInput.focus();
      }, 150);
    }
  }

  if (terminalTriggerBtn) terminalTriggerBtn.addEventListener('click', toggleTerminal);
  if (cliCloseBtn) cliCloseBtn.addEventListener('click', toggleTerminal);

  // Global keybinding: press `~` or `Alt+T` to toggle CLI
  window.addEventListener('keydown', (e) => {
    if (e.key === '`' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      toggleTerminal();
    }
    if (e.key === 'Escape') {
      if (telemetryModal && telemetryModal.classList.contains('active')) closeTelemetry();
      if (hypoModal && hypoModal.classList.contains('active')) hypoModal.classList.remove('active');
      if (labCliDrawer && labCliDrawer.classList.contains('open')) toggleTerminal();
    }
  });

  const cliCommands = {
    help: () => `
  Available Laboratory Commands:
    - <span class="cli-keyword">bio</span>: Display researcher credentials & dossier
    - <span class="cli-keyword">projects</span>: List all active & validated experiment specimens
    - <span class="cli-keyword">exp &lt;id&gt;</span>: Inspect telemetry for specific experiment (e.g., 'exp 401')
    - <span class="cli-keyword">skills</span>: List apparatus, core languages & frameworks
    - <span class="cli-keyword">ideas</span>: Inspect startup incubation backlog
    - <span class="cli-keyword">theme</span>: Toggle chamber theme (dark/light)
    - <span class="cli-keyword">sfx</span>: Toggle laboratory audio effects
    - <span class="cli-keyword">contact</span>: Transmit channel frequencies
    - <span class="cli-keyword">clear</span>: Clear terminal console
    `,
    bio: () => `
  [DOSSIER]: Arjun Mehta // BTech Computer Science & Engineering
  Specialization: Next-Gen Intelligent Systems, Distributed Systems, Startup MVPs
  Clearance: Level 4 // Facility: Bangalore Innovation Hub
  Philosophy: "Falsify early, iterate with extreme velocity"
    `,
    projects: () => `
  Active Experiment Specimens:
    [EXP-401] ApexVector: SIMD HNSW In-Memory Vector Index (Rust/WASM) [VALIDATED]
    [EXP-402] VenturePulse: AI Customer Discovery & Signal Analyzer [ACTIVE TRIALS]
    [EXP-403] SynapseMesh: Peer-to-Peer CRDT Document Engine [VALIDATED]
    [EXP-404] AutoSpec: Self-Healing Code Synthesis Harness [ITERATING V2]
    [EXP-405] ZeroSplit: Smart Contract Micro-Grant Escrow [VALIDATED]
    [EXP-406] AeroTelemetry: Edge Flight Logger for Micro-Drones [ACTIVE TESTING]
  Type 'exp 401' to inspect telemetry.
    `,
    skills: () => `
  Laboratory Apparatus Matrix:
    - Synthetics: TypeScript (95%), Python (92%), Rust (82%), C++ (80%), SQL (88%)
    - Vessels: React/Next.js (94%), FastAPI (92%), Node.js (90%), PyTorch (84%)
    - Chambers: Docker (89%), Git CI/CD (94%), AWS/Cloudflare (86%), Redis (85%)
    - Protocols: Hypothesis-Driven Dev (98%), Rapid 48h MVP (95%), Customer Discovery (90%)
    `,
    ideas: () => `
  Incubation Chamber Backlog:
    [01] HyperTrace: Distributed Edge Observability for Next.js (94% Feasibility)
    [02] CodeMentor AI: Real-Time Socratic Voice Agent for Students (88% Feasibility)
    [03] MicroVenture: Dynamic Copy Morphing for Solo Founders (91% Feasibility)
    [04] LocalShield: Zero-Knowledge Client-Side PII Guardrails (87% Feasibility)
    `,
    contact: () => `
  Transmission Channels:
    - Primary Frequency: arjun.lab@innovation.dev
    - Open Source Hub: github.com/arjun-innovates
    - Professional Uplink: linkedin.com/in/arjun-mehta-lab
    - Public Dispatch: @arjun_codes (X)
    `,
    theme: () => {
      if (themeToggleBtn) themeToggleBtn.click();
      return 'Chamber illumination toggled.';
    },
    sfx: () => {
      if (audioToggleBtn) audioToggleBtn.click();
      return `Audio SFX state: ${audio.enabled ? 'ONLINE' : 'MUTED'}`;
    },
    clear: () => {
      if (cliOutputHistory) cliOutputHistory.innerHTML = '';
      return '';
    }
  };

  if (cliInput) {
    cliInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const rawCmd = cliInput.value.trim();
        if (!rawCmd) return;

        audio.playClick();
        const cmdParts = rawCmd.split(' ');
        const primary = cmdParts[0].toLowerCase();
        const arg = cmdParts[1];

        // Print input prompt line
        const inputLine = document.createElement('div');
        inputLine.className = 'cli-line-out';
        inputLine.innerHTML = `<span class="cli-prompt">visitor@lab-node:~$</span> ${rawCmd}`;
        cliOutputHistory.appendChild(inputLine);

        // Process command
        let response = '';
        if (primary === 'clear') {
          cliCommands.clear();
        } else if (primary === 'exp') {
          const expId = `exp-${arg || '401'}`;
          if (projectTelemetryData[expId]) {
            openTelemetry(expId);
            response = `Opening telemetry chamber for ${expId.toUpperCase()}...`;
          } else {
            response = `Unknown experiment ID '${arg}'. Try: 'exp 401', 'exp 402', 'exp 403', 'exp 404', 'exp 405', 'exp 406'.`;
          }
        } else if (cliCommands[primary]) {
          response = cliCommands[primary]();
        } else {
          response = `Command '${primary}' unrecognized. Type <span class="cli-keyword">'help'</span> for instructions.`;
        }

        if (response) {
          const outLine = document.createElement('div');
          outLine.className = 'cli-line-out info';
          outLine.innerHTML = response;
          cliOutputHistory.appendChild(outLine);
        }

        cliInput.value = '';
        const screen = document.getElementById('cli-screen');
        if (screen) screen.scrollTop = screen.scrollHeight;
      }
    });
  }

  /* ===================================================================
     INITIALIZATION TELEMETRY GREETING IN CONSOLE
     =================================================================== */
  console.log(
    '%c [FACILITY-01] %c PERSONAL INNOVATION LABORATORY ONLINE ',
    'background: #00f5d4; color: #060911; font-weight: bold; border-radius: 2px;',
    'background: #0c1220; color: #00f5d4; font-family: monospace;'
  );
  console.log('Specimen: Arjun Mehta (BTech CSE Technologist)');
  console.log('Press ` to toggle interactive laboratory terminal.');

})();
