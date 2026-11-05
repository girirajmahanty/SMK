import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { LangProvider } from './i18n.jsx';
import { AuthProvider } from './auth.jsx';
import './styles.css';

// Photos fade in once loaded (styles.css hides lazy images until they carry data-loaded; an attribute, not a class,
// because React rewrites className on re-render). Load and error events don't bubble, so one capturing listener on
// the document sees every image, including ones React adds later; a broken image is marked too, so nothing stays hidden.
const markLoaded = (event) => {
  if (event.target instanceof HTMLImageElement) event.target.dataset.loaded = '';
};
document.addEventListener('load', markLoaded, true);
document.addEventListener('error', markLoaded, true);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  </React.StrictMode>
);
