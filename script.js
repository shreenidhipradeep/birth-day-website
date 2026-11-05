/**
 * Surprise Birthday Website for Yahya
 * Created with ❤️ by Shree
 * 
 * Shared Configuration & Interactive Journey Controller
 */

// =============================================================================
// 1. CONFIGURATION SECTION (Easily customize anything here!)
// =============================================================================
const CONFIG = {
  // Names
  friendName: "Yahya",
  myName: "Shree",
  
  // Photo & Song Assets
  // Folder containing images & song (sits next to HTML files)
  assetFolder: "birthday/",      
  imagePrefix: "image",         // image1, image2, ..., image12
  imageExtension: ".jpeg",      // Primary extension (.jpeg or .jpg)
  fallbackExtension: ".jpg",    // Fallback extension if .jpeg is missing
  totalImages: 12,              // Total photos to shuffle (1 to 12)
  songFile: "birthday/song.mp3",// Background song path (the new Remo birthday song)
  fallbackSong: "song.mp3",     // Alternative path in root
  showFloatingMusicButton: true,// Sleek floating spinning vinyl play/pause button

  // Random captions for Polaroid photos (Fisher-Yates shuffled for variety)
  captions: [
    "Good times 😄",
    "Never forget this day 💛",
    "Pure chaos 🤪",
    "My brother, my friend ❤️",
    "Unstoppable duo 🔥",
    "Core memory unlocked ✨",
    "Too much sauce 😎",
    "Partners in crime 🤜🤛",
    "Laughs we will never forget 😂",
    "Real ones since day one 👑",
    "Making history together 🌟",
    "Always got your back 🫂",
    "Legendary moments 🚀",
    "Sister & brother bond forever 💫"
  ],

  // Letter content for letter.html
  letterGreeting: "Dear Yahya,",
  letterBody: [
    "Happy Birthday to someone who has always been more than just a best friend — having you as a brother is such a blessing.",
    "Looking back at all the crazy memories, endless laughs, and wild adventures we've shared, I can honestly say life would be so dull without you.",
    "Thank you for always having my back, for keeping it 100% real, and for being the kind of loyal brother and friend anyone in the world would be lucky to have.",
    "May this year bring you boundless happiness, massive success in every goal you chase, great health, and all the blessings you deserve. Keep shining and staying the humble, amazing person you are."
  ],
  letterClosing: "Forever your sister,<br>– Shree ❤️"
};

// =============================================================================
// 2. AUDIO & MUSIC CONTINUITY SYSTEM
// =============================================================================
class BackgroundMusic {
  constructor() {
    this.storageKeyTime = 'yahya_birthday_music_time';
    this.storageKeyState = 'yahya_birthday_music_playing';
    this.audio = null;
    this.isPlaying = false;
    this.vinylEl = null;
    this.noteInterval = null;

    this.initAudio();
    this.createFloatingWidget();
    this.setupListeners();
  }

  initAudio() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    // Song replays only AFTER it has completely finished playing through!
    this.audio.loop = false;

    // Set source with cascading fallbacks
    this.audio.src = CONFIG.songFile;
    this.audio.onerror = () => {
      if (!this.audio.src.includes(CONFIG.fallbackSong)) {
        this.audio.src = CONFIG.fallbackSong;
      }
    };

    let hasRestoredTime = false;
    const applySavedTime = () => {
      if (hasRestoredTime) return;
      const raw = sessionStorage.getItem(this.storageKeyTime) || localStorage.getItem(this.storageKeyTime) || '0';
      const savedTime = parseFloat(raw);
      if (!isNaN(savedTime) && savedTime > 0) {
        try {
          // If song had previously reached the very end (within 0.5s of duration), replay from 0
          if (this.audio.duration && savedTime >= this.audio.duration - 0.5) {
            this.audio.currentTime = 0;
            sessionStorage.setItem(this.storageKeyTime, '0');
            localStorage.setItem(this.storageKeyTime, '0');
          } else {
            this.audio.currentTime = savedTime;
          }
          hasRestoredTime = true;
        } catch (e) {
          // Ignore if browser restricts seeking before playback starts
        }
      }
    };

    this.audio.addEventListener('loadedmetadata', applySavedTime, { once: true });
    this.audio.addEventListener('canplay', applySavedTime, { once: true });

    // The song replays only after it has completely finished playing!
    this.audio.addEventListener('ended', () => {
      this.audio.currentTime = 0;
      sessionStorage.setItem(this.storageKeyTime, '0');
      localStorage.setItem(this.storageKeyTime, '0');
      this.play();
    });

