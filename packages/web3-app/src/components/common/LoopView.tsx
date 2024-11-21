import { useTimeoutLoop } from '@web3-explorer/utils';

export const LoopView = ({
    callback,
    delay
}: {
    callback: () => Promise<void>;
    delay?: number;
}) => {
    useTimeoutLoop(async () => {
        await callback();
    }, delay || 1000);
    return null;
};
