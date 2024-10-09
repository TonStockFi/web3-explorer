import { View } from '@web3-explorer/uikit-view';
import Monitor from './Monitor';
import { Devices } from './global';
import { useEffect, useState } from 'react';
import { DeviceInfo } from './types';
import { useActiveAccount } from '@tonkeeper/uikit/dist/state/wallet';
import {useLocalStorageState } from '@web3-explorer/uikit-mui';
import { AccountMAM } from '@tonkeeper/core/dist/entries/account';

export default function DeviceView() {
    const account = useActiveAccount() as AccountMAM;
    const {id:walletAccountId} = account
    const activeDerivationIndex = account.activeDerivationIndex

    const [customHosts, setCustomHosts] = useLocalStorageState<{host:string}[]>('customHosts,', []);
    const [isReady, setIsReady] = useState(false);
    const [updatedAt, setUpdatedAt] = useState(+new Date);
    useEffect(() => {
        if (!isReady) {
            const cachedDevices = localStorage.getItem('Devices');
            if (cachedDevices) {
                try {
                    const devicesArray: [string, DeviceInfo][] = JSON.parse(cachedDevices);
                    devicesArray.forEach(([key, deviceInfo]) => {
                        Devices.set(key, deviceInfo);
                    });
                    setIsReady(true);
                } catch (error) {
                    console.error('Error loading Devices from cache:', error);
                }
            } else {
                setIsReady(true);
            }
        }
    }, [isReady]);

    if (!isReady) return null;
    const devices = Array.from(Devices).map(row=>row[1])
    const isAdding = !devices.find(device=>device.walletAccountId === walletAccountId)
    return (
         <View wh100p center>
                {
                    devices.map((device)=>{
                        const {deviceId} = device
                        if(device.walletAccountId !== walletAccountId){
                            return null
                        }
                        return (
                            <View key={deviceId}>
                                <Monitor
                                    index={activeDerivationIndex}
                                    setGlobalUpdatedAt={setUpdatedAt}
                                    walletAccountId={walletAccountId}
                                    customHosts={customHosts}
                                    setCustomHosts={(v:{host:string}[])=>setCustomHosts(v)}
                                    defaultDeviceId={deviceId}
                                    isAdding={false}
                                />
                            </View>
                        )
                    })
                }
                {
                    Boolean(isAdding && updatedAt) && <View>
                        <Monitor
                            index={activeDerivationIndex}
                            setGlobalUpdatedAt={(v:number)=>setUpdatedAt(v)}
                            walletAccountId={walletAccountId}
                            customHosts={customHosts}
                            setCustomHosts={(v:{host:string}[])=>setCustomHosts(v)}
                            defaultDeviceId={""}
                            isAdding={true}
                        />
                    </View>
                }
            </View>
    );
}
