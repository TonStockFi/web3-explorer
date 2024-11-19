import { Account } from '@tonkeeper/core/dist/entries/account';
import { KeyIcon, PencilIcon } from '@tonkeeper/uikit/dist/components/Icon';
import { ListBlockDesktopAdaptive, ListItem } from '@tonkeeper/uikit/dist/components/List';
import { Label2 } from '@tonkeeper/uikit/dist/components/Text';
import { useDeleteAccountNotification } from '@tonkeeper/uikit/dist/components/modals/DeleteAccountNotificationControlled';
import { useRecoveryNotification } from '@tonkeeper/uikit/dist/components/modals/RecoveryNotificationControlled';
import { useRenameNotification } from '@tonkeeper/uikit/dist/components/modals/RenameNotificationControlled';

import { useTranslation } from 'react-i18next';

import { WalletId } from '@tonkeeper/core/dist/entries/wallet';
import { AccountBadge } from '@tonkeeper/uikit/dist/components/account/AccountBadge';
import { useActiveAccount, useMutateActiveAccount } from '@tonkeeper/uikit/dist/state/wallet';
import { View } from '@web3-explorer/uikit-view';
import { FC, useEffect, useRef } from 'react';
import styled, { useTheme } from 'styled-components';
import { WalletEmoji } from '../WalletEmoji';
import { AccountMenu } from './AccountMenu';

const FirstLineContainer = styled.div`
    display: flex;
    gap: 6px;
    align-items: center;
`;

const ButtonsContainer = styled.div`
    margin-left: auto;
    display: flex;
    gap: 8px;
`;

const ListBlockStyled = styled(ListBlockDesktopAdaptive)`
    margin-bottom: 0;
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

export const AccountRows: FC<{
    accounts: Account[];
    className?: string;
    page?: number;
    limit?: number;
}> = ({ page, accounts, limit, className }) => {
    const activeAccount = useActiveAccount();
    const theme = useTheme();
    const { t } = useTranslation();
    const { onOpen: recovery } = useRecoveryNotification();
    const ref = useRef<HTMLDivElement | null>(null);

    const { mutateAsync: setActiveAccount } = useMutateActiveAccount();

    const onClickAccount = (walletId: WalletId) => setActiveAccount(walletId);
    const { onOpen: onRename } = useRenameNotification();
    const { onOpen: onDelete } = useDeleteAccountNotification();
    let wallets = accounts;
    if (page !== undefined && limit !== undefined) {
        wallets = accounts.slice(page * limit, (page + 1) * limit);
    }

    useEffect(() => {
        const on_backup = (event: CustomEvent) => {
            const { accountId } = event.detail;
            recovery({ accountId });
        };

        //@ts-ignore
        window.addEventListener('on_backup', on_backup);
        return () => {
            //@ts-ignore
            window.removeEventListener('on_backup', on_backup);
        };
    }, []);

    return (
        <ContentWrapper className={className} ref={ref}>
            <ListBlockStyled>
                {wallets.map((wallet: Account) => {
                    return (
                        <ListItem key={wallet.id} hover={false}>
                            <ListItemPayload>
                                <View h={32} center mr12>
                                    <WalletEmoji
                                        containerSize="24px"
                                        emoji={wallet.emoji.substring(0, 2)}
                                    />
                                </View>
                                <FirstLineContainer>
                                    <Label2>{wallet.name}</Label2>
                                </FirstLineContainer>
                                <View ml={6} h100p center>
                                    <View wh={24} center hide={activeAccount.id !== wallet.id}>
                                        <View
                                            icon={'ToggleOn'}
                                            iconSmall
                                            iconProps={{ sx: { color: theme.accentGreen } }}
                                        />
                                    </View>
                                    <View
                                        wh={24}
                                        hide={activeAccount.id === wallet.id}
                                        center
                                        tipsPlacement="right"
                                        tips={t('Active')}
                                    >
                                        <View
                                            center
                                            onClick={() => onClickAccount(wallet.id)}
                                            hide={activeAccount.id === wallet.id}
                                            icon={'ToggleOff'}
                                            iconButton={{ size: 'small' }}
                                            iconButtonColor={theme.textPrimary}
                                            iconSmall
                                        />
                                    </View>
                                </View>
                                <View center ml12>
                                    <AccountBadge accountType={wallet.type} size="s">
                                        {wallet.type === 'mam' ? t('Multi') : ''}
                                    </AccountBadge>
                                </View>
                                <ButtonsContainer>
                                    <AccountMenu
                                        options={[
                                            {
                                                name: t('settings_backup_seed'),
                                                onClick: () => recovery({ accountId: wallet.id }),
                                                icon: <KeyIcon />
                                            },
                                            {
                                                name: t('Rename'),
                                                onClick: () => onRename({ accountId: wallet.id }),
                                                icon: <PencilIcon />
                                            },
                                            {
                                                hide: accounts.length === 1,
                                                name: t('settings_delete_account'),
                                                onClick: () => {
                                                    if (accounts.length < 2) {
                                                        return;
                                                    }
                                                    onDelete({ accountId: wallet.id });
                                                },
                                                icon: <View icon="Delete" iconSmall />
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
