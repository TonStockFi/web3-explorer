import * as React from 'react';
import { Box } from '@web3-explorer/uikit-v1';
import { OpenCvProvider } from '../lib/OpenCvProvider';
import { useOpenCv } from '../lib/useOpenCv';
import { Loading } from '@web3-explorer/uikit-mui';

export interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

export function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            style={{ width: '720px' }}
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box style={{ padding: 3 }}>{children}</Box>}
        </div>
    );
}

export function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`
    };
}

export function OpenCvWrapper({
    children,
    openCvPath
}: {
    openCvPath?: string;
    children: React.ReactNode;
}) {
    return (
        <OpenCvProvider openCvPath={openCvPath || 'http://localhost:3100/opencv.js'}>
            <OpenCvInner children={children} />
        </OpenCvProvider>
    );
}

export function OpenCvInner({ children }: { children: React.ReactNode }) {
    const { loaded } = useOpenCv();
    if (!loaded) return <Loading />;
    return <>{children}</>;
}
