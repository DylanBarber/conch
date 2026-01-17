// Shared types for JS Conch Voice Chat Application

export interface TurnServer {
    urls: string;
    username?: string;
    credential?: string;
}

export interface AudioSettings {
    inputDeviceId: string;
    outputDeviceId: string;
    noiseSuppression: boolean;
    noiseSuppressionLevel: 'low' | 'medium' | 'high';
}

export interface ServerSettings {
    signalingUrl: string;
    turnServers: TurnServer[];
}

export interface AppSettings {
    audio: AudioSettings;
    server: ServerSettings;
    user: UserSettings;
}

export interface UserSettings {
    displayName: string;
}

export interface Participant {
    id: string;
    name: string;
    isMuted: boolean;
    isSpeaking: boolean;
    audioLevel: number;
}

export interface RoomInfo {
    roomId: string;
    participants: Participant[];
}

// Signaling message types
export type SignalingMessageType =
    | 'join'
    | 'leave'
    | 'offer'
    | 'answer'
    | 'ice-candidate'
    | 'user-list'
    | 'user-joined'
    | 'user-left'
    | 'mute-status';

export interface SignalingMessage {
    type: SignalingMessageType;
    from?: string;
    to?: string;
    roomId?: string;
    payload?: unknown;
}

// IPC channel names
export const IPC_CHANNELS = {
    GET_SETTINGS: 'settings:get',
    SET_SETTINGS: 'settings:set',
    GET_AUDIO_DEVICES: 'audio:get-devices',
} as const;

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
    audio: {
        inputDeviceId: 'default',
        outputDeviceId: 'default',
        noiseSuppression: true,
        noiseSuppressionLevel: 'medium',
    },
    server: {
        signalingUrl: 'ws://localhost:5000',
        turnServers: [
            {
                urls: 'stun:stun.l.google.com:19302',
            },
        ],
    },
    user: {
        displayName: 'User',
    },
};
