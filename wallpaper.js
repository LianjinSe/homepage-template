(() => {
  const scenery = document.querySelector('.scenery');
  const art = scenery?.querySelector('.coast-art');
  const hero = document.querySelector('.hero');
  const toggle = document.querySelector('.wallpaper-toggle');
  if (!art || !hero || !toggle) return;

  // SVG/CSS draws and animates the entire scene. JavaScript only manages
  // playback preference and page visibility; it never draws a frame.
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = !navigator.connection?.saveData;
  try {
    const saved = localStorage.getItem('homepage-wallpaper');
    if (saved === 'paused') enabled = false;
    if (saved === 'playing') enabled = true;
  } catch (_) {}
  let inView = hero.getBoundingClientRect().bottom > 0 && hero.getBoundingClientRect().top < innerHeight;
  let pageActive = true;

  function update() {
    const playing = enabled && !reduced.matches && inView && pageActive && !document.hidden;
    scenery.dataset.wallpaper = reduced.matches ? 'static' : playing ? 'playing' : enabled ? 'suspended' : 'paused';
    toggle.hidden = false;
    toggle.disabled = reduced.matches;
    toggle.setAttribute('aria-pressed', String(enabled && !reduced.matches));
    toggle.setAttribute('aria-label', reduced.matches ? '系统已启用减少动态效果，壁纸保持静止' : enabled ? '暂停动态壁纸' : '播放动态壁纸');
    toggle.title = toggle.getAttribute('aria-label');
    toggle.querySelector('span').textContent = reduced.matches ? '系统已关闭动效' : enabled ? '暂停动态壁纸' : '播放动态壁纸';
    toggle.querySelector('.icon').className = `icon ${enabled ? 'icon-pause' : 'icon-play'}`;
  }
  toggle.addEventListener('click', () => {
    enabled = !enabled;
    try { localStorage.setItem('homepage-wallpaper', enabled ? 'playing' : 'paused'); } catch (_) {}
    update();
  });
  reduced.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  window.addEventListener('pagehide', () => { pageActive = false; update(); });
  window.addEventListener('pageshow', () => { pageActive = true; update(); });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      update();
    });
    observer.observe(hero);
  }
  update();
})();
