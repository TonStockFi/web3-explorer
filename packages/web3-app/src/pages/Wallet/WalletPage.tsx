import { CryptoCurrency } from '@tonkeeper/core/dist/entries/crypto';
import { View } from '@web3-explorer/uikit-view';
import { useEffect } from 'react';
import { WalletList } from '../../components/app/WalletList';
import { DesktopTokens } from '../../components/wallet/DesktopTokens';
import { WalletTop } from '../../components/wallet/WalletTop';
import { useIAppContext } from '../../providers/IAppProvider';
import { CoinPage } from './coin/DesktopCoinPage';

export function WalletPage() {
    const { selectedToken, showWalletList, onSelectToken } = useIAppContext();
    useEffect(() => {
        onSelectToken('');
    }, []);
    if (showWalletList) {
        return (
            <View absFull>
                <WalletList></WalletList>
            </View>
        );
    }
    return (
        <View absFull>
            <View
                hide={!!selectedToken}
                h100p
                column
                relative
                flx
                overflowHidden
                sx={{ margin: '0 auto', maxWidth: '800px', width: '100%' }}
            >
                <WalletTop />
                <View abs xx0 bottom={0} top={184} overflowYAuto>
                    <View px12 pt12>
                        <DesktopTokens
                            onClick={(token: 'ton' | string) => {
                                onSelectToken(token);
                            }}
                        />
                    </View>
                </View>
            </View>

            <View hide={!selectedToken} sx={{ margin: '0 auto', maxWidth: '800px', width: '100%' }}>
                <View h={56} ml12 rowVCenter jStart>
                    <View
                        onClick={() => onSelectToken('')}
                        icon="Back"
                        iconButtonSmall
                        iconButton={{
                            sx: { borderRadius: '50%' }
                        }}
                        iconProps={{ fontSize: 'small' }}
                    />
                </View>
                <CoinPage
                    onClose={() => {
                        onSelectToken('');
                    }}
                    token={selectedToken === 'ton' ? CryptoCurrency.TON : selectedToken}
                />
            </View>
        </View>
    );
}
