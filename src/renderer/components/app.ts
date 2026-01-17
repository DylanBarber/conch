import { PeerManager } from '../webrtc/peer-manager';
import { SettingsComponent } from './settings';
import { AppSettings, Participant } from '../../shared/types';
import { AudioDevice } from '../webrtc/audio-processor';
import { SoundManager } from '../webrtc/sound-manager';

// Icons
const ICONS = {
  logo: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>`,
  settings: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
  mic: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>`,
  micOff: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>`,
  refresh: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`,
  speaker: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`,
  copy: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>`,
};

export class App {
  private container: HTMLElement;
  private peerManager: PeerManager;
  private settings: AppSettings | null = null;
  private audioDevices: AudioDevice[] = [];

  private isConnected = false;
  private isMuted = false;
  private currentRoom = '';
  private userName = '';
  private micGain = 100;
  private outputVolume = 100;
  private noiseSuppression = true;

  private participants: Participant[] = [];
  private logEntries: string[] = [];
  private audioLevelInterval: number | null = null;
  private settingsComponent: SettingsComponent | null = null;
  private soundManager: SoundManager;
  private isTestingInput = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.peerManager = new PeerManager();
    this.soundManager = new SoundManager();
    this.setupPeerManagerListeners();
  }

  private setupPeerManagerListeners(): void {
    this.peerManager.on('peerJoined', (p) => {
      this.addLog(`User joined: ${p.name}`);
      this.soundManager.playJoinSound();
      this.updateParticipants();
    });
    this.peerManager.on('peerLeft', (p) => {
      this.addLog(`User left: ${p.name}`);
      this.soundManager.playLeaveSound();
      this.updateParticipants();
    });
    this.peerManager.on('peerUpdated', () => this.updateParticipants());
    this.peerManager.on('connectionStateChanged', (connected) => {
      if (connected) {
        this.soundManager.playConnectSound();
      } else if (this.isConnected) {
        this.isConnected = false;
        this.soundManager.playDisconnectSound();
        this.addLog('// Disconnected from server', 'error');
        this.render();
      }
    });
  }

  public async initialize(): Promise<void> {
    this.settings = await window.electronAPI.getSettings();
    await this.peerManager.initialize();
    this.audioDevices = await this.peerManager.getAudioProcessor().getAudioDevices();

    if (this.settings) {
      this.noiseSuppression = this.settings.audio.noiseSuppression;
      this.userName = this.settings.user.displayName || 'User';
      this.peerManager.setTurnServers(this.settings.server.turnServers);
      this.peerManager.setNoiseSuppressionEnabled(this.noiseSuppression);
    }

    this.addLog('// Connection log will appear here...');
    this.render();
    this.startAudioLevelMonitor();
  }

  private render(): void {
    const inputDevices = this.audioDevices.filter(d => d.kind === 'audioinput');
    const outputDevices = this.audioDevices.filter(d => d.kind === 'audiooutput');

    this.container.innerHTML = `
      <div class="app-container">
        <!-- Header -->
        <header class="header">
          <div class="header-brand">
            <div class="header-logo">
              ${ICONS.logo}
              <h1>CONCH VOICE</h1>
            </div>
            <span class="header-subtitle">NEURAL VOICE NETWORK // V2.0</span>
          </div>
          <div class="header-actions">
            <div class="status-badge ${this.isConnected ? 'connected' : 'disconnected'}">
              ${this.isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </div>
            <button class="btn-icon" id="settings-btn" title="Settings">
              ${ICONS.settings}
            </button>
          </div>
        </header>

        <!-- Main Layout -->
        <div class="main-layout">
          <!-- Main Content -->
          <div class="main-content">
            <!-- Voice Channel Panel -->
            <div class="voice-channel-panel">
              <div class="panel-header">VOICE CHANNEL</div>
              <form class="voice-channel-form" id="connect-form">
                <div class="form-group">
                  <input type="text" class="form-input" id="user-name" 
                    placeholder="Your name" value="${this.userName}" ${this.isConnected ? 'disabled' : ''}>
                </div>
                <div class="form-group">
                  <input type="text" class="form-input" id="room-name" 
                    placeholder="lobby" value="${this.currentRoom}" ${this.isConnected ? 'disabled' : ''}>
                </div>
                <button type="submit" class="btn ${this.isConnected ? 'btn-danger' : 'btn-primary'}" id="connect-btn">
                  ${this.isConnected ? 'DISCONNECT' : 'CONNECT'}
                </button>
              </form>
            </div>

            <!-- Connected Users Panel -->
            <div class="connected-users-panel">
              <div class="panel-header">CONNECTED USERS</div>
              ${this.renderUsersGrid()}
            </div>
          </div>

          <!-- Audio Controls Sidebar -->
          <div class="audio-sidebar">
            <div class="sidebar-section">
              <div class="sidebar-section-title">AUDIO CONTROLS</div>
              
              <!-- Mic Button -->
              <div class="mic-button-container">
                <button class="mic-button ${this.isMuted ? 'muted' : ''}" id="mic-toggle">
                  ${this.isMuted ? ICONS.micOff : ICONS.mic}
                </button>
                <span class="mic-label">${this.isMuted ? 'MUTED' : 'LIVE'}</span>
              </div>
            </div>

            <!-- Sliders -->
            <div class="sidebar-section">
              <div class="slider-group">
                <div class="slider-header">
                  <span class="slider-label">MIC GAIN</span>
                  <span class="slider-value">${this.micGain}%</span>
                </div>
                <input type="range" class="slider" id="mic-gain" min="0" max="100" value="${this.micGain}">
              </div>

              <div class="slider-group">
                <div class="slider-header">
                  <span class="slider-label">OUTPUT VOLUME</span>
                  <span class="slider-value">${this.outputVolume}%</span>
                </div>
                <input type="range" class="slider" id="output-volume" min="0" max="100" value="${this.outputVolume}">
              </div>
            </div>

            <!-- Noise Suppression -->
            <div class="sidebar-section">
              <div class="checkbox-group" id="noise-toggle">
                <div class="checkbox ${this.noiseSuppression ? 'checked' : ''}">
                  ${this.noiseSuppression ? ICONS.check : ''}
                </div>
                <span class="checkbox-label">Noise Suppression</span>
              </div>
            </div>

            <!-- Device Selection -->
            <div class="sidebar-section">
              <div class="sidebar-section-title">AUDIO DEVICES</div>
              
              <div class="form-group">
                <label class="form-label">INPUT DEVICE</label>
                <select class="form-select" id="input-device">
                  ${inputDevices.map(d => `
                    <option value="${d.deviceId}" ${d.deviceId === this.settings?.audio.inputDeviceId ? 'selected' : ''}>
                      ${d.label}
                    </option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">OUTPUT DEVICE</label>
                <select class="form-select" id="output-device">
                  ${outputDevices.map(d => `
                    <option value="${d.deviceId}" ${d.deviceId === this.settings?.audio.outputDeviceId ? 'selected' : ''}>
                      ${d.label}
                    </option>
                  `).join('')}
                </select>
              </div>

              <div class="input-level">
                <span class="form-label">INPUT LEVEL</span>
                <div class="level-bar">
                  <div class="level-fill" id="input-level-fill" style="width: 0%"></div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="sidebar-section">
              <div class="sidebar-buttons">
                <button class="btn btn-secondary btn-sm" id="refresh-devices">
                  ${ICONS.refresh} REFRESH
                </button>
                <button class="btn ${this.isTestingInput ? 'btn-primary' : 'btn-secondary'} btn-sm" id="test-audio">
                  ${ICONS.speaker} ${this.isTestingInput ? 'STOP TEST' : 'TEST INPUT'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Bar -->
        <div class="status-bar">
          <div class="status-info">
            <div class="status-item">
              <span>Server</span>
              <span style="color: ${this.isConnected ? 'var(--color-success)' : 'var(--color-error)'}">
                ${this.isConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <div class="status-item">
              <span>Room:</span>
              <span>${this.currentRoom || '---'}</span>
            </div>
            <div class="status-item">
              <span>Latency:</span>
              <span>---</span>
            </div>
          </div>
          <div class="log-actions">
            <button class="btn btn-sm" id="copy-log">${ICONS.copy} Copy</button>
            <button class="btn btn-sm" id="clear-log">${ICONS.trash} Clear</button>
            <span class="version">CONCH v2.0.0</span>
          </div>
        </div>

        <!-- Connection Log -->
        <div class="connection-log" id="connection-log">
          ${this.logEntries.map(entry => `<div class="log-entry">${entry}</div>`).join('')}
        </div>

        <!-- Settings Container -->
        <div id="settings-container"></div>
      </div>
    `;

    this.attachEventListeners();
  }

  private renderUsersGrid(): string {
    if (this.participants.length === 0) {
      return `
        <div class="empty-state">
          ${ICONS.users}
          <p>No users connected</p>
          <p class="subtitle">Join a channel to start chatting</p>
        </div>
      `;
    }

    return `
      <div class="users-grid">
        ${this.participants.map(p => `
          <div class="user-card ${p.isSpeaking ? 'speaking' : ''}">
            <div class="user-avatar">${this.getInitials(p.name)}</div>
            <div class="user-info">
              <div class="user-name">${p.name}</div>
              <div class="user-status ${p.isMuted ? 'muted' : ''}">
                ${p.isMuted ? 'Muted' : (p.isSpeaking ? 'Speaking' : 'Connected')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  private getInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  private getDeviceLabel(deviceId: string): string {
    const device = this.audioDevices.find(d => d.deviceId === deviceId);
    return device ? device.label : 'Unknown Device';
  }

  private attachEventListeners(): void {
    // Connect form
    document.getElementById('connect-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.isConnected) {
        this.disconnect();
      } else {
        this.connect();
      }
    });

    // Mic toggle
    document.getElementById('mic-toggle')?.addEventListener('click', () => {
      this.isMuted = !this.isMuted;
      this.peerManager.setMuted(this.isMuted);
      this.addLog(`Microphone ${this.isMuted ? 'muted' : 'unmuted'}`);
      this.render();
    });

    // Mic gain slider
    document.getElementById('mic-gain')?.addEventListener('input', (e) => {
      this.micGain = parseInt((e.target as HTMLInputElement).value);
      const valueEl = document.querySelector('#mic-gain')?.parentElement?.querySelector('.slider-value');
      if (valueEl) valueEl.textContent = `${this.micGain}%`;
    });

    // Output volume slider
    document.getElementById('output-volume')?.addEventListener('input', (e) => {
      this.outputVolume = parseInt((e.target as HTMLInputElement).value);
      const valueEl = document.querySelector('#output-volume')?.parentElement?.querySelector('.slider-value');
      if (valueEl) valueEl.textContent = `${this.outputVolume}%`;
    });

    // Noise suppression toggle
    document.getElementById('noise-toggle')?.addEventListener('click', () => {
      this.noiseSuppression = !this.noiseSuppression;
      this.peerManager.setNoiseSuppressionEnabled(this.noiseSuppression);
      this.render();
    });

    // Device selection
    document.getElementById('input-device')?.addEventListener('change', async (e) => {
      const deviceId = (e.target as HTMLSelectElement).value;
      if (this.settings) {
        this.settings.audio.inputDeviceId = deviceId;
        window.electronAPI.setSettings({ audio: { ...this.settings.audio, inputDeviceId: deviceId } });

        try {
          await this.peerManager.setInputDevice(deviceId);
          this.addLog(`Input device changed to: ${this.getDeviceLabel(deviceId)}`);
        } catch (error) {
          this.addLog(`Failed to change input device: ${error}`, 'error');
        }
      }
    });

    document.getElementById('output-device')?.addEventListener('change', (e) => {
      const deviceId = (e.target as HTMLSelectElement).value;
      this.peerManager.setOutputDevice(deviceId);
      if (this.settings) {
        this.settings.audio.outputDeviceId = deviceId;
        window.electronAPI.setSettings({ audio: { ...this.settings.audio, outputDeviceId: deviceId } });
      }
    });

    // Refresh devices
    document.getElementById('refresh-devices')?.addEventListener('click', async () => {
      this.audioDevices = await this.peerManager.getAudioProcessor().getAudioDevices();
      this.addLog('Refreshed audio devices');
      this.render();
    });

    // Test audio (Input Loopback)
    document.getElementById('test-audio')?.addEventListener('click', async () => {
      this.isTestingInput = !this.isTestingInput;
      try {
        // Ensure audio is initialized/started
        if (!this.peerManager.getAudioProcessor().getLocalStream()) {
          await this.peerManager.getAudioProcessor().startLocalStream(this.settings?.audio.inputDeviceId);
        }

        await this.peerManager.getAudioProcessor().toggleInputTest(this.isTestingInput);

        if (this.isTestingInput) {
          this.addLog('Input test started (Loopback ON)');
        } else {
          this.addLog('Input test stopped');
          // If not connected, stop the stream to release mic
          if (!this.isConnected) {
            this.peerManager.getAudioProcessor().stopLocalStream();
          }
        }
        this.render();
      } catch (error) {
        this.isTestingInput = false;
        this.addLog(`Failed to start input test: ${error}`, 'error');
        this.render();
      }
    });

    // Copy log
    document.getElementById('copy-log')?.addEventListener('click', () => {
      navigator.clipboard.writeText(this.logEntries.join('\n'));
      this.addLog('Log copied to clipboard');
    });

    // Clear log
    document.getElementById('clear-log')?.addEventListener('click', () => {
      this.logEntries = [];
      this.addLog('// Connection log will appear here...');
      this.render();
    });

    // Settings
    document.getElementById('settings-btn')?.addEventListener('click', () => {
      this.openSettings();
    });
  }

  private async connect(): Promise<void> {
    const userNameInput = document.getElementById('user-name') as HTMLInputElement;
    const roomNameInput = document.getElementById('room-name') as HTMLInputElement;

    this.userName = userNameInput?.value.trim() || 'User';
    this.currentRoom = roomNameInput?.value.trim() || 'lobby';

    if (!this.settings) return;

    this.addLog(`Connecting to room "${this.currentRoom}"...`);

    try {
      await this.peerManager.connect(
        this.settings.server.signalingUrl,
        this.currentRoom,
        this.userName
      );

      this.isConnected = true;
      this.addLog(`Connected to room "${this.currentRoom}" as "${this.userName}"`);
      this.updateParticipants();
      this.render();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Connection failed';
      this.addLog(`// Error: ${msg}`, 'error');
      this.render();
    }
  }

  private disconnect(): void {
    this.peerManager.disconnect();
    this.isConnected = false;
    this.participants = [];
    this.addLog('Disconnected from server');
    this.render();
  }

  private updateParticipants(): void {
    this.participants = this.peerManager.getParticipants();
    const usersPanel = document.querySelector('.connected-users-panel');
    if (usersPanel) {
      const header = usersPanel.querySelector('.panel-header');
      usersPanel.innerHTML = '';
      if (header) usersPanel.appendChild(header.cloneNode(true));
      usersPanel.insertAdjacentHTML('beforeend', this.renderUsersGrid());
    }
  }

  private startAudioLevelMonitor(): void {
    this.audioLevelInterval = window.setInterval(() => {
      const level = this.peerManager.getLocalAudioLevel();
      const fill = document.getElementById('input-level-fill');
      if (fill) {
        fill.style.width = `${Math.min(level * 100, 100)}%`;
      }
    }, 50);
  }

  private addLog(message: string, type?: 'error' | 'warning'): void {
    const timestamp = new Date().toLocaleTimeString();
    let entry = `[${timestamp}] ${message}`;
    if (type === 'error') entry = `<span class="error">${entry}</span>`;
    if (type === 'warning') entry = `<span class="warning">${entry}</span>`;

    this.logEntries.push(entry);
    if (this.logEntries.length > 100) this.logEntries.shift();

    const logEl = document.getElementById('connection-log');
    if (logEl) {
      logEl.innerHTML = this.logEntries.map(e => `<div class="log-entry">${e}</div>`).join('');
      logEl.scrollTop = logEl.scrollHeight;
    }
  }

  private async openSettings(): Promise<void> {
    const container = document.getElementById('settings-container');
    if (!container || !this.settings) return;

    this.audioDevices = await this.peerManager.getAudioProcessor().getAudioDevices();

    this.settingsComponent = new SettingsComponent(
      container,
      this.settings,
      this.audioDevices,
      {
        onSettingsChange: async (newSettings) => {
          this.settings = newSettings;
          await window.electronAPI.setSettings(newSettings);
          this.peerManager.setTurnServers(newSettings.server.turnServers);
          this.peerManager.setNoiseSuppressionEnabled(newSettings.audio.noiseSuppression);
          this.noiseSuppression = newSettings.audio.noiseSuppression;
          this.addLog('Settings updated');
          this.render();
        },
        onClose: () => {
          if (this.settingsComponent) {
            this.settingsComponent.destroy();
            this.settingsComponent = null;
          }
        },
      }
    );
    this.settingsComponent.render();
  }
}