    // Continuously save position in both session and local storage
    this.audio.addEventListener('timeupdate', () => {
      if (this.audio.currentTime > 0) {
        sessionStorage.setItem(this.storageKeyTime, this.audio.currentTime.toString());
        localStorage.setItem(this.storageKeyTime, this.audio.currentTime.toString());
      }
    });

    // Restore play state if user had music playing on previous page
    const wasPlaying = sessionStorage.getItem(this.storageKeyState) === 'true' ||
                       localStorage.getItem(this.storageKeyState) === 'true';
    if (wasPlaying) {
      if (this.audio.readyState >= 2) {
        applySavedTime();
        this.play(true);
      } else {
        this.audio.addEventListener('loadeddata', () => {
          applySavedTime();
          this.play(true);
        }, { once: true });
      }
    }
  }

  play(attemptAuto = false) {
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          sessionStorage.setItem(this.storageKeyState, 'true');
          localStorage.setItem(this.storageKeyState, 'true');
          this.updateUI();
        })
        .catch((err) => {
          this.isPlaying = false;
          this.updateUI();
          if (attemptAuto) {
            // Autoplay blocked by browser: resume on first user interaction anywhere
            const resumeOnInteraction = () => {
              this.play();
              window.removeEventListener('click', resumeOnInteraction);
              window.removeEventListener('touchstart', resumeOnInteraction);
            };
            window.addEventListener('click', resumeOnInteraction, { once: true });
            window.addEventListener('touchstart', resumeOnInteraction, { once: true });
          }
        });
    }
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    sessionStorage.setItem(this.storageKeyState, 'false');
    localStorage.setItem(this.storageKeyState, 'false');
    this.updateUI();
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  createFloatingWidget() {
    if (!CONFIG.showFloatingMusicButton) return;
    if (document.getElementById('floating-music-btn')) return;

    const widget = document.createElement('div');
    widget.id = 'floating-music-btn';
    widget.className = 'floating-music-player';
    widget.setAttribute('role', 'button');
    widget.setAttribute('aria-label', 'Toggle background song');
    widget.setAttribute('title', 'Music (Play / Pause)');

    // Clean floating spinning vinyl button without any text
    widget.innerHTML = `<div class="vinyl-disc" id="music-vinyl"></div>`;

    document.body.appendChild(widget);

    this.vinylEl = document.getElementById('music-vinyl');

    widget.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    this.updateUI();
  }

  updateUI() {
    if (!this.vinylEl) return;

    if (this.isPlaying) {
      this.vinylEl.classList.add('spinning');
      this.vinylEl.classList.remove('paused');
      this.startNoteParticles();
    } else {
      this.vinylEl.classList.remove('spinning');
      this.vinylEl.classList.add('paused');
      this.stopNoteParticles();
    }
  }

  startNoteParticles() {
    if (this.noteInterval) return;
    const notes = ['♪', '♫', '♬', '♩', '✨'];
    this.noteInterval = setInterval(() => {
      if (!this.isPlaying) return;
      const widget = document.getElementById('floating-music-btn');
      if (!widget) return;

      const rect = widget.getBoundingClientRect();
      const note = document.createElement('span');
      note.className = 'note-particle';
      note.textContent = notes[Math.floor(Math.random() * notes.length)];
      note.style.left = `${rect.left + 15 + (Math.random() * 20)}px`;
      note.style.top = `${rect.top}px`;
      document.body.appendChild(note);

      setTimeout(() => {
        if (note.parentNode) note.parentNode.removeChild(note);
      }, 1800);
    }, 900);
  }

  stopNoteParticles() {
    if (this.noteInterval) {
      clearInterval(this.noteInterval);
      this.noteInterval = null;
    }
  }

  setupListeners() {
    // Preserve position before navigating away
    window.addEventListener('beforeunload', () => {
      if (this.audio && this.audio.currentTime > 0) {
        sessionStorage.setItem(this.storageKeyTime, this.audio.currentTime.toString());
        localStorage.setItem(this.storageKeyTime, this.audio.currentTime.toString());
      }
    });

    // Save exact position when clicking any page link
    document.addEventListener('click', (e) => {
      const targetLink = e.target.closest('a');
      if (targetLink && targetLink.href && targetLink.href.includes('.html')) {
        if (this.audio && this.audio.currentTime > 0) {
          sessionStorage.setItem(this.storageKeyTime, this.audio.currentTime.toString());
          localStorage.setItem(this.storageKeyTime, this.audio.currentTime.toString());
          if (this.isPlaying) {
            sessionStorage.setItem(this.storageKeyState, 'true');
            localStorage.setItem(this.storageKeyState, 'true');
          }
        }
      }
    });
  }

  resetMusic() {
    if (this.audio) {
      this.audio.currentTime = 0;
      sessionStorage.setItem(this.storageKeyTime, '0');
      localStorage.setItem(this.storageKeyTime, '0');
    }
  }
}

