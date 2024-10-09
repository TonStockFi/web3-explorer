import * as React from 'react';
import Box from '@web3-explorer/uikit-mui/dist/mui/Box';
import BottomNavigation from '@web3-explorer/uikit-mui/dist/mui/BottomNavigation';
import BottomNavigationAction from '@web3-explorer/uikit-mui/dist/mui/BottomNavigationAction';
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
