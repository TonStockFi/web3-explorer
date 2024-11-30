import { View } from '@web3-explorer/uikit-view/dist/View';
import { ReactNode } from 'react';
import { useTheme } from 'styled-components';

export function EmptyView({
    onReload,
    tips,
    reloadTitle,
    tipsNode
}: {
    onReload?: () => void;
    tips?: string;
    reloadTitle?: string;
    tipsNode?: ReactNode;
}) {
    const theme = useTheme();
    return (
        <View center absFull zIdx={1} column>
            <View center column userSelectNone>
                <View iconProps={{ sx: { fontSize: '2.5rem' } }} icon="NotificationImportant" />
                <View
                    hide={!tips}
                    mt12
                    textColor={theme.textSecondary}
                    textFontSize="0.9rem"
                    text={tips}
                />
                {tipsNode}
            </View>
            <View
                mt12
                hide={!onReload}
                onClick={onReload}
                button={reloadTitle || '刷新'}
                buttonVariant="outlined"
            />
        </View>
    );
}
