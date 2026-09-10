(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Smooth scroll for data-scroll targets ──────────────────
  document.querySelectorAll("[data-scroll]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-scroll");
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
        closeMobileMenu();
      }
    });
  });

  // ── Click-to-copy ─────────────────────────────────────────
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.getAttribute("data-copy") || "";
      const label = btn.getAttribute("data-copy-label") || btn.textContent;
      const done = () => {
        btn.textContent = "已复制";
        btn.classList.add("is-copied");
        window.setTimeout(() => {
          btn.textContent = label;
          btn.classList.remove("is-copied");
        }, 1800);
      };
      try {
        await navigator.clipboard.writeText(text);
        done();
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
          done();
        } catch {
        }
        ta.remove();
      }
    });
  });

  // ── Mobile menu ────────────────────────────────────────────
  const toggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const body = document.body;

  function openMobileMenu() {
    if (!mobileMenu || !toggle) return;
    mobileMenu.hidden = false;
    // Force reflow so transition plays
    void mobileMenu.offsetWidth;
    mobileMenu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "关闭菜单");
    body.classList.add("menu-open");
  }

  function closeMobileMenu() {
    if (!mobileMenu || !toggle) return;
    mobileMenu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "打开菜单");
    body.classList.remove("menu-open");
    window.setTimeout(() => {
      if (!mobileMenu.classList.contains("is-open")) {
        mobileMenu.hidden = true;
      }
    }, 350);
  }

  if (toggle && mobileMenu) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      if (open) closeMobileMenu();
      else openMobileMenu();
    });

    mobileMenu.querySelectorAll("[data-mobile-nav]").forEach((link) => {
      link.addEventListener("click", () => closeMobileMenu());
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMobileMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) closeMobileMenu();
    });
  }

  // ── Scroll reveal ──────────────────────────────────────────
  const revealTargets = document.querySelectorAll(
    ".hero-title, .hero-sub, .hero-actions, .hero-meta, .section-label, .section-title, .about-copy, .curiosity, .work-item, .note, .section-more, .contact-panel"
  );

  revealTargets.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = reduceMotion ? "0ms" : `${Math.min(i % 6, 4) * 60}ms`;
  });

  if (reduceMotion) {
    revealTargets.forEach((el) => el.classList.add("visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealTargets.forEach((el) => observer.observe(el));
  }

  // ── Nav border + active section + scroll progress ──────────
  const nav = document.querySelector(".nav");
  const progress = document.querySelector(".progress");
  const sections = ["about", "work", "blog", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navAnchors = document.querySelectorAll("[data-nav]");
  let ticking = false;

  const onScroll = () => {
    if (nav) {
      nav.classList.toggle("is-scrolled", window.scrollY > 24);
    }

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      progress.style.transform = `scaleX(${ratio})`;
    }

    const y = window.scrollY + 120;
    let current = null;

    for (const section of sections) {
      if (section.offsetTop <= y) current = section.id;
    }

    navAnchors.forEach((a) => {
      const href = a.getAttribute("href") || "";
      a.classList.toggle("is-active", href === `#${current}`);
    });
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
    },
    { passive: true }
  );

  onScroll();

  // ── Card spotlight (mouse-tracking highlight) ──────────────
  document.querySelectorAll(".note, .contact-panel").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
  });

  // ── Cursor glow (lerped ambient light) ─────────────────────
  const cursorGlow = document.getElementById("cursor-glow");
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (cursorGlow && !reduceMotion && finePointer) {
    let gx = window.innerWidth / 2;
    let gy = window.innerHeight / 3;
    let tx = gx;
    let ty = gy;

    window.addEventListener(
      "pointermove",
      (e) => {
        tx = e.clientX;
        ty = e.clientY;
      },
      { passive: true }
    );

    const glide = () => {
      gx += (tx - gx) * 0.08;
      gy += (ty - gy) * 0.08;
      cursorGlow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`;
      requestAnimationFrame(glide);
    };
    requestAnimationFrame(glide);
  } else if (cursorGlow) {
    cursorGlow.remove();
  }

  // ── Starfield ──────────────────────────────────────────────
  const canvas = document.getElementById("stars");
  if (!canvas || reduceMotion) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let stars = [];
  let width = 0;
  let height = 0;
  let animId = 0;
  let last = 0;

  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * DPR);
    canvas.height = Math.floor(height * DPR);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    seedStars();
  }

  function seedStars() {
    const count = Math.floor((width * height) / 14000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.1 + 0.2,
      a: Math.random() * 0.55 + 0.15,
      tw: Math.random() * Math.PI * 2,
      sp: Math.random() * 0.6 + 0.2,
    }));
  }

  function draw(ts) {
    if (!last) last = ts;
    const dt = Math.min((ts - last) / 1000, 0.05);
    last = ts;

    ctx.clearRect(0, 0, width, height);

    for (const s of stars) {
      s.tw += dt * s.sp;
      const alpha = s.a * (0.55 + 0.45 * Math.sin(s.tw));
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 120);
  });

  // Pause when tab is hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
      last = 0;
    } else {
      animId = requestAnimationFrame(draw);
    }
  });

  resize();
  animId = requestAnimationFrame(draw);
})();
