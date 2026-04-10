import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'grapesjs/dist/css/grapes.min.css'

const rootElement = document.getElementById('ztt-react-root');
if (rootElement) {
  const postId = rootElement.getAttribute('data-post-id');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App postId={postId} />
    </React.StrictMode>,
  )
}
