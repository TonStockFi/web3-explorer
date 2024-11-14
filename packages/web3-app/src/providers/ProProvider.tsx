import { useLocalStorageState } from '@web3-explorer/utils';
import { createContext, ReactNode, useContext, useState } from 'react';
import { PRO_LEVEL } from '../types';

interface AppContextType {
    proLevel: PRO_LEVEL;
    showProBuyDialog: boolean;
    onShowProBuyDialog: (v: boolean) => void;
    fetchProLevel: (id: string) => void;
    onChangeProLevel: (v: PRO_LEVEL) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function getProLevelText(id: PRO_LEVEL) {
    let text;
    switch (id) {
        case PRO_LEVEL.MONTH:
            text = 'MONTH';
            break;
        case PRO_LEVEL.YEAR:
            text = 'YEAR';
            break;
        case PRO_LEVEL.LONG:
            text = 'LONG';
            break;
        default:
            text = 'COMMON';
            break;
    }
    return text;
}
export const ProProvider = (props: { children: ReactNode }) => {
    const { children } = props || {};
    const [proLevel, setProLevel] = useLocalStorageState<PRO_LEVEL>('proLevel', PRO_LEVEL.COMMON);
    const [showProBuyDialog, setShowProBuyDialog] = useState(false);

    const onChangeProLevel = (v: PRO_LEVEL) => {
        console.log('onChangeProLevel', v);
        setProLevel(v);
    };

    const fetchProLevel = (id: string) => {};
    const onShowProBuyDialog = (v: boolean) => {
        setShowProBuyDialog(v);
    };

    return (
        <AppContext.Provider
            value={{
                onShowProBuyDialog,
                showProBuyDialog,
                fetchProLevel,
                onChangeProLevel,
                proLevel
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
