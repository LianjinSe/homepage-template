(() => {
  const scenery = document.querySelector('.scenery');
  const hero = document.querySelector('.hero');
  const toggle = document.querySelector('.wallpaper-toggle');
  if (!scenery || !hero || !toggle) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 700px)');
  let enabled = !navigator.connection?.saveData;
  try {
    const saved = localStorage.getItem('homepage-wallpaper');
    if (saved === 'paused') enabled = false;
    if (saved === 'playing') enabled = true;
  } catch (_) {}

  let renderer;
  let initializing = false;
  let unavailable = false;
  let inView = true;
  let pageActive = true;
  let frame = 0;
  let lastFrame = 0;
  let time = 0;
  let resizeTimer;

  // Warp the supplied photograph only in the water, leaving the horizon and
  // foreground rocks anchored. Bright existing star pixels gently modulate.
  const vertexSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;
  const fragmentSource = `
    precision mediump float;
    uniform sampler2D u_image;
    uniform vec2 u_image_size;
    uniform vec2 u_view_size;
    uniform float u_position_x;
    uniform float u_time;
    varying vec2 v_uv;
    float luminance(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
    void main() {
      vec2 screen = vec2(v_uv.x, 1.0 - v_uv.y);
      float cover = max(u_view_size.x / u_image_size.x, u_view_size.y / u_image_size.y);
      vec2 scaled = u_image_size * cover;
      vec2 uv = (screen * u_view_size + (scaled - u_view_size) * vec2(u_position_x, 0.5)) / scaled;
      vec3 original = texture2D(u_image, uv).rgb;
      float water = smoothstep(0.566, 0.615, uv.y) * (1.0 - smoothstep(0.80, 0.94, uv.y));
      water *= smoothstep(0.12, 0.43, uv.x);
      water *= smoothstep(0.035, 0.17, luminance(original));
      float wave = sin(uv.y * 175.0 - u_time * 1.2 + uv.x * 13.0);
      float fine = sin(uv.y * 380.0 + uv.x * 28.0 - u_time * 0.8);
      vec2 displaced = uv + water * vec2(0.0014 * wave, 0.00075 * fine);
      vec3 color = texture2D(u_image, displaced).rgb;
      color *= 1.0 + water * 0.025 * sin(uv.y * 190.0 - u_time * 1.1);
      if (uv.y < 0.48) {
        vec2 pixel = 2.0 / u_image_size;
        float neighbors = (
          luminance(texture2D(u_image, uv + vec2(pixel.x, 0.0)).rgb) +
          luminance(texture2D(u_image, uv - vec2(pixel.x, 0.0)).rgb) +
          luminance(texture2D(u_image, uv + vec2(0.0, pixel.y)).rgb) +
          luminance(texture2D(u_image, uv - vec2(0.0, pixel.y)).rgb)
        ) * 0.25;
        float star = smoothstep(0.06, 0.22, luminance(original) - neighbors);
        float pulse = sin(u_time * 0.85 + uv.x * 130.0 + uv.y * 95.0);
        color *= 1.0 + star * pulse * 0.20;
      }
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
  }
  function shouldPlay() {
    return enabled && !reduced.matches && inView && pageActive && !document.hidden && !unavailable;
  }
  function fail() {
    unavailable = true;
    stop();
    renderer?.dispose();
    renderer = null;
    scenery.dataset.wallpaper = 'static';
    toggle.hidden = true;
  }
  function draw(now) {
    frame = 0;
    if (!renderer) return;
    if (!shouldPlay()) { update(); return; }
    const interval = 1000 / (mobile.matches ? 20 : 24);
    if (!lastFrame || now - lastFrame >= interval) {
      const elapsed = lastFrame ? Math.min((now - lastFrame) / 1000, 0.1) : 0;
      time += elapsed;
      lastFrame = now;
      renderer.render(time);
    }
    frame = requestAnimationFrame(draw);
  }
  function update() {
    const suppressed = reduced.matches || unavailable;
    toggle.hidden = suppressed;
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.setAttribute('aria-label', enabled ? '暂停壁纸动效' : '播放壁纸动效');
    toggle.querySelector('span').textContent = enabled ? '暂停壁纸' : '播放壁纸';
    toggle.querySelector('.icon').className = `icon ${enabled ? 'icon-pause' : 'icon-play'}`;
    if (renderer) renderer.canvas.hidden = suppressed;
    if (shouldPlay()) {
      if (!renderer) {
        scenery.dataset.wallpaper = 'loading';
        initialize();
      } else {
        scenery.dataset.wallpaper = 'playing';
        if (!frame) frame = requestAnimationFrame(draw);
      }
    } else {
      stop();
      scenery.dataset.wallpaper = suppressed ? 'static' : enabled ? 'suspended' : 'paused';
    }
  }

  async function initialize() {
    if (initializing || unavailable || renderer) return;
    initializing = true;
    const canvas = document.createElement('canvas');
    canvas.className = 'scenery-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    let gl;
    try { gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' }); } catch (_) {}
    if (!gl) {
      initializing = false;
      fail();
      return;
    }
    const resources = [];
    let disposed = false;
    let sourceVersion = 0;
    let source = '';
    function dispose() {
      if (disposed) return;
      disposed = true;
      sourceVersion++;
      canvas.remove();
      resources.reverse().forEach(clean => clean());
    }
    try {
      function shader(type, code) {
        const result = gl.createShader(type);
        if (!result) throw new Error('Shader unavailable');
        resources.push(() => gl.deleteShader(result));
        gl.shaderSource(result, code);
        gl.compileShader(result);
        if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw new Error('Shader compilation failed');
        return result;
      }
      const program = gl.createProgram();
      if (!program) throw new Error('Program unavailable');
      resources.push(() => gl.deleteProgram(program));
      gl.attachShader(program, shader(gl.VERTEX_SHADER, vertexSource));
      gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragmentSource));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Program link failed');
      gl.useProgram(program);
      const buffer = gl.createBuffer();
      resources.push(() => gl.deleteBuffer(buffer));
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      const texture = gl.createTexture();
      resources.push(() => gl.deleteTexture(texture));
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);
      const imageSize = gl.getUniformLocation(program, 'u_image_size');
      const viewSize = gl.getUniformLocation(program, 'u_view_size');
      const positionX = gl.getUniformLocation(program, 'u_position_x');
      const timeUniform = gl.getUniformLocation(program, 'u_time');
      function render(value) {
        if (disposed || gl.isContextLost()) return;
        gl.uniform1f(timeUniform, value);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      function resize() {
        const width = scenery.clientWidth;
        const height = scenery.clientHeight;
        const budget = mobile.matches ? 480000 : 1250000;
        const ratio = Math.min(devicePixelRatio || 1, 1.25, Math.sqrt(budget / (width * height)));
        canvas.width = Math.max(1, Math.round(width * ratio));
        canvas.height = Math.max(1, Math.round(height * ratio));
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(viewSize, width, height);
        gl.uniform1f(positionX, mobile.matches ? 0.58 : 0.5);
      }
      async function loadImage() {
        const next = mobile.matches ? 'assets/coast-night-mobile.webp' : 'assets/coast-night.webp';
        const version = ++sourceVersion;
        if (source === next) return;
        const image = new Image();
        image.src = next;
        await image.decode();
        if (disposed || version !== sourceVersion) return;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.uniform2f(imageSize, image.naturalWidth, image.naturalHeight);
        source = next;
      }
      canvas.addEventListener('webglcontextlost', fail);
      await loadImage();
      if (unavailable) { dispose(); return; }
      resize();
      render(time);
      renderer = { canvas, render, resize, loadImage, dispose };
      scenery.prepend(canvas);
      update();
    } catch (_) {
      dispose();
      fail();
    } finally {
      initializing = false;
    }
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
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(async () => {
      if (!renderer) return;
      try {
        const current = renderer;
        await current.loadImage();
        if (current !== renderer) return;
        current.resize();
        current.render(time);
      } catch (_) { fail(); }
    }, 120);
  }, { passive: true });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      update();
    });
    observer.observe(hero);
  }
  update();
})();
