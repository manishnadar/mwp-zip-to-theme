import { useEffect, useState, useRef } from 'react';
import grapesjs from 'grapesjs';
import webpagePreset from 'grapesjs-preset-webpage';
import blocksBasic from 'grapesjs-blocks-basic';
import formsPlugin from 'grapesjs-plugin-forms';
import flexboxPlugin from 'grapesjs-blocks-flexbox';
import customCodePlugin from 'grapesjs-custom-code';
import tabsPlugin from 'grapesjs-tabs';
import tooltipPlugin from 'grapesjs-tooltip';
import countdownPlugin from 'grapesjs-component-countdown';
import typedPlugin from 'grapesjs-typed';
import styleBgPlugin from 'grapesjs-style-bg';
import axios from 'axios';
import registerModules from './modules';
import ThemeColorPanel, { getThemeCssVars } from './components/ThemeColorPanel';
import './App.css';

const PRELOADER_KEYWORDS = ['preload', 'loader', 'loading', 'spinner', 'pace'];
const PRELOADER_BASE_SELECTORS = [
  '#preloader', '#pre-loader', '#preloader-it', '#page-preloader', '#site-preloader',
  '#loader', '#loading', '#page-loader',
  '.preloader', '.pre-loader', '.preloader-wrapper', '.preloader-container',
  '.loader', '.loading', '.site-loader', '.page-loader',
  '.preload', '.preload-wrapper', '.preloading',
];
const PRELOADER_ATTR_SELECTORS = PRELOADER_KEYWORDS.flatMap(k => ([
  `[id*="${k}" i]`,
  `[class*="${k}" i]`,
  `[data-role*="${k}" i]`,
  `[data-testid*="${k}" i]`,
  `[aria-label*="${k}" i]`,
]));
const PRELOADER_SELECTOR_STRING = [...PRELOADER_BASE_SELECTORS, ...PRELOADER_ATTR_SELECTORS].join(',');

function preloaderCssRule() {
  return `
    ${PRELOADER_SELECTOR_STRING} {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      z-index: -9999 !important;
    }
    [data-aos],
    [class*="fade-"],
    [class*="reveal"] {
      opacity: 1 !important;
      transform: none !important;
      visibility: visible !important;
      animation: none !important;
      transition: none !important;
    }
  `;
}

function removeLikelyPreloaders(cdoc) {
  if (!cdoc) return 0;
  let removed = 0;
  const seen = new Set();
  const exclusions = ['glightbox-container', 'gloader', 'gjs-'];
  const nodes = Array.from(cdoc.querySelectorAll('*'));
  const vw = cdoc.documentElement.clientWidth || cdoc.body.clientWidth || 0;
  const vh = cdoc.documentElement.clientHeight || cdoc.body.clientHeight || 0;

  const safeRemove = (el) => {
    if (!el || !el.parentNode || seen.has(el)) return;
    seen.add(el);
    el.parentNode.removeChild(el);
    removed += 1;
  };

  cdoc.querySelectorAll(PRELOADER_SELECTOR_STRING).forEach(safeRemove);

  nodes.forEach((el) => {
    if (!el || !el.parentElement || seen.has(el)) return;
    const id = (el.id || '').toLowerCase();
    const cls = (typeof el.className === 'string' ? el.className : '').toLowerCase();
    const attrs = [
      id,
      cls,
      (el.getAttribute('name') || '').toLowerCase(),
      (el.getAttribute('data-role') || '').toLowerCase(),
      (el.getAttribute('aria-label') || '').toLowerCase(),
      (el.getAttribute('data-testid') || '').toLowerCase(),
    ].join(' ');
    if (exclusions.some(ex => attrs.includes(ex))) return;

    const s = cdoc.defaultView.getComputedStyle(el);
    const z = Number.parseInt(s.zIndex, 10);
    const rect = el.getBoundingClientRect();
    const coversViewport = vw > 0 && vh > 0 && rect.width >= vw * 0.85 && rect.height >= vh * 0.85;
    const isPositioned = ['fixed', 'absolute', 'sticky'].includes(s.position);
    const isVisible = s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.opacity || '1') > 0.01;
    const pointerBlocking = s.pointerEvents !== 'none';
    const keywordHit = PRELOADER_KEYWORDS.some(k => attrs.includes(k));
    const highZ = Number.isFinite(z) && z >= 90;

    const looksLikePreloader =
      (keywordHit && isPositioned && (highZ || coversViewport)) ||
      (coversViewport && isPositioned && highZ && isVisible && pointerBlocking);

    if (looksLikePreloader) safeRemove(el);
  });

  if (cdoc.body) {
    cdoc.body.style.overflow = 'visible';
    cdoc.body.style.display = 'block';
  }
  if (cdoc.documentElement) {
    cdoc.documentElement.style.overflow = 'visible';
  }
  return removed;
}

function normalizeWpMarkup(html) {
  return html
    .replace(/<!--\s*\/?wp:[\s\S]*?-->/g, '')
    .replace(/<div[^>]*class="[^"]*wp-block-html[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, '$1');
}

