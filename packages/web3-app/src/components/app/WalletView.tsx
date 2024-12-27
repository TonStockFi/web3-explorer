import { View } from '@web3-explorer/uikit-view';
import { WalletPage } from '../../pages/Wallet/WalletPage';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';

export const WalletView = () => {
    const { showWallet, onShowWallet } = useIAppContext();
    const { theme } = useBrowserContext();
    return (
        <View hide={!showWallet}>
            <View
                position={'fixed'}
                onClick={() => onShowWallet(false)}
                xx0
                zIdx={99}
                top0
                bottom0
            ></View>
            <View
                sx={{
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 44,
                    left: 100,
                    width: 10,
                    height: 10,
                    opacity: 1,
                    backgroundColor: theme.backgroundBrowser,
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 101,
                    transition: 'opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
                }}
            ></View>
            <View
                abs
                top={44}
                width={390}
                height={720}
                zIdx={100}
                sx={{
                    border: `1px solid ${theme.separatorCommon}`,
                    boxShadow: ' 0px 4px 16px rgba(0, 0, 0, 0.16)'
                }}
                left={12}
                bgColor={theme.backgroundBrowser}
                borderBox
                borderRadius={8}
                overflowHidden
            >
                <WalletPage />
            </View>
        </View>
    );
};
