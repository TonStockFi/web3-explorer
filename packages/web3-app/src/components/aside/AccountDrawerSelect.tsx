import { Account, AccountMAM } from '@tonkeeper/core/dist/entries/account';
import { useAccountsState, useActiveAccount } from '@tonkeeper/uikit/dist/state/wallet';
import { useState } from 'react';

import { useTranslation } from '@web3-explorer/lib-translation';

import FormControl from '@mui/material/FormControl/FormControl';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import { formatAddress, toShortValue } from '@tonkeeper/core/dist/utils/common';
import Checkbox from '@web3-explorer/uikit-mui/dist/mui/Checkbox';
import FormControlLabel from '@web3-explorer/uikit-mui/dist/mui/FormControlLabel';
import FormGroup from '@web3-explorer/uikit-mui/dist/mui/FormGroup';
import Input from '@web3-explorer/uikit-mui/dist/mui/Input';
import { View } from '@web3-explorer/uikit-view';
import { useTheme } from 'styled-components';
import { hexToRGBA } from '../../common/utils';
import { AccountsSelect } from '../accounts/AccountsSelect';
import TabViewContainer from '../TabViewContainer';
import { WalletEmoji } from '../WalletEmoji';
import { AccountsPager } from './AccountsPager';

function CheckboxItemRow({
    onChange,
    label,
    checked,
    address,
    disabled,
    emoji
}: {
    address: string;
    label: string;
    emoji: string;
    disabled: boolean;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    const theme = useTheme();
    return (
        <FormControlLabel
            label={''}
            sx={{
                width: '100%',
                borderRadius: 2,
                color: theme.textPrimary,
                '&:hover': {
                    bgcolor: theme.backgroundContentAttention
                },
                '& .MuiFormControlLabel-label': {
                    fontSize: '0.8rem',
                    display: 'none'
                },
                '& .MuiCheckbox-root': {
                    padding: '4px'
                }
            }}
            control={
                <View
                    w100p
                    aCenter
                    jSpaceBetween
                    px={4}
                    py={1.5}
                    bgColor={disabled ? hexToRGBA(theme.backgroundContentTint, 0.3) : undefined}
                >
                    <View row aCenter>
                        <Checkbox
                            disabled={disabled}
                            size={'small'}
                            onChange={(e: any) => {
                                onChange(e.target.checked);
                            }}
                            checked={checked}
                        />
                        <View center mr12 ml={6}>
                            <WalletEmoji emoji={emoji} emojiSize="18px" containerSize="18px" />
                        </View>
                        <View textFontSize={'0.8rem'} text={label} />
                    </View>
                    <View aCenter jEnd pr12>
                        <View
                            aCenter
                            textColor={theme.textPrimary}
                            textFontSize={'0.6rem'}
                            text={toShortValue(address)}
                        />
                    </View>
                </View>
            }
        />
    );
}

function eqArray(arr1: any[], arr2: any[]) {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    if (set1.size !== set2.size) {
        return false;
    }
    for (let item of set1) {
        if (!set2.has(item)) {
            return false;
        }
    }
    return true;
}

export const AccountDrawerSelect = ({ onClose }: { onClose: () => void }) => {
    const activeAcount = useActiveAccount();
    const accounts = useAccountsState();
    const accountsMAM = accounts.filter(account => account.type === 'mam');
    let accountsNoMAM = accounts
        .filter(account => account.type !== 'mam')
        .filter(wallet => wallet.id !== activeAcount.id);
    const showTabs = accountsNoMAM.length > 0;

    const [currentAccountMAM, setCurrentAccountMAM] = useState<AccountMAM>(
        activeAcount.type === 'mam' ? (activeAcount as AccountMAM) : (accountsMAM[0] as AccountMAM)
    );
    const [listType, setListType] = useState(0);
    const { t } = useTranslation();
    const limit = 20;
    const [page, setPage] = useState(0);

    const [searchVal, setSearchVal] = useState('');

    const accountMAM = currentAccountMAM;
    let { derivations, activeDerivationIndex } = accountMAM;
    if (accountMAM.id !== activeAcount.id) {
        activeDerivationIndex = -1;
    }
    const theme = useTheme();
    let walletsList = derivations.slice();
    if (searchVal) {
        if (listType === 0) {
            const searchValueNum = Number(searchVal);
            if (!isNaN(searchValueNum)) {
                walletsList = walletsList.filter(row => row.index + 1 === searchValueNum);
            } else {
                walletsList = walletsList.filter(
                    row => row.name.toLowerCase().indexOf(searchVal.toLowerCase()) > -1
                );
            }
        } else {
            accountsNoMAM = accountsNoMAM.filter(
                row => row.name.toLowerCase().indexOf(searchVal.toLowerCase()) > -1
            );
        }
    }
    const total = listType === 0 ? walletsList.length : accountsNoMAM.length;
    let accountsList: Account[] = [];
    let indexArray: number[] = [];
    if (listType !== 0) {
        accountsList = accountsNoMAM.slice(page * limit, (page + 1) * limit);
        indexArray = accountsList.map((row, i) => i);
    } else {
        walletsList.sort((a, b) => a.index - b.index);
        walletsList = walletsList.slice(page * limit, (page + 1) * limit);
        indexArray = walletsList
            .map(wallet => wallet.index)
            .filter(i => i !== activeDerivationIndex);
    }
    const [selectedWalletIndex, setSelectedWalletIndex] = useState<any[]>([]);
    const onAddSelectedAdr = () => {
        const addressList = [];
        for (let index = 0; index < selectedWalletIndex.length; index++) {
            const wIndex = selectedWalletIndex[index];
            if (listType === 0) {
                const activeWallet = accountMAM.allAvailableDerivations.find(
                    w => w.index === wIndex
                );
                const address = formatAddress(activeWallet!.tonWallets[0].rawAddress);
                addressList.push(address);
            } else {
                const address = formatAddress(accountsList[index].activeTonWallet.rawAddress);
                addressList.push(address);
            }
        }
        window.dispatchEvent(
            new CustomEvent('onSelectAddress', {
                detail: { addressList }
            })
        );
        onClose();
    };
    return (
        <>
            <View px={8} flx aCenter column sx={{ color: theme.textPrimary }}>
                <View jStart w100p relative>
                    <View hide={!showTabs} w100p>
                        <TabViewContainer
                            currentTabIndex={listType}
                            onChangeTabIndex={(v: number) => {
                                setListType(v);
                                setPage(0);
                                setSelectedWalletIndex([]);
                            }}
                            tabs={[{ title: t('SubWallets') }, { title: t('WalletAccounts') }]}
                        />
                    </View>

                    <View abs right0 top0 pr12 pt12>
                        <View
                            onClick={onAddSelectedAdr}
                            hide={selectedWalletIndex.length === 0}
                            button={`${t('add')} (${selectedWalletIndex.length})`}
                        />
                    </View>
                </View>

                <View row jEnd aCenter w100p>
                    <View w100p jSpaceBetween aCenter mt={4}>
                        <View row aCenter>
                            <View hide={listType !== 0}>
                                <AccountsSelect
                                    onChange={(account: Account) =>
                                        setCurrentAccountMAM(account as AccountMAM)
                                    }
                                    accounts={accountsMAM}
                                    account={currentAccountMAM}
                                />
                            </View>
                        </View>
                    </View>
                </View>
                <View w100p>
                    <View w100p>
                        <View
                            aCenter
                            h={24}
                            flex1
                            pl={16}
                            pt={2}
                            mr={4}
                            pb={2}
                            mt={4}
                            jSpaceBetween
                        >
                            <FormControl
                                size="small"
                                sx={{
                                    pb: 0.5,
                                    borderBottom: `1px solid ${theme.separatorCommon}`
                                }}
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
                                            <View
                                                icon="Search"
                                                iconSmall
                                                iconProps={{ sx: { color: theme.textPrimary } }}
                                            />
                                        </InputAdornment>
                                    }
                                />
                            </FormControl>

                            <View flx aCenter jEnd mr12>
                                <View wh={36} mr={3} ml={6}>
                                    <Checkbox
                                        sx={{ padding: 1 }}
                                        size={'small'}
                                        onChange={(e: any) => {
                                            const { checked } = e.target;
                                            setSelectedWalletIndex(checked ? indexArray : []);
                                        }}
                                        checked={
                                            indexArray.length > 0 &&
                                            eqArray(indexArray, selectedWalletIndex)
                                        }
                                    />
                                </View>
                                <View text={t('SelectAll')} textProps={{ fontSize: 'small' }} />
                            </View>
                        </View>
                    </View>
                </View>
            </View>
            <View pl={24} flex1 column userSelectNone mt={8}>
                <FormGroup>
                    <View hide={listType === 0} empty>
                        {accountsList.map((wallet, index) => {
                            const address = formatAddress(wallet.activeTonWallet.rawAddress);
                            return (
                                <CheckboxItemRow
                                    key={wallet.id}
                                    address={address}
                                    emoji={wallet.emoji}
                                    label={`${wallet.name}`}
                                    checked={selectedWalletIndex.indexOf(index) > -1}
                                    disabled={wallet.id === activeAcount.id}
                                    onChange={(checked: boolean) => {
                                        let newVal: number[] = [];
                                        if (checked) {
                                            if (selectedWalletIndex.indexOf(index) === -1) {
                                                newVal = [index, ...selectedWalletIndex];
                                            }
                                        } else {
                                            if (selectedWalletIndex.indexOf(index) !== -1) {
                                                newVal = selectedWalletIndex.filter(
                                                    idx => idx !== index
                                                );
                                            }
                                        }
                                        newVal.sort((a, b) => a - b);
                                        setSelectedWalletIndex(newVal);
                                    }}
                                />
                            );
                        })}
                    </View>
                    <View hide={listType !== 0} empty>
                        {walletsList.map(wallet => {
                            const address = formatAddress(wallet.tonWallets[0].rawAddress);
                            return (
                                <CheckboxItemRow
                                    key={wallet.index}
                                    address={address}
                                    emoji={wallet.emoji}
                                    label={`# ${wallet.index + 1} ${wallet.name}`}
                                    checked={selectedWalletIndex.indexOf(wallet.index) > -1}
                                    disabled={wallet.index === activeDerivationIndex}
                                    onChange={(checked: boolean) => {
                                        let newVal: number[] = [];
                                        if (checked) {
                                            if (selectedWalletIndex.indexOf(wallet.index) === -1) {
                                                newVal = [wallet.index, ...selectedWalletIndex];
                                            }
                                        } else {
                                            if (selectedWalletIndex.indexOf(wallet.index) !== -1) {
                                                newVal = selectedWalletIndex.filter(
                                                    idx => idx !== wallet.index
                                                );
                                            }
                                        }
                                        newVal.sort((a, b) => a - b);
                                        setSelectedWalletIndex(newVal);
                                    }}
                                />
                            );
                        })}
                    </View>
                </FormGroup>
            </View>

            <View
                borderBox
                h={44}
                pb={4}
                px={8}
                flx
                sx={{
                    color: theme.textPrimary,
                    borderTop: total > limit ? `1px solid ${theme.separatorCommon}` : 'none'
                }}
            >
                <AccountsPager
                    total={total}
                    limit={limit}
                    page={page}
                    setPage={(p: number) => {
                        setSelectedWalletIndex([]);
                        setPage(p);
                    }}
                />
            </View>
        </>
    );
};
