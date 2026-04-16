import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'grapesjs/dist/css/grapes.min.css'

function isDomainAllowed() {
  const allowedDomains = (window.zttData && window.zttData.allowedDomains) || [];
  const currentUrl = window.location.href;
  return allowedDomains.some(
    (domain) => currentUrl.startsWith(domain.replace(/\/$/, ''))
  );
}

const rootElement = document.getElementById('ztt-react-root');
if (rootElement && isDomainAllowed()) {
  const postId = rootElement.getAttribute('data-post-id');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App postId={postId} />
    </React.StrictMode>,
  )
}
