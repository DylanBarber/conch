import { DesktopCapturerSource } from '../../shared/types';

export interface ScreenShareOptions {
    sourceId: string;
    frameRate: number;
    width: number;
    height: number;
}

export class ScreenPickerComponent {
    private container: HTMLElement;
    private modalElement: HTMLElement | null = null;
    private sources: DesktopCapturerSource[] = [];
    private onResolve: ((options: ScreenShareOptions | null) => void) | null = null;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    public async show(): Promise<ScreenShareOptions | null> {
        return new Promise((resolve) => {
            this.onResolve = resolve;
            this.render();
            this.loadSources();
        });
    }

    private async loadSources() {
        if (!window.electronAPI?.getScreenSources) {
            console.error('getScreenSources API not available');
            this.sources = [];
            this.updateGrid();
            return;
        }

        try {
            this.sources = (await window.electronAPI.getScreenSources()) as unknown as DesktopCapturerSource[];
            this.updateGrid();
        } catch (error) {
            console.error('Failed to load screen sources:', error);
        }
    }

    private render() {
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'modal-overlay active';
        this.modalElement.innerHTML = `
            <div class="modal screen-picker-modal">
                <div class="modal-header">
                    <h2>Share Screen</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="screen-picker-controls">
                        <div class="form-group">
                            <label class="form-label">Quality</label>
                            <select id="screen-quality" class="form-select">
                                <option value="1080p30" selected>1080p @ 30fps</option>
                                <option value="720p30">720p @ 30fps</option>
                                <option value="1080p60">1080p @ 60fps</option>
                                <option value="720p60">720p @ 60fps</option>
                            </select>
                        </div>
                    </div>
                    <div class="screen-sources-grid" id="sources-grid">
                        <div class="loading-spinner">Loading sources...</div>
                    </div>
                </div>
            </div>
        `;

        this.modalElement.querySelector('.modal-close')?.addEventListener('click', () => this.close(null));
        this.modalElement.addEventListener('click', (e) => {
            if (e.target === this.modalElement) this.close(null);
        });

        this.container.appendChild(this.modalElement);
    }

    private updateGrid() {
        const grid = this.modalElement?.querySelector('#sources-grid');
        if (!grid) return;

        grid.innerHTML = '';

        if (this.sources.length === 0) {
            grid.innerHTML = '<div class="empty-message">No sources found</div>';
            return;
        }

        this.sources.forEach(source => {
            const item = document.createElement('div');
            item.className = 'source-item';
            item.innerHTML = `
                <div class="source-preview">
                    <img src="${source.thumbnail}" alt="${source.name}">
                </div>
                <div class="source-name" title="${source.name}">${source.name}</div>
            `;
            item.addEventListener('click', () => this.handleSelection(source));
            grid.appendChild(item);
        });
    }

    private handleSelection(source: DesktopCapturerSource) {
        const qualitySelect = this.modalElement?.querySelector('#screen-quality') as HTMLSelectElement;
        const qualityValue = qualitySelect?.value || '1080p30';

        // Parse quality (simple mapping)
        let width = 1920;
        let height = 1080;
        let frameRate = 30;

        switch (qualityValue) {
            case '720p30': width = 1280; height = 720; frameRate = 30; break;
            case '1080p60': width = 1920; height = 1080; frameRate = 60; break;
            case '720p60': width = 1280; height = 720; frameRate = 60; break;
            case '1080p30': default: width = 1920; height = 1080; frameRate = 30; break;
        }

        this.close({
            sourceId: source.id,
            width,
            height,
            frameRate
        });
    }

    private close(result: ScreenShareOptions | null) {
        if (this.modalElement) {
            this.modalElement.remove();
            this.modalElement = null;
        }
        if (this.onResolve) {
            this.onResolve(result);
            this.onResolve = null;
        }
    }
}
