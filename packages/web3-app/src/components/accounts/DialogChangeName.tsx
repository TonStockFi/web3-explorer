import { View } from '@web3-explorer/uikit-view';
import { useTheme } from 'styled-components';
import { ChangeNameView } from './ChangeNameView';

export const DialogChangeName = ({
    onClose,
    accountId,
    open,
    onConfirm,
    name
}: {
    onConfirm: (name: string) => void;
    accountId: string;
    open: boolean;
    onClose: () => void;
    name: string;
}) => {
    const theme = useTheme();
    return (
        <View
            dialog={{
                dialogProps: {
                    fullScreen: true,
                    open
                },
                content: (
                    <View wh100p row center bgColor={theme.backgroundPage}>
                        <View sx={{ maxWidth: 800 }}>
                            <ChangeNameView
                                onClose={onClose}
                                defaultName={name}
                                submitHandler={async ({ name }: { name: string }) => {
                                    onConfirm(name);
                                    renameWallet({
                                        id: accountId,
                                        name
                                    });
                                }}
                            />
                        </View>
                    </View>
                )
            }}
        />
    );
};
