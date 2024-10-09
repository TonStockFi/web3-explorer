import { View } from '@web3-explorer/uikit-view';
import { DefaultCutRect } from '../global';
import * as React from 'react';
import { useEffect } from 'react';
import { OpenCvProvider, useOpenCv } from '@web3-explorer/opencv';
import { Loading } from '@web3-explorer/uikit-mui';
import { OPENCV_URL } from '../../../constant';
import { DeviceOptions } from '../types';
import InnerView from './InnerView';

function InnerViewWithCV({ deviceOptions }: { deviceOptions: DeviceOptions }) {
    const { loaded } = useOpenCv();
    useEffect(() => {
        if (loaded) {
            deviceOptions.setCutAreaRect(DefaultCutRect);
        }
    }, [loaded]);
    if (!loaded) {
        return (
            <View
                sx={{
                    height: '100%',
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <View sx={{ transform: 'translateY(-120px)' }}>
                    <Loading />
                </View>
            </View>
        );
    }
    return <InnerView deviceOptions={deviceOptions} />;
}

export default function ({ deviceOptions }: { deviceOptions: DeviceOptions }) {
    if (deviceOptions.isWebview) {
        return <InnerView deviceOptions={deviceOptions} />;
    }
    return (
        <OpenCvProvider openCvPath={OPENCV_URL}>
            <InnerViewWithCV deviceOptions={deviceOptions} />
        </OpenCvProvider>
    );
}
