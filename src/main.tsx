/**
 * نقطة الدخول الرئيسية للتطبيق
 * Main Entry Point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// إنشاء الجذر وتصيير التطبيق
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
