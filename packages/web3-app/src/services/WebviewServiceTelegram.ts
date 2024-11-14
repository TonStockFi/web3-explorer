import { sleep } from '../common/utils';
import WebviewService from './WebviewService';


export default class WebviewServiceTelegram extends WebviewService {

    async getIframeUrl(){
        const ws = this;

        if (!ws.getWebview()) {
            return;
        }

        const iframeUrl = await ws.waitForTgIframeUrl();
        console.log('get iframe url', iframeUrl);
        return iframeUrl

    }
    async handleItem(){
        const ws = this;

        if (!ws.getWebview()) {
            return;
        }
        await ws.execJs(
            ` document.querySelectorAll(".Message").forEach(row=>row.style.display = "none")`
        );
        const res1 = await ws.getElemenBoundingClientRect('button.join-subscribe-button');
        console.log('>> button.join-subscribe-button', res1);
        if (res1) {
            await ws.sendClickEventAtRect(res1);
        }
        const res = await ws.waitForElemenBoundingClientRect(`#editable-message-text`);
        console.log('#editable-message-text', res);
        if (res) {
            await ws.sendClickEvent(res.left + res.width / 2, res.top + res.height / 2);
            await sleep(100);
            ws.insertText("");
            await sleep(100);
            const res1 = await ws.waitForElemenBoundingClientRect(`.main-button.send`);
            if (res1) {
                await ws.execJs(
                    ` document.querySelectorAll(".Message").forEach(row=>row.style.display = "none")`
                );

                await ws.sendClickEvent(res1.left + 20, res1.top + 10);

                const iframeUrl = await ws.waitForTgIframeUrl();
                console.log('get iframe url', iframeUrl);
            }
        }
        await sleep(2000);
    }
    
}
