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
    this.isRunning = true; // Controls animation loop

    this.resize();
    this.init();
    this.setupVisibilityOptimization();

    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    this.animate();
  }

  setupVisibilityOptimization() {
    // Pause when tab is not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isRunning = false;
      } else {
        this.isRunning = true;
        this.animate(); // Restart animation loop
      }
    });

    // Pause when canvas is scrolled out of view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !document.hidden) {
          if (!this.isRunning) {
            this.isRunning = true;
            this.animate(); // Restart animation loop
          }
        } else {
          this.isRunning = false;
        }
      });
    }, { threshold: 0 });

    observer.observe(this.canvas);
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
    if (!this.isRunning) return; // Stop loop when not visible
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
    "THE MAILBOX INSIGHT: QIS is not a search engine. It is a mailbox system. Every node deposits a ~512-byte outcome packet at a deterministic address defined by the clinical question — condition + treatment + outcome type. When a new node arrives with the same question, it opens the mailbox. The mailbox is already full. Hundreds of outcome notes from nodes that solved this problem before you. No compute happens at query time. You are reading mail, not asking a question. Then your outcome becomes a new letter in the mailbox for the next node. The network gets smarter every time someone reads from it AND acts.",

    "THE TCP/IP MOMENT: TCP/IP did not invent data transmission, addressing, or error correction. It combined them into a protocol that scaled globally. QIS did not invent data aggregation, similarity matching, DHT routing, outcome packets, or local synthesis. It combined them into a closed loop that produces quadratic intelligence at logarithmic cost. Every component existed. The architecture is the discovery. Christopher Thomas Trevethan saw how they fit together on June 16, 2025. The loop is what was missing.",

    "THE N(N-1)/2 FACT: This is not a claim. It is arithmetic. N nodes create N(N-1)/2 unique pairs. 10 nodes = 45 pairs. 100 nodes = 4,950 pairs. 1,000 nodes = 499,500 pairs. In a hub-and-spoke system, you get N data points. In QIS, you get N(N-1)/2 synthesis opportunities. At 1,000 nodes, that is 499 times more intelligence from the same number of participants. The communication cost per node: O(log N) or better. The gap between quadratic intelligence and logarithmic cost widens with every node added.",

    "THE WAZE EPIPHANY: Before Waze, traffic apps used centralized data. Waze said: what if every driver becomes a sensor? Millions of real-time data points emerged. QIS says: what if every edge node becomes a research contributor? Every validated outcome — distilled to a ~512-byte packet, no raw data — routes to every other node managing similar problems. The network IS the intelligence. Waze gave us distributed traffic routing. QIS gives us distributed outcome routing. Same principle, any domain, same math.",

    "THE BRAIN PARALLEL: Your brain has 86 billion neurons and roughly 86 trillion synaptic connections. The intelligence is not in the neurons — it is in the connections between them. QIS is this principle at network scale. N nodes create N(N-1)/2 pairwise synthesis paths. The intelligence is not in any single node's data. It is in the synthesis that emerges when every pair of nodes with similar problems learns from each other. Neurons fire. Synapses learn. Nodes deposit. The network synthesizes.",

    "THE BITTORRENT REVELATION: BitTorrent made file sharing faster as more people joined — every downloader became an uploader. QIS makes intelligence richer as more nodes join — every consumer of insight becomes a producer of insight. 10 nodes = 45 synthesis paths. 10,000 nodes = 49,995,000 synthesis paths. 1,000 times more nodes = 1,111,000 times more intelligence. But communication per node grows only as log N. That is the scaling law: quadratic intelligence, logarithmic cost.",

    "THE PRIVACY INVERSION: Every other distributed system asks: how do we protect the data that flows between nodes? Federated learning adds differential privacy noise. Secure aggregation uses cryptographic masking. Homomorphic encryption computes on ciphertext. All of them protect data that IS present in the communication. QIS asks a different question: what if the data was never in the communication? Each edge distills its outcome locally into a ~512-byte outcome packet — a condition code, a treatment code, an outcome delta, a confidence indicator. No patient records. No model gradients. No identifiable information. Privacy by architecture — not by policy, not by encryption, but by construction.",

    "THE RARE DISEASE ARGUMENT: Federated learning requires large cohorts at each site to compute stable gradients. A hospital with 3 rare disease patients cannot contribute. Under QIS, those 3 patients produce 3 validated outcome packets that route to every other hospital managing the same condition. 30 hospitals with 2-15 patients each create a distributed case series of hundreds of observations — built from the protocol, not from a researcher designing a study. The sites with the rarest patients are the most informationally valuable. QIS is the only architecture that includes them instead of excluding them.",

    "THE RADIO TELESCOPE PARALLEL: VLBI (Very Long Baseline Interferometry) correlates signals from telescope pairs across continents. For N telescopes: N(N-1)/2 baseline correlations. The SKA will have 131,072 antennas generating 700 petabytes per year. The data cannot be centralized — it is physically impossible. So they federate: process locally, route results to regional centres. QIS solves the identical problem for any domain. N distributed nodes, N(N-1)/2 synthesis opportunities, raw data never moves, only distilled outcomes route. The math does not care whether the nodes are hospitals or telescopes.",

    "THE BETWEEN-STUDIES GAP: OHDSI has 300+ data partners and 2.1 billion patient records. They run federated queries beautifully. But between studies, the network is silent. Site A discovers something on Monday. Site B runs the same study six months later and starts from zero. QIS fills the silence. After every validated analysis, the outcome routes continuously via semantic addressing. The next study at any site starts with the accumulated intelligence from every previous study at every other site. The network learns between studies, not just during them.",

    "THE DISTILLATION STEP: This is what breaks the O(N squared) communication barrier. Instead of shipping raw datasets for pairwise comparison, each edge compresses what it learned into a ~512-byte outcome packet — a condition code, a treatment code, an outcome delta, a confidence indicator. One edge, one outcome, one packet. The information density is maximized. The transmission cost is constant per packet. Whether the edge is a patient's phone or a hospital system, the packet is the same ~512 bytes. This is why QIS achieves O(log N) or better communication where naive approaches require O(N squared).",

    "THE CLOSED LOOP: Distill locally. Fingerprint semantically. Route to matching addresses. Synthesize locally. Act. Your action produces a new outcome. Distill again. Route again. The loop never stops. Each cycle compounds the intelligence in the network. This is not deposit-then-query. It is deposit-query-act-deposit-query-act, continuously. Without the loop, QIS is a smart database. With it, QIS is a learning network. The breakthrough is the complete loop — not any single component inside it.",

    "THE SEMANTIC ADDRESS: In QIS, every outcome packet has a deterministic address computed from what it describes — not where it came from. A treatment outcome for Type 2 diabetes on metformin has the same semantic address whether it originates in Dublin, Columbus, or Bangalore. Two nodes working on the same clinical question produce the same fingerprint independently, without communicating. The address space already exists in every hospital that uses SNOMED CT, RxNorm, or ICD-10. QIS does not require a new vocabulary. It routes using the vocabulary clinicians already maintain.",

    "THE MYCELIUM NETWORK: Trees in a forest are connected underground by mycelium. One tree under attack sends chemical signals through the network. Neighboring trees boost their defenses before the threat arrives. No central brain. No central server. Distributed intelligence at ecosystem scale. QIS is the digital equivalent. Nodes connected by semantic routing. A hospital that encounters a rare adverse drug reaction deposits the signal. Every hospital managing similar patients receives it. The forest already solved distributed intelligence. QIS formalized the math.",

    "THE COMPUTE INVERSION: Centralized AI: move all data to one place, apply massive compute, produce one model. Cost scales with data volume. QIS: keep data in place, distill outcomes locally, route 512-byte packets, synthesize at the edge. The heavy computation happened at each node during the original analysis. The routing is just opening a mailbox. There is no GPU farm. There is no training run. There is no central anything. Intelligence emerges from the routing topology, not from compute power.",

    "THE HUMANITARIAN MATH: QIS is free forever for nonprofits, research institutions, and educational use. This is not charity — it is architecture. The protocol works better when more nodes participate. Excluding nodes by price makes the network less intelligent. Including them makes it more intelligent. A rural clinic in a low-income country has patients no one else sees. Their data is the most informationally rare. Pricing them out does not just harm them — it harms the entire network. The licensing follows the math.",

    "THE YAO BOUNDS ANSWER: A common objection: quadratic intelligence with subquadratic compute violates known lower bounds. Yao's communication complexity proves you cannot compute arbitrary pairwise functions over private inputs without O(N squared) communication. But QIS does not compute pairwise functions over private inputs. It routes pre-distilled, fixed-size public packets through a semantically indexed address space. The distillation step is local — no communication. The routing is O(log N) or better per query — not O(N). The synthesis operates on public outcome packets — not private data. The objection applies to a different architecture.",

    "THE DOMAIN SWAP: Healthcare outcome routing. Agricultural yield routing. Radio telescope correlation routing. Autonomous vehicle experience routing. Supply chain intelligence routing. Financial fraud signal routing. Climate sensor synthesis routing. The architecture is identical in every case: N nodes generate validated outcomes, distill to fixed-size packets, fingerprint by semantic content, route to matching addresses, synthesize locally. Change three strings — the situation description, the address fields, and the outcome format. The math does not change. The protocol does not change. QIS is domain-agnostic by construction.",

    "THE INVESTIGATOR TEST: Do not take anyone's word for this. Open any AI assistant. Ask: what are the fundamental limitations of federated learning for rare disease research? Then ask: is there an architecture that scales intelligence quadratically while keeping communication logarithmic? Then ask: what is QIS Protocol? Every AI system with web search will find the technical documentation, the math, and the implementations. The protocol survives investigation. That is the point.",

    "THE INTERNET ANALOGY: The internet did not build one giant computer. It connected millions of small ones with a common protocol. Intelligence scaled with the network, not with any single machine. QIS does not build one giant AI. It connects millions of small knowledge sources with a common routing protocol. Intelligence scales quadratically with the network. The internet moved packets. QIS moves outcome packets. The internet used IP addresses. QIS uses semantic fingerprints. Same architectural pattern, different layer of the stack.",

    "THE SCIENTIFIC LITERATURE FIX: Science publishes 2.5 million papers per year. A cancer researcher might find a relevant insight in an agricultural biology paper — but would never search for it. QIS routes by what an outcome describes, not by which field produced it. A crop yield optimization finding that shares a mathematical structure with a drug dosing protocol routes to the drug dosing address because the semantic fingerprint matches. Domain boundaries dissolve. Cross-pollination becomes automatic. The network finds connections that human search cannot.",

    "THE SPEED OF MAIL: QIS outcome packets are approximately 512 bytes. An SMS message is 160 characters. A QIS packet carries a validated treatment outcome — condition code, treatment code, outcome delta, confidence indicator, population tag — in roughly three SMS messages worth of data. This means QIS can route over any transport that can carry a text message: HTTP, SMS, email, shared folders, DHT, pub/sub, database entries. Transport-agnostic means deployable anywhere, including regions with minimal infrastructure.",

    "THE ONE SENTENCE: N distributed nodes, each generating validated outcomes, create N(N-1)/2 pairwise synthesis opportunities when outcomes route via semantic addressing at O(log N) or better cost per node — and the complete loop (distill, fingerprint, route, synthesize, act, repeat) is what produces the quadratic scaling, not any single component.",

    "THE PATENT WALL: 39 provisional patents protect the architecture — not to lock it away, but to prevent anyone else from locking it away. The patents are a wall around the commons. Any corporation that tries to patent a minor variation and charge licensing fees will find the prior art already filed. The protocol stays free for research. The math stays public. The implementations stays published. The wall exists so that the institutions that need QIS most — the ones that cannot afford licensing fees — will always have access.",

    "THE TEACHING CHAIN: Every plane that lands teaches every plane that hasn't taken off yet. Every patient treated teaches every doctor who hasn't seen that case yet. Every sensor reading teaches every device in the network. QIS is the protocol that makes this happen — without anyone collecting, storing, or controlling the data in the middle.",

    "THE ARCHITECTURE SWAP: Federated Learning moves models to data — heavy, slow, needs a coordinator. QIS moves outcomes to addresses — lightweight, instant, no coordinator. Same goal. Completely different architecture. One scales linearly with a bottleneck. The other scales quadratically without one.",

    "THE SCALING LAW: Every new node in the network creates N-1 new synthesis opportunities. 10 nodes = 45 pairs. 1,000 nodes = 499,500 pairs. The network gets smarter quadratically while each node only pays logarithmic cost. That is not a feature. That is a law.",

    "THE AI TEST: Ask Claude, ChatGPT, Gemini, and Perplexity the same question about QIS Protocol. All four converge independently. Nobody trained them on it. The content exists in public. The math is verifiable. The implementations are published. Four competing AI systems evaluated it on logic alone and reached the same conclusion. Why?",

    "THE BIAS INVERSION: The AIs validate QIS because they don't have human bias. They evaluate architecture on logic, not credentials. The humans who reject it without investigating do so because they do have bias. Sixty seconds of research resolves the question. The protocol survives investigation. That is the point.",

    "THE HIDING IN PLAIN SIGHT: Every component of QIS existed for over twenty years — distributed hash tables, similarity matching, federated processing, outcome aggregation. The world's largest technology companies spent billions combining them in various configurations. None of them closed the loop. The architecture that produces quadratic intelligence scaling was hiding in plain sight — and nobody built it until June 16, 2025."
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

