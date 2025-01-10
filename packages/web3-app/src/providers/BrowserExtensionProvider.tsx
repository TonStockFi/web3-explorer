import { useLocalStorageState } from '@web3-explorer/utils';
import { createContext, ReactNode, useContext, useEffect } from 'react';
import BrowserExtensionService from '../services/BrowserExtensionService';
import { BrowserExtensionInfo } from '../types';

interface BrowserExtensionContextType {
    browserExtensions: BrowserExtensionInfo[];
    currentBrowserExtensionId: string | null;
    onChangeCurrentBrowserExtensionId: (id: string | null) => void;
    onDelBrowserExtensionId: (id: string) => void;
    loadBrowserExtensions: () => Promise<BrowserExtensionInfo[]>;
    onChangeOrCreateBrowserExtensions: (t: BrowserExtensionInfo[]) => void;
    onChangeOrCreateBrowserExtension: (id: string, v: Partial<BrowserExtensionInfo>) => void;
}

const BrowserExtensionContext = createContext<BrowserExtensionContextType | undefined>(undefined);

export const useBrowserExtensionContext = () => {
    const context = useContext(BrowserExtensionContext);
    if (!context) {
        throw new Error(
            'useBrowserExtensionContext must be used within an BrowserExtensionProvider'
        );
    }
    return context;
};

export const BrowserExtensionProvider = (props: { children: ReactNode }) => {
    const { children } = props || {};
    const [browserExtensions, setBrowserExtensions] = useLocalStorageState<BrowserExtensionInfo[]>(
        'browserExtensions',
        []
    );

    const onChangeOrCreateBrowserExtensions = (v: BrowserExtensionInfo[]) => {
        setBrowserExtensions(v);
    };

    const [currentBrowserExtensionId, setCurrentBrowserExtensionId] = useLocalStorageState<
        string | null
    >('currentBrowserExtensionId', null);

    const onChangeCurrentBrowserExtensionId = async (id: string | null) => {
        setCurrentBrowserExtensionId(id);
    };

    const onDelBrowserExtensionId = (id: string) => {
        setBrowserExtensions(r => {
            const rows = r.filter(row => row.id !== id);
            setCurrentBrowserExtensionId(null);
            new BrowserExtensionService().remove(id).then(row => {
                loadBrowserExtensions().then(() => {
                    if (rows) {
                        setCurrentBrowserExtensionId(rows[0].id);
                    }
                });
            });

            return r;
        });
    };
    const onChangeOrCreateBrowserExtension = async (
        id: string,
        extension: Partial<BrowserExtensionInfo>
    ) => {
        setBrowserExtensions(rows => {
            const row = rows.find(row => row.id === id);
            if (row) {
                new BrowserExtensionService().save(id, {
                    ...row,
                    ...(extension as BrowserExtensionInfo)
                });
            } else {
                new BrowserExtensionService().save(id, {
                    ...(extension as BrowserExtensionInfo),
                    id
                });
            }
            loadBrowserExtensions().then(() => {
                setCurrentBrowserExtensionId(id);
            });
            return rows;
        });
    };

    const loadBrowserExtensions = async () => {
        const rows = await new BrowserExtensionService().getAll();
        onChangeOrCreateBrowserExtensions(rows);
        return rows;
    };
    useEffect(() => {
        loadBrowserExtensions();
    }, []);
    return (
        <BrowserExtensionContext.Provider
            value={{
                onDelBrowserExtensionId,
                onChangeOrCreateBrowserExtensions,
                browserExtensions,
                onChangeOrCreateBrowserExtension,
                loadBrowserExtensions,
                onChangeCurrentBrowserExtensionId,
                currentBrowserExtensionId
            }}
        >
            {children}
        </BrowserExtensionContext.Provider>
    );
};
