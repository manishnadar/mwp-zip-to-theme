import { useState, useCallback, useRef, useEffect } from 'react';

const STYLE_ID = 'ztt-theme-vars';
const DEFAULT_PRIMARY   = '#7c3aed';
const DEFAULT_SECONDARY = '#06b6d4';

const PRESETS = [
  { name: 'Violet',  primary: '#7c3aed', secondary: '#06b6d4' },
  { name: 'Indigo',  primary: '#6366f1', secondary: '#8b5cf6' },
  { name: 'Blue',    primary: '#2563eb', secondary: '#06b6d4' },
  { name: 'Rose',    primary: '#e11d48', secondary: '#f59e0b' },
  { name: 'Teal',    primary: '#0d9488', secondary: '#059669' },
  { name: 'Orange',  primary: '#ea580c', secondary: '#f59e0b' },
  { name: 'Dark',    primary: '#1e293b', secondary: '#475569' },
  { name: 'Pink',    primary: '#db2777', secondary: '#9333ea' },
];

function buildCss(primary, secondary) {
  return `
:root {
  --ztt-primary:        ${primary};
  --ztt-secondary:      ${secondary};
  --ztt-primary-light:  ${primary}28;
  --ztt-secondary-light:${secondary}28;
  --ztt-gradient:       linear-gradient(135deg, ${primary} 0%, ${secondary} 100%);
  --ztt-gradient-soft:  linear-gradient(135deg, ${primary}18 0%, ${secondary}10 100%);
  --ztt-primary-shadow: 0 8px 28px -6px ${primary}55;
}
[style*="var(--ztt-primary)"]   { color: ${primary} !important; }
[style*="background:var(--ztt"] { background: var(--ztt-primary, ${primary}); }
`;
}

export const getThemeCssVars = (primary = DEFAULT_PRIMARY, secondary = DEFAULT_SECONDARY) =>
  buildCss(primary, secondary);