function unlockImportedComponents(editor) {
  if (!editor) return;
  const wrapper = editor.getWrapper();
  if (!wrapper) return;

  const textTags = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'li', 'button', 'label']);
  const applyComponentInteractivity = (cmp) => {
    if (!cmp) return;
    const tag = (cmp.get('tagName') || '').toLowerCase();
    const attrs = cmp.getAttributes?.() || {};
    const cls = String(attrs.class || '').toLowerCase();
    const id = String(attrs.id || '').toLowerCase();
    const isPreloaderLike = PRELOADER_KEYWORDS.some(k => cls.includes(k) || id.includes(k));
    if (isPreloaderLike) return;

    const isImageTag = tag === 'img';
    cmp.set({
      selectable: true,
      hoverable: true,
      draggable: true,
      droppable: true,
      highlightable: true,
      editable: textTags.has(tag),
      copyable: true,
      removable: true,
      stylable: true,
      layerable: true,
      badgable: true,
      resizable: isImageTag ? { ratioDefault: true } : cmp.get('resizable'),
    });
  };

  applyComponentInteractivity(wrapper);
  wrapper.find('*').forEach(applyComponentInteractivity);
}

function buildWpHtmlBlock(content) {
  return `<!-- wp:html -->\n${content}\n<!-- /wp:html -->`;
}

function buildSavePayload(editor, themeColorsRef) {
  const html = editor.getHtml();
  const css = editor.getCss();
  const { primary, secondary } = themeColorsRef.current;
  const colorVarsCss = getThemeCssVars(primary, secondary);
  const merged = `<style>\n${colorVarsCss}\n${css}\n</style>\n${html}`;
  // Keep content inside a Custom HTML block so WordPress does not auto-format
  // bootstrap/layout markup after publishing.
  return buildWpHtmlBlock(merged);
}

function enhanceModuleInteractivity(cdoc) {
  if (!cdoc || !cdoc.body) return;

  // 1) Forms: prevent dead submits and provide basic UX.
  cdoc.querySelectorAll('form').forEach((form) => {
    if (form.dataset.zttFormBound === '1') return;
    form.dataset.zttFormBound = '1';
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const required = form.querySelectorAll('input[required], textarea[required], select[required]');
      let invalid = false;
      required.forEach((el) => {
        if (!el.value || !String(el.value).trim()) invalid = true;
      });
      const msg = cdoc.createElement('div');
      msg.textContent = invalid ? 'Please fill all required fields.' : 'Demo submit captured successfully.';
      msg.style.cssText = 'margin-top:10px;padding:8px 10px;border-radius:8px;font-size:12px;background:rgba(124,58,237,.15);color:#c4b5fd;border:1px solid rgba(124,58,237,.35);';
      form.appendChild(msg);
      setTimeout(() => msg.remove(), 2000);
    });
  });

  // 2) Details-based modules (toggle/accordion/faq): keep +/- state synced.
  cdoc.querySelectorAll('details').forEach((det) => {
    if (det.dataset.zttDetailsBound === '1') return;
    det.dataset.zttDetailsBound = '1';
    const summary = det.querySelector('summary');
    if (!summary) return;

    const syncIcon = () => {
      let icon = summary.querySelector('[data-ztt-icon]');
      if (!icon) {
        const spans = summary.querySelectorAll('span');
        icon = spans.length ? spans[spans.length - 1] : null;
        if (icon) icon.setAttribute('data-ztt-icon', '1');
      }
      if (icon) icon.textContent = det.open ? '−' : '+';
    };

    det.addEventListener('toggle', syncIcon);
    syncIcon();
  });

  // 3) Tabs module (data-ztt-tab-btn / data-ztt-tab-panel).
  cdoc.querySelectorAll('[data-ztt-tab-btn]').forEach((btn) => {
    if (btn.dataset.zttTabBound === '1') return;
    btn.dataset.zttTabBound = '1';
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-ztt-tab-btn');
      if (!id) return;
      const root = btn.closest('section, div') || cdoc.body;
      root.querySelectorAll('[data-ztt-tab-btn]').forEach((b) => {
        const active = b.getAttribute('data-ztt-tab-btn') === id;
        b.style.background = active ? 'linear-gradient(135deg,#7c3aed 0%,#06b6d4 100%)' : 'transparent';
        b.style.color = active ? '#fff' : '#475569';
        b.style.boxShadow = active ? '0 10px 20px rgba(124,58,237,.3)' : 'none';
      });
      root.querySelectorAll('[data-ztt-tab-panel]').forEach((panel) => {
        panel.style.display = panel.getAttribute('data-ztt-tab-panel') === id ? 'block' : 'none';
      });
    });
  });

  // 4) Counters: animate obvious numeric stat values once.
  cdoc.querySelectorAll('div, span').forEach((el) => {
    if (el.dataset.zttCountDone === '1') return;
    const txt = (el.textContent || '').trim();
    if (!txt || txt.length > 12) return;
    const match = txt.match(/^([<>]?\d+)([KMB]?)(\+?%?|ms)?$/i);
    if (!match) return;

    const [, n, scale, suffix = ''] = match;
    const target = parseInt(n.replace(/[<>]/g, ''), 10);
    if (!Number.isFinite(target) || target < 2) return;
    el.dataset.zttCountDone = '1';

    let current = 0;
    const steps = 24;
    const step = Math.max(1, Math.floor(target / steps));
    const t = cdoc.defaultView.setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        cdoc.defaultView.clearInterval(t);
      }
      const prefix = txt.startsWith('<') ? '<' : (txt.startsWith('>') ? '>' : '');
      el.textContent = `${prefix}${current}${scale || ''}${suffix || ''}`;
    }, 35);
  });

  // 5) Portfolio filter: activate button-based filtering when block exists.
  cdoc.querySelectorAll('section').forEach((section) => {
    const buttons = section.querySelectorAll('button');
    const cards = section.querySelectorAll('div[style*="Project"][style*="uppercase"]');
    if (buttons.length < 3 || cards.length < 4) return;
    if (section.dataset.zttFilterBound === '1') return;
    section.dataset.zttFilterBound = '1';

    const categories = ['all', 'web design', 'branding', 'mobile', 'motion'];
    const cardNodes = Array.from(cards).map(node => node.closest('div[style*="border-radius:18px"]') || node.parentElement).filter(Boolean);
    cardNodes.forEach((card, i) => {
      card.dataset.zttCat = categories[(i % 4) + 1];
    });

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const label = (btn.textContent || '').trim().toLowerCase();
        const filter = label || 'all';
        buttons.forEach((b) => {
          b.style.background = b === btn ? 'rgba(129,140,248,.2)' : 'transparent';
          b.style.color = b === btn ? '#7c3aed' : '#64748b';
        });
        cardNodes.forEach((card) => {
          card.style.display = filter === 'all' || card.dataset.zttCat === filter ? 'block' : 'none';
        });
      });
    });
  });

  // 6) Countdown: decrement obvious 4-slot countdown cards.
  cdoc.querySelectorAll('section').forEach((section) => {
    if (section.dataset.zttCountdownBound === '1') return;
    const heading = (section.textContent || '').toLowerCase();
    if (!heading.includes('countdown')) return;
    const values = section.querySelectorAll('div');
    const slots = Array.from(values).filter((v) => /^\d{2}$/.test((v.textContent || '').trim())).slice(0, 4);
    if (slots.length !== 4) return;
    section.dataset.zttCountdownBound = '1';

    let total = (parseInt(slots[0].textContent, 10) * 86400)
      + (parseInt(slots[1].textContent, 10) * 3600)
      + (parseInt(slots[2].textContent, 10) * 60)
      + parseInt(slots[3].textContent, 10);
    const tick = () => {
      if (total <= 0) return;
      total -= 1;
      const d = Math.floor(total / 86400);
      const h = Math.floor((total % 86400) / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      [d, h, m, s].forEach((n, i) => { slots[i].textContent = String(n).padStart(2, '0'); });
    };
    cdoc.defaultView.setInterval(tick, 1000);
  });
}

