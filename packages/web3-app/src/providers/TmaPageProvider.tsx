import { createContext, ReactNode, useContext, useState } from 'react';
import { TmaPageNav } from '../types';
export const DEFAULT_FOLDER = 'TempFolder';

interface TmaPageContextType {
    currentTmaPageNav: TmaPageNav;
    onChangeTmaPageNav: (page: TmaPageNav) => void;
}

const TmaPageContext = createContext<TmaPageContextType | undefined>(undefined);

export const useTmaPageContext = () => {
    const context = useContext(TmaPageContext);
    if (!context) {
        throw new Error('useTmaPageContext must be used within an TmaPageProvider');
    }
    return context;
};

export const TmaPageProvider = (props: { children: ReactNode }) => {
    const { children } = props || {};
    const { hash } = new URL(location.href);
    let currentTmaPageNav_ = TmaPageNav.HOME;
    if (hash && hash.indexOf('#') === 0) {
        currentTmaPageNav_ = hash.substring(1) as TmaPageNav;
    }
    const [currentTmaPageNav, setCurrentTmaPageNav] = useState<TmaPageNav>(currentTmaPageNav_);

    const onChangeTmaPageNav = async (p: TmaPageNav) => {
        location.hash = `#${p}`;
        setCurrentTmaPageNav(p);
    };

    return (
        <TmaPageContext.Provider
            value={{
                currentTmaPageNav,
                onChangeTmaPageNav
            }}
        >
            {children}
        </TmaPageContext.Provider>
    );
};
