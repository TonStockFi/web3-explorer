import { createContext, ReactNode, useContext, useState } from 'react';
import { DefaultCutRect } from '../components/webview/CutAreaView';

export type Position = {
    x: number;
    y: number;
};
export type CutAreaRect = {
    start: Position;
    end: Position;
    x: number;
    y: number;
    w: number;
    h: number;
};

interface AppContextType {
    isCutting: boolean;
    isCutEnable: boolean;
    cutAreaRect: CutAreaRect;

    changeCutAreaRect: (cutAreaRect: CutAreaRect) => void;
    onCut: (isCutEnable: boolean) => void;
    onCutting: (isCutting: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const ScreenshotProvider = (props: { children: ReactNode }) => {
    const { children } = props || {};

    const [isCutEnable, setIsCutEnable] = useState(false);
    const [isCutting, setIsCutting] = useState(false);
    const [cutAreaRect, setCutAreaRect] = useState<CutAreaRect>(DefaultCutRect);
    const onCut = (isCutEnable: boolean) => {
        setIsCutEnable(isCutEnable);
        if (!isCutEnable) {
            setIsCutting(false);
            setCutAreaRect(DefaultCutRect);
        }
    };
    const onCutting = (isCutting: boolean) => setIsCutting(isCutting);
    const changeCutAreaRect = (cutAreaRect: CutAreaRect) => setCutAreaRect(cutAreaRect);

    return (
        <AppContext.Provider
            value={{
                changeCutAreaRect,
                cutAreaRect,
                isCutEnable,
                onCut,
                onCutting,
                isCutting
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useScreenshotContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useScreenshotContext must be used within an ScreenshotProvider');
    }
    return context;
};
