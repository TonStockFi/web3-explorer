import { View } from '@web3-explorer/uikit-view';
import { useEffect, useState } from 'react';
import VerticalToggleButtons from './components/VerticalToggleButtons';
import { MAIN_NAV_TYPE } from './types';
import DevView from './pages/DevView';
import Backdrop from '@web3-explorer/uikit-mui/dist/mui/Backdrop';
import CircularProgress from '@web3-explorer/uikit-mui/dist/mui/CircularProgress';
import Snackbar from '@web3-explorer/uikit-mui/dist/mui/Snackbar';
import { useIAppContext } from '@web3-explorer/uikit-mui';
import { useTranslation } from "@tonkeeper/uikit/dist/hooks/translation";

export const Web3App = ({
    mainNavType,
    IS_DEV,
    setMainNavType
}: {
    IS_DEV?: boolean;
    setMainNavType: (v: MAIN_NAV_TYPE) => void;
    mainNavType: MAIN_NAV_TYPE;
}) => {
    const {t} = useTranslation()
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });
    const { alert,showAlert,backdrop, snackbar, showSnackbar } = useIAppContext();

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
    const appOptions = { mainNavType, setMainNavType };
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
            <Backdrop
                sx={theme => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={Boolean(backdrop)}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Snackbar
                anchorOrigin={{vertical:"bottom",horizontal:"right"}}
                open={Boolean(snackbar)}
                autoHideDuration={3000}
                onClose={() => {
                    showSnackbar(false);
                }}
                message={snackbar ? snackbar.message : ''}
            />
            <View confirm={{
              id: "alert",
              title: t("Alert"),
              content: alert ? alert.message:"",
              open: Boolean(alert),
              cancelTxt:Boolean(alert && alert.cancelTxt) ? alert!.cancelTxt : t("OK"),
              onCancel: () => {
                showAlert(false)
              },
            }}/>
        </View>
    );
};
