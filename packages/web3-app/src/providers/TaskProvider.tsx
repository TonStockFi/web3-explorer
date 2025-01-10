import { TaskClaimedItem, TaskId, TaskItem, TelegramApiAction } from '@web3-explorer/lib-telegram';
import { useLocalStorageState } from '@web3-explorer/utils';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { getAccountIdFromAccount } from '../common/helpers';
import { getUrlQuery, isDesktop, isTMA } from '../common/utils';
import { W3C_BotId } from '../constant';
import TelegramApiService from '../services/TelegramApiService';
import { WebApp } from '../types';
import { useIAppContext } from './IAppProvider';

interface TaskContextType {
    tasks: TaskItem[];
    tasksClaimed: TaskClaimedItem[];
    onChangeTasks: (t: TaskItem[]) => void;
    onChangeTasksClaimed: (t: TaskClaimedItem[]) => void;
    fetchTasks: () => Promise<TaskItem[]>;
    currentTask: TaskId | null;
    openPlaygroundWindow: (app: WebApp) => void;
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
    const [tasks, setTasks] = useLocalStorageState<TaskItem[]>('tasks_airdrop', []);
    const [tasksClaimed, setTasksClaimed] = useLocalStorageState<TaskClaimedItem[]>(
        'tasksClaimed_airdrop',
        []
    );

    const { showConfirm } = useIAppContext();

    const onChangeTasks = (tasks: TaskItem[]) => {
        setTasks(tasks);
    };
    const onChangeTasksClaimed = (tasks: TaskClaimedItem[]) => {
        setTasksClaimed(tasks);
    };
    const openPlaygroundWindow = (item: WebApp) => {
        if (isDesktop()) {
            window.__appApi.message({
                action: 'onOpenTab',
                payload: { item }
            });
            return;
        }
        showConfirm({
            id: 'confirm',
            title: '提示',
            content: '您需要安装桌面版 Web3 Explorer,才可以打开此应用。',
            confirmTxt: '已安装直接打开',
            cancelTxt: '取消',
            onConfirm: () => {
                location.href =
                    'web3://onOpenTab?item=' + Buffer.from(JSON.stringify(item)).toString('hex');
                showConfirm(false);
                return true;
            },
            onCancel: () => {
                showConfirm(false);
            }
        });
    };
    const [currentTask, setCurrentTask] = useState<TaskId | null>(
        !isTMA() ? TaskId.FOLLOW_W3C_TG_BOT : null
    );

    const onChangeTask = async (id: TaskId | null) => {
        if (isTMA()) {
            if (id) {
                //@ts-ignore
                Telegram.WebApp.BackButton.show();
            } else {
                //@ts-ignore
                Telegram.WebApp.BackButton.hide();
            }
        }

        setCurrentTask(id);
    };

    const fetchTasks = async () => {
        const id = getUrlQuery('_id');
        const accountId = id
            ? getAccountIdFromAccount({
                  id: id.substring(1),
                  index: id.substring(0, 1)
              })
            : '';
        const res = await new TelegramApiService(W3C_BotId).request(TelegramApiAction.GetTasks, {
            accountId
        });
        if (res) {
            const { tasks, tasksClaimed } = res.responseBody;
            if (tasksClaimed) {
                onChangeTasksClaimed(tasksClaimed);
            }
            if (tasks) {
                onChangeTasks(tasks);
            }
        }
        return [];
    };
    useEffect(() => {
        if (isTMA()) {
            //@ts-ignore
            Telegram.WebApp.BackButton.onClick(function () {
                onChangeTask(null);
            });
        }
    }, []);
    return (
        <TaskContext.Provider
            value={{
                onChangeTasksClaimed,
                tasksClaimed,
                onChangeTasks,
                fetchTasks,
                tasks,
                openPlaygroundWindow,
                currentTask,
                onChangeTask
            }}
        >
            {children}
        </TaskContext.Provider>
    );
};
