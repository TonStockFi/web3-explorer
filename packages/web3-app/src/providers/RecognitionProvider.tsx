import { useLocalStorageState } from '@web3-explorer/utils';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { onAction } from '../common/electron';
import { isPlaygroundMaster } from '../common/helpers';
import ProService from '../services/ProService';
import RoiService, { RoiInfo } from '../services/RoiService';
import WebviewMainEventService from '../services/WebviewMainEventService';
import { AccountPublic, ProInfoProps } from '../types';
import { usePlayground } from './PlaygroundProvider';
import { usePro } from './ProProvider';

interface AppContextType {
    roiAreaList: RoiInfo[];
    notifyTestRoi: (roi: RoiInfo) => void;
    notifyWindow: (action: string, payload?: any) => void;
    notifyWindows: (action: string, payload?: any) => void;
    loadCacheRoiList: (tabId: string, account?: AccountPublic) => Promise<RoiInfo[]>;

    selectedRoiId: string;
    screenPushDelayMs: number;
    recognitionCatId: string;
    startRecognition: boolean;
    showSettings: boolean;
    clickStopped: boolean;
    showAccounts: boolean;
    updateScreenPushDelayMs: (n: number, skipNotify?: boolean) => void;
    onSelectRoi: (id: string) => void;
    addRoiArea: (r: RoiInfo, cutImageUrl: string) => void;
    removeRoiArea: (r: RoiInfo) => void;
    updateRoiArea: (r: RoiInfo) => void;
    getScreenImg: (tabId: string) => void;
    showRecognition: (currentCatId: string) => void;
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

export function getServiceId(
    {
        tabId,
        accountId,
        accountIndex
    }: {
        tabId: string;
        accountIndex: number;
        accountId: string;
    },
    proInfoList: ProInfoProps[]
) {
    const currentProPlan = ProService.getCurrentPlan(proInfoList, accountId, accountIndex);
    console.log('getServiceId', currentProPlan, tabId, accountId, accountIndex);
    if (currentProPlan && (currentProPlan.isLoginProLevel || currentProPlan.plan)) {
        return `${tabId}`;
    } else {
        return `${tabId}_${accountId}_${accountIndex}`;
    }
}
export const RecognitionProvider = (props: { children: ReactNode }) => {
    const { proInfoList } = usePro();

    const { children } = props || {};
    const [selectedRoiId, setSelectedRoiId] = useState<string>('');
    const { accounts, currentTabId, currentAccount } = usePlayground();
    const index = currentAccount?.index || 0;

    const [clickStopped, setClickStopped] = useState<boolean>(false);

    const [recognitionCatId, setRecognitionCatId] = useLocalStorageState(
        'recognitionCatId' + index,
        ''
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

    useEffect(() => {
        showRecognition(recognitionCatId);
    }, [recognitionCatId]);

    const onSelectRoi = (id: string) => {
        setSelectedRoiId(i => {
            console.log('onSelectRoi', { id, i, currentAccount, recognitionCatId });
            if (id !== i) {
                getScreenImg(recognitionCatId);
            }
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
        if (currentAccount?.index !== undefined && recognitionCatId) {
            const winId = WebviewMainEventService.getPlaygroundWinId({
                index: currentAccount?.index,
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
        new WebviewMainEventService().notifyWindowAction({
            accounts,
            tabId: currentTabId,
            currentAccount,
            action,
            payload: {
                ...(payload || {}),
                tabId: currentTabId
            }
        });
    };
    const loadCacheRoiList = async (tabId: string, account?: AccountPublic) => {
        console.log('loadCacheRoiList', tabId, currentAccount);
        let currentAccount_ = account || currentAccount;
        if (!currentAccount_) {
            return [];
        }
        const rows = await new RoiService(
            getServiceId(
                {
                    tabId,
                    accountId: currentAccount_?.id,
                    accountIndex: currentAccount_.index
                },
                proInfoList
            )
        ).getAll();
        rows.sort((a, b) => b.ts - a.ts);
        setRoiAreaList(() => rows);
        return rows;
    };
    const showRecognition = (tabId: string) => {
        if (!tabId) {
            setStartRecognition(() => false);
        } else {
            onStopClick(false);
        }
        setRecognitionCatId(() => {
            return tabId;
        });
        setTimeout(() => {
            if (!tabId) {
                setRoiAreaList(() => []);
            } else {
                console.log('loadCacheRoiList', { tabId });
                loadCacheRoiList(tabId);
            }
        }, 500);
    };

    const addRoiArea = async (r: RoiInfo, cutImageUrl: string) => {
        console.log('addRoiArea', { recognitionCatId, selectedRoiId });
        const id = await new RoiService(
            getServiceId(
                {
                    tabId: r.catId,
                    accountId: r.accountId,
                    accountIndex: r.accountIndex
                },
                proInfoList
            )
        ).getId();
        const row: RoiInfo = { ...r, priority: 0, id };
        await new RoiService(
            getServiceId(
                {
                    tabId: r.catId,
                    accountId: r.accountId,
                    accountIndex: r.accountIndex
                },
                proInfoList
            )
        ).save(id, row, cutImageUrl);

        if (!recognitionCatId) {
            const rows = await new RoiService(
                getServiceId(
                    {
                        tabId: r.catId,
                        accountId: r.accountId,
                        accountIndex: r.accountIndex
                    },
                    proInfoList
                )
            ).getAll();
            setRoiAreaList(prv => {
                return rows;
            });
            setRecognitionCatId(r.catId);
            getScreenImg(r.catId);
        } else {
            setRoiAreaList(prv => {
                return [row, ...prv];
            });
        }

        setTimeout(() => {
            onSelectRoi(id);
        }, 400);

        notifyWindows('onUpdateRoi');
    };

    const updateRoiArea = (r: RoiInfo) => {
        new RoiService(
            getServiceId(
                {
                    tabId: r.catId,
                    accountId: r.accountId,
                    accountIndex: r.accountIndex
                },
                proInfoList
            )
        ).update(r);
        setRoiAreaList(prv => {
            return prv.map(row => {
                return row.id !== r.id ? row : r;
            });
        });
        notifyWindows('onUpdateRoi');
    };

    const removeRoiArea = (r: RoiInfo) => {
        setSelectedRoiId(prev => {
            return r.id === prev ? '' : prev;
        });
        new RoiService(
            getServiceId(
                {
                    tabId: r.catId,
                    accountId: r.accountId,
                    accountIndex: r.accountIndex
                },
                proInfoList
            )
        ).remove(r.id);
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
    return (
        <AppContext.Provider
            value={{
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
