import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from '../../../hooks/translation';
import { fallbackRenderOver } from '../../Error';
import { DesktopHeaderContainer } from './DesktopHeaderElements';
import { useActiveAccount } from '../../../state/wallet';
import { formatAddress, toShortValue } from '@tonkeeper/core/dist/utils/common';
import { View } from '@web3-explorer/uikit-view';
import { WalletEmoji } from '../../shared/emoji/WalletEmoji';

const DesktopDeviceHeaderPayload = () => {
    const account = useActiveAccount();
    const activeWallet = account.activeTonWallet;
    const address = formatAddress(activeWallet.rawAddress);
    const { t } = useTranslation();
    const name = account.type === 'mam' ? account.activeDerivation.name : account.name;
    const emoji = account.type === 'mam' ? account.activeDerivation.emoji : account.emoji;
    return (
        <DesktopHeaderContainer>
            <View row jStart aCenter h={50}>
                <WalletEmoji emoji={emoji} emojiSize="24px" containerSize="24px" />
                <View row aCenter pl12 h100p text={name || t('wallet_title')} />
                <View
                    row
                    aEnd
                    pl={8}
                    pb={24}
                    h100p
                    textProps={{ fontSize: '0.65rem' }}
                    text={toShortValue(address)}
                />
            </View>
        </DesktopHeaderContainer>
    );
};

export const DesktopDeviceHeader = () => {
    return (
        <ErrorBoundary fallbackRender={fallbackRenderOver('Failed to display desktop header')}>
            <DesktopDeviceHeaderPayload />
        </ErrorBoundary>
    );
};
