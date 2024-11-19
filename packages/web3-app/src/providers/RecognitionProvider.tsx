import { useLocalStorageState, useSessionStorageState } from '@web3-explorer/utils';
import { createContext, ReactNode, useContext, useState } from 'react';
import { onAction } from '../common/electron';
import { isPlaygroundMaster } from '../common/helpers';
import { PAGE_ALL_ROI } from '../constant';

import ProService from '../services/ProService';
import RoiService, { RoiInfo } from '../services/RoiService';
import WebviewMainEventService from '../services/WebviewMainEventService';
import { AccountPublic, ProInfoProps } from '../types';
import { usePlayground } from './PlaygroundProvider';
import { usePro } from './ProProvider';

export const CacheImage: Map<string, string> = new Map();

export interface RoiRunInfo {
    matchedId?: string;
    matchPath?: string[];
    duration: number;
    total: number;
    inspectTotal: number;
    clickedTotal: number;
    matchedTotal: number;
    roiRunTimeTotal: number;
    matchRunTimeTotal: number;
}

interface AppContextType {
    roiRunInfo: RoiRunInfo | null;
    roiAreaList: RoiInfo[];
    onChangeRoiRunInfo: (roi: RoiRunInfo) => void;
    notifyTestRoi: (roi: RoiInfo) => void;
    notifyWindow: (action: string, payload?: any) => void;
    notifyWindows: (action: string, payload?: any) => void;
    loadCacheRoiList: (tabId: string, account?: AccountPublic) => Promise<RoiInfo[]>;
    onSelectPage: (page: string) => void;
    switchIsPage: (v: boolean) => void;
    isPage: boolean;
    selectedPage: string;
    selectedRoiId: string;
    screenPushDelayMs: number;
    recognitionCatId: string;
    startRecognition: boolean;
    showSettings: boolean;
    clickStopped: boolean;
    showAccounts: boolean;
    updateScreenPushDelayMs: (n: number, skipNotify?: boolean) => void;
    onSelectRoi: (id: string) => void;
    addRoiArea: (r: RoiInfo, cutImageUrl: string, catId: string) => void;
    removeRoiArea: (r: RoiInfo) => void;
    updateRoiArea: (r: RoiInfo) => void;
    getScreenImg: (tabId: string) => void;
    showRecognition: (catId: string) => void;
    onStartRecognition: (v: boolean) => void;
    onShowSettings: (v: boolean) => void;
    onShowAccounts: (v: boolean) => void;
    onStopClick: (v: boolean) => void;
}
export interface MatchResult {
    isMatched: boolean;
    roiInfo: RoiInfo;
    duration: number;
    threshold: number;
}

export const MatchResults: Map<string, MatchResult> = new Map();

const AppContext = createContext<AppContextType | undefined>(undefined);

export function parseRecognitionCatId(recognitionCatId: string) {
    const t = recognitionCatId.split('-');
    if (t.length < 3) {
        throw new Error('parseRecognitionCatId error:' + recognitionCatId);
    }
    const tabId = t[0];

    const accountIndex = Number(t[t.length - 1]); // Last part is the account index

    const accountId = t.slice(1, t.length - 1).join('-'); // Join everything between tabId and accountIndex
    // Validate parsed values
    if (!tabId || !accountId || isNaN(accountIndex)) {
        throw new Error('parseRecognitionCatId error: ' + recognitionCatId);
    }

    return { tabId, accountId, accountIndex };
}

