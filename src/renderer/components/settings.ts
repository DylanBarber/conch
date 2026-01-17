import { AppSettings, TurnServer } from '../../shared/types';
import { AudioDevice } from '../webrtc/audio-processor';

// Icons
const ICONS = {
  close: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>`,
};

export interface SettingsComponentCallbacks {
  onSettingsChange: (settings: AppSettings) => void;
  onClose: () => void;
}

export class SettingsComponent {
  private container: HTMLElement;
  private settings: AppSettings;
  private callbacks: SettingsComponentCallbacks;
  private audioDevices: AudioDevice[] = [];

  constructor(
    container: HTMLElement,
    settings: AppSettings,
    audioDevices: AudioDevice[],
    callbacks: SettingsComponentCallbacks
  ) {
    this.container = container;
    this.settings = JSON.parse(JSON.stringify(settings));
    this.audioDevices = audioDevices;
    this.callbacks = callbacks;
  }

  public render(): void {
    this.container.innerHTML = `
      <div class="modal-overlay active" id="settings-overlay">
        <div class="modal">
          <div class="modal-header">
            <h2>Settings</h2>
            <button class="modal-close" id="settings-close">
              ${ICONS.close}
            </button>
          </div>
          
          <div class="modal-body">
            <div class="settings-section">
              <h3>Server Configuration</h3>
              <div class="settings-group">
                <div class="form-group">
                  <label class="form-label">SIGNALING SERVER URL</label>
                  <input type="text" class="form-input" id="signaling-url" 
                    value="${this.settings.server.signalingUrl}" 
                    placeholder="ws://localhost:5000">
                </div>
                
                <div class="form-group">
                  <label class="form-label">TURN/STUN SERVERS</label>
                  <div class="turn-server-list" id="turn-server-list">
                    ${this.settings.server.turnServers.map((server, index) => `
                      <div class="turn-server-item" data-index="${index}">
                        <span class="url">${server.urls}</span>
                        <button class="remove-btn" data-index="${index}">
                          ${ICONS.trash}
                        </button>
                      </div>
                    `).join('')}
                  </div>
                  <div class="add-turn-server">
                    <input type="text" class="form-input" id="new-turn-url" 
                      placeholder="stun:stun.example.com:3478">
                    <button class="btn btn-secondary" id="add-turn-server">
                      ${ICONS.plus}
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">TURN USERNAME</label>
                  <input type="text" class="form-input" id="turn-username" 
                    placeholder="Optional"
                    value="${this.settings.server.turnServers[0]?.username || ''}">
                </div>
                
                <div class="form-group">
                  <label class="form-label">TURN CREDENTIAL</label>
                  <input type="password" class="form-input" id="turn-credential" 
                    placeholder="Optional"
                    value="${this.settings.server.turnServers[0]?.credential || ''}">
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn btn-secondary" id="settings-cancel">Cancel</button>
            <button class="btn btn-primary" id="settings-save">Save Changes</button>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    document.getElementById('settings-close')?.addEventListener('click', () => this.close());
    document.getElementById('settings-cancel')?.addEventListener('click', () => this.close());
    document.getElementById('settings-save')?.addEventListener('click', () => this.save());

    document.getElementById('settings-overlay')?.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).id === 'settings-overlay') this.close();
    });

    document.getElementById('signaling-url')?.addEventListener('input', (e) => {
      this.settings.server.signalingUrl = (e.target as HTMLInputElement).value;
    });

    document.getElementById('add-turn-server')?.addEventListener('click', () => {
      const input = document.getElementById('new-turn-url') as HTMLInputElement;
      if (input?.value.trim()) {
        this.addTurnServer(input.value.trim());
        input.value = '';
      }
    });

    document.querySelectorAll('.turn-server-item .remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt((e.currentTarget as HTMLElement).getAttribute('data-index') || '0');
        this.removeTurnServer(index);
      });
    });

    document.getElementById('turn-username')?.addEventListener('input', (e) => {
      const username = (e.target as HTMLInputElement).value;
      this.settings.server.turnServers.forEach(server => {
        server.username = username || undefined;
      });
    });

    document.getElementById('turn-credential')?.addEventListener('input', (e) => {
      const credential = (e.target as HTMLInputElement).value;
      this.settings.server.turnServers.forEach(server => {
        server.credential = credential || undefined;
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  private addTurnServer(url: string): void {
    const newServer: TurnServer = { urls: url };
    if (this.settings.server.turnServers.length > 0) {
      const existing = this.settings.server.turnServers[0];
      if (existing.username) newServer.username = existing.username;
      if (existing.credential) newServer.credential = existing.credential;
    }
    this.settings.server.turnServers.push(newServer);
    this.updateTurnServerList();
  }

  private removeTurnServer(index: number): void {
    this.settings.server.turnServers.splice(index, 1);
    this.updateTurnServerList();
  }

  private updateTurnServerList(): void {
    const list = document.getElementById('turn-server-list');
    if (list) {
      list.innerHTML = this.settings.server.turnServers.map((server, index) => `
        <div class="turn-server-item" data-index="${index}">
          <span class="url">${server.urls}</span>
          <button class="remove-btn" data-index="${index}">${ICONS.trash}</button>
        </div>
      `).join('');

      list.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-index') || '0');
          this.removeTurnServer(idx);
        });
      });
    }
  }

  private save(): void {
    this.callbacks.onSettingsChange(this.settings);
    this.close();
  }

  private close(): void {
    const overlay = document.getElementById('settings-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => this.callbacks.onClose(), 200);
    }
  }

  public destroy(): void {
    this.container.innerHTML = '';
  }
}
