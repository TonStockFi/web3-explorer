import { View } from '@web3-explorer/uikit-view';
import { useTheme } from 'styled-components';
import { useDevice } from '../../providers/DevicesProvider';
import DeviceMonitor from './DeviceMonitor';
import { Devices } from './global';

export default function DeviceView() {
    const { updatedAt } = useDevice();
    const theme = useTheme();
    const devicesList = Array.from(Devices).map(row => row[1]);
    return (
        <View wh100p p12 borderBox aCenter column key={updatedAt} bgColor={theme.backgroundContent}>
            {devicesList.map(device => {
                const { deviceId } = device;
                return (
                    <View empty key={deviceId}>
                        <DeviceMonitor deviceId={deviceId} />
                    </View>
                );
            })}
        </View>
    );
}
