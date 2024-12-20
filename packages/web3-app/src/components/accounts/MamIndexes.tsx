import { AccountMAM } from '@tonkeeper/core/dist/entries/account';
import { KeyIcon, PencilIcon } from '@tonkeeper/uikit/dist/components/Icon';
import { ListBlockDesktopAdaptive, ListItem } from '@tonkeeper/uikit/dist/components/List';
import { SkeletonListDesktopAdaptive } from '@tonkeeper/uikit/dist/components/Skeleton';
import { Label2 } from '@tonkeeper/uikit/dist/components/Text';
import { WalletIndexBadge } from '@tonkeeper/uikit/dist/components/account/AccountBadge';
import { useRenameNotification } from '@tonkeeper/uikit/dist/components/modals/RenameNotificationControlled';
import {
    useEnableMAMAccountDerivation,
    useHideMAMAccountDerivation,
    useTonWalletsBalances
} from '@tonkeeper/uikit/dist/state/wallet';
import { useTranslation } from 'react-i18next';

import { useRecoveryNotification } from '@tonkeeper/uikit/dist/components/modals/RecoveryNotificationControlled';
import { useAccountsStorage } from '@tonkeeper/uikit/dist/hooks/useStorage';
import { View } from '@web3-explorer/uikit-view';
import { FC, useEffect } from 'react';
import styled from 'styled-components';
import { WalletEmoji } from '../WalletEmoji';
import { AccountMenu } from './AccountMenu';

const FirstLineContainer = styled.div`
    display: flex;
    gap: 6px;
    align-items: center;
`;

const TextContainer = styled.span`
    flex-direction: column;
    display: flex;
    align-items: flex-start;
`;

const ButtonsContainer = styled.div`
    margin-left: auto;
    display: flex;
    gap: 8px;
`;

const ListBlockStyled = styled(ListBlockDesktopAdaptive)`
    margin-bottom: 0;
`;

const NameContainer = styled.div`
    display: flex;
    gap: 1rem;
`;
const ListItemPayload = styled.div`
    flex-grow: 1;
    display: flex;
    justify-content: space-between;
    padding: 1rem 1rem 1rem 0;
    box-sizing: border-box;
    gap: 10px;

    width: 100%;

    ${props =>
        props.theme.displayType === 'full-width'
            ? 'align-items: center;'
            : 'flex-direction: column;'}
`;

const ContentWrapper = styled.div``;

export const MAMIndexesPageContent: FC<{
    account: AccountMAM;
    setSelectAccount: (val: AccountMAM) => void;
    className?: string;
    page?: number;
    limit?: number;
}> = ({ page, limit, setSelectAccount, account, className }) => {
    const { t } = useTranslation();

    const { data: balances } = useTonWalletsBalances(
        account.allAvailableDerivations.map(
            d => d.tonWallets.find(w => w.id === d.activeTonWalletId)!.rawAddress
        )
    );

    const { allAvailableDerivations: derivations } = account;
    const walletsList = derivations.slice().sort((a, b) => a.index - b.index);
    let wallets = derivations;
    if (page !== undefined && limit !== undefined) {
        wallets = walletsList.slice(page * limit, (page + 1) * limit);
    }
    const storage = useAccountsStorage();
    const { mutate: hideDerivation, isLoading: isHideDerivationLoading } =
        useHideMAMAccountDerivation();

    const { mutate: enableDerivation, isLoading: isEnableDerivationLoading } =
        useEnableMAMAccountDerivation();

    const { onOpen: rename } = useRenameNotification();
    const { onOpen: recovery } = useRecoveryNotification();

    const onEnableDerivation = async (index: number) => {
        enableDerivation({
            accountId: account.id,
            derivationIndex: index
        });
    };

    const onHideDerivation = async (index: number) => {
        hideDerivation({
            accountId: account.id,
            derivationIndex: index
        });
    };

    const isLoading = isHideDerivationLoading || isEnableDerivationLoading;
    useEffect(() => {
        if (!isLoading) {
            storage.getAccount(account.id).then(res => {
                res && setSelectAccount(res as AccountMAM);
            });
        }
    }, [isLoading]);

    if (!balances) {
        return <SkeletonListDesktopAdaptive size={account.allAvailableDerivations.length} />;
    }

    const canHide = account.derivations.length > 1;
    return (
        <ContentWrapper className={className}>
            <ListBlockStyled>
                {wallets!.map(derivation => {
                    const derivationIndex = derivation.index;
                    const isDerivationAdded = account.addedDerivationsIndexes.some(
                        index => index === derivationIndex
                    );
                    return (
                        <ListItem style={{ paddingLeft: 12 }} hover={false} key={derivation.index}>
                            <ListItemPayload>
                                <NameContainer style={{ marginTop: 6 }}>
                                    <WalletEmoji containerSize="24px" emoji={derivation.emoji} />
                                    <TextContainer>
                                        <FirstLineContainer>
                                            <Label2>{derivation.name}</Label2>
                                            <WalletIndexBadge>
                                                # {derivation.index + 1}
                                            </WalletIndexBadge>
                                        </FirstLineContainer>
                                    </TextContainer>
                                    <View ml={6} hide={isDerivationAdded}>
                                        <View icon={'VisibilityOff'} iconSmall />
                                    </View>
                                </NameContainer>
                                <ButtonsContainer>
                                    <AccountMenu
                                        options={[
                                            {
                                                name: t('settings_backup_seed'),
                                                onClick: () =>
                                                    recovery({
                                                        accountId: account.id,
                                                        walletId: derivation.activeTonWalletId
                                                    }),
                                                icon: <KeyIcon />
                                            },
                                            {
                                                name: t('Rename'),
                                                onClick: () =>
                                                    rename({
                                                        accountId: account.id,
                                                        derivationIndex
                                                    }),
                                                icon: <PencilIcon />
                                            },
                                            {
                                                hide: !isDerivationAdded || !canHide,
                                                name: t('hide'),
                                                onClick: () => onHideDerivation(derivationIndex),
                                                icon: <View iconSmall icon={'VisibilityOff'} />
                                            },
                                            {
                                                hide: isDerivationAdded,
                                                name: t('show'),
                                                onClick: () => onEnableDerivation(derivationIndex),
                                                icon: <View iconSmall icon={'Visibility'} />
                                            }
                                        ]}
                                    />
                                </ButtonsContainer>
                            </ListItemPayload>
                        </ListItem>
                    );
                })}
            </ListBlockStyled>
        </ContentWrapper>
    );
};
