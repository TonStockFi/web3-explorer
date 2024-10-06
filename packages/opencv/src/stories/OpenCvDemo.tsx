import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import * as React from 'react';
import { a11yProps, CustomTabPanel, OpenCvWrapper } from './UI';

import ShapeDetectionImage from './demos/shape_detect_matching/ShapeDetectionImage';
import RegionOfInterest from './demos/region_of_interest/RegionOfInterest';
import RectDetectionImage from './demos/rectangle_detection_doc_scanner/RectDetectionImage';
import ReadAndDisplayImg from './demos/reading_writing_img_video/ReadAndDisplayImg';
import UsingTrackbars from './demos/reading_writing_img_video/UsingTrackbars';
import { useOpenCv } from '../lib/useOpenCv';
import { View } from '@web3-explorer/uikit-view';
import { useLocalStorageState } from '@web3-explorer/uikit-mui';

function OpenCvDemo() {
    const { loaded: ready } = useOpenCv();
    const [value, setValue] = useLocalStorageState('tabId6', 0);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    if (!ready) return null;
    const tabList = [
        {
            name: 'ShapeDetectionImage',
            view: ShapeDetectionImage
        },

        {
            name: 'RegionOfInterest',
            view: RegionOfInterest
        },
        {
            name: 'RectDetectionImage',
            view: RectDetectionImage
        },
        {
            name: 'ReadAndDisplayImg',
            view: ReadAndDisplayImg
        },
        {
            name: 'UsingTrackbars',
            view: UsingTrackbars
        }
    ];
    return (
        <View style={{ width: '720px' }} column>
            <View mb12 sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    sx={{ width: '720px' }}
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
            <OpenCvDemo />
        </OpenCvWrapper>
    );
}
