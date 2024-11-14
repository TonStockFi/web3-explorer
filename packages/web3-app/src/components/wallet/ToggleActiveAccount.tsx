import { View } from '@web3-explorer/uikit-view';
import { useTheme } from 'styled-components';

export function ToggleActiveAccount({ isActived }: { isActived: boolean }) {
    const theme = useTheme();
    return (
        <View mr={14} h100p center>
            <View wh={22} center>
                <View
                    icon={!isActived ? 'ToggleOff' : 'ToggleOn'}
                    iconProps={{
                        sx: { color: isActived ? `${theme.accentGreen}!important` : undefined }
                    }}
                />
            </View>
        </View>
    );
}
