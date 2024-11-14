import { View } from '@web3-explorer/uikit-view';
import { useTheme } from 'styled-components';
import { AsideWidth, HeaderHeight } from '../../constant';
import { useIAppContext } from '../../providers/IAppProvider';
import { WalletHeaderAccount } from './WalletHeaderAccount';

export function WalletHeader({
    onBack,
    hideAccount,
    asideWidth,
    leftNode,
    title
}: {
    hideAccount?: boolean;
    leftNode?: React.ReactNode;
    left?: number;
    asideWidth?: number;
    onBack?: () => void;
    title?: string;
}) {
    const theme = useTheme();

    const { walletAside, isFullScreen } = useIAppContext();
    let right = walletAside ? AsideWidth : 0;
    if (asideWidth !== undefined) {
        right = asideWidth;
    }
    return (
        <View
            borderBox
            userSelectNone
            pl={isFullScreen ? 0 : 72}
            abs
            top={1}
            h={HeaderHeight}
            left={0}
            right={right}
            row
            jSpaceBetween
            aCenter
        >
            <View row pl12 jStart aCenter h100p>
                <View hide={!onBack} mr12>
                    <View
                        onClick={onBack}
                        icon="Back"
                        iconButton={{
                            size: 'small',
                            sx: { borderRadius: 1, color: theme.textPrimary }
                        }}
                        iconProps={{ fontSize: 'small' }}
                    />
                </View>
                <View hide={!title} text={title} textProps={{ component: 'h2' }} mr12 />
                {leftNode}
            </View>
            <View row aCenter jEnd pr={20}>
                <WalletHeaderAccount hideAccount={hideAccount} />
            </View>
        </View>
    );
}
