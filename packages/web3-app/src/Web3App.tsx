import { View } from '@web3-explorer/uikit-view';
import { useEffect, useState } from 'react';
import VerticalToggleButtons from './components/VerticalToggleButtons';
import { MAIN_NAV_TYPE } from './types';
import DevView from './pages/DevView';

export const Web3App = ({
    mainNavType,
    IS_DEV,
    setMainNavType
}: {
    IS_DEV?:boolean;
    setMainNavType: (v:MAIN_NAV_TYPE)=>void;
    mainNavType: MAIN_NAV_TYPE;
}) => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    //
    // const addTgMiniApp = useCallback(
    //     ({ url }: { url: string }) => {
    //         const deviceId = getDeviceIdFromUrl(url);
    //         // @ts-ignore
    //         setSites((prevSites: SiteInfo[]) => {
    //             const updatedSites = prevSites.filter(
    //                 (site: SiteInfo) => site.deviceId !== deviceId
    //             );
    //             console.log('>>>>', {
    //                 partitionId: currentTgSite.partitionId,
    //                 deviceId,
    //                 prevSites,
    //                 updatedSites
    //             });
    //             return [
    //                 {
    //                     partitionId: currentTgSite.partitionId,
    //                     deviceId,
    //                     url,
    //                     order: 0
    //                 },
    //                 ...updatedSites
    //             ];
    //         });
    //     },
    //     [currentTgSite.partitionId]
    // );

    useEffect(() => {
        const updateWindowSize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        window.addEventListener('resize', updateWindowSize);
        return () => {
            window.removeEventListener('resize', updateWindowSize);
        };
    }, []);
    const appOptions = { mainNavType, setMainNavType};
    return (
        <View empty>
            <VerticalToggleButtons IS_DEV={IS_DEV} options={appOptions} />
            {/*<View displayNone={mainNavType !== MAIN_NAV_TYPE.GAME_FI}>*/}
            {/*    <GameFiView*/}
            {/*        {...{*/}
            {/*            deleteSite,*/}
            {/*            activeTgSite,*/}
            {/*            tgSites,*/}
            {/*            topBarHeight,*/}
            {/*            sites,*/}
            {/*            currentTgSite,*/}
            {/*            addTgMiniApp,*/}
            {/*            windowSize*/}
            {/*        }}*/}
            {/*    />*/}
            {/*</View>*/}
            <View displayNone={mainNavType !== MAIN_NAV_TYPE.DEV}>
                <DevView />
            </View>
        </View>
    );
};
