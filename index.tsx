
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// REMOVIDO: import './index.css'; (O arquivo não existe, usamos CDN no HTML)

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Previne o erro "Warning: You are calling ReactDOMClient.createRoot() on a container that has already been passed to createRoot() before."
const globalRef = window as any;

try {
    if (!globalRef.reactRoot) {
        globalRef.reactRoot = ReactDOM.createRoot(rootElement);
    }

    globalRef.reactRoot.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
} catch (error) {
    console.error("Erro fatal ao renderizar aplicação:", error);
    // Fallback visual para o usuário em caso de erro crítico no Safari
    rootElement.innerHTML = '<div style="padding:20px;text-align:center;color:#333;font-family:sans-serif;margin-top:50px;"><h3>Ocorreu um erro ao carregar o aplicativo.</h3><p>Estamos atualizando o sistema. Por favor, tente recarregar a página.</p></div>';
}
