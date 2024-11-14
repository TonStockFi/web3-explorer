import { View } from '@web3-explorer/uikit-view/dist/View';
import { useState } from 'react';
import { onAction } from '../../common/electron';
import { getWinId } from '../../common/helpers';
import { HomHeaderHeight } from '../../constant';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';

export function TitleBarControlView({ main }: { main?: boolean }) {
    const { env } = useIAppContext();
    const { t } = useBrowserContext();
    const size = 11;
    const mr = 9;
    const [hover, setHover] = useState(false);
    const { isMac, isWin, isFullScreen } = env;
    let hide = !isWin;
    if (isMac && isFullScreen) {
        hide = true;
    }
    return (
        <View hide={hide} height={HomHeaderHeight} w={80} jCenter rowVCenter>
            <View
                red
                mr={mr}
                tips={t('close')}
                wh={size}
                borderRadius={size / 2}
                onClick={() => {
                    if (main) {
                        onAction('closeApp');
                    } else {
                        onAction('closeWin', { winId: getWinId() });
                    }
                }}
                pointer
                onMouseLeave={() => setHover(false)}
                onMouseEnter={() => setHover(true)}
                center
            >
                <View
                    hide={!hover}
                    iconProps={{ sx: { width: size, height: size } }}
                    icon={'Close'}
                ></View>
            </View>
            <View
                mr={mr}
                bgColor="yellow"
                tips={t('Min')}
                wh={size}
                borderRadius={size / 2}
                pointer
                onMouseLeave={() => setHover(false)}
                onMouseEnter={() => setHover(true)}
                onClick={() => {
                    onAction('minWin', { winId: getWinId() || 'main' });
                }}
                rowVCenter
                relative
            ></View>
            <View
                bgColor="green"
                tips={t('Max')}
                pointer
                onMouseLeave={() => setHover(false)}
                onMouseEnter={() => setHover(true)}
                wh={size}
                borderRadius={size / 2}
                onClick={() => {
                    onAction('maxWin', { winId: getWinId() || 'main' });
                }}
                relative
            ></View>
        </View>
    );
}
