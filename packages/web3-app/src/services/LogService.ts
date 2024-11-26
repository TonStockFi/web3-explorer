let CacheMessageList: { message: string }[] = [];

export default class LogService {
    static handleConsoleLogMessage(tabId: string, { message }: { message: string }) {
        if (message.startsWith(' > ')) {
            const max = 100;

            CacheMessageList =
                CacheMessageList.length > max
                    ? [{ message }, ...CacheMessageList.slice(0, 100)]
                    : [{ message }, ...CacheMessageList];
            localStorage.setItem(`console_${tabId}`, JSON.stringify(CacheMessageList));
        }
    }
    static getConsoleLogMessage(tabId: string) {
        const res = localStorage.getItem(`console_${tabId}`);
        return res ? JSON.parse(res) : []
    }

    static clearConsoleLogMessage(tabId: string) {
        localStorage.removeItem(`console_${tabId}`);
    }
}
