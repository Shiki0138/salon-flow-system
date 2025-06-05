import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { getAnalytics } from 'firebase/analytics'
import app from './config/firebase'

// Firebase Analytics を初期化
const analytics = getAnalytics(app);
console.log('Firebase Analytics initialized:', analytics.app.name);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
) 