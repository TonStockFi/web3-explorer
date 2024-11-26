
export const jsCodePrefix = `

function log (...args){
  console.log(' > ', ...args.map(arg => 
    typeof arg === 'object' && arg !== null ? JSON.stringify(arg) : arg
  ));
};

function waitForResult(cb, timeout = -1, interval = 1000) {
    const startTime = Date.now();

    return new Promise((resolve) => {
        const checkReply = async () => {
            try {
                const res = await Promise.resolve(cb()); // Ensure cb result is a Promise
                if (res) {
                    resolve(res);
                    return;
                }
                if (timeout > -1 && Date.now() - startTime > timeout) {
                    resolve(false);
                    return;
                }

                // Retry after interval
                setTimeout(checkReply, interval);
            } catch (error) {
                console.error("Error in waitForResult callback:", error);
                resolve(false);
            }
        };

        checkReply();
    });
}

`

export default class JsCodeService {
    static formatCode(code: string) {
        code = code.replace(/console\.log\(/g, "console.log(' > ',")
        return `
        ${jsCodePrefix}
        ${code}
        `
    }
}
