import Box from '@web3-explorer/uikit-mui/dist/mui/Box';
import Button from '@web3-explorer/uikit-mui/dist/mui/Button';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle
} from '@web3-explorer/uikit-mui/dist/mui/Dialog';
import TextField from '@web3-explorer/uikit-mui/dist/mui/TextField';
import { View } from '@web3-explorer/uikit-view';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useIAppContext } from '../../../providers/IAppProvider';

import { CustomDeviceWsServerHosts } from '../../../types';
import HostListView from './HostListView';

export default function AddServerView({
    setCustomHosts,
    customHosts,
    serverHostList,
    showAddServer,
    setAddServer
}: {
    setCustomHosts: (hsots: CustomDeviceWsServerHosts[]) => void;
    customHosts?: CustomDeviceWsServerHosts[];
    serverHostList: CustomDeviceWsServerHosts[];
    showAddServer: boolean;
    setAddServer: (v: boolean) => void;
}) {
    const { showSnackbar } = useIAppContext();
    const { t } = useTranslation();
    const [value, setValue] = React.useState('');
    return (
        <Dialog
            open={showAddServer}
            maxWidth={'md'}
            onClose={() => setAddServer(false)}
            PaperProps={{
                component: 'form',
                onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    const formJson = Object.fromEntries((formData as any).entries());
                    const api = formJson.api as string;
                    if (api) {
                        if (api.startsWith('ws') || api.startsWith('http')) {
                            if (
                                [...(customHosts || []), ...serverHostList]
                                    .map(row => row.host)
                                    .indexOf(api) === -1
                            ) {
                                setCustomHosts([{ host: api }, ...(customHosts || [])]);
                                showSnackbar({ message: t('AddOk') });
                            } else {
                                showSnackbar({ message: t('ServerExists') });
                            }
                        }
                    }
                    setAddServer(false);
                }
            }}
        >
            <DialogTitle>{t('AddServer')}</DialogTitle>
            <DialogContent sx={{ minWidth: '360px' }}>
                <Box>
                    <TextField
                        autoFocus
                        required
                        value={value}
                        margin="dense"
                        id="api"
                        name="api"
                        label={t('ServerAddress')}
                        type="url"
                        fullWidth
                        onChange={e => {
                            setValue(e.target.value);
                        }}
                        variant="standard"
                    />
                    <View hide={!customHosts || customHosts.length === 0}>
                        <HostListView
                            defaultHosts={[]}
                            hosts={customHosts ? customHosts.map(server => server.host) : []}
                            setHost={setCustomHosts}
                        />
                    </View>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setAddServer(false)}>{t('cancel')}</Button>
                <Button type="submit">{t('add')}</Button>
            </DialogActions>
        </Dialog>
    );
}
