import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import * as React from 'react';
import { useLocalStorageState } from '@web3-explorer/uikit-mui';
import { a11yProps, CustomTabPanel, OpenCvWrapper } from './UI';

import { useOpenCv } from '../lib/useOpenCv';
import QRCodeReadingImage from './demos/qr_code_reading/QRCodeReadingImage';
import { View } from '@web3-explorer/uikit-view';

function App() {
    const { loaded: ready } = useOpenCv();

    const [value, setValue] = useLocalStorageState('tabId5', 0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    if (!ready) return null;
    const tabList = [
        {
            name: 'QRCodeReadingImage',
            view: QRCodeReadingImage
        }
    ];
    return (
        <View sx={{ width: '720px' }} column>
            <View mb12 sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    variant="scrollable"
                    scrollButtons="auto"
                    value={value}
                    onChange={handleChange}
                    aria-label=""
                >
                    {tabList.map((row, index) => (
                        <Tab key={index} label={row.name} {...a11yProps(index)} />
                    ))}
                </Tabs>
            </View>
            {tabList.map((row, index) => {
                const Node = row.view;
                return (
                    <CustomTabPanel key={index} value={value} index={Number(index)}>
                        <Node />
                    </CustomTabPanel>
                );
            })}
        </View>
    );
}

export default function () {
    return (
        <OpenCvWrapper>
            <App />
        </OpenCvWrapper>
    );
}
