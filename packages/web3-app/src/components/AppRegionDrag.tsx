import { View } from '@web3-explorer/uikit-view';
import { useTheme } from 'styled-components';

export function AppRegionDrag() {
    const theme = useTheme();
    return (
        <View
            h={12}
            sx={{ borderTop: `1px solid ${theme.backgroundBrowserActive}`, cursor: 'move' }}
            abs
            zIndex={1000000}
            left0
            top0
            right0
            appRegionDrag
        />
    );
}
