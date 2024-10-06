import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Box } from '@web3-explorer/uikit-v1';
import { a11yProps, CustomTabPanel, OpenCvWrapper } from './UI';
import { useLocalStorageState } from '@web3-explorer/uikit-mui';

import { useOpenCv } from '../lib/useOpenCv';
import AddingImages from './demos/arithmetic_operations/AddingImages';
import BitwiseOperations from './demos/arithmetic_operations/BitwiseOperations';
import ImageBlending from './demos/arithmetic_operations/ImageBlending';
import SubtractingImages from './demos/arithmetic_operations/SubtractingImages';

function ArithmeticOperations() {
    const { loaded: ready } = useOpenCv();
    const [value, setValue] = useLocalStorageState('tabId1', 0);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    if (!ready) return null;
    const tabList = [
        {
            name: 'AddingImages',
            view: AddingImages
        },
        {
            name: 'BitwiseOperations',
            view: BitwiseOperations
        },
        {
            name: 'ImageBlending',
            view: ImageBlending
        },
        {
            name: 'SubtractingImages',
            view: SubtractingImages
        }
    ];
    return (
        <Box style={{ width: '720px' }} column>
            <Box style={{ borderBottom: 1, borderColor: 'divider' }}>
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
        <OpenCvWrapper>
            <ArithmeticOperations />
        </OpenCvWrapper>
    );
}