// Global music singleton instance
let musicPlayer = null;

// =============================================================================
// 3. UTILITIES & ANIMATION HELPERS
// =============================================================================

/**
 * Fisher-Yates (Knuth) Shuffle Algorithm
 * Guarantees a completely unbiased, randomized array order
 */
function fisherYatesShuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Replace placeholder text across the page (friendName & myName)
 */
function populateNames() {
  document.querySelectorAll('.friend-name').forEach(el => {
    el.textContent = CONFIG.friendName;
  });
  document.querySelectorAll('.my-name').forEach(el => {
    el.textContent = CONFIG.myName;
  });
}

/**
 * Background Twinkling Ambient Stars Canvas
 */
function initAmbientStars() {
  const canvas = document.createElement('canvas');
  canvas.id = 'ambient-stars';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const numStars = Math.min(Math.floor((width * height) / 12000), 90);
  const stars = [];

  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 0.02 + 0.005,
      direction: Math.random() > 0.5 ? 1 : -1
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    for (let star of stars) {
      star.alpha += star.speed * star.direction;
      if (star.alpha > 0.95) {
        star.alpha = 0.95;
        star.direction = -1;
      } else if (star.alpha < 0.2) {
        star.alpha = 0.2;
        star.direction = 1;
      }

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 230, 180, ${star.alpha})`;
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#ffd166';
      ctx.fill();
    }

    requestAnimationFrame(render);
  }
  render();
}

/**
 * Show temporary toast alert
 */
function showToast(text, duration = 3000) {
  let toast = document.querySelector('.toast-message');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-message';
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// =============================================================================
// 4. CONFETTI & FIREWORKS CANVASES
// =============================================================================

class ConfettiEngine {
  constructor(canvasId = null) {
    this.canvas = canvasId ? document.getElementById(canvasId) : null;
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '999';
      document.body.appendChild(this.canvas);
    }
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.isRunning = false;
    this.colors = ['#ffd166', '#ff4d88', '#4cc9f0', '#7209b7', '#06d6a0', '#ffffff', '#ff9a3c'];
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  burst(count = 100, originX = this.width / 2, originY = this.height / 2) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 14 + 4;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: Math.random() * 8 + 4,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        gravity: 0.28,
        friction: 0.96,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.008
      });
    }

    if (!this.isRunning) {
      this.isRunning = true;
      this.loop();
    }
  }

  continuousShower(rate = 3) {
    this.showerInterval = setInterval(() => {
      for (let i = 0; i < rate; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: -20,
          vx: (Math.random() - 0.5) * 3,
          vy: Math.random() * 3 + 2,
          size: Math.random() * 8 + 4,
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 8,
          gravity: 0.05,
          friction: 0.99,
          alpha: 1,
          decay: 0.003
        });
      }
      if (!this.isRunning) {
        this.isRunning = true;
        this.loop();
      }
    }, 150);
  }

  loop() {
    if (!this.isRunning) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.y > this.height + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = Math.max(p.alpha, 0);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.loop());
    } else {
      this.isRunning = false;
    }
  }

  stopShower() {
    if (this.showerInterval) {
      clearInterval(this.showerInterval);
      this.showerInterval = null;
    }
  }
}

class FireworksShow {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.fireworks = [];
    this.particles = [];
    this.isRunning = true;
    this.colors = ['#ffd166', '#ff4d88', '#4cc9f0', '#06d6a0', '#ff9a3c', '#e0aaff', '#ffffff'];

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.startAutoLaunch();
    this.loop();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  launch(targetX = null, targetY = null) {
    const startX = Math.random() * (this.width * 0.8) + this.width * 0.1;
    const destX = targetX !== null ? targetX : Math.random() * (this.width * 0.8) + this.width * 0.1;
    const destY = targetY !== null ? targetY : Math.random() * (this.height * 0.45) + 60;
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];

    const angle = Math.atan2(destY - this.height, destX - startX);
    const distance = Math.hypot(destX - startX, destY - this.height);
    const speed = 12 + Math.random() * 4;

    this.fireworks.push({
      x: startX,
      y: this.height,
      destX,
      destY,
      color,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      trail: []
    });
  }

  explode(x, y, color) {
    const count = 70 + Math.floor(Math.random() * 40);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 1.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: Math.random() > 0.3 ? color : '#ffffff',
        radius: Math.random() * 2.4 + 1.2,
        gravity: 0.08,
        friction: 0.95,
        decay: Math.random() * 0.015 + 0.012
      });
    }
  }

  startAutoLaunch() {
    this.launchTimer = setInterval(() => {
      this.launch();
      if (Math.random() > 0.5) {
        setTimeout(() => this.launch(), 250);
      }
    }, 1100);
  }

  loop() {
    if (!this.isRunning) return;

    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.globalCompositeOperation = 'lighter';

    // Update fireworks rockets
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const fw = this.fireworks[i];
      fw.trail.push({ x: fw.x, y: fw.y });
      if (fw.trail.length > 5) fw.trail.shift();

      fw.x += fw.vx;
      fw.y += fw.vy;

      // Draw rocket trail
      this.ctx.beginPath();
      this.ctx.strokeStyle = fw.color;
      this.ctx.lineWidth = 2.5;
      for (let t = 0; t < fw.trail.length; t++) {
        this.ctx.lineTo(fw.trail[t].x, fw.trail[t].y);
      }
      this.ctx.stroke();

      // Check if reached destination
      if (fw.y <= fw.destY || fw.vy >= 0) {
        this.explode(fw.x, fw.y, fw.color);
        this.fireworks.splice(i, 1);
      }
    }

    // Update sparks
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(p.alpha, 0);
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
    }

    requestAnimationFrame(() => this.loop());
  }

  stop() {
    this.isRunning = false;
    if (this.launchTimer) clearInterval(this.launchTimer);
  }
}

// =============================================================================
// 5. PAGE-SPECIFIC INITIALIZERS
// =============================================================================

/**
 * PAGE 1: index.html - "The Gift Box"
 */
function initIndexPage() {
  const giftWrapper = document.getElementById('gift-box-wrapper');
  if (!giftWrapper) return;

  let isOpening = false;
  const confetti = new ConfettiEngine();

  giftWrapper.addEventListener('click', () => {
    if (isOpening) return;
    isOpening = true;

    // Start music on user interaction (bypasses browser autoplay block)
    if (musicPlayer) {
      musicPlayer.play();
    }

    // Trigger open animation
    giftWrapper.classList.add('opened');

    // Confetti burst from gift
    const rect = giftWrapper.getBoundingClientRect();
    confetti.burst(140, rect.left + rect.width / 2, rect.top + rect.height / 2);

    // Update message
    const hint = document.getElementById('gift-hint-text');
    if (hint) {
      hint.innerHTML = 'Unwrapping your surprise... ✨';
    }

    // Save audio time and redirect to countdown after 1.8 seconds
    setTimeout(() => {
      if (musicPlayer && musicPlayer.audio) {
        sessionStorage.setItem('yahya_birthday_music_time', musicPlayer.audio.currentTime.toString());
        sessionStorage.setItem('yahya_birthday_music_playing', 'true');
      }
      window.location.href = 'countdown.html';
    }, 1800);
  });
}

/**
 * PAGE 2: countdown.html - "Get Ready"
 */
function initCountdownPage() {
  const numDisplay = document.getElementById('countdown-num');
  const messageDisplay = document.getElementById('countdown-msg');
  if (!numDisplay) return;

  const confetti = new ConfettiEngine();
  const fireworks = new FireworksShow('countdown-canvas');

  let count = 5;
  const messages = [
    "Are you ready, Yahya? 🚀",
    "Brace yourself... 🌟",
    "Almost there... 🔥",
    "Hold your breath... ✨",
    "HERE IT COMES! 🎉"
  ];

  function tick() {
    if (count > 0) {
      numDisplay.textContent = count;
      numDisplay.classList.remove('count-animate');
      void numDisplay.offsetWidth; // Trigger reflow for re-animation
      numDisplay.classList.add('count-animate');

      if (messageDisplay) {
        messageDisplay.textContent = messages[5 - count];
      }

      // Firework burst per tick
      fireworks.launch();
      confetti.burst(35, window.innerWidth / 2, window.innerHeight * 0.45);

      count--;
      setTimeout(tick, 1000);
    } else {
      numDisplay.textContent = "🎉";
      if (messageDisplay) {
        messageDisplay.textContent = "HAPPY BIRTHDAY!";
      }
      confetti.burst(150, window.innerWidth / 2, window.innerHeight * 0.45);
      
      setTimeout(() => {
        if (musicPlayer && musicPlayer.audio) {
          sessionStorage.setItem('yahya_birthday_music_time', musicPlayer.audio.currentTime.toString());
        }
        window.location.href = 'wish.html';
      }, 1400);
    }
  }

  // Start after brief entrance delay
  setTimeout(tick, 700);
}

/**
 * PAGE 3: wish.html - "Happy Birthday"
 */
function initWishPage() {
  const confetti = new ConfettiEngine();
  // Continuous celebration shower
  confetti.continuousShower(2);
  // Big initial blast
  confetti.burst(120, window.innerWidth / 2, window.innerHeight * 0.3);

  // Generate floating balloons
  const container = document.getElementById('balloons-container');
  if (container) {
    const colors = [
      '#ff4d88', '#ffd166', '#4cc9f0', '#7209b7', '#06d6a0', '#ff70a6', '#ff9770'
    ];
    for (let i = 0; i < 18; i++) {
      const balloon = document.createElement('div');
      balloon.className = 'balloon';
      balloon.style.left = `${Math.random() * 95}%`;
      balloon.style.backgroundColor = colors[i % colors.length];
      balloon.style.animationDelay = `${Math.random() * 6}s`;
      balloon.style.animationDuration = `${7 + Math.random() * 5}s`;
      balloon.style.transform = `scale(${0.7 + Math.random() * 0.6})`;
      container.appendChild(balloon);
    }
  }
}

/**
 * PAGE 4: memories.html - "Our Memories" (AUTO-MOVING SHOWCASE, SHUFFLED EVERY VISIT)
 * Photos move one after the other automatically without requiring manual scrolling!
 */
function initMemoriesPage() {
  const stage = document.getElementById('showcase-stage');
  const dotsContainer = document.getElementById('showcase-dots');
  const timerFill = document.getElementById('showcase-timer-fill');
  const playBtn = document.getElementById('showcase-play-btn');
  const playIcon = document.getElementById('showcase-play-icon');
  const playText = document.getElementById('showcase-play-text');
  const prevBtn = document.getElementById('showcase-prev-btn');
  const nextBtn = document.getElementById('showcase-next-btn');

  if (!stage) return;

  // 1. Generate array [1, 2, ..., CONFIG.totalImages]
  const imageIndices = [];
  for (let i = 1; i <= CONFIG.totalImages; i++) {
    imageIndices.push(i);
  }

  // 2. CRITICAL REQUIREMENT: Fisher-Yates shuffle photo order!
  // Photos NEVER appear in 1, 2, 3... numerical order!
  let shuffledImages = fisherYatesShuffle(imageIndices);

  // Explicitly ensure it's not in sorted numerical order
  let isSorted = true;
  for (let i = 0; i < shuffledImages.length; i++) {
    if (shuffledImages[i] !== i + 1) {
      isSorted = false;
      break;
    }
  }
  if (isSorted && shuffledImages.length > 1) {
    [shuffledImages[0], shuffledImages[1]] = [shuffledImages[1], shuffledImages[0]];
  }

  // 3. Shuffle captions too so captions vary authentically
  const shuffledCaptions = fisherYatesShuffle(CONFIG.captions);

  // Data structure for active gallery & lightbox
  const galleryItems = [];

  shuffledImages.forEach((imgNum, index) => {
    const caption = shuffledCaptions[index % shuffledCaptions.length];
    const primarySrc = `${CONFIG.assetFolder}${CONFIG.imagePrefix}${imgNum}${CONFIG.imageExtension}`;
    const fallbackSrc = `${CONFIG.assetFolder}${CONFIG.imagePrefix}${imgNum}${CONFIG.fallbackExtension}`;
    const rootSrc = `${CONFIG.imagePrefix}${imgNum}${CONFIG.imageExtension}`;
    const rootFallback = `${CONFIG.imagePrefix}${imgNum}${CONFIG.fallbackExtension}`;

    galleryItems.push({
      num: imgNum,
      caption: caption,
      primarySrc: primarySrc,
      fallbackSrc: fallbackSrc,
      rootSrc: rootSrc,
      rootFallback: rootFallback,
      index: index
    });
  });

  // 4. State Management for Auto-Moving Showcase
  let currentIndex = 0;
  let isAutoPlaying = true;
  let isTransitioning = false;
  const slideDuration = 3800; // 3.8s per photo before auto-advance
  const tickStep = 50;
  let elapsed = 0;
  let timerInterval = null;

  // Build Dots Navigation
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    galleryItems.forEach((_, idx) => {
      const dot = document.createElement('span');
      dot.className = `showcase-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('title', `Memory ${idx + 1}`);
      dot.addEventListener('click', () => {
        if (idx !== currentIndex && !isTransitioning) {
          const dir = idx > currentIndex ? 'next' : 'prev';
          goToPhoto(idx, dir);
        }
      });
      dotsContainer.appendChild(dot);
    });
  }

  function updateDots(activeIdx) {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.showcase-dot');
    dots.forEach((dot, idx) => {
      if (idx === activeIdx) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function updateTimerBar(percent) {
    if (timerFill) {
      timerFill.style.width = `${percent}%`;
    }
  }

  function renderCard(index, direction = 'next') {
    const item = galleryItems[index];
    if (!item) return;

    // Create incoming card
    const card = document.createElement('div');
    card.className = `showcase-card ${direction === 'next' ? 'slide-in-right' : 'slide-in-left'}`;

    // Slightly random rotation tilt for polaroid charm (-4.5deg to +4.5deg)
    const tilt = (Math.random() * 9 - 4.5).toFixed(2);
    card.style.setProperty('--card-tilt', `${tilt}deg`);

    card.innerHTML = `
      <div class="showcase-tape"></div>
      <div class="showcase-img-box">
        <img src="${item.primarySrc}" alt="Memory ${item.num}" loading="eager">
      </div>
      <div class="showcase-caption-bar">
        <span class="showcase-caption">${item.caption}</span>
        <span class="showcase-counter">Memory ${index + 1} of ${galleryItems.length}</span>
      </div>
    `;

    // Handle missing/error image fallback
    const imgEl = card.querySelector('img');
    imgEl.onerror = function () {
      if (!this.src.includes(item.fallbackSrc) && item.fallbackSrc !== item.primarySrc) {
        this.src = item.fallbackSrc;
      } else if (!this.src.includes(item.rootSrc)) {
        this.src = item.rootSrc;
      } else if (!this.src.includes(item.rootFallback)) {
        this.src = item.rootFallback;
      } else {
        const box = card.querySelector('.showcase-img-box');
        if (box) {
          box.innerHTML = `
            <div class="polaroid-fallback">
              <span class="polaroid-fallback-icon">📸</span>
              <span class="polaroid-fallback-text">Unforgettable Memory #${item.num}</span>
            </div>
          `;
        }
      }
    };

    // Tap to Zoom in Lightbox
    card.addEventListener('click', () => {
      pauseAutoPlay();
      openLightbox(index);
    });

    // Hover or touch pauses the auto-progress so user can admire
    card.addEventListener('mouseenter', () => {
      if (isAutoPlaying) {
        pauseTimer();
      }
    });
    card.addEventListener('mouseleave', () => {
      if (isAutoPlaying) {
        resumeTimer();
      }
    });
    card.addEventListener('touchstart', () => {
      if (isAutoPlaying) {
        pauseTimer();
      }
    }, { passive: true });
    card.addEventListener('touchend', () => {
      if (isAutoPlaying) {
        resumeTimer();
      }
    }, { passive: true });

    // Animate and remove existing outgoing card
    const existingCard = stage.querySelector('.showcase-card');
    if (existingCard) {
      existingCard.classList.remove('slide-in-right', 'slide-in-left');
      existingCard.classList.add(direction === 'next' ? 'slide-out-left' : 'slide-out-right');
      setTimeout(() => {
        if (existingCard.parentElement === stage) {
          stage.removeChild(existingCard);
        }
      }, 500);
    }

    stage.appendChild(card);
    updateDots(index);
  }

  function goToPhoto(newIndex, direction = 'next') {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex = newIndex;
    elapsed = 0;
    updateTimerBar(0);
    renderCard(currentIndex, direction);
    setTimeout(() => {
      isTransitioning = false;
    }, 520);
  }

  function nextPhoto() {
    const nextIdx = (currentIndex + 1) % galleryItems.length;
    goToPhoto(nextIdx, 'next');
  }

  function prevPhoto() {
    const prevIdx = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    goToPhoto(prevIdx, 'prev');
  }

  // Timer loop for auto-moving photos
  let isTimerPaused = false;

  function startTimerLoop() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (!isAutoPlaying || isTimerPaused) return;

      elapsed += tickStep;
      const progress = Math.min((elapsed / slideDuration) * 100, 100);
      updateTimerBar(progress);

      if (elapsed >= slideDuration) {
        elapsed = 0;
        updateTimerBar(0);
        nextPhoto();
      }
    }, tickStep);
  }

  function pauseTimer() {
    isTimerPaused = true;
  }

  function resumeTimer() {
    isTimerPaused = false;
  }

  function pauseAutoPlay() {
    isAutoPlaying = false;
    if (playIcon) playIcon.textContent = '▶';
    if (playText) playText.textContent = 'Paused';
    if (playBtn) playBtn.style.borderColor = 'rgba(255,255,255,0.2)';
  }

  function resumeAutoPlay() {
    isAutoPlaying = true;
    isTimerPaused = false;
    if (playIcon) playIcon.textContent = '⏸';
    if (playText) playText.textContent = 'Auto-Playing';
    if (playBtn) playBtn.style.borderColor = 'var(--accent-gold)';
  }

  function toggleAutoPlay() {
    if (isAutoPlaying) {
      pauseAutoPlay();
    } else {
      resumeAutoPlay();
    }
  }

  // Attach controls
  nextBtn?.addEventListener('click', () => {
    nextPhoto();
  });
  prevBtn?.addEventListener('click', () => {
    prevPhoto();
  });
  playBtn?.addEventListener('click', toggleAutoPlay);

  // Initial render of first photo and start auto-movement
  renderCard(0, 'next');
  startTimerLoop();

  // -------------------------------------------------------------
  // LIGHTBOX LOGIC
  // -------------------------------------------------------------
  let currentLightboxIdx = 0;
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');

  function openLightbox(idx) {
    if (!lightboxModal) return;
    currentLightboxIdx = idx;
    updateLightboxUI();
    lightboxModal.classList.add('active');
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    resumeAutoPlay();
  }

  function updateLightboxUI() {
    const item = galleryItems[currentLightboxIdx];
    if (!item) return;

    if (lightboxImg) lightboxImg.src = item.primarySrc;
    if (lightboxCaption) lightboxCaption.textContent = item.caption;
    if (lightboxCounter) lightboxCounter.textContent = `${currentLightboxIdx + 1} / ${galleryItems.length}`;
  }

  document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev')?.addEventListener('click', () => {
    currentLightboxIdx = (currentLightboxIdx - 1 + galleryItems.length) % galleryItems.length;
    updateLightboxUI();
  });
  document.getElementById('lightbox-next')?.addEventListener('click', () => {
    currentLightboxIdx = (currentLightboxIdx + 1) % galleryItems.length;
    updateLightboxUI();
  });

  // Close on outside click
  lightboxModal?.addEventListener('click', (e) => {
    if (e.target === lightboxModal) closeLightbox();
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!lightboxModal || !lightboxModal.classList.contains('active')) {
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === ' ') {
        e.preventDefault();
        toggleAutoPlay();
      }
      return;
    }
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') document.getElementById('lightbox-prev')?.click();
    if (e.key === 'ArrowRight') document.getElementById('lightbox-next')?.click();
  });

  // Touch Swipe for Mobile
  let touchStartX = 0;
  let touchEndX = 0;
  stage?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  stage?.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - 45) {
      nextPhoto();
    } else if (touchEndX > touchStartX + 45) {
      prevPhoto();
    }
  }, { passive: true });
}

