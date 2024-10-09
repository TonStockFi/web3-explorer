import { View } from '@web3-explorer/uikit-view';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { CutItemProps, DeviceOptions } from '../types';
import CutAreaService from '../../../common/CutAreaService';
import CutAreaItemView from './CutAreaItemView';

export function CutItem({
    item,
    getAreas,
    deviceOptions
}: {
    getAreas: any;
    item: CutItemProps;
    deviceOptions: DeviceOptions;
}) {
    const [imageUrl, setImageUrl] = useState('');
    useEffect(() => {
        (async () => {
            const { id, deviceId } = item;
            const service = new CutAreaService(deviceId);
            const imageUrl = await service.getImage(id);
            console.log({ imageUrl });
            setImageUrl(imageUrl);
        })();
    }, [item]);
    const { roiXYWH, id, ts, name, matchThreshold, screen, compressQuality, monitorScale } = item;
    return (
        <View mb12>
            <CutAreaItemView
                {...{
                    ts,
                    getAreas,
                    id,
                    deviceOptions,
                    matchThreshold,
                    imageUrl,
                    name,
                    roiXYWH,
                    screen,
                    compressQuality,
                    monitorScale
                }}
            />
        </View>
    );
}

export default function CutItems({
    areaList,
    getAreas,
    deviceOptions
}: {
    getAreas: any;
    areaList: CutItemProps[];
    deviceOptions: DeviceOptions;
}) {
    return (
        <View mt12>
            {areaList.map((item: CutItemProps, i: number) => {
                return (
                    <CutItem
                        getAreas={getAreas}
                        deviceOptions={deviceOptions}
                        item={item}
                        key={item.id}
                    />
                );
            })}
        </View>
    );
}
