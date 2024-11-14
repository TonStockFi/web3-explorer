import { KeyIcon, PencilIcon } from '@tonkeeper/uikit/dist/components/Icon';
import { useDeleteAccountNotification } from '@tonkeeper/uikit/dist/components/modals/DeleteAccountNotificationControlled';
import { useRecoveryNotification } from '@tonkeeper/uikit/dist/components/modals/RecoveryNotificationControlled';
import { useRenameNotification } from '@tonkeeper/uikit/dist/components/modals/RenameNotificationControlled';

import { useTranslation } from 'react-i18next';

import { useAccountsState, useActiveAccount } from '@tonkeeper/uikit/dist/state/wallet';
import { View } from '@web3-explorer/uikit-view';
import { FC, useEffect } from 'react';
import styled from 'styled-components';
import { AccountMenu } from './AccountMenu';

const ButtonsContainer = styled.div`
    margin-left: auto;
    display: flex;
    gap: 8px;
`;

export const AccountsMoreView: FC = () => {
    const accounts = useAccountsState();
    const activeAccount = useActiveAccount();
    const wallet = activeAccount.activeTonWallet;

    const { t } = useTranslation();
    const { onOpen: recovery } = useRecoveryNotification();

    const { onOpen: onRename } = useRenameNotification();
    const { onOpen: onDelete } = useDeleteAccountNotification();

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
    );
};
