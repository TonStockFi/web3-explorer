import Loading from '@web3-explorer/uikit-mui/dist/components/Loading';
import { View } from '@web3-explorer/uikit-view';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';
import { currentTs, hexToRGBA } from '../common/utils';

export function LoadingView({
    loading,
    allowClose,
    setLoading,
    borderRadius,
    onRefresh,
    tips,
    noBgColor
}: {
    borderRadius?: number;
    tips?: string;
    allowClose?: boolean;
    loading: boolean;
    noBgColor?: boolean;
    onRefresh?: () => void;
    setLoading?: (loading: boolean) => void;
}) {
    const theme = useTheme();
    const { t } = useTranslation();
    const [showButton, setShowButton] = useState(false);
    useEffect(() => {
        if (!loading) {
            setShowButton(false);
        }
    }, [loading]);
    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        if (!showButton && loading && onRefresh) {
            let startTime = currentTs();
            interval = setInterval(() => {
                if (currentTs() - startTime > 5000) {
                    clearInterval(interval);
                    setShowButton(true);
                    startTime = currentTs();
                }
            }, 1000);
        }

        return () => {
            interval && clearInterval(interval);
        };
    }, [showButton, onRefresh, loading]);
    return (
        <View
            hide={!loading}
            column
            zIdx={1}
            borderRadius={borderRadius || 0}
            bgColor={noBgColor ? undefined : hexToRGBA(theme.backgroundContent, 0.9)}
            absFull
            center
        >
            <Loading />
            {tips && <View mt12 textFontSize="0.9rem" text={tips} />}
            <View
                hide={!showButton || !onRefresh}
                mt={24}
                onClick={() => {
                    if (onRefresh) {
                        onRefresh();
                    }
                    if (allowClose && setLoading) {
                        setLoading(false);
                    }

                    setShowButton(false);
                }}
                button={t('reload')}
                buttonVariant="outlined"
            />
        </View>
    );
}
