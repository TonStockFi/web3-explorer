import { View } from '@web3-explorer/uikit-view';
import * as React from 'react';
import { getPartitionKey } from '../../common/utils';
import { getAvatar, getTgAuthInfo, getTgGlobalState, sendClick } from '../../common/webview';
import WebViewComponent from '../../components/webview/WebViewComponent';
import {WebviewTag} from "electron";

export function Google() {
    return <Webview url="https://www.google.com" />;
}

export function Twitter() {
    return <Webview url="https://www.twitter.com" />;
}

export function Discord() {
    return <Webview url="https://www.discord.com" />;
}

export function Youtube() {
    return <Webview url="https://www.youtube.com" />;
}

function Webview({ url, partitionId }: { partitionId?: string; url: string }) {
    return (
        <WebViewComponent
            webviewProps={{}}
            topBar
            partitionId={partitionId}
            webviewHeight={640}
            webviewWidth={360}
            url={url}
        />
    );
}

export const WebView1 = () => {
    return (
        <WebViewComponent
            webviewProps={{}}
            topBar
            webviewHeight={640}
            webviewWidth={360}
            url={'https://ton-connect.github.io/demo-dapp-with-react-ui/'}
        />
    );
};

export const TgWeb = () => {
    const [webview, setWebView] = React.useState<null | WebviewTag>(null);
    const [content, setContent] = React.useState<string | any>('');

    return (
        <View row>
            <View mr12>
                <WebViewComponent
                    topBar
                    url={'https://web.telegram.org/a/'}
                    webviewHeight={640}
                    webviewWidth={360}
                    partitionId={getPartitionKey('test')}
                    webviewProps={{
                        onReady: async (webview: WebviewTag) => {
                            setWebView(webview);
                        },
                        onSiteMessage: async (
                            {
                                action,
                                payload
                            }: {
                                action: string;
                                payload?: Record<string, any>;
                            },
                            webview: WebviewTag
                        ) => {
                            console.log(action, payload);
                            if (action === 'onTgWebIframe') {
                                await webview.executeJavaScript(
                                    "document.querySelector('#portals iframe').src='about:blank'"
                                );
                                await sendClick(webview, 25, 25);
                                setContent(payload);
                            }
                            if (action === 'onTgWebLogged') {
                                setContent({ action, payload });
                            }
                            if (action === 'onTgWebLogout') {
                                setContent({ action });
                            }
                        }
                    }}
                />
            </View>
            <View hide={!webview}>
                <View row>
                    <View
                        mb12
                        mr12
                        button="AuthInfo"
                        onClick={async () => {
                            const authInfo = await getTgAuthInfo(webview!);
                            console.log(authInfo);
                            const { userId } = authInfo;
                            const state = await getTgGlobalState(webview!);
                            let user, avatar;
                            if (state) {
                                user = state.users.byId[userId];
                                if (user.avatarPhotoId) {
                                    avatar = await getAvatar(userId, user.avatarPhotoId, webview!);
                                }
                            }
                            setContent({ authInfo, user, avatar });
                        }}
                    />

                    <View
                        mb12
                        mr12
                        button="Alert"
                        onClick={async () => {
                            webview!
                                .executeJavaScript(
                                    `(()=>{
                                    alert("Alert");
                                    localStorage.clear();
                                    location.reload();
                            })()`
                                )
                                .then(setContent);
                        }}
                    />
                    <View
                        mb12
                        mr12
                        button="BtnOffset"
                        onClick={async () => {
                            webview!
                                .executeJavaScript(
                                    `(()=>{
                            const button = document.querySelector(".middle-column-footer-button-container")
                            let rect;
                            if (button) {
                                const {top,left,width,height}  = button.getBoundingClientRect();
                                rect = {top,left,width,height}
                            }
                            return {button:!!button,rect};
                            })()`
                                )
                                .then(setContent);
                        }}
                    />

                    <View
                        mb12
                        mr12
                        button="WinSize"
                        onClick={async () => {
                            webview!
                                .executeJavaScript(
                                    `(()=>{
                            return {height:window.innerHeight,width:window.innerWidth};
                            })()`
                                )
                                .then(setContent);
                        }}
                    />

                    <View
                        mb12
                        mr12
                        button="Load P2E"
                        onClick={async () => {
                            //webview.loadURL("https://web.telegram.org/a/#?tgaddr=tg%3A%2F%2Fresolve%3Fdomain%3Dcatizenbot%26appname%3Dbombie%26startapp%3Dg_1002_363733")
                            //webview.loadURL("https://t.me/catizenbot/gameapp?startapp=rp_1363734")

                            webview!
                                .executeJavaScript(
                                    `
                            (()=>{
                                const currentUrl = window.location.href.split('#')[0];
                                //const newHash = '#7363481027';
                                const newHash = '#7093172032';
                                history.replaceState(null, '',currentUrl + newHash);
                                location.reload()
                                return {url:currentUrl + newHash}
                            })()
                        `
                                )
                                .then(setContent);
                        }}
                    />
                </View>
                <View hide={!content} mb12 json={content} />
            </View>
        </View>
    );
};

export function Sites() {
    return (
        <View absFull top={70} row jStart fWrap h100p overflowYAuto w100p bottom={24}>
            <View mr12 mb12>
                <Google />
            </View>
            <View mr12 mb12>
                <Youtube />
            </View>
            <View mr12 mb12>
                <Discord />
            </View>
            <View mr12 mb12>
                <Twitter />
            </View>
        </View>
    );
}

export const WebView3 = () => {
    React.useEffect(() => {
        window.backgroundApi && window.backgroundApi
            .message({
                king: 'onAction',
                payload: {
                    action: 'getEnv'
                }
            })
            .then(console.log);
    }, []);

    //https://web.telegram.org/a/#7363481027
    return (
        <View row>
            <View mr12>
                <WebViewComponent
                    url={'https://www.ip133.com/'}
                    topBar
                    webviewHeight={640}
                    webviewWidth={360}
                    webviewProps={{
                        insertCss: `.header,.groups,.module,.search,.ft,.footer{display:none!important}`,
                        insertJs: `console.log("insertJs")`,
                        onReady: async (webview: WebviewTag) => {
                            console.log('onReady', webview.getWebContentsId());
                        }
                    }}
                />
            </View>
            <View mr12>
                <WebViewComponent
                    url={'https://ifconfig.me/all.json'}
                    topBar
                    webviewHeight={640}
                    webviewWidth={360}
                    webviewProps={{
                        insertCss: `body{color:white}`
                    }}
                />
            </View>
        </View>
    );
};
