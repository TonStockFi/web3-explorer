import { DeviceInfo } from "../../types";

export const ServerHostList = [
    { host: 'ws://192.168.43.244:3204/api' },
    { host: 'ws://192.168.43.244:6788/api' },
    { host: 'ws://192.168.43.133:6788/api' },
    { host: 'ws://localhost:3204/api' },
    { host: 'http://192.168.43.244:3203/api' },
    { host: 'https://web3-desk-worker.barry-ptp.workers.dev/api' },
    { host: 'https://desk.web3r.site/api' }
];

export const Devices: Map<string, DeviceInfo> = new Map();
