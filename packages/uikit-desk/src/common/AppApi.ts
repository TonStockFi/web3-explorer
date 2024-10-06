export default class AppAPI {
    private api: any;

    static isInApp() {
        //@ts-ignore
        return !!window.__AndroidAPI;
    }

    constructor() {
        //@ts-ignore
        this.api = window.__AndroidAPI;
    }

    webview_is_ready(apiUrl: boolean, deviceId: string) {
        return this.api.webview_is_ready(apiUrl, deviceId);
    }

    check_service() {
        return this.api.check_service();
    }

    init_service(apiUrl: string, password: string, passwordHash: string) {
        return this.api.init_service(apiUrl, password, passwordHash);
    }

    stop_service() {
        return this.api.stop_service();
    }

    start_action(action: 'android.settings.ACCESSIBILITY_SETTINGS') {
        return this.api.start_action(action);
    }

    stop_input() {
        return this.api.stop_input();
    }

    show_toast(msg: string) {
        return this.api.show_toast(msg);
    }
}
