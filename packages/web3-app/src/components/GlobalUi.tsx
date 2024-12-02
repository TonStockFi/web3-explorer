import Backdrop from '@web3-explorer/uikit-mui/dist/mui/Backdrop';
import CircularProgress from '@web3-explorer/uikit-mui/dist/mui/CircularProgress';
import Snackbar from '@web3-explorer/uikit-mui/dist/mui/Snackbar';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useIAppContext } from '../providers/IAppProvider';

export function GlobalUi() {
    const { alert, showBackdrop, showAlert, confirm, backdrop, snackbar, showSnackbar } =
        useIAppContext();
    const { t } = useTranslation();
    useEffect(() => {
        function showAlertMessage(e: any) {
            const { message } = e.detail;
            showSnackbar({ message });
        }

        function showGlobalLoading(e: any) {
            const { visible } = e.detail;
            showBackdrop(visible);
        }
        window.addEventListener('showGlobalLoading', showGlobalLoading);
        window.addEventListener('showAlertMessage', showAlertMessage);
        return () => {
            window.removeEventListener('showAlertMessage', showAlertMessage);
            window.removeEventListener('showGlobalLoading', showGlobalLoading);
        };
    }, []);
    return (
        <View empty>
            <Backdrop
                sx={theme => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={Boolean(backdrop)}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={Boolean(snackbar)}
                autoHideDuration={3000}
                onClose={() => {
                    showSnackbar(false);
                }}
                message={snackbar ? snackbar.message : ''}
            />
            <View
                confirm={{
                    id: 'alert',
                    title: t(alert ? alert.title || 'Alert' : 'Alert'),
                    content: alert ? alert.message : '',
                    open: Boolean(alert),
                    cancelTxt: Boolean(alert && alert.cancelTxt) ? alert!.cancelTxt : t('ok'),
                    onCancel: () => {
                        showAlert(false);
                    }
                }}
            />

            <View
                confirm={{
                    ...confirm,
                    open: !!confirm,
                    id: 'confirm_global',
                    title: confirm ? t(confirm.title!) : undefined,
                    content: confirm ? t(confirm.content!) : undefined,
                    cancelTxt: Boolean(confirm && confirm.cancelTxt)
                        ? t(confirm!.cancelTxt!)
                        : t('cancel'),
                    confirmTxt: Boolean(confirm && confirm.confirmTxt)
                        ? t(confirm!.confirmTxt!)
                        : t('ok')
                }}
            />
        </View>
    );
}
