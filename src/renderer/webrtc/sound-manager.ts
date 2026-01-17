export class SoundManager {
    private audioContext: AudioContext;

    constructor() {
        this.audioContext = new AudioContext();
    }

    private playTone(startFreq: number, endFreq: number, duration: number, type: OscillatorType = 'sine'): void {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    public playJoinSound(): void {
        // Ascending chime: C5 -> C6
        this.playTone(523.25, 1046.50, 0.3);
    }

    public playLeaveSound(): void {
        // Descending chime: C5 -> C4
        this.playTone(523.25, 261.63, 0.3);
    }

    public playConnectSound(): void {
        // Success chord arpeggio
        const now = this.audioContext.currentTime;
        this.playNote(440, now, 0.1);       // A4
        this.playNote(554.37, now + 0.1, 0.1); // C#5
        this.playNote(659.25, now + 0.2, 0.2); // E5
    }

    public playDisconnectSound(): void {
        // Failure/Disconnect sound
        this.playTone(400, 100, 0.4, 'sawtooth');
    }

    private playNote(freq: number, startTime: number, duration: number): void {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.frequency.value = freq;

        gainNode.gain.setValueAtTime(0.1, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }
}
