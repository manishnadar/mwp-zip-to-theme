import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AIChat.css';

const QUICK_PROMPTS = [
  '✨ Modernise the hero section',
  '🎨 Make the header dark & sleek',
  '📐 Add a 3-column feature grid',
  '🚀 Improve CTA button styling',
  '🌙 Apply dark color theme',
];

const AIChat = ({ editor }) => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('ztt_claude_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const messagesEndRef = useRef(null);

  useEffect(() => { localStorage.setItem('ztt_claude_key', apiKey); }, [apiKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getAvailableSections = () => {
    const sections = [];
    const wrapper = editor.getWrapper();
    if (!wrapper) return [];
    wrapper.find('header, footer, section, div[class*="section"], div[id*="section"]').forEach(comp => {
      sections.push({
        id: comp.getId(),
        type: comp.get('tagName') || 'div',
        classes: comp.getAttributes().class || '',
        preview: comp.toHTML().substring(0, 100).replace(/<[^>]*>/g, '').substring(0, 50).trim(),
      });
    });
    return sections;
  };

  const applyChanges = (markup, targetId, msgIndex) => {
    if (targetId) {
      const cmp = editor.Components.getById(targetId);
      if (cmp) cmp.replaceWith(markup);
      else editor.setComponents(markup);
    } else {
      const selected = editor.getSelected();
      if (selected) selected.replaceWith(markup);
      else editor.setComponents(markup);
    }
    setAppliedIds(prev => new Set([...prev, msgIndex]));
    setMessages(prev => [...prev, {
      role: 'ai', content: `✅ Applied to ${targetId ? 'targeted section' : 'selection'}!`, isSuccess: true,
    }]);
  };

  const handleSend = async () => {
    if (!inputVal.trim()) return;
    if (!apiKey) { alert('Please enter your Claude API Key first!'); return; }

    const userMsg = inputVal;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInputVal('');
    setIsTyping(true);

    try {
      const selected = editor.getSelected();
      const selectionId = selected ? selected.getId() : null;
      const contextHtml = selected ? selected.toHTML() : 'No specific element selected.';
      const currentCss = editor.getCss() || '';
      const availableSections = getAvailableSections();
      const siteMapStr = JSON.stringify(availableSections.slice(0, 20), null, 2);

      const systemPrompt = `You are a Senior Web Architect & WordPress Design Specialist (25+ Years Experience).
      
CRITICAL: You MUST wrap your HTML code in <markup> tags and your explanation in <explanation> tags.

STRICT FORMAT:
<explanation>Brief explanation here.</explanation>
<target_id>gjs-id-123</target_id>
<markup>
<header class="...">
  ...
</header>
</markup>

DO NOT include any thinking text outside these tags.
      
DESIGN RULES:
- Use luxurious typography and high-end white space.
- Follow the provided CSS variables.
- Maintain mobile-first responsiveness.
- Proactively add professional "designer tweaks" (shadows, rounded corners, etc.).

SITE MAP:
${siteMapStr}

TARGET CONTEXT:
CSS: ${currentCss.substring(0, 2000)}
SELECTED HTML: ${contextHtml}
TARGET ID: ${selectionId || 'null'}`;

      const response = await axios.post(window.zttData.proxyUrl, {
        api_key: apiKey,
        prompt: userMsg,
        system: systemPrompt,
      }, { headers: { 'X-WP-Nonce': window.zttData.nonce } });

      if (response.data?.content?.[0]?.text) {
        let rawAiMsg = response.data.content[0].text.trim();

        const expMatch   = rawAiMsg.match(/<explanation>([\s\S]*?)<\/explanation>/i) ||
                           rawAiMsg.match(/<reasoning>([\s\S]*?)<\/reasoning>/i);
        const targetMatch = rawAiMsg.match(/<target_id>([\s\S]*?)<\/target_id>/i) ||
                            rawAiMsg.match(/<target>([\s\S]*?)<\/target>/i);
        const codeMatch  = rawAiMsg.match(/<markup>([\s\S]*?)<\/markup>/i) ||
                           rawAiMsg.match(/<code>([\s\S]*?)<\/code>/i);

        let explanation = expMatch   ? expMatch[1].trim()   : '';
        let targetId    = targetMatch ? targetMatch[1].trim() : selectionId;
        let markup      = codeMatch  ? codeMatch[1].trim()  : null;

        if (!markup) {
          const mdMatch = rawAiMsg.match(/```(?:html)?\s*([\s\S]*?)\s*```/i);
          if (mdMatch) markup = mdMatch[1].trim();
        }
        if (!markup && rawAiMsg.includes('<') && rawAiMsg.includes('>')) {
          let cleanMsg = rawAiMsg
            .replace(/<explanation>[\s\S]*?<\/explanation>/gi, '')
            .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')
            .replace(/<target_id>[\s\S]*?<\/target_id>/gi, '')
            .replace(/<target>[\s\S]*?<\/target>/gi, '');
          const firstTag = cleanMsg.indexOf('<');
          const lastTag  = cleanMsg.lastIndexOf('>');
          if (lastTag > firstTag) {
            const potential = cleanMsg.substring(firstTag, lastTag + 1);
            if (potential.includes('</') || potential.split('<').length > 4) markup = potential;
          }
        }

        if (markup) {
          markup = markup.replace(/^```html\s*/i, '').replace(/```$/i, '').trim()
            .replace(/<explanation>[\s\S]*?<\/explanation>/gi, '')
            .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')
            .replace(/<target_id>[\s\S]*?<\/target_id>/gi, '')
            .replace(/<target>[\s\S]*?<\/target>/gi, '').trim();

          if (!explanation) {
            const cleanRaw = rawAiMsg.replace(markup, '');
            explanation = cleanRaw.replace(/<[^>]*>/g, '').trim() || 'Design proposal generated.';
          }
        } else {
          explanation = rawAiMsg.replace(/<[^>]*>/g, '').trim();
        }

        setMessages(prev => [...prev, { role: 'ai', content: explanation, markup, targetId }]);
      } else if (response.data?.error) {
        setMessages(prev => [...prev, { role: 'ai', content: `API Error: ${response.data.error.message}` }]);
      }
    } catch (e) {
      console.error(e);
      let errorMsg = 'Chat request failed.';
      if (e.response) errorMsg = `API Error [${e.response.status}]: ${e.response.data?.message || e.response.statusText}`;
      else if (e.request) errorMsg = 'Network Error: No response received.';
      setMessages(prev => [...prev, { role: 'ai', content: errorMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="aic-root">
      {/* Header */}
      <div className="aic-header">
        <div className="aic-header__top">
          <div className="aic-avatar">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10C22 6.48 17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/></svg>
          </div>
          <div>
            <p className="aic-header__title">Design Specialist</p>
            <p className="aic-header__sub">AI-Powered · 25+ Years Expertise</p>
          </div>
          <div className="aic-status">
            <div className="aic-status__dot" />
            Online
          </div>
        </div>
        <div className="aic-key-row">
          <input
            className="aic-key-input"
            type={showKey ? 'text' : 'password'}
            placeholder="Anthropic API Key (sk-ant-...)"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />
          <button className="aic-key-toggle" onClick={() => setShowKey(s => !s)} title={showKey ? 'Hide' : 'Show'}>
            <svg viewBox="0 0 24 24">{showKey
              ? <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8a3 3 0 100 6 3 3 0 000-6z"/>
              : <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
            }</svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="aic-messages">
        {messages.length === 0 && (
          <div className="aic-empty">
            <div className="aic-empty__icon">
              <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
            </div>
            <p className="aic-empty__title">Premium Visual Lab</p>
            <p className="aic-empty__sub">Describe any design change. I'll generate world-class HTML instantly.</p>
            <div className="aic-chips">
              {QUICK_PROMPTS.map(p => (
                <button key={p} className="aic-chip" onClick={() => setInputVal(p)}>{p}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`aic-msg aic-msg--${msg.role}${msg.isSuccess ? ' aic-msg--success' : ''}`}>
            <div className="aic-msg__bubble">
              {!msg.markup && msg.content}
              {msg.markup && (
                <div>
                  <div style={{ marginBottom: 6, fontSize: 12.5, lineHeight: 1.6 }}>{msg.content}</div>
                  <pre className="aic-code-preview">{msg.markup}</pre>
                  <div className="aic-apply-row">
                    <button
                      className={`aic-apply-btn${appliedIds.has(i) ? ' aic-apply-btn--done' : ''}`}
                      onClick={() => !appliedIds.has(i) && applyChanges(msg.markup, msg.targetId, i)}
                    >
                      {appliedIds.has(i) ? (
                        <>
                          <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                          Applied!
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                          Apply to {msg.targetId ? 'Section' : 'Selection'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="aic-msg__meta">{msg.role === 'user' ? 'You' : 'AI Specialist'}</div>
          </div>
        ))}

        {isTyping && (
          <div className="aic-typing">
            <div className="aic-dots">
              <span/><span/><span/>
            </div>
            <span className="aic-typing__label">Claude is designing…</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div className="aic-footer">
        <div className="aic-input-wrap">
          <textarea
            className="aic-textarea"
            placeholder="E.g. Make the hero section more premium with a dark gradient..."
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
          />
        </div>
        <div className="aic-footer-actions">
          <span className="aic-hint">↵ Enter to send · Shift+↵ newline</span>
          <button className="aic-send-btn" onClick={handleSend} disabled={isTyping}>
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            {isTyping ? 'Thinking…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
