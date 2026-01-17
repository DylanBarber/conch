import { SavedServer } from '../../shared/types';

const ICONS = {
  close: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`,
};

export interface ServerModalCallbacks {
  onSave: (server: SavedServer) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export class ServerModalComponent {
  private container: HTMLElement;
  private overrides: Partial<SavedServer> | null;
  private callbacks: ServerModalCallbacks;

  constructor(
    container: HTMLElement,
    callbacks: ServerModalCallbacks,
    overrides?: Partial<SavedServer>
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.overrides = overrides || null;
  }

  public render(): void {
    const existing = this.overrides || {};
    const isEditing = !!existing.name;

    this.container.innerHTML = `
      <div class="modal-overlay active" id="server-modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h2>${isEditing ? 'Edit Server' : 'Add New Server'}</h2>
            <button class="modal-close" id="server-modal-close">
              ${ICONS.close}
            </button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
               <label class="form-label">SERVER NICKNAME</label>
               <input type="text" class="form-input" id="server-name" 
                 placeholder="My Awesome Server" value="${existing.name || ''}" autofocus>
               <span class="help-text">Name shown in your saved list</span>
            </div>

            <div class="form-row">
                <div class="form-group">
                   <label class="form-label">SIGNALING SERVER URL</label>
                   <input type="text" class="form-input" id="server-signaling" 
                     placeholder="ws://localhost:5000" value="${existing.signalingUrl || 'ws://localhost:5000'}">
                </div>

                <div class="form-group">
                   <label class="form-label">DEFAULT ROOM (Optional)</label>
                   <input type="text" class="form-input" id="server-room" 
                     placeholder="lobby" value="${existing.room || 'lobby'}">
                </div>
            </div>
            
            <div class="form-divider">USER SETTINGS</div>

            <div class="form-group">
               <label class="form-label">YOUR NICKNAME</label>
               <input type="text" class="form-input" id="server-username" 
                 placeholder="Display Name" value="${existing.displayName || ''}">
               <span class="help-text">Name to use when connecting to this server</span>
            </div>

             <div class="form-divider">ADVANCED (TURN/STUN)</div>

            <div class="form-group">
               <label class="form-label">TURN/STUN URL (Optional)</label>
               <input type="text" class="form-input" id="server-turn-url" 
                 placeholder="stun:stun.l.google.com:19302" value="${existing.turnUrl || ''}">
            </div>

             <div class="form-row">
                 <div class="form-group">
                    <label class="form-label">TURN USERNAME</label>
                    <input type="text" class="form-input" id="server-turn-user" 
                      placeholder="Optional" value="${existing.turnUsername || ''}">
                 </div>
                 <div class="form-group">
                    <label class="form-label">TURN PASSWORD</label>
                    <input type="password" class="form-input" id="server-turn-pass" 
                      placeholder="Optional" value="${existing.turnCredential || ''}">
                 </div>
             </div>

          </div>
          
          <div class="modal-footer">
            <div style="flex: 1;">
              ${isEditing ? `<button class="btn btn-danger btn-xs" id="server-modal-delete">Delete Server</button>` : ''}
            </div>
            <button class="btn btn-secondary" id="server-modal-cancel">Cancel</button>
            <button class="btn btn-primary" id="server-modal-save">Save Server</button>
          </div>
        </div>
      </div>
    `;

    this.attachListeners();
  }

  private attachListeners(): void {
    const close = () => {
      this.container.innerHTML = '';
      this.callbacks.onClose();
    };

    document.getElementById('server-modal-close')?.addEventListener('click', close);
    document.getElementById('server-modal-cancel')?.addEventListener('click', close);
    document.getElementById('server-modal-overlay')?.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).id === 'server-modal-overlay') close();
    });

    document.getElementById('server-modal-delete')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this server?')) {
        this.container.innerHTML = '';
        this.callbacks.onDelete?.();
      }
    });

    document.getElementById('server-modal-save')?.addEventListener('click', () => {
      const name = (document.getElementById('server-name') as HTMLInputElement).value.trim();
      const signalingUrl = (document.getElementById('server-signaling') as HTMLInputElement).value.trim();
      const room = (document.getElementById('server-room') as HTMLInputElement).value.trim() || 'lobby';
      const displayName = (document.getElementById('server-username') as HTMLInputElement).value.trim();

      const turnUrl = (document.getElementById('server-turn-url') as HTMLInputElement).value.trim();
      const turnUsername = (document.getElementById('server-turn-user') as HTMLInputElement).value.trim();
      const turnCredential = (document.getElementById('server-turn-pass') as HTMLInputElement).value.trim();

      if (!name) {
        alert('Please enter a server nickname');
        return;
      }
      if (!signalingUrl) {
        alert('Please enter a signaling server URL');
        return;
      }
      if (!displayName) {
        alert('Please enter your nickname');
        return;
      }

      const server: SavedServer = {
        name,
        room,
        signalingUrl,
        displayName,
        turnUrl: turnUrl || undefined,
        turnUsername: turnUsername || undefined,
        turnCredential: turnCredential || undefined
      };

      this.container.innerHTML = '';
      this.callbacks.onSave(server);
    });
  }
}
