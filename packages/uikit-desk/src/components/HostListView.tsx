import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { ListSubheader } from '@mui/material';

export default function HostListView({
    defaultHosts,
    hosts,
    setHost
}: {
    defaultHosts: string[];
    setHost: any;
    hosts: string[];
}) {
    return (
        <List
            subheader={<ListSubheader>服务器</ListSubheader>}
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
