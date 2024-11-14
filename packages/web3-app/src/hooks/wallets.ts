import { useMutation, useQueryClient } from '@tanstack/react-query';
import { KeychainTonAccount, TonKeychainRoot } from '@ton-keychain/core';
import { Address } from '@ton/core';
import { AccountId, AccountMAM } from '@tonkeeper/core/dist/entries/account';
import {
    DerivationItemNamed,
    TonWalletStandard,
    WalletVersion
} from '@tonkeeper/core/dist/entries/wallet';
import { encrypt } from '@tonkeeper/core/dist/service/cryptoService';
import { walletContract } from '@tonkeeper/core/dist/service/wallet/contractService';
import { getFallbackAccountEmoji } from '@tonkeeper/core/dist/service/walletService';
import { useAppContext } from '@tonkeeper/uikit/dist/hooks/appContext';
import { useAppSdk } from '@tonkeeper/uikit/dist/hooks/appSdk';
import { useAccountsStorage } from '@tonkeeper/uikit/dist/hooks/useStorage';
import { anyOfKeysParts, QueryKey } from '@tonkeeper/uikit/dist/libs/queryKey';
import {
    useActiveAccount,
    useActiveTonNetwork,
    useAddAccountToStateMutation,
    useMutateActiveAccount
} from '@tonkeeper/uikit/dist/state/wallet';

import { APIConfig } from '@tonkeeper/core/dist/entries/apis';
import { Network } from '@tonkeeper/core/dist/entries/network';
import { AuthKeychain, AuthPassword } from '@tonkeeper/core/dist/entries/password';
import { accountsStorage } from '@tonkeeper/core/dist/service/accountsStorage';
import { IStorage } from '@tonkeeper/core/dist/Storage';
import { AccountsApi } from '@tonkeeper/core/dist/tonApiV2';
import { formatAddress } from '@tonkeeper/core/dist/utils/common';
import {
    getAccountMnemonic,
    getPasswordByNotification
} from '@tonkeeper/uikit/dist/state//mnemonic';
import { useCheckTouchId } from '@tonkeeper/uikit/dist/state/password';
import { AccountPublic } from '../types';

async function getRelevantMAMTonAccountsToImport(
    root: TonKeychainRoot,
    api: APIConfig,
    defaultWalletVersion: WalletVersion,
    network?: Network
): Promise<{ tonAccount: KeychainTonAccount; derivationIndex: number; shouldAdd: boolean }[]> {
    const getAccountsBalances = async (tonAccounts: KeychainTonAccount[]) => {
        const addresses = tonAccounts.map(tonAccount =>
            walletContract(
                tonAccount.publicKey,
                defaultWalletVersion,
                network
            ).address.toRawString()
        );

        const response = await new AccountsApi(api.tonApiV2).getAccounts({
            getAccountsRequest: { accountIds: addresses }
        });

        return response.accounts.map(acc => acc.balance);
    };

    let accounts: {
        tonAccount: KeychainTonAccount;
        derivationIndex: number;
        shouldAdd: boolean;
    }[] = [];

    const indexesGap = 10;
    while (true) {
        const indexFrom = accounts.length ? accounts[accounts.length - 1].derivationIndex + 1 : 0;
        const accsToAdd = await Promise.all(
            [...Array(indexesGap)]
                .map((_, i) => indexFrom + i)
                .map(async derivationIndex => ({
                    tonAccount: await root.getTonAccount(derivationIndex),
                    derivationIndex,
                    shouldAdd: true
                }))
        );
        const balances = await getAccountsBalances(accsToAdd.map(i => i.tonAccount));
        if (balances.every(b => !b)) {
            const lastAccountToAdd = accounts
                .slice()
                .reverse()
                .findIndex(a => a.shouldAdd);

            if (lastAccountToAdd !== -1) {
                accounts = accounts.slice(0, accounts.length - lastAccountToAdd);
            }

            return accounts;
        } else {
            accsToAdd.forEach((acc, index) => {
                const balance = balances[index];
                if (!balance) {
                    acc.shouldAdd = false;
                }
            });
            accounts.push(...accsToAdd);
        }
    }
}

async function gePreselectedMAMTonAccountsToImport(
    root: TonKeychainRoot,
    selectedDerivations: number[]
): Promise<{ tonAccount: KeychainTonAccount; derivationIndex: number; shouldAdd: boolean }[]> {
    const maxDerivationIndex = selectedDerivations.reduce((acc, v) => Math.max(acc, v), -1);
    return Promise.all(
        [...Array(maxDerivationIndex + 1)].map(async (_, index) => ({
            tonAccount: await root.getTonAccount(index),
            derivationIndex: index,
            shouldAdd: selectedDerivations.includes(index)
        }))
    );
}

