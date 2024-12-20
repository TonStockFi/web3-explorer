import { useLocalStorageState, useSessionStorageState } from '@web3-explorer/utils';
import { createContext, ReactNode, useContext, useState } from 'react';
import { onAction } from '../common/electron';
import { isPlaygroundMaster } from '../common/helpers';
import { ENTRY_ID_ROI, MARK_ID_ROI, TASK_ID_ROI } from '../constant';

import ProService from '../services/ProService';
import RoiService from '../services/RoiService';
import WebviewMainEventService from '../services/WebviewMainEventService';
import { PlaygroundMasterSideAction, ProInfoProps, RoiInfo, SUB_WIN_ID } from '../types';
import { getRecoId, usePlayground } from './PlaygroundProvider';
import { usePro } from './ProProvider';

export const CacheImage: Map<string, string> = new Map();

export interface RoiRunInfo {
    matchPath?: string[];
    ts: number;
    matchedIds?: string[];
}

interface AppContextType {
    roiRunInfo: RoiRunInfo | null;
    currentDecision: RoiRunInfo | null;
    roiAreaList: RoiInfo[];
    isPage: boolean;
    showScreenMirror: boolean;
    selectedPage: string;
    selectedRoiId: string;
    selectedTaskId: string;
    screenPushDelayMs: number;
    recognitionCatId: string;
    startRecognition: boolean;
    showSettings: boolean;
    clickStopped: boolean;
    showAccounts: boolean;
    selectOtherPage?: boolean;
    onSelectOtherPage: (v: boolean) => void;
    onChangeCurrentDecisionn: (roi: RoiRunInfo | null) => void;
    onChangeRoiRunInfo: (roi: RoiRunInfo) => void;
    notifyTestRoi: (roi: RoiInfo) => void;
    notifyWindow: (action: string, payload?: any) => void;
    notifyWindows: (action: string, payload?: any) => void;
    loadCacheRoiList: (tabId: string, skipSet?: boolean) => Promise<RoiInfo[]>;
    onSelectPage: (page: string) => void;
    switchIsPage: (v: boolean) => void;
    onShowScreenMirror: (v: boolean) => void;
    updateScreenPushDelayMs: (n: number, skipNotify?: boolean) => void;
    onSelectRoi: (id: string) => void;
    onSelectTask: (id: string) => void;
    addRoiArea: (r: RoiInfo, cutImageUrl: string, tabId: string) => void;
    removeRoiArea: (r: RoiInfo) => void;
    updateRoiArea: (r: RoiInfo) => void;
    getScreenImg: (tabId: string) => void;
    showRecognition: (tabId: string) => void;
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
const IdCache: Map<string, boolean> = new Map();
export const MatchResults: Map<string, MatchResult> = new Map();

export const fixRow = (roi: RoiInfo) => {
    //@ts-ignore
    if (roi.isMark) {
        roi.type = 'mark';
    }
    if (!roi.type) {
        roi.type = 'reco';
    }

    //@ts-ignore
    if (roi.page) {
        roi.pid = ENTRY_ID_ROI;
        //@ts-ignore
        roi.name = roi.name || roi.page;
    }

    //@ts-ignore
    delete roi.ocrId;
    //@ts-ignore
    delete roi.testJsCode;
    //@ts-ignore
    delete roi.isMark;
    //@ts-ignore
    delete roi.page;
    //@ts-ignore
    delete roi.pageBelongTo;
    //@ts-ignore
    delete roi.isTask;
    //@ts-ignore
    delete roi.isOcr;
    //@ts-ignore
    delete roi.isTry;
    //@ts-ignore
    delete roi.ocrReplyFormat;
    //@ts-ignore
    delete roi.ocrPrompt;
    //@ts-ignore
    delete roi.pageName;
    //@ts-ignore
    delete roi.cutAreaRect.start;
    //@ts-ignore
    delete roi.cutAreaRect.end;
    //@ts-ignore
    delete roi.clickOffsetX;
    //@ts-ignore
    delete roi.clickOffsetY;

    //@ts-ignore
    delete roi.clickOnVisible;
    //@ts-ignore
    delete roi.clickIdOnVisible;
    //@ts-ignore
    roi.tabId = roi.tabId || roi.catId;
    //@ts-ignore
    delete roi.catId;

    if (roi.type === 'task') {
        roi.pid = TASK_ID_ROI;
    }
    if (roi.type === 'mark') {
        roi.pid = MARK_ID_ROI;
    }
    if (!roi.pid && roi.type === 'reco') {
        roi.pid = ENTRY_ID_ROI;
    }
    if (roi.pid === '#0') {
        roi.pid = ENTRY_ID_ROI;
    }

    if (roi.pid === '#-1') {
        roi.pid = MARK_ID_ROI;
    }

    if (roi.pid === '#-2') {
        roi.pid = TASK_ID_ROI;
    }
    if (roi.pid === '#0') {
        roi.pid = ENTRY_ID_ROI;
    }
};
const AppContext = createContext<AppContextType | undefined>(undefined);

export function parseRecognitionCatId(recognitionCatId: string) {
    const t = recognitionCatId.split('-');
    if (!recognitionCatId || t.length < 3) {
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
    const [currentDecision, setCurrentDecision] = useState<RoiRunInfo | null>(null);

    const [showScreenMirror, setShowScreenMirror] = useState<boolean>(true);
    const [isPage, setIsPage] = useState<boolean>(false);

    const [roiRunInfo, setRoiRunInfo] = useState<RoiRunInfo | null>(null);

    const { accounts, tab, onChangePlaygroundMasterSideAction, currentTabId, currentAccount } =
        usePlayground();
    const index = currentAccount?.index || 0;
    const [selectOtherPage, setSelectOtherPage] = useState<boolean>(false);
    const [clickStopped, setClickStopped] = useState<boolean>(false);
    const recoId = getRecoId(tab || { tabId: currentTabId }, currentAccount!);

    const [selectedRoiId, setSelectedRoiId] = useLocalStorageState<string>(
        'selectedRoiId_' + recoId,
        ''
    );

    const [selectedTaskId, setSelectedTaskId] = useLocalStorageState<string>(
        'selectedTaskId_' + recoId,
        ''
    );
    const [recognitionCatId, setRecognitionCatId] = useSessionStorageState(
        'recognitionCatId_' + index,
        ''
    );
    const [selectedPage, setSelectedPage] = useSessionStorageState<string>(
        'selectedPage_' + index,
        ENTRY_ID_ROI
    );

    const [screenPushDelayMs, setScreenPushDelayMs] = useLocalStorageState(
        'pushDelayMs' + recoId,
        1000
    );
    const [roiAreaList, setRoiAreaList] = useState<RoiInfo[]>([]);

    const [startRecognition, setStartRecognition] = useLocalStorageState(
        'startRecognition_' + recoId,
        false
    );

    const [showAccounts, setShowAccounts] = useLocalStorageState('showAccounts_' + recoId, false);

    const [showSettings, setShowSettings] = useLocalStorageState('showSettings_' + recoId, false);

    const onSelectRoi = (id: string) => {
        setSelectedRoiId(i => {
            return id;
        });
    };

    const onSelectTask = (id: string) => {
        setSelectedTaskId(i => {
            return id;
        });
    };

    const onSelectOtherPage = (v: boolean) => {
        setSelectOtherPage(v);
    };
    const onStopClick = (v: boolean) => {
        setClickStopped(v);
    };

    function notifyTestRoi(roi: RoiInfo) {
        if (!RoiService.isRecoFeature(roi)) {
            return;
        }
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
        // setRecognitionCatId(recognitionCatId => {
        //     if (recognitionCatId) {
        //         const screenImgUrl = localStorage.getItem(`screen_${recognitionCatId}`);
        //         if (screenImgUrl) {
        //             // console.log(screenImgUrl);
        //             window.dispatchEvent(
        //                 new CustomEvent('onUpdateScreenImgUrl', {
        //                     detail: {
        //                         screenImageUrl: screenImgUrl
        //                     }
        //                 })
        //             );
        //         } else {
        //             notifyWindow('getScreenImage', { tabId, recognitionCatId });
        //         }
        //     }
        //     return recognitionCatId;
        // });
    };

    const notifyWindow = (action: string, payload?: any) => {
        setRecognitionCatId(recognitionCatId => {
            const { accountIndex, tabId } = parseRecognitionCatId(recognitionCatId);
            const winId = WebviewMainEventService.getPlaygroundWinId({
                index: accountIndex,
                tabId
            });
            console.log('notifyWindow', action, winId);
            onAction('subWin', {
                toWinId: winId,
                action,
                payload: payload || {}
            });
            return recognitionCatId;
        });
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

    const loadCacheRoiList = async (recognitionCatId: string, skipSet?: boolean) => {
        // console.log('loadCacheRoiList', recognitionCatId);
        const rows = await new RoiService(getServiceId(recognitionCatId, proInfoList)).getAll();
        setRoiAreaList(() =>
            rows.map(row => {
                fixRow(row);
                return {
                    ...row,
                    tabId: row.tabId || row.catId
                };
            })
        );
        return rows;
    };
    const showRecognition = (recognitionCatId: string) => {
        if (!recognitionCatId) {
            setStartRecognition(() => false);
        } else {
            onStopClick(false);
        }

        setSelectedPage('');
        setRecognitionCatId(r => {
            // console.log({ r, recognitionCatId });
            const rr = recognitionCatId ? recognitionCatId : r;
            if (!isPlaygroundMaster()) {
                if (!recognitionCatId) {
                    localStorage.setItem(`screen_${r}`, '');
                }

                onAction('subWin', {
                    toWinId: SUB_WIN_ID.PLAYGROUND,
                    action: 'onChangeRecognitionCatId',
                    payload: {
                        account: currentAccount,
                        flag: !!recognitionCatId,
                        recognitionCatId: rr
                    }
                });
                localStorage.setItem(rr, !!recognitionCatId ? '1' : '0');
            }
            return recognitionCatId;
        });
        setTimeout(() => {
            if (!recognitionCatId) {
                if (isPlaygroundMaster()) {
                    setRoiAreaList(() => []);
                }
            } else {
                loadCacheRoiList(recognitionCatId);
            }
        }, 500);
    };
    const addRoiArea = async (r: RoiInfo, cutImageUrl: string, recognitionCatId: string) => {
        const id = await new RoiService(getServiceId(recognitionCatId, proInfoList)).getId();
        if (IdCache.get(id)) {
            return;
        }
        if (isPlaygroundMaster()) {
            setTimeout(() => {
                window.dispatchEvent(
                    new CustomEvent('onNodeClick', {
                        detail: { id: row.id.replace('#', '') }
                    })
                );
            }, 1000);
        }
        IdCache.set(id, true);
        let pid = r.pid;
        if (!pid) {
            pid = selectedPage;
            if (r.type === 'task') {
                pid = TASK_ID_ROI;
            }
            if (r.type === 'mark') {
                pid = MARK_ID_ROI;
            }
            if (!pid && r.type === 'reco') {
                pid = ENTRY_ID_ROI;
            }
        }
        let name = r.name;
        if (!name) {
            name = '未设置';
        }
        const row: RoiInfo = {
            ...r,
            priority: 1000,
            pid,
            id,
            name
        };
        if (cutImageUrl) {
            CacheImage.set(`${recognitionCatId}_${row.id}`, cutImageUrl);
        }

        await new RoiService(getServiceId(recognitionCatId, proInfoList)).save(
            id,
            row,
            cutImageUrl,
            cutImageUrl.startsWith('data')
        );
        if (!isPlaygroundMaster()) {
            const s = new WebviewMainEventService();

            const payload = {
                account: currentAccount,
                tab,
                roiInfo: row
            };
            new WebviewMainEventService()
                .openFeatureWindow({
                    tab,
                    account: currentAccount
                })
                .then(() => {
                    s.sendMessageToSubWin(SUB_WIN_ID.PLAYGROUND, 'onSelectRoiArea', payload);
                });
        } else {
            setRecognitionCatId(r => {
                return recognitionCatId;
            });

            setTimeout(() => {
                if (row.pid === TASK_ID_ROI) {
                    onSelectTask(id);
                    onChangePlaygroundMasterSideAction(PlaygroundMasterSideAction.TASK);
                } else {
                    onSelectRoi(id);
                }
            }, 400);
            notifyWindows('onUpdateRoi');
        }
        setRoiAreaList(prv => {
            return [row, ...prv.filter(row => r.id !== row.id)];
        });
    };

    const updateRoiArea = (r: RoiInfo) => {
       
        let pid = r.pid;
        if (r.type === 'task') {
            pid = TASK_ID_ROI;
        }
        if (r.type === 'mark') {
            pid = MARK_ID_ROI;
        }
        if (!pid && r.type === 'reco') {
            pid = ENTRY_ID_ROI;
        }
        setRecognitionCatId(recognitionCatId => {
            new RoiService(getServiceId(recognitionCatId, proInfoList)).update(r);
            setRoiAreaList(prv => {
                return prv.map(row => {
                    return row.id !== r.id
                        ? row
                        : {
                              ...r,
                              pid
                          };
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

    const onShowScreenMirror = (v: boolean) => {
        setShowScreenMirror(v);
    };

    const onChangeCurrentDecisionn = (v: RoiRunInfo | null) => {
        setCurrentDecision(v);
    };

    return (
        <AppContext.Provider
            value={{
                onSelectTask,
                selectedTaskId,
                onSelectOtherPage,
                selectOtherPage,
                onChangeCurrentDecisionn,
                currentDecision,
                onShowScreenMirror,
                showScreenMirror,
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
