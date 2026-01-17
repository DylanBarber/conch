export interface AudioDevice {
    deviceId: string;
    label: string;
    kind: 'audioinput' | 'audiooutput';
}

export class AudioProcessor {
    private audioContext: AudioContext | null = null;
    private localStream: MediaStream | null = null;
    private analyserNode: AnalyserNode | null = null;
    private gainNode: GainNode | null = null;
    private noiseSuppressionEnabled = true;
    private noiseSuppressionLevel: 'low' | 'medium' | 'high' = 'medium';

    // Audio level monitoring
    private audioLevelCallback: ((level: number) => void) | null = null;
    private audioLevelInterval: number | null = null;

    constructor() { }

    public async initialize(): Promise<void> {
        this.audioContext = new AudioContext();
    }

    public async getAudioDevices(): Promise<AudioDevice[]> {
        try {
            // Request permission first to get labeled devices
            await navigator.mediaDevices.getUserMedia({ audio: true });

            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices
                .filter(device => device.kind === 'audioinput' || device.kind === 'audiooutput')
                .map(device => ({
                    deviceId: device.deviceId,
                    label: device.label || `${device.kind === 'audioinput' ? 'Microphone' : 'Speaker'} ${device.deviceId.slice(0, 8)}`,
                    kind: device.kind as 'audioinput' | 'audiooutput',
                }));
        } catch (error) {
            console.error('[AudioProcessor] Failed to enumerate devices:', error);
            return [];
        }
    }

    public async startLocalStream(inputDeviceId?: string): Promise<MediaStream> {
        try {
            const constraints: MediaStreamConstraints = {
                audio: {
                    deviceId: inputDeviceId ? { exact: inputDeviceId } : undefined,
                    echoCancellation: true,
                    noiseSuppression: this.noiseSuppressionEnabled,
                    autoGainControl: true,
                },
                video: false,
            };

            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);

            // Set up audio processing chain
            if (this.audioContext) {
                const source = this.audioContext.createMediaStreamSource(this.localStream);

                // Create gain node for volume control
                this.gainNode = this.audioContext.createGain();
                this.gainNode.gain.value = 1.0;

                // Create analyser for audio level monitoring
                this.analyserNode = this.audioContext.createAnalyser();
                this.analyserNode.fftSize = 256;

                source.connect(this.gainNode);
                this.gainNode.connect(this.analyserNode);

                // Start audio level monitoring
                this.startAudioLevelMonitoring();
            }

            return this.localStream;
        } catch (error) {
            console.error('[AudioProcessor] Failed to start local stream:', error);
            throw error;
        }
    }

    public stopLocalStream(): void {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        this.stopAudioLevelMonitoring();
    }

    public getLocalStream(): MediaStream | null {
        return this.localStream;
    }

    public setNoiseSuppressionEnabled(enabled: boolean): void {
        this.noiseSuppressionEnabled = enabled;
        // Apply to existing tracks
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.applyConstraints({
                    noiseSuppression: enabled,
                }).catch(err => console.error('Failed to apply noise suppression:', err));
            });
        }
    }

    public setNoiseSuppressionLevel(level: 'low' | 'medium' | 'high'): void {
        this.noiseSuppressionLevel = level;
        // Note: Browser's built-in noise suppression doesn't support levels
        // For advanced noise suppression, RNNoise WASM would be needed
    }

    public setMuted(muted: boolean): void {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = !muted;
            });
        }
    }

    public isMuted(): boolean {
        if (this.localStream) {
            const tracks = this.localStream.getAudioTracks();
            return tracks.length > 0 && !tracks[0].enabled;
        }
        return true;
    }

    public setOutputDevice(audioElement: HTMLAudioElement, deviceId: string): Promise<void> {
        if ('setSinkId' in audioElement) {
            return (audioElement as any).setSinkId(deviceId);
        }
        return Promise.reject(new Error('setSinkId not supported'));
    }

    public onAudioLevel(callback: (level: number) => void): void {
        this.audioLevelCallback = callback;
    }

    private startAudioLevelMonitoring(): void {
        if (!this.analyserNode) return;

        const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);

        const checkLevel = () => {
            if (!this.analyserNode) return;

            this.analyserNode.getByteFrequencyData(dataArray);

            // Calculate average audio level
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            const normalizedLevel = average / 255; // Normalize to 0-1

            if (this.audioLevelCallback) {
                this.audioLevelCallback(normalizedLevel);
            }
        };

        this.audioLevelInterval = window.setInterval(checkLevel, 50);
    }

    private stopAudioLevelMonitoring(): void {
        if (this.audioLevelInterval !== null) {
            window.clearInterval(this.audioLevelInterval);
            this.audioLevelInterval = null;
        }
    }

    public destroy(): void {
        this.stopLocalStream();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}
