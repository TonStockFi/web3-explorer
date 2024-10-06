import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import SettingsIcon from '@mui/icons-material/Settings';
import LinkIcon from '@mui/icons-material/Link';

export default function BottomNavigationView({
    tabId,
    setTabId
}: {
    tabId: string;
    setTabId: any;
}) {
    return (
        <Box
            sx={{
                width: '100%',
                zIndex: 100000000,
                height: '54px',
                backgroundColor: 'white',
                borderTop: '1px solid #e9e9e9'
            }}
        >
            <BottomNavigation
                showLabels
                value={tabId}
                onChange={(event: any, newValue: any) => {
                    setTabId(newValue);
                }}
            >
                <BottomNavigationAction value={'link'} label="连接" icon={<LinkIcon />} />
                <BottomNavigationAction value={'setting'} label="设置" icon={<SettingsIcon />} />
            </BottomNavigation>
        </Box>
    );
}
