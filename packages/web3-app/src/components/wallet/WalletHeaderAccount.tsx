import { AccountMAM } from '@tonkeeper/core/dist/entries/account';
import { Network } from '@tonkeeper/core/dist/entries/network';
import { useActiveAccount, useActiveTonNetwork } from '@tonkeeper/uikit/dist/state/wallet';
import { ExpandMoreIcon } from '@web3-explorer/uikit-mui/dist/mui/Icons';
import { View } from '@web3-explorer/uikit-view';
import { useState } from 'react';
import { useTheme } from 'styled-components';
import { useIAppContext } from '../../providers/IAppProvider';
import { WalletEmoji } from '../WalletEmoji';
export const WalletAccountListSx = {
    '& .MuiDialog-paper': {
        borderRadius: 3,
        width: 450,
        height: 500,
        maxHeight: 500
    }
};
export function WalletHeaderAccount({ hideAccount }: { hideAccount?: boolean }) {
    const account = useActiveAccount();
    const network = useActiveTonNetwork();

    const [showWaletAccountsList, setShowWaletAccountsList] = useState(false);
    const accountEmoji = account.emoji;
    const accountTitle = `${account.name}`;
    const { walletAside, showWalletAside } = useIAppContext();
    let walletTitle, emoji;
    if (account.type === 'mam') {
        const name = account.activeDerivation.name;
        emoji = account.activeDerivation.emoji;
        const { activeDerivationIndex } = account as AccountMAM;
        walletTitle = `# ${activeDerivationIndex + 1} ${name}`;
        if (name.indexOf(` ${activeDerivationIndex + 1}`) > -1) {
            walletTitle = `${name}`;
        }
    }
    const theme = useTheme();
    return null;
    return (
        <View jEnd aCenter>
            {/* <View
                drawer={{
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
            </View> */}
            {network === Network.TESTNET && <View mr={8} chip={'Testnet'} />}
            <View
                hide={account.type === 'mam'}
                onClick={() => showWalletAside(!walletAside)}
                button={accountTitle}
                buttonSize="small"
                buttonVariant="text"
                buttonStartIcon={<WalletEmoji containerSize="16px" emoji={accountEmoji} />}
                buttonEndIcon={<ExpandMoreIcon />}
                px={12}
                sx={{
                    '& .MuiButton-endIcon': {
                        ml: '4px'
                    }
                }}
            />
            <View
                hide={hideAccount || account.type !== 'mam'}
                onClick={() => showWalletAside(!walletAside)}
                button={walletTitle}
                buttonSize="small"
                buttonVariant="text"
                buttonStartIcon={<WalletEmoji containerSize="16px" emoji={emoji} />}
                buttonEndIcon={<ExpandMoreIcon />}
                px={12}
                sx={{
                    '& .MuiButton-endIcon': {
                        ml: '4px'
                    }
                }}
            />
        </View>
    );
}