/* ── Loading Screen ─────────────────────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100vh', width: '100%',
      background: 'var(--bg-base)',
      gap: 20,
    }}>
      {/* Animated logo mark */}
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
          animation: 'ztt-spin 1.4s linear infinite',
          opacity: .15,
          position: 'absolute', inset: 0,
        }} />
        <div style={{
          position: 'absolute', inset: 4,
          borderRadius: '50%',
          border: '3px solid transparent',
          borderTopColor: '#7c3aed',
          borderRightColor: '#06b6d4',
          animation: 'ztt-spin .9s cubic-bezier(.6,.2,.4,.8) infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 18,
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
          animation: 'ztt-pulse-glow 2s ease-in-out infinite',
        }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{
          margin: 0, fontSize: 15, fontWeight: 600,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-ui)',
          letterSpacing: '.02em',
        }}>Spinning up Visual Builder…</p>
        <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
          Loading canvas, plugins &amp; live stylesheets
        </p>
      </div>
    </div>
  );
}

/* ── Premium SVG Icons ── */
const icons = {
  undo: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" /></svg>,
  redo: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" /></svg>,
  desktop: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
  tablet: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>,
  mobile: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>,
  preview: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  fullscreen: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" /></svg>,
  clear: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>,
  save: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  logo: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  moon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
  sun: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
  zap: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
};

