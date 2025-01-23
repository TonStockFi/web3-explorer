import { currentTs } from '../../common/utils';
import { GLOBAL_ACTIONS, sendMessageParams } from '../../types';

let queue: ArrayBuffer[] = [];

export function pushQueue(screen: ArrayBuffer) {
    queue.unshift(screen);
}

let _webRtcControl: WebRtcControl | null = null;

let lastPrintedTime = -1;

function logEvery(data: string) {
    const now = Math.floor(currentTs() / 1000);

    if (now % 3 === 0 && now !== lastPrintedTime) {
        console.log(data.length);
        lastPrintedTime = now; // 记录上次触发时间，防止重复执行
    }
}

export class WebRtcControl {
    dataChannel_control?: RTCDataChannel;
    dataChannel_screen?: RTCDataChannel;
    dataChannel_chat?: RTCDataChannel;
    wsSendClientEventAction(action: GLOBAL_ACTIONS, ws: WebSocket) {
        this.wsSendClientEvent(
            {
                eventType: 'action',
                value: action
            },
            ws
        );
    }
    wsSendClientEvent(eventMessage: sendMessageParams, ws: WebSocket) {
        if (this.dataChannel_control && this.dataChannel_control.readyState === 'open') {
            this.dataChannel_control.send(JSON.stringify(eventMessage));
        }
    }
    wsSendClientClickEvent(x: number, y: number, ws: WebSocket) {
        x = Math.round(x);
        y = Math.round(y);
        this.wsSendClientEvent(
            {
                eventType: 'click',
                x,
                y
            },
            ws
        );
    }
    peerConnection: RTCPeerConnection;

    constructor() {
        this.peerConnection = new RTCPeerConnection();
    }
    init() {
        this.peerConnection = new RTCPeerConnection();
    }
    start({
        setScreenImageSrc,
        handleDeviceInfo
    }: {
        handleDeviceInfo: (info: any) => void;
        setScreenImageSrc: (url: string) => void;
    }) {
        this.peerConnection.ondatachannel = (event: any) => {
            const { channel } = event;
            const { label } = channel;
            console.log('ondatachannel init', label);

            if (label === 'screen') {
                this.dataChannel_screen = channel;
            }

            if (label === 'control') {
                this.dataChannel_control = channel;
            }

            if (label === 'chat') {
                this.dataChannel_chat = channel;
            }

            // Handle incoming messages on the specific data channel
            channel.onmessage = (e: any) => {
                if (label === 'control') {
                    const { deviceInfo } = JSON.parse(e.data);
                    console.log('control deviceInfo', deviceInfo);
                    if (deviceInfo) {
                        handleDeviceInfo(deviceInfo);
                    }
                }

                if (label === 'screen') {
                    // Handle screen image messages
                    // const blob = new Blob([e.data], { type: 'image/png' }); // Adjust MIME type if needed
                    // console.log('Received screen image, size:', blob.size);
                    // Generate a Blob URL
                    // const blobUrl = URL.createObjectURL(blob);
                    // Set the image source (you should have `setScreenImageSrc` function defined)
                    logEvery(e.data);
                    setScreenImageSrc(e.data);
                }

                if (label === 'chat') {
                    // Handle chat messages (if needed)
                    console.log('Received chat message:', e.data);
                }
            };
        };
        this.peerConnection.ontrack = event => {
            const videoElement = document.getElementById('video') as HTMLVideoElement;
            if (videoElement) {
                videoElement.srcObject = event.streams[0];

                videoElement.controls = false;
                videoElement.autoplay = true;
                videoElement.style.display = 'flex';

                videoElement.muted = true; // 避免音频不同步问题
                videoElement.playsInline = true; // 适配移动端
            }
        };
    }
    static getInstance() {
        if (!_webRtcControl) {
            _webRtcControl = new WebRtcControl();
        }
        return _webRtcControl;
    }
    getPeerConnection() {
        return this.peerConnection;
    }
}
