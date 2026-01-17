// Icons as SVG strings
const ICONS = {
    mic: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>`,
    micOff: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zm11.414 0l2.829 2.829M17 6l4 4m0-4l-4 4" /></svg>`,
    headphones: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>`,
    phoneOff: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.28 3H5z" /></svg>`,
    settings: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
    users: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
};

import { Participant } from '../../shared/types';

export interface ChatRoomCallbacks {
    onMuteToggle: (muted: boolean) => void;
    onDeafenToggle: (deafened: boolean) => void;
    onDisconnect: () => void;
    onSettingsOpen: () => void;
}

export class ChatRoomComponent {
    private container: HTMLElement;
    private participants: Participant[] = [];
    private isMuted = false;
    private isDeafened = false;
    private callbacks: ChatRoomCallbacks;
    private roomName: string = '';

    constructor(container: HTMLElement, callbacks: ChatRoomCallbacks) {
        this.container = container;
        this.callbacks = callbacks;
    }

    public setRoomName(name: string): void {
        this.roomName = name;
    }

    public updateParticipants(participants: Participant[]): void {
        this.participants = participants;
        this.renderParticipants();
    }

    public setMuted(muted: boolean): void {
        this.isMuted = muted;
        this.updateMuteButton();
    }

    public render(): void {
        this.container.innerHTML = `
      <div class="chat-room fade-in">
        <div class="participants-container">
          <div class="participants-header">
            <h3>${ICONS.users} ${this.roomName || 'Voice Chat'}</h3>
            <span class="participant-count">${this.participants.length} participant${this.participants.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="participants-grid" id="participants-grid">
            ${this.renderParticipantCards()}
          </div>
        </div>
      </div>
      
      <div class="controls-bar">
        <button class="control-btn ${this.isMuted ? 'active' : ''}" id="mute-btn" title="${this.isMuted ? 'Unmute' : 'Mute'}">
          ${this.isMuted ? ICONS.micOff : ICONS.mic}
        </button>
        <button class="control-btn ${this.isDeafened ? 'active' : ''}" id="deafen-btn" title="${this.isDeafened ? 'Undeafen' : 'Deafen'}">
          ${ICONS.headphones}
        </button>
        <button class="control-btn" id="settings-btn" title="Settings">
          ${ICONS.settings}
        </button>
        <button class="control-btn end-call" id="disconnect-btn" title="Disconnect">
          ${ICONS.phoneOff}
        </button>
      </div>
    `;

        this.attachEventListeners();
    }

    private renderParticipantCards(): string {
        if (this.participants.length === 0) {
            return `
        <div class="chat-room-empty">
          ${ICONS.users}
          <p>Waiting for participants...</p>
        </div>
      `;
        }

        return this.participants.map(p => `
      <div class="participant-card ${p.isSpeaking ? 'speaking' : ''}" data-id="${p.id}">
        <div class="participant-avatar">
          <div class="audio-ring"></div>
          <div class="avatar-circle">${this.getInitials(p.name)}</div>
        </div>
        <div class="participant-name">${p.name}</div>
        <div class="participant-status ${p.isMuted ? 'muted' : ''}">
          ${p.isMuted ? ICONS.micOff + ' Muted' : ICONS.mic + ' Speaking'}
        </div>
      </div>
    `).join('');
    }

    private getInitials(name: string): string {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    private renderParticipants(): void {
        const grid = document.getElementById('participants-grid');
        if (grid) {
            grid.innerHTML = this.renderParticipantCards();
        }

        // Update participant count
        const countEl = this.container.querySelector('.participant-count');
        if (countEl) {
            countEl.textContent = `${this.participants.length} participant${this.participants.length !== 1 ? 's' : ''}`;
        }
    }

    private updateMuteButton(): void {
        const muteBtn = document.getElementById('mute-btn');
        if (muteBtn) {
            muteBtn.className = `control-btn ${this.isMuted ? 'active' : ''}`;
            muteBtn.innerHTML = this.isMuted ? ICONS.micOff : ICONS.mic;
            muteBtn.title = this.isMuted ? 'Unmute' : 'Mute';
        }
    }

    private attachEventListeners(): void {
        document.getElementById('mute-btn')?.addEventListener('click', () => {
            this.isMuted = !this.isMuted;
            this.updateMuteButton();
            this.callbacks.onMuteToggle(this.isMuted);
        });

        document.getElementById('deafen-btn')?.addEventListener('click', () => {
            this.isDeafened = !this.isDeafened;
            const btn = document.getElementById('deafen-btn');
            if (btn) {
                btn.className = `control-btn ${this.isDeafened ? 'active' : ''}`;
            }
            this.callbacks.onDeafenToggle(this.isDeafened);
        });

        document.getElementById('settings-btn')?.addEventListener('click', () => {
            this.callbacks.onSettingsOpen();
        });

        document.getElementById('disconnect-btn')?.addEventListener('click', () => {
            this.callbacks.onDisconnect();
        });
    }

    public destroy(): void {
        this.container.innerHTML = '';
    }
}