/* ── Top Toolbar ────────────────────────────────────────────────────────── */
function TopBar({ editorInstance, themeColorsRef }) {
  const [saved, setSaved] = useState(false);
  const [activeDevice, setActiveDevice] = useState('desktop');
  const [uiTheme, setUiTheme] = useState('dark');

  const DEVICES = [
    { id: 'desktop', label: 'Desktop', icon: icons.desktop },
    { id: 'tablet', label: 'Tablet', icon: icons.tablet },
    { id: 'mobile-portrait', label: 'Mobile', icon: icons.mobile },
  ];

  const switchDevice = (deviceId) => {
    setActiveDevice(deviceId);
    if (editorInstance) {
      editorInstance.setDevice(deviceId === 'desktop' ? 'Desktop' : deviceId === 'tablet' ? 'Tablet' : 'Mobile portrait');
    }
  };

  const toggleUiTheme = () => {
    const newTheme = uiTheme === 'dark' ? 'light' : 'dark';
    setUiTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);

    // Attempt to sync inner iframe if it has a html/body
    try {
      const iframeDoc = editorInstance?.Canvas.getDocument();
      if (iframeDoc) iframeDoc.documentElement.setAttribute('data-theme', newTheme);
    } catch (e) { }
  };

  const handleSave = () => {
    if (!editorInstance) return;
    const finalPayload = buildSavePayload(editorInstance, themeColorsRef);

    axios.post(`${window.zttData.apiUrl}${editorInstance._postId || ''}`, {
      content: finalPayload
    }, { headers: { 'X-WP-Nonce': window.zttData.nonce } })
      .then(() => { setSaved(true); setTimeout(() => setSaved(false), 2500); })
      .catch(err => { console.error(err); alert('Save failed.'); });
  };

  const handleUndo = () => editorInstance?.runCommand('core:undo');
  const handleRedo = () => editorInstance?.runCommand('core:redo');
  const handlePreview = () => editorInstance?.runCommand('preview');
  const handleFullscreen = () => editorInstance?.runCommand('fullscreen');
  const handleClearCanvas = () => {
    if (window.confirm('Clear all canvas content?')) {
      editorInstance?.setComponents('');
    }
  };

  const handleNukeLoader = () => {
    if (!editorInstance) return;
    try {
      const doc = editorInstance.Canvas.getDocument();
      if (!doc) return;
      const purged = removeLikelyPreloaders(doc);
      alert(`Removed ${purged} blocking preloader element(s).`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{
      height: 54,
      display: 'flex', alignItems: 'center',
      padding: '0 16px',
      background: 'var(--bg-panel)',
      borderBottom: '1px solid var(--border-subtle)',
      boxSizing: 'border-box',
      flexShrink: 0,
      gap: 12,
      zIndex: 300,
      position: 'relative',
    }}>
      {/* ── Logo ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 8, flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#ffffff', boxShadow: '0 0 12px rgba(124,58,237,.4)',
          animation: 'ztt-logo-pulse 3s ease-in-out infinite',
          flexShrink: 0,
        }}>{icons.logo}</div>
        <span style={{
          fontSize: 14, fontWeight: 700,
          background: 'linear-gradient(90deg,#a78bfa,#38bdf8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          fontFamily: 'var(--font-ui)', letterSpacing: '-.015em',
          whiteSpace: 'nowrap',
        }}>Visual Builder</span>
      </div>

      {/* ── Divider ── */}
      <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', flexShrink: 0 }} />

      {/* ── UI Theme Toggle ── */}
      <button onClick={toggleUiTheme} title="Toggle Light/Dark Theme" style={topBtnStyle()}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: uiTheme === 'light' ? '#f59e0b' : 'inherit' }}>
          {uiTheme === 'dark' ? icons.moon : icons.sun}
        </span>
      </button>

      {/* ── Divider ── */}
      <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', flexShrink: 0 }} />

      {/* ── History controls ── */}
      <div style={{ display: 'flex', gap: 4 }}>
        {[
          { icon: icons.undo, title: 'Undo', action: handleUndo },
          { icon: icons.redo, title: 'Redo', action: handleRedo },
        ].map(({ icon, title, action }) => (
          <button key={title} onClick={action} title={title} style={topBtnStyle()}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
          </button>
        ))}
      </div>

      {/* ── Divider ── */}
      <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', flexShrink: 0 }} />

      {/* ── Device switcher ── */}
      <div style={{
        display: 'flex', gap: 4,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-soft)',
        borderRadius: 8, padding: '3px',
      }}>
        {DEVICES.map(d => (
          <button
            key={d.id}
            onClick={() => switchDevice(d.id)}
            title={d.label}
            style={{
              ...topBtnStyle(),
              background: activeDevice === d.id ? 'rgba(124,58,237,.25)' : 'transparent',
              color: activeDevice === d.id ? 'var(--text-accent)' : 'var(--text-muted)',
              borderRadius: 6,
              padding: '6px 10px',
              border: '1px solid ' + (activeDevice === d.id ? 'rgba(124,58,237,.4)' : 'transparent'),
              boxShadow: activeDevice === d.id ? 'inset 0 1px 3px rgba(255,255,255,.05)' : 'none',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{d.icon}</span>
          </button>
        ))}
      </div>

      {/* ── Divider ── */}
      <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', flexShrink: 0 }} />

      {/* ── Preview + Fullscreen ── */}
      <div style={{ display: 'flex', gap: 4 }}>
        {[
          { icon: icons.preview, title: 'Preview', action: handlePreview },
          { icon: icons.fullscreen, title: 'Fullscreen', action: handleFullscreen },
          { icon: icons.clear, title: 'Clear Canvas', action: handleClearCanvas },
          { icon: icons.zap, title: 'Fix: Nuke Preloader', action: handleNukeLoader },
        ].map(({ icon, title, action }) => (
          <button key={title} onClick={action} title={title} style={topBtnStyle()}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
          </button>
        ))}
      </div>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── Theme Colors ── */}
      {editorInstance && (
        <ThemeColorPanel
          editor={editorInstance}
          onColorsChange={(p, s) => { themeColorsRef.current = { primary: p, secondary: s }; }}
        />
      )}

      {/* ── Save button ── */}
      <button
        onClick={handleSave}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '0 18px', height: 36,
          background: saved
            ? 'linear-gradient(135deg,#059669,#10b981)'
            : 'linear-gradient(135deg,#7c3aed,#06b6d4)',
          border: '1px solid ' + (saved ? 'rgba(16,185,129,.5)' : 'rgba(124,58,237,.5)'),
          borderRadius: 8,
          color: '#fff', fontWeight: 600, fontSize: 13.5,
          fontFamily: 'var(--font-ui)', cursor: 'pointer',
          boxShadow: saved
            ? '0 0 16px rgba(5,150,105,.4), inset 0 1px 3px rgba(255,255,255,.2)'
            : '0 0 16px rgba(124,58,237,.4), inset 0 1px 3px rgba(255,255,255,.2)',
          transition: 'all .25s ease',
          flexShrink: 0,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {saved ? icons.check : icons.save}
        </span>
        {saved ? 'Saved Successfully' : 'Publish Changes'}
      </button>
    </div>
  );
}

