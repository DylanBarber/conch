import './styles/main.css';
import { App } from './components/app';

document.addEventListener('DOMContentLoaded', async () => {
  const appContainer = document.getElementById('app');

  if (!appContainer) {
    console.error('App container not found');
    return;
  }

  try {
    const app = new App(appContainer);
    await app.initialize();
    console.log('Conch Voice initialized');
  } catch (error) {
    console.error('Failed to initialize:', error);
    appContainer.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #e6edf3;
        text-align: center;
        padding: 2rem;
        background: #0a0a0f;
      ">
        <h2 style="color: #ff4757; margin-bottom: 1rem;">Initialization Failed</h2>
        <p style="color: #7d8590; margin-bottom: 1rem;">
          ${error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <button onclick="location.reload()" style="
          background: #00d4aa;
          color: #0a0a0f;
          border: none;
          padding: 8px 24px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        ">Retry</button>
      </div>
    `;
  }
});
