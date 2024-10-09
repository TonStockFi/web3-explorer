import { View } from "@web3-explorer/uikit-view";
import { getAvatar, sendToSiteMessage } from "../common/webview";
import { WebviewTag } from "electron";
import { useActiveAccount } from "@tonkeeper/uikit/dist/state/wallet";
import { useEffect, useState } from "react";
import TgUserService, { UserInfo } from "../common/TgUserService";
import Loading from "@web3-explorer/uikit-mui/dist/components/Loading";
import WebViewComponent from "../components/webview/WebViewComponent";
import { AccountMAM } from "@tonkeeper/core/dist/entries/account";
import { useIAppContext } from "@web3-explorer/uikit-mui/dist/provider/IAppProvider";
import { useTranslation } from "@tonkeeper/uikit/dist/hooks/translation";

export function TgSiteView() {
    const {t} = useTranslation()
    const [tgAuthSites, setTgAuthSites] = useState<UserInfo[] | undefined>(undefined);
    const [currentSite, setCurrentSite] = useState<undefined | UserInfo>(undefined);
    const [partitionId, setPartitionId] = useState('');
    const account = useActiveAccount() as AccountMAM;
    const activeDerivationIndex = account.activeDerivationIndex
    const {showAlert,showSnackbar} = useIAppContext()
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
            currentSite = tgAuthSites.find(site => (site.walletAccountId === walletAccountId && site.index === activeDerivationIndex));
            if (currentSite) {
                setCurrentSite(currentSite);
                partitionId = currentSite.partitionId;
            } else {
                setCurrentSite(undefined);
                partitionId = localStorage.getItem('partitionId_new');
            }
        } else {
            setCurrentSite(undefined);
            partitionId = localStorage.getItem('partitionId_new');
        }
        if (!partitionId) {
            setCurrentSite(undefined);
            partitionId = `p_tg_${+new Date()}`;
            localStorage.setItem('partitionId_new', partitionId);
        }
        setPartitionId(partitionId);
    }, [walletAccountId,activeDerivationIndex, tgAuthSites]);

    const onSiteMessage = async (
        {
            action,
            payload
        }: {
            action: string;
            payload?: Record<string, any> | undefined;
            },
        webview: WebviewTag
    ) => {
        console.log('onSiteMessage', action, payload);
        if (action === 'onTgWebLogged') {
            if(!tgAuthSites){
                return;
            }
            const { user } = payload as {user:{phoneNumber:string,firstName:string,avatarPhotoId?:string,id:string}};
            if (user) {
                const userId = user.id
                const existsUser = tgAuthSites.find(row => row.userId === userId);
                console.log("existsUser",existsUser)
                if (existsUser && existsUser.partitionId !== partitionId) {
                    showAlert({message:t(`tg_account_exists_alert`,{index:existsUser.index + 1})})
                    await sendToSiteMessage(webview,"tgLogout",{})
                    return;
                }

                let avatar;
                if (user && user.avatarPhotoId) {
                    avatar = await getAvatar(userId, user.avatarPhotoId, webview);
                }
                console.log("user",user,{avatar:!!avatar})
                if (user) {
                    const site = await new TgUserService(userId).save(
                        {
                            index: activeDerivationIndex,
                            userId,
                            walletAccountId,
                            partitionId: partitionId,
                            firstName: user.firstName,
                            phoneNumber: user.phoneNumber
                        },
                        avatar
                    );
                    if (!existsUser) {
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
                if (!currentSite) {
                    localStorage.removeItem('partitionId_new');
                }
            }
            await sendToSiteMessage(webview,"tgLogged",{})
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
        <View wh100p center _D={{activeDerivationIndex, tgAuthSites, currentSite, partitionId }}>
            {[partitionId].map(partitionId => {
                return (
                    <View key={partitionId}>
                        <WebViewComponent
                            deleteTgSite={(userId: string) => {
                                //console.log({ userId });
                                if(!tgAuthSites) return;
                                const user = tgAuthSites.find(row => row.userId === userId);
                                if (user) {
                                    const newUser = { ...user,partitionId:"",index:-1, walletAccountId: '' };
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
                            webviewHeight={700}
                            webviewWidth={380}
                            url={'https://web.telegram.org/a/'}
                            partitionId={partitionId}
                            index={activeDerivationIndex}
                        />
                    </View>
                );
            })}
        </View>
    );
}
