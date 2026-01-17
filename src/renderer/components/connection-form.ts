// Icons as SVG strings
const ICONS = {
    connect: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>`,
    user: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>`,
    room: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`,
};

export interface ConnectionFormCallbacks {
    onConnect: (roomId: string, userName: string) => void;
}

export class ConnectionFormComponent {
    private container: HTMLElement;
    private callbacks: ConnectionFormCallbacks;
    private isConnecting = false;
    private error: string | null = null;

    constructor(container: HTMLElement, callbacks: ConnectionFormCallbacks) {
        this.container = container;
        this.callbacks = callbacks;
    }

    public render(): void {
        this.container.innerHTML = `
      <div class="connection-header">
        <h2>Join Voice Chat</h2>
        <p>Enter a room name to join or create a voice channel</p>
      </div>
      
      <form class="connection-form" id="connection-form">
        <div class="form-group">
          <label class="form-label" for="user-name">
            ${ICONS.user} Display Name
          </label>
          <input 
            type="text" 
            class="form-input" 
            id="user-name" 
            placeholder="Your name"
            required
            autocomplete="off"
          >
        </div>
        
        <div class="form-group">
          <label class="form-label" for="room-id">
            ${ICONS.room} Room Name
          </label>
          <input 
            type="text" 
            class="form-input" 
            id="room-id" 
            placeholder="Enter room name"
            required
            autocomplete="off"
          >
        </div>
        
        ${this.error ? `
          <div class="connection-error" style="color: var(--color-error); font-size: var(--font-size-sm); padding: var(--spacing-sm);">
            ${this.error}
          </div>
        ` : ''}
        
        <button type="submit" class="btn btn-primary" id="connect-btn" ${this.isConnecting ? 'disabled' : ''}>
          ${ICONS.connect}
          ${this.isConnecting ? 'Connecting...' : 'Join Room'}
        </button>
      </form>
      
      <div class="connection-status">
        <div class="status-indicator ${this.isConnecting ? 'connecting' : ''}"></div>
        <span>${this.isConnecting ? 'Connecting to server...' : 'Ready to connect'}</span>
      </div>
    `;

        this.attachEventListeners();
    }

    private attachEventListeners(): void {
        const form = document.getElementById('connection-form');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleConnect();
        });
    }

    private handleConnect(): void {
        const roomInput = document.getElementById('room-id') as HTMLInputElement;
        const nameInput = document.getElementById('user-name') as HTMLInputElement;

        if (roomInput && nameInput && roomInput.value.trim() && nameInput.value.trim()) {
            this.callbacks.onConnect(roomInput.value.trim(), nameInput.value.trim());
        }
    }

    public setConnecting(connecting: boolean): void {
        this.isConnecting = connecting;
        this.render();
    }

    public setError(error: string | null): void {
        this.error = error;
        this.render();
    }

    public destroy(): void {
        this.container.innerHTML = '';
    }
}
