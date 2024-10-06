export function getPartitionKey(key: string) {
    return `persist:${key}`;
}

export function getDeviceIdFromUrl(url: string) {
    const uri = new URL(url);
    const { host, pathname } = uri;
    return `${host.replace(/\./g, '_')}___${pathname.replace(/\//g, '_')}`;
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