export function getServiceId(recognitionCatId: string, proInfoList: ProInfoProps[]) {
    const { accountId, accountIndex, tabId } = parseRecognitionCatId(recognitionCatId);
    const currentProPlan = ProService.getCurrentPlan(proInfoList, accountId, accountIndex);
    // console.log('getServiceId', currentProPlan, tabId, accountId, accountIndex);
    if (currentProPlan && (currentProPlan.isLongProLevel || currentProPlan.plan)) {
        return `${tabId}`;
    } else {
        return `${tabId}-${accountId}-${accountIndex}`;
    }
}
export const RecognitionProvider = (props: { children: ReactNode }) => {
    const { proInfoList } = usePro();

    const { children } = props || {};
    const [isPage, setIsPage] = useState<boolean>(true);

    const [roiRunInfo, setRoiRunInfo] = useState<RoiRunInfo | null>(null);

    const [selectedRoiId, setSelectedRoiId] = useState<string>('');
    const { accounts, currentTabId, currentAccount } = usePlayground();
    const index = currentAccount?.index || 0;

    const [clickStopped, setClickStopped] = useState<boolean>(false);

    const [recognitionCatId, setRecognitionCatId] = useSessionStorageState(
        'recognitionCatId_' + index,
        ''
    );
    const [selectedPage, setSelectedPage] = useSessionStorageState(
        'selectedPage_' + index,
        PAGE_ALL_ROI
    );

    const [screenPushDelayMs, setScreenPushDelayMs] = useLocalStorageState(
        'pushDelayMs' + recognitionCatId,
        1000
    );
    const [roiAreaList, setRoiAreaList] = useState<RoiInfo[]>([]);

    const [startRecognition, setStartRecognition] = useLocalStorageState(
        'startRecognition_' + recognitionCatId + index,
        false
    );

    const [showAccounts, setShowAccounts] = useLocalStorageState(
        'showAccounts_' + recognitionCatId + index,
        false
    );

    const [showSettings, setShowSettings] = useLocalStorageState(
        'showSettings_' + recognitionCatId + index,
        false
    );

    const onSelectRoi = (id: string) => {
        setSelectedRoiId(i => {
            // if (id !== i && recognitionCatId) {
            //     getScreenImg(parseRecognitionCatId(recognitionCatId).tabId);
            // }
            return id;
        });
    };
    const onStopClick = (v: boolean) => {
        setClickStopped(v);
    };

    function notifyTestRoi(roi: RoiInfo) {
        notifyWindow('onTestRoiArea', { roi });
        window.dispatchEvent(
            new CustomEvent('onTestRoiArea', {
                detail: {
                    roi
                }
            })
        );
    }

    const getScreenImg = (tabId: string) => {
        notifyWindow('getScreenImage', { tabId });
    };

    const notifyWindow = (action: string, payload?: any) => {
        if (recognitionCatId) {
            const { accountIndex } = parseRecognitionCatId(recognitionCatId);
            const winId = WebviewMainEventService.getPlaygroundWinId({
                index: accountIndex,
                tabId: currentTabId
            });
            console.log('notifyWindow', action, winId);
            onAction('subWin', {
                toWinId: winId,
                action,
                payload: payload || {}
            });
        }
    };
    const notifyWindows = (action: string, payload?: any) => {
        //console.log("notifyWindows",{ currentTabId });
        if (!isPlaygroundMaster()) {
            return;
        }
        setRecognitionCatId((recognitionCatId: string) => {
            new WebviewMainEventService().notifyWindowAction({
                accounts,
                tabId: currentTabId,
                currentAccount,
                action,
                payload: {
                    ...(payload || {}),
                    tabId: currentTabId,
                    recognitionCatId
                }
            });
            return recognitionCatId;
        });
    };

    const loadCacheRoiList = async (recognitionCatId: string) => {
        // console.log('loadCacheRoiList', recognitionCatId);
        const rows = await new RoiService(getServiceId(recognitionCatId, proInfoList)).getAll();
        setRoiAreaList(() => rows);
        return rows;
    };
    const showRecognition = (recognitionCatId: string) => {
        if (!recognitionCatId) {
            setStartRecognition(() => false);
        } else {
            onStopClick(false);
        }
        setSelectedPage(PAGE_ALL_ROI);
        setRecognitionCatId(() => {
            return recognitionCatId;
        });
        setTimeout(() => {
            if (!recognitionCatId) {
                setRoiAreaList(() => []);
            } else {
                loadCacheRoiList(recognitionCatId);
            }
        }, 500);
    };

    const addRoiArea = async (r: RoiInfo, cutImageUrl: string, recognitionCatId: string) => {
        console.log('addRoiArea', { recognitionCatId, selectedRoiId });
        switchIsPage(false);
        const id = await new RoiService(getServiceId(recognitionCatId, proInfoList)).getId();
        const row: RoiInfo = { ...r, priority: 1000, id };
        CacheImage.set(`${recognitionCatId}_${row.id}`, cutImageUrl);
        new RoiService(getServiceId(recognitionCatId, proInfoList)).save(id, row, cutImageUrl);
        setRoiAreaList(prv => {
            return [row, ...prv.filter(row => r.id !== row.id)];
        });

        setRecognitionCatId(r => {
            return recognitionCatId;
        });
        setTimeout(() => {
            onSelectRoi(id);
        }, 400);

        notifyWindows('onUpdateRoi');
    };

    const updateRoiArea = (r: RoiInfo) => {
        setRecognitionCatId(recognitionCatId => {
            new RoiService(getServiceId(recognitionCatId, proInfoList)).update(r);
            setRoiAreaList(prv => {
                return prv.map(row => {
                    return row.id !== r.id ? row : r;
                });
            });
            notifyWindows('onUpdateRoi');
            return recognitionCatId;
        });
    };

    const removeRoiArea = (r: RoiInfo) => {
        setSelectedRoiId(prev => {
            return r.id === prev ? '' : prev;
        });
        new RoiService(getServiceId(recognitionCatId, proInfoList)).remove(r.id);
        setRoiAreaList(prv => {
            return prv.filter(row => row.id !== r.id);
        });
        notifyWindows('onUpdateRoi');
    };
    const updateScreenPushDelayMs = (v: number, skipNotify?: boolean) => {
        setScreenPushDelayMs(v);
        if (!skipNotify) {
            notifyWindows('onUpdateScreenPushDelayMs');
        }
    };
    const onStartRecognition = (v: boolean) => {
        setStartRecognition(v);
    };

    const onShowSettings = (v: boolean) => {
        setShowSettings(v);
    };

    const onShowAccounts = (v: boolean) => {
        setShowAccounts(v);
    };

    const onSelectPage = (v: string) => {
        setSelectedPage(v);
    };

    const switchIsPage = (v: boolean) => {
        setIsPage(v);
    };

    const onChangeRoiRunInfo = (v: RoiRunInfo) => {
        setRoiRunInfo(v);
    };

    return (
        <AppContext.Provider
            value={{
                onChangeRoiRunInfo,
                roiRunInfo,
                switchIsPage,
                isPage,
                onSelectPage,
                onStopClick,
                clickStopped,
                notifyTestRoi,
                getScreenImg,
                notifyWindows,
                notifyWindow,
                loadCacheRoiList,
                showAccounts,
                onShowAccounts,
                onShowSettings,
                showSettings,
                selectedPage,
                startRecognition,
                onStartRecognition,
                updateScreenPushDelayMs,
                screenPushDelayMs,
                onSelectRoi,
                selectedRoiId,
                updateRoiArea,
                removeRoiArea,
                addRoiArea,
                roiAreaList,
                recognitionCatId,
                showRecognition
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useRecognition = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useRecognition must be used within an RecognitionProvider');
    }
    return context;
};
