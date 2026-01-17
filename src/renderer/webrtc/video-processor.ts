export class VideoProcessor {
    private localScreenStream: MediaStream | null = null;

    constructor() { }

    public async startScreenShare(sourceId: string, options: { width?: number, height?: number, frameRate?: number } = {}): Promise<MediaStream> {
        try {
            const width = options.width || 1920;
            const height = options.height || 1080;
            const frameRate = options.frameRate || 30;

            const constraints: any = {
                audio: false, // System audio complicates things, starting with video only
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: sourceId,
                        minWidth: 1280,
                        maxWidth: width,
                        minHeight: 720,
                        maxHeight: height,
                        minFrameRate: frameRate,
                        maxFrameRate: frameRate
                    }
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.localScreenStream = stream;
            return stream;
        } catch (error) {
            console.error('[VideoProcessor] Failed to start screen share:', error);
            throw error;
        }
    }

    public stopScreenShare(): void {
        if (this.localScreenStream) {
            this.localScreenStream.getTracks().forEach(track => track.stop());
            this.localScreenStream = null;
        }
    }

    public getLocalScreenStream(): MediaStream | null {
        return this.localScreenStream;
    }
}
