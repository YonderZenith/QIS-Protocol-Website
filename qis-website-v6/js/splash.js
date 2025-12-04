// js/splash.js - Enhanced Splash Screen with Network Visualization

// ==================== NETWORK VISUALIZATION ====================
class QISNetwork {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.connections = [];
    this.resize();
    this.init();

    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    const particleCount = Math.min(80, Math.floor(window.innerWidth / 20));

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
  }

  update() {
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Wrap around edges
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;
    });

    // Update connections
    this.connections = [];
    const maxDistance = 150;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          this.connections.push({
            p1: this.particles[i],
            p2: this.particles[j],
            opacity: (1 - distance / maxDistance) * 0.4
          });
        }
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw connections
    this.connections.forEach(conn => {
      this.ctx.strokeStyle = `rgba(0, 190, 234, ${conn.opacity})`;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(conn.p1.x, conn.p1.y);
      this.ctx.lineTo(conn.p2.x, conn.p2.y);
      this.ctx.stroke();
    });

    // Draw particles
    this.particles.forEach(particle => {
      this.ctx.fillStyle = `rgba(0, 217, 255, ${particle.opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Glow effect
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = 'rgba(0, 217, 255, 0.8)';
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// ==================== AUDIO SYSTEM ====================
class AudioSystem {
  constructor() {
    this.synth = window.speechSynthesis;
    this.enabled = true;
    this.voicesLoaded = false;

    // Check if voices are already loaded
    if (this.synth.getVoices().length > 0) {
      this.voicesLoaded = true;
    }

    // Listen for voices to load (Chrome needs this)
    this.synth.addEventListener('voiceschanged', () => {
      this.voicesLoaded = true;
    });
  }

  // Wait for voices to be available
  waitForVoices() {
    return new Promise((resolve) => {
      if (this.voicesLoaded || this.synth.getVoices().length > 0) {
        this.voicesLoaded = true;
        resolve();
        return;
      }

      const checkVoices = () => {
        if (this.synth.getVoices().length > 0) {
          this.voicesLoaded = true;
          resolve();
        } else {
          setTimeout(checkVoices, 100);
        }
      };
      checkVoices();
    });
  }

  async speak(text, options = {}) {
    if (!this.enabled || !this.synth) return;

    // Wait for voices to load (especially important for Chrome)
    await this.waitForVoices();

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 0.7;

    // Use browser's default voice

    this.synth.speak(utterance);
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.synth.cancel();
    }
  }
}

// ==================== STATS COUNTER ====================
class StatsCounter {
  constructor(elementId, targetValue, duration = 2000) {
    this.element = document.getElementById(elementId);
    this.targetValue = targetValue;
    this.duration = duration;
    this.currentValue = 0;
  }

  animate(delay = 0) {
    setTimeout(() => {
      const startTime = Date.now();
      const startValue = 0;
      const endValue = this.targetValue;

      const updateCounter = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / this.duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);

        this.currentValue = Math.floor(startValue + (endValue - startValue) * easeOut);
        this.element.textContent = this.currentValue.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          this.element.textContent = endValue.toLocaleString();
        }
      };

      updateCounter();
    }, delay);
  }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
  // Initialize network visualization
  const canvas = document.getElementById('networkCanvas');
  if (canvas) {
    const network = new QISNetwork(canvas);
    network.animate();
  }

  // Initialize audio system
  const audioSystem = new AudioSystem();

  // Force Chrome to load voices early
  if (audioSystem.synth) {
    audioSystem.synth.getVoices();
  }

  // Speak introduction on first click anywhere on splash
  let introSpoken = false;
  const splashEl = document.getElementById('splash');
  const clickHint = document.getElementById('clickHint');

  if (splashEl) {
    splashEl.addEventListener('click', function introClick(e) {
      // Don't trigger if clicking the enter button
      if (e.target.id === 'enterBtn') return;

      if (!introSpoken) {
        introSpoken = true;
        // Hide the click hint
        if (clickHint) {
          clickHint.style.opacity = '0';
          clickHint.style.transition = 'opacity 0.5s';
        }
        audioSystem.speak('Initializing QIS Protocol. Quadratic Intelligence Swarm. Welcome to the future of distributed intelligence.', {
          rate: 0.95,
          pitch: 1.1
        });
      }
    }, { once: false });
  }

  // Initialize stats counters
  const agentsCounter = new StatsCounter('statAgents', 10000, 2500);
  const synthesisCounter = new StatsCounter('statSynthesis', 49995000, 2500);
  const patentsCounter = new StatsCounter('statPatents', 39, 2500);

  // Start counters after content fades in
  setTimeout(() => {
    agentsCounter.animate(0);
    synthesisCounter.animate(200);
    patentsCounter.animate(400);
  }, 7000);

  // Enter button functionality
  const enterBtn = document.getElementById('enterBtn');
  const splash = document.getElementById('splash');
  const main = document.getElementById('main');

  if (enterBtn && splash && main) {
    enterBtn.addEventListener('click', function() {
      // Stop any ongoing speech
      audioSystem.synth.cancel();

      // Speak welcome message
      audioSystem.speak('Welcome to the swarm. The revolution begins.', {
        rate: 0.95,
        pitch: 1.1
      });

      // Fade out splash
      splash.style.transition = 'opacity 0.8s ease-out';
      splash.style.opacity = '0';

      setTimeout(() => {
        splash.classList.add('hidden');
        main.classList.remove('hidden');

        // Fade in main content
        main.style.opacity = '0';
        main.style.transition = 'opacity 0.8s ease-in';
        setTimeout(() => {
          main.style.opacity = '1';
        }, 50);

        // Scroll to top
        window.scrollTo(0, 0);
      }, 800);
    });
  }

  // Optional: Add mute button functionality if you want to add one later
  window.toggleAudio = function() {
    audioSystem.toggle();
  };
});
