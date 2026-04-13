/**
 * MWP Visual Builder — Premium Glassmorphic Modules
 * 
 * A high-end redesign inspired by Framer, Linear, and Webflow.
 * Translates standard drag-and-drop elements into deep dark-glass aesthetics 
 * using data-driven generators, massive gradients, and crisp typography.
 */

import registerDiviModules from './divi-modules.js';

export default function registerModules(editor) {
  const bm = editor.BlockManager;

  /* ─────────────────────────────────────────────────────────
   * CATEGORIES
   * ───────────────────────────────────────────────────────── */
  const cats = {
    layout:      '⬜ Layout',
    hero:        '🚀 Hero Sections',
    content:     '📝 Content',
    media:       '🖼 Media',
    cta:         '⚡ Call To Action',
    social:      '💬 Social',
    pricing:     '💰 Pricing',
    team:        '👥 Team',
    portfolio:   '🎨 Portfolio',
    stats:       '📊 Stats & Numbers',
    testimonial: '⭐ Testimonials',
    faq:         '❓ FAQ',
    nav:         '🧭 Navigation',
    footer:      '🔻 Footer',
    interactive: '🎛 Interactive',
    forms:       '📋 Forms',
    blog:        '📰 Blog',
    shop:        '🛒 Shop',
  };

  /* ─────────────────────────────────────────────────────────
   * DESIGN SYSTEM HELPERS (Dark Glassmorphic)
   * ───────────────────────────────────────────────────────── */
  const colors = {
    bgBase: '#090A0F',               // Ultra dark background
    bgCard: 'rgba(255,255,255,0.02)', // Glass pane
    bgCardHover: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.06)',
    borderGlow: 'rgba(255,255,255,0.12)',
    textPrimary: '#F8FAFC',
    textMuted: '#8b949e',
    textDim: '#475569',
    accent: 'var(--ztt-primary, #818cf8)',
    accentGradient: 'var(--ztt-gradient, linear-gradient(135deg, #818cf8 0%, #c084fc 100%))',
  };

  const fonts = `font-family: 'Inter', system-ui, sans-serif;`;

  /* Common HTML generators */
  const glassPanel = (content, padding = '40px') => `
    <div style="background: ${colors.bgCard}; border: 1px solid ${colors.border}; border-radius: 24px; padding: ${padding}; backdrop-filter: blur(20px); box-shadow: 0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05); transition: transform 0.3s ease, border-color 0.3s ease;">
      ${content}
    </div>
  `;

  const sectionWrap = (inner, py = '120px') => `
    <section style="width:100%; background:${colors.bgBase}; padding:${py} 24px; box-sizing:border-box; ${fonts} color:${colors.textPrimary}; position:relative; overflow:hidden;">
      <div style="position:absolute; top:-200px; left:-200px; width:600px; height:600px; background:radial-gradient(circle, rgba(129,140,248,0.1) 0%, transparent 70%); border-radius:50%; filter:blur(60px); pointer-events:none;"></div>
      <div style="max-width:1200px; margin:0 auto; position:relative; z-index:2;">${inner}</div>
    </section>
  `;

  const heading = (text, size = '56px', customStyle = '') => `
    <h2 style="font-size:${size}; font-weight:800; color:${colors.textPrimary}; letter-spacing:-0.03em; line-height:1.1; margin:0 0 20px; ${customStyle}">${text}</h2>
  `;

  const subheading = (text, size = '18px') => `
    <p style="font-size:${size}; color:${colors.textMuted}; line-height:1.6; font-weight:400; margin:0 0 40px; max-width: 600px;">${text}</p>
  `;

  const btn = (label, primary = true) => primary 
    ? `<a href="#" style="display:inline-flex; align-items:center; justify-content:center; padding:14px 28px; background:${colors.accentGradient}; color:#fff; border-radius:12px; text-decoration:none; font-weight:600; font-size:15px; letter-spacing:0.02em; box-shadow:0 8px 24px rgba(129,140,248,0.3); transition:all 0.2s;">${label}</a>`
    : `<a href="#" style="display:inline-flex; align-items:center; justify-content:center; padding:14px 28px; background:rgba(255,255,255,0.05); color:${colors.textPrimary}; border:1px solid ${colors.border}; border-radius:12px; text-decoration:none; font-weight:600; font-size:15px; letter-spacing:0.02em; backdrop-filter:blur(10px); transition:all 0.2s;">${label}</a>`;

  const badge = (text) => `
    <div style="display:inline-flex; align-items:center; padding:6px 14px; background:rgba(129,140,248,0.1); border:1px solid rgba(129,140,248,0.2); color:${colors.accent}; border-radius:100px; font-size:12px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:24px;">${text}</div>
  `;

  const placeholderImg = (height = '300px', text = 'Media') => `
    <div style="width:100%; height:${height}; background:rgba(255,255,255,0.02); border:1px dashed ${colors.borderGlow}; border-radius:20px; display:flex; align-items:center; justify-content:center; color:${colors.textDim}; font-size:14px; letter-spacing:0.1em; text-transform:uppercase;">${text}</div>
  `;

  /* SVG Icons for Toolbox */
  const makeSvg = (path) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="gjs-block-svg"><path d="${path}"/></svg>`;


  /* ══════════════════════════════════════════════════════════
   * 1. LAYOUT MODULES (Glassy dropzones)
   * ══════════════════════════════════════════════════════════ */
  const layoutStyle = `min-height:140px; background:rgba(255,255,255,0.01); border:1px dashed ${colors.borderGlow}; border-radius:16px; padding:24px; display:flex; align-items:center; justify-content:center; color:${colors.textDim}; font-size:13px; font-weight:500; letter-spacing:0.04em; transition:all 0.2s;`;

  bm.add('col-1', {
    label: '1 Column', category: cats.layout, media: makeSvg('M3 3h18v18H3z'),
    content: sectionWrap(`<div style="${layoutStyle} width:100%;">Content Area</div>`, '40px')
  });

  bm.add('col-2', {
    label: '2 Columns', category: cats.layout, media: makeSvg('M3 3h8v18H3z M13 3h8v18H13z'),
    content: sectionWrap(`
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:32px;">
        <div style="${layoutStyle}">Col 1</div><div style="${layoutStyle}">Col 2</div>
      </div>`, '40px')
  });

  bm.add('col-3', {
    label: '3 Columns', category: cats.layout, media: makeSvg('M2 3h6v18H2z M9 3h6v18H9z M16 3h6v18H16z'),
    content: sectionWrap(`
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:24px;">
        <div style="${layoutStyle}">Col 1</div><div style="${layoutStyle}">Col 2</div><div style="${layoutStyle}">Col 3</div>
      </div>`, '40px')
  });


  /* ══════════════════════════════════════════════════════════
   * 2. HERO MODULES
   * ══════════════════════════════════════════════════════════ */
  bm.add('hero-main', {
    label: 'Hero Main', category: cats.hero, media: makeSvg('M3 3h18v10H3z M8 17h8'),
    content: sectionWrap(`
      <div style="text-align:center; max-width:880px; margin:0 auto; display:flex; flex-direction:column; align-items:center;">
        ${badge('✨ Welcome to the future')}
        <h1 style="font-size:72px; font-weight:900; letter-spacing:-0.05em; line-height:1.05; margin:0 0 24px; background:linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Build Lightning Fast Digital Experiences</h1>
        ${subheading('Everything you need to launch a spectacular website. Engineered for scale, designed for conversion, and powered by glassmorphism.', '20px')}
        <div style="display:flex; gap:16px; margin-top:10px;">${btn('Start Building Free')}${btn('View Components', false)}</div>
        <div style="margin-top:80px; width:100%; -webkit-mask-image:linear-gradient(to bottom, black 50%, transparent 100%);">${placeholderImg('400px', 'Hero Dashboard Preview')}</div>
      </div>
    `, '140px')
  });

  bm.add('hero-split', {
    label: 'Hero Split', category: cats.hero, media: makeSvg('M3 3h8v18H3z M13 3h8v18H13z'),
    content: sectionWrap(`
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center;">
        <div>
          ${badge('🚀 Launch Faster')}
          ${heading('The ultimate toolkit for modern creators', '64px')}
          ${subheading('Deploy high-fidelity concepts straight to production without writing a single line of backend logic. Fully responsive out of the box.')}
          <div style="display:flex; gap:16px;">${btn('Start Free Trial')}${btn('Read Docs', false)}</div>
        </div>
        <div style="position:relative;">
          <div style="position:absolute; inset:-20px; background:${colors.accentGradient}; filter:blur(40px); opacity:0.2; border-radius:50%;"></div>
          ${glassPanel(placeholderImg('450px', 'App Interface'), '10px')}
        </div>
      </div>
    `)
  });


  /* ══════════════════════════════════════════════════════════
   * 3. CONTENT MODULES (Feature grids etc)
   * ══════════════════════════════════════════════════════════ */
  bm.add('features-grid', {
    label: 'Feature Grid', category: cats.content, media: makeSvg('M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z'),
    content: sectionWrap(`
      <div style="text-align:center; max-width:700px; margin:0 auto 70px;">
        ${heading('Everything you need to scale', '48px')}
        ${subheading('Stop assembling puzzles. Get a unified platform that just works.')}
      </div>
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:24px;">
        ${[
          {i: '⚡', t: 'Blazing Speed', d: 'Global edge network delivery built-in.'},
          {i: '🔒', t: 'Secure Core', d: 'Enterprise-grade encryption everywhere.'},
          {i: '🤖', t: 'AI Powered', d: 'Generative layouts and copywriting.'},
          {i: '🎨', t: 'Glassmorphic', d: 'Beautiful defaults via CSS variables.'},
          {i: '🔌', t: 'API First', d: 'Connect to any headless service instantly.'},
          {i: '📱', t: 'Responsive', d: 'Fluid engines adapt to any viewport.'}
        ].map(f => glassPanel(`
          <div style="width:48px; height:48px; background:rgba(255,255,255,0.05); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:24px; margin-bottom:24px;">${f.i}</div>
          <h3 style="font-size:20px; font-weight:700; color:#fff; margin:0 0 12px; letter-spacing:-0.01em;">${f.t}</h3>
          <p style="font-size:15px; color:${colors.textMuted}; line-height:1.6; margin:0;">${f.d}</p>
        `, '32px')).join('')}
      </div>
    `)
  });

  bm.add('image-text', {
    label: 'Image & Text', category: cats.content, media: makeSvg('M3 3h18v18H3z M3 10h18'),
    content: sectionWrap(`
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center;">
        <div>${placeholderImg('400px')}</div>
        <div>
          ${heading('Uncompromising quality in every pixel', '42px')}
          ${subheading('We obsess over details. From sub-pixel border radii calculations to hardware accelerated transitions, everything is polished.')}
          <ul style="list-style:none; padding:0; margin:0 0 32px;">
            ${['Custom dynamic routing','Server-side rendering','Automated visual testing'].map(i => `
              <li style="display:flex; align-items:center; gap:12px; font-size:16px; color:${colors.textMuted}; margin-bottom:16px;">
                <span style="display:flex; align-items:center; justify-content:center; width:20px; height:20px; background:rgba(129,140,248,0.2); color:${colors.accent}; border-radius:50%; font-size:12px;">✓</span> ${i}
              </li>
            `).join('')}
          </ul>
          ${btn('Discover Features', false)}
        </div>
      </div>
    `)
  });


  /* ══════════════════════════════════════════════════════════
   * 4. MEDIA (Portfolio / Galleries)
   * ══════════════════════════════════════════════════════════ */
  bm.add('logo-strip', {
    label: 'Logo Strip', category: cats.media, media: makeSvg('M4 12h16 M4 8h16 M4 16h16'),
    content: sectionWrap(`
      <p style="text-align:center; font-size:14px; font-weight:600; color:${colors.textDim}; letter-spacing:0.1em; text-transform:uppercase; margin:0 0 40px;">Trusted by innovative teams worldwide</p>
      <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:60px; opacity:0.6; filter:grayscale(100%);">
        ${['Acme Corp', 'Globex', 'Soylent', 'Initech', 'Umbrella'].map(n => `<div style="font-size:24px; font-weight:800; letter-spacing:-0.05em; color:#fff;">${n}</div>`).join('')}
      </div>
    `, '80px')
  });

  bm.add('portfolio-grid', {
    label: 'Portfolio', category: cats.portfolio, media: makeSvg('M3 3h8v8H3z M13 3h8v8h-8z M13 13h8v8h-8z'),
    content: sectionWrap(`
      <div style="text-align:center; margin-bottom:60px;">
        ${heading('Selected Works')}
      </div>
      <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:32px;">
        ${[1,2,3,4].map(i => `
          <div style="group cursor:pointer;">
            <div style="overflow:hidden; border-radius:24px; margin-bottom:20px;">
              <div style="width:100%; height:320px; background:rgba(255,255,255,0.02); border:1px solid ${colors.border}; display:flex; align-items:center; justify-content:center; transition:transform 0.5s ease;">
                <span style="color:${colors.textDim}; font-size:13px; text-transform:uppercase; letter-spacing:0.1em;">Project ${i} Image</span>
              </div>
            </div>
            <h3 style="font-size:22px; font-weight:700; margin:0 0 8px;">Quantum Redesign</h3>
            <p style="color:${colors.textMuted}; font-size:15px; margin:0;">Web Application · Brand Identity</p>
          </div>
        `).join('')}
      </div>
    `)
  });


  /* ══════════════════════════════════════════════════════════
   * 5. STATS & TESTIMONIALS
   * ══════════════════════════════════════════════════════════ */
  bm.add('stats-row', {
    label: 'Stats Numbers', category: cats.stats, media: makeSvg('M4 18v-8 M10 18v-4 M16 18v-12'),
    content: sectionWrap(`
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:32px; text-align:center;">
        ${[['$2B+', 'Volume Processed'], ['99.99%', 'SLA Guaranteed'], ['10k+', 'Active Designers'], ['<10ms', 'Global Latency']].map(s => `
          ${glassPanel(`
            <div style="font-size:48px; font-weight:900; background:${colors.accentGradient}; -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:8px; line-height:1;">${s[0]}</div>
            <div style="font-size:14px; font-weight:600; color:${colors.textMuted}; letter-spacing:0.02em;">${s[1]}</div>
          `, '32px 20px')}
        `).join('')}
      </div>
    `, '80px')
  });

  bm.add('testimonial-card', {
    label: 'Testimonials', category: cats.testimonial, media: makeSvg('M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z'),
    content: sectionWrap(`
      ${heading('Loved by industry leaders', '48px', 'text-align:center; transform:translateY(-20px);')}
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:24px;">
        ${[1,2,3].map(() => glassPanel(`
          <div style="color:#f59e0b; font-size:14px; margin-bottom:20px; letter-spacing:2px;">★★★★★</div>
          <p style="font-size:16px; color:${colors.textPrimary}; line-height:1.7; margin:0 0 24px;">"This completely revolutionized how we approach frontend builds. Easily saved us hundreds of hours on the launch."</p>
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:40px; height:40px; border-radius:50%; background:rgba(255,255,255,0.1);"></div>
            <div>
              <div style="font-size:14px; font-weight:700;">Sarah Jenkins</div>
              <div style="font-size:12px; color:${colors.textMuted};">CTO at TechFlow</div>
            </div>
          </div>
        `, '32px')).join('')}
      </div>
    `)
  });


  /* ══════════════════════════════════════════════════════════
   * 6. CTA & PRICING
   * ══════════════════════════════════════════════════════════ */
  bm.add('cta-banner', {
    label: 'CTA Banner', category: cats.cta, media: makeSvg('M13 10V3L4 14h7v7l9-11h-7z'),
    content: sectionWrap(`
      <div style="position:relative; width:100%; border-radius:32px; padding:80px 40px; text-align:center; overflow:hidden;">
        <div style="position:absolute; inset:0; background:${colors.accentGradient}; opacity:0.1;"></div>
        <div style="position:absolute; inset:0; backdrop-filter:blur(10px); border:1px solid ${colors.borderGlow}; border-radius:32px;"></div>
        
        <div style="position:relative; z-index:2; max-width:600px; margin:0 auto;">
          ${heading('Ready to deploy?', '56px')}
          <p style="font-size:18px; color:rgba(255,255,255,0.7); margin:0 0 40px; line-height:1.6;">Join thousands of bleeding-edge developers scaling the web of tomorrow.</p>
          <div style="display:flex; gap:16px; justify-content:center;">${btn('Get Started')}${btn('Contact Sales', false)}</div>
        </div>
      </div>
    `, '60px')
  });

  bm.add('pricing-tables', {
    label: 'Pricing', category: cats.pricing, media: makeSvg('M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6'),
    content: sectionWrap(`
      <div style="text-align:center; margin-bottom:60px;">
        ${heading('Transparent, simple pricing')}
      </div>
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:24px; align-items:center;">
        ${[
          {t: 'Starter', p: 'Free', d: 'Perfect for side projects.', f: ['1 Project','Community Support','Basic Analytics']},
          {t: 'Pro', p: '$29', d: 'For professional creators.', f: ['Unlimited Projects','Priority Support','Advanced Analytics', 'Custom Domains'], h: true},
          {t: 'Enterprise', p: 'Custom', d: 'For massive scale.', f: ['Dedicated Infra','SLA 99.99%','Custom Contracts', 'On-premise deployment']}
        ].map(p => `
          <div style="background:${p.h ? 'rgba(255,255,255,0.04)' : colors.bgCard}; border:1px solid ${p.h ? colors.accent : colors.border}; border-radius:24px; padding:40px; position:relative; box-shadow:${p.h ? '0 24px 60px rgba(129,140,248,0.15)' : 'none'}; transform:${p.h ? 'scale(1.05)' : 'none'}; z-index:${p.h ? '10' : '1'};">
            ${p.h ? `<div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:${colors.accentGradient}; padding:4px 12px; border-radius:100px; font-size:11px; font-weight:800; letter-spacing:0.1em; text-transform:uppercase;">Most Popular</div>` : ''}
            <h3 style="font-size:22px; margin:0 0 8px;">${p.t}</h3>
            <p style="font-size:14px; color:${colors.textMuted}; margin:0 0 24px;">${p.d}</p>
            <div style="font-size:56px; font-weight:800; line-height:1; margin-bottom:32px;">${p.p}<span style="font-size:16px; color:${colors.textMuted}; font-weight:500;">${p.p!=='Custom'&&p.p!=='Free'?'/mo':''}</span></div>
            <ul style="list-style:none; padding:0; margin:0 0 40px;">
              ${p.f.map(f => `<li style="display:flex; align-items:center; gap:12px; font-size:14px; color:${colors.textPrimary}; margin-bottom:16px; opacity:0.9;"><span style="color:${colors.accent}; font-size:14px;">✓</span> ${f}</li>`).join('')}
            </ul>
            ${btn(p.t==='Enterprise' ? 'Contact Sales' : 'Get Started', p.h)}
          </div>
        `).join('')}
      </div>
    `)
  });


  /* ══════════════════════════════════════════════════════════
   * 7. BLOG & E-COMMERCE
   * ══════════════════════════════════════════════════════════ */
  bm.add('blog-cards', {
    label: 'Blog Grid', category: cats.blog, media: makeSvg('M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2z'),
    content: sectionWrap(`
      <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:40px;">
        <div style="max-width:500px;">${heading('Latest Insights', '40px')}</div>
        ${btn('View All Articles', false)}
      </div>
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:24px;">
        ${[1,2,3].map(i => `
          <article style="background:${colors.bgCard}; border:1px solid ${colors.border}; border-radius:24px; overflow:hidden; transition:transform 0.3s;">
            ${placeholderImg('220px', 'Article Cover')}
            <div style="padding:32px;">
              <div style="font-size:12px; font-weight:700; color:${colors.accent}; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:12px;">Engineering</div>
              <h3 style="font-size:20px; font-weight:700; line-height:1.4; margin:0 0 16px;">The architecture of next-generation visual builders</h3>
              <p style="font-size:14px; color:${colors.textMuted}; line-height:1.6; margin:0;">An in-depth look at state mapping in the DOM...</p>
            </div>
          </article>
        `).join('')}
      </div>
    `)
  });

  bm.add('product-cards', {
    label: 'Products', category: cats.shop, media: makeSvg('M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'),
    content: sectionWrap(`
      ${heading('Premium Hardware', '48px', 'text-align:center;')}
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:24px; margin-top:40px;">
        ${[
          {n: 'Neural Engine V2', p: '$499'}, {n: 'Quantum Board', p: '$249'}, 
          {n: 'Optic Cables', p: '$29'}, {n: 'Haptic Keypad', p: '$129'}
        ].map(i => `
          <div style="background:${colors.bgCard}; border:1px solid ${colors.border}; border-radius:20px; padding:16px; text-align:center;">
            <div style="width:100%; height:200px; background:rgba(255,255,255,0.03); border-radius:12px; margin-bottom:20px; display:flex; align-items:center; justify-content:center; font-size:40px;">📦</div>
            <h4 style="font-size:16px; font-weight:600; margin:0 0 8px;">${i.n}</h4>
            <div style="font-size:16px; color:${colors.textMuted}; margin-bottom:20px;">${i.p}</div>
            <a href="#" style="display:block; padding:12px; border-radius:10px; background:rgba(255,255,255,0.05); color:#fff; text-decoration:none; font-size:13px; font-weight:600; transition:background 0.2s;">Add to Cart</a>
          </div>
        `).join('')}
      </div>
    `)
  });


  /* ══════════════════════════════════════════════════════════
   * 8. NAVIGATION & FOOTER
   * ══════════════════════════════════════════════════════════ */
  bm.add('navbar-glass', {
    label: 'Glass Navbar', category: cats.nav, media: makeSvg('M3 12h18 M3 6h18 M3 18h18'),
    content: `
      <nav style="position:fixed; top:0; left:0; right:0; height:80px; background:rgba(9, 10, 15, 0.7); backdrop-filter:blur(24px); border-bottom:1px solid ${colors.border}; z-index:1000; display:flex; align-items:center; justify-content:space-between; padding:0 40px; ${fonts} color:#fff;">
        <div style="font-size:20px; font-weight:800; letter-spacing:-0.03em;">◆ Brand</div>
        <div style="display:flex; gap:32px;">
          ${['Platform', 'Solutions', 'Developers', 'Resources'].map(l => `<a href="#" style="font-size:14px; font-weight:500; color:rgba(255,255,255,0.7); text-decoration:none; transition:color 0.2s;">${l}</a>`).join('')}
        </div>
        <div style="display:flex; align-items:center; gap:20px;">
          <a href="#" style="font-size:14px; font-weight:500; color:#fff; text-decoration:none;">Log in</a>
          ${btn('Sign Up', false).replace('padding:14px 28px;', 'padding:8px 16px; font-size:13px;')}
        </div>
      </nav>
    `
  });

  bm.add('footer-modern', {
    label: 'Modern Footer', category: cats.footer, media: makeSvg('M3 16h18 M3 20h18 M12 6v6'),
    content: `
      <footer style="background:#050508; border-top:1px solid ${colors.border}; padding:80px 40px 40px; ${fonts} color:#fff;">
        <div style="max-width:1200px; margin:0 auto; display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:64px; margin-bottom:80px;">
          <div>
            <div style="font-size:24px; font-weight:800; margin-bottom:20px;">◆ Brand</div>
            <p style="font-size:14px; color:${colors.textMuted}; line-height:1.6; max-width:280px;">Designing the next generation of visual editing platforms for the modern web.</p>
          </div>
          ${[
            {h: 'Product', l: ['Features', 'Integrations', 'Pricing', 'Changelog']},
            {h: 'Company', l: ['About Us', 'Careers', 'Blog', 'Contact']},
            {h: 'Legal', l: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security']}
          ].map(c => `
            <div>
              <h4 style="font-size:14px; font-weight:700; color:#fff; margin:0 0 24px;">${c.h}</h4>
              <ul style="list-style:none; padding:0; margin:0;">
                ${c.l.map(link => `<li style="margin-bottom:12px;"><a href="#" style="font-size:14px; color:${colors.textMuted}; text-decoration:none;">${link}</a></li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
        <div style="max-width:1200px; margin:0 auto; border-top:1px solid rgba(255,255,255,0.05); padding-top:32px; display:flex; justify-content:space-between; font-size:13px; color:${colors.textDim};">
          <div>© 2026 Brand Inc. All rights reserved.</div>
          <div style="display:flex; gap:24px;"><span>X (Twitter)</span><span>LinkedIn</span><span>GitHub</span></div>
        </div>
      </footer>
    `
  });


  /* ══════════════════════════════════════════════════════════
   * 9. FORMS & FAQ
   * ══════════════════════════════════════════════════════════ */
  bm.add('contact-glass', {
    label: 'Contact Form', category: cats.forms, media: makeSvg('M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'),
    content: sectionWrap(`
      <div style="display:grid; grid-template-columns:1fr 1.2fr; gap:80px; align-items:center;">
        <div>
          ${heading('Get in touch', '48px')}
          ${subheading('Our engineering team is ready to help you architect your next breakthrough.')}
          <div style="margin-top:40px;">
            <div style="font-size:14px; color:${colors.textMuted}; margin-bottom:8px;">Email us directly</div>
            <div style="font-size:20px; font-weight:600;">hello@brand.com</div>
          </div>
        </div>
        ${glassPanel(`
          <form style="display:flex; flex-direction:column; gap:20px;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
              <input placeholder="First Name" style="width:100%; background:rgba(0,0,0,0.2); border:1px solid ${colors.border}; border-radius:12px; padding:16px; color:#fff; outline:none; font-family:Inter; font-size:14px;">
              <input placeholder="Last Name" style="width:100%; background:rgba(0,0,0,0.2); border:1px solid ${colors.border}; border-radius:12px; padding:16px; color:#fff; outline:none; font-family:Inter; font-size:14px;">
            </div>
            <input placeholder="Work Email Address" style="width:100%; background:rgba(0,0,0,0.2); border:1px solid ${colors.border}; border-radius:12px; padding:16px; color:#fff; outline:none; font-family:Inter; font-size:14px;">
            <textarea placeholder="How can we help?" rows="4" style="width:100%; background:rgba(0,0,0,0.2); border:1px solid ${colors.border}; border-radius:12px; padding:16px; color:#fff; outline:none; font-family:Inter; resize:vertical; font-size:14px;"></textarea>
            ${btn('Send Message')}
          </form>
        `)}
      </div>
    `)
  });

  bm.add('faq-accordion', {
    label: 'FAQ Accordion', category: cats.faq, media: makeSvg('M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'),
    content: sectionWrap(`
      <div style="text-align:center; margin-bottom:60px;">${heading('Frequently Asked', '40px')}</div>
      <div style="max-width:700px; margin:0 auto; display:flex; flex-direction:column; gap:16px;">
        ${[
          {q: 'How does the rendering engine work under the hood?', a: 'It utilizes a proprietary VDOM mapping sequence that prevents re-hydrations.'},
          {q: 'Can I export the code to a raw Next.js app?', a: 'Yes. With a single click you can eject the semantic, typed React components.'},
          {q: 'Is it completely secure?', a: 'Everything runs on isolated edge functions with strict CSPs and full sandboxing.'}
        ].map(f => glassPanel(`
          <details style="width:100%;">
            <summary style="font-size:18px; font-weight:600; cursor:pointer; list-style:none; outline:none; display:flex; justify-content:space-between;">
              ${f.q} <span style="color:${colors.accent};">+</span>
            </summary>
            <div style="padding-top:16px; font-size:15px; color:${colors.textMuted}; line-height:1.6;">${f.a}</div>
          </details>
        `, '24px 32px')).join('')}
      </div>
    `)
  });


  /* ══════════════════════════════════════════════════════════
   * 10. DIVIDERS & SPACERS
   * ══════════════════════════════════════════════════════════ */
  bm.add('spacer-md', {
    label: 'Spacer MD', category: cats.layout, media: makeSvg('M8 9l4-4 4 4 M16 15l-4 4-4-4'),
    content: `<div style="height:80px; width:100%;"></div>`
  });

  bm.add('divider-glow', {
    label: 'Glow Divider', category: cats.layout, media: makeSvg('M5 12h14'),
    content: `
      <div style="width:100%; height:1px; background:linear-gradient(90deg, transparent, ${colors.accent}, transparent); opacity:0.5; margin:40px 0;"></div>
    `
  });

  /* ══════════════════════════════════════════════════════════
   * PREMIUM SWIPER SLIDER MODULE
   * ══════════════════════════════════════════════════════════ */
  
  // 1. Component Definitions
  editor.DomComponents.addType('swiper-container', {
    model: {
      defaults: {
        tagName: 'div',
        attributes: { class: 'swiper premium-slider' },
        traits: [
          { type: 'checkbox', name: 'loop', label: 'Loop', changeProp: 1 },
          { type: 'number', name: 'delay', label: 'Autoplay Delay', changeProp: 1 },
          { type: 'select', name: 'effect', label: 'Effect', options: [
            { id: 'slide', name: 'Slide' },
            { id: 'fade', name: 'Fade' },
            { id: 'cube', name: 'Cube' },
            { id: 'coverflow', name: 'Coverflow' },
          ], changeProp: 1 },
        ],
        // Sync properties to attributes for the script to read
        'change:loop': (m, v) => m.addAttributes({ 'data-loop': v }),
        'change:delay': (m, v) => m.addAttributes({ 'data-delay': v }),
        'change:effect': (m, v) => m.addAttributes({ 'data-effect': v }),
        script: function() {
          const el = this;
          const options = {
            loop: el.getAttribute('data-loop') === 'true',
            autoplay: { delay: parseInt(el.getAttribute('data-delay')) || 5000 },
            effect: el.getAttribute('data-effect') || 'slide',
            pagination: { el: el.querySelector('.swiper-pagination'), clickable: true },
            navigation: { 
              nextEl: el.querySelector('.swiper-button-next'), 
              prevEl: el.querySelector('.swiper-button-prev') 
            },
          };
          const init = () => {
            if (el.swiper) el.swiper.destroy();
            if (typeof Swiper !== 'undefined') new Swiper(el, options);
          };
          if (typeof Swiper === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
            script.onload = init;
            document.head.appendChild(script);
          } else {
            init();
          }
        },
      },
    },
  });

  // 2. Add the Block
  bm.add('premium-slider', {
    label: 'Slider (Swiper)',
    category: cats.interactive,
    media: makeSvg('M1 12h4M19 12h4M7 5l10 7-10 7V5z'),
    content: {
      type: 'swiper-container',
      content: `
        <div class="swiper-wrapper">
          <div class="swiper-slide" style="height:400px; display:flex; align-items:center; justify-content:center; background:rgba(124,58,237,0.1); border-radius:24px; border:1px solid ${colors.border}; backdrop-filter:blur(10px);">
            <div style="text-align:center;">
              <h2 style="font-size:48px; font-weight:800; margin-bottom:10px;">Slide One</h2>
              <p style="color:${colors.textMuted};">Premium Glassmorphic Slide Content</p>
            </div>
          </div>
          <div class="swiper-slide" style="height:400px; display:flex; align-items:center; justify-content:center; background:rgba(6,182,212,0.1); border-radius:24px; border:1px solid ${colors.border}; backdrop-filter:blur(10px);">
            <div style="text-align:center;">
              <h2 style="font-size:48px; font-weight:800; margin-bottom:10px;">Slide Two</h2>
              <p style="color:${colors.textMuted};">Fully interactive and responsive</p>
            </div>
          </div>
          <div class="swiper-slide" style="height:400px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.03); border-radius:24px; border:1px solid ${colors.border}; backdrop-filter:blur(10px);">
            <div style="text-align:center;">
              <h2 style="font-size:48px; font-weight:800; margin-bottom:10px;">Slide Three</h2>
              <p style="color:${colors.textMuted};">Unlimited possibilities</p>
            </div>
          </div>
        </div>
        <div class="swiper-pagination"></div>
        <div class="swiper-button-prev" style="color:${colors.accent};"></div>
        <div class="swiper-button-next" style="color:${colors.accent};"></div>
        <style>
          .swiper-button-next:after, .swiper-button-prev:after { font-size: 24px !important; font-weight: 800; }
          .swiper-pagination-bullet { background: #fff !important; opacity: 0.3; }
          .swiper-pagination-bullet-active { background: ${colors.accent} !important; opacity: 1; box-shadow: 0 0 10px ${colors.accent}; }
        </style>
      `
    }
  });

  /* ── Register all Divi-equivalent module blocks ─────────────────────────── */

  registerDiviModules(editor);

}