export const createMAMAccountByMnemonic = async (
    appContext: { api: APIConfig; defaultWalletVersion: WalletVersion },
    storage: IStorage,
    rootMnemonic: string[],
    options: {
        selectedDerivations?: number[];
        network?: Network;
        auth: AuthPassword | Omit<AuthKeychain, 'keychainStoreKey'>;
    }
) => {
    const rootAccount = await TonKeychainRoot.fromMnemonic(rootMnemonic, {
        allowLegacyMnemonic: true
    });

    let childTonWallets: {
        tonAccount: KeychainTonAccount;
        derivationIndex: number;
        shouldAdd: boolean;
    }[];
    if (options.selectedDerivations?.length) {
        childTonWallets = await gePreselectedMAMTonAccountsToImport(
            rootAccount,
            options.selectedDerivations
        );
    } else {
        childTonWallets = await getRelevantMAMTonAccountsToImport(
            rootAccount,
            appContext.api,
            appContext.defaultWalletVersion,
            options.network
        );

        if (!childTonWallets.length) {
            childTonWallets = await gePreselectedMAMTonAccountsToImport(rootAccount, [0]);
        }
    }

    let auth: AuthPassword | AuthKeychain;
    if (options.auth.kind === 'keychain') {
        auth = {
            kind: 'keychain',
            keychainStoreKey: rootAccount.id
        };
    } else {
        auth = options.auth;
    }

    const { name, emoji } = await accountsStorage(storage).getNewAccountNameAndEmoji(
        rootAccount.id
    );

    const namedDerivations: { item: DerivationItemNamed; shouldAdd: boolean }[] =
        childTonWallets.map(w => {
            const tonWallet = walletContract(
                w.tonAccount.publicKey,
                appContext.defaultWalletVersion,
                options.network
            );
            const tonWallets: TonWalletStandard[] = [
                {
                    id: tonWallet.address.toRawString(),
                    publicKey: w.tonAccount.publicKey,
                    version: appContext.defaultWalletVersion,
                    rawAddress: tonWallet.address.toRawString()
                }
            ];
            const emoji1 = getFallbackAccountEmoji(
                Address.parse(tonWallet.address.toRawString()).hash.toString('hex')
            );
            return {
                item: {
                    name: AccountMAM.getNewDerivationFallbackName(w.derivationIndex),
                    emoji: emoji1,
                    index: w.derivationIndex,
                    tonWallets,
                    activeTonWalletId: tonWallets[0].id
                },
                shouldAdd: w.shouldAdd
            };
        });

    const addedDerivationIndexes = namedDerivations.filter(d => d.shouldAdd).map(d => d.item.index);
    if (addedDerivationIndexes.length === 0) {
        throw new Error('No derivations to add');
    }

    return new AccountMAM(
        rootAccount.id,
        name,
        emoji,
        auth,
        addedDerivationIndexes[0],
        addedDerivationIndexes,
        namedDerivations.map(d => d.item)
    );
};

export function useAccountWallet() {
    const account = useActiveAccount() as AccountMAM;
    const { id: accountId } = account;
    const activeWalletIndex = account.activeDerivationIndex;
    return { accountId, activeWalletIndex };
}

export function useAccountInfo() {
    const account = useActiveAccount();
    let emoji = account.emoji;
    let name = `${account.name}`;
    let address = account.activeTonWallet.rawAddress;
    const { accountId } = useAccountWallet();
    let index = 0;
    if (account.type === 'mam') {
        name = account.activeDerivation.name;
        emoji = account.activeDerivation.emoji;
        const { activeDerivationIndex, addedDerivationsIndexes } = account as AccountMAM;
        index = activeDerivationIndex;
        address = account.derivations[activeDerivationIndex].tonWallets[0].rawAddress;
    }
    return { emoji, id: accountId, name, index, address: formatAddress(address) };
}

export function usePublicAccountsInfo() {
    const account = useActiveAccount();
    let emoji = account.emoji;
    let name = `${account.name}`;
    let address = account.activeTonWallet.rawAddress;
    const { accountId } = useAccountWallet();
    let index = 0;
    let accounts: AccountPublic[] = [];
    if (account.type === 'mam') {
        name = account.activeDerivation.name;
        emoji = account.activeDerivation.emoji;
        const { activeDerivationIndex, addedDerivationsIndexes, derivations } =
            account as AccountMAM;
        index = activeDerivationIndex;
        accounts = derivations.map(derivation => {
            const { index, name, emoji, tonWallets } = derivation;
            const address = formatAddress(tonWallets[0].rawAddress);
            return {
                address,
                index,
                name,
                emoji,
                id: accountId,
                isMam:true,
                isActive:index === activeDerivationIndex,
                isHide: addedDerivationsIndexes.indexOf(index) === -1
            };
        });
    } else {
        accounts = [{ emoji, id: accountId, name, index, address: formatAddress(address) }];
    }
    return accounts;
}

