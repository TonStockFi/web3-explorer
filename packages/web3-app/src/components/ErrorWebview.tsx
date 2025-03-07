import { useTranslation } from '@web3-explorer/lib-translation';
import Typography from '@web3-explorer/uikit-mui/dist/mui/Typography';
import { View } from '@web3-explorer/uikit-view';
import { useTheme } from 'styled-components';
import { hexToRGBA } from '../common/utils';

export default function ErrorWebview({
    errorDescription,
    onClick,
    url
}: {
    errorDescription: string;
    url: string;
    onClick: any;
}) {
    const theme = useTheme();
    const { t } = useTranslation();
    let url1 = url.split('?')[0];
    if (url1.indexOf('#') > 0) {
        url1 = url.split('#')[0];
    }
    return (
        <View
            absFull
            zIdx={2}
            center
            column
            bgColor={hexToRGBA(theme.backgroundContent, 0.9)}
            borderRadius={8}
            overflowHidden
        >
            <View mb12 pb12 center column px12>
                <View
                    iconFontSize="3rem"
                    iconColor={theme.textSecondary}
                    icon="WifiTetheringError"
                />
                <View mt12>
                    <Typography color={theme.textSecondary}>{t(errorDescription)}</Typography>
                </View>
                <View
                    mt={6}
                    overflowHidden
                    sx={{
                        maxWidth: '320px'
                    }}
                >
                    <Typography
                        sx={{
                            wordWrap: 'break-word',
                            whiteSpace: 'normal'
                        }}
                        fontSize={'0.8rem'}
                        color={theme.textSecondary}
                    >
                        {url1}
                    </Typography>
                </View>
            </View>
            <View w100p mt12 center>
                <View
                    borderBox
                    mr12
                    ml12
                    button={'刷新'}
                    buttonVariant="outlined"
                    onClick={onClick}
                />
            </View>
        </View>
    );
}
