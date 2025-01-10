import { TelegramApiAction, TgUserPublic } from '@web3-explorer/lib-telegram';
import { useLocalStorageState } from '@web3-explorer/utils';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useTheme } from 'styled-components';
import { isTMA } from '../common/utils';
import { W3C_BotId } from '../constant';
import TelegramApiService from '../services/TelegramApiService';
import { TMAGlobalInfo, TmaPageNav } from '../types';
import { useTaskContext } from './TaskProvider';

interface TmaPageContextType {
    userId: string;
    user: TgUserPublic;
    wheelItems: { symbol: 'Points' | 'W3C'; amount: number }[];
    globalInfo: TMAGlobalInfo | null;
    onChangeGlobalInfo: (v: Partial<TMAGlobalInfo>) => void;
    currentTmaPageNav: TmaPageNav;
    onChangeTmaPageNav: (page: TmaPageNav) => void;
}

const TmaPageContext = createContext<TmaPageContextType | undefined>(undefined);

const wheelItemsDefault: any[] = [
    {
        symbol: 'W3C',
        amount: 0.3
    },
    {
        symbol: 'Points',
        amount: 10
    },
    {
        symbol: 'W3C',
        amount: 1
    },
    {
        symbol: 'Points',
        amount: 5
    },
    {
        symbol: 'W3C',
        amount: 0.5
    },
    {
        symbol: 'Points',
        amount: 1
    },
    {
        symbol: 'W3C',
        amount: 0.8
    },
    {
        symbol: 'Points',
        amount: 1
    }
];
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
    const { onChangeTasks, onChangeTasksClaimed } = useTaskContext();
    const theme = useTheme();
    let currentTmaPageNav_ = TmaPageNav.HOME;
    if (hash && hash.indexOf('#') === 0) {
        currentTmaPageNav_ = hash.substring(1) as TmaPageNav;
    }
    //@ts-ignore
    const { Telegram } = window;

    let startParam = '';
    let user: TgUserPublic = {
        id: 888888,
        first_name: 'Tom',
        last_name: '',
        language_code: 'en',
        allows_write_to_pm: true,
        photo_url:
            'https://t.me/i/userpic/320/VGQI8P51tdXVBhF4sFuJzLainaWTBipsC8YKk9UO3W6xEYpRtLCL8EXfcEcSuJ-F.svg'
    };
    if (isTMA()) {
        const initData = Telegram.WebApp.initDataUnsafe;
        startParam = initData.start_param;
        Telegram.WebApp.setHeaderColor(theme.backgroundBrowser);
        user = initData.user as TgUserPublic;
    }
    const userId = user.id;

    const [currentTmaPageNav, setCurrentTmaPageNav] = useState<TmaPageNav>(currentTmaPageNav_);

    const [wheelItems, setWheelItems] = useLocalStorageState<
        { symbol: 'Points' | 'W3C'; amount: number }[]
    >('wheelItems_1', wheelItemsDefault);
    const [globalInfo, setGlobalInfo] = useLocalStorageState<TMAGlobalInfo | null>(
        'tma_globalInfo',
        null
    );

    const onChangeGlobalInfo = async (v: Partial<TMAGlobalInfo>) => {
        setGlobalInfo(r => {
            return {
                ...r,
                ...v
            };
        });
    };

    const onChangeTmaPageNav = async (p: TmaPageNav) => {
        setCurrentTmaPageNav(p);
    };

    useEffect(() => {
        if (!isTMA()) {
            return;
        }
        new TelegramApiService(W3C_BotId)
            .request(TelegramApiAction.GetBotUserInfo, {
                userId: String(userId),
                user,
                startParam
            })
            .then(res => {
                if (res.responseBody && res.responseBody.userInfo) {
                    if (res.responseBody.wheelItems) {
                        setWheelItems(res.responseBody.wheelItems);
                    }
                    if (res.responseBody.tasks) {
                        onChangeTasks(res.responseBody.tasks);
                    }

                    if (res.responseBody.tasksClaimed) {
                        onChangeTasksClaimed(res.responseBody.tasksClaimed);
                    }

                    const { invite_code, reward_points, reward_w3c } = res.responseBody.userInfo;
                    onChangeGlobalInfo({
                        invite_code,
                        reward_points,
                        reward_w3c
                    });
                }
            });
    }, []);
    return (
        <TmaPageContext.Provider
            value={{
                userId: String(userId),
                user,
                wheelItems,
                globalInfo,
                onChangeGlobalInfo,
                currentTmaPageNav,
                onChangeTmaPageNav
            }}
        >
            {children}
        </TmaPageContext.Provider>
    );
};
