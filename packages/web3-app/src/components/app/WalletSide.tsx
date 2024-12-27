import { AccountMAM } from '@tonkeeper/core/dist/entries/account';
import { Network } from '@tonkeeper/core/dist/entries/network';
import { useActiveAccount, useActiveTonNetwork } from '@tonkeeper/uikit/dist/state/wallet';
import { View } from '@web3-explorer/uikit-view';
import { ImageIcon } from '@web3-explorer/uikit-view/dist/icons/ImageIcon';
import { useTranslation } from 'react-i18next';
import { AsideWidth, ChainsList } from '../../constant';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { AsideMenu } from '../aside/AsideMenu';
import { WalletEmoji } from '../WalletEmoji';

export const WalletSide = () => {
    const account = useActiveAccount();
    const { currentChainCode } = useIAppContext();
    let accountEmoji = account.emoji;
    let accountTitle = `${account.name}`;
    const { walletAside, showWalletAside, onShowChainList, onShowWallet } = useIAppContext();
    const { theme } = useBrowserContext();
    const network = useActiveTonNetwork();

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
    const { t } = useTranslation();
    const currentChain = ChainsList.find(row => row.chain === currentChainCode);
    return (
        <View center w100p h100p relative>
            <View
                iconButtonSmall
                onClick={() => onShowChainList(true)}
                tips={currentChain?.name}
                icon={<ImageIcon size={20} icon={currentChain?.icon!} />}
            ></View>
            <View
                mr={4}
                tips={t('切换账户')}
                onClick={() => showWalletAside(true)}
                sx={{ '& svg': { zoom: 1.5 } }}
                iconButtonSmall
                icon={'AiOutlineUserSwitch'}
            ></View>
            <View
                buttonOutlined={`${accountEmoji} ${accountTitle}`}
                onClick={() => onShowWallet(true)}
                tips={t('wallet_title')}
                icon={'AccountBalanceWallet'}
                buttonEndIcon={
                    <View iconProps={{ sx: { width: 14, height: 12 } }} icon={'ExpandMore'}></View>
                }
            ></View>
            <View
                hide
                hoverBgColor={theme.backgroundContentAttention}
                bgColor={network === Network.TESTNET ? 'red' : theme.backgroundContentTint}
                center
                rowVCenter
                onClick={() => showWalletAside(true)}
                pointer
                borderRadius={4}
                tips={network === Network.TESTNET ? '测试网' : '主网'}
                borderBox
                px={8}
                py={4}
                sx={{
                    borderLeft: `1px solid ${theme.separatorCommon}`
                }}
                overflowHidden
                mb={4}
            >
                <WalletEmoji emojiSize="16px" emoji={accountEmoji} />
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