export default function ThemeColorPanel({ editor, onColorsChange }) {
  const [open, setOpen] = useState(false);
  const [primary,   setPrimary]   = useState(DEFAULT_PRIMARY);
  const [secondary, setSecondary] = useState(DEFAULT_SECONDARY);
  const panelRef  = useRef(null);
  const primaryRef   = useRef(DEFAULT_PRIMARY);
  const secondaryRef = useRef(DEFAULT_SECONDARY);

  const injectVars = useCallback((p, s) => {
    if (!editor) return;
    try {
      const canvasDoc = editor.Canvas.getDocument();
      if (!canvasDoc?.head) return;
      let el = canvasDoc.getElementById(STYLE_ID);
      if (!el) {
        el = canvasDoc.createElement('style');
        el.id = STYLE_ID;
        canvasDoc.head.appendChild(el);
      }
      el.textContent = buildCss(p, s);
      const body = canvasDoc.body;
      if (body) body.style.setProperty('--_ztt-refresh', String(Date.now()));
    } catch (_) {}
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const onLoad = () => injectVars(primaryRef.current, secondaryRef.current);
    editor.on('canvas:frame:load', onLoad);
    editor.on('load', onLoad);
    injectVars(primaryRef.current, secondaryRef.current);
    return () => {
      editor.off('canvas:frame:load', onLoad);
      editor.off('load', onLoad);
    };
  }, [editor, injectVars]);

  const applyPrimary = (v) => {
    setPrimary(v); primaryRef.current = v;
    injectVars(v, secondaryRef.current);
    onColorsChange?.(v, secondaryRef.current);
  };
  const applySecondary = (v) => {
    setSecondary(v); secondaryRef.current = v;
    injectVars(primaryRef.current, v);
    onColorsChange?.(primaryRef.current, v);
  };
  const applyPreset = ({ primary: p, secondary: s }) => {
    setPrimary(p); primaryRef.current = p;
    setSecondary(s); secondaryRef.current = s;
    injectVars(p, s);
    onColorsChange?.(p, s);
  };
  const resetColors = () => applyPreset(PRESETS[0]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const isValidHex = (v) => /^#[0-9a-fA-F]{6}$/.test(v);

  /* ── Shared input styles ── */
  const inputStyle = {
    flex: 1, height: 38, padding: '0 10px',
    background: 'var(--bg-card, #1c1c26)',
    border: '1px solid var(--border-soft, rgba(255,255,255,.10))',
    borderRadius: 8,
    fontSize: 13, fontFamily: 'var(--font-mono, monospace)',
    color: 'var(--text-primary, #f0f0f8)',
    outline: 'none', transition: 'border-color .15s',
  };

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Theme Colors"
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px',
          background: open ? 'rgba(124,58,237,.2)' : 'rgba(255,255,255,.06)',
          border: `1px solid ${open ? 'rgba(124,58,237,.5)' : 'rgba(255,255,255,.1)'}`,
          borderRadius: 8, cursor: 'pointer',
          fontSize: 12.5, fontWeight: 600,
          color: open ? '#a78bfa' : 'var(--text-secondary, #9898b3)',
          fontFamily: 'var(--font-ui, Inter, sans-serif)',
          transition: 'all .18s ease',
          boxShadow: open ? '0 0 0 2px rgba(124,58,237,.2)' : 'none',
        }}
      >
        {/* Stacked swatches */}
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <span style={{
            width: 15, height: 15, borderRadius: '50%',
            background: primary, display: 'block',
            boxShadow: `0 0 0 2px rgba(255,255,255,.08), 0 0 6px ${primary}66`,
          }} />
          <span style={{
            width: 15, height: 15, borderRadius: '50%',
            background: secondary, display: 'block', marginLeft: -5,
            boxShadow: '0 0 0 2px rgba(255,255,255,.08)',
          }} />
        </span>
        Theme Colors
        <span style={{
          fontSize: 8, marginLeft: 1,
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform .2s', display: 'inline-block',
          color: 'var(--text-muted)',
        }}>▼</span>
      </button>

      {/* ── Floating Panel ── */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
          width: 310,
          background: 'var(--bg-panel, #13131a)',
          border: '1px solid var(--border-soft, rgba(255,255,255,.10))',
          borderRadius: 16,
          boxShadow: '0 24px 64px -12px rgba(0,0,0,.7), 0 4px 16px rgba(0,0,0,.4), 0 0 0 1px rgba(124,58,237,.15)',
          zIndex: 9999,
          overflow: 'hidden',
          animation: 'ztt-drop-down .15s ease both',
        }}>

          {/* Header */}
          <div style={{
            padding: '14px 18px 12px',
            borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,.06))',
            background: 'linear-gradient(135deg,rgba(124,58,237,.12),rgba(6,182,212,.06))',
          }}>
            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}>
              🎨 Theme Colors
            </p>
            <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
              Live preview across all canvas modules
            </p>
          </div>

          <div style={{ padding: '16px 18px' }}>
            {/* Color pickers */}
            {[
              { label: 'Primary',   value: primary,   apply: applyPrimary,   hint: 'Buttons, badges, links' },
              { label: 'Secondary', value: secondary, apply: applySecondary, hint: 'Gradients, hover states' },
            ].map(({ label, value, apply, hint }) => (
              <div key={label} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>
                    {label} Color
                  </span>
                  <code style={{
                    fontSize: 11, color: '#a78bfa',
                    background: 'rgba(124,58,237,.12)',
                    padding: '2px 8px', borderRadius: 6, fontFamily: 'var(--font-mono)',
                    border: '1px solid rgba(124,58,237,.2)',
                  }}>{value}</code>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {/* Color swatch */}
                  <label style={{
                    width: 46, height: 38, borderRadius: 9,
                    background: value,
                    boxShadow: `0 4px 12px ${value}55, inset 0 1px 2px rgba(255,255,255,.15)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
                    border: '1px solid rgba(255,255,255,.12)',
                    position: 'relative',
                  }}>
                    <input
                      type="color"
                      value={value}
                      onChange={e => apply(e.target.value)}
                      style={{ position: 'absolute', inset: -8, width: 'calc(100%+16px)', height: 'calc(100%+16px)', opacity: 0, cursor: 'pointer' }}
                    />
                  </label>
                  {/* Hex input */}
                  <input
                    type="text"
                    value={value}
                    maxLength={7}
                    onChange={e => {
                      const v = e.target.value;
                      if (/^#[0-9a-fA-F]{0,6}$/.test(v)) {
                        if (isValidHex(v)) apply(v);
                        else label.includes('Primary') ? setPrimary(v) : setSecondary(v);
                      }
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,.6)'; e.target.style.boxShadow = '0 0 0 2px rgba(124,58,237,.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,.10)'; e.target.style.boxShadow = 'none'; if (!isValidHex(e.target.value)) apply(value); }}
                    style={inputStyle}
                  />
                </div>
                <p style={{ margin: '5px 0 0 54px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>{hint}</p>
              </div>
            ))}

            {/* Gradient preview */}
            <div style={{
              height: 40, borderRadius: 10, marginBottom: 18,
              background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
              boxShadow: `0 6px 20px -4px ${primary}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff',
              fontFamily: 'var(--font-ui)', letterSpacing: '.04em',
              position: 'relative', overflow: 'hidden',
            }}>
              <span style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,.1) 50%,transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'ztt-shimmer 2s linear infinite',
              }} />
              Gradient Preview ✦
            </div>

            {/* Presets */}
            <div>
              <p style={{
                fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                fontFamily: 'var(--font-ui)', margin: '0 0 10px',
                textTransform: 'uppercase', letterSpacing: '.12em',
              }}>Presets</p>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    title={preset.name}
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})`,
                      border: primary === preset.primary
                        ? '2.5px solid rgba(255,255,255,.8)'
                        : '1.5px solid rgba(255,255,255,.1)',
                      cursor: 'pointer', outline: 'none',
                      boxShadow: primary === preset.primary
                        ? `0 0 12px ${preset.primary}66`
                        : '0 2px 8px rgba(0,0,0,.3)',
                      transition: 'all .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.18)'; e.currentTarget.style.boxShadow = `0 4px 14px ${preset.primary}88`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = primary === preset.primary ? `0 0 12px ${preset.primary}66` : '0 2px 8px rgba(0,0,0,.3)'; }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '11px 18px',
            borderTop: '1px solid var(--border-subtle, rgba(255,255,255,.06))',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(0,0,0,.2)',
          }}>
            <button onClick={resetColors} style={{
              fontSize: 12, color: 'var(--text-muted)', background: 'none',
              border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)',
              padding: 0, transition: 'color .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              ↺ Reset
            </button>
            <button onClick={() => setOpen(false)} style={{
              fontSize: 12.5, fontWeight: 600, color: '#fff',
              background: `linear-gradient(135deg, ${primary}, ${secondary})`,
              border: 'none', borderRadius: 8,
              padding: '7px 16px', cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
              boxShadow: `0 4px 12px ${primary}44`,
              transition: 'all .15s',
            }}>
              Done ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