/**
 * PAGE 5: letter.html - "A Letter For You"
 */
function initLetterPage() {
  const envelope = document.getElementById('interactive-envelope');
  const letterBodyContainer = document.getElementById('letter-content-body');
  const letterSalutation = document.getElementById('letter-salutation');
  const letterSignature = document.getElementById('letter-signature');

  // Populate letter content from CONFIG
  if (letterSalutation) letterSalutation.textContent = CONFIG.letterGreeting;
  if (letterBodyContainer) {
    letterBodyContainer.innerHTML = CONFIG.letterBody
      .map(paragraph => `<p>${paragraph}</p>`)
      .join('');
  }
  if (letterSignature) letterSignature.innerHTML = CONFIG.letterClosing;

  if (envelope) {
    const confetti = new ConfettiEngine();
    let isOpen = false;

    envelope.addEventListener('click', () => {
      if (isOpen) return;
      isOpen = true;
      envelope.classList.add('opened');

      const rect = envelope.getBoundingClientRect();
      confetti.burst(60, rect.left + rect.width / 2, rect.top + 80);

      const hint = document.getElementById('letter-tap-hint');
      if (hint) {
        hint.style.opacity = '0';
      }
    });
  }
}

/**
 * PAGE 6: cake.html - "Make a Wish"
 */
