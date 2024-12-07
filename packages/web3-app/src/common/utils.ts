export function getPartitionKey(key: string) {
    return `persist:${key}`;
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

export function isDesktop() {
    //@ts-ignore
    return !!window.backgroundApi;
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
