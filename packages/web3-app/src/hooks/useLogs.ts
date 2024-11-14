import { useEffect, useState } from 'react';
import { currentTs } from '../common/utils';
import { CutAreaRect } from '../providers/ScreenshotProvider';
import { sendMessageParams } from '../types';


export const MessageLogList: { ts: number; action: string; msg: string }[] = [];

export function useLogs<T>({}: {}) {
    const [updateAt, setUpdateAt] = useState(0);
    useEffect(() => {
        const handleCustomEvent = (e: CustomEvent) => {
            const { event, cutArea } = e.detail as {
                cutArea?: CutAreaRect;
                recognition?: CutAreaRect[];
                event?: sendMessageParams;
            };
            const ts = currentTs()
            let msg = '';
            let action = '';
            if (cutArea) {
                action = 'cut';
                msg = `x:${cutArea.start.x},y:${cutArea.start.y} / x:${cutArea.end.x},y:${cutArea.end.y}`;
            }
            if (event) {
                const { x, y, value, eventType } = event;
                action = eventType;
                if (eventType === 'click') {
                    msg = `x:${x},y:${y}`;
                }
                if (eventType === 'action') {
                    //@ts-ignore
                    msg = `${GLOBAL_ACTIONS_MAP[String(value!)].replace('GLOBAL_ACTION_', '')}`;
                }
            }
            if (msg) {
                MessageLogList.unshift({ ts, action, msg });
            }
            setUpdateAt(currentTs());
        };

        //@ts-ignore
        window.addEventListener('LogEvent', handleCustomEvent);
        return () => {
            //@ts-ignore
            window.removeEventListener('LogEvent', handleCustomEvent);
        };
    }, []);
    return { logsUpdateAt: updateAt };
}
