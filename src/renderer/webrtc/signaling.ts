import { SignalingMessage, Participant } from '../../shared/types';

type SignalingEventHandler = (message: SignalingMessage) => void;

export class SignalingClient {
    private ws: WebSocket | null = null;
    private eventHandlers: Map<string, SignalingEventHandler[]> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private currentRoomId: string | null = null;
    private userId: string | null = null;
    private userName: string = 'User';

    constructor() {
        this.userId = this.generateUserId();
    }

    private generateUserId(): string {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    public getUserId(): string {
        return this.userId!;
    }

    public setUserName(name: string): void {
        this.userName = name;
    }

    public connect(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                console.log('[Signaling] Connecting to:', url);
                this.ws = new WebSocket(url);

                // Add connection timeout
                const timeout = setTimeout(() => {
                    if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
                        this.ws.close();
                        reject(new Error('Connection timeout - server may be unavailable'));
                    }
                }, 5000);

                this.ws.onopen = () => {
                    clearTimeout(timeout);
                    console.log('[Signaling] Connected to server');
                    this.reconnectAttempts = 0;
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message: SignalingMessage = JSON.parse(event.data);
                        this.handleMessage(message);
                    } catch (error) {
                        console.error('[Signaling] Failed to parse message:', error);
                    }
                };

                this.ws.onclose = (event) => {
                    clearTimeout(timeout);
                    console.log('[Signaling] Connection closed, code:', event.code);
                    this.emit('disconnected', { type: 'leave' as const });
                    if (event.code !== 1000) { // 1000 = normal closure
                        this.attemptReconnect(url);
                    }
                };

                this.ws.onerror = () => {
                    clearTimeout(timeout);
                    console.error('[Signaling] WebSocket error occurred');
                    reject(new Error('Failed to connect to signaling server'));
                };
            } catch (error) {
                reject(new Error(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
            }
        });
    }

    private attemptReconnect(url: string): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`[Signaling] Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            setTimeout(() => {
                this.connect(url).catch(() => {
                    // Will retry in onclose handler
                });
            }, this.reconnectDelay * this.reconnectAttempts);
        }
    }

    public disconnect(): void {
        if (this.currentRoomId) {
            this.leaveRoom();
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    public joinRoom(roomId: string, initialState?: { isVideoOn: boolean, isMuted: boolean }): void {
        this.currentRoomId = roomId;
        this.send({
            type: 'join',
            roomId,
            from: this.userId!,
            payload: { 
                name: this.userName,
                isVideoOn: initialState?.isVideoOn || false,
                isMuted: initialState?.isMuted || false
            },
        });
    }

    public leaveRoom(): void {
        if (this.currentRoomId) {
            this.send({
                type: 'leave',
                roomId: this.currentRoomId,
                from: this.userId!,
            });
            this.currentRoomId = null;
        }
    }

    public sendOffer(to: string, offer: RTCSessionDescriptionInit): void {
        this.send({
            type: 'offer',
            from: this.userId!,
            to,
            roomId: this.currentRoomId!,
            payload: offer,
        });
    }

    public sendAnswer(to: string, answer: RTCSessionDescriptionInit): void {
        this.send({
            type: 'answer',
            from: this.userId!,
            to,
            roomId: this.currentRoomId!,
            payload: answer,
        });
    }

    public sendIceCandidate(to: string, candidate: RTCIceCandidateInit): void {
        this.send({
            type: 'ice-candidate',
            from: this.userId!,
            to,
            roomId: this.currentRoomId!,
            payload: candidate,
        });
    }

    public sendMuteStatus(isMuted: boolean): void {
        this.send({
            type: 'mute-status',
            from: this.userId!,
            roomId: this.currentRoomId!,
            payload: { isMuted },
        });
    }

    public sendVideoStatus(isVideoOn: boolean): void {
        this.send({
            type: 'video-status',
            from: this.userId!,
            roomId: this.currentRoomId!,
            payload: { isVideoOn },
        });
    }

    private send(message: SignalingMessage): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('[Signaling] Cannot send message - not connected');
        }
    }

    private handleMessage(message: SignalingMessage): void {
        this.emit(message.type, message);
    }

    public on(event: string, handler: SignalingEventHandler): void {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event)!.push(handler);
    }

    public off(event: string, handler: SignalingEventHandler): void {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        }
    }

    private emit(event: string, message: SignalingMessage): void {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => handler(message));
        }
    }

    public isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }
}
