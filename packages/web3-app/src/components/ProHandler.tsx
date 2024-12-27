import { AccountMAM } from '@tonkeeper/core/dist/entries/account';
import { useActiveAccount } from '@tonkeeper/uikit/dist/state/wallet';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { useEffect, useState } from 'react';
import { useTheme } from 'styled-components';
import { getAccountIdFromAccount } from '../common/helpers';
import { usePro } from '../providers/ProProvider';
import ProService from '../services/ProService';
import { ProSettings } from './pro/ProSettings';

export function ProHandler() {
    const { showProBuyDialog, proInfo, updateProInfo, onShowProBuyDialog } = usePro();
    const theme = useTheme();
    const account = useActiveAccount() as AccountMAM;
    const walletAccount = account.derivations.find(d => d.index === account.activeDerivationIndex)!;
    const accountTitle = `${account.name}`;
    const walletTitle = `${walletAccount.name}`;

    const [ready, setReady] = useState<boolean>(false);

    useEffect(() => {
        new ProService(
            getAccountIdFromAccount({ id: account.id, index: account.activeDerivationIndex })
        )
            .getAll()
            .then(rows => {
                updateProInfo(rows);
                setReady(true);
            });
    }, [account, proInfo]);
    return (
        <View
            dialog={{
                dialogProps: {
                    sx: {
                        '& .MuiDialog-paper': {
                            borderRadius: 2,
                            bgcolor: theme.backgroundPage
                        }
                    },
                    fullScreen: false,
                    open: showProBuyDialog
                },
                content: (
                    <View wh100p row center relative>
                        <View
                            abs
                            zIdx={10}
                            top={12}
                            right={12}
                            icon={'Close'}
                            iconButtonSmall
                            onClick={() => {
                                onShowProBuyDialog(false);
                            }}
                        />
                        <View sx={{ maxWidth: 800 }}>
                            {ready && (
                                <ProSettings
                                    accountIndex={walletAccount.index}
                                    accountId={account.id}
                                    walletTitle={walletTitle}
                                    accountTitle={accountTitle}
                                />
                            )}
                        </View>
                    </View>
                )
            }}
        />
    );
}
