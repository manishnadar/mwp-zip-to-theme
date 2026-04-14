/**
 * Divi-Equivalent Modules — Premium Dark Glassmorphic GrapesJS Blocks
 *
 * Covers all 40+ Divi module types:
 * Text, Image, Button, Video, Gallery, Slider, Blurb, Testimonial,
 * Team Member, Pricing, Toggle, Accordion, Tabs, Contact Form, Login,
 * Search, Email Optin, Portfolio, Blog, Shop, Counters, Bar Counter,
 * Circle Counter, Map, Social Follow, Divider, Spacer, Code, Audio,
 * Post Title, Comments, Flip Box, Countdown, Post Nav, CTA, Menu,
 * Icon, Icon List, Progress Bar, Rating, Sidebar, Breadcrumb, Fullwidth Header,
 * Fullwidth Slider, Fullwidth Image, Filterable Portfolio, and more.
 */

export default function registerDiviModules(editor) {
  const bm = editor.BlockManager;  /* ─── Design tokens (Premium Light Theme) ─────────────────────────────── */
  const c = {
    bg:       '#ffffff',
    card:     '#ffffff',
    border:   '#e2e8f0',
    glow:     'rgba(124,58,237,0.06)',
    txt:      '#0f172a',
    muted:    '#475569',
    dim:      '#94a3b8',
    accent:   'var(--ztt-primary,#7c3aed)',
    grad:     'var(--ztt-gradient,linear-gradient(135deg,#7c3aed 0%,#06b6d4 100%))',
  };
  const f = `font-family:'Inter',system-ui,sans-serif;`;

  /* ─── Small helpers ────────────────────────────────────────────────────── */
  const svg  = (d, extra='') =>
    `<span class="ztt-block-thumb-wrap">
      <svg viewBox="0 0 120 84" class="gjs-block-svg ztt-block-thumb-svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Module preview">
        <defs>
          <linearGradient id="zttDiviThumbBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#11172a"/>
            <stop offset="100%" stop-color="#0b1220"/>
          </linearGradient>
          <linearGradient id="zttDiviThumbCard" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1b2438"/>
            <stop offset="100%" stop-color="#121a2a"/>
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="118" height="82" rx="12" fill="url(#zttDiviThumbBg)" stroke="rgba(124,58,237,0.45)"/>
        <rect x="9" y="10" width="102" height="12" rx="6" fill="rgba(255,255,255,0.08)"/>
        <rect x="9" y="27" width="52" height="48" rx="9" fill="url(#zttDiviThumbCard)" stroke="rgba(255,255,255,0.08)"/>
        <rect x="66" y="27" width="45" height="21" rx="8" fill="rgba(6,182,212,0.16)" stroke="rgba(6,182,212,0.35)"/>
        <rect x="66" y="54" width="45" height="21" rx="8" fill="rgba(124,58,237,0.16)" stroke="rgba(124,58,237,0.35)"/>
        <g transform="translate(35,51)" stroke="${c.accent}" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round" ${extra}>
          <path d="${d}"/>
        </g>
      </svg>
    </span>`;

  const sec  = (inner, py='100px') =>
    `<section style="width:100%;background:${c.bg};padding:${py} 24px;
      box-sizing:border-box;${f}color:${c.txt};position:relative;overflow:hidden;">
      <div style="max-width:1200px;margin:0 auto;position:relative;z-index:2;">
        ${inner}
      </div>
    </section>`;

  const card = (inner, p='32px') =>
    `<div style="background:${c.card};border:1px solid ${c.border};border-radius:20px;
      padding:${p};box-shadow:0 10px 40px rgba(0,0,0,0.06),0 2px 4px rgba(0,0,0,0.02);
      transition:transform .3s,border-color .3s,box-shadow .3s;">
      ${inner}
    </div>`;

  const h2   = (t, sz='40px') =>
    `<h2 style="font-size:${sz};font-weight:800;color:${c.txt};
      letter-spacing:-.03em;line-height:1.15;margin:0 0 16px;">${t}</h2>`;

  const para = (t) =>
    `<p style="font-size:16px;color:${c.muted};line-height:1.7;margin:0 0 32px;">${t}</p>`;

  const btn  = (lbl, primary=true) => primary
    ? `<a href="#" style="display:inline-flex;align-items:center;padding:13px 26px;
        background:${c.grad};color:#fff;border-radius:12px;text-decoration:none;
        font-weight:600;font-size:14px;box-shadow:0 10px 20px rgba(124,58,237,.2);">${lbl}</a>`
    : `<a href="#" style="display:inline-flex;align-items:center;padding:13px 26px;
        background:#f8fafc;color:${c.txt};border:1px solid ${c.border};
        border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;">${lbl}</a>`;

  const img  = (h='240px', lbl='Image') =>
    `<div style="width:100%;height:${h};background:#f1f5f9;
      border:1px dashed ${c.border};border-radius:16px;display:flex;
      align-items:center;justify-content:center;color:${c.dim};
      font-size:12px;letter-spacing:.08em;text-transform:uppercase;">${lbl}</div>`;

  const input = (ph) =>
    `<input placeholder="${ph}" style="width:100%;box-sizing:border-box;
      background:#f8fafc;border:1px solid ${c.border};border-radius:12px;
      padding:14px 16px;color:${c.txt};outline:none;font-size:14px;${f}
      box-shadow:inset 0 1px 2px rgba(0,0,0,0.02);">`;

  /* ─── Categories ───────────────────────────────────────────────────────── */
  const CAT = {
    text:        'Divi — Text',
    media:       'Divi — Media',
    layout:      'Divi — Layout',
    interactive: 'Divi — Interactive',
    social:      'Divi — Social',
    marketing:   'Divi — Marketing',
    forms:       'Divi — Forms',
    blog:        'Divi — Blog / Post',
    shop:        'Divi — Shop',
    stats:       'Divi — Stats',
    nav:         'Divi — Navigation',
    fullwidth:   'Divi — Fullwidth',
  };

  /* ═══════════════════════════════════════════════════════════════════════
   *  TEXT MODULES
   * ═══════════════════════════════════════════════════════════════════════ */

  /** Text */
  bm.add('divi-text', {
    label: 'Text', category: CAT.text,
    media: svg('M17 6.1H3M21 12.1H3M15.1 18.1H3'),
    content: sec(`
      <div style="max-width:720px;">
        ${h2('Paragraph Heading')}
        ${para('Add rich text content here. This block supports full HTML formatting including bold, italic, links, and lists. Ideal for editorial sections and long-form content.')}
        ${para('A second paragraph with additional content. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.')}
      </div>
    `, '60px'),
  });

  /** Image */
  bm.add('divi-image', {
    label: 'Image', category: CAT.media,
    media: svg('M5 19l5-10 5 10M15 19l5-10 5 10M9 3h6v6H9z'),
    content: sec(`
      <div style="text-align:center;">
        ${img('420px', 'Drop your image here')}
        <p style="font-size:13px;color:${c.dim};margin-top:12px;">Optional caption for the image above</p>
      </div>
    `, '60px'),
  });

  /** Button */
  bm.add('divi-button', {
    label: 'Button', category: CAT.text,
    media: svg('M21 12H3M21 12l-7-7M21 12l-7 7'),
    content: `<div style="${f}padding:24px;text-align:center;">
      ${btn('Click Here')}
    </div>`,
  });

  /** Icon */
  bm.add('divi-icon', {
    label: 'Icon', category: CAT.text,
    media: svg('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21.02 7 14.14 2 9.27l6.91-1.01L12 2z'),
    content: `<div style="${f}padding:40px;text-align:center;">
      <div style="width:72px;height:72px;margin:0 auto 16px;background:rgba(129,140,248,.15);
        border:1px solid rgba(129,140,248,.3);border-radius:20px;display:flex;
        align-items:center;justify-content:center;font-size:32px;">⭐</div>
      <p style="color:${c.muted};font-size:14px;margin:0;">Icon label</p>
    </div>`,
  });

  /** Icon List */
  bm.add('divi-icon-list', {
    label: 'Icon List', category: CAT.text,
    media: svg('M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01'),
    content: sec(`
      ${h2('Why choose us?', '36px')}
      <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:18px;">
        ${['Lightning-fast performance on every device',
           'Enterprise-grade security built in by default',
           'Intuitive drag-and-drop visual editor',
           'Seamless integrations with 200+ tools'].map(t => `
          <li style="display:flex;align-items:center;gap:14px;font-size:16px;color:${c.muted};">
            <span style="flex-shrink:0;width:24px;height:24px;background:rgba(129,140,248,.2);
              color:${c.accent};border-radius:8px;display:flex;align-items:center;
              justify-content:center;font-size:13px;">✓</span>
            ${t}
          </li>`).join('')}
      </ul>
    `, '60px'),
  });

  /** Divider (Divi) */
  bm.add('divi-divider', {
    label: 'Divider', category: CAT.layout,
    media: svg('M2 12h20 M2 8h20 M2 16h20'),
    content: `<div style="padding:20px 24px;">
      <div style="width:100%;position:relative;height:1px;">
        <div style="position:absolute;inset:0;background:linear-gradient(90deg,
          transparent,${c.accent},transparent);opacity:.5;"></div>
      </div>
    </div>`,
  });

  /** Spacer */
  bm.add('divi-spacer', {
    label: 'Spacer', category: CAT.layout,
    media: svg('M21 21L3 3 M3 21L21 3'),
    content: `<div style="height:100px;width:100%;"> </div>`,
  });

  /** Code Module */
  bm.add('divi-code', {
    label: 'Code', category: CAT.text,
    media: svg('M16 18l6-6-6-6M8 6l-6 6 6 6'),
    content: `<div style="${f}padding:32px 24px;">
      <pre style="background:#f8fafc;border:1px solid ${c.border};border-radius:16px;
        padding:28px 32px;overflow-x:auto;font-family:'JetBrains Mono',monospace;
        font-size:14px;line-height:1.7;color:#1e293b;margin:0;box-shadow:inset 0 2px 4px rgba(0,0,0,0.02);">
<span style="color:#7c3aed">const</span> <span style="color:#2563eb">greet</span> = (<span style="color:#0891b2">name</span>) =&gt; {
  <span style="color:#7c3aed">return</span> <span style="color:#059669">\`Hello, \${name}!\`</span>;
};

<span style="color:#2563eb">console</span>.log(<span style="color:#2563eb">greet</span>(<span style="color:#059669">'World'</span>));
      </pre>
    </div>`,
  });

  /* ═══════════════════════════════════════════════════════════════════════
   *  MEDIA MODULES
   * ═══════════════════════════════════════════════════════════════════════ */

  /** Video */
  bm.add('divi-video', {
    label: 'Video', category: CAT.media,
    media: svg('M23 7l-7 5 7 5V7zM1 5h15v14H1V5z'),
    content: sec(`
      <div style="position:relative;padding-bottom:56.25%;border-radius:20px;
        overflow:hidden;background:#f1f5f9;border:1px solid ${c.border};">
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;
          align-items:center;justify-content:center;gap:16px;">
          <div style="width:72px;height:72px;background:${c.grad};border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 10px 30px rgba(124,58,237,.35);">
            <span style="color:#fff;font-size:28px;margin-left:4px;">▶</span>
          </div>
          <p style="color:${c.muted};font-size:13px;margin:0;">Paste a YouTube / Vimeo URL</p>
        </div>
      </div>
    `, '60px'),
  });

  /** Video Slider */
  bm.add('divi-video-slider', {
    label: 'Video Slider', category: CAT.media,
    media: svg('M21 15V9M3 15V9M12 9l5 3-5 3V9z'),
    content: sec(`
      ${h2('Video Showcase', '38px')}
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:32px;">
        ${[1,2,3].map(i => `
          <div style="position:relative;padding-bottom:56.25%;border-radius:16px;
            overflow:hidden;background:#f1f5f9;border:1px solid ${c.border};">
            <div style="position:absolute;inset:0;display:flex;align-items:center;
              justify-content:center;">
              <div style="width:44px;height:44px;background:${c.grad};border-radius:50%;
                display:flex;align-items:center;justify-content:center;">
                <span style="color:#fff;font-size:16px;margin-left:3px;">▶</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `, '60px'),
  });

  /** Image Gallery */
  bm.add('divi-gallery', {
    label: 'Gallery', category: CAT.media,
    media: svg('M3 3h18v18H3z M3 9h18 M3 15h18 M9 3v18 M15 3v18'),
    content: sec(`
      ${h2('Gallery', '40px')}
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:32px;">
        ${[...Array(6)].map((_,i) => `
          <div style="border-radius:16px;overflow:hidden;aspect-ratio:4/3;
            background:rgba(255,255,255,.03);border:1px solid ${c.border};
            display:flex;align-items:center;justify-content:center;
            color:${c.dim};font-size:12px;letter-spacing:.06em;text-transform:uppercase;">
            Photo ${i+1}
          </div>
        `).join('')}
      </div>
    `, '60px'),
  });

  /** Slider */
  bm.add('divi-slider', {
    label: 'Slider', category: CAT.media,
    media: svg('M1 12h4M19 12h4M7 5l10 7-10 7V5z'),
    content: {
      type: 'swiper-container',
      content: `
        <div class="swiper-wrapper">
          ${[1,2,3].map(i => `
            <div class="swiper-slide" style="min-height:480px; display:flex; align-items:center; justify-content:center; text-align:center; padding:80px 40px; background:rgba(255,255,255,.02); border:1px solid ${c.border}; border-radius:28px; position:relative; overflow:hidden;">
              <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:600px; height:600px; background:radial-gradient(circle, rgba(124,58,237,.08) 0%, transparent 70%); border-radius:50%; pointer-events:none;"></div>
              <div style="position:relative; z-index:2; max-width:640px;">
                <div style="font-size:12px; font-weight:700; color:${c.accent}; letter-spacing:.1em; text-transform:uppercase; margin-bottom:20px;">Slide ${i} of 3</div>
                ${h2('Stunning Visual Experiences', '54px')}
                ${para('Build captivating slides with rich media, text overlays, and call-to-action buttons.')}
                <div style="display:flex; gap:12px; justify-content:center;">${btn('Get Started')}${btn('Learn More', false)}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="swiper-pagination"></div>
        <div class="swiper-button-prev" style="color:${c.accent};"></div>
        <div class="swiper-button-next" style="color:${c.accent};"></div>
        <style>
          .swiper-button-next:after, .swiper-button-prev:after { font-size: 24px !important; font-weight: 800; }
          .swiper-pagination-bullet { background: ${c.dim} !important; opacity: 0.3; }
          .swiper-pagination-bullet-active { background: ${c.accent} !important; opacity: 1; box-shadow: 0 0 10px ${c.accent}; }
        </style>
      `
    }
  });

  /** Fullwidth Slider */
  bm.add('divi-fw-slider', {
    label: 'Fullwidth Slider', category: CAT.fullwidth,
    media: svg('M1 12h22M7 5l10 7-10 7V5z'),
    content: {
      type: 'swiper-container',
      content: `
        <div class="swiper-wrapper">
          ${[1,2].map(i => `
            <div class="swiper-slide" style="min-height:600px; background:#0a0a14; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; ${f} color:#fff;">
              <div style="position:absolute; inset:0; background:linear-gradient(135deg, rgba(124,58,237,.12) 0%, rgba(6,182,212,.08) 100%);"></div>
              <div style="position:relative; z-index:2; text-align:center; max-width:760px; padding:0 24px;">
                <div style="font-size:12px; font-weight:700; color:${c.accent}; letter-spacing:.1em; text-transform:uppercase; margin-bottom:20px;">Fullwidth Slide ${i}</div>
                ${h2('Immersive Full-Screen Hero', '68px')}
                ${para('Make a bold statement with edge-to-edge imagery and compelling typography.')}
                <div style="display:flex; gap:16px; justify-content:center;">${btn('Start Now')}${btn('See Examples', false)}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="swiper-pagination"></div>
        <div class="swiper-button-prev" style="color:${c.accent};"></div>
        <div class="swiper-button-next" style="color:${c.accent};"></div>
      `
    }
  });

  /** Audio */
  bm.add('divi-audio', {
    label: 'Audio', category: CAT.media,
    media: svg('M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM21 16a3 3 0 11-6 0 3 3 0 016 0z'),
    content: `<div style="${f}padding:32px 24px;">
      ${card(`
        <div style="display:flex;align-items:center;gap:20px;">
          <div style="flex-shrink:0;width:52px;height:52px;background:${c.grad};border-radius:14px;
            display:flex;align-items:center;justify-content:center;font-size:22px;color:#fff;">▶</div>
          <div style="flex:1;">
            <div style="font-size:15px;font-weight:600;color:${c.txt};margin-bottom:6px;">
              Track Title — Artist Name</div>
            <div style="width:100%;height:4px;background:rgba(255,255,255,.08);border-radius:2px;">
              <div style="width:35%;height:100%;background:${c.grad};border-radius:2px;"></div>
            </div>
          </div>
          <div style="font-size:13px;color:${c.muted};flex-shrink:0;">1:24 / 4:12</div>
        </div>
      `)}
    </div>`,
  });

  /* ═══════════════════════════════════════════════════════════════════════
   *  BLURB / CARD MODULES
   * ═══════════════════════════════════════════════════════════════════════ */

  /** Blurb (icon + heading + text) */
  bm.add('divi-blurb', {
    label: 'Blurb', category: CAT.text,
    media: svg('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'),
    content: sec(`
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;">
        ${[
          {i:'⚡', t:'Lightning Speed',    d:'Global CDN delivery keeps your site blazing fast.'},
          {i:'🔒', t:'Bank-Grade Security', d:'End-to-end encryption and SOC2 compliance.'},
          {i:'🤖', t:'AI Augmented',       d:'Smart layouts powered by generative intelligence.'},
        ].map(b => card(`
          <div style="width:52px;height:52px;background:rgba(129,140,248,.12);
            border-radius:14px;display:flex;align-items:center;
            justify-content:center;font-size:26px;margin-bottom:20px;">${b.i}</div>
          <h3 style="font-size:20px;font-weight:700;color:${c.txt};margin:0 0 10px;">${b.t}</h3>
          <p style="font-size:14px;color:${c.muted};line-height:1.7;margin:0;">${b.d}</p>
        `)).join('')}
      </div>
    `, '80px'),
  });

  /** Flip Box */
  bm.add('divi-flip-box', {
    label: 'Flip Box', category: CAT.interactive,
    media: svg('M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'),
    content: sec(`
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
        ${['Design', 'Develop', 'Deploy'].map((t, i) => `
          <div style="perspective:1000px;">
            <div style="position:relative;width:100%;height:220px;transform-style:preserve-3d;">
              <!-- Front -->
              <div style="position:absolute;inset:0;background:${c.card};border:1px solid ${c.border};
                border-radius:20px;display:flex;flex-direction:column;align-items:center;
                justify-content:center;gap:12px;backface-visibility:hidden;">
                <div style="font-size:36px;">${['🎨','💻','🚀'][i]}</div>
                <h3 style="font-size:20px;font-weight:700;color:${c.txt};margin:0;">${t}</h3>
              </div>
              <!-- Back (shown on hover) -->
              <div style="position:absolute;inset:0;background:${c.grad};border-radius:20px;
                display:flex;flex-direction:column;align-items:center;justify-content:center;
                gap:12px;padding:24px;transform:rotateY(180deg);backface-visibility:hidden;">
                <h3 style="font-size:18px;font-weight:700;color:#fff;margin:0 0 8px;">${t} Phase</h3>
                <p style="font-size:13px;color:rgba(255,255,255,.8);text-align:center;margin:0;">
                  Hover reveals the back side of this flip card with additional information.</p>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `, '80px'),
  });

  /* ═══════════════════════════════════════════════════════════════════════
   *  TESTIMONIAL / TEAM / SOCIAL PROOF
   * ═══════════════════════════════════════════════════════════════════════ */

  /** Testimonial Single */
  bm.add('divi-testimonial', {
    label: 'Testimonial', category: CAT.text,
    media: svg('M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z'),
    content: sec(`
      <div style="max-width:700px;margin:0 auto;">
        ${card(`
          <div style="color:#f59e0b;font-size:18px;margin-bottom:20px;letter-spacing:3px;">★★★★★</div>
          <blockquote style="font-size:22px;line-height:1.6;color:${c.txt};margin:0 0 28px;
            font-weight:500;font-style:italic;">
            "This platform completely transformed our workflow. What used to take weeks now takes hours.
            The glassmorphic UI is simply stunning."
          </blockquote>
          <div style="display:flex;align-items:center;gap:14px;">
            <div style="width:48px;height:48px;border-radius:50%;background:rgba(129,140,248,.2);
              flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:20px;">👤</div>
            <div>
              <div style="font-size:15px;font-weight:700;color:${c.txt};">Alexandra Chen</div>
              <div style="font-size:13px;color:${c.muted};">VP of Design, NovaTech</div>
            </div>
          </div>
        `)}
      </div>
    `, '60px'),
  });

  /** Team Member */
  bm.add('divi-team-member', {
    label: 'Team Member', category: CAT.text,
    media: svg('M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75'),
    content: sec(`
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;text-align:center;">
        ${[
          {n:'Marcus Wright',  r:'CEO & Co-Founder',  em:'🧠'},
          {n:'Priya Sharma',   r:'Head of Design',    em:'🎨'},
          {n:'Leo Nakamura',   r:'Lead Engineer',     em:'⚙️'},
          {n:'Sofia Torres',  r:'Growth Lead',        em:'📈'},
        ].map(m => card(`
          <div style="width:80px;height:80px;border-radius:50%;
            background:linear-gradient(135deg,rgba(129,140,248,.25),rgba(192,132,252,.15));
            border:2px solid rgba(129,140,248,.35);margin:0 auto 16px;
            display:flex;align-items:center;justify-content:center;font-size:32px;">${m.em}</div>
          <h4 style="font-size:17px;font-weight:700;color:${c.txt};margin:0 0 6px;">${m.n}</h4>
          <p style="font-size:13px;color:${c.accent};margin:0 0 16px;font-weight:500;">${m.r}</p>
          <div style="display:flex;justify-content:center;gap:10px;">
            ${['𝕏','in','🔗'].map(s =>
              `<a href="#" style="width:30px;height:30px;border-radius:8px;
                background:rgba(255,255,255,.05);border:1px solid ${c.border};
                display:flex;align-items:center;justify-content:center;
                font-size:12px;color:${c.muted};text-decoration:none;">${s}</a>`
            ).join('')}
          </div>
        `,'24px')).join('')}
      </div>
    `, '80px'),
  });

  /* ═══════════════════════════════════════════════════════════════════════
   *  INTERACTIVE MODULES
   * ═══════════════════════════════════════════════════════════════════════ */

  /** Toggle */
  bm.add('divi-toggle', {
    label: 'Toggle', category: CAT.interactive,
    media: svg('M8 7h12M8 12h12M8 17h12M3 7h.01M3 12h.01M3 17h.01'),
    content: sec(`
      ${h2('Toggle Items', '36px')}
      <div style="display:flex;flex-direction:column;gap:12px;margin-top:32px;max-width:680px;">
        ${[
          {q:'What is included in the free plan?',  a:'The free plan includes 1 project, community support, and basic analytics with no credit card required.', open:true},
          {q:'Can I upgrade or downgrade anytime?', a:'Yes, you can change your subscription at any time. Upgrades take effect immediately.'},
          {q:'Do you offer team plans?',            a:'Absolutely. Our enterprise plan supports unlimited team members with role-based access control.'},
          {q:'How secure is my data?',              a:'All data is encrypted at rest and in transit using AES-256 and TLS 1.3 protocols.'},
        ].map(({q, a, open}) => `
          <div style="background:${c.card};border:1px solid ${open ? 'rgba(129,140,248,.35)' : c.border};
            border-radius:16px;overflow:hidden;">
            <details ${open ? 'open' : ''}>
              <summary style="padding:20px 24px;cursor:pointer;list-style:none;
                display:flex;justify-content:space-between;align-items:center;
                font-size:16px;font-weight:600;color:${c.txt};">
                ${q}
                <span style="font-size:20px;color:${c.accent};flex-shrink:0;margin-left:16px;">
                  ${open ? '−' : '+'}
                </span>
              </summary>
              <div style="padding:0 24px 20px;font-size:15px;color:${c.muted};line-height:1.7;">${a}</div>
            </details>
          </div>
        `).join('')}
      </div>
    `, '60px'),
  });

  /** Accordion */
  bm.add('divi-accordion', {
    label: 'Accordion', category: CAT.interactive,
    media: svg('M4 7h16M4 12h10M4 17h16M18 12h2'),
    content: sec(`
      ${h2('Accordion', '36px')}
      <div style="max-width:700px;margin-top:32px;">
        <div style="background:${c.card};border:1px solid ${c.border};border-radius:20px;
          overflow:hidden;">
          ${['Getting Started', 'Advanced Configuration', 'API Reference', 'Troubleshooting'].map((t,i) => `
            <div style="border-bottom:1px solid ${c.border};">
              <details ${i===0?'open':''}>
                <summary style="padding:20px 24px;cursor:pointer;list-style:none;
                  display:flex;justify-content:space-between;align-items:center;
                  font-size:16px;font-weight:600;color:${c.txt};">
                  ${t} <span style="color:${c.accent};">${i===0?'−':'+'}</span>
                </summary>
                <div style="padding:0 24px 20px;font-size:14px;color:${c.muted};line-height:1.7;">
                  Detailed content for the "${t}" section goes here. Add explanations, screenshots, or links.
                </div>
              </details>
            </div>
          `).join('')}
        </div>
      </div>
    `, '60px'),
  });

  /** Tabs */
  bm.add('divi-tabs', {
    label: 'Tabs', category: CAT.interactive,
    media: svg('M4 7h16M4 17h16M7 7v10M12 7v10'),
    content: sec(`
      ${h2('Tab Module', '36px')}
      <div style="max-width:800px;margin-top:32px;">
        <div style="display:flex;gap:4px;background:#f1f5f9;
          border-radius:14px;padding:4px;border:1px solid ${c.border};
          width:fit-content;margin-bottom:0;">
          ${['Overview', 'Features', 'Pricing', 'FAQ'].map((t,i) => `
            <button style="padding:10px 20px;border:none;border-radius:10px;cursor:pointer;
              font-size:14px;font-weight:600;${f}transition:all .2s;
              ${i===0
                ? `background:${c.grad};color:#fff;box-shadow:0 10px 20px rgba(124,58,237,.3);`
                : `background:transparent;color:${c.muted};`}">${t}</button>
          `).join('')}
        </div>
        ${card(`
          <h3 style="font-size:20px;font-weight:700;color:${c.txt};margin:0 0 12px;">Overview Tab</h3>
          ${para('This is the content for the Overview tab. Click other tabs to switch between different content sections.')}
          ${btn('Explore Features')}
        `)}
      </div>
    `, '60px'),
  });

  /* ═══════════════════════════════════════════════════════════════════════
   *  FORMS & OPTIN MODULES
   * ═══════════════════════════════════════════════════════════════════════ */

  /** Email Optin / Newsletter */
  bm.add('divi-email-optin', {
    label: 'Email Optin', category: CAT.forms,
    media: svg('M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6'),
    content: sec(`
      <div style="max-width:600px;margin:0 auto;text-align:center;">
        ${h2('Stay in the loop', '44px')}
        ${para('Join 25,000+ designers and developers. Get the best articles, tutorials, and tools delivered straight to your inbox.')}
        <div style="display:flex;gap:12px;max-width:480px;margin:0 auto;">
          ${input('Enter your email address')}
          ${btn('Subscribe')}
        </div>
        <p style="font-size:12px;color:${c.dim};margin-top:14px;">
          No spam ever. Unsubscribe anytime.</p>
      </div>
    `, '80px'),
  });

  /** Login */
  bm.add('divi-login', {
    label: 'Login', category: CAT.forms,
    media: svg('M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3'),
    content: sec(`
      <div style="max-width:440px;margin:0 auto;">
        ${card(`
          <h2 style="font-size:26px;font-weight:800;color:${c.txt};margin:0 0 6px;text-align:center;">
            Welcome back</h2>
          <p style="text-align:center;color:${c.muted};font-size:14px;margin:0 0 28px;">
            Sign in to your account</p>
          <div style="display:flex;flex-direction:column;gap:16px;">
            ${input('Email address')}
            ${input('Password')}
            <div style="display:flex;justify-content:flex-end;">
              <a href="#" style="font-size:13px;color:${c.accent};text-decoration:none;">
                Forgot password?</a>
            </div>
            ${btn('Sign In')}
            <p style="text-align:center;font-size:13px;color:${c.muted};margin:0;">
              Don't have an account?
              <a href="#" style="color:${c.accent};text-decoration:none;">Sign up free</a></p>
          </div>
        `,'36px')}
      </div>
    `, '60px'),
  });

  /** Search */
  bm.add('divi-search', {
    label: 'Search', category: CAT.forms,
    media: svg('M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'),
    content: `<div style="${f}padding:32px 24px;">
      <div style="max-width:560px;margin:0 auto;">
        <div style="display:flex;background:${c.card};border:1px solid ${c.border};
          border-radius:14px;overflow:hidden;padding:6px;">
          <input placeholder="Search articles, docs, pages…" style="flex:1;background:none;
            border:none;outline:none;padding:12px 16px;color:${c.txt};font-size:15px;${f}">
          ${btn('Search')}
        </div>
        <p style="font-size:12px;color:${c.dim};margin:10px 0 0;text-align:center;">
          Try: "pricing", "getting started", or "API docs"</p>
      </div>
    </div>`,
  });

  /* ═══════════════════════════════════════════════════════════════════════
   *  STATS / COUNTER MODULES
   * ═══════════════════════════════════════════════════════════════════════ */

  /** Number Counter */
  bm.add('divi-number-counter', {
    label: 'Number Counter', category: CAT.stats,
    media: svg('M12 20V10M18 20V4M6 20v-4'),
    content: sec(`
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;text-align:center;">
        ${[
          {n:'98%',  l:'Satisfaction Rate'},
          {n:'10K+', l:'Active Users'},
          {n:'$2B',  l:'Revenue Processed'},
          {n:'<10ms', l:'Response Time'},
        ].map(s => card(`
          <div style="font-size:52px;font-weight:900;line-height:1;margin-bottom:10px;
            background:${c.grad};-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
            ${s.n}</div>
          <div style="font-size:14px;color:${c.muted};font-weight:500;">${s.l}</div>
        `,'28px 20px')).join('')}
      </div>
    `, '80px'),
  });

  /** Bar Counters */
  bm.add('divi-bar-counter', {
    label: 'Bar Counter', category: CAT.stats,
    media: svg('M4 7h16M4 12h16M4 17h10'),
    content: sec(`
      ${h2('Skills & Expertise', '40px')}
      <div style="display:flex;flex-direction:column;gap:24px;max-width:640px;margin-top:40px;">
        ${[
          {l:'UI / UX Design', p:92},
          {l:'Frontend Development', p:87},
          {l:'Performance Optimization', p:78},
          {l:'Cloud Architecture', p:71},
        ].map(b => `
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="font-size:15px;font-weight:600;color:${c.txt};">${b.l}</span>
              <span style="font-size:14px;color:${c.accent};font-weight:700;">${b.p}%</span>
            </div>
            <div style="height:8px;background:rgba(255,255,255,.07);border-radius:4px;overflow:hidden;">
              <div style="width:${b.p}%;height:100%;background:${c.grad};border-radius:4px;
                box-shadow:0 0 10px rgba(129,140,248,.4);transition:width 1s ease;"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `, '80px'),
  });

  /** Circle Counter */
  bm.add('divi-circle-counter', {
    label: 'Circle Counter', category: CAT.stats,
    media: svg('M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83'),
    content: sec(`
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px;text-align:center;">
        ${[
          {p:92, l:'Uptime', c:'#818cf8'},
          {p:87, l:'Performance', c:'#c084fc'},
          {p:78, l:'Satisfaction', c:'#38bdf8'},
          {p:95, l:'Security', c:'#4ade80'},
        ].map(x => `
          <div>
            <div style="position:relative;width:120px;height:120px;margin:0 auto 16px;">
              <svg viewBox="0 0 120 120" style="transform:rotate(-90deg)">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="8"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke="${x.c}" stroke-width="8"
                  stroke-linecap="round"
                  stroke-dasharray="${Math.round(2*Math.PI*50*x.p/100)} ${Math.round(2*Math.PI*50*(1-x.p/100))}"/>
              </svg>
              <div style="position:absolute;inset:0;display:flex;align-items:center;
                justify-content:center;font-size:24px;font-weight:800;color:${c.txt};">
                ${x.p}%</div>
            </div>
            <div style="font-size:14px;font-weight:600;color:${c.muted};">${x.l}</div>
          </div>
        `).join('')}
      </div>
    `, '80px'),
  });

  /** Progress Bar (Divi-style horizontal) */
  bm.add('divi-progress-bar', {
    label: 'Progress Bar', category: CAT.stats,
    media: svg('M2 12h20M2 12l2-2M2 12l2 2'),
    content: sec(`
      ${h2('Project Progress', '36px')}
      <div style="display:flex;flex-direction:column;gap:20px;max-width:640px;margin-top:32px;">
        ${[
          {l:'Brand Identity',       p:100},
          {l:'Website Development',  p:75},
          {l:'Mobile App',           p:48},
          {l:'Backend API',          p:92},
        ].map(b => `
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
              <span style="font-size:14px;font-weight:600;color:${c.txt};">${b.l}</span>
              <span style="font-size:13px;color:${c.accent};">${b.p}%</span>
            </div>
            <div style="height:12px;background:rgba(255,255,255,.06);border-radius:6px;overflow:hidden;">
              <div style="width:${b.p}%;height:100%;background:${c.grad};border-radius:6px;
                position:relative;">
                <div style="position:absolute;inset:0;background:linear-gradient(
                  90deg,transparent,rgba(255,255,255,.15),transparent);"></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `, '60px'),
  });

  /** Rating */
  bm.add('divi-rating', {
    label: 'Rating', category: CAT.stats,
    media: svg('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21.02 7 14.14 2 9.27l6.91-1.01L12 2z'),
    content: `<div style="${f}padding:32px 24px;text-align:center;">
      <div style="font-size:48px;font-weight:900;color:${c.txt};margin-bottom:8px;">4.9</div>
      <div style="font-size:28px;color:#f59e0b;margin-bottom:8px;letter-spacing:4px;">★★★★★</div>
      <div style="font-size:14px;color:${c.muted};">Based on 2,400+ reviews</div>
    </div>`,
  });

  /* ═══════════════════════════════════════════════════════════════════════
   *  COUNTDOWN TIMER
   * ═══════════════════════════════════════════════════════════════════════ */

  bm.add('divi-countdown', {
    label: 'Countdown Timer', category: CAT.interactive,
    media: svg('M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2'),
    content: sec(`
      <div style="text-align:center;max-width:600px;margin:0 auto;">
        ${h2('Launch Countdown', '44px')}
        ${para('Something extraordinary is coming. Reserve your spot today.')}
        <div style="display:flex;justify-content:center;gap:20px;margin:40px 0;">
          ${[['07','Days'],['14','Hours'],['32','Minutes'],['58','Seconds']].map(([n,l]) => card(`
            <div style="font-size:52px;font-weight:900;color:${c.txt};line-height:1;
              background:${c.grad};-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
              ${n}</div>
            <div style="font-size:12px;color:${c.muted};margin-top:8px;
              font-weight:600;letter-spacing:.06em;text-transform:uppercase;">${l}</div>
          `,'24px 20px')).join('')}
        </div>
        ${btn('Notify Me')}
      </div>
    `, '80px'),
  });

  /* ═══════════════════════════════════════════════════════════════════════
   *  MAP MODULE
   * ═══════════════════════════════════════════════════════════════════════ */

  bm.add('divi-map', {
    label: 'Map', category: CAT.media,
    media: svg('M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 13a3 3 0 100-6 3 3 0 000 6z'),
    content: sec(`
      <div style="display:grid;grid-template-columns:1fr 1.5fr;gap:48px;align-items:center;">
        <div>
          ${h2('Find Us', '40px')}
          ${para('Visit our headquarters in San Francisco. We\'d love to meet you in person.')}
          <div style="display:flex;flex-direction:column;gap:16px;">
            ${[['📍','345 Market St, SF, CA 94105'],['📞','+1 (415) 555-0190'],['✉️','hello@brand.com']].map(([i,t]) => `
              <div style="display:flex;gap:12px;align-items:center;
                font-size:14px;color:${c.muted};">
                <span>${i}</span><span>${t}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="height:360px;border-radius:24px;overflow:hidden;
          background:rgba(129,140,248,.06);border:1px solid ${c.border};
          display:flex;align-items:center;justify-content:center;
          flex-direction:column;gap:12px;">
          <div style="font-size:36px;">🗺️</div>
          <p style="color:${c.dim};font-size:13px;text-align:center;margin:0;">
            Embed a Google Map by replacing this placeholder</p>
        </div>
      </div>
    `, '80px'),
  });

  /** Fullwidth Map */
  bm.add('divi-fw-map', {
    label: 'Fullwidth Map', category: CAT.fullwidth,
    media: svg('M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 13a3 3 0 100-6 3 3 0 000 6z'),
    content: `<div style="${f}width:100%;height:480px;background:rgba(9,10,15,1);
      border-top:1px solid ${c.border};border-bottom:1px solid ${c.border};
      display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;">
      <div style="font-size:48px;">🗺️</div>
      <p style="color:${c.dim};font-size:13px;margin:0;">Full-width Map Area — Paste embed code here</p>
    </div>`,
  });

  /* ═══════════════════════════════════════════════════════════════════════
   *  SOCIAL MEDIA FOLLOW
   * ═══════════════════════════════════════════════════════════════════════ */

  bm.add('divi-social-follow', {
    label: 'Social Follow', category: CAT.social,
    media: svg('M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z'),
    content: `<div style="${f}padding:40px 24px;text-align:center;">
      <p style="font-size:14px;color:${c.muted};margin:0 0 24px;">Follow us on social media</p>
      <div style="display:flex;justify-content:center;gap:12px;">
        ${[
          {n:'Twitter / X',  i:'𝕏',  cl:'#0f172a'},
          {n:'LinkedIn',     i:'in', cl:'#0a66c2'},
          {n:'GitHub',       i:'⌥',  cl:'#1e293b'},
          {n:'YouTube',      i:'▶',  cl:'#ff0000'},
          {n:'Instagram',    i:'📷', cl:'#e4405f'},
        ].map(s => `
          <a href="#" title="${s.n}" style="width:48px;height:48px;border-radius:14px;
            background:${s.cl};border:1px solid ${c.border};color:#fff;
            display:flex;align-items:center;justify-content:center;
            font-size:18px;text-decoration:none;transition:transform .2s;
            box-shadow:0 10px 15px rgba(0,0,0,0.1);">${s.i}</a>
        `).join('')}
      </div>
    </div>`,
  });

  /* ═══════════════════════════════════════════════════════════════════════
   *  PORTFOLIO
   * ═══════════════════════════════════════════════════════════════════════ */

  /** Filterable Portfolio */
  bm.add('divi-filterable-portfolio', {
    label: 'Filterable Portfolio', category: CAT.media,
    media: svg('M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'),
    content: sec(`
      <div style="text-align:center;margin-bottom:40px;">
        ${h2('Our Portfolio', '44px')}
      </div>
      <div style="display:flex;justify-content:center;gap:8px;margin-bottom:36px;flex-wrap:wrap;">
        ${['All', 'Web Design', 'Branding', 'Mobile', 'Motion'].map((f,i) => `
          <button style="padding:9px 20px;border:1px solid ${i===0?'rgba(129,140,248,.5)':c.border};
            border-radius:10px;background:${i===0?'rgba(129,140,248,.15)':'transparent'};
            color:${i===0?c.accent:c.muted};font-size:13px;font-weight:600;
            cursor:pointer;${f}transition:all .2s;">${f}</button>
        `).join('')}
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
        ${[...Array(6)].map((_,i) => `
          <div style="border-radius:18px;overflow:hidden;background:${c.card};
            border:1px solid ${c.border};position:relative;group cursor:pointer;">
            <div style="height:240px;background:linear-gradient(135deg,
              rgba(129,140,248,.1),rgba(192,132,252,.08));display:flex;
              align-items:center;justify-content:center;color:${c.dim};
              font-size:12px;letter-spacing:.08em;text-transform:uppercase;">Project ${i+1}</div>
            <div style="padding:20px;">
              <h4 style="font-size:16px;font-weight:700;color:${c.txt};margin:0 0 6px;">
                Project Title ${i+1}</h4>
              <p style="font-size:13px;color:${c.muted};margin:0;">Web Design · Branding</p>
            </div>
          </div>
        `).join('')}
      </div>
    `, '80px'),
  });


  /* ═══════════════════════════════════════════════════════════════════════
   *  BLOG / POST MODULES
   * ═══════════════════════════════════════════════════════════════════════ */

  /** Post Title */
  bm.add('divi-post-title', {
    label: 'Post Title', category: CAT.blog,
    media: svg('M4 7h16M4 12h16M4 17h10'),
    content: sec(`
      <div style="max-width:800px;margin:0 auto;">
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;">
          ${['Engineering', 'Design Systems'].map(tag => `
            <span style="padding:4px 12px;background:rgba(129,140,248,.12);
              color:${c.accent};border:1px solid rgba(129,140,248,.2);
              border-radius:100px;font-size:12px;font-weight:700;
              letter-spacing:.06em;text-transform:uppercase;">${tag}</span>
          `).join('')}
        </div>
        <h1 style="font-size:56px;font-weight:900;color:${c.txt};
          letter-spacing:-.04em;line-height:1.1;margin:0 0 20px;">
          The Architecture of Modern Visual Page Builders</h1>
        <div style="display:flex;align-items:center;gap:16px;color:${c.muted};font-size:14px;">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(129,140,248,.2);
            display:flex;align-items:center;justify-content:center;font-size:16px;">👤</div>
          <span><strong style="color:${c.txt};">Alex Morgan</strong> · April 9, 2026</span>
          <span>·</span><span>12 min read</span>
        </div>
      </div>
    `, '60px'),
  });

  /** Post Navigation */
  bm.add('divi-post-nav', {
    label: 'Post Navigation', category: CAT.blog,
    media: svg('M11 19l-7-7 7-7M20 12H4'),
    content: `<div style="${f}padding:40px 24px;border-top:1px solid ${c.border};">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:900px;margin:0 auto;">
        ${card(`
          <div style="font-size:12px;color:${c.muted};font-weight:600;
            letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;">← Previous Post</div>
          <div style="font-size:16px;font-weight:700;color:${c.txt};">
            CSS Grid Mastery: From Zero to Expert</div>
        `, '22px 28px')}
        ${card(`
          <div style="font-size:12px;color:${c.muted};font-weight:600;
            letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;text-align:right;">Next Post →</div>
          <div style="font-size:16px;font-weight:700;color:${c.txt};text-align:right;">
            Framer Motion & Advanced Animations</div>
        `, '22px 28px')}
      </div>
    </div>`,
  });

  /** Comments */
  bm.add('divi-comments', {
    label: 'Comments', category: CAT.blog,
    media: svg('M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z'),
    content: sec(`
      <div style="max-width:720px;margin:0 auto;">
        ${h2('3 Comments', '32px')}
        <div style="display:flex;flex-direction:column;gap:20px;margin-bottom:40px;">
          ${[
            {u:'Sarah K.', t:'1 hour ago', m:'Brilliant article! The section on VDOM reconciliation cleared up so many doubts.', rating:5},
            {u:'Tom R.',   t:'3 hours ago', m:'Could you elaborate more on how streaming SSR fits into this architecture?', rating:4},
            {u:'Maya L.', t:'Yesterday',   m:'Bookmarked this. Definitely the best breakdown I\'ve read on this topic.', rating:5},
          ].map(c_ => card(`
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
              <div style="display:flex;gap:12px;align-items:center;">
                <div style="width:36px;height:36px;border-radius:50%;
                  background:rgba(129,140,248,.2);display:flex;align-items:center;
                  justify-content:center;color:${c.accent};font-weight:700;font-size:14px;">
                  ${c_.u[0]}</div>
                <div>
                  <div style="font-size:14px;font-weight:700;color:${c.txt};">${c_.u}</div>
                  <div style="font-size:12px;color:${c.muted};">${c_.t}</div>
                </div>
              </div>
              <div style="color:#f59e0b;font-size:12px;">${'★'.repeat(c_.rating)}</div>
            </div>
            <p style="font-size:14px;color:${c.muted};line-height:1.6;margin:0;">${c_.m}</p>
          `, '20px 24px')).join('')}
        </div>
        ${h2('Leave a Comment', '24px')}
        ${card(`
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
              ${input('Your Name')}${input('Email Address')}
            </div>
            <textarea placeholder="Write your comment…" rows="4"
              style="width:100%;box-sizing:border-box;background:#f8fafc;
              border:1px solid ${c.border};border-radius:12px;padding:14px 16px;
              color:${c.txt};outline:none;font-size:14px;${f}resize:vertical;
              box-shadow:inset 0 1px 2px rgba(0,0,0,0.02);"></textarea>
            ${btn('Post Comment')}
          </div>
        `,'28px')}
      </div>
    `, '60px'),
  });

  /** Sidebar */
  bm.add('divi-sidebar', {
    label: 'Sidebar', category: CAT.blog,
    media: svg('M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM9 3v18'),
    content: `<div style="${f}padding:32px 24px;">
      <div style="display:grid;grid-template-columns:1fr 300px;gap:40px;max-width:1100px;margin:0 auto;">
        ${card(`
          <h2 style="font-size:24px;font-weight:700;color:${c.txt};margin:0 0 16px;">Main Content Area</h2>
          <p style="color:${c.muted};font-size:15px;line-height:1.7;">
            Your primary page content goes here. The sidebar widget area appears to the right on desktop
            and stacks below on mobile.</p>
        `)}
        <aside>
          <div style="display:flex;flex-direction:column;gap:20px;">
            ${[
              {t:'About', body:'Short description or bio widget content goes here.'},
              {t:'Recent Posts', body:'• Latest blog post title<br>• Another recent article<br>• More content here'},
              {t:'Tags', body:'Design · React · CSS · TypeScript · UX Research'},
            ].map(w => card(`
              <h4 style="font-size:15px;font-weight:700;color:${c.txt};
                margin:0 0 12px;padding-bottom:10px;border-bottom:1px solid ${c.border};">${w.t}</h4>
              <p style="font-size:13px;color:${c.muted};line-height:1.7;margin:0;">${w.body}</p>
            `,'20px')).join('')}
          </div>
        </aside>
      </div>
    </div>`,
  });

  /* ═══════════════════════════════════════════════════════════════════════
   *  MARKETING / FULLWIDTH MODULES
   * ═══════════════════════════════════════════════════════════════════════ */

  /** Call to Action */
  bm.add('divi-cta', {
    label: 'Call To Action', category: CAT.marketing,
    media: svg('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'),
    content: sec(`
      <div style="border-radius:28px;padding:72px 48px;text-align:center;position:relative;overflow:hidden;">
        <div style="position:absolute;inset:0;background:${c.grad};opacity:.08;"></div>
        <div style="position:absolute;inset:0;backdrop-filter:blur(4px);
          border:1px solid ${c.border};border-radius:28px;"></div>
        <div style="position:relative;z-index:2;max-width:560px;margin:0 auto;">
          ${h2('Start building for free', '52px')}
          ${para('No credit card required. Set up in minutes. Cancel anytime.')}
          <div style="display:flex;gap:14px;justify-content:center;">${btn('Get Started Free')}${btn('View Pricing', false)}</div>
        </div>
      </div>
    `, '60px'),
  });

  /** Fullwidth Header */
  bm.add('divi-fw-header', {
    label: 'Fullwidth Header', category: CAT.fullwidth,
    media: svg('M4 3h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z M3 8h18'),
    content: `<header style="${f}width:100%;min-height:640px;background:${c.bg};
      position:relative;overflow:hidden;display:flex;align-items:center;
      justify-content:center;text-align:center;">
      <div style="position:absolute;inset:0;
        background:radial-gradient(ellipse at center,rgba(129,140,248,.12) 0%,transparent 70%);"></div>
      <div style="position:relative;z-index:2;padding:0 24px;max-width:900px;">
        <div style="font-size:12px;font-weight:700;color:${c.accent};
          letter-spacing:.12em;text-transform:uppercase;margin-bottom:20px;">
          FULLWIDTH HERO HEADER</div>
        ${h2('Design at the Speed of Thought', '72px')}
        ${para('The most powerful visual builder ever created. Start from any template or blank canvas.')}
        <div style="display:flex;gap:16px;justify-content:center;">${btn('Start Free')}${btn('Watch Demo', false)}</div>
      </div>
    </header>`,
  });

  /** Fullwidth Image */
  bm.add('divi-fw-image', {
    label: 'Fullwidth Image', category: CAT.fullwidth,
    media: svg('M3 3h18v18H3z M3 9l4-4 5 5 3-3 6 6'),
    content: `<div style="width:100%;background:#f8fafc;
      border-top:1px solid ${c.border};border-bottom:1px solid ${c.border};">
      <div style="width:100%;height:500px;display:flex;align-items:center;
        justify-content:center;flex-direction:column;gap:12px;
        background:linear-gradient(135deg,rgba(124,58,237,.02),rgba(6,182,212,.02));
        ${f}">
        <div style="font-size:48px;">🖼️</div>
        <p style="color:${c.dim};font-size:14px;margin:0;font-weight:500;">Full-width Image Area</p>
      </div>
    </div>`,
  });

  /* ═══════════════════════════════════════════════════════════════════════
   *  NAV / BREADCRUMB MODULES
   * ═══════════════════════════════════════════════════════════════════════ */

  /** Menu */
  bm.add('divi-menu', {
    label: 'Menu', category: CAT.nav,
    media: svg('M3 12h18M3 6h18M3 18h18'),
    content: `<nav style="${f}background:rgba(255,255,255,.9);
      backdrop-filter:blur(20px);border-bottom:1px solid ${c.border};
      padding:0 32px;height:72px;display:flex;align-items:center;
      justify-content:space-between;color:${c.txt};box-shadow:0 4px 20px rgba(0,0,0,0.03);">
      <div style="font-size:20px;font-weight:800;letter-spacing:-.03em;color:${c.txt};">◆ Brand</div>
      <div style="display:flex;gap:28px;">
        ${['Home', 'About', 'Services', 'Portfolio', 'Contact'].map((l,i) => `
          <a href="#" style="font-size:14px;font-weight:500;text-decoration:none;
            color:${i===0?c.accent:c.muted};">${l}</a>
        `).join('')}
      </div>
      <div style="display:flex;gap:12px;">${btn('Get Started')}</div>
    </nav>`,
  });

  /** Breadcrumb */
  bm.add('divi-breadcrumb', {
    label: 'Breadcrumb', category: CAT.nav,
    media: svg('M9 18l6-6-6-6'),
    content: `<div style="${f}padding:14px 24px;">
      <nav style="display:flex;align-items:center;gap:8px;font-size:13px;">
        ${['Home', 'Blog', 'Current Article'].map((s,i,arr) => `
          <span style="color:${i===arr.length-1?c.txt:c.muted};">
            ${i===arr.length-1 ? s : `<a href="#" style="color:${c.muted};text-decoration:none;
              transition:color .2s;">${s}</a>`}
          </span>
          ${i<arr.length-1 ? `<span style="color:${c.dim};">›</span>` : ''}
        `).join('')}
      </nav>
    </div>`,
  });

  /* ═══════════════════════════════════════════════════════════════════════
   *  SHOP / WOOCOMMERCE MODULES
   * ═══════════════════════════════════════════════════════════════════════ */

  /** Shop (product grid) */
  bm.add('divi-shop', {
    label: 'Shop Grid', category: CAT.shop,
    media: svg('M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0'),
    content: sec(`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:40px;">
        ${h2('Your Store', '40px')}
        <div style="display:flex;gap:8px;">
          ${input('Search products...')}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;">
        ${[
          {n:'Wireless Buds Pro', p:'$149', badge:'New'},
          {n:'Smart Watch X3',   p:'$299', badge:'Hot'},
          {n:'USB-C Hub Ultra',  p:'$79',  badge:''},
          {n:'Laptop Stand Pro', p:'$59',  badge:'Sale'},
        ].map(item => card(`
          <div style="position:relative;margin-bottom:16px;">
            <div style="width:100%;height:180px;border-radius:12px;
              background:#f1f5f9;display:flex;
              align-items:center;justify-content:center;font-size:40px;">📦</div>
            ${item.badge ? `<div style="position:absolute;top:8px;right:8px;
              padding:3px 10px;background:${c.grad};border-radius:100px;
              font-size:10px;font-weight:800;color:#fff;box-shadow:0 4px 10px rgba(124,58,237,.3);">
              ${item.badge}</div>` : ''}
          </div>
          <h4 style="font-size:15px;font-weight:600;color:${c.txt};margin:0 0 6px;">${item.n}</h4>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <span style="font-size:18px;font-weight:700;color:${c.accent};">${item.p}</span>
            <a href="#" style="display:flex;align-items:center;justify-content:center;
              width:32px;height:32px;background:${c.grad};border-radius:8px;
              color:#fff;text-decoration:none;font-size:16px;box-shadow:0 4px 10px rgba(124,58,237,.2);">+</a>
          </div>
        `,'16px')).join('')}
      </div>
    `, '80px'),
  });

  /** Cart */
  bm.add('divi-wc-cart', {
    label: 'Shop Cart', category: CAT.shop,
    media: svg('M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0'),
    content: sec(`
      <div style="display:grid;grid-template-columns:1.6fr 1fr;gap:40px;align-items:start;">
        <div>
          ${h2('Your Cart', '38px')}
          ${[
            {n:'Wireless Buds Pro', p:'$149', q:2},
            {n:'Smart Watch X3',   p:'$299', q:1},
          ].map(item => card(`
            <div style="display:flex;align-items:center;gap:16px;">
              <div style="width:64px;height:64px;border-radius:12px;
                background:rgba(255,255,255,.04);flex-shrink:0;
                display:flex;align-items:center;justify-content:center;font-size:28px;">📦</div>
              <div style="flex:1;">
                <div style="font-size:15px;font-weight:600;color:${c.txt};">${item.n}</div>
                <div style="font-size:13px;color:${c.muted};margin-top:4px;">Qty: ${item.q}</div>
              </div>
              <div style="font-size:16px;font-weight:700;color:${c.accent};">${item.p}</div>
            </div>
          `,'16px 20px')).join('')}
        </div>
        ${card(`
          <h3 style="font-size:20px;font-weight:700;color:${c.txt};margin:0 0 20px;">Order Summary</h3>
          ${[['Subtotal','$597'],['Shipping','Free'],['Tax','$47.76']].map(r => `
            <div style="display:flex;justify-content:space-between;
              font-size:14px;color:${c.muted};margin-bottom:12px;">
              <span>${r[0]}</span><span>${r[1]}</span>
            </div>
          `).join('')}
          <div style="border-top:1px solid ${c.border};margin:16px 0;padding-top:16px;
            display:flex;justify-content:space-between;font-size:18px;font-weight:700;color:${c.txt};">
            <span>Total</span><span>$644.76</span>
          </div>
          ${btn('Proceed to Checkout')}
        `,'28px')}
      </div>
    `, '60px'),
  });

  /** Checkout */
  bm.add('divi-wc-checkout', {
    label: 'Checkout', category: CAT.shop,
    media: svg('M21 12H3m14-14L21 12l-4 4'),
    content: sec(`
      <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:48px;align-items:start;">
        ${card(`
          ${h2('Checkout', '32px')}
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
              ${input('First Name')}${input('Last Name')}
            </div>
            ${input('Email Address')}
            ${input('Phone Number')}
            ${input('Street Address')}
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
              ${input('City')}${input('ZIP / Postcode')}
            </div>
            <div style="margin-top:8px;">
              <div style="font-size:14px;font-weight:600;color:${c.txt};margin-bottom:12px;">Payment</div>
              ${input('Card Number')}
            </div>
            ${btn('Place Order')}
          </div>
        `,'32px')}
        ${card(`
          <h3 style="font-size:18px;font-weight:700;color:${c.txt};margin:0 0 20px;">Your Order</h3>
          <div style="border-bottom:1px solid ${c.border};padding-bottom:16px;margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;font-size:14px;color:${c.muted};margin-bottom:8px;">
              <span>Wireless Buds Pro × 2</span><span>$298</span></div>
            <div style="display:flex;justify-content:space-between;font-size:14px;color:${c.muted};">
              <span>Smart Watch X3</span><span>$299</span></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;color:${c.txt};">
            <span>Total</span><span>$644.76</span></div>
        `,'28px')}
      </div>
    `, '60px'),
  });

  /* ═══════════════════════════════════════════════════════════════════════
   *  MISC / UTILITY MODULES
   * ═══════════════════════════════════════════════════════════════════════ */

  /** Pricing (Divi-style single tier) */
  bm.add('divi-pricing', {
    label: 'Pricing Table', category: CAT.marketing,
    media: svg('M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6'),
    content: sec(`
      <div style="text-align:center;margin-bottom:60px;">
        ${h2('Choose Your Plan', '44px')}
        ${para('Start for free. Scale as you grow. No surprises.')}
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;align-items:center;">
        ${[
          {t:'Starter', p:'Free',   f:['1 Project','3 Pages','Community Support','Basic Analytics'], h:false},
          {t:'Creator', p:'$29',    f:['Unlimited Projects','Custom Domains','Priority Support','Advanced Analytics','AI Tools'], h:true},
          {t:'Agency',  p:'$99',    f:['White Label','Client Management','Dedicated CSM','Custom Contracts','API Access'], h:false},
        ].map(plan => `
          <div style="background:${plan.h?'rgba(129,140,248,.06)':c.card};
            border:1px solid ${plan.h?'rgba(129,140,248,.5)':c.border};
            border-radius:24px;padding:40px;position:relative;
            transform:${plan.h?'scale(1.04)':''};
            box-shadow:${plan.h?'0 24px 60px rgba(129,140,248,.15)':'none'};">
            ${plan.h?`<div style="position:absolute;top:-13px;left:50%;
              transform:translateX(-50%);background:${c.grad};border-radius:100px;
              padding:4px 14px;font-size:11px;font-weight:800;color:#fff;
              letter-spacing:.06em;text-transform:uppercase;">Most Popular</div>`:''}
            <h3 style="font-size:22px;font-weight:700;color:${c.txt};margin:0 0 8px;">${plan.t}</h3>
            <div style="font-size:54px;font-weight:900;line-height:1;margin:20px 0;
              background:${plan.h?c.grad:'none'};color:${plan.h?'transparent':c.txt};
              -webkit-background-clip:${plan.h?'text':''};-webkit-text-fill-color:${plan.h?'transparent':c.txt};">
              ${plan.p}<span style="font-size:16px;font-weight:500;color:${c.muted};
                -webkit-text-fill-color:${c.muted};">${plan.p!=='Free'?'/mo':''}</span></div>
            <ul style="list-style:none;padding:0;margin:0 0 36px;">
              ${plan.f.map(fi => `<li style="display:flex;gap:10px;font-size:14px;
                color:${c.muted};margin-bottom:12px;">
                <span style="color:${c.accent};flex-shrink:0;">✓</span>${fi}</li>`).join('')}
            </ul>
            ${btn(plan.t==='Starter'?'Get Started Free':'Subscribe Now', plan.h)}
          </div>
        `).join('')}
      </div>
    `, '80px'),
  });

  // (Consolidated Newsletter into Email Optin)

}
