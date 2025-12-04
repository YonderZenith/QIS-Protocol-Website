// QIS Protocol - ULTRA-ENHANCED JavaScript
// Persistent Network Background + Advanced Interactions + All Original Functionality

// ==================== PERSISTENT NETWORK BACKGROUND ====================
class PersistentNetwork {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'persistentNetwork';
    this.ctx = this.canvas.getContext('2d');
    document.body.insertBefore(this.canvas, document.body.firstChild);
    
    this.particles = [];
    this.connections = [];
    this.mouse = { x: 0, y: 0 };
    this.time = 0;
    
    this.resize();
    this.init();
    
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    
    this.animate();
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = document.documentElement.scrollHeight;
  }
  
  init() {
    const particleCount = Math.min(60, Math.floor(window.innerWidth / 25));
    
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.2,
        hue: 180 + Math.random() * 40
      });
    }
  }
  
  update() {
    this.time += 0.016;
    
    // Update particle positions
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Wrap around edges
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;
      
      // Mouse attraction (subtle)
      const dx = this.mouse.x - particle.x;
      const dy = this.mouse.y - particle.y + window.scrollY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 200) {
        const force = (200 - dist) / 200 * 0.01;
        particle.vx += dx * force * 0.001;
        particle.vy += dy * force * 0.001;
      }
      
      // Limit velocity
      const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      if (speed > 0.5) {
        particle.vx *= 0.95;
        particle.vy *= 0.95;
      }
    });
    
    // Update connections
    this.connections = [];
    const maxDistance = 180;
    
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          this.connections.push({
            p1: this.particles[i],
            p2: this.particles[j],
            opacity: (1 - distance / maxDistance) * 0.3
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
      this.ctx.lineWidth = 0.8;
      this.ctx.beginPath();
      this.ctx.moveTo(conn.p1.x, conn.p1.y);
      this.ctx.lineTo(conn.p2.x, conn.p2.y);
      this.ctx.stroke();
    });
    
    // Draw particles
    this.particles.forEach(particle => {
      // Glow effect
      const gradient = this.ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.radius * 3
      );
      gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 60%, ${particle.opacity})`);
      gradient.addColorStop(1, `hsla(${particle.hue}, 100%, 60%, 0)`);
      
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    });
  }
  
  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// ==================== PARTICLE BURST SYSTEM ====================
class ParticleBurst {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.particles = [];
    this.particleCount = options.count || 20;
    this.colors = options.colors || ['#00D9FF', '#8B5CF6', '#10B981'];
    
    this.create();
    this.animate();
  }
  
  create() {
    for (let i = 0; i < this.particleCount; i++) {
      const angle = (Math.PI * 2 * i) / this.particleCount;
      const velocity = 2 + Math.random() * 2;
      
      this.particles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        radius: 2 + Math.random() * 2,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        opacity: 1,
        life: 1
      });
    }
  }
  
  animate() {
    const animateFrame = () => {
      this.particles = this.particles.filter(particle => particle.life > 0);
      
      if (this.particles.length === 0) return;
      
      this.particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // Gravity
        particle.life -= 0.02;
        particle.opacity = particle.life;
        
        // Create DOM element
        const el = document.createElement('div');
        el.style.cssText = `
          position: fixed;
          left: ${particle.x}px;
          top: ${particle.y}px;
          width: ${particle.radius * 2}px;
          height: ${particle.radius * 2}px;
          background: ${particle.color};
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          box-shadow: 0 0 10px ${particle.color};
          opacity: ${particle.opacity};
        `;
        document.body.appendChild(el);
        
        setTimeout(() => el.remove(), 50);
      });
      
      requestAnimationFrame(animateFrame);
    };
    
    animateFrame();
  }
}

// ==================== 3D CARD EFFECTS ====================
function init3DCards() {
  const cards = document.querySelectorAll('.card, .industry-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      card.style.transform = `
        translateY(-15px) 
        scale(1.02) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg)
      `;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ==================== WAIT FOR DOM ====================
document.addEventListener('DOMContentLoaded', function() {

  // Initialize persistent network background
  const persistentNetwork = new PersistentNetwork();
  
  // Initialize 3D card effects
  setTimeout(() => init3DCards(), 1000);

  // ==================== SPLASH → MAIN TRANSITION ====================
  const enterBtn = document.getElementById('enterBtn');
  const splash = document.getElementById('splash');
  const main = document.getElementById('main');

  if (enterBtn && splash && main) {
    enterBtn.addEventListener('click', () => {
      splash.classList.add('hidden');
      main.classList.remove('hidden');
      
      // Trigger initial animations
      setTimeout(() => {
        initScrollAnimations();
        persistentNetwork.resize(); // Recalculate for main content
      }, 100);
    });
  } else {
    console.error('Missing splash elements:', {enterBtn, splash, main});
  }

  // ==================== EPIPHANY GENERATOR ====================
  const explanations = [
    "THE METCALFE'S LAW BREAKTHROUGH: Networks become more valuable as they grow—that's Metcalfe's Law: value = N². QIS does this for intelligence, not just connections. Every new node adds N new pattern synthesis opportunities. 1,000 cancer patients create 499,500 opportunities. 10,000 create 49,995,000. Intelligence grows quadratically while each agent only talks to log N neighbors. We just found the Metcalfe's Law equivalent for distributed AI.",

    "THE GOOGLE PAGERANK MOMENT: Before Google, search engines counted keywords. Google said: 'What if we count who links to whom?' QIS does the same for intelligence. Instead of centralized AI learning from data, we use the network structure itself. Each agent creates a 'fingerprint' of what it knows. Similar fingerprints cluster via hash routing. The network IS the intelligence. We built simulations up to 100,000 nodes. R²=1.0. The math is perfect.",

    "THE INTERNET VS. INTRANET: Centralized AI is like building an 'intranet' for intelligence—all data flows to one server. QIS is building 'the internet' for intelligence—each device is a node, nodes share fingerprints (not raw data), they find similar nodes peer-to-peer. Just like the internet beat intranets by being distributed and fault-tolerant, distributed intelligence beats centralized AI by being privacy-preserving, infinitely scalable, and immune to single points of failure.",

    "THE TCP/IP MOMENT: TCP/IP didn't care what you built on top—just packets, addressing, routing. QIS is TCP/IP for distributed intelligence. Layers: (1) Data ingestion, (2) Embedding creation, (3) Hash routing via DHT, (4) Pattern synthesis. Domain-agnostic. We built 39 patent applications across healthcare, agriculture, IoT, smart cities, finance, climate. The math is the same. Only the embedding function changes.",

    "THE WAZE EPIPHANY: Before Waze, traffic apps used centralized data. Waze said: 'What if every driver's phone becomes a sensor?' Suddenly millions of real-time data points. QIS says: 'What if every patient's phone becomes a research node?' Millions of real-time treatment outcomes. The network IS the intelligence. Waze gave us distributed traffic intelligence. QIS gives us distributed everything intelligence.",

    "THE LIBRARY OF ALEXANDRIA PROBLEM: Ancient Alexandria tried to collect all knowledge in one place. It burned down. We lost centuries of wisdom. We're doing it again with centralized AI models. QIS solution: Distributed intelligence. No central server. No single point of failure. Every node keeps its own data. Intelligence emerges from connections, not accumulation. Byzantine fault tolerance: even with 30% adversarial nodes, QIS maintains 100% accuracy.",

    "THE WIKIPEDIA INSIGHT: Wikipedia became the most comprehensive encyclopedia because the crowd knew more than the experts. QIS scales intelligence from centralized to distributed, linear to quadratic. 100 Wikipedia editors write 100 articles. 100 QIS nodes create 4,950 synthesis opportunities. 1,000 nodes create 499,500 opportunities. That's the N² effect.",

    "THE BITTORRENT REVELATION: BitTorrent made systems faster as more people joined. QIS does for intelligence what BitTorrent did for file sharing: makes the system smarter as more participants join. 10 agents = 33 messages per agent. 10,000 agents = 133 messages per agent. 1,000x more agents = only 4x more messages. Meanwhile: 10 agents = 45 synthesis opportunities. 10,000 agents = 49,995,000 opportunities. That's quadratic intelligence with logarithmic cost.",

    "THE BRAIN ANALOGY: Your brain has 86 billion neurons, ~86 trillion connections. The intelligence isn't in the neurons—it's in the connections. QIS is the internet-scale equivalent. Distributed. Fault-tolerant. Quadratically scalable. N agents → N(N-1)/2 connections → N² intelligence scaling. Just like your brain: neurons → synapses → cognition.",

    "THE GPS CONSTELLATION: GPS proved you can build global infrastructure without central control—just broadcast signals and let receivers synthesize. QIS does the same for intelligence. No central AI. Just agents broadcasting embeddings and receivers synthesizing insights. GPS = 24 satellites, global coverage. QIS = unlimited agents, global intelligence.",

    "THE TINDER/DATING APP INSIGHT: Finding compatible partners in a city of 1 million people—you can't meet everyone. QIS uses hash-based routing. Your 'profile' (embedding) gets hashed → clusters near compatible matches. No central database. No privacy loss. Logarithmic search, quadratic opportunities. QIS is Tinder for any distributed matching problem: medical, agricultural, financial. N² matching opportunities with log N search cost.",

    "THE ANTIBODY RESPONSE: Your immune system doesn't have one giant antibody—it has millions of specialized ones. When a pathogen enters, compatible antibodies recognize it via shape complementarity. QIS: millions of specialized agents. When a query enters, compatible agents match via hash similarity, synthesize patterns. Nature already figured out distributed intelligence is better than centralized. We just formalized it mathematically.",

    "THE UNIX PHILOSOPHY: 'Do one thing well. Compose small tools.' Pipe them together: cat | grep | sort | uniq. QIS philosophy: Don't build one giant AI. Build distributed agents that do one thing well and compose via protocol. UNIX revolutionized computing by making systems composable. QIS revolutionizes intelligence by making agents composable.",

    "THE REDDIT/STACK OVERFLOW MOMENT: The collective knows more than any individual. Reddit/Stack Overflow aggregate answers from thousands. QIS is active intelligence—the network synthesizes new insights in real-time by comparing your situation to similar situations. Cancer patient asks: 'What treatment worked for people like me?' QIS finds 500 similar patients, synthesizes outcomes, ranks treatments by success rate. All in real-time. All privacy-preserving.",

    "THE SCIENTIFIC LITERATURE CRISIS: Science publishes 2.5 million papers per year. A cancer researcher might find a relevant insight in an agricultural biology paper—but they'd never find it. QIS solution: Distributed pattern synthesis. Pattern similarity transcends domain boundaries. We just built a system that connects knowledge across domains automatically. With N² synthesis opportunities, adding one paper creates N new potential connections.",

    "THE FOLDING@HOME INSIGHT: Folding@home = 200,000 volunteers → 1.5 exaFLOPS. More powerful than top 500 supercomputers combined. From distributed volunteered compute. QIS = distributed intelligence. Every device contributes. Folding@home proved distributed compute beats centralized compute. QIS proves distributed intelligence beats centralized intelligence. Same principle, different layer.",

    "THE SELF-DRIVING CAR NETWORK: Current approach: Each car has its own AI. Tesla collects data centrally. QIS approach: Each car is a node. Cars share embeddings via hash routing. Your Tesla encounters ice at 6am, creates embedding. Other Teslas on similar roads receive this via DHT, adjust before encountering ice. With 1 million Teslas: 500 billion synthesis opportunities. Every car benefits from every other car's experience. A perfect underlying system for autonomous vehicle networks.",

    "THE BLACK SWAN INSIGHT: Traditional AI trains on common cases. Rare events are invisible—not enough data. A rare cancer mutation with only 50 cases worldwide? QIS solution: Those 50 patients become nodes, share embeddings, find each other via hash routing. 50 patients → 1,225 synthesis opportunities. QIS makes rare events visible. Black swans cluster together in hash space.",

    "THE GITHUB FOR INTELLIGENCE: GitHub's value = network effects. More developers → more projects → more valuable. QIS value = N² network effects. More agents → quadratically more synthesis opportunities → quadratically more valuable. We just built 'GitHub for intelligence.' Distributed. Open architecture. Anyone can contribute. The network owns the intelligence, not one company.",

    "THE PROOF OF WORK INSIGHT: Bitcoin: How do you get strangers to agree on truth without central authority? Proof of Work. QIS: How do you prevent adversarial agents from corrupting the network? Structural validation. 5-layer defense: DHT verification, dimensional integrity, timestamp verification, cryptographic signatures, outcome consistency. Bad patterns can't fake similarity hashes. Test: 30% adversarial nodes → 100% rejection rate. The network self-heals.",

    "THE COMPRESSION INSIGHT: Intelligence is pattern recognition. Centralized AI: compress N data points into one model. QIS: find N(N-1)/2 patterns across N agents. For N=1,000: Centralized gets 1,000 data points. QIS gets 499,500 pairwise comparisons. We just proved distributed pattern finding is mathematically superior to centralized model training for extracting relational information.",

    "THE MYCELIUM NETWORK: Trees in forests are connected by mycelium underground. Trees share nutrients. The forest is one organism. No central brain. Distributed communication via chemical signals. QIS is the digital version. Agents connected by hash routing (digital mycelium). Nature already built distributed intelligence at planetary scale. Forests with mycelium networks are 30% more resilient. Distributed intelligence works in nature. We're just formalizing it.",

    "THE E=mc² SIMPLICITY: Einstein saw a simple relationship: E=mc². QIS isn't complicated ML architecture. It's one simple insight: I(N) = Θ(N²). Intelligence scales quadratically when agents share embeddings. Three variables: N (agents), I (synthesis opportunities), Complexity (O(log N) per agent). One relationship: I ∝ N². We tested it on 100,000-node simulations. R²=1.0. The relationship is exact.",

    "THE FINAL BOSS REVEAL: Distributed intelligence is fundamentally superior to centralized intelligence. Proof: Scalability (N² vs N), Privacy (no centralized honeypot), Resilience (no single point of failure), Speed (log N communication), Emergence (intelligence from connections). We proved it mathematically. O(N²) scaling with O(log N) communication. Validated with simulations up to 100,000 nodes. R²=1.0. This isn't a product. This is infrastructure. Like TCP/IP for the internet, HTTP for the web, QIS for distributed intelligence. The math is public. The patents protect implementation. Either prove me wrong or help me build it."
  ];

  let current = Math.floor(Math.random() * explanations.length);
  const newEpiphanyBtn = document.getElementById('newEpiphany');
  const explanationText = document.getElementById('explanation');

  if (newEpiphanyBtn && explanationText) {
    // Set initial explanation
    explanationText.textContent = explanations[current];
    
    newEpiphanyBtn.addEventListener('click', () => {
      // Create particle burst
      const rect = newEpiphanyBtn.getBoundingClientRect();
      new ParticleBurst(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        { count: 30, colors: ['#10B981', '#00D9FF', '#8B5CF6'] }
      );
      
      // Fade out
      explanationText.style.opacity = '0';
      explanationText.style.transform = 'translateY(30px) scale(0.98)';
      explanationText.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      
      setTimeout(() => {
        current = (current + 1) % explanations.length;
        explanationText.textContent = explanations[current];
        
        // Fade in
        explanationText.style.opacity = '1';
        explanationText.style.transform = 'translateY(0) scale(1)';
      }, 400);
    });
  }

  // ==================== SCROLL-TRIGGERED ANIMATIONS ====================
  function initScrollAnimations() {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -80px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          
          // Animate cards within the section with stagger
          const cards = entry.target.querySelectorAll('.card, .industry-card');
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.style.opacity = '0';
              card.style.transform = 'translateY(40px) scale(0.95)';
              setTimeout(() => {
                card.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
              }, 50);
            }, index * 120);
          });
          
          // Unobserve after animation
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll('header, section, footer');
    sections.forEach(section => {
      observer.observe(section);
    });
  }

  // ==================== SMOOTH SCROLL FOR ANCHORS ====================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // ==================== INITIALIZE IF MAIN IS VISIBLE ====================
  if (main && !main.classList.contains('hidden')) {
    initScrollAnimations();
  }

  // ==================== BUTTON PARTICLE EFFECTS ====================
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
      const button = e.target.classList.contains('btn') ? e.target : e.target.closest('.btn');
      const rect = button.getBoundingClientRect();
      
      new ParticleBurst(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        { count: 25, colors: ['#00D9FF', '#8B5CF6', '#10B981'] }
      );
    }
  });

}); // End DOMContentLoaded

// ==================== GLOBAL FUNCTIONS ====================

// Copy prompt function
function copyToClipboard() {
  const textarea = document.getElementById('copyPrompt');
  if (textarea) {
    textarea.select();
    document.execCommand('copy');
    
    // Create particle burst
    const rect = textarea.getBoundingClientRect();
    new ParticleBurst(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      { count: 40, colors: ['#10B981', '#00D9FF'] }
    );
    
    // Visual feedback
    textarea.style.borderColor = '#10B981';
    textarea.style.boxShadow = '0 0 60px rgba(16, 185, 129, 1)';
    
    setTimeout(() => {
      textarea.style.borderColor = '';
      textarea.style.boxShadow = '';
    }, 500);
    
    alert('✓ Prompt copied to clipboard!');
  }
}

// Share functions
function share(platform) {
  const text = "Just discovered QIS Protocol – Quadratic Intelligence Swarm with Θ(N²) scaling and O(log N) communication. This changes everything. https://yonderzenith.com";
  const url = "https://yonderzenith.com";
  const subject = "QIS Protocol - Quadratic Intelligence Scaling";
  const body = "I just discovered the QIS Protocol - a revolutionary breakthrough in distributed intelligence that scales quadratically (N²) while keeping communication logarithmic (log N). This is the TCP/IP moment for distributed AI. Check it out: https://yonderzenith.com";

  if (platform === 'x') {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  }
  else if (platform === 'facebook') {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  }
  else if (platform === 'spread') {
    // Create modal with share links
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.96);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.4s ease;
      backdrop-filter: blur(10px);
    `;
    
    modal.innerHTML = `
      <div style="
        background: linear-gradient(135deg, rgba(0, 190, 234, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
        padding: 60px;
        border-radius: 24px;
        max-width: 600px;
        width: 90%;
        border: 3px solid #00BEEA;
        box-shadow: 0 0 80px rgba(0, 190, 234, 0.6);
        position: relative;
        backdrop-filter: blur(20px);
      ">
        <h2 style="
          color: #00BEEA;
          margin-bottom: 40px;
          text-align: center;
          font-family: 'Orbitron', sans-serif;
          font-size: 2.5rem;
          text-shadow: 0 0 30px rgba(0, 190, 234, 0.8);
        ">Share QIS Protocol</h2>
        
        <div style="display: flex; flex-direction: column; gap: 22px;">
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}" 
             target="_blank" 
             style="
               background: linear-gradient(135deg, #00BEEA, #00D9FF);
               color: #fff;
               padding: 22px;
               border-radius: 16px;
               text-decoration: none;
               text-align: center;
               font-weight: bold;
               font-family: 'Orbitron', sans-serif;
               box-shadow: 0 0 30px rgba(0, 190, 234, 0.6);
               transition: all 0.4s ease;
               letter-spacing: 2px;
               font-size: 1.1rem;
             "
             onmouseover="this.style.transform='translateY(-5px) scale(1.02)'; this.style.boxShadow='0 0 50px rgba(0, 217, 255, 1)';"
             onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 0 30px rgba(0, 190, 234, 0.6)';">
            🐦 Share on X (Twitter)
          </a>
          
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" 
             target="_blank" 
             style="
               background: linear-gradient(135deg, #00BEEA, #00D9FF);
               color: #fff;
               padding: 22px;
               border-radius: 16px;
               text-decoration: none;
               text-align: center;
               font-weight: bold;
               font-family: 'Orbitron', sans-serif;
               box-shadow: 0 0 30px rgba(0, 190, 234, 0.6);
               transition: all 0.4s ease;
               letter-spacing: 2px;
               font-size: 1.1rem;
             "
             onmouseover="this.style.transform='translateY(-5px) scale(1.02)'; this.style.boxShadow='0 0 50px rgba(0, 217, 255, 1)';"
             onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 0 30px rgba(0, 190, 234, 0.6)';">
            📘 Share on Facebook
          </a>
          
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}" 
             target="_blank" 
             style="
               background: linear-gradient(135deg, #00BEEA, #00D9FF);
               color: #fff;
               padding: 22px;
               border-radius: 16px;
               text-decoration: none;
               text-align: center;
               font-weight: bold;
               font-family: 'Orbitron', sans-serif;
               box-shadow: 0 0 30px rgba(0, 190, 234, 0.6);
               transition: all 0.4s ease;
               letter-spacing: 2px;
               font-size: 1.1rem;
             "
             onmouseover="this.style.transform='translateY(-5px) scale(1.02)'; this.style.boxShadow='0 0 50px rgba(0, 217, 255, 1)';"
             onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 0 30px rgba(0, 190, 234, 0.6)';">
            💼 Share on LinkedIn
          </a>
          
          <a href="mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}" 
             style="
               background: linear-gradient(135deg, #00BEEA, #00D9FF);
               color: #fff;
               padding: 22px;
               border-radius: 16px;
               text-decoration: none;
               text-align: center;
               font-weight: bold;
               font-family: 'Orbitron', sans-serif;
               box-shadow: 0 0 30px rgba(0, 190, 234, 0.6);
               transition: all 0.4s ease;
               letter-spacing: 2px;
               font-size: 1.1rem;
             "
             onmouseover="this.style.transform='translateY(-5px) scale(1.02)'; this.style.boxShadow='0 0 50px rgba(0, 217, 255, 1)';"
             onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 0 30px rgba(0, 190, 234, 0.6)';">
            ✉️ Share via Email
          </a>
          
          <button 
             onclick="this.closest('div').parentElement.parentElement.remove()" 
             style="
               background: rgba(139, 92, 246, 0.3);
               color: #E8F5E9;
               padding: 18px;
               border: 2px solid #8B5CF6;
               border-radius: 16px;
               cursor: pointer;
               margin-top: 20px;
               font-weight: bold;
               font-family: 'Orbitron', sans-serif;
               transition: all 0.3s ease;
               letter-spacing: 2px;
               font-size: 1rem;
             "
             onmouseover="this.style.background='#8B5CF6'; this.style.transform='scale(1.02)';"
             onmouseout="this.style.background='rgba(139, 92, 246, 0.3)'; this.style.transform='scale(1)';">
            Close
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
}

// ==================== CURSOR TRAIL EFFECT ====================
let cursorTrail = [];
const maxTrailLength = 20;

document.addEventListener('mousemove', (e) => {
  cursorTrail.push({ x: e.clientX, y: e.clientY, time: Date.now() });
  
  if (cursorTrail.length > maxTrailLength) {
    cursorTrail.shift();
  }
  
  // Create trail particle occasionally
  if (Math.random() < 0.1) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      width: 3px;
      height: 3px;
      background: rgba(0, 217, 255, 0.6);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      box-shadow: 0 0 10px rgba(0, 217, 255, 0.8);
    `;
    document.body.appendChild(particle);
    
    setTimeout(() => {
      particle.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      particle.style.opacity = '0';
      particle.style.transform = 'scale(0)';
      setTimeout(() => particle.remove(), 500);
    }, 50);
  }
});
