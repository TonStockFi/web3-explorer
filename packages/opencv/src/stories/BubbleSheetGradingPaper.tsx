import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import * as React from 'react';
import { a11yProps, CustomTabPanel, OpenCvWrapper } from './UI';

import { useOpenCv } from '../lib/useOpenCv';
import BubbleSheetGradingPaper from './demos/bubble_sheet_grading_paper';
import { View } from '@web3-explorer/uikit-view';
import { useLocalStorageState } from '@web3-explorer/uikit-mui';

function App() {
    const { loaded: ready } = useOpenCv();

    const [value, setValue] = useLocalStorageState('tabId3', 0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    if (!ready) return null;
    const tabList = [
        {
            name: 'BubbleSheetGradingPaper',
            view: BubbleSheetGradingPaper
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
        <OpenCvWrapper openCvPath={'http://localhost:3100/opencv-4.10.0.js?t=2'}>
            <App />
        </OpenCvWrapper>
    );
}
