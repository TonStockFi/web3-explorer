import { View } from '@web3-explorer/uikit-view/dist/View';
import { useTheme } from 'styled-components';

export function EmptyView({ tips }: { tips?: string }) {
    const theme = useTheme();
    return (
        <View center absFull>
            <View center column userSelectNone>
                <View
                    iconProps={{ sx: { fontSize: '2.5rem' } }}
                    icon="NotificationImportant"
                ></View>
                <View
                    mt12
                    textColor={theme.textSecondary}
                    textFontSize="0.9rem"
                    text={tips || '没有找到记录,拖动鼠标提取特征'}
                ></View>
            </View>
        </View>
    );
}
