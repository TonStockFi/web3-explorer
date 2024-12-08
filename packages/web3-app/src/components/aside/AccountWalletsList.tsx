import { AccountMAM } from '@tonkeeper/core/dist/entries/account';
import { WalletId } from '@tonkeeper/core/dist/entries/wallet';
import {
    useAccountsState,
    useActiveAccount,
    useMutateActiveTonWallet
} from '@tonkeeper/uikit/dist/state/wallet';
import { useCallback, useState } from 'react';
import styled from 'styled-components';

import { PlusIcon } from '@tonkeeper/uikit/dist/components/Icon';
import { Label2 } from '@tonkeeper/uikit/dist/components/Text';

import { formatAddress } from '@tonkeeper/core/dist/utils/common';
import { WalletIndexBadge } from '@tonkeeper/uikit/dist/components/account/AccountBadge';
import FormControl from '@web3-explorer/uikit-mui/dist/mui/FormControl';
import { ExpandMoreIcon } from '@web3-explorer/uikit-mui/dist/mui/Icons';
import Input from '@web3-explorer/uikit-mui/dist/mui/Input';
import InputAdornment from '@web3-explorer/uikit-mui/dist/mui/InputAdornment';
import { View } from '@web3-explorer/uikit-view';
import { useTheme } from 'styled-components';
import { hexToRGBA } from '../../common/utils';
import { useCreateMAMAccountDerivation } from '../../hooks/wallets';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { MAIN_NAV_TYPE } from '../../types';
import { WalletBatchCreateNumber } from '../accounts/WalletBatchCreateNumber';
import { AddressWithCopy } from '../wallet/AddressWithCopy';
import { ToggleActiveAccount } from '../wallet/ToggleActiveAccount';
import { WalletAccountsList } from '../wallet/WalletAccountsList';
import { WalletEmoji } from '../WalletEmoji';
import { AccountsPager } from './AccountsPager';
import { NetworkView } from './NetworkView';

const AsideMenuItem = styled.div<{ isSelected: boolean }>`
    border-radius: ${p => p.theme.corner2xSmall};
    box-sizing: border-box;
    cursor: pointer;
    padding: 6px 10px;
    width: 100%;
    height: 36px;
    min-height: 36px;
    display: flex;
    align-items: center;
    gap: 10px;

    & > * {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

    transition: background-color 0.15s ease-in-out;
    background: ${p => (p.isSelected ? p.theme.backgroundContentAttention : undefined)};

    &:hover {
        background: ${p => hexToRGBA(p.theme.backgroundContentTint, 0.56)};
    }
`;
const IconAction = styled(AsideMenuItem)<{ isSelected: boolean }>`
    zoom: 0.8;
    padding: 6px 10px;
    gap: 0;
`;

const IconWrapper = styled.div`
    color: ${p => p.theme.iconSecondary};
    height: fix-content;
    > svg {
        display: block;
    }
`;

