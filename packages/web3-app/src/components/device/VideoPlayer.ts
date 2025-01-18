export default class VideoPlayer {
    public mediaSource: MediaSource | null = null;
    private sourceBuffer: SourceBuffer | null = null;
    private queue: ArrayBuffer[] = [];
    private mimeType = 'video/webm; codecs="vp8, opus"'; // 确保和服务器编码一致

    constructor(private videoElement: HTMLVideoElement) {
        this.createMediaSource();
    }

    private createMediaSource() {
        if (this.mediaSource) {
            this.mediaSource.removeEventListener("sourceopen", this.onSourceOpen);
        }

        this.mediaSource = new MediaSource();
        this.videoElement.src = URL.createObjectURL(this.mediaSource);

        this.mediaSource.addEventListener("sourceopen", this.onSourceOpen.bind(this));
    }

    private onSourceOpen() {
        if (!this.mediaSource || this.mediaSource.readyState !== "open") return;
        
        this.sourceBuffer = this.mediaSource.addSourceBuffer(this.mimeType);
        this.sourceBuffer.addEventListener("updateend", () => this.processQueue());
    }

    private processQueue() {
        if (this.queue.length > 0 && this.sourceBuffer && !this.sourceBuffer.updating) {
            this.sourceBuffer.appendBuffer(this.queue.shift()!);
        }
    }

    public playBuffer(videoBuffer: ArrayBuffer) {
        if (this.sourceBuffer) {
            if (!this.sourceBuffer.updating) {
                this.sourceBuffer.appendBuffer(videoBuffer);
            } else {
                this.queue.push(videoBuffer);
            }
        }
    }
}
