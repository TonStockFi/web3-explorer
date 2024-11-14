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

export function isDesktop(){
    //@ts-ignore
    return !!window.backgroundApi
}

export function formatDappUrl(dappUrl?: string) {
    if (!dappUrl) {
        return '';
    }
    return dappUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export function currentTs() {
    return + new Date();
}

export function isValidDomain(domain: string): boolean {
    const regex = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z]{2,})+$/;
    return regex.test(domain);
}

export function hexToRGBA(hex: string, alpha?: string | number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
    } else {
        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }
}