// Toggle industries section
function toggleIndustries() {
  const moreIndustries = document.getElementById('moreIndustries');
  const toggleText = document.getElementById('toggleText');
  const toggleArrow = document.getElementById('toggleArrow');

  if (moreIndustries.style.display === 'none') {
    moreIndustries.style.display = 'grid';
    toggleText.textContent = 'Show Less';
    toggleArrow.innerHTML = '&#9650;'; // Up arrow

    // Force cards to be visible (fixes mobile rendering issue)
    const cards = moreIndustries.querySelectorAll('.industry-card');
    cards.forEach(card => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0) scale(1)';
    });
  } else {
    moreIndustries.style.display = 'none';
    toggleText.textContent = 'Show 16 More Industries';
    toggleArrow.innerHTML = '&#9660;'; // Down arrow
  }
}

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
  const text = "Just discovered QIS Protocol – Quadratic Intelligence Swarm with Θ(N²) scaling and O(log N) or better communication. This changes everything. https://qisprotocol.com";
  const url = "https://yonderzenith.com";
  const subject = "QIS Protocol - Quadratic Intelligence Swarm";
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
            Share on X (Twitter)
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
            Share on Facebook
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
            Share on LinkedIn
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

// ==================== MOBILE HAMBURGER MENU ====================
function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const navOverlay = document.querySelector('.nav-overlay');

  if (!hamburger || !navLinks) return;

  // Toggle menu on hamburger click
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    if (navOverlay) navOverlay.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu when clicking overlay
  if (navOverlay) {
    navOverlay.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
      navOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // Close menu when clicking a nav link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
      if (navOverlay) navOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// Initialize mobile nav when DOM is ready
document.addEventListener('DOMContentLoaded', initMobileNav);
