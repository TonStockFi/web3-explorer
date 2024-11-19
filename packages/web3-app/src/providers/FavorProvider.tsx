import useLocalStorageState from '@web3-explorer/utils/dist/hooks/useLocalStorageState';
import { createContext, ReactNode, useContext, useState } from 'react';
import { currentTs } from '../common/utils';
import BrowserFavorService, { BrowserFavorProps } from '../services/BrowserFavorService';
export const DEFAULT_FOLDER = 'TempFolder';

interface FavorContextType {
    updateAt: number;
    favors: Map<string, BrowserFavorProps>;
    folders: { name: string }[];
    setFolders: (v: { name: string }[]) => void;
    saveFavor: (favor: BrowserFavorProps, ignoreSaveToCache?: boolean) => void;
    removeFavor: (id: string) => void;
}

const FavorContext = createContext<FavorContextType | undefined>(undefined);

export const useFavorContext = () => {
    const context = useContext(FavorContext);
    if (!context) {
        throw new Error('useBrowserContext must be used within an FavorProvider');
    }
    return context;
};

const Favors: Map<string, BrowserFavorProps> = new Map();

export const FavorProvider = (props: { children: ReactNode }) => {
    const { children } = props || {};

    const [updateAt, setUpdateAt] = useState(currentTs());
    const [folders, _setFolders] = useLocalStorageState<{ name: string }[]>('folders_02', [
        { name: DEFAULT_FOLDER }
    ]);
    const setFolders = async (v: { name: string }[]) => {
        _setFolders(v);
    };
    const saveFavor = async (favor: BrowserFavorProps, ignoreSaveToCache?: boolean) => {
        Favors.set(favor.id, favor);
        setUpdateAt(currentTs());
        if (!ignoreSaveToCache) {
            await new BrowserFavorService(favor.id).save(favor);
        }
    };

    const removeFavor = async (id: string) => {
        Favors.delete(id);
        await new BrowserFavorService(id).remove();
        setUpdateAt(currentTs());
    };

    return (
        <FavorContext.Provider
            value={{
                folders,
                setFolders,
                saveFavor,
                removeFavor,
                updateAt,
                favors: Favors
            }}
        >
            {children}
        </FavorContext.Provider>
    );
};
