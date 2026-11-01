
(() => {
  "use strict";

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ======================================================================
     1. HERO NEURAL PARTICLE DISSOLUTION CANVAS
     ====================================================================== */
  const canvas = document.getElementById("neural-canvas");
  const ctx = canvas.getContext("2d");
  let width = 0, height = 0, particles = [];
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const startTime = performance.now();
  let pulseTime = -10000;
  const mouse = { x: null, y: null, radius: 150 };

  function resize() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  class Particle {
    constructor(i) {
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      this.angle = i * goldenAngle;
      this.radius = Math.sqrt((i + 0.5) / 100) * Math.min(width, height) * 0.55;
      this.speed = (0.0008 + Math.random() * 0.0012) * (i % 2 ? 1 : -1);
      this.x = width / 2;
      this.y = height * 0.45;
      this.size = 1.5 + Math.random() * 2;
      this.isGold = Math.random() < 0.5;
    }

    update(elapsed, pulseElapsed) {
      const cx = width / 2, cy = height * 0.45;
      const expand = 1 - Math.pow(1 - Math.min(1, elapsed / 2400), 4);
      let pulse = 1;
      if (pulseElapsed > 0 && pulseElapsed < 1600) {
        const p = pulseElapsed / 1600;
        pulse = 1 - 0.7 * Math.sin(p * Math.PI) * (1 - p);
      }

      this.angle += this.speed;
      const r = this.radius * expand * pulse;
      const tx = cx + Math.cos(this.angle) * r * 1.15;
      const ty = cy + Math.sin(this.angle) * r * 0.8;

      this.x += (tx - this.x) * 0.06;
      this.y += (ty - this.y) * 0.06;

      if (mouse.x !== null) {
        const dx = this.x - mouse.x, dy = this.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < mouse.radius && d > 0) {
          const f = (mouse.radius - d) / mouse.radius;
          this.x += (dx / d) * f * 4;
          this.y += (dy / d) * f * 4;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.isGold ? "#f5b942" : "#38bdf8";
      ctx.fill();
    }
  }

  function initCanvas() {
    resize();
    const count = width < 768 ? 60 : 105;
    particles = Array.from({ length: count }, (_, i) => new Particle(i));
  }

  function animate(now) {
    ctx.clearRect(0, 0, width, height);
    const elapsed = now - startTime;
    const pulseElapsed = now - pulseTime;

    particles.forEach(p => p.update(elapsed, pulseElapsed));

    const maxDist = width < 768 ? 100 : 135;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i], p2 = particles[j];
        const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (d < maxDist) {
          const a = (1 - d / maxDist) * 0.32;
          ctx.strokeStyle = i % 2 ? `rgba(245,185,66,${a})` : `rgba(56,189,248,${a})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => p.draw());
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  const hero = document.getElementById("hero");
  hero.addEventListener("mousemove", e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  hero.addEventListener("mouseleave", () => { mouse.x = null; mouse.y = null; });
  document.getElementById("trigger-dissolve").addEventListener("click", () => {
    pulseTime = performance.now();
  });

  initCanvas();
  requestAnimationFrame(animate);

  /* ======================================================================
     2. PROMPT PREVIEW DATA & INTERACTIVE TABS
     ====================================================================== */
  const prompts = {
    copywriting: [
      { id: "#01", tag: "Hero Hook", title: "Write a headline that shatters the #1 industry myth", text: `Act as a senior direct-response copywriter. Write 10 hero headlines for <span class="prompt-var">[PRODUCT]</span> targeting <span class="prompt-var">[AUDIENCE]</span> that challenge the belief that <span class="prompt-var">[MYTH]</span> is required to achieve <span class="prompt-var">[OUTCOME]</span>.`, outcome: "10 high-converting headlines", masked: false },
      { id: "#07", tag: "PAS Framework", title: "Convert skeptical visitors with Problem-Agitate-Solve", text: `Draft a 200-word PAS sales section for <span class="prompt-var">[PRODUCT]</span>. Describe the frustration of <span class="prompt-var">[PAIN POINT]</span>, agitate the cost of waiting, and introduce <span class="prompt-var">[MECHANISM]</span> as the solution.`, outcome: "Persuasive sales body copy", masked: false },
      { id: "#14", tag: "Value Stack", title: "Write a value proposition that makes competitors obsolete", text: `Create an "Only-Option" value proposition for <span class="prompt-var">[OFFER]</span> priced at <span class="prompt-var">[PRICE]</span>, followed by 5 feature-to-benefit bullets with time-saved metrics.`, outcome: "Positioning & benefit bullets", masked: true },
      { id: "#22", tag: "Risk Reversal", title: "Generate 12 first-person CTA buttons & micro-guarantees", text: `Write 12 high-converting CTA buttons paired with 1-sentence anxiety-reducing micro-copy underneath addressing <span class="prompt-var">[OBJECTION]</span>.`, outcome: "Higher click-through rate", masked: true }
    ],
    social: [
      { id: "#26", tag: "Viral Reels", title: "Script a 45-second Reel/TikTok with 3-second hooks", text: `Write a 45-second script about <span class="prompt-var">[TOPIC]</span> for <span class="prompt-var">[NICHE]</span>. Include 3 verbal/visual hooks, a mid-video curiosity loop, and a comment-driven CTA.`, outcome: "Complete short-form script", masked: false },
      { id: "#31", tag: "Authority Thread", title: "Write a contrarian LinkedIn/X post that attracts buyers", text: `Write a 7-part post sharing a counter-intuitive lesson about <span class="prompt-var">[TOPIC]</span>, breaking down the 3 steps used to achieve <span class="prompt-var">[RESULT]</span>.`, outcome: "High-engagement authority post", masked: false },
      { id: "#39", tag: "Carousel Engine", title: "Build a 10-slide educational carousel slide-by-slide", text: `Design a 10-slide carousel teaching <span class="prompt-var">[AUDIENCE]</span> how to solve <span class="prompt-var">[PROBLEM]</span> without <span class="prompt-var">[PAINFUL METHOD]</span>. Keep slides under 20 words.`, outcome: "Save-worthy carousel outline", masked: true },
      { id: "#48", tag: "Repurposing", title: "Turn 1 core idea into 14 days of multi-platform content", text: `Transform <span class="prompt-var">[CORE IDEA]</span> into 14 social assets: 4 contrarian hooks, 4 story posts, 4 checklists, and 2 direct-offer posts.`, outcome: "2 weeks of social content", masked: true }
    ],
    email: [
      { id: "#51", tag: "Open Rates", title: "Write 15 subject lines & preview texts for 45%+ opens", text: `Generate 15 high-open subject lines and 40-char preview texts for <span class="prompt-var">[TOPIC]</span> split into Curiosity, Direct Benefit, and Conversational styles.`, outcome: "15 A/B testable subject lines", masked: false },
      { id: "#56", tag: "Onboarding", title: "Draft a 4-email welcome sequence that converts leads", text: `Write a 4-part Welcome Sequence for <span class="prompt-var">[LEAD MAGNET]</span> subscribers leading naturally into <span class="prompt-var">[CORE OFFER]</span>.`, outcome: "4-day automated email flow", masked: false },
      { id: "#63", tag: "Cart Recovery", title: "Recover abandoned checkouts without needy discounting", text: `Write a 3-email abandoned cart sequence for <span class="prompt-var">[PRODUCT]</span> using diagnostic empathy and objection handling before offering an incentive.`, outcome: "High-recovery cart sequence", masked: true },
      { id: "#71", tag: "Re-Engagement", title: "Wake up cold email lists with 9-word micro-emails", text: `Create 5 plain-text re-engagement emails under 60 words for cold leads interested in <span class="prompt-var">[OUTCOME]</span> designed to trigger replies.`, outcome: "Instant reply & click surge", masked: true }
    ],
    ads: [
      { id: "#76", tag: "Meta 3x3 Matrix", title: "Generate 9 Facebook/Instagram ad copy variations", text: `Act as a senior media buyer. Write 3 primary texts (Punchy, Story, Logic) x 3 headline hooks for <span class="prompt-var">[OFFER]</span> targeting <span class="prompt-var">[AUDIENCE]</span>.`, outcome: "9 ready-to-launch Meta ads", masked: false },
      { id: "#82", tag: "UGC Script", title: "Script a high-ROAS User-Generated Content video ad", text: `Write a modular UGC ad script for <span class="prompt-var">[PRODUCT]</span> using Hook → Struggle → Discovery → Demo Proof → CTA with 4 interchangeable hooks.`, outcome: "Creator-ready UGC brief", masked: false },
      { id: "#89", tag: "Google Search", title: "Write 15 Google RSA headlines & 4 descriptions", text: `Create a high-CTR Google Search ad set for <span class="prompt-var">[KEYWORDS]</span> with 15 headlines (<30 chars) and 4 descriptions (<90 chars).`, outcome: "Google Ads copy sheet", masked: true },
      { id: "#94", tag: "Retargeting", title: "Convert warm window-shoppers with objection-crushing ads", text: `Write 4 retargeting ad variations for warm visitors who didn't buy <span class="prompt-var">[PRODUCT]</span>, neutralizing price and skepticism objections.`, outcome: "High-ROAS retargeting ads", masked: true }
    ],
    funnel: [
      { id: "#96", tag: "Lead Magnet", title: "Design a lead magnet concept that converts at 45%+", text: `Brainstorm 5 "Quick-Win" lead magnet concepts for <span class="prompt-var">[AUDIENCE]</span> that pre-sell <span class="prompt-var">[PAID PRODUCT]</span> in under 15 minutes.`, outcome: "5 lead magnet blueprints", masked: false },
      { id: "#97", tag: "Order Bump", title: "Write a checkout order bump that 35%+ of buyers add", text: `Write a 60-word checkout Order Bump copy for <span class="prompt-var">[BUMP OFFER]</span> at <span class="prompt-var">[PRICE]</span> positioned as the speed shortcut to <span class="prompt-var">[MAIN OFFER]</span>.`, outcome: "Immediate AOV boost", masked: false },
      { id: "#99", tag: "One-Click Upsell", title: "Script a post-purchase OTO page that doubles LTV", text: `Write a post-purchase upsell script for <span class="prompt-var">[FRONT-END]</span> buyers introducing <span class="prompt-var">[UPSELL]</span> as the next logical accelerator.`, outcome: "Full OTO upsell script", masked: true },
      { id: "#100", tag: "CRO Audit", title: "Run a 10-point conversion audit on any landing page", text: `Audit <span class="prompt-var">[LANDING PAGE COPY]</span> for <span class="prompt-var">[BUYER]</span>. Score Clarity, Friction, Urgency, and Proof, then rewrite the 3 weakest sections.`, outcome: "Actionable CRO rewrite", masked: true }
    ]
  };

  const grid = document.getElementById("prompts-grid");
  const tabs = document.querySelectorAll(".tab-btn");

  function renderPrompts(cat) {
    grid.innerHTML = prompts[cat].map(p => {
      const raw = p.text.replace(/<[^>]*>/g, "");
      return `
        <article class="prompt-card">
          <div>
            <div class="prompt-meta">
              <span class="prompt-id">PROMPT ${p.id}</span>
              <span>${p.tag}</span>
            </div>
            <h4>"${p.title}"</h4>
            <div class="prompt-box ${p.masked ? "masked" : ""}">
              ${p.masked ? `<div class="reveal-overlay"><button type="button" class="reveal-btn">👁️ Reveal Prompt</button></div>` : ""}
              <div class="prompt-text">${p.text}</div>
            </div>
          </div>
          <div class="prompt-footer">
            <span>✦ ${p.outcome}</span>
            <button type="button" class="copy-btn" data-raw="${encodeURIComponent(raw)}">Copy Prompt</button>
          </div>
        </article>
      `;
    }).join("");

    grid.querySelectorAll(".reveal-btn").forEach(btn => {
      btn.addEventListener("click", () => btn.closest(".prompt-box").classList.add("revealed"));
    });

    grid.querySelectorAll(".copy-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const text = decodeURIComponent(btn.dataset.raw);
        btn.closest(".prompt-card").querySelector(".prompt-box").classList.add("revealed");
        navigator.clipboard?.writeText(text);
        btn.textContent = "Copied!";
        setTimeout(() => { btn.textContent = "Copy Prompt"; }, 1600);
      });
    });
  }

  function selectTab(key) {
    tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === key));
    renderPrompts(key);
  }

  tabs.forEach(t => t.addEventListener("click", () => selectTab(t.dataset.tab)));

  document.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", () => {
      selectTab(card.dataset.targetTab);
      document.getElementById("preview").scrollIntoView({ behavior: "smooth" });
    });
  });

  renderPrompts("copywriting");

  /* ======================================================================
     3. SCROLL REVEAL & STICKY NAVBAR/BUY BAR
     ====================================================================== */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

  const navbar = document.getElementById("navbar");
  const stickyBar = document.getElementById("sticky-bar");

  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    navbar.classList.toggle("scrolled", y > 40);
    stickyBar.classList.toggle("visible", y > 550);
  }, { passive: true });
})();
