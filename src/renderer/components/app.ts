import { PeerManager } from '../webrtc/peer-manager';
import { SettingsComponent } from './settings';
import { AppSettings, Participant, SavedServer } from '../../shared/types';
import { AudioDevice } from '../webrtc/audio-processor';
import { SoundManager } from '../webrtc/sound-manager';
import { ScreenPickerComponent } from './screen-picker';
import { ServerModalComponent } from './server-modal';

// Icons
const ICONS = {
  logo: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>`,
  settings: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
  mic: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>`,
  micOff: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>`,
  video: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>`,
  videoOff: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" /></svg>`,
  refresh: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>`,
  speaker: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`,
  copy: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>`,
  screen: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>`,
  disconnect: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>`,
  edit: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>`,
};

export class App {
  private container: HTMLElement;
  private peerManager: PeerManager;
  private settings: AppSettings | null = null;
  private audioDevices: AudioDevice[] = [];

  private isConnected = false;
  private isMuted = false;
  private isVideoOn = false;
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
  private screenPicker: ScreenPickerComponent;
  private serverModal: ServerModalComponent | null = null;
  private isTestingInput = false;
  private isSharingScreen = false;
  private activeScreenShares: Map<string, MediaStream> = new Map();
  private activeCameraStreams: Map<string, MediaStream> = new Map();
  private watchingStreamId: string | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.peerManager = new PeerManager();
    this.soundManager = new SoundManager();
    this.screenPicker = new ScreenPickerComponent(container);
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
        this.isSharingScreen = false;
        this.isVideoOn = false;
        this.activeScreenShares.clear();
        this.activeCameraStreams.clear();
        this.soundManager.playDisconnectSound();
        this.addLog('// Disconnected from server', 'error');
        this.render();
      }
    });
    this.peerManager.on('remoteTrackAdded', (participantId, stream) => {
      // Determine if this is a camera or screen share
      // We use a simple heuristic: if the participant has isVideoOn=true, 
      // and we don't have a camera stream for them yet, assume it's camera.
      // Otherwise assume screen share.
      const p = this.participants.find(p => p.id === participantId);
      
      // If we already have a camera stream, this must be screen share
      if (this.activeCameraStreams.has(participantId)) {
         this.activeScreenShares.set(participantId, stream);
         this.addLog(`Remote screen share received from ${p ? p.name : participantId}`);
      } 
      // If isVideoOn is true, it's the camera (or the first of two)
      else if (p && p.isVideoOn) {
         this.activeCameraStreams.set(participantId, stream);
         this.addLog(`Remote camera received from ${p.name}`);
      }
      // Otherwise, assume screen share (or late camera)
      else {
         this.activeScreenShares.set(participantId, stream);
         this.addLog(`Remote video received from ${p ? p.name : participantId} (classified as screen)`);
      }
      
      this.updateParticipants();

      stream.onremovetrack = () => {
        if (this.activeCameraStreams.get(participantId) === stream) {
            this.activeCameraStreams.delete(participantId);
        } else if (this.activeScreenShares.get(participantId) === stream) {
            this.activeScreenShares.delete(participantId);
        }
        
        if (this.watchingStreamId === participantId) {
          this.watchingStreamId = null;
          this.render(); // Re-render to switch back to grid
        } else {
            this.updateParticipants();
        }
      };
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
            <div class="header-subtitle">NEURAL VOICE NETWORK // V2.0</div>
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
            <!-- Left Sidebar: Users & Channel -->
            <div class="left-sidebar">
                <!-- Saved Servers Panel -->
                <div class="saved-servers-panel">
                    <div class="panel-header">SAVED SERVERS</div>
                    <button class="btn btn-primary full-width" id="add-server-btn-main">
                        ${ICONS.plus} ADD A SERVER
                    </button>
                    <div id="saved-servers-list">
                        ${(this.settings?.savedServers || []).map((s, i) => {
      const isConnectedToThis = this.isConnected &&
        s.room === this.currentRoom &&
        (!this.settings?.server.signalingUrl || s.signalingUrl === this.settings.server.signalingUrl);

      return `
                            <div class="saved-server-item">
                                <div class="saved-server-info">
                                    <span class="saved-server-name">${s.name}</span>
                                    <span class="saved-server-room">${s.room}</span>
                                </div>
                                <div class="saved-server-actions">
                                    <button class="btn ${isConnectedToThis ? 'btn-danger' : 'btn-primary'} btn-xs connect-server-btn" 
                                            data-index="${i}"
                                            data-action="${isConnectedToThis ? 'disconnect' : 'connect'}">
                                        ${isConnectedToThis ? 'DISCONNECT' : 'CONNECT'}
                                    </button>
                                    <button class="btn-icon edit-server-btn" data-index="${i}" title="Edit Server">
                                        ${ICONS.edit}
                                    </button>
                                </div>
                            </div>
                        `;
    }).join('')}
                         ${(this.settings?.savedServers || []).length === 0 ? `
                            <div class="empty-state" style="padding: 10px;">
                                <p style="font-size: 11px;">No saved servers</p>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Connected Users Panel -->
                <div class="connected-users-panel">
                    <div class="panel-header">CONNECTED USERS</div>
                    <div class="users-grid">
                        ${this.participants.length === 0 ? `
                            <div class="empty-state">
                                ${ICONS.users}
                                <p>No users connected</p>
                            </div>
                        ` : this.participants.map(p => this.renderUserCard(p)).join('')}
                    </div>
                </div>
            </div>

            <!-- Center Content: Stage -->
            <div class="center-content">
                <div id="stage-area" class="stage-area">
                    ${this.renderStage()}
                </div>
                <div class="stream-controls-bar">
                    <button class="btn ${this.isSharingScreen ? 'btn-danger' : 'btn-primary'} btn-lg" id="share-screen" ${!this.isConnected ? 'disabled' : ''}>
                        ${ICONS.screen} ${this.isSharingScreen ? 'STOP SHARING' : 'SHARE SCREEN'}
                    </button>
                </div>
            </div>

          <!-- Audio Controls Sidebar -->
          <div class="audio-sidebar">
            <div class="sidebar-section">
              <div class="sidebar-section-title">CONTROLS</div>
              
              <div class="controls-row" style="display: flex; gap: 10px;">
                  <!-- Mic Button -->
                  <div class="mic-button-container">
                    <button class="mic-button ${this.isMuted ? 'muted' : ''}" id="mic-toggle">
                      ${this.isMuted ? ICONS.micOff : ICONS.mic}
                    </button>
                    <span class="mic-label">${this.isMuted ? 'MUTED' : 'LIVE'}</span>
                  </div>

                  <!-- Video Button -->
                  <div class="mic-button-container">
                    <button class="mic-button ${this.isVideoOn ? 'active' : 'muted'}" id="video-toggle" style="${this.isVideoOn ? 'background: #00d4aa; color: #000;' : ''}">
                      ${this.isVideoOn ? ICONS.video : ICONS.videoOff}
                    </button>
                    <span class="mic-label">${this.isVideoOn ? 'VIDEO ON' : 'VIDEO OFF'}</span>
                  </div>
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
        <div id="server-modal-container"></div>
      </div>
    `;

    this.attachEventListeners();
    this.postRender();
  }

  private renderStage(): string {
    if (!this.isConnected) {
        return `
            <div class="empty-state">
                ${ICONS.logo}
                <p>Join a server to start</p>
            </div>
        `;
    }

    if (this.watchingStreamId) {
        // Presentation Mode
        const stream = this.activeScreenShares.get(this.watchingStreamId);
        if (!stream) {
             // Fallback if stream lost
             this.watchingStreamId = null;
             return this.renderStage(); 
        }

        const presenter = this.participants.find(p => p.id === this.watchingStreamId);
        const name = presenter ? presenter.name : 'Unknown';

        return `
            <div class="stage-presentation">
                <div class="presentation-screen">
                    <div class="video-wrapper">
                         <video id="presentation-video" autoplay playsinline></video>
                    </div>
                    <div class="video-overlay">
                        <span>${name}'s Screen</span>
                        <div class="video-controls">
                            <button class="btn btn-secondary btn-xs" id="fullscreen-btn">FULL SCREEN</button>
                            <button class="btn btn-danger btn-xs" id="close-stream">CLOSE</button>
                        </div>
                    </div>
                </div>
                <div class="presentation-participants">
                    ${this.participants.map(p => this.renderStageParticipant(p)).join('')}
                </div>
            </div>
        `;
    } else {
        // Grid Mode
        return `
            <div class="stage-grid">
                ${this.participants.map(p => this.renderStageParticipant(p)).join('')}
            </div>
        `;
    }
  }

  private renderStageParticipant(p: Participant): string {
    const hasCamera = this.activeCameraStreams.has(p.id) || (p.name === 'You' && this.isVideoOn);
    
    return `
        <div class="stage-participant ${p.isSpeaking ? 'speaking' : ''}" id="stage-participant-${p.id}">
             ${hasCamera ? `
                <video id="stage-video-${p.id}" autoplay playsinline muted="${p.name === 'You' ? 'true' : 'false'}"></video>
            ` : `
                <div class="avatar-container">
                    <div class="avatar">${this.getInitials(p.name)}</div>
                </div>
            `}
            <div class="name-tag">
                ${p.isMuted ? ICONS.micOff : ''}
                <span>${p.name} ${p.name === 'You' ? '(You)' : ''}</span>
            </div>
        </div>
    `;
  }

  private renderUserCard(p: Participant): string {
    const isSharingScreen = this.activeScreenShares.has(p.id);
    const isWatcher = this.watchingStreamId === p.id;

    // Sidebar card just shows info now
    return `
      <div class="user-card ${p.isSpeaking ? 'speaking' : ''}">
        <div class="user-avatar">${this.getInitials(p.name)}</div>
        <div class="user-info">
          <div class="user-name">
            ${p.name}
            ${isSharingScreen ? `
                <button class="btn btn-xs ${isWatcher ? 'btn-danger' : 'btn-primary'} watch-stream-btn" data-id="${p.id}">
                    ${ICONS.screen} ${isWatcher ? 'STOP WATCHING' : 'WATCH STREAM'}
                </button>
            ` : ''}
          </div>
          <div class="user-status ${p.isMuted ? 'muted' : ''}">
            ${p.isMuted ? 'Muted' : (p.isSpeaking ? 'Speaking' : 'Connected')}
          </div>
        </div>
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

  private postRender() {
    // Attach presentation stream
    if (this.watchingStreamId) {
        const stream = this.activeScreenShares.get(this.watchingStreamId);
        const video = document.getElementById('presentation-video') as HTMLVideoElement;
        if (video && stream) {
            video.srcObject = stream;
        }
    }

    // Attach participant streams in Stage
    this.participants.forEach(p => {
        const videoEl = document.getElementById(`stage-video-${p.id}`) as HTMLVideoElement;
        if (videoEl) {
            if (p.name === 'You' && this.isVideoOn) {
                const stream = this.peerManager.getLocalCameraStream();
                if (stream) videoEl.srcObject = stream;
            } else if (this.activeCameraStreams.has(p.id)) {
                const stream = this.activeCameraStreams.get(p.id);
                if (stream) videoEl.srcObject = stream;
            }
        }
    });

    // Re-attach listeners for dynamic buttons
    // Watch/Stop Watch buttons
    document.querySelectorAll('.watch-stream-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent card click
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (id) {
          if (this.watchingStreamId === id) {
            this.watchingStreamId = null;
          } else {
            this.watchingStreamId = id;
          }
          this.render(); // Re-render users/grid
        }
      });
    });

    // Close stream button
    document.getElementById('close-stream')?.addEventListener('click', () => {
      this.watchingStreamId = null;
      this.render();
    });

    // Full Screen button
    document.getElementById('fullscreen-btn')?.addEventListener('click', () => {
      const videoContainer = document.querySelector('.presentation-screen');
      if (videoContainer) {
        if (!document.fullscreenElement) {
          videoContainer.requestFullscreen().catch(err => {
            this.addLog(`Error attempting to enable full-screen mode: ${err.message}`, 'error');
          });
        } else {
          document.exitFullscreen();
        }
      }
    });
  }

  private getDeviceLabel(deviceId: string): string {
    const device = this.audioDevices.find(d => d.deviceId === deviceId);
    return device ? device.label : 'Unknown Device';
  }

  private attachEventListeners(): void {
    // Connect form
    // Disconnect Button (Header) - Removed

    // Mic toggle
    document.getElementById('mic-toggle')?.addEventListener('click', () => {
      this.isMuted = !this.isMuted;
      this.peerManager.setMuted(this.isMuted);
      this.addLog(`Microphone ${this.isMuted ? 'muted' : 'unmuted'}`);
      this.render();
    });

    // Video toggle
    document.getElementById('video-toggle')?.addEventListener('click', async () => {
        try {
            this.isVideoOn = !this.isVideoOn;
            await this.peerManager.setVideoEnabled(this.isVideoOn);
            this.addLog(`Video ${this.isVideoOn ? 'started' : 'stopped'}`);
            this.render();
        } catch (error) {
            this.isVideoOn = !this.isVideoOn; // Revert
            this.addLog(`Failed to toggle video: ${error}`, 'error');
            this.render();
        }
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

    // Share Screen
    document.getElementById('share-screen')?.addEventListener('click', async () => {
      if (!this.isConnected) return;

      if (this.isSharingScreen) {
        // Stop sharing
        this.peerManager.stopScreenShare();
        this.isSharingScreen = false;
        this.render();
      } else {
        // Start sharing
        try {
          const options = await this.screenPicker.show();
          if (options) {
            await this.peerManager.startScreenShare(options.sourceId, {
              width: options.width,
              height: options.height,
              frameRate: options.frameRate
            });
            this.isSharingScreen = true;
            this.render();
          }
        } catch (error) {
            this.addLog(`Failed to share screen: ${error}`, 'error');
        }
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

    document.getElementById('add-server-btn-main')?.addEventListener('click', () => {
      this.openServerModal();
    });

    // Connect/Disconnect Button Logic
    document.querySelectorAll('.connect-server-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const el = e.currentTarget as HTMLElement;
        const index = parseInt(el.dataset.index || '0');
        const action = el.dataset.action;

        if (action === 'disconnect') {
          this.disconnect();
          return;
        }

        const server = this.settings?.savedServers?.[index];
        if (server) {
          await this.connectToSavedServer(server);
        }
      });
    });

    document.querySelectorAll('.edit-server-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const el = e.currentTarget as HTMLElement;
        const index = parseInt(el.dataset.index || '0');
        const server = this.settings?.savedServers?.[index];
        if (server) {
          this.openServerModal(server, index);
        }
      });
    });

    // Settings
    document.getElementById('settings-btn')?.addEventListener('click', () => {
      this.openSettings();
    });
  }

  private async connect(): Promise<void> {
    // We don't have inputs anymore, so we use current state properties
    // this.userName and this.currentRoom should be set by connectToSavedServer
    // or loaded from settings init.

    this.currentRoom = this.currentRoom || 'lobby';
    this.userName = this.userName || 'User';

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
    this.isVideoOn = false;
    this.isSharingScreen = false;
    this.participants = [];
    this.activeScreenShares.clear();
    this.activeCameraStreams.clear();
    this.watchingStreamId = null;
    this.addLog('Disconnected from server');
    this.render();
  }

  private updateParticipants(): void {
    this.participants = this.peerManager.getParticipants();
    
    // Check for potential misclassification of video streams due to race conditions
    this.participants.forEach(p => {
        // If signal says Camera ON, but we have it in ScreenShares and NOT CameraStreams
        if (p.isVideoOn && !this.activeCameraStreams.has(p.id) && this.activeScreenShares.has(p.id)) {
             const stream = this.activeScreenShares.get(p.id);
             this.activeScreenShares.delete(p.id);
             this.activeCameraStreams.set(p.id, stream!);
             this.addLog(`Reclassified stream as camera for ${p.name}`);
        }
    });

    // Update Sidebar
    const usersPanel = document.querySelector('.connected-users-panel .users-grid');
    if (usersPanel) {
         usersPanel.innerHTML = this.participants.length === 0 ? `
            <div class="empty-state">
                ${ICONS.users}
                <p>No users connected</p>
            </div>
        ` : this.participants.map(p => this.renderUserCard(p)).join('');
    }

    // Update Stage
    const stageArea = document.getElementById('stage-area');
    if (stageArea) {
        stageArea.innerHTML = this.renderStage();
        this.postRender();
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
  private openServerModal(existing?: SavedServer, index?: number): void {
    const container = document.getElementById('server-modal-container');
    if (!container) return;

    this.serverModal = new ServerModalComponent(
      container,
      {
        onSave: async (server) => {
          if (!this.settings) return;
          const saved = this.settings.savedServers || [];
          if (typeof index === 'number') {
            saved[index] = server;
          } else {
            saved.push(server);
          }
          const newSettings = { ...this.settings, savedServers: saved };
          this.settings = newSettings;
          await window.electronAPI.setSettings(newSettings);
          this.addLog(`Server ${typeof index === 'number' ? 'updated' : 'saved'}: ${server.name}`);
          this.render();
          this.serverModal = null;
        },
        onDelete: async () => {
          if (!this.settings || typeof index !== 'number') return;
          const saved = this.settings.savedServers || [];
          saved.splice(index, 1);
          const newSettings = { ...this.settings, savedServers: saved };
          this.settings = newSettings;
          await window.electronAPI.setSettings(newSettings);
          this.addLog('Server deleted');
          this.render();
          this.serverModal = null;
        },
        onClose: () => {
          this.serverModal = null;
        }
      },
      existing
    );
    this.serverModal.render();
  }

  private async connectToSavedServer(server: SavedServer): Promise<void> {
    if (this.isConnected) {
      this.disconnect();
    }

    if (!this.settings) return;

    const newSettings = { ...this.settings };
    newSettings.server.signalingUrl = server.signalingUrl;
    newSettings.user.displayName = server.displayName;

    if (server.turnUrl) {
      newSettings.server.turnServers = [{
        urls: server.turnUrl,
        username: server.turnUsername,
        credential: server.turnCredential
      }];
    }

    this.settings = newSettings;
    await window.electronAPI.setSettings(newSettings);

    // Update inputs (if we still had them, but we don't. Just update state)
    this.currentRoom = server.room;
    this.userName = server.displayName;

    this.addLog(`Connecting to saved server: ${server.name}...`);
    this.connect();
  }
}