function initCakePage() {
  const btnLight = document.getElementById('btn-light-candles');
  const btnBlow = document.getElementById('btn-blow-candles');
  const cakeContainer = document.querySelector('.cake-container');
  const flames = document.querySelectorAll('.candle-flame');
  const wishPopup = document.getElementById('wish-popup');
  const confetti = new ConfettiEngine();

  let candlesLit = true; // Start with lit candles as default welcoming state

  // Update initial flame states
  flames.forEach(flame => flame.classList.add('lit'));

  function lightCandles() {
    candlesLit = true;
    flames.forEach(flame => flame.classList.add('lit'));
    confetti.burst(25, window.innerWidth / 2, window.innerHeight * 0.4);
    showToast("Candles glowing brightly! ✨");
  }

  function blowCandles() {
    if (!candlesLit) {
      showToast("Candles are already blown out! Make your wish 🌟");
      return;
    }
    candlesLit = false;

    // Extinguish flames and spawn smoke
    flames.forEach(flame => {
      flame.classList.remove('lit');
      const smoke = document.createElement('div');
      smoke.className = 'smoke-puff';
      flame.parentElement.appendChild(smoke);
      setTimeout(() => smoke.remove(), 1200);
    });

    // Massive celebratory confetti blast
    confetti.burst(160, window.innerWidth / 2, window.innerHeight * 0.4);

    // Open Wish Pop-up Modal after 600ms
    setTimeout(() => {
      if (wishPopup) {
        wishPopup.classList.add('active');
      }
    }, 600);
  }

  if (btnLight) btnLight.addEventListener('click', lightCandles);
  if (btnBlow) btnBlow.addEventListener('click', blowCandles);

  // Allow tapping directly on the cake or candles to toggle!
  if (cakeContainer) {
    cakeContainer.style.cursor = 'pointer';
    cakeContainer.addEventListener('click', () => {
      if (candlesLit) {
        blowCandles();
      } else {
        lightCandles();
      }
    });
  }

  // Close wish popup button
  document.getElementById('btn-close-wish')?.addEventListener('click', () => {
    if (wishPopup) wishPopup.classList.remove('active');
  });
}

