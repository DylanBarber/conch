import Store from 'electron-store';
import { AppSettings, DEFAULT_SETTINGS } from '../shared/types';

const store = new Store<{ settings: AppSettings }>({
    defaults: {
        settings: DEFAULT_SETTINGS,
    },
});

export function getSettings(): AppSettings {
    return store.get('settings');
}

export function setSettings(settings: Partial<AppSettings>): AppSettings {
    const currentSettings = getSettings();
    const newSettings: AppSettings = {
        ...currentSettings,
        ...settings,
        audio: {
            ...currentSettings.audio,
            ...(settings.audio || {}),
        },
        server: {
            ...currentSettings.server,
            ...(settings.server || {}),
        },
        user: {
            ...currentSettings.user,
            ...(settings.user || {}),
        },
    };
    store.set('settings', newSettings);
    return newSettings;
}

export function resetSettings(): AppSettings {
    store.set('settings', DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
}
