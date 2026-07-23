import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MeshProvider } from '@meshsdk/react';
import '@meshsdk/react/styles.css';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MeshProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MeshProvider>
  </React.StrictMode>
);