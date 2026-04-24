import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'grapesjs/dist/css/grapes.min.css'

function isDomainAllowed() {
  const allowedDomains = ['http://localhost'];
  console.log(allowedDomains);
  const currentUrl = window.location.href;
  return allowedDomains.some((domain) => {
    const clean = domain.replace(/\/$/, '');
    return currentUrl === clean || currentUrl.startsWith(clean + '/');
  });
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