export const AccountWalletsList = () => {
    const activeAcount = useActiveAccount();
    const accounts = useAccountsState();
    const { openTab } = useBrowserContext();
    const [showWaletAccountsList, setShowWaletAccountsList] = useState(activeAcount.type !== 'mam');

    const { t, currentTabId } = useBrowserContext();
    const [searchVal, setSearchVal] = useState('');

    const { mutateAsync: setActiveWallet } = useMutateActiveTonWallet();

    const { mutateAsync: createDerivation } = useCreateMAMAccountDerivation();

    const onClickWallet = useCallback(
        (walletId: WalletId) => setActiveWallet(walletId),
        [setActiveWallet]
    );

    const [openSetCountDialog, setOpenSetCountDialog] = useState(false);

    const accountMAM = activeAcount as AccountMAM;
    const { derivations, activeDerivationIndex } = accountMAM;
    const limit = 20;
    const [page, setPage] = useState(Math.floor(activeDerivationIndex / limit));
    const { showWalletAside } = useIAppContext();

    const onCreateDerivation = async () => {
        setOpenSetCountDialog(true);
    };
    const theme = useTheme();
    const { showBackdrop } = useIAppContext();
    if (showWaletAccountsList) {
        return (
            <WalletAccountsList
                onBack={() => {
                    setPage(0);
                    setShowWaletAccountsList(false);
                }}
            />
        );
    }
    if (activeAcount.type !== 'mam' || accounts.length === 0) {
        return null;
    }

    let walletsList = derivations.slice();

    if (searchVal) {
        const searchValueNum = Number(searchVal);
        if (!isNaN(searchValueNum)) {
            walletsList = walletsList.filter(row => row.index + 1 === searchValueNum);
        } else {
            walletsList = walletsList.filter(
                row => row.name.toLowerCase().indexOf(searchVal.toLowerCase()) > -1
            );
        }
    }
    const total = walletsList.length;

    walletsList.sort((a, b) => a.index - b.index);
    let wallets = walletsList.slice(page * limit, (page + 1) * limit);
    return (
        <>
            <View px={8} flx aCenter column>
                <View relative w100p row jSpaceBetween aCenter h={48}>
                    <View row aCenter jStart>
                        <View
                            onClick={() => setShowWaletAccountsList(true)}
                            button={activeAcount.name}
                            buttonVariant="text"
                            buttonStartIcon={
                                <WalletEmoji containerSize="16px" emoji={activeAcount.emoji} />
                            }
                            buttonEndIcon={<ExpandMoreIcon />}
                            px={12}
                            sx={{
                                '& .MuiButton-endIcon': {
                                    ml: '4px'
                                }
                            }}
                        />
                    </View>
                    <View rowVCenter jEnd>
                        <NetworkView />
                        <View
                            hide
                            mr={4}
                            tips={t('close')}
                            iconButton
                            iconButtonSmall
                            iconSmall
                            iconProps={{ sx: { color: theme.textPrimary } }}
                            icon={'Close'}
                            onClick={() => showWalletAside(false)}
                        />
                        <View
                            mr={4}
                            tips={t('Settings')}
                            iconButton
                            iconButtonSmall
                            iconSmall
                            iconProps={{ sx: { width: 18, height: 18, color: theme.textPrimary } }}
                            icon={'Settings'}
                            onClick={() => {
                                showWalletAside(false);
                                openTab(MAIN_NAV_TYPE.ACCOUNTS_MANAGE);
                            }}
                        />
                    </View>
                </View>
                <View divider />
                <View mt={2} mb={2} borderBox pl12 row jSpaceBetween aCenter w100p>
                    <View aCenter flex1 mr={4} pb={2} mt={4}>
                        <FormControl
                            size="small"
                            sx={{ pb: 0.5, borderBottom: `1px solid ${theme.separatorCommon}` }}
                            variant="standard"
                        >
                            <Input
                                disableUnderline
                                sx={{
                                    fontSize: '0.75rem',
                                    '& .MuiInputBase-input': {
                                        padding: 0
                                    },
                                    '& .MuiInputBase-root': {
                                        borderBottom: `1px solid ${theme.separatorCommon}`
                                    }
                                }}
                                value={searchVal}
                                onChange={(e: any) => {
                                    const { value } = e.target;
                                    if (value) {
                                        setPage(0);
                                    } else {
                                        setPage(Math.floor(activeDerivationIndex / limit));
                                    }
                                    setSearchVal(value ? value.trim() : '');
                                }}
                                placeholder={t('Search')}
                                id="search_wallet_inddex"
                                type="search"
                                startAdornment={
                                    <InputAdornment position="start">
                                        <View icon="Search" iconSmall />
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
                    </View>
                    <View aCenter jEnd>
                        <View center tips={t('add_sub_wallet')} mr={3}>
                            <IconAction isSelected={false} onClick={onCreateDerivation}>
                                <IconWrapper>
                                    <PlusIcon />
                                </IconWrapper>
                            </IconAction>
                        </View>
                    </View>
                </View>
            </View>
            <View pt={4} px={8} flex1 column>
                {wallets.map(wallet => {
                    const address = formatAddress(wallet.tonWallets[0].rawAddress);
                    return (
                        <View pl={4} key={wallet.index}>
                            <AsideMenuItem
                                onClick={() => {
                                    if (currentTabId !== MAIN_NAV_TYPE.WALLET) {
                                        showWalletAside(false);
                                    }

                                    onClickWallet(wallet.activeTonWalletId);
                                }}
                                isSelected={activeDerivationIndex === wallet.index}
                            >
                                <View wh100p jSpaceBetween aCenter row>
                                    <View aCenter jStart row>
                                        <ToggleActiveAccount
                                            isActived={
                                                wallet.index === accountMAM.activeDerivationIndex
                                            }
                                        />
                                        <WalletEmoji
                                            emojiSize="16px"
                                            containerSize="16px"
                                            emoji={wallet.emoji}
                                        />
                                        <View aCenter px={8}>
                                            <Label2>{wallet.name}</Label2>
                                        </View>
                                        <WalletIndexBadge size="s">
                                            {'#' + (wallet.index + 1)}
                                        </WalletIndexBadge>
                                    </View>
                                    <AddressWithCopy address={address} />
                                </View>
                            </AsideMenuItem>
                        </View>
                    );
                })}
            </View>
            <View
                borderBox
                h={44}
                pb={4}
                px={8}
                flx
                sx={{
                    borderTop: total > limit ? `1px solid ${theme.separatorCommon}` : 'none'
                }}
            >
                <AccountsPager
                    total={total}
                    limit={limit}
                    page={page}
                    setPage={(p: number) => setPage(p)}
                />
            </View>

            <View
                dialog={{
                    dialogProps: {
                        open: openSetCountDialog,
                        sx: {
                            '& .MuiDialog-paper': { width: 850, height: 400 }
                        }
                    },
                    content: (
                        <View wh100p row aCenter center bgColor={theme.backgroundPage}>
                            <View p={12}>
                                <WalletBatchCreateNumber
                                    onClose={() => {
                                        setOpenSetCountDialog(false);
                                    }}
                                    submitHandler={async ({ count }: { count: number }) => {
                                        setOpenSetCountDialog(false);
                                        showBackdrop(true);
                                        showBackdrop(true);
                                        const d = await createDerivation({
                                            accountId: accountMAM.id,
                                            count: count
                                        });
                                        if (d) {
                                            await onClickWallet(d.activeTonWalletId);
                                        }
                                        showBackdrop(false);
                                        setPage(Math.ceil((total + count) / limit) - 1);
                                    }}
                                />
                            </View>
                        </View>
                    )
                }}
            />
        </>
    );
};
