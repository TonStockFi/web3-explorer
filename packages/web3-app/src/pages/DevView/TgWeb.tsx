import TextField from '@web3-explorer/uikit-mui/dist/mui/TextField';
import { View } from '@web3-explorer/uikit-view';
import { useLocalStorageState } from '@web3-explorer/utils';
import { WebviewTag } from 'electron';
import React from 'react';
import { getPartitionKey } from '../../common/utils';

import WebViewBrowser from '../../components/webview/WebViewBrowser';
import WebviewService from '../../services/WebviewService';

export const TgWeb = () => {
    const [webview, setWebView] = React.useState<null | WebviewTag>(null);
    const [jsCode, setJsCode] = useLocalStorageState<string>('jsCode', '');
    const [content, setContent] = React.useState<string | any>('');

    return (
        <View row>
            <View mr12>
                <View w={360} h={720} borderRadius={8} overflowHidden bgColor="white">
                    <WebViewBrowser
                        tabId="test"
                        url={'https://web.telegram.org/a/'}
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
                                    await new WebviewService('test').sendClickEvent(25, 25);
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
            </View>
            <View hide={!webview}>
                <View row>
                    <View
                        mb12
                        mr12
                        buttonVariant="contained"
                        button="AuthInfo"
                        onClick={async () => {
                            // const authInfo = await getTgAuthInfo(webview!);
                            // //console.log(authInfo);
                            // const { userId } = authInfo;
                            // const state = await getTgGlobalState(webview!);
                            // let user, avatar;
                            // if (state) {
                            //     user = state.users.byId[userId];
                            //     if (user.avatarPhotoId) {
                            //         avatar = await getAvatar(userId, user.avatarPhotoId, webview!);
                            //     }
                            // }
                            // setContent({ authInfo, user, avatar });
                        }}
                    />

                    <View
                        mb12
                        buttonVariant="contained"
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
                        buttonVariant="contained"
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
                        buttonVariant="contained"
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
                        buttonVariant="contained"
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
                <View column>
                    <View>
                        <View
                            mb12
                            mr12
                            buttonVariant="contained"
                            button="Auth"
                            onClick={async () => {
                                if (!jsCode)
                                    setJsCode(`
localStorage.setItem("dc","5")
localStorage.setItem("dc5_hash",'""')
localStorage.setItem("dc5_auth_key",'""')
localStorage.setItem("user_auth",'{"dcID":5,"id":""}')
                                    `);
                            }}
                        />
                    </View>
                    <View mb12>
                        <TextField
                            sx={{ width: '100%' }}
                            id="filled-multiline-flexible"
                            label="JsCode"
                            multiline
                            value={jsCode}
                            onChange={e => {
                                setJsCode(e.target.value);
                            }}
                            rows={8}
                            variant="filled"
                        />
                    </View>
                    <View
                        mb12
                        mr12
                        buttonVariant="contained"
                        button="Run Js Code"
                        onClick={async () => {
                            webview!.executeJavaScript(`(()=>{${jsCode}})()`).then(setContent);
                        }}
                    />
                </View>
                <View h={250} sx={{ flex: 1 }} overflowYAuto hide={!content} mb12 json={content} />
            </View>
        </View>
    );
};
