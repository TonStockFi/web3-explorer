import { TON_ASSET } from '@tonkeeper/core/dist/entries/crypto/asset/constants';
import { TonAsset } from '@tonkeeper/core/dist/entries/crypto/asset/ton-asset';
import { formatAddress } from '@tonkeeper/core/dist/utils/common';
import { useActiveAccount } from '@tonkeeper/uikit/dist/state/wallet';
import { useTranslation } from '@web3-explorer/lib-translation';
import { View } from '@web3-explorer/uikit-view';
import { useState } from 'react';
import { useTheme } from 'styled-components';
import { AccountDrawerSelect } from '../../../components/aside/AccountDrawerSelect';
import { MultiSendTable } from '../../../components/muti-send/MultiSendTable';
import { Page } from '../../../components/Page';
import { AsideWidth } from '../../../constant';
import { useBlockChainExplorer } from '../../../hooks/wallets';
import { useBrowserContext } from '../../../providers/BrowserProvider';
import { useIAppContext } from '../../../providers/IAppProvider';

export const DesktopMultiSendFormPage = () => {
    const { openUrl } = useBrowserContext();
    const { walletAside, showWalletAside } = useIAppContext();
    const { t } = useTranslation();
    const theme = useTheme();
    const [asset, setAsset] = useState<TonAsset>(TON_ASSET);
    const account = useActiveAccount();
    const address = formatAddress(account.activeTonWallet.rawAddress);
    const accountExplorer = useBlockChainExplorer();

    const [openWalletList, setOpenWalletList] = useState(false);
    let asideWidth = walletAside ? AsideWidth : 0;
    if (openWalletList) {
        asideWidth = AsideWidth;
    }

    return (
        <>
            <Page
                header={
                    <>
                        <View pl12 aCenter jEnd flex1>
                            <View row aCenter userSelectNone ml12 _D={{ asset }}>
                                <View
                                    mr12
                                    button={t('RecipientWallets')}
                                    onClick={() => {
                                        showWalletAside(false);
                                        setOpenWalletList(true);
                                    }}
                                    buttonVariant="outlined"
                                />
                                <View
                                    button={t('page_header_history')}
                                    onClick={() => openUrl(accountExplorer.replace('%s', address))}
                                    buttonVariant="outlined"
                                />
                            </View>
                        </View>
                    </>
                }
            >
                <MultiSendTable
                    onSent={() => {
                        openUrl(accountExplorer.replace('%s', address));
                    }}
                    asset={asset}
                    setAsset={(v: TonAsset) => setAsset(v)}
                    setOpenWalletList={(v: boolean) => {
                        setOpenWalletList(v);
                        showWalletAside(v);
                    }}
                />
            </Page>

            <View
                drawer={{
                    sx: {
                        '& .MuiPaper-root': {
                            top: 44,
                            overflow: 'hidden'
                        }
                    },
                    open: openWalletList,
                    anchor: 'right',
                    onClose: () => {
                        setOpenWalletList(false);
                    }
                }}
            >
                <View
                    column
                    pt={4}
                    h100vh
                    w={asideWidth}
                    overflowYAuto
                    miniScrollBar
                    bgColor={`${theme.backgroundContent}`}
                >
                    <AccountDrawerSelect onClose={() => setOpenWalletList(false)} />
                </View>
            </View>
        </>
    );
};
