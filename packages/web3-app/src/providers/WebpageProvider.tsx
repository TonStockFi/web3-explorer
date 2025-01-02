import { createContext, ReactNode, useContext, useState } from 'react';
import { WebpageNav } from '../types';
export const DEFAULT_FOLDER = 'TempFolder';

interface WebpageContextType {
    currentPageNav: WebpageNav;
    onChangePageNav: (page: WebpageNav) => void;
}

const WebpageContext = createContext<WebpageContextType | undefined>(undefined);

export const useWebpageContext = () => {
    const context = useContext(WebpageContext);
    if (!context) {
        throw new Error('useWebpageContext must be used within an WebpageProvider');
    }
    return context;
};

export const WebpageProvider = (props: { children: ReactNode }) => {
    const { children } = props || {};
    const { hash } = new URL(location.href);
    let currentPageNav_ = WebpageNav.HOME;
    if (hash && hash.indexOf('#') === 0) {
        currentPageNav_ = hash.substring(1) as WebpageNav;
    }
    const [currentPageNav, setCurrentPageNav] = useState<WebpageNav>(currentPageNav_);

    const onChangePageNav = async (p: WebpageNav) => {
        location.hash = `#${p}`;
        setCurrentPageNav(p);
    };

    return (
        <WebpageContext.Provider
            value={{
                currentPageNav,
                onChangePageNav
            }}
        >
            {children}
        </WebpageContext.Provider>
    );
};
