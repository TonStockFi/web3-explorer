import { AccountMAM } from '@tonkeeper/core/dist/entries/account';
import { WalletId } from '@tonkeeper/core/dist/entries/wallet';
import {
    useAccountsState,
    useActiveAccount,
    useMutateActiveTonWallet
} from '@tonkeeper/uikit/dist/state/wallet';
import { useCallback, useState } from 'react';
import styled from 'styled-components';

import { Label2 } from '@tonkeeper/uikit/dist/components/Text';

import { formatAddress } from '@tonkeeper/core/dist/utils/common';
import { WalletIndexBadge } from '@tonkeeper/uikit/dist/components/account/AccountBadge';
import FormControl from '@web3-explorer/uikit-mui/dist/mui/FormControl';
import Input from '@web3-explorer/uikit-mui/dist/mui/Input';
import InputAdornment from '@web3-explorer/uikit-mui/dist/mui/InputAdornment';
import { View } from '@web3-explorer/uikit-view';
import { useTheme } from 'styled-components';
import { hexToRGBA } from '../../common/utils';
import { useCreateMAMAccountDerivation } from '../../hooks/wallets';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { MAIN_NAV_TYPE } from '../../types';
import { AccountMoreView } from '../accounts/AccountMoreView';
import { WalletBatchCreateNumber } from '../accounts/WalletBatchCreateNumber';
import { AccountsPager } from '../aside/AccountsPager';
import { ToggleActiveAccount } from '../wallet/ToggleActiveAccount';
import { WalletEmoji } from '../WalletEmoji';
import { ChainListView } from './ChainListView';
import { SocialPlatformListView } from './SocialPlatformListView';

const AsideMenuItem = styled.div<{ isSelected: boolean }>`
    border-radius: ${p => p.theme.corner2xSmall};
    box-sizing: border-box;
    padding: 0px 10px;
    width: 100%;
    height: 36px;
    min-height: 36px;
    display: flex;
    align-items: center;
    gap: 10px;

    & > * {
        text-overflow: ellipsis;
        white-space: nowrap;
        // overflow: hidden;
    }

    transition: background-color 0.15s ease-in-out;
    background: ${p => (p.isSelected ? p.theme.backgroundContentAttention : undefined)};

    &:hover {
        background: ${p => hexToRGBA(p.theme.backgroundContentTint, 0.56)};
    }
`;

export const WalletList = () => {
    const activeAcount = useActiveAccount();
    const accounts = useAccountsState();
    const { currentChainCode } = useIAppContext();

    const { showWalletAside } = useIAppContext();
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
    const limit = 16;
    const [page, setPage] = useState(Math.floor(activeDerivationIndex / limit));
    const { onShowWalletList, onShowChainList, onShowSocialPlatformList, showSocialPlatformList } =
        useIAppContext();

    const onCreateDerivation = async () => {
        setOpenSetCountDialog(true);
    };
    const theme = useTheme();
    const { showBackdrop } = useIAppContext();

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
    const [selectChainAccount, onSelectChainAccount] = useState<null | {
        walletIndex: number;
        walletId?: string;
        address: string;
    }>(null);
    return (
        <View absFull>
            {selectChainAccount && (
                <SocialPlatformListView selectChainAccount={selectChainAccount} />
            )}
            {selectChainAccount && <ChainListView selectChainAccount={selectChainAccount} />}
            <View
                flx
                aCenter
                column
                abs
                top0
                xx0
                h={44}
                rowVCenter
                borderBox
                sx={{
                    borderBottom: `1px solid ${theme.separatorCommon}`
                }}
            >
                <View mt={3} mb={2} borderBox pl12 rowVCenter jSpaceBetween aCenter w100p>
                    <View aCenter flex1>
                        <View text={'切换帐户'}></View>
                        <View hide>
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
                    </View>
                    <View aCenter jEnd>
                        <View
                            ml={6}
                            tips={t('切换主账户')}
                            onClick={() => showWalletAside(true)}
                            sx={{ '& svg': { zoom: 1.5 } }}
                            iconButtonSmall
                            icon={'AiOutlineUserSwitch'}
                        ></View>
                        <View
                            ml={6}
                            iconButtonSmall
                            icon={'Add'}
                            tips={t('add_sub_wallet')}
                            onClick={onCreateDerivation}
                        ></View>
                        <View
                            ml={6}
                            mr12
                            tips={t('close')}
                            iconButtonSmall
                            icon={'Close'}
                            onClick={() => {
                                onShowWalletList(false);
                            }}
                        ></View>
                    </View>
                </View>
            </View>
            <View px={8} borderBox py={12} flex1 column absFull top={44} bottom={44} overflowYAuto>
                {wallets.map(wallet => {
                    const address = formatAddress(wallet.tonWallets[0].rawAddress);
                    return (
                        <View key={wallet.index} mb={6}>
                            <AsideMenuItem isSelected={activeDerivationIndex === wallet.index}>
                                <View wh100p jSpaceBetween aCenter row>
                                    <View
                                        aCenter
                                        pointer
                                        jStart
                                        row
                                        onClick={() => {
                                            onClickWallet(wallet.activeTonWalletId);
                                            if (currentTabId !== MAIN_NAV_TYPE.WALLET) {
                                                onShowWalletList(false);
                                            }
                                        }}
                                    >
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
                                    <View rowVCenter aCenter jEnd>
                                        <View rowVCenter mx12>
                                            <View
                                                buttonProps={{
                                                    sx: {
                                                        fontSize: '0.7rem'
                                                    }
                                                }}
                                                buttonStartIcon={
                                                    <View
                                                        iconProps={{ sx: { width: 10 } }}
                                                        icon={'Diversity1'}
                                                    ></View>
                                                }
                                                buttonOutlined="社交"
                                                onClick={() => {
                                                    onSelectChainAccount({
                                                        walletIndex: wallet.index,
                                                        address
                                                    });
                                                    onShowSocialPlatformList(true);
                                                }}
                                            ></View>
                                        </View>
                                        <View
                                            buttonProps={{
                                                sx: {
                                                    fontSize: '0.7rem'
                                                }
                                            }}
                                            buttonStartIcon={
                                                <View
                                                    iconProps={{ sx: { width: 10 } }}
                                                    icon={'AccountBalance'}
                                                ></View>
                                            }
                                            buttonOutlined="区块链"
                                            onClick={() => {
                                                onSelectChainAccount({
                                                    walletIndex: wallet.index,
                                                    walletId: wallet.activeTonWalletId,
                                                    address
                                                });
                                                onShowChainList(true);
                                            }}
                                        ></View>
                                        <View rowVCenter ml12>
                                            <AccountMoreView
                                                onSelectChainAccount={v => onSelectChainAccount(v)}
                                                address={address}
                                                derivationIndex={wallet.index}
                                                name={wallet.name}
                                                walletIndex={wallet.index}
                                                accountId={activeAcount.id}
                                                right="-14px"
                                                top="32px"
                                            />
                                        </View>
                                    </View>
                                </View>
                            </AsideMenuItem>
                        </View>
                    );
                })}
            </View>
            <View
                abs
                xx0
                bottom0
                h={44}
                borderBox
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
        </View>
    );
};
