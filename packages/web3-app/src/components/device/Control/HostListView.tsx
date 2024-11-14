import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@web3-explorer/uikit-mui/dist/mui/IconButton';
import List from '@web3-explorer/uikit-mui/dist/mui/List';
import ListItem from '@web3-explorer/uikit-mui/dist/mui/ListItem';
import ListItemText from '@web3-explorer/uikit-mui/dist/mui/ListItemText';
import ListSubheader from '@web3-explorer/uikit-mui/dist/mui/ListSubheader';
import { useTranslation } from 'react-i18next';

export default function HostListView({
    defaultHosts,
    hosts,
    setHost
}: {
    defaultHosts: string[];
    setHost: any;
    hosts: string[];
}) {
    const { t } = useTranslation();

    return (
        <List
            subheader={<ListSubheader>{t('Server')}</ListSubheader>}
            sx={{ mt: 2, width: '100%', bgcolor: 'background.paper' }}
        >
            {hosts.map(host => (
                <ListItem
                    sx={{ pl: 1 }}
                    key={host}
                    disableGutters
                    secondaryAction={
                        defaultHosts.indexOf(host) !== -1 ? null : (
                            <IconButton
                                onClick={() => {
                                    setHost(hosts.filter(h => h !== host));
                                }}
                                aria-label="comment"
                            >
                                <DeleteIcon />
                            </IconButton>
                        )
                    }
                >
                    <ListItemText primary={host} />
                </ListItem>
            ))}
        </List>
    );
}
