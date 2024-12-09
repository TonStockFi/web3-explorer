import { useLocalStorageState } from '@web3-explorer/utils';
import { createContext, ReactNode, useContext, useState } from 'react';
import { PRO_RECV_ADDRESS } from '../constant';
import ProService from '../services/ProService';
import { ProInfoProps, ProPlan } from '../types';

interface AppContextType {
    proRecvAddress: string;
    showProBuyDialog: boolean;
    proPlans: ProPlan[];
    isLongProLevel: boolean;
    proInfo: ProInfoProps | null;
    proInfoList: ProInfoProps[];
    checkPayCommentOrder: boolean;
    onCheckPayCommentOrder: (v: boolean) => void;
    updateProPlans: (v: { proRecvAddress: string; proPlans: ProPlan[] }) => void;
    onShowProBuyDialog: (v: boolean) => void;
    onChangeProInfo: (v: ProInfoProps) => void;
    updateProInfo: (v: ProInfoProps[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const ProProvider = (props: { children: ReactNode }) => {
    const { children } = props || {};
    const [checkPayCommentOrder, setCheckPayCommentOrder] = useState(false);

    const [showProBuyDialog, setShowProBuyDialog] = useState(false);
    const [proInfo, setProInfo] = useState<null | ProInfoProps>(null);
    const [proInfoList, setProInfoList] = useState<ProInfoProps[]>([]);
    const [proRecvAddress, setProRecvAddress] = useLocalStorageState<string>(
        'proRecvAddress',
        PRO_RECV_ADDRESS
    );
    const [proPlans, setProPlans] = useLocalStorageState<ProPlan[]>('proPlans', []);

    const onCheckPayCommentOrder = (v: boolean) => {
        setCheckPayCommentOrder(v);
    };
    const onChangeProInfo = (proInfo: ProInfoProps) => {
        setProInfo(proInfo);
        new ProService(proInfo.id).save(proInfo.index, proInfo);
    };

    const onShowProBuyDialog = (v: boolean) => {
        setShowProBuyDialog(v);
    };

    const updateProInfo = (proInfoList: ProInfoProps[]) => {
        setProInfoList(proInfoList);
    };
    const updateProPlans = ({
        proRecvAddress,
        proPlans
    }: {
        proRecvAddress: string;
        proPlans: ProPlan[];
    }) => {
        setProPlans(proPlans);
        setProRecvAddress(proRecvAddress);
    };
    const isLongProLevel = Boolean(
        proInfoList && proInfoList.find((row: ProInfoProps) => row.level === 'LONG')
    );
    return (
        <AppContext.Provider
            value={{
                onCheckPayCommentOrder,
                checkPayCommentOrder,
                proInfoList,
                isLongProLevel,
                updateProInfo,
                proInfo,
                proRecvAddress,
                proPlans,
                updateProPlans,
                onShowProBuyDialog,
                showProBuyDialog,
                onChangeProInfo
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const usePro = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('usePro must be used within an ProProvider');
    }
    return context;
};
