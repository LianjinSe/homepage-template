(() => {
  const root = document.documentElement;
  const menu = document.getElementById('mobile-menu');
  const menuToggle = document.querySelector('.menu-toggle');
  const themeToggle = document.querySelector('.theme-toggle');
  const desktop = window.matchMedia('(min-width: 701px)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealElements = Array.from(document.querySelectorAll('[data-reveal]'));

  // Content is visible without JavaScript; reveal it only once, as it enters view.
  let revealObserver;
  function revealWithin(target) {
    if (!target || !target.matches('.page-section')) return;
    [target, ...target.querySelectorAll('[data-reveal]')].forEach(element => {
      element.classList.remove('is-pending');
      revealObserver?.unobserve(element);
    });
  }
  if (!reduceMotion.matches && 'IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('is-pending');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .05, rootMargin: '0px 0px -24px 0px' });
    revealElements.forEach(element => {
      if (element.getBoundingClientRect().top >= innerHeight) element.classList.add('is-pending');
      revealObserver.observe(element);
    });
  }
  reduceMotion.addEventListener('change', () => {
    if (reduceMotion.matches) {
      revealElements.forEach(element => element.classList.remove('is-pending'));
      revealObserver?.disconnect();
    }
  });
  document.addEventListener('pointerdown', () => { root.dataset.input = 'pointer'; }, { passive: true });
  document.addEventListener('keydown', event => {
    root.dataset.input = 'keyboard';
    if (event.key === 'Escape' && !menu.hidden) closeMenu(true);
  });
  document.addEventListener('focusin', event => {
    const section = event.target.closest('.page-section');
    if (section) revealWithin(section);
  });

  function closeMenu(restoreFocus = false) {
    menu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '打开导航菜单');
    if (restoreFocus) menuToggle.focus();
  }
  menuToggle.hidden = false;
  themeToggle.hidden = false;
  menuToggle.addEventListener('click', () => {
    const opening = menu.hidden;
    menu.hidden = !opening;
    menuToggle.setAttribute('aria-expanded', String(opening));
    menuToggle.setAttribute('aria-label', opening ? '关闭导航菜单' : '打开导航菜单');
  });
  document.addEventListener('click', event => {
    if (!menu.hidden && !event.target.closest('.site-header')) closeMenu();
  });
  desktop.addEventListener('change', () => { if (desktop.matches) closeMenu(); });

  // Every navigation item and hero action points to a real section on this page.
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const hash = link.getAttribute('href');
      const target = document.getElementById(hash.slice(1));
      if (!target) return;
      event.preventDefault();
      closeMenu();
      revealWithin(target);
      if (location.hash !== hash) history.pushState(null, '', hash);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      const behavior = reduceMotion.matches || event.detail === 0 ? 'instant' : 'smooth';
      target.scrollIntoView({ behavior, block: 'start' });
      scheduleScrollUpdate();
    });
  });
  function revealLocation() {
    revealWithin(document.getElementById(location.hash.slice(1)));
    scheduleScrollUpdate();
  }
  window.addEventListener('hashchange', revealLocation);
  window.addEventListener('popstate', revealLocation);

  function updateTheme() {
    const light = root.dataset.theme === 'light';
    const label = light ? '切换到深色模式' : '切换到浅色模式';
    themeToggle.setAttribute('aria-label', label);
    themeToggle.title = label;
    document.querySelector('meta[name="theme-color"]').content = light ? '#edf1f8' : '#111722';
  }
  updateTheme();
  themeToggle.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('homepage-theme', root.dataset.theme); } catch (_) {}
    updateTheme();
  });

  const emailDialog = document.getElementById('email-dialog');
  document.querySelector('[data-email]').addEventListener('click', event => {
    event.preventDefault();
    const trigger = event.currentTarget;
    emailDialog.addEventListener('close', () => trigger.focus({ preventScroll: true }), { once: true });
    emailDialog.showModal();
  });
  emailDialog.querySelector('[data-close]').addEventListener('click', () => emailDialog.close());
  emailDialog.addEventListener('click', event => {
    if (event.target !== emailDialog) return;
    const box = emailDialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) emailDialog.close();
  });
  const status = document.querySelector('.copy-status');
  document.getElementById('copy-email').addEventListener('click', async () => {
    const email = document.querySelector('.email-address').textContent.trim();
    try {
      await navigator.clipboard.writeText(email);
      status.textContent = '邮箱已复制，可以粘贴到邮件应用中。';
    } catch (_) {
      status.textContent = '暂时无法自动复制，请长按或选中上方邮箱复制。';
    }
  });
  emailDialog.addEventListener('close', () => { status.textContent = ''; });

  const sectionLinks = Array.from(document.querySelectorAll('.desktop-nav a[href^="#"], .mobile-menu a[href^="#"]'));
  const sections = Array.from(document.querySelectorAll('.page-section'));
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.reading-progress');
  let scheduled = false;
  function updateScroll() {
    const threshold = header.getBoundingClientRect().bottom + 40;
    let current = '#top';
    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= threshold) current = `#${section.id}`;
    });
    const max = root.scrollHeight - innerHeight;
    if (max > 0 && scrollY >= max - 2) current = '#contact';
    sectionLinks.forEach(link => {
      const active = link.getAttribute('href') === current;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', current === '#top' ? 'page' : 'location');
      else link.removeAttribute('aria-current');
    });
    progress.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
    scheduled = false;
  }
  function scheduleScrollUpdate() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); }
  }
  window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
  window.addEventListener('resize', scheduleScrollUpdate);
  window.addEventListener('pageshow', revealLocation);
  document.fonts?.ready.then(scheduleScrollUpdate);
  revealLocation();
})();
