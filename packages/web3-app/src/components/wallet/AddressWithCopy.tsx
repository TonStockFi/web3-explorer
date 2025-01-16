import { toShortValue } from '@tonkeeper/core/dist/utils/common';
import { CopyIcon, DoneIcon } from '@tonkeeper/uikit/dist/components/Icon';
import { useAppSdk } from '@tonkeeper/uikit/dist/hooks/appSdk';
import { useTranslation } from '@web3-explorer/lib-translation';

import { useActiveTonNetwork } from '@tonkeeper/uikit/dist/state/wallet';
import Mnemonic from '@web3-explorer/lib-crypto/dist/Mnemonic';
import Wallet from '@web3-explorer/lib-crypto/dist/Wallet';
import WalletEd25519 from '@web3-explorer/lib-crypto/dist/WalletEd25519';
import { View } from '@web3-explorer/uikit-view';
import { useSessionStorageState } from '@web3-explorer/utils';
import { useEffect, useRef, useState } from 'react';
import { Transition } from 'react-transition-group';
import styled, { useTheme } from 'styled-components';
import { useBlockChainExplorer, useGetMnemonic } from '../../hooks/wallets';
import { useBrowserContext } from '../../providers/BrowserProvider';
import AccountInfoService from '../../services/AccountInfoService';
import { CHAIN } from '../../types';

const DoneIconStyled = styled(DoneIcon)`
    color: ${p => p.theme.accentGreen};
    zoom: 0.8;
`;

const CopyIconStyled = styled(CopyIcon)`
    color: ${p => p.theme.textPrimary};
    cursor: pointer;
    zoom: 0.8;
`;
export function AddressWithCopy({
    showAddress,
    chain,
    accountIndex,
    hideChainView,
    accountId,
    address: adr
}: {
    chain?: CHAIN;
    accountId?: string;
    accountIndex?: number;
    hideChainView?: boolean;
    showAddress?: boolean;
    address: string;
}) {
    const { t } = useTranslation();
    const { openUrl } = useBrowserContext();

    const [copied, setIsCopied] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [address, setAddress] = useSessionStorageState(
        'adr_' + chain,
        Boolean(!chain || chain == CHAIN.TON) ? adr : ''
    );
    const ref = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const sdk = useAppSdk();
    const network = useActiveTonNetwork();
    const accountExplorer = useBlockChainExplorer(network, chain);
    const { mutateAsync: getMnemonic } = useGetMnemonic();

    useEffect(() => {
        console.log({ address, accountId, accountIndex }, chain);
        if (!address && accountId && accountIndex !== undefined && chain) {
            (async () => {
                const account = await new AccountInfoService(accountId).get(accountIndex);
                if (account && account.chainAddress && account.chainAddress[chain]) {
                    setAddress(account.chainAddress[chain]);
                } else {
                    const mnemonic = await getMnemonic({ accountId });
                    const mne = new Mnemonic(mnemonic);
                    if ([CHAIN.ETH, CHAIN.BNB].includes(chain)) {
                        const waletAccount = new Wallet(mne);

                        const { addressEIP55 } = waletAccount.getEthWallet(accountIndex);
                        setAddress(addressEIP55!);
                    } else if ([CHAIN.BTC].includes(chain)) {
                        const waletAccount = new Wallet(mne);

                        const { address } = waletAccount.getBtcWallet(accountIndex);
                        setAddress(address!);
                    } else if ([CHAIN.BTC].includes(chain)) {
                        const waletAccount = new Wallet(mne);

                        const { address } = waletAccount.getBtcWallet(accountIndex);
                        setAddress(address!);
                    } else if ([CHAIN.TRX].includes(chain)) {
                        const waletAccount = new Wallet(mne);
                        const { address } = waletAccount.getTronWallet(accountIndex);
                        setAddress(address!);
                    } else if ([CHAIN.SOL].includes(chain)) {
                        const waletAccount = new WalletEd25519(mnemonic);
                        const { address } = waletAccount.getSolWallet();
                        setAddress(address!);
                    } else if ([CHAIN.SUI].includes(chain)) {
                        const waletAccount = new WalletEd25519(mnemonic);
                        const { address } = waletAccount.getSuiWallet();
                        setAddress(address!);
                    } else if ([CHAIN.APT].includes(chain)) {
                        const waletAccount = new WalletEd25519(mnemonic);
                        const { address } = waletAccount.getAptosWallet();
                        setAddress(address!);
                    }
                }
            })();
        }
    }, [address, accountId, accountIndex, chain]);
    const transitionStyles = {
        entering: { opacity: 1 },
        entered: { opacity: 1 },
        exiting: { opacity: 0 },
        exited: { opacity: 0 },
        unmounted: { opacity: 0 }
    };

    const onCopy = (e: any) => {
        clearTimeout(timeoutRef.current);
        sdk.copyToClipboard(address);
        setIsCopied(true);
        timeoutRef.current = setTimeout(() => setIsCopied(false), 2000);
        e.preventDefault();
        e.stopPropagation();
        return false;
    };
    const theme = useTheme();

    return (
        <View row aCenter jEnd>
            <View
                ml={6}
                h100p
                row
                aCenter
                jEnd
                onMouseMove={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={onCopy}
            >
                <View
                    hide={showAddress ? undefined : !hovered}
                    center
                    mr={6}
                    textProps={{ fontSize: '0.8rem' }}
                    text={toShortValue(address)}
                />
                <View hide={hovered || !address} center mr={0}>
                    <CopyIconStyled />
                </View>
                <View aCenter displayNone={!hovered}>
                    <Transition
                        nodeRef={ref}
                        in={hovered}
                        timeout={200}
                        onExited={() => setIsCopied(false)}
                    >
                        {state => (
                            <View
                                aCenter
                                sx={{
                                    transition: 'opacity 0.15s ease-in-out'
                                }}
                                ref={ref}
                                opacity={transitionStyles[state].opacity}
                            >
                                {copied ? <DoneIconStyled /> : <CopyIconStyled />}
                            </View>
                        )}
                    </Transition>
                </View>
            </View>
            {Boolean(!hideChainView && address) && (
                <View
                    ml={6}
                    hide={hovered && !showAddress}
                    icon={'Language'}
                    iconFontSize="0.8rem"
                    tips={t('transaction_view_in_explorer')}
                    iconButton={{ sx: { color: theme.textPrimary } }}
                    iconButtonSmall
                    onClick={(e: any) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const url = accountExplorer.replace('%s', address);
                        openUrl(url);
                        return false;
                    }}
                />
            )}
        </View>
    );
}
