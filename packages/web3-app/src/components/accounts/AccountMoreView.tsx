import { KeyIcon, PencilIcon } from '@tonkeeper/uikit/dist/components/Icon';
import { useDeleteAccountNotification } from '@tonkeeper/uikit/dist/components/modals/DeleteAccountNotificationControlled';
import { useRecoveryNotification } from '@tonkeeper/uikit/dist/components/modals/RecoveryNotificationControlled';
import { useRenameNotification } from '@tonkeeper/uikit/dist/components/modals/RenameNotificationControlled';

import { useTranslation } from '@web3-explorer/lib-translation';

import {
    useAccountsState,
    useMutateRenameAccount,
    useMutateRenameAccountDerivation
} from '@tonkeeper/uikit/dist/state/wallet';
import { View } from '@web3-explorer/uikit-view';
import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { AccountMenu } from './AccountMenu';
import { DialogChangeName } from './DialogChangeName';

const ButtonsContainer = styled.div`
    margin-left: auto;
    display: flex;
    gap: 8px;
`;

export const AccountMoreView: FC<{
    derivationIndex?: number;
    address?: string;
    walletIndex?: number;
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
    name: string;
}> = ({
    accountId,
    address,
    onSelectChainAccount,
    walletIndex,
    derivationIndex,
    name,
    right,
    top
}) => {
    const accounts = useAccountsState();
    const { t } = useTranslation();

    const { onOpen: recovery } = useRecoveryNotification();

    const { onOpen: onRename } = useRenameNotification();
    const { onOpen: onDelete } = useDeleteAccountNotification();
    const { mutateAsync: rename } = useMutateRenameAccount();
    const { mutateAsync: renameWallet } = useMutateRenameAccountDerivation();

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
    const [openChangeNameDialog, setOpenChangeNameDialog] = useState(false);
    return (
        <>
            <DialogChangeName
                {...{
                    accountId,
                    open: openChangeNameDialog,
                    onConfirm: (name: string) => {
                        if (derivationIndex === undefined) {
                            rename({
                                id: accountId,
                                name
                            });
                        } else {
                            renameWallet({
                                id: accountId,
                                derivationIndex,
                                name
                            });
                        }
                        setOpenChangeNameDialog(false);
                    },
                    onClose: () => {
                        setOpenChangeNameDialog(false);
                    },
                    name
                }}
            />

            <ButtonsContainer>
                <AccountMenu
                    right={right}
                    top={top}
                    options={[
                        {
                            name: t('修改名称'),
                            onClick: () => setOpenChangeNameDialog(true),
                            icon: <PencilIcon />
                        },
                        {
                            name: t('修改头像'),
                            onClick: () => onRename({ accountId: accountId, derivationIndex }),
                            icon: <View iconSmall icon="Person" />
                        },
                        {
                            hide: derivationIndex !== undefined,
                            name: t('显示助记词'),
                            onClick: () => recovery({ accountId: accountId }),
                            icon: <KeyIcon />
                        },

                        {
                            hide: accounts.length === 1 || derivationIndex !== undefined,
                            name: t('删除帐户'),
                            onClick: () => {
                                if (accounts.length < 2) {
                                    return;
                                }
                                onDelete({ accountId: accountId });
                            },
                            icon: <View icon="Delete" iconSmall />
                        }
                    ]}
                />
            </ButtonsContainer>
        </>
    );
};
