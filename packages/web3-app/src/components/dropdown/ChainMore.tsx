import { useTranslation } from '@web3-explorer/lib-translation';

import { FC, useState } from 'react';

import { DropDownContent, DropDownItem } from '@tonkeeper/uikit/dist/components/DropDown';
import { EllipsisIcon } from '@tonkeeper/uikit/dist/components/Icon';
import { Label2 } from '@tonkeeper/uikit/dist/components/Text';
import { SelectDropDown } from '@tonkeeper/uikit/dist/components/fields/Select';
import { useRecoveryNotification } from '@tonkeeper/uikit/dist/components/modals/RecoveryNotificationControlled';
import Mnemonic from '@web3-explorer/lib-crypto/dist/Mnemonic';
import Wallet from '@web3-explorer/lib-crypto/dist/Wallet';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { QRCode } from 'react-qrcode-logo';
import styled, { useTheme } from 'styled-components';
import { useGetMnemonic } from '../../hooks/wallets';
import { CHAIN } from '../../types';
import { KeyIcon } from '../WalletEmoji';

const Icon = styled.span`
    display: flex;
    color: ${props => props.theme.iconSecondary};
`;

const DropDownStyled = styled(SelectDropDown)`
    margin-left: auto;
    width: fit-content;
`;

const DropDownItemStyled = styled(DropDownItem)`
    &:not(:last-child) {
        border-bottom: 1px solid ${p => p.theme.separatorCommon};
    }
`;

const IconWrapper = styled.div`
    margin-left: auto;
    display: flex;
    width: 14px;
    color: ${p => p.theme.accentBlue};
`;

const ButtonsContainer = styled.div`
    margin-left: auto;
    display: flex;
    gap: 8px;
`;

export const ChainMore: FC<{
    walletId: string;
    accountIndex: number;
    chain: CHAIN;
    accountId: string;
    right?: string;
    top?: string;
    onSelectChainAccount?: ({
        walletIndex,
        address
    }: {
        walletIndex: number;
        address: string;
    }) => void;
}> = ({ accountId, chain, walletId, accountIndex, right, top }) => {
    const { onOpen: recovery } = useRecoveryNotification();
    const { mutateAsync: getMnemonic } = useGetMnemonic();
    const [prvKey, setPrvKey] = useState('');
    const { t } = useTranslation();
    const options = [
        {
            name: t('私钥'),
            onClick: async () => {
                if (chain === CHAIN.TON) {
                    recovery({ accountId, walletId });
                } else {
                    const mnemonic = await getMnemonic({ accountId });
                    const mne = new Mnemonic(mnemonic);
                    let prvKey1 = '';
                    if ([CHAIN.ETH, CHAIN.BNB].includes(chain)) {
                        const waletAccount = new Wallet(mne);
                        const { prvKey } = waletAccount.getEthWallet(accountIndex, true);
                        prvKey1 = prvKey;
                    } else if ([CHAIN.BTC].includes(chain)) {
                        const waletAccount = new Wallet(mne);
                        const { prvKey } = waletAccount.getBtcWallet(accountIndex, true);
                        prvKey1 = prvKey;
                    } else if ([CHAIN.BTC].includes(chain)) {
                        const waletAccount = new Wallet(mne);
                        const { prvKey } = waletAccount.getBtcWallet(accountIndex, true);
                        prvKey1 = prvKey;
                    } else if ([CHAIN.TRX].includes(chain)) {
                        const waletAccount = new Wallet(mne);
                        const { prvKey } = waletAccount.getTronWallet(accountIndex, true);
                        prvKey1 = prvKey;
                    }
                    setPrvKey(prvKey1.toString());
                    //  else if ([CHAIN.SOL].includes(chain)) {
                    //     const waletAccount = new WalletEd25519(mnemonic);
                    //     const { address } = waletAccount.getSolWallet();
                    // } else if ([CHAIN.SUI].includes(chain)) {
                    //     const waletAccount = new WalletEd25519(mnemonic);
                    //     const { address } = waletAccount.getSuiWallet();
                    // } else if ([CHAIN.APT].includes(chain)) {
                    //     const waletAccount = new WalletEd25519(mnemonic);
                    //     const { address } = waletAccount.getAptosWallet();
                    // }
                }
            },
            icon: <KeyIcon />
        }
    ];
    const theme = useTheme();
    return (
        <>
            <View
                dialog={{
                    dialogProps: {
                        open: !!prvKey,
                        onClose: () => {
                            setPrvKey('');
                        },
                        sx: {
                            '& .MuiDialog-paper': { width: 850, height: 550 }
                        }
                    },
                    content: (
                        <View wh100p row aCenter center bgColor={theme.backgroundPage}>
                            <View
                                iconButtonSmall
                                icon={'Close'}
                                abs
                                top={12}
                                right={12}
                                onClick={() => {
                                    setPrvKey('');
                                }}
                            ></View>
                            <View
                                p={24}
                                w={400}
                                center
                                bgColor={theme.backgroundBrowserActive}
                                border={`1px solid ${theme.separatorCommon}`}
                                borderRadius={8}
                                column
                            >
                                <View mb12 px12>
                                    <View text={prvKey}></View>
                                </View>
                                <View borderRadius={12} overflowHidden>
                                    <QRCode
                                        size={240}
                                        value={prvKey}
                                        logoImage={'https://web3r.site/coin-256x256.png'}
                                        logoPadding={8}
                                        qrStyle="dots"
                                        eyeRadius={{
                                            inner: 2,
                                            outer: 16
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    )
                }}
            />
            <ButtonsContainer>
                <DropDownStyled
                    right={right || '0'}
                    top={top || '0'}
                    payload={onClose => (
                        <DropDownContent>
                            {options.map(option => (
                                <DropDownItemStyled
                                    onClick={() => {
                                        onClose();
                                        option.onClick();
                                    }}
                                    isSelected={false}
                                    key={option.name}
                                >
                                    <Label2>{option.name}</Label2>
                                    <IconWrapper>{option.icon}</IconWrapper>
                                </DropDownItemStyled>
                            ))}
                        </DropDownContent>
                    )}
                >
                    <Icon>
                        <EllipsisIcon />
                    </Icon>
                </DropDownStyled>
            </ButtonsContainer>
        </>
    );
};
