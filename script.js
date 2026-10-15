(() => {
  const root = document.documentElement;
  const menu = document.getElementById('mobile-menu');
  const menuToggle = document.querySelector('.menu-toggle');
  const themeToggle = document.querySelector('.theme-toggle');
  const desktop = window.matchMedia('(min-width: 701px)');

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
  menu.addEventListener('click', event => {
    if (event.target.closest('a, button')) closeMenu();
  });
  document.addEventListener('click', event => {
    if (!menu.hidden && !event.target.closest('.site-header')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) closeMenu(true);
  });
  desktop.addEventListener('change', () => { if (desktop.matches) closeMenu(); });

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

  // Native dialogs provide keyboard focus containment and Escape dismissal.
  function openDialog(id) {
    const dialog = document.getElementById(id);
    if (!dialog || dialog.open) return;
    const menuWasOpen = !menu.hidden;
    closeMenu();
    const trigger = menuWasOpen ? menuToggle : document.activeElement;
    dialog.addEventListener('close', () => {
      if (trigger instanceof HTMLElement) trigger.focus({ preventScroll: true });
    }, { once: true });
    dialog.showModal();
  }
  document.querySelectorAll('[data-dialog]').forEach(trigger => {
    trigger.addEventListener('click', () => openDialog(trigger.dataset.dialog));
  });
  document.querySelector('[data-email]').addEventListener('click', event => {
    event.preventDefault();
    openDialog('email-dialog');
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
  });

  const copyButton = document.getElementById('copy-email');
  const status = document.querySelector('.copy-status');
  copyButton.addEventListener('click', async () => {
    const email = document.querySelector('.email-address').textContent.trim();
    try {
      await navigator.clipboard.writeText(email);
      status.textContent = '邮箱已复制，可以粘贴到邮件应用中。';
    } catch (_) {
      // Keep a usable mailto link and selectable address if the browser denies copying.
      status.textContent = '暂时无法自动复制，请长按或选中上方邮箱复制。';
    }
  });
  document.getElementById('email-dialog').addEventListener('close', () => { status.textContent = ''; });

  const sectionLinks = Array.from(document.querySelectorAll('.desktop-nav a[href^="#"]'));
  let scheduled = false;
  function markSection() {
    const contact = document.getElementById('contact').getBoundingClientRect();
    const work = document.getElementById('work').getBoundingClientRect();
    const hash = window.location.hash;
    const targetVisible = hash === '#contact' ? contact.top < innerHeight && contact.bottom > 140 : hash === '#work' && work.top < innerHeight && work.bottom > 140;
    const current = targetVisible && window.scrollY > 0 ? hash : work.top <= 190 ? '#work' : '#top';
    sectionLinks.forEach(link => {
      const active = link.getAttribute('href') === current;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', current === '#top' ? 'page' : 'location');
      else link.removeAttribute('aria-current');
    });
    scheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(markSection); }
  }, { passive: true });
  window.addEventListener('hashchange', markSection);
  markSection();
})();