export function useAccountWallePartitionId() {
    const { accountId, activeWalletIndex } = useAccountWallet();
    return `p_w_${accountId}_${activeWalletIndex || 0}`;
}

export function useFirstWaletPartitionId() {
    const { accountId } = useAccountWallet();
    return `p_w_${accountId}_0`;
}

export function useAccountAddress() {
    const account = useActiveAccount();
    const activeWallet = account.activeTonWallet;
    return formatAddress(activeWallet.rawAddress);
}

export function useBlockChainExplorerTonViewer() {
    const network = useActiveTonNetwork();
    return `https://${network === Network.TESTNET ? 'testnet.' : ''}tonviewer.com/%s`;
}

export function useBlockChainExplorer() {
    const network = useActiveTonNetwork();
    return `https://${network === Network.TESTNET ? 'testnet.' : ''}tonscan.org/address/%s`;
}
export const useCreateMAMAccountDerivation = () => {
    const storage = useAccountsStorage();
    const client = useQueryClient();
    const sdk = useAppSdk();
    const appContext = useAppContext();
    const network = useActiveTonNetwork();
    const { mutateAsync: checkTouchId } = useCheckTouchId();

    return useMutation<DerivationItemNamed | null, Error, { count?: number; accountId: AccountId }>(
        async ({ count, accountId }) => {
            if (!count) {
                count = 1;
            }
            const account = await storage.getAccount(accountId);
            if (!account || account.type !== 'mam') {
                throw new Error('Account not found');
            }

            const mnemonic = await getAccountMnemonic(sdk, accountId, checkTouchId);

            const root = await TonKeychainRoot.fromMnemonic(mnemonic);
            let d: DerivationItemNamed | null = null;
            const { lastAddedIndex } = account;
            for (let i = 0; i < count; i++) {
                const newDerivationIndex = lastAddedIndex + 1 + i;
                const tonAccount = await root.getTonAccount(newDerivationIndex);

                const tonWallet = walletContract(
                    tonAccount.publicKey,
                    appContext.defaultWalletVersion,
                    network
                );

                const tonWallets: TonWalletStandard[] = [
                    {
                        id: tonWallet.address.toRawString(),
                        publicKey: tonAccount.publicKey,
                        version: appContext.defaultWalletVersion,
                        rawAddress: tonWallet.address.toRawString()
                    }
                ];
                const emoji = getFallbackAccountEmoji(
                    Address.parse(tonWallet.address.toRawString()).hash.toString('hex')
                );
                d = {
                    name: account.getNewDerivationFallbackName(),
                    emoji: emoji,
                    index: newDerivationIndex,
                    tonWallets,
                    activeTonWalletId: tonWallets[0].id
                };
                account.addDerivation(d);
            }
            await storage.updateAccountInState(account);
            await client.invalidateQueries(anyOfKeysParts(QueryKey.account, account.id));
            return d;
        }
    );
};

export const useCreateAccountMAM = () => {
    const sdk = useAppSdk();
    const context = useAppContext();
    const { mutateAsync: addAccountToState } = useAddAccountToStateMutation();
    const { mutateAsync: selectAccountMutation } = useMutateActiveAccount();

    return useMutation<
        AccountMAM,
        Error,
        {
            mnemonic: string[];
            selectedDerivations?: number[];
            password?: string;
            selectAccount?: boolean;
        }
    >(async ({ selectedDerivations, mnemonic, password, selectAccount }) => {
        if (sdk.keychain) {
            const account = await createMAMAccountByMnemonic(context, sdk.storage, mnemonic, {
                selectedDerivations,
                auth: {
                    kind: 'keychain'
                }
            });

            await sdk.keychain.setPassword(
                (account.auth as AuthKeychain).keychainStoreKey,
                mnemonic.join(' ')
            );

            await addAccountToState(account);
            if (selectAccount) {
                await selectAccountMutation(account.id);
            }
            return account;
        }

        if (!password) {
            password = await getPasswordByNotification(sdk);
        }

        const encryptedMnemonic = await encrypt(mnemonic.join(' '), password);
        const account = await createMAMAccountByMnemonic(context, sdk.storage, mnemonic, {
            selectedDerivations,
            auth: {
                kind: 'password',
                encryptedMnemonic
            }
        });

        await addAccountToState(account);
        if (selectAccount) {
            await selectAccountMutation(account.id);
        }
        return account;
    });
};
