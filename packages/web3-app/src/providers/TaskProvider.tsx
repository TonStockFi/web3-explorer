import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { isTMA } from '../common/utils';
import { TaskId, TaskItem } from '../types';

interface TaskContextType {
    tasks: TaskItem[];
    currentTask: TaskId | null;
    onChangeTask: (id: TaskId | null) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTaskContext must be used within an TaskProvider');
    }
    return context;
};

export const TaskProvider = (props: { children: ReactNode }) => {
    const { children } = props || {};
    const [currentTask, setCurrentTask] = useState<TaskId | null>(
        !isTMA() ? TaskId.FOLLOW_W3C_TG_BOT : null
    );

    const onChangeTask = async (id: TaskId | null) => {
        setCurrentTask(id);
    };

    const tasks: TaskItem[] = [
        {
            taskId: TaskId.INVITE,
            title: '邀请好友',
            icon: 'GroupAdd',
            rewarkW3C: 1,
            rewarkPoints: 100
        },
        {
            taskId: TaskId.DAILY_SIGN,
            title: '每日签到',
            icon: 'Redeem',
            tmaOnly: true,
            rewarkW3C: 0.1,
            rewarkPoints: 200
        },
        {
            taskId: TaskId.FOLLOW_W3C_TG_BOT,
            title: '关注 W3C 小程序',
            iconUrl: 'https://explorer.web3r.site/coin-256x256.png',
            rewarkW3C: 1,
            desktopOnly: true,
            rewarkPoints: 100
        },
        {
            taskId: TaskId.FOLLOW_W3C_X,
            title: '关注 W3C 官方 X 频道',
            iconUrl: 'https://explorer.web3r.site/coin-256x256.png',
            rewarkW3C: 1,
            rewarkPoints: 100
        },
        {
            taskId: TaskId.FOLLOW_W3C_YOUTUBE,
            title: '关注 W3C 官方 Youtube 频道',
            iconUrl: 'icon_youtube',
            rewarkW3C: 1,
            rewarkPoints: 100
        },
        {
            taskId: TaskId.LOGIN_W3C_GMAIL,
            title: '登录Gmail',
            iconUrl: 'icon_gmail',
            rewarkW3C: 1,
            desktopOnly: true,
            rewarkPoints: 100
        },
        {
            taskId: TaskId.LOGIN_W3C_GEMINI,
            title: '登录Gemini',
            iconUrl: 'icon_gemini',
            rewarkW3C: 1,
            desktopOnly: true,
            rewarkPoints: 100
        },
        {
            taskId: TaskId.LOGIN_W3C_CHATGPT,
            title: '登录ChatGpt',
            iconUrl: 'icon_chatgpt',
            rewarkW3C: 1,
            desktopOnly: true,
            rewarkPoints: 100
        }
    ];
    useEffect(() => {
        // new TelegramApiService(W3C_BotId)
        //     .request(TelegramApiAction.GetBotUserInfo, {
        //         userId: String(userId)
        //     })
        //     .then(res => {
        //         if (res.responseBody && res.responseBody.userInfo) {
        //             setWheelItems(res.responseBody.wheelItems);
        //             const { invite_code, reward_points, reward_w3c } = res.responseBody.userInfo;
        //             onChangeGlobalInfo({
        //                 invite_code,
        //                 reward_points,
        //                 reward_w3c
        //             });
        //         }
        //     });
    }, []);
    return (
        <TaskContext.Provider
            value={{
                tasks,
                currentTask,
                onChangeTask
            }}
        >
            {children}
        </TaskContext.Provider>
    );
};
