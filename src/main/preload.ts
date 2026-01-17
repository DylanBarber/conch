import { contextBridge, ipcRenderer } from 'electron';
import { AppSettings, IPC_CHANNELS } from '../shared/types';

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Settings
    getSettings: (): Promise<AppSettings> => {
        return ipcRenderer.invoke(IPC_CHANNELS.GET_SETTINGS);
    },
    setSettings: (settings: Partial<AppSettings>): Promise<AppSettings> => {
        return ipcRenderer.invoke(IPC_CHANNELS.SET_SETTINGS, settings);
    },

    // Screen Sharing
    getScreenSources: () => ipcRenderer.invoke('get-screen-sources'),

    // Platform info
    platform: process.platform,
});

// Type declaration for the exposed API
declare global {
    interface Window {
        electronAPI: {
            getSettings: () => Promise<AppSettings>;
            setSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>;
            getScreenSources: () => Promise<Electron.DesktopCapturerSource[]>;
            platform: NodeJS.Platform;
        };
    }
}
