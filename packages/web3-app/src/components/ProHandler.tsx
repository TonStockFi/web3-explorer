import { View } from '@web3-explorer/uikit-view/dist/View';
import { useTheme } from 'styled-components';
import { usePro } from '../providers/ProProvider';
import { ProSettings } from './pro/ProSettings';

export function ProHandler() {
    const { showProBuyDialog, onShowProBuyDialog } = usePro();
    const theme = useTheme();
    return (
        <View
            dialog={{
                dialogProps: {
                    sx: {
                        '& .MuiDialog-paper': {
                            borderRadius: 2,
                            bgcolor: theme.backgroundPage
                        }
                    },
                    fullScreen: false,
                    open: showProBuyDialog
                },
                content: (
                    <View wh100p row center relative>
                        <View
                            abs
                            top={12}
                            right={12}
                            icon={'Close'}
                            iconButtonSmall
                            onClick={() => {
                                onShowProBuyDialog(false);
                            }}
                        ></View>
                        <View sx={{ maxWidth: 800 }}>
                            <ProSettings />
                        </View>
                    </View>
                )
            }}
        />
    );
}
