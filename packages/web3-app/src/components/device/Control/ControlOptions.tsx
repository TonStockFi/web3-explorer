import FormControl from '@web3-explorer/uikit-mui/dist/mui/FormControl';
import Input from '@web3-explorer/uikit-mui/dist/mui/Input';
import InputLabel from '@web3-explorer/uikit-mui/dist/mui/InputLabel';
import { View } from '@web3-explorer/uikit-view';

import { useTranslation } from '@web3-explorer/lib-translation';
import { wsSendClientEvent } from '../../../common/ws';

export default function ControlOptions({ deviceOptions }: { deviceOptions: any }) {
    const { ws, onChangeDeviceInfo } = deviceOptions;
    const { t } = useTranslation();
    return (
        <View sx={{ p: 2 }} mb12>
            <View pl12 sx={{ mb: 2 }} text={t('Settings')} textProps={{ variant: 'h6' }} />
            <View mb12>
                <FormControl sx={{ width: 300 }}>
                    <InputLabel htmlFor="compressQuality-input">
                        {t('ImageCompressionQuality')} (10 ~ 100)
                    </InputLabel>
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
                <FormControl sx={{ width: 300 }}>
                    <InputLabel htmlFor="delaySendImageDataMs-input">
                        {t('ScreenImageTransmissionDelay')}
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
