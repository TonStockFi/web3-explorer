import { AccountMAM } from '@tonkeeper/core/dist/entries/account';
import { Network } from '@tonkeeper/core/dist/entries/network';
import { useActiveAccount, useActiveTonNetwork } from '@tonkeeper/uikit/dist/state/wallet';
import { useTranslation } from '@web3-explorer/lib-translation';
import { View } from '@web3-explorer/uikit-view';
import { ImageIcon } from '@web3-explorer/uikit-view/dist/icons/ImageIcon';
import { AsideWidth, ChainsList, WALLET_LIST_WIDTH } from '../../constant';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { AsideMenu } from '../aside/AsideMenu';
import { WalletEmoji } from '../WalletEmoji';
import { WalletList } from './WalletList';

export const WalletSide = () => {
    const account = useActiveAccount();
    const { currentChainCode } = useIAppContext();
    let accountEmoji = account.emoji;
    let accountTitle = `${account.name}`;
    const { walletAside, onShowWalletList, showWalletList, showWalletAside, onShowChainList } =
        useIAppContext();
    const { theme } = useBrowserContext();
    const network = useActiveTonNetwork();

    if (account.type === 'mam') {
        const name = account.activeDerivation.name;
        accountEmoji = account.activeDerivation.emoji;
        const { activeDerivationIndex } = account as AccountMAM;
        accountTitle = `# ${activeDerivationIndex + 1} ${name}`;
        if (name.indexOf(` ${activeDerivationIndex + 1}`) > -1) {
            accountTitle = `${name}`;
        }
    }
    const { t } = useTranslation();
    const currentChain = ChainsList.find(row => row.chain === currentChainCode);
    return (
        <View jStart aCenter w100p h100p relative p12>
            <View
                drawer={{
                    onClose: () => {
                        onShowWalletList(false);
                    },
                    open: showWalletList,
                    anchor: 'right'
                }}
            >
                <View width={WALLET_LIST_WIDTH}>
                    <WalletList></WalletList>
                </View>
            </View>
            <View
                hide
                iconButtonSmall
                onClick={() => onShowChainList(true)}
                tips={currentChain?.name}
                icon={<ImageIcon size={20} icon={currentChain?.icon!} />}
            ></View>

            <View
                rowVCenter
                pointer
                hoverBgColor={theme.backgroundContentAttention}
                onClick={() => onShowWalletList(true)}
                px={12}
                py={2}
                borderRadius={4}
                border={`1px solid ${theme.separatorCommon}`}
            >
                <WalletEmoji emojiSize="16px" containerSize="16px" emoji={accountEmoji} />
                <View ml={8} mr={6} text={`${accountTitle}`} textSmall></View>
                <View mt={4}>
                    <View iconProps={{ sx: { width: 14, height: 12 } }} icon={'MoreVert'}></View>
                </View>
            </View>
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
