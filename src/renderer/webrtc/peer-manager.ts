import { SignalingClient } from './signaling';
import { AudioProcessor } from './audio-processor';
import { TurnServer, Participant, SignalingMessage } from '../../shared/types';

interface PeerConnection {
    id: string;
    name: string;
    connection: RTCPeerConnection;
    audioElement: HTMLAudioElement;
    isMuted: boolean;
    audioLevel: number;
}

type PeerEventHandler = (participant: Participant) => void;

export class PeerManager {
    private signaling: SignalingClient;
    private audioProcessor: AudioProcessor;
    private peers: Map<string, PeerConnection> = new Map();
    private rtcConfig: RTCConfiguration = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };

    private eventHandlers: {
        peerJoined: PeerEventHandler[];
        peerLeft: PeerEventHandler[];
        peerUpdated: PeerEventHandler[];
        connectionStateChanged: ((connected: boolean) => void)[];
    } = {
            peerJoined: [],
            peerLeft: [],
            peerUpdated: [],
            connectionStateChanged: [],
        };

    private localMuted = false;
    private localAudioLevel = 0;
    private outputDeviceId: string = 'default';

    constructor() {
        this.signaling = new SignalingClient();
        this.audioProcessor = new AudioProcessor();
        this.setupSignalingHandlers();
    }

    private setupSignalingHandlers(): void {
        this.signaling.on('user-list', (msg) => {
            const users = msg.payload as { id: string; name: string }[];
            users.forEach(user => {
                if (user.id !== this.signaling.getUserId()) {
                    this.createPeerConnection(user.id, user.name, true);
                }
            });
        });

        this.signaling.on('user-joined', (msg) => {
            const { id, name } = msg.payload as { id: string; name: string };
            if (id !== this.signaling.getUserId()) {
                this.createPeerConnection(id, name, false);
            }
        });

        this.signaling.on('user-left', (msg) => {
            const userId = msg.from!;
            this.removePeer(userId);
        });

        this.signaling.on('offer', async (msg) => {
            const peer = this.peers.get(msg.from!);
            if (peer) {
                await peer.connection.setRemoteDescription(msg.payload as RTCSessionDescriptionInit);
                const answer = await peer.connection.createAnswer();
                await peer.connection.setLocalDescription(answer);
                this.signaling.sendAnswer(msg.from!, answer);
            }
        });

        this.signaling.on('answer', async (msg) => {
            const peer = this.peers.get(msg.from!);
            if (peer) {
                await peer.connection.setRemoteDescription(msg.payload as RTCSessionDescriptionInit);
            }
        });

        this.signaling.on('ice-candidate', async (msg) => {
            const peer = this.peers.get(msg.from!);
            if (peer && msg.payload) {
                await peer.connection.addIceCandidate(msg.payload as RTCIceCandidateInit);
            }
        });

        this.signaling.on('mute-status', (msg) => {
            const peer = this.peers.get(msg.from!);
            if (peer) {
                peer.isMuted = (msg.payload as { isMuted: boolean }).isMuted;
                this.emitPeerUpdated(peer);
            }
        });

        this.signaling.on('disconnected', () => {
            this.eventHandlers.connectionStateChanged.forEach(handler => handler(false));
        });
    }

    public async initialize(): Promise<void> {
        await this.audioProcessor.initialize();

        // Set up audio level monitoring
        this.audioProcessor.onAudioLevel((level) => {
            this.localAudioLevel = level;
        });
    }

    public setTurnServers(servers: TurnServer[]): void {
        this.rtcConfig.iceServers = servers.map(server => ({
            urls: server.urls,
            username: server.username,
            credential: server.credential,
        }));
    }

    public setOutputDevice(deviceId: string): void {
        this.outputDeviceId = deviceId;
        // Apply to all existing peer audio elements
        this.peers.forEach(peer => {
            this.audioProcessor.setOutputDevice(peer.audioElement, deviceId).catch(err => {
                console.error('Failed to set output device:', err);
            });
        });
    }

    public async setInputDevice(deviceId: string): Promise<void> {
        try {
            console.log(`[PeerManager] Switching input device to ${deviceId}`);
            // 1. Start new stream
            await this.audioProcessor.startLocalStream(deviceId);
            const newStream = this.audioProcessor.getLocalStream();

            if (!newStream) {
                throw new Error('Failed to get new stream');
            }

            const newAudioTrack = newStream.getAudioTracks()[0];

            // 2. Replace track for all existing peers
            const replacePromises: Promise<void>[] = [];
            this.peers.forEach(peer => {
                const sender = peer.connection.getSenders().find(s => s.track?.kind === 'audio');
                if (sender) {
                    console.log(`[PeerManager] Replacing track for peer ${peer.id}`);
                    replacePromises.push(sender.replaceTrack(newAudioTrack));
                }
            });

            await Promise.all(replacePromises);
            console.log('[PeerManager] Input device switched successfully');
        } catch (error) {
            console.error('[PeerManager] Failed to switch input device:', error);
            throw error;
        }
    }

    public async connect(signalingUrl: string, roomId: string, userName: string): Promise<void> {
        this.signaling.setUserName(userName);

        // First, connect to signaling server
        try {
            await this.signaling.connect(signalingUrl);
        } catch (error) {
            throw new Error(`Signaling server error: ${error instanceof Error ? error.message : 'Connection failed'}`);
        }

        this.eventHandlers.connectionStateChanged.forEach(handler => handler(true));

        // Then, start local audio stream
        try {
            await this.audioProcessor.startLocalStream();
        } catch (error) {
            // Disconnect signaling if audio fails
            this.signaling.disconnect();
            this.eventHandlers.connectionStateChanged.forEach(handler => handler(false));
            throw new Error(`Microphone error: ${error instanceof Error ? error.message : 'Could not access microphone'}`);
        }

        // Join the room
        this.signaling.joinRoom(roomId);
    }

    public disconnect(): void {
        // Close all peer connections
        this.peers.forEach((peer, id) => {
            peer.connection.close();
            peer.audioElement.remove();
        });
        this.peers.clear();

        // Stop local audio
        this.audioProcessor.stopLocalStream();

        // Disconnect from signaling
        this.signaling.disconnect();

        this.eventHandlers.connectionStateChanged.forEach(handler => handler(false));
    }

    private async createPeerConnection(peerId: string, peerName: string, initiator: boolean): Promise<void> {
        const connection = new RTCPeerConnection(this.rtcConfig);

        // Create audio element for remote stream
        const audioElement = document.createElement('audio');
        audioElement.autoplay = true;
        document.body.appendChild(audioElement);

        // Set output device
        await this.audioProcessor.setOutputDevice(audioElement, this.outputDeviceId).catch(() => { });

        const peer: PeerConnection = {
            id: peerId,
            name: peerName,
            connection,
            audioElement,
            isMuted: false,
            audioLevel: 0,
        };
        this.peers.set(peerId, peer);

        // Add local tracks to connection
        const localStream = this.audioProcessor.getLocalStream();
        if (localStream) {
            localStream.getTracks().forEach(track => {
                connection.addTrack(track, localStream);
            });
        }

        // Handle incoming tracks
        connection.ontrack = (event) => {
            audioElement.srcObject = event.streams[0];
        };

        // Handle ICE candidates
        connection.onicecandidate = (event) => {
            if (event.candidate) {
                this.signaling.sendIceCandidate(peerId, event.candidate);
            }
        };

        // Handle connection state changes
        connection.onconnectionstatechange = () => {
            console.log(`[PeerManager] Connection state with ${peerName}: ${connection.connectionState}`);
            if (connection.connectionState === 'failed' || connection.connectionState === 'disconnected') {
                this.emitPeerUpdated(peer);
            }
        };

        // Emit peer joined event
        this.emitPeerJoined(peer);

        // If we're the initiator, create and send offer
        if (initiator) {
            const offer = await connection.createOffer();
            await connection.setLocalDescription(offer);
            this.signaling.sendOffer(peerId, offer);
        }
    }

    private removePeer(peerId: string): void {
        const peer = this.peers.get(peerId);
        if (peer) {
            peer.connection.close();
            peer.audioElement.remove();
            this.peers.delete(peerId);
            this.emitPeerLeft(peer);
        }
    }

    public setMuted(muted: boolean): void {
        this.localMuted = muted;
        this.audioProcessor.setMuted(muted);
        this.signaling.sendMuteStatus(muted);
    }

    public isMuted(): boolean {
        return this.localMuted;
    }

    public getLocalAudioLevel(): number {
        return this.localAudioLevel;
    }

    public getParticipants(): Participant[] {
        const participants: Participant[] = [];

        // Add local user
        participants.push({
            id: this.signaling.getUserId(),
            name: 'You',
            isMuted: this.localMuted,
            isSpeaking: this.localAudioLevel > 0.1,
            audioLevel: this.localAudioLevel,
        });

        // Add remote peers
        this.peers.forEach(peer => {
            participants.push({
                id: peer.id,
                name: peer.name,
                isMuted: peer.isMuted,
                isSpeaking: peer.audioLevel > 0.1,
                audioLevel: peer.audioLevel,
            });
        });

        return participants;
    }

    public on(event: 'peerJoined' | 'peerLeft' | 'peerUpdated', handler: PeerEventHandler): void;
    public on(event: 'connectionStateChanged', handler: (connected: boolean) => void): void;
    public on(event: string, handler: any): void {
        if (event in this.eventHandlers) {
            (this.eventHandlers as any)[event].push(handler);
        }
    }

    private emitPeerJoined(peer: PeerConnection): void {
        const participant = this.peerToParticipant(peer);
        this.eventHandlers.peerJoined.forEach(handler => handler(participant));
    }

    private emitPeerLeft(peer: PeerConnection): void {
        const participant = this.peerToParticipant(peer);
        this.eventHandlers.peerLeft.forEach(handler => handler(participant));
    }

    private emitPeerUpdated(peer: PeerConnection): void {
        const participant = this.peerToParticipant(peer);
        this.eventHandlers.peerUpdated.forEach(handler => handler(participant));
    }

    private peerToParticipant(peer: PeerConnection): Participant {
        return {
            id: peer.id,
            name: peer.name,
            isMuted: peer.isMuted,
            isSpeaking: peer.audioLevel > 0.1,
            audioLevel: peer.audioLevel,
        };
    }

    public getAudioProcessor(): AudioProcessor {
        return this.audioProcessor;
    }

    public setNoiseSuppressionEnabled(enabled: boolean): void {
        this.audioProcessor.setNoiseSuppressionEnabled(enabled);
    }

    public setNoiseSuppressionLevel(level: 'low' | 'medium' | 'high'): void {
        this.audioProcessor.setNoiseSuppressionLevel(level);
    }

    public isConnected(): boolean {
        return this.signaling.isConnected();
    }
}
