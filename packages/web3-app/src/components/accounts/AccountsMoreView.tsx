import { KeyIcon, PlusIcon } from '@tonkeeper/uikit/dist/components/Icon';
import { useRecoveryNotification } from '@tonkeeper/uikit/dist/components/modals/RecoveryNotificationControlled';

import { useTranslation } from '@web3-explorer/lib-translation';

import { FC, useEffect } from 'react';
import styled from 'styled-components';
import { AccountMenu } from './AccountMenu';

const ButtonsContainer = styled.div`
    margin-left: auto;
    display: flex;
    gap: 8px;
`;

export const AccountsMoreView: FC<{
    onCreateAccount?: () => void;
    onImport?: () => void;
    right?: string;
    top?: string;
}> = ({ right, top, onImport, onCreateAccount }) => {
    const { t } = useTranslation();
    const { onOpen: recovery } = useRecoveryNotification();

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
                right={right}
                top={top}
                options={[
                    {
                        name: t('create_wallet_account'),
                        onClick: () => {
                            onCreateAccount && onCreateAccount();
                        },
                        icon: <PlusIcon />
                    },

                    {
                        name: t('import_mnemonic'),
                        onClick: () => {
                            onImport && onImport();
                        },
                        icon: <KeyIcon />
                    }
                ]}
            />
        </ButtonsContainer>
    );
};
