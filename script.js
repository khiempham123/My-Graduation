(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motionPaused = prefersReduced;

  if (motionPaused) {
    body.classList.add('motion-paused');
  }

  /* ------------------------------------------------------------------------
     1. Theme Switcher (Light Ivory Gold <-> Dark Royal Navy Gold)
     ------------------------------------------------------------------------ */
  var themeToggle = document.getElementById('theme-toggle');

  function getResolvedTheme() {
    if (root.dataset.theme === 'dark' || root.dataset.theme === 'light') {
      return root.dataset.theme;
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function setTheme(theme) {
    root.dataset.theme = theme;
    try {
      sessionStorage.setItem('grad-theme', theme);
    } catch (e) {}
    updateThemeMeta(theme);
  }

  function updateThemeMeta(theme) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#070f1c' : '#eee7da');
    }
  }

  updateThemeMeta(getResolvedTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = getResolvedTheme() === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
  }

  /* ------------------------------------------------------------------------
     2. Canvas Ambient Golden Stardust + Luxury Metallic Foil Confetti
     ------------------------------------------------------------------------ */
  var canvas = document.getElementById('fx-canvas');
  var ctx = canvas ? canvas.getContext('2d') : null;
  var width = 0;
  var height = 0;
  var dpr = 1;
  var dustMotes = [];
  var confettiPieces = [];
  var rafId = null;

  var GOLD_LIGHT = ['#b68937', '#d8b264', '#ecd394', '#1b375e', '#c9a155'];
  var GOLD_DARK = ['#f8e5b4', '#e2be76', '#c99d4e', '#fff6dc', '#8cb4e8'];

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initDust() {
    dustMotes = [];
    var count = Math.min(48, Math.max(22, Math.floor((width * height) / 28000)));
    for (var i = 0; i < count; i++) {
      dustMotes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1.1 + Math.random() * 2.8,
        vx: (Math.random() - 0.5) * 0.22,
        vy: -0.14 - Math.random() * 0.28,
        alpha: 0.18 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.012 + Math.random() * 0.02,
        isStar: Math.random() < 0.24
      });
    }
  }

  function burstConfetti(originX, originY, count) {
    if (!canvas || motionPaused) return;
    var cx = typeof originX === 'number' ? originX : width * 0.5;
    var cy = typeof originY === 'number' ? originY : height * 0.42;
    var total = count || 72;
    var palette = getResolvedTheme() === 'dark' ? GOLD_DARK : GOLD_LIGHT;

    for (var i = 0; i < total; i++) {
      var angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.45;
      var speed = 3.2 + Math.random() * 6.8;
      confettiPieces.push({
        x: cx + (Math.random() - 0.5) * 32,
        y: cy + (Math.random() - 0.5) * 24,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        w: 4.5 + Math.random() * 5.5,
        h: 2.5 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.18,
        tilt: Math.random() * Math.PI * 2,
        vtilt: 0.08 + Math.random() * 0.12,
        color: palette[i % palette.length],
        life: 1,
        decay: 0.0055 + Math.random() * 0.0045,
        shape: Math.random() < 0.22 ? 'star' : 'foil'
      });
    }
    ensureAnimationLoop();
  }

  function drawFourPointStar(x, y, r, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(r * 0.18, -r * 0.18, r, 0);
    ctx.quadraticCurveTo(r * 0.18, r * 0.18, 0, r);
    ctx.quadraticCurveTo(-r * 0.18, r * 0.18, -r, 0);
    ctx.quadraticCurveTo(-r * 0.18, -r * 0.18, 0, -r);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawFrame() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    var isDark = getResolvedTheme() === 'dark';
    var moteColor = isDark ? 'rgba(242, 212, 146,' : 'rgba(182, 138, 56,';

    for (var i = 0; i < dustMotes.length; i++) {
      var m = dustMotes[i];
      if (!motionPaused) {
        m.x += m.vx;
        m.y += m.vy;
        m.phase += m.twinkleSpeed;
        if (m.y < -12) {
          m.y = height + 12;
          m.x = Math.random() * width;
        }
        if (m.x < -12) m.x = width + 12;
        if (m.x > width + 12) m.x = -12;
      }

      var twinkle = 0.55 + 0.45 * Math.sin(m.phase);
      var a = m.alpha * twinkle;

      if (m.isStar) {
        drawFourPointStar(m.x, m.y, m.r * 2.1, isDark ? '#f5dfa9' : '#c0933e', a);
      } else {
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = moteColor + a.toFixed(3) + ')';
        ctx.fill();
      }
    }

    for (var j = confettiPieces.length - 1; j >= 0; j--) {
      var c = confettiPieces[j];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += 0.12; // subtle gravity
      c.vx *= 0.988; // air drag
      c.rot += c.vrot;
      c.tilt += c.vtilt;
      c.life -= c.decay;

      if (c.life <= 0 || c.y > height + 30) {
        confettiPieces.splice(j, 1);
        continue;
      }

      if (c.shape === 'star') {
        drawFourPointStar(c.x, c.y, c.w * 0.72, c.color, Math.min(1, c.life * 1.2));
      } else {
        ctx.save();
        ctx.globalAlpha = Math.min(1, c.life * 1.2);
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.scale(1, Math.cos(c.tilt));
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();
      }
    }

    if (!motionPaused) {
      rafId = window.requestAnimationFrame(drawFrame);
    } else {
      rafId = null;
    }
  }

  function ensureAnimationLoop() {
    if (!ctx || rafId !== null) return;
    rafId = window.requestAnimationFrame(drawFrame);
  }

  if (canvas && ctx) {
    resizeCanvas();
    initDust();
    if (!motionPaused) {
      ensureAnimationLoop();
    } else {
      drawFrame(); // render one calm static frame
    }
    window.addEventListener('resize', function () {
      resizeCanvas();
      initDust();
      if (motionPaused) drawFrame();
    });
  }

  /* ------------------------------------------------------------------------
     3. Motion Pause / Resume Control (WCAG 2.2.2 Pause, Stop, Hide)
     ------------------------------------------------------------------------ */
  var motionToggle = document.getElementById('motion-toggle');
  var confettiBtn = document.getElementById('confetti-btn');

  function syncMotionButtonLabel() {
    if (!motionToggle) return;
    motionToggle.setAttribute(
      'aria-label',
      motionPaused ? 'Bật lại hiệu ứng chuyển động nền' : 'Tạm dừng hiệu ứng chuyển động nền'
    );
    motionToggle.setAttribute(
      'title',
      motionPaused ? 'Bật hiệu ứng nền' : 'Tạm dừng hiệu ứng nền'
    );
  }

  syncMotionButtonLabel();

  if (motionToggle) {
    motionToggle.addEventListener('click', function () {
      motionPaused = !motionPaused;
      body.classList.toggle('motion-paused', motionPaused);
      syncMotionButtonLabel();
      if (motionPaused) {
        if (rafId !== null) {
          window.cancelAnimationFrame(rafId);
          rafId = null;
        }
        confettiPieces = [];
        drawFrame();
        resetCardTilt();
      } else {
        ensureAnimationLoop();
      }
    });
  }

  if (confettiBtn) {
    confettiBtn.addEventListener('click', function () {
      if (motionPaused) {
        motionPaused = false;
        body.classList.remove('motion-paused');
        syncMotionButtonLabel();
      }
      var rect = confettiBtn.getBoundingClientRect();
      burstConfetti(width * 0.5, Math.min(height * 0.34, rect.bottom + 140), 82);
    });
  }

  /* ------------------------------------------------------------------------
     4. Ceremonial Wax-Seal Envelope Opening Choreography
     ------------------------------------------------------------------------ */
  var envelopeStage = document.getElementById('envelope-stage');
  var openBtn = document.getElementById('open-invitation-btn');
  var titleEl = document.getElementById('invitation-title');
  var isOpening = false;

  function openInvitation() {
    if (isOpening || root.classList.contains('card-opened')) return;
    isOpening = true;

    if (!envelopeStage || motionPaused) {
      root.classList.add('card-opened');
      if (titleEl) titleEl.focus({ preventScroll: true });
      return;
    }

    var sealRect = openBtn ? openBtn.getBoundingClientRect() : null;
    envelopeStage.classList.add('is-opening');

    if (sealRect) {
      burstConfetti(sealRect.left + sealRect.width / 2, sealRect.top + sealRect.height / 2, 86);
    } else {
      burstConfetti(width * 0.5, height * 0.45, 86);
    }

    window.setTimeout(function () {
      envelopeStage.classList.add('is-fading');
      root.classList.add('card-opened');
    }, 640);

    window.setTimeout(function () {
      if (titleEl) titleEl.focus({ preventScroll: true });
    }, 1150);
  }

  if (openBtn) {
    openBtn.addEventListener('click', openInvitation);
  }

  var envelopeBody = document.querySelector('.envelope-body');
  if (envelopeBody) {
    envelopeBody.addEventListener('click', function (e) {
      if (e.target === openBtn || (openBtn && openBtn.contains(e.target))) return;
      openInvitation();
    });
  }

  /* ------------------------------------------------------------------------
     5. Subtle Desktop 3D Foil Tilt & Specular Sheen on Card Hover
     ------------------------------------------------------------------------ */
  var card = document.getElementById('invitation-card');
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function resetCardTilt() {
    if (!card) return;
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
    card.style.setProperty('--sheen-opacity', '0');
  }

  if (card && finePointer) {
    card.addEventListener('pointermove', function (e) {
      if (motionPaused) return;
      var rect = card.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width;
      var py = (e.clientY - rect.top) / rect.height;
      var tiltY = (px - 0.5) * 3.6;
      var tiltX = (0.5 - py) * 3.2;

      card.style.setProperty('--tilt-x', tiltX.toFixed(2) + 'deg');
      card.style.setProperty('--tilt-y', tiltY.toFixed(2) + 'deg');
      card.style.setProperty('--sheen-x', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--sheen-y', (py * 100).toFixed(1) + '%');
      card.style.setProperty('--sheen-opacity', '1');
    });

    card.addEventListener('pointerleave', resetCardTilt);
  }

  /* ------------------------------------------------------------------------
     6. Calendar (.ics) Export
     ------------------------------------------------------------------------ */
  var addCalendarBtn = document.getElementById('add-calendar-btn');
  var statusEl = document.getElementById('action-status');

  function buildIcsContent() {
    // 15:00 - 17:30 GMT+7 on Sunday, December 6, 2026 => 08:00Z - 10:30Z
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Pham Gia Khiem//Graduation Invitation//VI',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:graduation-pham-gia-khiem-20261206@khiempham123.github.io',
      'DTSTAMP:20261123T040000Z',
      'DTSTART:20261206T080000Z',
      'DTEND:20261206T103000Z',
      'SUMMARY:Lễ Tốt Nghiệp — Phạm Gia Khiêm',
      'DESCRIPTION:Thư mời tham dự Lễ Tốt Nghiệp của Tân Cử nhân Công nghệ Thông tin Phạm Gia Khiêm.\\nBản đồ: https://www.google.com/maps/search/?api=1&query=University+of+Science+227+Nguyen+Van+Cu',
      'LOCATION:Giảng đường 1\\, Cơ sở 227 Nguyễn Văn Cừ\\, Trường Đại học Khoa học Tự nhiên\\, TP. Hồ Chí Minh',
      'URL:https://www.google.com/maps/search/?api=1&query=University+of+Science+227+Nguyen+Van+Cu',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  }

  if (addCalendarBtn) {
    addCalendarBtn.addEventListener('click', function () {
      var ics = buildIcsContent();
      var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      var url = URL.createObjectURL(blob);

      var link = document.createElement('a');
      link.href = url;
      link.download = 'Le-Tot-Nghiep-Pham-Gia-Khiem-06-12-2026.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);

      if (statusEl) {
        statusEl.textContent = 'Đã tải tệp lịch sự kiện (.ics).';
      }
    });
  }
})();