/**
 * PAGE 7: final.html - "One Last Surprise"
 */
function initFinalPage() {
  const fireworks = new FireworksShow('finale-canvas');
  const confetti = new ConfettiEngine();
  confetti.continuousShower(2);

  // Replay button: reset music time to 0 and return to index.html
  const replayBtn = document.getElementById('btn-replay-journey');
  if (replayBtn) {
    replayBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (musicPlayer) {
        musicPlayer.resetMusic();
      }
      sessionStorage.setItem('yahya_birthday_music_time', '0');
      localStorage.setItem('yahya_birthday_music_time', '0');
      window.location.href = 'index.html';
    });
  }
}

// =============================================================================
// 6. GLOBAL INITIALIZATION (Runs on every page load)
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize persistent background music singleton
  musicPlayer = new BackgroundMusic();

  // 2. Twinkling ambient stars
  initAmbientStars();

  // 3. Inject configured names
  populateNames();

  // 4. Robust page router
  const path = window.location.pathname.toLowerCase();
  const page = path.split('/').pop().split('\\').pop() || 'index.html';

  if (page === '' || page === 'index.html') {
    initIndexPage();
  } else if (page === 'countdown.html' || path.includes('countdown')) {
    initCountdownPage();
  } else if (page === 'wish.html' || path.includes('wish')) {
    initWishPage();
  } else if (page === 'memories.html' || path.includes('memories')) {
    initMemoriesPage();
  } else if (page === 'letter.html' || path.includes('letter')) {
    initLetterPage();
  } else if (page === 'cake.html' || path.includes('cake')) {
    initCakePage();
  } else if (page === 'final.html' || path.includes('final')) {
    initFinalPage();
  }
});
