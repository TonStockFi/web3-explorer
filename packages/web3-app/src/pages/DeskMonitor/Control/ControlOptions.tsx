import { View } from '@web3-explorer/uikit-view';
import { DeviceOptions } from '../types';
import Input from '@web3-explorer/uikit-mui/dist/mui/Input';
import FormControl from '@web3-explorer/uikit-mui/dist/mui/FormControl';
import InputLabel from '@web3-explorer/uikit-mui/dist/mui/InputLabel';

import { wsSendClientEvent } from '../../../common/ws';
import * as React from 'react';

export default function ControlOptions({ deviceOptions }: { deviceOptions: DeviceOptions }) {
    const { ws,onChangeDeviceInfo } = deviceOptions;
    return (
        <View sx={{ p: 2 }} mb12>
            <View pl12 sx={{ mb: 2 }} text={'设置'} textProps={{ variant: 'h6' }} />
            <View mb12>
                <FormControl>
                    <InputLabel htmlFor="compressQuality-input">图像压缩质量 (10 ~ 100)</InputLabel>
                    <Input
                        sx={{ ml: 2 }}
                        type={'number'}
                        onChange={e => {
                            let value = Number(e.target.value || 0);
                            if (value < 10) {
                                value = 10;
                            }
                            if (value > 100) {
                                value = 100;
                            }
                            onChangeDeviceInfo && onChangeDeviceInfo('compressQuality', value);
                            wsSendClientEvent(
                                {
                                    eventType: 'compressQuality',
                                    value
                                },
                                ws
                            );
                        }}
                        id="compressQuality"
                        value={deviceOptions.getDeviceInfo('compressQuality', 50)}
                        aria-describedby="compressQuality-helper-text"
                    />
                </FormControl>
            </View>
            <View mb12 sx={{ mt: 4 }}>
                <FormControl>
                    <InputLabel htmlFor="delaySendImageDataMs-input">
                        屏幕图像发送延时（毫秒）
                    </InputLabel>
                    <Input
                        inputProps={{ step: 50 }}
                        sx={{ ml: 2 }}
                        type={'number'}
                        onChange={e => {
                            let value = Number(e.target.value || 0);
                            if (value < 10) {
                                value = 10;
                            }
                            if (value > 10000) {
                                value = 10000;
                            }
                            onChangeDeviceInfo && onChangeDeviceInfo('delaySendImageDataMs', value);
                            wsSendClientEvent(
                                {
                                    eventType: 'delaySendImageDataMs',
                                    value
                                },
                                ws
                            );
                        }}
                        id="delaySendImageDataMs"
                        value={deviceOptions.getDeviceInfo('delaySendImageDataMs', 1000)}
                        aria-describedby="delaySendImageDataMs-helper-text"
                    />
                </FormControl>
            </View>
        </View>
    );
}
