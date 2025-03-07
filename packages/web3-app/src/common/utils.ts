
export function getPartitionKey(key: string) {
    return `persist:${key}`;
}

export const getSessionCacheInfo = (key?: string) => {
    const res = sessionStorage.getItem(key || 'currentAccount');
    if (res) {
        return JSON.parse(res);
    } else {
        return null;
    }
};

export function getUrlIsDev(){
    const uri = new URL(location.href);
    const isDev = !!uri.searchParams.get('isDev');
    return isDev
}

export function getUrlQuery(key:string,defaultVal?:any){
    const uri = new URL(location.href);
    return uri.searchParams.get(key) || defaultVal
}

export function addQuery(key:string,val:any){
    const uri = new URL(location.href);
    uri.searchParams.set(key, String(val));
    return uri.toString()
}


export function urlAddQuery(url:string,key:string,val:any){
    const uri = new URL(url);
    uri.searchParams.set(key, String(val));
    return uri.toString()
}

export function urlGetQuery(url:string,key:string,defaultVal?:any){
    const uri = new URL(url);
    return uri.searchParams.get(key) || defaultVal
}

export function getWebpageUrlWithQuery(hash: string, query?: Record<string, any>): string {
    // Parse the current URL
    const uri = new URL(location.href);

    // Add the hash to the URL
    if(hash.startsWith("#")){
        hash = hash.substring(1)
    }
    uri.hash = hash;

    // Merge the query into uri.searchParams if provided
    if (query) {
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                uri.searchParams.set(key, String(value));
            }
        });
    }

    // Return the assembled URL as a string
    return uri.toString();
}

export function waitForResult(
    cb: () => any | Promise<any>,
    timeout: number = -1,
    interval: number = 1000
): Promise<any | null> {
    const startTime = Date.now();

    return new Promise((resolve) => {
        const checkReply = async () => {
            try {
                const res = await Promise.resolve(cb()); // Ensure cb result is a Promise
                if (res) {
                    resolve(res);
                    return;
                }

                // Check for timeout
                if (timeout > -1 && Date.now() - startTime > timeout) {
                    resolve(false);
                    return;
                }

                // Retry after interval
                setTimeout(checkReply, interval);
            } catch (error) {
                console.error("Error in waitForResult callback:", error);
                resolve(false); // Resolve with null on error
            }
        };

        checkReply();
    });
}

export async function copyTextToClipboard(text: string) {
    try {
        if (window.ClipboardItem) {
            const clipboardItem = new ClipboardItem({
                'text/plain': new Blob([text], { type: 'text/plain' })
            });
            await navigator.clipboard.write([clipboardItem]);
            return true;
        } else if (window.__appApi) {
            await window.__appApi.writeText(text);
            return true;
        }else if (window.backgroundApi) {
            await window.backgroundApi.writeText(text);
            return true;
        }  else {
            return false;
        }
    } catch (error) {
        console.error('Failed to copy image to clipboard:', error);
        return false;
    }
}

export const toShortAddress = (value: string, length = 4): string => {
    if (value.length > length * 2) {
        return value.slice(0, length) + '…' + value.slice(-length);
    } else {
        return value;
    }
};

export function getDeviceIdFromUrl(url: string) {
    const uri = new URL(url);
    const { host, pathname } = uri;
    return `${host.replace(/\./g, '_')}___${pathname.replace(/\//g, '_')}`;
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function isTMA() {
    return location.href.indexOf("tgWebAppData") > -1;
}

export function isLocal(url?:string) {
    if(!url){
        url = location.href
    }
    return (url.indexOf("localhost") > -1 || url.indexOf("127.0.0.1") > -1) && url.indexOf(":3174") > 0
}

export function isDesktop() {
    //@ts-ignore
    return !!window.backgroundApi || !!window.__appApi;
}

export function formatDappUrl(dappUrl?: string) {
    if (!dappUrl) {
        return '';
    }
    return dappUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
}


export const addressToShortValue = (value: string, length = 4): string => {
    if (value.length > length * 2) {
        return value.slice(0, length) + '…' + value.slice(-length);
    } else {
        return value;
    }
};
export function currentTs() {
    return +new Date();
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

export function downloadFile(file: Blob, name: string) {
    const data = URL.createObjectURL(file);

    const link = document.createElement('a');
    link.href = data;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(data);
}

/**
 * Formats a timestamp into a human-readable string.
 * 
 * @param timestamp - The timestamp to format.
 * @param options - Additional `Intl.DateTimeFormatOptions` for formatting.
 * @returns The formatted date string, defaulting to `12/30/2024 12:30 PM`.
 */
export const formatTsToDate = (timestamp: number, options?: Intl.DateTimeFormatOptions) => {
    const date = new Date(timestamp);
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        ...options
    };

    const formattedDate = date.toLocaleString('en-US', defaultOptions);

    // Replace the default separator if needed (e.g., MM/DD/YYYY format to YYYY-MM-DD)
    return formattedDate.replace(',', '');
};

/**
 * 
 * @param timestamp 
 * @returns default: 12:30 PM
 */
export const formatTs = (timestamp: number,options?:Intl.DateTimeFormatOptions) => {
    const date = new Date(timestamp);
    const options1: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        ...options
    };
    const formattedDate: string = date.toLocaleString('en-US', options1);
    return formattedDate;
};

export function formatNumberWithComma(number: number): string {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function openWindow(url: string) {
    if(isDesktop()){
        if(url.endsWith(".zip")||url.endsWith(".dmg")||url.endsWith(".exe")){
            window.__appApi.message({
                action: 'openSystemBrowser',
                payload: { url }
            });
            return;
        }
        window.__appApi.message({
            action: 'openMainTabUrl',
            payload: { url }
        });
    }else{
        window.open(url);
    }
}

export function isIntel() {
    const userAgent = navigator.userAgent.toLowerCase();
    // Check for Mac but not ARM-based (e.g., Apple Silicon)
    return userAgent.includes("mac") && !userAgent.includes("arm") && !userAgent.includes("apple silicon");
}

export function isMac() {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes("mac");
}

export  function isWin32() {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes("win");
}

export function isLinux() {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes("linux");
}