import List from '@web3-explorer/uikit-mui/dist/mui/List';
import ListItem from '@web3-explorer/uikit-mui/dist/mui/ListItem';
import ListItemAvatar from '@web3-explorer/uikit-mui/dist/mui/ListItemAvatar';
import ListItemButton from '@web3-explorer/uikit-mui/dist/mui/ListItemButton';
import ListItemText from '@web3-explorer/uikit-mui/dist/mui/ListItemText';

import { useEffect, useState } from 'react';
import TgUserService from '../services/TgUserService';
import AvatarView from './AvatarView';

export function TgSiteListItem({
    tgSite,
    currentSite,
    setCurrentSite
}: {
    setCurrentSite: any;
    tgSite: any;
    currentSite: any;
}) {
    const [username, setUsername] = useState('');
    useEffect(() => {
        const service = new TgUserService(tgSite.userId);
        service
            .get()
            .then(async user => {
                if (user) {
                    setUsername(user.firstName);
                }
            })
            .catch(console.error);
    }, [tgSite.userId]);
    const isSelected = currentSite && currentSite.userId === tgSite.userId;
    return (
        <ListItem
            key={tgSite.userId}
            sx={{
                bgcolor: isSelected ? 'black' : 'inherit'
            }}
            disablePadding
        >
            <ListItemButton
                onClick={() => {
                    setCurrentSite(tgSite);
                }}
            >
                <ListItemAvatar>
                    <AvatarView name={username} userId={tgSite.userId} />
                </ListItemAvatar>
                <ListItemText sx={{ color: 'text.primary' }} primary={username} />
            </ListItemButton>
        </ListItem>
    );
}

export default function TgSiteList({
    tgSites,
    currentSite,
    setCurrentSite
}: {
    tgSites: any[];
    currentSite: any;
    setCurrentSite: any;
}) {
    return (
        <List
            sx={{ height: '100%', bgcolor: 'background.paper', width: '100%' }}
            aria-label="TgSites"
        >
            {tgSites.map(tgSite => {
                return (
                    <TgSiteListItem
                        key={tgSite.userId}
                        setCurrentSite={setCurrentSite}
                        tgSite={tgSite}
                        currentSite={currentSite}
                    />
                );
            })}
        </List>
    );
}
