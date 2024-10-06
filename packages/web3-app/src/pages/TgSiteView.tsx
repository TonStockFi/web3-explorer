import { View } from '@web3-explorer/uikit-view';
import { getAvatar, getTgAuthInfo, getTgGlobalState } from '../common/webview';
import {WebviewTag} from "electron";
import { useActiveAccount } from '@tonkeeper/uikit/dist/state/wallet';
import { useEffect, useState } from 'react';
import TgUserService, { UserInfo } from '@web3-explorer/uikit-desk/dist/common/TgUserService';
import Loading from '@web3-explorer/uikit-mui/dist/components/Loading';
import WebViewComponent from '../components/webview/WebViewComponent';

export function TgSiteView() {
    const [tgAuthSites, setTgAuthSites] = useState<UserInfo[] | undefined>(undefined);
    const [currentSite, setCurrentSite] = useState<undefined | UserInfo>(undefined);
    const [partitionId, setPartitionId] = useState('');
    const account = useActiveAccount();
    const { id: walletAccountId } = account;
    useEffect(() => {
        if (!tgAuthSites) {
            TgUserService.getAll().then((res: UserInfo[]) => {
                setTgAuthSites(res);
            });
        }
    }, [tgAuthSites]);
    useEffect(() => {
        if (!tgAuthSites) {
            return;
        }
        let currentSite, partitionId;
        if (tgAuthSites.length > 0) {
            currentSite = tgAuthSites.find(site => site.walletAccountId === walletAccountId);
            if (currentSite) {
                setCurrentSite(currentSite);
                partitionId = currentSite.partitionId;
            } else {
                partitionId = localStorage.getItem('partitionId_new');
            }
        } else {
            partitionId = localStorage.getItem('partitionId_new');
        }
        if (!partitionId) {
            partitionId = `p_tg_${+new Date()}`;
            localStorage.setItem('partitionId_new', partitionId);
        }
        setPartitionId(partitionId);
    }, [walletAccountId, tgAuthSites]);

    useEffect(() => {
        if (currentSite && currentSite.walletAccountId !== walletAccountId) {
            setCurrentSite(undefined);
        }
    }, [walletAccountId, currentSite]);
    const onSiteMessage = async (
        {
            action
        }: {
            action: string;
        },
        webview: WebviewTag
    ) => {
        //console.log('tgSiteView', action, walletAccountId);
        if (action === 'onTgWebLogged') {
            if(!tgAuthSites){
                return;
            }
            const authInfo = await getTgAuthInfo(webview);
            if (!authInfo) {
                return;
            }
            const { userId } = authInfo;
            if (userId) {
                const exists = tgAuthSites.find(row => row.userId === userId);

                if (
                    exists &&
                    !!exists.walletAccountId &&
                    exists.walletAccountId !== walletAccountId
                ) {
                    await webview.executeJavaScript(
                        `alert("此帐号已绑定，请换一个帐号！");localStorage.clear();location.reload()`
                    );
                    return;
                }

                if (!currentSite) {
                    localStorage.removeItem('partitionId_new');
                }
                const state = await getTgGlobalState(webview);
                let user, avatar;
                if (state) {
                    user = state.users.byId[userId];
                    if (user && user.avatarPhotoId) {
                        avatar = await getAvatar(userId, user.avatarPhotoId, webview);
                    }
                }

                if (user) {
                    const site = await new TgUserService(userId).save(
                        {
                            userId,
                            walletAccountId,
                            partitionId: partitionId,
                            firstName: user.firstName,
                            phoneNumber: user.phoneNumber
                        },
                        avatar
                    );
                    if (!exists) {
                        setTgAuthSites([site, ...tgAuthSites]);
                    } else {
                        setTgAuthSites(
                            tgAuthSites.map(row => {
                                if (row.userId === userId) {
                                    return site;
                                }
                                return row;
                            })
                        );
                    }

                    setCurrentSite(site);
                }
            }
        }
    };
    if (partitionId === '') {
        return (
            <View wh100p center>
                <Loading />
            </View>
        );
    }

    return (
        <View wh100p center _D0={{ walletAccountId, tgAuthSites, currentSite, partitionId }}>
            {[partitionId].map(partitionId => {
                return (
                    <View key={partitionId}>
                        <WebViewComponent
                            deleteTgSite={(userId: string) => {
                                //console.log({ userId });
                                if(!tgAuthSites) return;
                                const user = tgAuthSites.find(row => row.userId === userId);
                                if (user) {
                                    const newUser = { ...user, walletAccountId: '' };
                                    new TgUserService(userId).update(newUser).then(() => {
                                        setPartitionId("");
                                        setCurrentSite(undefined);
                                        setTgAuthSites(undefined);
                                    });
                                }
                            }}
                            canDelete={!!currentSite}
                            webviewProps={{
                                onSiteMessage
                            }}
                            topBar
                            tgUserId={currentSite?.userId || undefined}
                            webviewHeight={720}
                            webviewWidth={320}
                            url={'https://web.telegram.org/a/'}
                            partitionId={partitionId}
                        />
                    </View>
                );
            })}
        </View>
    );
}
