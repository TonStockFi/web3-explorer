import { Box } from '@web3-explorer/uikit-v1';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import * as React from 'react';
import { useLocalStorageState } from '@web3-explorer/uikit-mui';
import { a11yProps, CustomTabPanel, OpenCvWrapper } from './UI';

import { useOpenCv } from '../lib/useOpenCv';
import ArucoMarkerDetectionImage from './demos/aruco_markers/ArucoMarkerDetectionImage';
import ArucoMarkerDetectionWebCam from './demos/aruco_markers/ArucoMarkerDetectionWebCam';

function ArucoMarker() {
    const { loaded: ready } = useOpenCv();
    const [value, setValue] = useLocalStorageState('tabId4', 0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    if (!ready) return null;
    const tabList = [
        {
            name: 'ArucoMarkerDetectionImage',
            view: ArucoMarkerDetectionImage
        },
        {
            name: 'ArucoMarkerDetectionWebCam',
            view: ArucoMarkerDetectionWebCam
        }
    ];
    return (
        <Box style={{ width: '720px' }} column>
            <Box style={{ width: '720px', borderBottom: 1, borderColor: 'divider' }}>
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
            </Box>
            {tabList.map((row, index) => {
                const Node = row.view;
                return (
                    <CustomTabPanel key={index} value={value} index={Number(index)}>
                        <Node />
                    </CustomTabPanel>
                );
            })}
        </Box>
    );
}

export default function () {
    return (
        <OpenCvWrapper openCvPath={'http://localhost:3100/opencv.js'}>
            <ArucoMarker />
        </OpenCvWrapper>
    );
}
