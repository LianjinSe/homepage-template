(() => {
  const root = document.documentElement;
  const menu = document.getElementById('mobile-menu');
  const menuToggle = document.querySelector('.menu-toggle');
  const themeToggle = document.querySelector('.theme-toggle');
  const desktop = matchMedia('(min-width: 701px)');
  const emailDialog = document.getElementById('email-dialog');

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
  document.addEventListener('pointerdown', () => { root.dataset.input = 'pointer'; }, { passive: true });

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

  const panels = Array.from(document.querySelectorAll('#main > .hero, #main > .page-section'));
  if (panels.length < 2) return;
  const hashes = ['#top', ...panels.slice(1).map(panel => `#${panel.id}`)];
  const names = ['首页', '关于', '作品', '博客', '联系'];
  const header = document.querySelector('.site-header');
  const footer = document.querySelector('.site-footer');
  const progress = document.querySelector('.reading-progress');
  const navLinks = Array.from(document.querySelectorAll('.desktop-nav a[href^="#"], .mobile-menu a[href^="#"]'));
  const announcement = document.createElement('p');
  announcement.className = 'screen-reader-only';
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  document.body.append(announcement);

  let current = Math.max(0, hashes.indexOf(location.hash));
  panels.forEach((panel, index) => {
    if (panel.classList.contains('page-section')) {
      const content = document.createElement('div');
      content.className = 'screen-content glass';
      while (panel.firstChild) content.append(panel.firstChild);
      panel.classList.remove('glass');
      panel.append(content);
    }
    panel.classList.add('screen-panel');
    panel.setAttribute('tabindex', '-1');
    panel.classList.toggle('is-current', index === current);
    panel.inert = index !== current;
    panel.setAttribute('aria-hidden', String(index !== current));
    panel.querySelectorAll('.is-pending').forEach(element => element.classList.remove('is-pending'));
  });
  history.scrollRestoration = 'manual';
  root.classList.add('section-mode');
  window.scrollTo({ top: 0, behavior: 'instant' });

  function updateNavigation() {
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === hashes[current];
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', current === 0 ? 'page' : 'location');
      else link.removeAttribute('aria-current');
    });
    progress.style.transform = `scaleX(${current / (panels.length - 1)})`;
  }
  function updateFrame() {
    const top = Math.ceil(header.getBoundingClientRect().bottom + (desktop.matches ? 18 : 14));
    const bottom = Math.ceil(innerHeight - footer.getBoundingClientRect().top + 16);
    root.style.setProperty('--screen-top', `${top}px`);
    root.style.setProperty('--screen-bottom', `${bottom}px`);
  }
  function showScreen(index, { historyMode = 'push', focus = true } = {}) {
    if (index < 0 || index >= panels.length) return false;
    closeMenu();
    const changed = index !== current;
    current = index;
    if (changed) panels[index].scrollTop = 0;
    // CSS transitions retarget from their current opacity if navigation is interrupted.
    panels.forEach((panel, position) => {
      const active = position === index;
      panel.classList.toggle('is-current', active);
      panel.inert = !active;
      panel.setAttribute('aria-hidden', String(!active));
    });
    if (historyMode === 'push' && location.hash !== hashes[index]) history.pushState(null, '', hashes[index]);
    updateNavigation();
    if (focus) panels[index].focus({ preventScroll: true });
    if (changed) announcement.textContent = `第 ${index + 1} / ${panels.length} 屏，${names[index] || panels[index].getAttribute('aria-label') || ''}`;
    return changed;
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const hash = link.getAttribute('href');
      const index = hash === '#main' ? current : hash === '#home' ? 0 : hashes.indexOf(hash);
      if (index < 0) return;
      event.preventDefault();
      showScreen(index);
    });
  });
  function followLocation() {
    const index = location.hash === '#home' ? 0 : Math.max(0, hashes.indexOf(location.hash));
    showScreen(index, { historyMode: 'none', focus: false });
  }
  window.addEventListener('popstate', followLocation);
  window.addEventListener('hashchange', followLocation);

  function blockedByControl(event) {
    return emailDialog.open || !menu.hidden || event.target instanceof Element && !!event.target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="slider"]');
  }
  document.addEventListener('keydown', event => {
    root.dataset.input = 'keyboard';
    if (event.key === 'Escape' && !menu.hidden) { closeMenu(true); return; }
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || blockedByControl(event)) return;
    const steps = { ArrowDown: 1, ArrowRight: 1, PageDown: 1, ArrowUp: -1, ArrowLeft: -1, PageUp: -1 };
    const step = steps[event.key];
    if (step === undefined && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    if (event.repeat) return;
    showScreen(event.key === 'Home' ? 0 : event.key === 'End' ? panels.length - 1 : current + step);
  });

  function canReadMore(direction) {
    const panel = panels[current];
    if (current === 0) return false;
    return direction > 0 ? panel.scrollTop + panel.clientHeight < panel.scrollHeight - 2 : panel.scrollTop > 2;
  }
  let wheel = { time: 0, direction: 0, delta: 0, changed: false, read: false };
  window.addEventListener('wheel', event => {
    if (event.ctrlKey || event.defaultPrevented || blockedByControl(event) || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
    root.dataset.input = 'pointer';
    const now = performance.now();
    const direction = Math.sign(event.deltaY);
    if (now - wheel.time > 180 || direction !== wheel.direction) wheel = { time: now, direction, delta: 0, changed: false, read: false };
    wheel.time = now;
    if (wheel.changed) { event.preventDefault(); return; }
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? panels[current].clientHeight : 1);
    if (canReadMore(direction)) {
      wheel.read = true;
      wheel.delta = 0;
      if (!panels[current].contains(event.target)) {
        event.preventDefault();
        panels[current].scrollTop += delta;
      }
      return;
    }
    event.preventDefault();
    // A gesture that just read to the edge must end before it turns the page.
    if (wheel.read) return;
    wheel.delta += Math.abs(delta);
    if (wheel.delta >= 48) {
      wheel.changed = showScreen(current + direction);
      wheel.delta = 0;
    }
  }, { passive: false });

  let touch;
  window.addEventListener('touchstart', event => {
    touch = null;
    if (event.touches.length !== 1 || blockedByControl(event)) return;
    const point = event.touches[0];
    touch = { x: point.clientX, y: point.clientY, index: current, upEdge: !canReadMore(-1), downEdge: !canReadMore(1) };
  }, { passive: true });
  window.addEventListener('touchend', event => {
    if (!touch || event.changedTouches.length !== 1 || touch.index !== current || blockedByControl(event)) { touch = null; return; }
    const point = event.changedTouches[0];
    const dy = touch.y - point.clientY;
    const dx = touch.x - point.clientX;
    const atEdge = dy > 0 ? touch.downEdge : touch.upEdge;
    if (Math.abs(dy) >= 64 && Math.abs(dy) > Math.abs(dx) * 1.3 && atEdge) showScreen(current + Math.sign(dy));
    touch = null;
  }, { passive: true });
  window.addEventListener('touchcancel', () => { touch = null; }, { passive: true });

  const frameObserver = new ResizeObserver(updateFrame);
  frameObserver.observe(header);
  frameObserver.observe(footer);
  window.addEventListener('resize', updateFrame);
  window.addEventListener('pageshow', () => { followLocation(); updateFrame(); });
  document.fonts?.ready.then(updateFrame);
  updateNavigation();
  updateFrame();
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('section-ready')));
})();