/* helper */
function topBtnStyle() {
  return {
    background: 'transparent',
    border: 'none',
    borderRadius: 6,
    padding: '5px 8px',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all .12s ease',
    fontFamily: 'var(--font-ui)',
    fontSize: 12,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════════════════ */
function App({ postId }) {
  const [loading, setLoading] = useState(true);
  const [editorInstance, setEditorInstance] = useState(null);
  const themeColorsRef = useRef({ primary: '#7c3aed', secondary: '#06b6d4' });
  const postIdRef = useRef(postId);

  useEffect(() => {
    const fetchTimer = setTimeout(() => {
      setLoading(false);
      console.warn('React loading screen timed out - forcing visibility.');
    }, 12000);

    const fetchContent = axios.get(`${window.zttData.apiUrl}${postId}?context=edit`, {
      headers: { 'X-WP-Nonce': window.zttData.nonce }
    });
    const fetchFrontend = axios.get(window.zttData.frontendUrl);

    Promise.all([fetchContent, fetchFrontend])
      .then(([contentRes, frontendRes]) => {
        const htmlContent = contentRes.data.content.raw;
        const parser = new DOMParser();
        const doc = parser.parseFromString(frontendRes.data, 'text/html');
        const cssLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href);
        // Add Swiper CSS and force-hide preloaders
        cssLinks.push('https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css');
        cssLinks.push('data:text/css,' + encodeURIComponent(preloaderCssRule()));
        initEditor(htmlContent, cssLinks);
      })
      .catch(error => {
        console.error('Error fetching page data', error);
        setLoading(false); // Ensure loader is hidden even on error
        alert('Failed to load page content or live stylesheets.');
      });

    return () => clearTimeout(fetchTimer);
  }, [postId]);

  const initEditor = (htmlContent, cssLinks) => {
    setLoading(false);

    setTimeout(() => {
      const editor = grapesjs.init({
        container: '#gjs',
        height: '100%',
        width: '100%',
        storageManager: false,
        assetManager: {
          upload: window.zttData?.mediaUploadUrl || '',
          uploadName: 'files',
          headers: { 'X-WP-Nonce': window.zttData?.mediaUploadNonce || '' }
        },
        modal: {
          appendTo: document.body,    // ← escape overflow:hidden stacking context
        },
        panels: {
          defaults: [
            {
              id: 'layers',
              el: '.gjs-pn-views-container',
            },
            {
              id: 'views',
              buttons: [
                {
                  id: 'open-style',
                  className: 'fa fa-paint-brush',
                  command: 'open-sm',
                  active: true,
                  attributes: { title: 'Style Manager' },
                },
                {
                  id: 'open-traits',
                  className: 'fa fa-cog',
                  command: 'open-tm',
                  attributes: { title: 'Trait Manager' },
                },
                {
                  id: 'open-layers',
                  className: 'fa fa-bars',
                  command: 'open-layers',
                  attributes: { title: 'Layer Manager' },
                },
                {
                  id: 'open-blocks',
                  className: 'fa fa-th-large',
                  command: 'open-blocks',
                  attributes: { title: 'Blocks' },
                }
              ],
            }
          ]
        },
        colorPicker: {
          appendTo: 'parent',
          offset: { top: 26, left: -166 },
          palette: [
            ['#000000', '#333333', '#555555', '#777777', '#999999', '#AAAAAA', '#CCCCCC', '#EEEEEE', '#FFFFFF'],
            ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688'],
            ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#607D8B'],
          ],
        },
        plugins: [
          webpagePreset, blocksBasic, formsPlugin, flexboxPlugin,
          customCodePlugin, tabsPlugin, tooltipPlugin, countdownPlugin,
          typedPlugin, styleBgPlugin,
        ],
        pluginsOpts: {
          [webpagePreset]: {},
          [blocksBasic]: { flexGrid: true },
          [formsPlugin]: {},
          [flexboxPlugin]: {},
          [customCodePlugin]: {},
          [tabsPlugin]: {},
          [tooltipPlugin]: {},
          [countdownPlugin]: {},
          [typedPlugin]: {},
          [styleBgPlugin]: {},
        },
        canvas: {
          styles: cssLinks,
          scripts: [
            'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js'
          ]
        },
      });

      editor.on('load', () => {
        const doc = editor.Canvas.getDocument();
        if (doc) {
          const style = doc.createElement('style');
          style.textContent = preloaderCssRule();
          doc.head.appendChild(style);
        }

        // Fetch WordPress Media Library and populate GrapesJS Asset Manager
        if (window.zttData?.mediaListUrl) {
          axios.get(`${window.zttData.mediaListUrl}?per_page=100`, {
            headers: { 'X-WP-Nonce': window.zttData.nonce }
          }).then(res => {
            if (Array.isArray(res.data)) {
              const assets = res.data.map(item => ({
                src: item.source_url,
                type: 'image',
                name: item.title?.rendered || 'Image',
                height: item.media_details?.height,
                width: item.media_details?.width,
              }));
              editor.AssetManager.add(assets);
            }
          }).catch(err => console.error('Failed to load Media Library into AssetManager', err));
        }
      });

      editor._postId = postId;

      const stripPreloaders = (html) => {
        const p = new DOMParser();
        // Wrap in a div to prevent DOMParser from moving <style> to <head>
        const d = p.parseFromString(`<div id="ztt-temp-wrap">${normalizeWpMarkup(html)}</div>`, 'text/html');
        const wrap = d.getElementById('ztt-temp-wrap');
        if (!wrap) return normalizeWpMarkup(html);

        wrap.querySelectorAll(PRELOADER_SELECTOR_STRING).forEach(el => el.remove());
        wrap.querySelectorAll('[data-aos], [data-aos-delay], [data-aos-duration], [data-aos-offset], [data-aos-anchor], [data-aos-anchor-placement], [data-aos-easing], [data-aos-once]').forEach(el => {
          [
            'data-aos',
            'data-aos-delay',
            'data-aos-duration',
            'data-aos-offset',
            'data-aos-anchor',
            'data-aos-anchor-placement',
            'data-aos-easing',
            'data-aos-once',
          ].forEach(attr => el.removeAttribute(attr));
          el.classList.remove('aos-init', 'aos-animate');
        });
        return wrap.innerHTML;
      };

      editor.setComponents(stripPreloaders(htmlContent));
      unlockImportedComponents(editor);
      setEditorInstance(editor);

      const nukePreloadersInCanvas = (cdoc) => removeLikelyPreloaders(cdoc);

      editor.on('load', () => {
        nukePreloadersInCanvas(editor.Canvas.getDocument());
        unlockImportedComponents(editor);
        enhanceModuleInteractivity(editor.Canvas.getDocument());
      });

      editor.on('load', () => {
        [300, 1200, 2500].forEach(delay => {
          setTimeout(() => {
            const cdoc = editor.Canvas.getDocument();
            nukePreloadersInCanvas(cdoc);
            enhanceModuleInteractivity(cdoc);
          }, delay);
        });

        const cdoc = editor.Canvas.getDocument();
        if (!cdoc || !cdoc.body || !cdoc.defaultView?.MutationObserver) return;

        const observer = new cdoc.defaultView.MutationObserver(() => {
          nukePreloadersInCanvas(cdoc);
          enhanceModuleInteractivity(cdoc);
        });
        observer.observe(cdoc.body, { childList: true, subtree: true });
        setTimeout(() => observer.disconnect(), 5000);
      });

      // ── Force premium dark theme on native GrapesJS managers ─────────────
      // GrapesJS dynamically applies `gjs-one-bg`, `gjs-two-bg`, etc. via JS.
      // A runtime <style> appended here is the highest-priority override.
      const managerStyle = document.createElement('style');
      managerStyle.id = 'ztt-manager-theme';
      managerStyle.textContent = `
        /* Kill gjs-one-bg background — now transparent so container gradient shows */
        .gjs-one-bg,
        .gjs-pn-panel.gjs-one-bg,
        .gjs-pn-views-container.gjs-one-bg,
        .gjs-pn-views.gjs-one-bg {
          background-color: #0d0e26 !important;
          background-image: none !important;
        }
        .gjs-two-bg   { background-color: #13131e !important; }
        .gjs-three-bg { background-color: #1a1a28 !important; }
        .gjs-four-bg  { background-color: #222235 !important; }
        .gjs-two-color { color: rgba(160,160,200,.7) !important; }

        /* Entire right sidebar wrapper */
        .gjs-pn-views-container,
        .gjs-pn-panel.gjs-pn-views-container {
          background: linear-gradient(180deg, #100825 0%, #0a1628 100%) !important;
          border-left: 1px solid rgba(124,58,237,.22) !important;
          box-shadow: -5px 0 30px rgba(0,0,0,.6) !important;
        }

        /* Tab icon bar — DO NOT override position/display (GrapesJS uses abs-pos) */
        .gjs-pn-views,
        .gjs-pn-panel.gjs-pn-views {
          background: linear-gradient(160deg, #1a0a3a 0%, #0f1f3d 100%) !important;
          border-bottom: 1px solid rgba(124,58,237,.25) !important;
          padding: 8px 6px !important;
          overflow: visible !important;
          box-shadow: 0 4px 20px rgba(0,0,0,.5) !important;
        }

        .gjs-pn-views .gjs-pn-buttons {
          position: relative !important;
          z-index: 2 !important;
        }

        /* Individual tab buttons */
        .gjs-pn-views .gjs-pn-btn {
          position: relative !important;
          z-index: 2 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: rgba(255,255,255,.06) !important;
          border: 1px solid rgba(255,255,255,.08) !important;
          border-radius: 9px !important;
          color: rgba(255,255,255,.55) !important;
          width: 36px !important;
          height: 36px !important;
          min-width: 36px !important;
          min-height: 36px !important;
          margin: 0 2px !important;
          padding: 0 !important;
          transition: all .18s ease !important;
          font-size: 15px !important;
          line-height: 1 !important;
          cursor: pointer !important;
        }
        .gjs-pn-views .gjs-pn-btn:hover {
          background: rgba(124,58,237,.22) !important;
          border-color: rgba(124,58,237,.45) !important;
          color: #c4b5fd !important;
          box-shadow: 0 0 14px rgba(124,58,237,.3) !important;
        }
        .gjs-pn-views .gjs-pn-btn.gjs-pn-active {
          background: linear-gradient(135deg, rgba(124,58,237,.55) 0%, rgba(6,182,212,.32) 100%) !important;
          border-color: rgba(124,58,237,.65) !important;
          color: #fff !important;
          box-shadow: 0 0 18px rgba(124,58,237,.45), inset 0 1px 0 rgba(255,255,255,.18) !important;
        }

        /* HARD NUKE: Hide all redundant native GrapesJS top/side panels */
        .gjs-pn-options, 
        .gjs-pn-commands, 
        .gjs-pn-devices-c,
        #gjs .gjs-pn-panel.gjs-pn-options,
        #gjs .gjs-pn-panel.gjs-pn-commands,
        #gjs .gjs-pn-panel.gjs-pn-devices-c {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `;
      document.head.appendChild(managerStyle);
      // ──────────────────────────────────────────────────────────────────────

      registerModules(editor);

      // ── FORCE REMOVAL OF REPEATED TOOLS (Native Panels) ─────────────────
      // We explicitly remove the native panels that repeat TopBar functionality.
      ['options', 'commands', 'devices-c'].forEach(p => {
        try { editor.Panels.removePanel(p); } catch (e) { }
      });
      // ────────────────────────────────────────────────────────────────────

      // (Removed redundant manual section block - using Divi sections instead)

      // ── Total UI Consolidation ──────────────────────────────────────────
      const blocks = editor.BlockManager.getAll();
      const createIcon = (d) =>
        `<div style="display:flex;align-items:center;justify-content:center;
          width:46px;height:46px;background:rgba(124,58,237,0.08);border-radius:14px;
          margin:0 auto 6px;transition:all .3s;">
          <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="1.5"
            stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px;">
            ${d}
          </svg>
        </div>`;

      const catMap = {
        'Basic': 'Divi — Layout',
        'Forms': 'Divi — Forms',
        'Extra': 'Divi — Interactive',
        'Blog': 'Divi — Blog / Post'
      };

      blocks.forEach(block => {
        const id = block.get('id') || '';
        const catObj = block.get('category');
        const catName = typeof catObj === 'string' ? catObj : (catObj?.id || '');
        const media = block.get('media') || '';

        // 1. Unify Category Names
        if (catMap[catName]) {
          block.set('category', catMap[catName]);
        }

        // 2. Universal Icon Plate Enforcement
        // If the icon doesn't have our signature background plate, wrap it or replace it.
        if (!media.includes('background:rgba(124,58,237,0.08)') && !media.includes('background: rgba(124, 58, 237, 0.08)')) {
          let path = '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>';

          if (id.includes('text') || id.includes('quote')) {
            path = '<path d="M4 7h16M4 12h16M4 17h10"/>';
          } else if (id.includes('image') || id.includes('video') || id.includes('gallery')) {
            path = '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>';
          } else if (id.includes('checkbox')) {
            path = '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>';
          } else if (id.includes('radio')) {
            path = '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>';
          } else if (id.includes('select') || id.includes('dropdown')) {
            path = '<polyline points="6 9 12 15 18 9"/>';
          } else if (id.includes('textarea')) {
            path = '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>';
          } else if (id.includes('input') || id.includes('form') || id.includes('button')) {
            path = '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>';
          } else if (id.includes('column1')) {
            path = '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>';
          } else if (id.includes('column2')) {
            path = '<rect x="3" y="3" width="8" height="18" rx="1" ry="1"/><rect x="13" y="3" width="8" height="18" rx="1" ry="1"/>';
          } else if (id.includes('column3')) {
            path = '<rect x="2" y="3" width="5" height="18" rx="1" ry="1"/><rect x="9" y="3" width="6" height="18" rx="1" ry="1"/><rect x="17" y="3" width="5" height="18" rx="1" ry="1"/>';
          } else if (id.includes('section') || id.includes('grid') || id.includes('cell')) {
            path = '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>';
          } else if (id.includes('link')) {
            path = '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>';
          } else if (id.includes('map')) {
            path = '<polygon points="1 6 8 3 16 6 23 3 23 18 16 21 8 18 1 21"/><line x1="8" y1="3" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="21"/>';
          } else if (id.includes('list') || id.includes('nav') || id.includes('menu')) {
            path = '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>';
          } else if (id.includes('code')) {
            path = '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>';
          } else if (id.includes('tabs')) {
            path = '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="11" x2="22" y2="11"/><line x1="7" y1="7" x2="7" y2="11"/>';
          }

          block.set('attributes', { ...block.get('attributes'), class: '' });
          block.set('media', createIcon(path));
        }
      });

      // Save command (also wired to TopBar)
      editor.Commands.add('save-wp', {
        run(editor, sender) {
          sender && sender.set('active', 0);
          const finalPayload = buildSavePayload(editor, themeColorsRef);

          axios.post(`${window.zttData.apiUrl}${postId}`, { content: finalPayload }, {
            headers: { 'X-WP-Nonce': window.zttData.nonce }
          })
            .then(() => alert('Saved to WordPress successfully!'))
            .catch(err => { console.error(err); alert('Failed to save.'); });
        },
      });

      // Native save panel button (hidden — TopBar handles save)
      editor.Panels.addButton('options', {
        id: 'save-wp',
        className: 'fa fa-save',
        command: 'save-wp',
        attributes: { title: 'Save to WordPress' },
      });

      // Background image command
      editor.Commands.add('change-bg-image', {
        run(editor) {
          const selected = editor.getSelected();
          if (!selected) return;
          editor.runCommand('open-assets', {
            target: selected, types: ['image'], accept: 'image/*',
            onSelect(asset) {
              const src = asset.src || asset.get('src');
              selected.addStyle({ 'background-image': `url("${src}")`, 'background-size': 'cover', 'background-position': 'center' });
              editor.AssetManager.close();
            },
          });
        },
      });

      // Replace selected <img> source from asset manager
      editor.Commands.add('change-image-src', {
        run(editor) {
          const selected = editor.getSelected();
          if (!selected) return;
          const attrs = selected.getAttributes?.() || {};
          const tagName = (selected.get('tagName') || '').toLowerCase();
          const isImageLike = selected.is('image') || tagName === 'img' || !!attrs.src;
          if (!isImageLike) return;

          editor.runCommand('open-assets', {
            types: ['image'],
            accept: 'image/*',
            onSelect(asset) {
              const src = asset?.get ? asset.get('src') : asset?.src;
              if (!src) return;
              // Setting src this way allows GrapesJS to re-render the image model
              if (selected.is('image')) {
                selected.set('src', src);
              } else {
                selected.addAttributes({ src });
              }
              editor.AssetManager.close();
            },
          });
        },
      });

      editor.on('component:selected', (model) => {
        const attrs = model.getAttributes?.() || {};
        const tagName = (model.get('tagName') || '').toLowerCase();
        const isImageLike = model.is('image') || tagName === 'img' || !!attrs.src;
        if (model.is('textnode')) return;

        if (isImageLike) {
          const tb = model.get('toolbar') || [];
          if (!tb.some(t => t.command === 'change-image-src')) {
            tb.unshift({
              attributes: { class: 'fa fa-image', title: 'Replace Image' },
              command: 'change-image-src'
            });
            model.set('toolbar', tb);
          }
          return;
        }

        const tb = model.get('toolbar') || [];
        if (!tb.some(t => t.command === 'change-bg-image')) {
          tb.unshift({ attributes: { class: 'fa fa-picture-o', title: 'Change Background Image' }, command: 'change-bg-image' });
          model.set('toolbar', tb);
        }
      });

      // Fast path UX: double-click an image to replace it.
      editor.on('component:dblclick', (model) => {
        const attrs = model.getAttributes?.() || {};
        const tagName = (model.get('tagName') || '').toLowerCase();
        const isImageLike = model.is('image') || tagName === 'img' || !!attrs.src;
        if (!isImageLike) return;
        editor.select(model);
        editor.runCommand('change-image-src');
      });

      // Guarantee all newly dropped blocks/modules are editable in the same way
      // as imported content (prevents modules from feeling "locked" inconsistently).
      editor.on('component:add', () => {
        unlockImportedComponents(editor);
      });

    }, 100);
  };

  if (loading) return <LoadingScreen />;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 32px)', width: '100%', overflow: 'hidden',
      background: 'var(--bg-base)',
      animation: 'ztt-scale-in .25s ease both',
    }}>
      {/* ── Top Toolbar ── */}
      <TopBar editorInstance={editorInstance} themeColorsRef={themeColorsRef} />

      {/* ── Main content row ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Canvas */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <div id="gjs" style={{ height: '100%', width: '100%' }} />
        </div>

      </div>
    </div>
  );
}

export default App;
