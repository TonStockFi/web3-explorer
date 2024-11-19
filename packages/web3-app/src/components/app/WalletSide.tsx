import { AccountMAM } from '@tonkeeper/core/dist/entries/account';
import { useActiveAccount } from '@tonkeeper/uikit/dist/state/wallet';
import { View } from '@web3-explorer/uikit-view';
import { AsideWidth } from '../../constant';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { AsideMenu } from '../aside/AsideMenu';

export const WalletSide = () => {
    const account = useActiveAccount();
    let accountEmoji = account.emoji;
    let accountTitle = `${account.name}`;
    const { walletAside, showWalletAside } = useIAppContext();
    const { theme } = useBrowserContext();
    const { env } = useIAppContext();
    if (account.type === 'mam') {
        const name = account.activeDerivation.name;
        accountEmoji = account.activeDerivation.emoji;
        const { activeDerivationIndex } = account as AccountMAM;
        accountTitle = `# ${activeDerivationIndex + 1} ${name}`;
        // address = account.derivations[activeDerivationIndex].tonWallets[0].rawAddress;
        if (name.indexOf(` ${activeDerivationIndex + 1}`) > -1) {
            accountTitle = `${name}`;
        }
    }

    return (
        <View center w100p h100p>
            <View
                hoverBgColor={theme.backgroundContentAttention}
                bgColor={theme.backgroundContentTint}
                center
                rowVCenter
                onClick={() => showWalletAside(true)}
                pointer
                borderRadius={4}
                borderBox
                px={8}
                py={4}
                overflowHidden
                mb={4}
            >
                <View
                    center
                    overflowHidden
                    w={16}
                    h={16}
                    text={accountEmoji.substring(0, 2)}
                    textFontSize="0.9rem"
                />
                <View
                    mt={2}
                    ml={8}
                    rowVCenter
                    textFontSize="0.9rem"
                    text={`${accountTitle}`}
                    mr12
                />
                <View iconSmall icon="MoreVert" />
            </View>

            <View
                drawer={{
                    sx: { '& .MuiPaper-root': { top: 0 } },
                    open: walletAside,
                    anchor: 'right',
                    onClose: () => showWalletAside(false)
                }}
            >
                <View
                    sx={{ color: theme.textPrimary }}
                    column
                    h100vh
                    w={AsideWidth}
                    bgColor={`${theme.backgroundContent}`}
                >
                    <AsideMenu asideWidth={AsideWidth} />
                </View>
            </View>
        </View>
    );
};
