import { Typography, useTheme } from '@mui/material';
import { View } from '@web3-explorer/uikit-view';

export default function ErrorWebview({
    errorDescription,
    onClick
}: {
    errorDescription: string;
    onClick: any;
}) {
    const theme = useTheme();
    return (
        <View absFull zIdx={2} center column bgColor={theme.palette.background.default}>
            <View mb12 pb12>
                <Typography color={theme.palette.text.primary}>{errorDescription}</Typography>
            </View>
            <View w100p mt12>
                <View
                    mr12
                    ml12
                    button={'刷新'}
                    buttonProps={{ variant: 'outlined', fullWidth: true }}
                    onClick={() => {
                        onClick();
                    }}
                />
            </View>
        </View>
    );
}
