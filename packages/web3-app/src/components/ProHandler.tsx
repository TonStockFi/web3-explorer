import { AccountMAM } from '@tonkeeper/core/dist/entries/account';
import { useActiveAccount } from '@tonkeeper/uikit/dist/state/wallet';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { useEffect, useState } from 'react';
import { useTheme } from 'styled-components';
import { usePro } from '../providers/ProProvider';
import ProService from '../services/ProService';
import { ProInfoProps } from '../types';
import { ProSettings } from './pro/ProSettings';

export function ProHandler() {
    const { showProBuyDialog, proInfo, onShowProBuyDialog } = usePro();
    const theme = useTheme();
    const account = useActiveAccount() as AccountMAM;
    const walletAccount = account.derivations.find(d => d.index === account.activeDerivationIndex)!;
    const accountTitle = `${account.emoji} ${account.name}`;
    const walletTitle = `${walletAccount.emoji} ${walletAccount.name}`;
    const [currentProInfo, setCurrentProInfo] = useState<ProInfoProps | null>(null);
    const [isLongProLevel, setIsLongProLevel] = useState<boolean>(false);
    const [ready, setReady] = useState<boolean>(false);

    useEffect(() => {
        new ProService(account.id).getAll().then(rows => {
            if (rows.find(row => row.level === 'LONG')) {
                setIsLongProLevel(true);
            } else {
                const res = rows.find(row => row.index === walletAccount.index);
                if (res) {
                    setCurrentProInfo(res);
                } else {
                    setCurrentProInfo(null);
                }
            }
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
                            top={12}
                            right={12}
                            icon={'Close'}
                            iconButtonSmall
                            onClick={() => {
                                onShowProBuyDialog(false);
                            }}
                        ></View>
                        <View sx={{ maxWidth: 800 }}>
                            {ready && (
                                <ProSettings
                                    accountIndex={walletAccount.index}
                                    isLongProLevel={isLongProLevel}
                                    currentProInfo={currentProInfo}
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
