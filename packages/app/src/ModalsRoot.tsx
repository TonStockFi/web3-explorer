// import { AddWalletNotificationControlled } from '@tonkeeper/uikit/dist/components/modals/AddWalletNotificationControlled';
// import { ConfirmDiscardNotificationControlled } from '@tonkeeper/uikit/dist/components/modals/ConfirmDiscardNotificationControlled';
import { DeleteAccountNotificationControlled } from '@tonkeeper/uikit/dist/components/modals/DeleteAccountNotificationControlled';
// import { LedgerIndexesSettingsNotification } from '@tonkeeper/uikit/dist/components/modals/LedgerIndexesSettingsNotification';
// import { MAMIndexesSettingsNotification } from '@tonkeeper/uikit/dist/components/modals/MAMIndexesSettingsNotification';
// import { ManageFolderNotificationControlled } from '@tonkeeper/uikit/dist/components/modals/ManageFolderNotificationControlled';
// import { MultisigOrderNotificationControlled } from '@tonkeeper/uikit/dist/components/modals/MultisigOrderNotificationControlled';
import { RecoveryNotificationControlled } from '@tonkeeper/uikit/dist/components/modals/RecoveryNotificationControlled';
import { RenameNotificationControlled } from '@tonkeeper/uikit/dist/components/modals/RenameNotificationControlled';
// import { WalletVersionSettingsNotification } from '@tonkeeper/uikit/dist/components/modals/WalletVersionSettingsNotification';

export const ModalsRoot = () => {
    return (
        <>
            <DeleteAccountNotificationControlled />
            <RenameNotificationControlled />
            <RecoveryNotificationControlled />
        </>
    );
};
