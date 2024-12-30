import { ConfirmationDialogProps } from '@web3-explorer/uikit-view/dist/View/types';
import { START_URL } from '../constant';
import { WebApp } from '../types';
import WebviewService from './WebviewService';

export default class WebviewServiceHook extends WebviewService {
    openTabFromWebview?: (item: WebApp) => void;
    closeTab?: (tabId: string) => void;
    isMain?: boolean;
    showConfirm: ((confirm: ConfirmationDialogProps | boolean) => void) | undefined;

    constructor(
        tabId: string,
        options: {
            showConfirm?:(confirm:ConfirmationDialogProps|boolean)=>void;
            openTabFromWebview?: (item: WebApp) => void;
            isMain?: boolean;
            closeTab?: (tabId: string) => void;
        }
    ) {
        super(tabId);
        this.showConfirm = options.showConfirm;
        this.isMain = options.isMain;
        this.openTabFromWebview = options.openTabFromWebview;
        this.closeTab = options.closeTab;
    }

    handleWebveiw() {
        const url = this.getWebviewUrl();
        if (url !== START_URL) {
            const { uri } = this.getWebviewUrlUri();
           
            if (uri.host == 't.me') {
                if (this.isMain) {
                    this.openTabFromWebview &&
                        this.openTabFromWebview({
                            url,
                            name: '',
                            description: '',
                            icon: ''
                        });
                    this.goBack()
                } else {

                }
            }
        }
    }
}
