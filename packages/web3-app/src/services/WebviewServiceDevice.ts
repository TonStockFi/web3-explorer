import WebviewService from './WebviewService';

export default class WebviewServiceDevice extends WebviewService {
    constructor(tabId: string) {
        super(tabId);
    }
    onWsAction(action: 'GLOBAL_ACTION' | 'CLICK' | 'EVENT', payload?: any) {
        return this.dispatchEvent('onWsAction', {
            action,
            payload
        });
    }
}
