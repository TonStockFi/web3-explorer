import CloseIcon from '@mui/icons-material/Close';
import LoopIcon from '@mui/icons-material/Loop';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import { Header } from '@web3-explorer/uikit-desk';
import AvatarView from '@web3-explorer/uikit-desk/dist/components/AvatarView';
import TgSiteList from '@web3-explorer/uikit-desk/dist/components/TgSiteList';
import { View } from '@web3-explorer/uikit-view';
import { useState } from 'react';
import { sendClick } from '../common/webview';
import { SiteInfo } from '../types';
import {WebviewTag} from "electron";
import WebViewComponent from '../components/webview/WebViewComponent';

export default function GameFiView({
    deleteSite,
    activeTgSite,
    tgSites,
    topBarHeight,
    sites,
    currentTgSite,
    addTgMiniApp,
    windowSize
}: {
    deleteSite: any;
    activeTgSite: any;
    topBarHeight: number;
    tgSites: any[];
    sites: SiteInfo[];
    currentTgSite: any;
    addTgMiniApp: any;
    windowSize: any;
}) {
    const [showRightSide, setShowRightSide] = useState(false);
    const [showTgSites, setShowTgSites] = useState(false);
    const rows = sites.filter(site => site.partitionId === currentTgSite.partitionId);
    return (
        <View empty>
            <View absolute x={64} y={0} h={44} right={showRightSide ? 321 : 0}>
                <Header
                    title={'玩赚'}
                    rightNode={
                        currentTgSite && !showRightSide ? (
                            <View mr={2} h100p row aCenter>
                                <AvatarView full userId={currentTgSite.userId} />
                            </View>
                        ) : undefined
                    }
                    actions={[
                        {
                            hide: showRightSide,
                            title: '切换账户',
                            icon: showTgSites ? <CloseIcon /> : <LoopIcon />,
                            onClick: () => {
                                setShowTgSites(!showTgSites);
                                setShowRightSide(false);
                            }
                        },
                        {
                            hide: showTgSites || rows.length === 0,
                            title: '游戏中心',
                            icon: showRightSide ? <CloseIcon /> : <VideogameAssetIcon />,
                            onClick: () => {
                                setShowTgSites(false);
                                setShowRightSide(!showRightSide);
                            }
                        }
                    ]}
                />
            </View>
            <View
                absolute
                x={64}
                y={58}
                right={showRightSide ? 321 : showTgSites ? 320 : 0}
                bottom={0}
                row
                jStart={rows.length > 1}
                jCenter={rows.length <= 1}
                sx={{ flexWrap: 'wrap' }}
                overflowYAuto
            >
                {rows.map(({ url }, i) => {
                    return (
                        <View key={i} ml12 mb12>
                            <WebViewComponent
                                webviewWidth={320}
                                webviewHeight={640}
                                url={url}
                                partitionId={currentTgSite.partitionId}
                                topBarHeight={topBarHeight}
                            />
                        </View>
                    );
                })}

                <View
                    h100p
                    center
                    hide={rows.length > 0}
                    buttonProps={{
                        startIcon: showRightSide ? <CloseIcon /> : <VideogameAssetIcon />
                    }}
                    onClick={() => {
                        setShowTgSites(false);
                        setShowRightSide(!showRightSide);
                    }}
                    button={'游戏中心'}
                />
            </View>

            <View displayNone={!showRightSide} absolute y={0} right={0} bottom={0} w={320}>
                {tgSites.map(tgSite => {
                    const hide = tgSite.partitionId !== currentTgSite.partitionId;
                    return (
                        <View hide={hide} key={tgSite.partitionId}>
                            <WebViewComponent
                                webviewProps={{
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
                                        console.log(action);
                                        if (action === 'onTgWebIframe') {
                                            await sendClick(webview, 25, 25);
                                            addTgMiniApp(payload!.url);
                                        }
                                    }
                                }}
                                tgUserId={currentTgSite.userId}
                                noInfo={true}
                                canCut={true}
                                canDelete={true}
                                topBarHeight={topBarHeight}
                                webviewWidth={320}
                                webviewHeight={windowSize.height - topBarHeight}
                                windowSize={windowSize}
                                url={'https://web.telegram.org/a/'}
                                partitionId={tgSite.partitionId}
                            />
                        </View>
                    );
                })}
            </View>

            <View absolute w={!showTgSites ? 0 : 320} y={48} right={0} bottom={0} overflowYAuto>
                <TgSiteList
                    tgSites={tgSites}
                    currentSite={currentTgSite}
                    setCurrentSite={(site: any) => {
                        activeTgSite(site.partitionId);
                        setShowTgSites(false);
                    }}
                />
            </View>
        </View>
    );
}
